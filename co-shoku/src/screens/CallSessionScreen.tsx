import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppContext } from '../context/AppContext';
import { MainStackParamList } from '../navigation/AppNavigator';
import { Post } from '../types';

type Props = NativeStackScreenProps<MainStackParamList, 'CallSession'>;

const findActivePost = (posts: Post[]): Post | undefined =>
  posts.find((post) => new Date(post.expiresAt).getTime() > Date.now());

export const CallSessionScreen = ({ route, navigation }: Props) => {
  const { partnerCategory } = route.params;
  const { posts } = useAppContext();

  const activePost = useMemo(() => findActivePost(posts), [posts]);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>一食トーク中</Text>
        <Text style={styles.subtitle}>投稿カテゴリ: {activePost?.category ?? '未設定'}</Text>
        <Text style={styles.subtitle}>相手の投稿カテゴリ: {partnerCategory}</Text>

        <View style={styles.videoContainer}>
          <View style={styles.videoBox}>
            <Text style={styles.videoLabel}>あなた</Text>
          </View>
          <View style={styles.videoBox}>
            <Text style={styles.videoLabel}>お相手</Text>
          </View>
        </View>

        <Text style={styles.notice}>音声は常時ミュートです。チャットは自動メッセージのみ送信されます。</Text>

        <PrimaryButton title="通話を終了する" onPress={() => navigation.navigate('Home')} />
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
    marginTop: 6,
  },
  videoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  videoBox: {
    flex: 1,
    height: 220,
    borderRadius: 16,
    backgroundColor: '#222',
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  notice: {
    marginTop: 24,
    fontSize: 12,
    color: '#777',
  },
});
