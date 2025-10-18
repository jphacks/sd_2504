export type TutorialSlide = {
  id: string;
  title: string;
  description: string;
};

export const TUTORIAL_SLIDES: TutorialSlide[] = [
  {
    id: '1',
    title: 'Co-食へようこそ',
    description: 'ひとりの食事を楽しくするコミュニティ。まずは今日のごはんをシェアしましょう。',
  },
  {
    id: '2',
    title: '食事を投稿',
    description: '1日3回まで料理写真を投稿できます。投稿から1時間限定で特別な機能が解放されます。',
  },
  {
    id: '3',
    title: '同じカテゴリでつながる',
    description: '同じカテゴリの投稿だけがタイムラインに表示され、共通の話題で盛り上がれます。',
  },
  {
    id: '4',
    title: 'オンライン食卓を楽しむ',
    description: '投稿後1時間はオンライン食卓ルームや一食トークでリアルタイムに交流できます。',
  },
  {
    id: '5',
    title: 'Miracle Matchを狙おう',
    description: '同じカテゴリでマッチングするとポイント獲得。マイページで振り返りを楽しんでください。',
  },
];

