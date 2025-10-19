import { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { SecondaryButton } from '../components/SecondaryButton';
import { useAppContext } from '../context/AppContext';
import { MainStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'PostCapture'>;

export const PostCaptureScreen = ({ navigation }: Props) => {
  const { canPostToday } = useAppContext();
  const [imageUri, setImageUri] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
  }, []);

  const handlePickImage = async (fromCamera: boolean) => {
    if (!canPostToday) {
      Alert.alert('投稿上限に達しています', '次の投稿は午前2時（JST）以降に可能です。');
      return;
    }
    const pickerFn = fromCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const result = await pickerFn({
      quality: 0.6,
      allowsEditing: true,
      aspect: [4, 3],
    });
    if (result.canceled) {
      return;
    }
    const asset = result.assets?.[0];
    if (!asset?.uri) {
      Alert.alert('画像を取得できませんでした');
      return;
    }
    setImageUri(asset.uri);
    navigation.navigate('CategorySelection', { imageUri: asset.uri });
  };

  return (
    <ScreenContainer includeTopInset={false}>
      <View style={styles.container}>
        <Text style={styles.title}>投稿する写真を選びましょう</Text>
        <Text style={styles.subtitle}>カメラで撮影するか、アルバムから選択できます。</Text>

        <PrimaryButton title="カメラで撮影" onPress={() => handlePickImage(true)} />
        <PrimaryButton title="アルバムから選択" onPress={() => handlePickImage(false)} />

        {imageUri && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>選択した写真</Text>
            <Image source={{ uri: imageUri }} style={styles.preview} />
          </View>
        )}

        <SecondaryButton title="キャンセル" onPress={() => navigation.goBack()} />
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 24,
  },
  previewContainer: {
    marginTop: 32,
  },
  previewLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  preview: {
    width: '100%',
    height: 240,
    borderRadius: 12,
  },
});
