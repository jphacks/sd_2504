export type TutorialSlide = {
  id: string;
  title: string;
  description: string;
  image?: number;
};

export const TUTORIAL_SLIDES: TutorialSlide[] = [
  {
    id: '1',
    title: 'Co-食へようこそ',
    description: 'ひとりの食事を楽しくするコミュニティ。まずは今日のごはんをシェアしましょう。',
    image: require('../../assets/tutorial/icon.png'),
  },
  {
    id: '2',
    title: '食事を投稿しよう',
    description: '食事の写真を投稿すると、同じカテゴリのタイムラインとオンラインルームが1時間だけ開放されます。',
    image: require('../../assets/tutorial/tutorial-2.png'),
  },
  {
    id: '3',
    title: '同じカテゴリでつながる',
    description: '同じカテゴリの投稿だけがタイムラインに表示され、共感しながら食事を楽しめます。',
    image: require('../../assets/tutorial/tutorial-3.png'),
  },
  {
    id: '4',
    title: 'わいわい食堂へ',
    description: 'オンラインルームに入る前に、料理に沿った「会話の種」が表示されるので、はじめての人とも気軽に話せます！',
    image: require('../../assets/tutorial/tutorial-4.png'),
  },
];
