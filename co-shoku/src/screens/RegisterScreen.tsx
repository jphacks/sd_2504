import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SecondaryButton } from '../components/SecondaryButton';
import { useAppContext } from '../context/AppContext';
import { AuthStackParamList } from '../navigation/AppNavigator';
import { getAuthErrorMessage } from '../utils/firebaseErrors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen = ({ navigation }: Props) => {
  const { register, isLoading } = useAppContext();
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleRegister = async () => {
    if (!nickname || !email || !password) {
      Alert.alert('入力内容を確認してください', 'ニックネーム、メールアドレス、パスワードは必須です。');
      return;
    }
    try {
      await register({ nickname, email, password });
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      Alert.alert('登録に失敗しました', getAuthErrorMessage(code));
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>はじめまして！</Text>
        <Text style={styles.subtitle}>Co-食のアカウントを作成しましょう。</Text>
        <View style={styles.form}>
          <Text style={styles.label}>ニックネーム</Text>
          <TextInput
            placeholder="こしょくさん"
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
          />
          <Text style={styles.label}>メールアドレス</Text>
          <TextInput
            placeholder="example@mail.com"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Text style={styles.label}>パスワード</Text>
          <TextInput
            placeholder="パスワード"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <PrimaryButton title={isLoading ? '登録中...' : '登録する'} onPress={handleRegister} />
          <SecondaryButton title="ログインに戻る" onPress={() => navigation.goBack()} />
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
    fontSize: 32,
    fontWeight: '700',
    color: '#FF7F50',
    marginTop: 24,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#555',
  },
  form: {
    marginTop: 32,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#FFE1D4',
    marginBottom: 16,
  },
});
