import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SecondaryButton } from '../components/SecondaryButton';
import { useAppContext } from '../context/AppContext';
import { AuthStackParamList } from '../navigation/AppNavigator';
import { getAuthErrorMessage } from '../utils/firebaseErrors';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen = ({ navigation }: Props) => {
  const { login, isLoading } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('入力内容を確認してください', 'メールアドレスとパスワードを入力してください。');
      return;
    }
    try {
      await login({ email, password });
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      Alert.alert('ログインに失敗しました', getAuthErrorMessage(code));
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Co-食</Text>
        <Text style={styles.subtitle}>食のwell-beingコミュニティへログイン</Text>

        <View style={styles.form}>
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
          <PrimaryButton title={isLoading ? 'ログイン中...' : 'ログイン'} onPress={handleLogin} />
          <SecondaryButton title="新規登録はこちら" onPress={() => navigation.navigate('Register')} />
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
    fontSize: 36,
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
