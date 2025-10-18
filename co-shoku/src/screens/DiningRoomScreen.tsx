import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SecondaryButton } from '../components/SecondaryButton';
import { useAppContext } from '../context/AppContext';
import { MainStackParamList } from '../navigation/AppNavigator';
import { Post } from '../types';
import { getBizmeeRoomUrl, hasBizmeeRoomsConfigured } from '../utils/bizmeeRooms';
import { getSuggestionForCategory } from '../constants/categorySuggestions';

type Props = NativeStackScreenProps<MainStackParamList, 'DiningRoom'>;

const findActivePost = (posts: Post[]): Post | undefined => {
  const now = Date.now();
  return posts.find((post) => new Date(post.expiresAt).getTime() > now);
};

export const DiningRoomScreen = ({ navigation }: Props) => {
  const { user, posts, isUnlockActive, minutesUntilLockout } = useAppContext();
  const [entered, setEntered] = useState(false);

  const activePost = useMemo(() => findActivePost(posts), [posts]);
  const activeCategory = activePost?.category;
  const bizmeeUrl = useMemo(() => getBizmeeRoomUrl(activeCategory), [activeCategory]);
  const suggestionText = useMemo(() => getSuggestionForCategory(activeCategory), [activeCategory]);

  const handleJoinBizmee = async () => {
    if (!isUnlockActive) {
      Alert.alert('投稿が必要です', '写真を投稿すると1時間だけルームに参加できます。');
      return;
    }
    if (!activeCategory) {
      Alert.alert('投稿カテゴリがありません', '直近の投稿が見つかりません。写真を投稿してからお試しください。');
      return;
    }
    if (!bizmeeUrl) {
      Alert.alert('ルームが未設定です', `${activeCategory} の BizMee ルーム URL が設定されていません。運営にお問い合わせください。`);
      return;
    }
    const supported = await Linking.canOpenURL(bizmeeUrl);
    if (!supported) {
      Alert.alert('リンクを開けませんでした', 'ブラウザのURL欄にコピーしてアクセスしてください。');
      return;
    }
    await Linking.openURL(bizmeeUrl);
  };

  const remainingText = isUnlockActive
    ? `残り ${minutesUntilLockout} 分ご利用いただけます。`
    : '写真を投稿すると1時間ご利用いただけます。';

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>オンライン食事ルーム</Text>
        <Text style={styles.subtitle}>
          BizMee を使って同じ料理カテゴリの仲間と気軽におしゃべりしましょう。ブラウザだけで参加できます。
        </Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusText}>
            {entered ? `こんにちは、${user?.nickname ?? 'ゲスト'}さん` : '接続準備中…'}
          </Text>
          <Text style={styles.statusSub}>{remainingText}</Text>
          {activeCategory && <Text style={styles.statusHighlight}>直近の投稿カテゴリ：{activeCategory}</Text>}
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>参加方法</Text>
          <Text style={styles.instructionsText}>1. 写真を投稿してロックを解除します（1時間有効）。</Text>
          <Text style={styles.instructionsText}>2. 下のボタンを押すと BizMee の専用ルームが開きます。</Text>
          <Text style={styles.instructionsText}>3. 名前を入力するだけで参加できます（アカウント不要）。</Text>
        </View>

        {!hasBizmeeRoomsConfigured() && (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeLabel}>ルーム設定が必要です</Text>
            <Text style={styles.noticeSub}>
              環境変数 `EXPO_PUBLIC_BIZMEE_ROOMS` に子カテゴリごとの URL を設定すると参加ボタンが有効になります。
            </Text>
          </View>
        )}

        <View style={styles.suggestionBox}>
          <Text style={styles.suggestionTitle}>他の人と話したいときは</Text>
          <Text style={styles.suggestionText}>{suggestionText}</Text>
        </View>

        <PrimaryButton
          title={
            isUnlockActive
              ? BizmeeButtonLabel(activeCategory, bizmeeUrl)
              : '写真投稿でルームを解放'
          }
          onPress={handleJoinBizmee}
          disabled={!isUnlockActive}
        />

        {bizmeeUrl && (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeLabel}>参加リンク</Text>
            <Text style={styles.noticeLink}>{bizmeeUrl}</Text>
            <Text style={styles.noticeSub}>開けない場合はリンクをコピーしてブラウザへ貼り付けてください。</Text>
          </View>
        )}

        <View style={styles.footer}>
          <SecondaryButton title="ホームに戻る" onPress={() => navigation.goBack()} />
          <Text style={styles.footerText}>利用時間は投稿から1時間までです。</Text>
        </View>
      </View>
    </ScreenContainer>
  );
};

const BizmeeButtonLabel = (category?: string, url?: string) => {
  if (!category) {
    return '投稿カテゴリが未確認です';
  }
  if (!url) {
    return `${category} のルームが未設定`;
  }
  return `${category}のルームに参加する`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: '#FFEAE0',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusSub: {
    fontSize: 12,
    color: '#444',
    lineHeight: 18,
  },
  statusHighlight: {
    fontSize: 14,
    color: '#FF7F50',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructions: {
    backgroundColor: '#FFF2EB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 6,
  },
  noticeBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
    marginTop: 16,
  },
  noticeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF7F50',
    marginBottom: 6,
  },
  noticeLink: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
  },
  noticeSub: {
    fontSize: 12,
    color: '#777',
  },
  suggestionBox: {
    backgroundColor: '#F6F8FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3F51B5',
    marginBottom: 6,
  },
  suggestionText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#777',
    marginTop: 8,
  },
});
