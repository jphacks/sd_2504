# Co-食 開発ハンドブック

プロダクト全体の構造、開発の進め方、環境変数の扱いをまとめた開発者向けガイドです。新しく参加するメンバーはまず本書と `docs/team-setup.md` を読んでください。

---

## 1. プロダクト全体像

- **アプリ種別**: React Native (Expo) — iOS / Android / Web を単一コードベースで提供
- **目的**: 食のウェルビーイングを支援する「Co-食」アプリ。投稿 → 1時間限定機能開放 → タイムライン/オンライン食卓/1対1通話などの体験を提供
- **主要依存**: Expo SDK 54, React 19, React Navigation, Expo Camera / Image Picker, Firebase (Auth / Firestore / Storage / Realtime/ WebRTC 予定)

### 1.1 ディレクトリ構造概観
```
co-shoku/
├── App.tsx               # ルートコンポーネント。AppProvider と Navigation を組み合わせる
├── index.ts              # Expo エントリーポイント
├── app.json              # Expo 設定。バンドル名やスプラッシュなど
├── assets/               # 画像・アイコン・BGM 等の静的アセット
├── docs/                 # チーム運用ドキュメント (project-structure, team-setup)
├── dev-handbook/         # ← このハンドブック等、開発者向け補助資料
├── src/
│   ├── app/
│   │   ├── navigation/   # 画面遷移スタックとゲーティングロジック
│   │   └── providers/    # グローバル状態 (AppProvider) や将来の共通プロバイダ
│   ├── components/       # 再利用 UI (ボタン、カード、チップなど)
│   ├── constants/        # 料理カテゴリ、チュートリアル文言等の静的データ
│   ├── screens/          # 各画面 (ホーム, 投稿, タイムライン, ルーム 等)
│   ├── services/         # Firebase や外部 API へのアクセス層
│   ├── types/            # 共通型定義 (User, Post, Report ほか)
│   └── utils/            # 共通ロジック (日付処理, カウンタ, バリデーション)
├── package.json / lock   # 依存関係と npm スクリプト
├── tsconfig.json         # TypeScript 設定
├── .nvmrc                # Node.js バージョン固定 (20 LTS)
└── .env.example          # 公開して良い環境変数のテンプレート
```

> 詳細なツリーは `docs/project-structure.md` を参照。

---

## 2. 開発フロー

### 2.1 ブランチ戦略
- `main`: 常に起動可能な状態を保つ（保護推奨）
- 作業単位で `feat/<topic>`, `fix/<issue>`, `chore/<task>` など短命ブランチを切る
- 完了したら PR を作成し、レビュー + CI を通した上で `main` へマージ

### 2.2 作業サイクル
1. Issue 作成 / タスク確認  
2. `git fetch` → `git checkout -b feat/<topic>`  
3. 実装 → ローカルで `npm run start` / `npm run lint` 等で確認  
4. PR 作成（テンプレートに沿ってチェック項目を埋める）  
5. レビュー指摘を反映 → マージ  
6. プロダクトオーナーと共有（スクショ / Expo QR）

### 2.3 CI / テスト
- 最小ライン: `npm ci` → `npm run lint` → `npx expo-doctor`
- 時間があれば E2E / UI Snapshot など追加

---

## 3. 環境構築と依存管理

### 3.1 セットアップ手順
```bash
git clone <repo>
cd co-shoku
nvm use           # .nvmrc に合わせて Node 20 を使用
npm ci            # lockfile どおりに依存関係を復元
cp .env.example .env
# Firebase など必要な値を .env に記入（Supabase を使う場合は URL / Anon Key も）
npm run start     # Expo Dev Server を起動
```

### 3.2 npm install と npm ci の使い分け
- 既存プロジェクトでは **`npm ci` 推奨**。lockfile のバージョンを忠実に再現するため、チーム間の齟齬を防げる
- 新規依存を追加する場合のみ `npm install <pkg>` → `package-lock.json` が更新されたらコミット

### 3.3 ローカルに生成されるもの
- `node_modules/`, `.expo/`, `dist/` などは `.gitignore` 済みで Git には含めない
- Expo のキャッシュや OS 固有ファイル (macOS の `.DS_Store` 等) もコミット対象外

---

## 4. 環境変数と秘密情報の扱い

### 4.1 `.env` ルール
- `.env` はローカル専用。**絶対に Git にコミットしない**
- 値が必要な環境変数は `EXPO_PUBLIC_` から始まるキーとして `.env` に記載し、`.env.example` にサンプルキーを追加
- Firebase API キー等が誤って公開リポジトリに入った場合は、即座に Firebase コンソールでキーをローテーションし、`.env` に新しい値を設定 → コードからは `process.env.EXPO_PUBLIC_*` で参照

### 4.2 Expo と環境変数
- Expo は `EXPO_PUBLIC_` プレフィックスの値をビルド時に読み取る
- リリースビルドや CI/CD 用には `eas secret:create` などで管理することも検討

---

## 5. 画面 / ロジック追加時のガイド

1. **デザイン確認**: 要求仕様を踏まえてワイヤーフレーム / UI を確認
2. **型定義**: 新しいデータ構造が必要なら `src/types` に追加。既存の API と整合性を取る
3. **状態管理**: アプリ全体で共有するロジックは `src/app/providers` の AppProvider にまとめ、副作用は `services` や `utils` に切り出す
4. **画面実装**: `src/screens` に新しい Screen を作成し、再利用可能な UI は `components` へ分割
5. **ナビゲーション**: 遷移が必要なら `src/navigation` のスタック/タブに登録
6. **テスト**: 少なくとも手動での起動確認（Expo Dev Tools）+ lint/doctor を実施

---

## 6. よくあるトラブルと対処

| 問題 | 原因 | 対処 |
| ---- | ---- | ---- |
| `expo start` が旧 CLI を呼ぶ | グローバル `expo-cli` に引っ張られている | `npm uninstall -g expo-cli`、ローカル `npx expo start` を使用 |
| 依存の不整合でビルド失敗 | lockfile がずれている | `rm -rf node_modules package-lock.json && npm ci` |
| .env を忘れて起動できない | Firebase キー未設定 | `.env.example` をコピーして `.env` を作成、必要値を設定 |
| iOS/Android 実機が繋がらない | ネットワーク不一致、Expo Go 古い | 同一ネットワーク確認、`expo start -c` でキャッシュクリア |

---

## 7. 追加リソース

- `docs/project-structure.md`: ディレクトリごとの詳細説明
- `docs/team-setup.md`: ブランチ運用 / PR テンプレート / CI 方針
- Requirement Spec: Issue / Notion / Drive 等、元ドキュメントを参照（リンクは各自管理）

---

チームで気づいた運用ノウハウがあれば、このハンドブックに追記して共有してください。レビューを通じて最新の状態を保つことが、共同開発のトラブルを防ぐ近道です。
