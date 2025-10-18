import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  const { posts, availableChildCategories } = useAppContext();
  const [waiting, setWaiting] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const matchRef = useRef<NodeJS.Timeout | null>(null);

  const activePost = useMemo(() => findLatestActivePost(posts), [posts]);
  const currentCategory = activePost?.category;

  useEffect(() => {
    if (!currentCategory) {
      Alert.alert('投稿が必要です', '一食トークを利用するには直近の投稿が必要です。', [
        { text: '戻る', onPress: () => navigation.goBack() },
      ]);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      setWaiting(false);
      setTimedOut(true);
    }, 60 * 1000);

    matchRef.current = setTimeout(() => {
      const shouldMiracle = Math.random() < 0.4;
      const partnerCategory = shouldMiracle
        ? currentCategory
        : availableChildCategories[Math.floor(Math.random() * availableChildCategories.length)];
      navigation.replace('CallSession', {
        partnerCategory,
        miracleMatch: partnerCategory === currentCategory,
      });
    }, 3000 + Math.random() * 4000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (matchRef.current) {
        clearTimeout(matchRef.current);
        matchRef.current = null;
      }
    };
  }, [availableChildCategories, currentCategory, navigation]);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>一食トーク</Text>
        <Text style={styles.subtitle}>
          匿名でマッチングします。投稿カテゴリ: {currentCategory ?? '未設定'}
        </Text>

        {waiting && !timedOut ? (
          <View style={styles.waiting}>
            <ActivityIndicator size="large" color="#FF7F50" />
            <Text style={styles.waitingText}>お相手を探しています...</Text>
          </View>
        ) : timedOut ? (
          <View style={styles.waiting}>
            <Text style={styles.waitingText}>1分以内にマッチしませんでした。</Text>
            <SecondaryButton title="もう一度探す" onPress={() => navigation.replace('CallWaiting')} />
          </View>
        ) : null}

        <PrimaryButton title="キャンセル" onPress={() => navigation.goBack()} />
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
