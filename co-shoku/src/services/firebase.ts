import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported, type Analytics } from 'firebase/analytics';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  increment,
  type Firestore,
  type DocumentData,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  type StorageReference,
  type FirebaseStorage,
} from 'firebase/storage';
import { User, Post } from '../types';
import { getSupabaseClient, getSupabaseBucket } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FirebaseRequiredKey =
  | 'EXPO_PUBLIC_FIREBASE_API_KEY'
  | 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'
  | 'EXPO_PUBLIC_FIREBASE_PROJECT_ID'
  | 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'
  | 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'
  | 'EXPO_PUBLIC_FIREBASE_APP_ID';

type FirebaseOptionalKey = 'EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID';

const requireEnv = (key: FirebaseRequiredKey): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const optionalEnv = (key: FirebaseOptionalKey): string | undefined => {
  return process.env[key];
};

// Firebase configuration is resolved from Expo public environment variables.
export const firebaseConfig = {
  apiKey: requireEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: requireEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: requireEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: requireEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: requireEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requireEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
  // 任意（未設定なら undefined のままでOK）
  measurementId: optionalEnv('EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID'),
};

let firebaseApp: FirebaseApp | null = null;
let analyticsInstance: Analytics | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let authInstance: Auth | null = null;

const USERS_COLLECTION = 'users';
const POSTS_COLLECTION = 'posts';
const HISTORY_COLLECTION = 'foodHistory';

/**
 * Initializes Firebase (once) and lazily attaches Analytics when supported.
 * For React Native (non-web) builds, Analytics is skipped automatically.
 */
export const initializeFirebase = async (): Promise<{ app: FirebaseApp; analytics: Analytics | null }> => {
  if (!firebaseApp) {
    firebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    if (!authInstance) {
      try {
        const authModule: any = await import('firebase/auth');
        if (authModule.initializeAuth && authModule.getReactNativePersistence) {
          authInstance = authModule.initializeAuth(firebaseApp, {
            persistence: authModule.getReactNativePersistence(AsyncStorage),
          });
        } else {
          authInstance = getAuth(firebaseApp);
        }
      } catch (error) {
        // initializeAuth throws if called twice. In that case fall back to getAuth.
        authInstance = getAuth(firebaseApp);
      }
    }
    firestoreInstance = getFirestore(firebaseApp);
    storageInstance = getStorage(firebaseApp);

    if (typeof window !== 'undefined') {
      try {
        const supported = await isAnalyticsSupported();
        if (supported) {
          analyticsInstance = getAnalytics(firebaseApp);
        }
      } catch (error) {
        console.warn('Firebase analytics is not available in this environment.', error);
      }
    }
  }

  return {
    app: firebaseApp,
    analytics: analyticsInstance,
  };
};

export const getFirebaseAuth = () => {
  if (!firebaseApp) {
    throw new Error('Firebase app is not initialized. Call initializeFirebase first.');
  }
  if (!authInstance) {
    authInstance = getAuth(firebaseApp);
  }
  return authInstance;
};

export const getFirebaseFirestore = () => {
  if (!firestoreInstance) {
    throw new Error('Firestore is not initialized.');
  }
  return firestoreInstance;
};

export const getFirebaseStorage = () => {
  if (!storageInstance) {
    throw new Error('Storage is not initialized.');
  }
  return storageInstance;
};

const mapFirebaseUserToAppUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  const db = getFirebaseFirestore();
  const userDocRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
  const snapshot = await getDoc(userDocRef);

  if (snapshot.exists()) {
    const data = snapshot.data();
    return {
      id: firebaseUser.uid,
      nickname: data.nickname,
      email: firebaseUser.email ?? '',
      miracleMatchPoints: data.miracleMatchPoints ?? 0,
      createdAt: data.createdAt ?? new Date().toISOString(),
    };
  }

  // In case the user document is missing, create a basic one.
  const fallbackUser: User = {
    id: firebaseUser.uid,
    nickname: firebaseUser.displayName ?? 'ユーザー',
    email: firebaseUser.email ?? '',
    miracleMatchPoints: 0,
    createdAt: firebaseUser.metadata.creationTime ?? new Date().toISOString(),
  };
  await setDoc(userDocRef, {
    nickname: fallbackUser.nickname,
    email: fallbackUser.email,
    miracleMatchPoints: fallbackUser.miracleMatchPoints,
    createdAt: fallbackUser.createdAt,
  });
  return fallbackUser;
};

export const listenToAuthChanges = (callback: (user: User | null) => void) => {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      callback(null);
      return;
    }
    const user = await mapFirebaseUserToAppUser(firebaseUser);
    callback(user);
  });
};

export const registerWithFirebase = async (email: string, password: string, nickname: string): Promise<User> => {
  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: nickname });
  }

  const userData: User = {
    id: credential.user.uid,
    nickname,
    email,
    miracleMatchPoints: 0,
    createdAt: new Date().toISOString(),
  };

  const db = getFirebaseFirestore();
  await setDoc(doc(db, USERS_COLLECTION, credential.user.uid), {
    nickname,
    email,
    miracleMatchPoints: 0,
    createdAt: userData.createdAt,
  });

  return userData;
};

export const loginWithFirebase = async (email: string, password: string): Promise<User> => {
  const auth = getFirebaseAuth();
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return mapFirebaseUserToAppUser(credential.user);
};

export const logoutFromFirebase = async () => {
  const auth = getFirebaseAuth();
  await signOut(auth);
};

const uriToBlob = async (uri: string): Promise<Blob> => {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
};

const fetchImageAsUint8Array = async (uri: string): Promise<Uint8Array> => {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

const generateImageRef = (storage: FirebaseStorage, userId: string): StorageReference => {
  const fileName = `posts/${userId}/${Date.now()}.jpg`;
  return ref(storage, fileName);
};

export const uploadImageToStorage = async (uri: string, userId: string): Promise<string> => {
  try {
    const supabase = getSupabaseClient();
    const bucket = getSupabaseBucket();
    const supabasePath = `posts/${userId}/${Date.now()}.jpg`;
    const fileBytes = await fetchImageAsUint8Array(uri);
    const { error } = await supabase.storage.from(bucket).upload(supabasePath, fileBytes, {
      contentType: 'image/jpeg',
      upsert: false,
    });
    if (error) {
      throw error;
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(supabasePath);
    if (!data?.publicUrl) {
      throw new Error('Failed to obtain Supabase public URL');
    }
    return data.publicUrl;
  } catch (supabaseError) {
    console.warn('Supabase Storage upload failed. Falling back to Firebase Storage.', supabaseError);
  }

  try {
    const storage = getFirebaseStorage();
    const storageRef = generateImageRef(storage, userId);
    const blob = await uriToBlob(uri);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  } catch (firebaseError) {
    console.warn('Firebase Storage fallback upload failed. Returning local URI.', firebaseError);
    return uri;
  }
};

type PostDocument = {
  userId: string;
  imageUrl?: string;
  category: string;
  parentCategory: string;
  postedAt: string;
  expiresAt: string;
};

export const createPostDocument = async (post: PostDocument) => {
  const db = getFirebaseFirestore();
  const docRef = doc(collection(db, POSTS_COLLECTION));
  await setDoc(docRef, {
    ...post,
    createdAt: serverTimestamp(),
  });
  await setDoc(doc(collection(db, HISTORY_COLLECTION)), {
    userId: post.userId,
    category: post.category,
    parentCategory: post.parentCategory,
    postedAt: post.postedAt,
  });
};

export const getTimelineDocuments = async (category: string): Promise<Post[]> => {
  const db = getFirebaseFirestore();
  const q = query(
    collection(db, POSTS_COLLECTION),
    where('category', '==', category),
    where('expiresAt', '>', new Date().toISOString()),
    orderBy('expiresAt', 'desc'),
    limit(50)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as DocumentData;
    return {
      id: docSnap.id,
      userId: data.userId,
      imageUri: data.imageUrl,
      category: data.category,
      parentCategory: data.parentCategory,
      postedAt: data.postedAt,
      expiresAt: data.expiresAt,
    } satisfies Post;
  });
};

export const getFoodHistoryForUser = async (userId: string) => {
  const db = getFirebaseFirestore();
  const q = query(
    collection(db, HISTORY_COLLECTION),
    where('userId', '==', userId),
    orderBy('postedAt', 'desc'),
    limit(120)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: data.userId,
      category: data.category,
      parentCategory: data.parentCategory,
      postedAt: data.postedAt,
    };
  });
};

export const incrementUserMiraclePoints = async (userId: string, amount = 1) => {
  const db = getFirebaseFirestore();
  await setDoc(
    doc(db, USERS_COLLECTION, userId),
    {
      miracleMatchPoints: increment(amount),
    },
    { merge: true }
  );
};
