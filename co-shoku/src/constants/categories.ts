export type FoodCategory = {
  parent: string;
  children: string[];
};

export const FOOD_CATEGORIES: FoodCategory[] = [
  {
    parent: 'スープ',
    children: ['ポトフ', 'シチュー', '味噌汁', 'その他（スープ）'],
  },
  {
    parent: '肉料理',
    children: ['焼肉', '生姜焼き', '唐揚げ'],
  },
  {
    parent: '魚介料理',
    children: ['寿司・刺身', '揚げ物（魚介）', '煮物（魚介）', '焼き物（魚介）'],
  },
  {
    parent: '麺類',
    children: ['焼きそば', 'うどん', 'パスタ', 'ラーメン', 'そば'],
  },
  {
    parent: '野菜料理',
    children: ['炒め物（野菜）', '和え物（野菜）', '煮物（野菜）', 'サラダ'],
  },
  {
    parent: '粉物',
    children: ['お好み焼き', 'たこ焼き', 'その他（粉物）'],
  },
  {
    parent: 'ごはんもの',
    children: ['オムライス', 'カレー', '丼もの'],
  },
  {
    parent: 'その他',
    children: ['パン', '天ぷら', 'かき揚げ', 'コロッケ', 'グラタン', '餃子', '鍋', 'その他'],
  },
];

export const CHILD_TO_PARENT_MAP: Record<string, string> = FOOD_CATEGORIES.reduce(
  (acc, category) => {
    category.children.forEach((child) => {
      acc[child] = category.parent;
    });
    return acc;
  },
  {} as Record<string, string>
);

export const getParentCategory = (childCategory: string): string => {
  return CHILD_TO_PARENT_MAP[childCategory] ?? 'その他';
};

