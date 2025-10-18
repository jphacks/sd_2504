# プロダクト構造

```
co-shoku/
├── App.tsx                 # AppProvider と Navigation を束ねるエントリ
├── index.ts                # Expo 起動スクリプト
├── app.json                # Expo 設定
├── assets/                 # 画像・サウンドなどの静的アセット
├── src/
│   ├── context/            # グローバル状態（AppProvider / useAppContext）
│   ├── navigation/         # 画面遷移構成（スタック/タブおよびゲーティング制御）
│   ├── components/         # 共通 UI コンポーネント
│   ├── constants/          # 料理カテゴリやチュートリアル文言などの静的データ
│   ├── screens/            # 画面 UI 実装（ホーム、投稿、タイムライン等）
│   ├── services/           # Firebase / Supabase など外部サービス連携
│   ├── types/              # 共通型定義（User, Post, Report 等）
│   └── utils/              # 日付処理などのユーティリティ
├── docs/                   # プロジェクトドキュメント
├── dev-handbook/           # 開発者向けハンドブック
├── develop/                # 開発用メモ（このフォルダ）
├── package.json / lock     # 依存関係とスクリプト
├── tsconfig.json           # TypeScript 設定
├── .nvmrc                  # Node.js バージョン (20 LTS)
└── .env.example            # 環境変数テンプレート
```

主要フロー: `AppProvider` で状態管理 → `AppNavigator` が Splash / Auth / Tutorial / Main スタックを切り替え → 各 `src/screens/*` で UI を構築する。

補足:
- `src/app/providers` / `src/app/navigation` は将来的なリファクタリング候補として配置済み。現状は `src/context` と `src/navigation` を運用中。
