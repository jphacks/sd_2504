import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CategoryChip } from '../components/CategoryChip';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppContext } from '../context/AppContext';
import { FOOD_CATEGORIES } from '../constants/categories';
import { MainStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<MainStackParamList, 'CategorySelection'>;

export const CategorySelectionScreen = ({ route, navigation }: Props) => {
  const { createPost } = useAppContext();
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const imageUri = route.params?.imageUri;

  const handleSubmit = async () => {
    if (!selectedChild) {
      Alert.alert('カテゴリを選択してください', '料理カテゴリを選択すると投稿できます。');
      return;
    }
    try {
      await createPost({ category: selectedChild, imageUri });
      Alert.alert('投稿が完了しました', '1時間限定の機能が解放されました！', [
        {
          text: 'ホームへ',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert('投稿できませんでした', error.message);
      } else {
        Alert.alert('投稿できませんでした', '時間をおいて再度お試しください。');
      }
    }
  };

  return (
    <ScreenContainer includeTopInset={false}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>カテゴリを選択してください</Text>
        <Text style={styles.subtitle}>投稿カテゴリに応じて利用できるタイムラインが決まります。</Text>

        {FOOD_CATEGORIES.map((category) => (
          <View key={category.parent} style={styles.block}>
            <Text style={styles.parentLabel}>{category.parent}</Text>
            <View style={styles.childrenContainer}>
              {category.children.map((child) => (
                <CategoryChip
                  key={child}
                  label={child}
                  selected={selectedChild === child}
                  onPress={() => {
                    setSelectedChild(child);
                  }}
                />
              ))}
            </View>
          </View>
        ))}

        <PrimaryButton title="投稿する" onPress={handleSubmit} />
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scroll: {
    marginHorizontal: -20,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  block: {
    marginBottom: 16,
  },
  parentLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  childrenContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
