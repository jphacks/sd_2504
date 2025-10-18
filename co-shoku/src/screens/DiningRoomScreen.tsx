import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SecondaryButton } from '../components/SecondaryButton';
import { useAppContext } from '../context/AppContext';
import { DINING_ROOM_TRACKS } from '../constants/bgm';
import { MainStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'DiningRoom'>;

const zoomMeetingUrl = process.env.EXPO_PUBLIC_ZOOM_MEETING_URL ?? '';
const zoomFallbackUrl = process.env.EXPO_PUBLIC_ZOOM_WEB_URL ?? '';

export const DiningRoomScreen = ({ navigation }: Props) => {
  const { user } = useAppContext();
  const [entered, setEntered] = useState(false);
  const [trackId, setTrackId] = useState<string>();

  useEffect(() => {
    setEntered(true);
    const randomTrack = DINING_ROOM_TRACKS[Math.floor(Math.random() * DINING_ROOM_TRACKS.length)];
    setTrackId(randomTrack.id);
    return () => setEntered(false);
  }, []);

  const trackTitle = useMemo(() => {
    return DINING_ROOM_TRACKS.find((track) => track.id === trackId)?.title ?? 'BGM 選択中';
  }, [trackId]);

  const handleJoinZoom = async () => {
    const urlCandidates = [zoomMeetingUrl, zoomFallbackUrl].filter(Boolean);
    if (urlCandidates.length === 0) {
      Alert.alert('Zoomリンクが設定されていません', '運営にお問い合わせください。');
      return;
    }

    for (const url of urlCandidates) {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return;
      }
    }

    Alert.alert(
      'Zoomを開けませんでした',
      'Zoomアプリがインストールされているか、ブラウザで開けるリンクかをご確認ください。'
    );
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>オンライン食事ルーム</Text>
        <Text style={styles.subtitle}>
          Zoom を使って気軽に一緒に食事を楽しみましょう。投稿から1時間は何度でも参加できます。
        </Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusText}>
            {entered ? `こんにちは、${user?.nickname ?? 'ゲスト'}さん` : '接続準備中…'}
          </Text>
          <Text style={styles.statusSub}>
            Zoom に参加すると「いただきます」メッセージが自動で送信され、退室時には「ごちそうさま」が表示されます。
          </Text>
        </View>

        <View style={styles.bgmCard}>
          <Text style={styles.sectionTitle}>おすすめBGM</Text>
          <Text style={styles.bgmTitle}>{trackTitle}</Text>
          <Text style={styles.bgmSub}>Zoomと同時に流すと、食卓の雰囲気がより明るくなります。</Text>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>参加方法</Text>
          <Text style={styles.instructionsText}>1. 下のボタンをタップして Zoom を開きます。</Text>
          <Text style={styles.instructionsText}>2. Zoom アプリまたはブラウザでミーティングに参加します。</Text>
          <Text style={styles.instructionsText}>3. カメラやマイク設定は Zoom 内で調整できます。</Text>
        </View>

        <PrimaryButton title="Zoom に参加する" onPress={handleJoinZoom} />

        {zoomMeetingUrl ? (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeLabel}>参加リンク</Text>
            <Text style={styles.noticeLink}>{zoomMeetingUrl}</Text>
            <Text style={styles.noticeSub}>開けない場合はリンクをコピーしてブラウザからアクセスしてください。</Text>
          </View>
        ) : (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeLabel}>リンク未設定</Text>
            <Text style={styles.noticeSub}>運営で Zoom ミーティング URL を設定すると参加できるようになります。</Text>
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

