import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SecondaryButton } from '../components/SecondaryButton';
import { useAppContext } from '../context/AppContext';
import { MainStackParamList } from '../navigation/AppNavigator';
import { Post } from '../types';

type Props = NativeStackScreenProps<MainStackParamList, 'Home'>;

const getActivePost = (posts: Post[]): Post | undefined =>
  posts.find((post) => new Date(post.expiresAt).getTime() > Date.now());

export const HomeScreen = ({ navigation }: Props) => {
  const {
    user,
    logout,
    canPostToday,
    dailyPostCount,
    maxDailyPosts,
    isDailyPostLimitEnabled,
    isUnlockActive,
    minutesUntilLockout,
    unlockUntil,
    posts,
    hasPostedOnce,
  } = useAppContext();

  const calculateRemainingMinutes = (timestamp?: string | null) => {
    if (!timestamp) {
      return 0;
    }
    const diff = new Date(timestamp).getTime() - Date.now();
    return diff > 0 ? Math.ceil(diff / (60 * 1000)) : 0;
  };

  const [remainingMinutes, setRemainingMinutes] = useState(() => calculateRemainingMinutes(unlockUntil));

  useEffect(() => {
    setRemainingMinutes(calculateRemainingMinutes(unlockUntil));
    if (!unlockUntil) {
      return;
    }
    const interval = setInterval(() => {
      setRemainingMinutes(calculateRemainingMinutes(unlockUntil));
    }, 30 * 1000);
    return () => clearInterval(interval);
  }, [unlockUntil]);

  const activePost = useMemo(() => getActivePost(posts), [posts]);
  const currentCategory = activePost?.category;
  const postCountLabel = isDailyPostLimitEnabled
    ? `${dailyPostCount} / ${maxDailyPosts}`
    : `${dailyPostCount}（制限なし）`;

  const handleNavigateTimeline = () => {
    if (!currentCategory) {
      Alert.alert('タイムラインを閲覧できません', '投稿中のカテゴリがありません。投稿すると解放されます。');
      return;
    }
    navigation.navigate('Timeline', { category: currentCategory });
  };

  const handleNavigateDiningRoom = () => {
    if (!isUnlockActive) {
      Alert.alert('利用できません', '写真を投稿すると1時間限定で利用できます。');
      return;
    }
    navigation.navigate('DiningRoom');
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>こんにちは、{user?.nickname ?? 'ゲスト'}さん</Text>
          <Text style={styles.sub}>今日の投稿数: {postCountLabel}</Text>
        </View>
        <SecondaryButton title="ログアウト" onPress={logout} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>写真を投稿</Text>
        <Text style={styles.cardText}>
          {isDailyPostLimitEnabled
            ? `料理写真を1日${maxDailyPosts}回まで投稿できます。投稿すると1時間限定で各機能が解放されます。`
            : '料理写真を投稿しましょう。投稿すると1時間限定で各機能が解放されます。'}
        </Text>
        <PrimaryButton
          title={canPostToday ? '投稿する' : '本日の投稿は完了'}
          onPress={() => navigation.navigate('PostCapture')}
          disabled={!canPostToday}
        />
        {isDailyPostLimitEnabled && !canPostToday && (
          <Text style={styles.notice}>リセットは毎日午前2時（JST）です。</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>解放される機能</Text>
        {isUnlockActive ? (
          <Text style={styles.unlockInfo}>
            投稿カテゴリ: {currentCategory ?? '未設定'} ／ 残り時間: {remainingMinutes || minutesUntilLockout}分
          </Text>
        ) : (
          <Text style={styles.lockedInfo}>
            写真を投稿すると1時間限定でタイムラインとオンラインルームを利用できます。
          </Text>
        )}

        <PrimaryButton title="みんなの一皿を見る" onPress={handleNavigateTimeline} disabled={!isUnlockActive} />
        <PrimaryButton title="わいわい食堂へ行く" onPress={handleNavigateDiningRoom} disabled={!isUnlockActive} />
      </View>

      <View style={styles.section}>
        <PrimaryButton title="マイページ" onPress={() => navigation.navigate('MyPage')} />
        {!hasPostedOnce && (
          <Text style={styles.noticeSmall}>まずは写真を投稿してみましょう！</Text>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  sub: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
  },
  notice: {
    marginTop: 8,
    fontSize: 12,
    color: '#777',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  unlockInfo: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  lockedInfo: {
    fontSize: 14,
    color: '#777',
    marginBottom: 12,
  },
  noticeSmall: {
    fontSize: 12,
    color: '#777',
    marginTop: 8,
  },
});
