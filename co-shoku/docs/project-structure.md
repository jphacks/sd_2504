# プロジェクト構造ガイド

開発者が素早くリポジトリの全体像を把握できるよう、主要ディレクトリとファイルの役割をまとめました。実装を進める際は、このガイドと `docs/team-setup.md` を併せて参照してください。

```text
co-shoku/
├── App.tsx                # Expo エントリーポイント（NavigationProvider を組み立て）
├── index.ts               # Expo の起動スクリプト
├── app.json               # Expo プロジェクト設定
├── assets/                # 画像・サウンドなど静的アセット
├── docs/
│   ├── project-structure.md  # ← 今読んでいるファイル
│   └── team-setup.md         # 開発フロー・セットアップ手順
├── src/
│   ├── components/        # 汎用 UI コンポーネント（Button、Card など）
│   ├── constants/         # 料理カテゴリやチュートリアル文言などの静的データ
│   ├── context/           # AppContext などのグローバル状態管理
│   ├── navigation/        # React Navigation のスタック/タブ構成
│   ├── screens/           # 画面コンポーネント一式
│   ├── services/          # Firebase 等の外部サービス連携ロジック
│   ├── types/             # 共通型定義（User, Post, Report など）
│   └── utils/             # 日付処理やカウンタ制御などのユーティリティ
├── package.json           # 依存関係と npm スクリプト
├── package-lock.json      # 依存バージョンの固定（npm ci 用）
├── tsconfig.json          # TypeScript コンパイラ設定
├── .nvmrc                 # Node.js バージョン指定 (20)
├── .env.example           # Firebase 等の環境変数サンプル
└── README.md              # プロジェクト概要とオンボーディング
```

## 補足

- `node_modules/`, `.expo/`, `dist/` などは `.gitignore` 済みで Git には含まれません。
- Firebase の API キーを含む `.env` はローカル専用です。漏えいした場合は必ず Firebase でキーをローテーションしてください。
- 画面を追加する際は `src/screens` に配置し、必要に応じて `src/navigation` にルーティングを定義、`src/context` に状態管理を拡張します。

不明点があれば `docs/team-setup.md` の PR テンプレートや Slack チャンネルで相談してください。
