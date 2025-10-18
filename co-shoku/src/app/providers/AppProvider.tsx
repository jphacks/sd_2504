import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { FOOD_CATEGORIES, getParentCategory } from '../../constants/categories';
import { REPORT_REASONS } from '../../constants/reportReasons';
import { CallMatch, FoodHistory, Post, Report, User } from '../../types';
import {
  addHours,
  getNextResetTimestampJst,
  minutesUntil,
  now,
  shouldResetDailyCount,
  toIsoString,
  withinLastDays,
} from '../../utils/time';
import {
  initializeFirebase,
  listenToAuthChanges,
  registerWithFirebase,
  loginWithFirebase,
  logoutFromFirebase,
  uploadImageToStorage,
  createPostDocument,
  getTimelineDocuments,
  getFoodHistoryForUser,
  incrementUserMiraclePoints,
} from '../../services/firebase';

type Credentials = {
  email: string;
  password: string;
};

type RegistrationPayload = Credentials & {
  nickname: string;
};

type CreatePostPayload = {
  imageUri?: string;
  category: string;
};

type ReportPayload = {
  reportedUserId?: string;
  reason?: string;
};

type AppContextValue = {
  isLoading: boolean;
  user: User | null;
  register: (payload: RegistrationPayload) => Promise<void>;
  login: (payload: Credentials) => Promise<void>;
  logout: () => void;
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
  canPostToday: boolean;
  dailyPostCount: number;
  maxDailyPosts: number;
  createPost: (payload: CreatePostPayload) => Promise<Post>;
  unlockUntil: string | null;
  isUnlockActive: boolean;
  minutesUntilLockout: number;
  posts: Post[];
  getTimelineForCategory: (category: string) => Post[];
  refreshTimeline: (category: string) => Promise<void>;
  foodHistory: FoodHistory[];
  myRecentCategories: string[];
  miracleMatchPoints: number;
  addMiracleMatchPoint: () => Promise<void>;
  reports: Report[];
  submitReport: (payload: ReportPayload) => void;
  hasPostedOnce: boolean;
  availableChildCategories: string[];
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const computeDailyPostCount = (history: FoodHistory[]): number => {
  const reference = now();
  const nextResetMillis = getNextResetTimestampJst(reference);
  const lastResetMillis = nextResetMillis - 24 * 60 * 60 * 1000;
  return history.filter((entry) => new Date(entry.postedAt).getTime() >= lastResetMillis).length;
};

const mergePosts = (existing: Post[], incoming: Post[]): Post[] => {
  const map = new Map<string, Post>();
  [...existing, ...incoming].forEach((post) => {
    map.set(post.id, post);
  });
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
  );
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [foodHistory, setFoodHistory] = useState<FoodHistory[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [dailyPostCount, setDailyPostCount] = useState(0);
  const [nextResetAt, setNextResetAt] = useState<string | null>(null);
  const [unlockUntil, setUnlockUntil] = useState<string | null>(null);
  const [hasPostedOnce, setHasPostedOnce] = useState(false);
  const [miracleMatchPoints, setMiracleMatchPoints] = useState(0);
  const maxDailyPosts = 3;
  const isFirstAuthEventHandled = useRef(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    let mounted = true;

    (async () => {
      try {
        await initializeFirebase();
        unsubscribe = listenToAuthChanges(async (firebaseUser) => {
          if (!mounted) {
            return;
          }
          isFirstAuthEventHandled.current = true;
          if (!firebaseUser) {
            setUser(null);
            setFoodHistory([]);
            setPosts([]);
            setDailyPostCount(0);
            setNextResetAt(null);
            setUnlockUntil(null);
            setHasPostedOnce(false);
            setMiracleMatchPoints(0);
            setIsLoading(false);
            return;
          }

          setUser(firebaseUser);
          setMiracleMatchPoints(firebaseUser.miracleMatchPoints ?? 0);

          try {
            const history = await getFoodHistoryForUser(firebaseUser.id);
            setFoodHistory(history);
            setHasPostedOnce(history.length > 0);
            setDailyPostCount(computeDailyPostCount(history));
            setNextResetAt(toIsoString(new Date(getNextResetTimestampJst())));
          } catch (historyError) {
            console.warn('Failed to load food history', historyError);
          }

          setIsLoading(false);
        });
      } catch (error) {
        console.error('Failed to initialize Firebase', error);
        setIsLoading(false);
      } finally {
        if (!isFirstAuthEventHandled.current) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Purge expired posts periodically to keep timeline clean.
  useEffect(() => {
    const interval = setInterval(() => {
      setPosts((prev) => prev.filter((post) => new Date(post.expiresAt).getTime() > Date.now()));
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const register = useCallback(
    async ({ nickname, email, password }: RegistrationPayload) => {
      setIsLoading(true);
      try {
        await initializeFirebase();
        const newUser = await registerWithFirebase(email, password, nickname);
        setUser(newUser);
        setMiracleMatchPoints(newUser.miracleMatchPoints ?? 0);
        setHasCompletedOnboarding(false);
        setFoodHistory([]);
        setHasPostedOnce(false);
        setDailyPostCount(0);
        setNextResetAt(toIsoString(new Date(getNextResetTimestampJst())));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const login = useCallback(
    async ({ email, password }: Credentials) => {
      setIsLoading(true);
      try {
        await initializeFirebase();
        const loggedInUser = await loginWithFirebase(email, password);
        setUser(loggedInUser);
        setMiracleMatchPoints(loggedInUser.miracleMatchPoints ?? 0);
        const history = await getFoodHistoryForUser(loggedInUser.id);
        setFoodHistory(history);
        setHasPostedOnce(history.length > 0);
        setDailyPostCount(computeDailyPostCount(history));
        setNextResetAt(toIsoString(new Date(getNextResetTimestampJst())));
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    logoutFromFirebase().catch((error) => {
      console.warn('Failed to sign out', error);
    });
    setUser(null);
    setUnlockUntil(null);
    setHasPostedOnce(false);
    setMiracleMatchPoints(0);
    setFoodHistory([]);
    setPosts([]);
    setDailyPostCount(0);
    setNextResetAt(null);
  }, []);

  const completeOnboarding = useCallback(() => {
    setHasCompletedOnboarding(true);
  }, []);

  const canPostToday = useMemo(() => {
    if (shouldResetDailyCount(nextResetAt)) {
      return true;
    }
    return dailyPostCount < maxDailyPosts;
  }, [dailyPostCount, maxDailyPosts, nextResetAt]);

  const createPost = useCallback(
    async ({ category, imageUri }: CreatePostPayload) => {
      if (!user) {
        throw new Error('投稿にはログインが必要です。');
      }
      const timestamp = now();
      const requiresReset = shouldResetDailyCount(nextResetAt, timestamp);
      const effectiveCount = requiresReset ? 0 : dailyPostCount;
      if (effectiveCount >= maxDailyPosts) {
        throw new Error('本日の投稿上限に達しました（1日3回まで）。');
      }

      const postedAt = toIsoString(timestamp);
      const expiresAt = toIsoString(addHours(timestamp, 1));
      const parentCategory = getParentCategory(category);

      let remoteImageUrl = imageUri;
      if (imageUri) {
        remoteImageUrl = await uploadImageToStorage(imageUri, user.id);
      }

      const post: Post = {
        id: `post-${Date.now()}`,
        userId: user.id,
        imageUri: remoteImageUrl,
        category,
        parentCategory,
        postedAt,
        expiresAt,
      };

      const historyEntry: FoodHistory = {
        id: `history-${Date.now()}`,
        userId: user.id,
        category,
        parentCategory,
        postedAt,
      };

      await createPostDocument({
        userId: user.id,
        imageUrl: remoteImageUrl,
        category,
        parentCategory,
        postedAt,
        expiresAt,
      });

      setPosts((prev) => mergePosts(prev, [post]));
      setFoodHistory((prev) => [historyEntry, ...prev]);
      const nextCount = effectiveCount + 1;
      setDailyPostCount(nextCount);

      if (!nextResetAt || requiresReset) {
        setNextResetAt(toIsoString(new Date(getNextResetTimestampJst(timestamp))));
      }

      setUnlockUntil(expiresAt);
      setHasPostedOnce(true);
      return post;
    },
    [dailyPostCount, maxDailyPosts, nextResetAt, user]
  );

  const getTimelineForCategory = useCallback(
    (category: string) => {
      const nowMillis = Date.now();
      return posts
        .filter((post) => post.category === category && new Date(post.expiresAt).getTime() > nowMillis)
        .sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    },
    [posts]
  );

  const refreshTimeline = useCallback(async (category: string) => {
    try {
      const remotePosts = await getTimelineDocuments(category);
      setPosts((prev) => mergePosts(prev.filter((post) => post.category !== category), remotePosts));
    } catch (error) {
      console.warn('Failed to refresh timeline', error);
    }
  }, []);

  const addMiracleMatchPoint = useCallback(async () => {
    if (!user) {
      return;
    }
    setMiracleMatchPoints((prev) => prev + 1);
    setUser((prev) => {
      if (!prev) {
        return prev;
      }
      return {
        ...prev,
        miracleMatchPoints: prev.miracleMatchPoints + 1,
      };
    });
    try {
      await incrementUserMiraclePoints(user.id, 1);
    } catch (error) {
      console.warn('Failed to persist miracle match point', error);
    }
  }, [user]);

  const submitReport = useCallback(
    ({ reportedUserId, reason }: ReportPayload) => {
      if (!user) {
        Alert.alert('ログインが必要です', '通報するにはログインしてください。');
        return;
      }
      if (reason && !REPORT_REASONS.includes(reason)) {
        Alert.alert('通報理由を確認してください');
        return;
      }
      const report: Report = {
        id: `report-${Date.now()}`,
        reporterId: user.id,
        reportedUserId,
        reason,
        createdAt: toIsoString(now()),
      };
      setReports((prev) => [report, ...prev]);
      Alert.alert('通報を送信しました', 'ご協力ありがとうございます。');
    },
    [user]
  );

  const recentHistory = useMemo(() => foodHistory.filter((entry) => withinLastDays(entry.postedAt, 30)), [foodHistory]);

  const myRecentCategories = useMemo(() => recentHistory.map((entry) => entry.category), [recentHistory]);

  const isUnlockActive = useMemo(() => {
    if (!unlockUntil) {
      return false;
    }
    return new Date(unlockUntil).getTime() > Date.now();
  }, [unlockUntil]);

  const minutesUntilLockout = useMemo(() => minutesUntil(unlockUntil), [unlockUntil]);

  const availableChildCategories = useMemo(
    () => FOOD_CATEGORIES.flatMap((category) => category.children),
    []
  );

  const value: AppContextValue = {
    isLoading,
    user,
    register,
    login,
    logout,
    hasCompletedOnboarding,
    completeOnboarding,
    canPostToday,
    dailyPostCount,
    maxDailyPosts,
    createPost,
    unlockUntil,
    isUnlockActive,
    minutesUntilLockout,
    posts,
    getTimelineForCategory,
    refreshTimeline,
    foodHistory: recentHistory,
    myRecentCategories,
    miracleMatchPoints,
    addMiracleMatchPoint,
    reports,
    submitReport,
    hasPostedOnce,
    availableChildCategories,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextValue => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
