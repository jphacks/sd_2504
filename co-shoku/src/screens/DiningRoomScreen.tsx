import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Switch, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { SecondaryButton } from '../components/SecondaryButton';
import { useAppContext } from '../context/AppContext';
import { DINING_ROOM_TRACKS } from '../constants/bgm';
import { MainStackParamList } from '../navigation/AppNavigator';
import { Post } from '../types';

const findActivePost = (posts: Post[]): Post | undefined =>
  posts.find((post) => new Date(post.expiresAt).getTime() > Date.now());

type Props = NativeStackScreenProps<MainStackParamList, 'DiningRoom'>;

export const DiningRoomScreen = ({ navigation }: Props) => {
  const { posts } = useAppContext();
  const [cameraOn, setCameraOn] = useState(true);
  const [entered, setEntered] = useState(false);
  const [trackId, setTrackId] = useState<string>();

  const activePost = useMemo(() => findActivePost(posts), [posts]);

  useEffect(() => {
    setEntered(true);
    const randomTrack = DINING_ROOM_TRACKS[Math.floor(Math.random() * DINING_ROOM_TRACKS.length)];
    setTrackId(randomTrack.id);
    return () => setEntered(false);
  }, []);

  const trackTitle = useMemo(() => {
    return DINING_ROOM_TRACKS.find((track) => track.id === trackId)?.title ?? 'BGM 選択中';
  }, [trackId]);

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>オンライン食事ルーム</Text>
        <Text style={styles.subtitle}>BGM を聴きながら食事を楽しみましょう。</Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusText}>{entered ? 'いただきます（自動送信）' : '接続中...'}</Text>
          <Text style={styles.statusSub}>退室時には「ごちそうさま」が自動送信されます。</Text>
        </View>

        <View style={styles.bgmCard}>
          <Text style={styles.sectionTitle}>再生中のBGM</Text>
          <Text style={styles.bgmTitle}>{trackTitle}</Text>
          <Text style={styles.bgmSub}>楽曲はランダムで選択されます。</Text>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>カメラ</Text>
          <Switch value={cameraOn} onValueChange={setCameraOn} thumbColor={cameraOn ? '#FF7F50' : '#ccc'} />
        </View>

        {!cameraOn && activePost?.imageUri && (
          <View style={styles.preview}>
            <Text style={styles.previewLabel}>カメラOFF時は投稿写真を表示</Text>
            <Image source={{ uri: activePost.imageUri }} style={styles.previewImage} />
          </View>
        )}

        <View style={styles.footer}>
          <SecondaryButton title="退室する" onPress={() => navigation.goBack()} />
          <Text style={styles.notice}>利用時間は投稿から1時間までです。</Text>
        </View>
      </View>
    </ScreenContainer>
  );
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
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusSub: {
    marginTop: 6,
    fontSize: 12,
    color: '#444',
  },
  bgmCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  bgmTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF7F50',
  },
  bgmSub: {
    fontSize: 12,
    color: '#555',
    marginTop: 6,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  preview: {
    marginTop: 12,
  },
  previewLabel: {
    fontSize: 12,
    color: '#555',
    marginBottom: 8,
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  notice: {
    fontSize: 12,
    color: '#777',
    marginTop: 8,
  },
});
