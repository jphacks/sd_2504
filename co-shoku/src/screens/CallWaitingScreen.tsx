import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SecondaryButton } from '../components/SecondaryButton';
import { useAppContext } from '../context/AppContext';
import { MainStackParamList } from '../navigation/AppNavigator';
import { Post } from '../types';

type Props = NativeStackScreenProps<MainStackParamList, 'CallWaiting'>;

const findLatestActivePost = (posts: Post[]): Post | undefined =>
  posts.find((post) => new Date(post.expiresAt).getTime() > Date.now());

export const CallWaitingScreen = ({ navigation }: Props) => {
  const { posts, startMatchmaking, listenForMatch, cancelMatchmaking } = useAppContext();
  const [status, setStatus] = useState('waiting'); // waiting, matched, timed_out

  const activePost = useMemo(() => findLatestActivePost(posts), [posts]);
  const currentCategory = activePost?.category;

  useEffect(() => {
    if (!currentCategory) {
      Alert.alert('投稿が必要です', '一食トークを利用するには直近の投稿が必要です。', [
        { text: '戻る', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    startMatchmaking(currentCategory).catch((err) => {
      console.error('Failed to start matchmaking', err);
      Alert.alert('エラー', 'マッチングを開始できませんでした。');
      navigation.goBack();
    });

    const unsubscribe = listenForMatch(async (newStatus, matchData) => {
      setStatus(newStatus);
      if (newStatus === 'matched' && matchData) {
        const partnerCategory = matchData.participants.find(p => p.category !== currentCategory)?.category ?? currentCategory;
        navigation.replace('CallSession', {
          partnerCategory,
          miracleMatch: matchData.isMiracleMatch,
        });
      }
    });

    return () => {
      unsubscribe();
      // Only cancel if the user is still in the waiting pool
      if (status === 'waiting') {
        cancelMatchmaking().catch(err => console.warn('Failed to cancel matchmaking', err));
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCategory]);

  const handleCancel = () => {
    navigation.goBack();
  };

  const handleRetry = () => {
    setStatus('waiting');
    if (currentCategory) {
      startMatchmaking(currentCategory).catch((err) => {
        console.error('Failed to restart matchmaking', err);
        Alert.alert('エラー', 'マッチングを再開できませんでした。');
        navigation.goBack();
      });
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>一食トーク</Text>
        <Text style={styles.subtitle}>
          匿名でマッチングします。投稿カテゴリ: {currentCategory ?? '未設定'}
        </Text>

        {status === 'waiting' && (
          <View style={styles.waiting}>
            <ActivityIndicator size="large" color="#FF7F50" />
            <Text style={styles.waitingText}>お相手を探しています...</Text>
          </View>
        )}

        {status === 'timed_out' && (
          <View style={styles.waiting}>
            <Text style={styles.waitingText}>マッチングしませんでした。</Text>
            <SecondaryButton title="もう一度探す" onPress={handleRetry} />
          </View>
        )}

        <PrimaryButton title="キャンセル" onPress={handleCancel} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    marginBottom: 24,
  },
  waiting: {
    alignItems: 'center',
    marginBottom: 24,
  },
  waitingText: {
    marginTop: 16,
    color: '#555',
  },
});
