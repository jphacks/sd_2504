import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo } from 'react';
import { FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppContext } from '../context/AppContext';
import { MainStackParamList } from '../navigation/AppNavigator';
import { formatDateShort, minutesUntil } from '../utils/time';

type Props = NativeStackScreenProps<MainStackParamList, 'Timeline'>;

export const TimelineScreen = ({ route, navigation }: Props) => {
  const { category } = route.params;
  const { getTimelineForCategory, refreshTimeline } = useAppContext();

  useEffect(() => {
    refreshTimeline(category);
  }, [category, refreshTimeline]);

  const posts = useMemo(() => getTimelineForCategory(category), [category, getTimelineForCategory]);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>{category} のタイムライン</Text>
        <Text style={styles.subtitle}>投稿は1時間で自動削除されます。</Text>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>まだ投稿がありません。写真を投稿して参加しよう！</Text>
            <PrimaryButton title="写真を投稿" onPress={() => navigation.navigate('PostCapture')} />
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imageUri && <Image source={{ uri: item.imageUri }} style={styles.image} />}
            <View style={styles.cardBody}>
              <Text style={styles.timestamp}>{formatDateShort(item.postedAt)} 投稿</Text>
              <Text style={styles.expire}>あと {minutesUntil(item.expiresAt)} 分で終了</Text>
            </View>
          </View>
        )}
        contentContainerStyle={posts.length === 0 ? styles.listEmpty : undefined}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  cardBody: {
    padding: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#777',
    marginBottom: 4,
  },
  expire: {
    fontSize: 14,
    color: '#FF7F50',
    marginBottom: 12,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
  },
  emptyText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 16,
  },
  listEmpty: {
    flexGrow: 1,
  },
});
