import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppContext } from '../context/AppContext';
import { MainStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'CallWaiting'>;

export const CallWaitingScreen = ({ navigation }: Props) => {
  const { isUnlockActive, minutesUntilLockout } = useAppContext();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>一食トーク</Text>
        <Text style={styles.subtitle}>
          一食トークは現在準備中です。写真を投稿すると {minutesUntilLockout} 分間、近日公開予定の体験版にアクセスできるようになります。
        </Text>
        {!isUnlockActive && (
          <Text style={styles.notice}>
            直近の投稿が見当たりません。写真を投稿してから再度アクセスしてください。
          </Text>
        )}
        <PrimaryButton title="ホームに戻る" onPress={() => navigation.goBack()} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 20,
  },
  notice: {
    fontSize: 13,
    color: '#777',
    marginBottom: 32,
  },
});

