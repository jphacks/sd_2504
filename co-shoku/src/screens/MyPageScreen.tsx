import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '../components/ScreenContainer';
import { useAppContext } from '../context/AppContext';
import { FOOD_CATEGORIES } from '../constants/categories';
import { MainStackParamList } from '../navigation/AppNavigator';
import { FoodHistory } from '../types';
import { formatDateShort } from '../utils/time';

type Props = NativeStackScreenProps<MainStackParamList, 'MyPage'>;

type AggregatedData = {
  parent: string;
  count: number;
};

const aggregateParentCounts = (history: FoodHistory[]): AggregatedData[] => {
  const map = new Map<string, number>();
  history.forEach((item) => {
    map.set(item.parentCategory, (map.get(item.parentCategory) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .map(([parent, count]) => ({ parent, count }))
    .sort((a, b) => b.count - a.count);
};

const aggregateChildCounts = (history: FoodHistory[]): Record<string, number> => {
  return history.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + 1;
    return acc;
  }, {});
};

const pickSuggestion = (history: FoodHistory[]): string => {
  if (history.length === 0) {
    const randomParent = FOOD_CATEGORIES[Math.floor(Math.random() * FOOD_CATEGORIES.length)];
    const randomChild = randomParent.children[Math.floor(Math.random() * randomParent.children.length)];
    return `${randomParent.parent} - ${randomChild}`;
  }

  const parentCounts = new Map<string, number>();
  history.forEach((entry) => {
    parentCounts.set(entry.parentCategory, (parentCounts.get(entry.parentCategory) ?? 0) + 1);
  });

  const sortedParents = FOOD_CATEGORIES.slice().sort((a, b) => {
    const countA = parentCounts.get(a.parent) ?? 0;
    const countB = parentCounts.get(b.parent) ?? 0;
    return countA - countB;
  });

  const targetParent = sortedParents[0];
  const randomChild = targetParent.children[Math.floor(Math.random() * targetParent.children.length)];
  return `${targetParent.parent} - ${randomChild}`;
};

export const MyPageScreen = (_props: Props) => {
  const { user, foodHistory } = useAppContext();

  const parentAggregates = useMemo(() => aggregateParentCounts(foodHistory), [foodHistory]);
  const totalCount = parentAggregates.reduce((sum, item) => sum + item.count, 0);
  const childCounts = useMemo(() => aggregateChildCounts(foodHistory), [foodHistory]);
  const suggestion = useMemo(() => pickSuggestion(foodHistory), [foodHistory]);

  return (
    <ScreenContainer>
      <ScrollView>
        <View style={styles.section}>
          <Text style={styles.title}>{user?.nickname ?? 'ユーザー'}さんのマイページ</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>直近30日間の投稿カテゴリ</Text>
          {parentAggregates.length === 0 ? (
            <Text style={styles.empty}>まだ投稿はありません。写真を投稿して記録を残しましょう！</Text>
          ) : (
            parentAggregates.map((item) => {
              const ratio = totalCount === 0 ? 0 : Math.round((item.count / totalCount) * 100);
              return (
                <View key={item.parent} style={styles.progressRow}>
                  <Text style={styles.progressLabel}>{item.parent}</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${ratio}%` }]} />
                  </View>
                  <Text style={styles.progressValue}>{ratio}%</Text>
                </View>
              );
            })
          )}
          <Text style={styles.chartNote}>※ 円グラフ表示は実装予定のプレースホルダーです。</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>最近の投稿</Text>
          {foodHistory.slice(0, 10).map((entry) => (
            <View key={entry.id} style={styles.historyItem}>
              <Text style={styles.historyDate}>{formatDateShort(entry.postedAt)}</Text>
              <Text style={styles.historyCategory}>
                {entry.parentCategory} / {entry.category}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>よく食べるカテゴリ</Text>
          {Object.entries(childCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([category, count]) => (
              <Text key={category} style={styles.rankItem}>
                ・{category}: {count}回
              </Text>
            ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>次の食事提案</Text>
          <Text style={styles.suggestion}>{suggestion}</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
  },
  meta: {
    marginTop: 8,
    color: '#555',
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  empty: {
    color: '#555',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    width: 90,
    fontSize: 14,
  },
  progressBar: {
    flex: 1,
    backgroundColor: '#FFE1D4',
    height: 10,
    borderRadius: 6,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF7F50',
  },
  progressValue: {
    width: 50,
    textAlign: 'right',
    fontSize: 12,
    color: '#555',
  },
  chartNote: {
    marginTop: 8,
    fontSize: 12,
    color: '#777',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  historyDate: {
    width: 60,
    color: '#555',
  },
  historyCategory: {
    flex: 1,
  },
  rankItem: {
    marginBottom: 4,
    color: '#555',
  },
  suggestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF7F50',
  },
});
