# プロダクト構造（最新）

本書は `co-shoku` アプリのフォルダ構成と実行フローを俯瞰できるようにまとめたものです。画面や状態を追加する際の置き場所の判断に使ってください。

## ルート直下

| パス | 役割 |
| ---- | ---- |
| `App.tsx` | Expo のエントリーポイント。`AppProvider` と `AppNavigator` を読み込み、アプリ全体のコンテキストと画面遷移を初期化します。 |
| `index.ts` | Expo が参照するブートストラップコード。 |
| `app.json` | Expo プロジェクト設定（アプリ名、スプラッシュなど）。 |
| `assets/` | 画像・BGM 等の静的アセット。 |
| `docs/` | 既存のチーム向けドキュメント。 |
| `dev-handbook/` | 開発者向けハンドブック。 |
| `tsconfig.json` | TypeScript 設定。 |
| `package.json` / `package-lock.json` | 依存関係とスクリプト。 |
| `.nvmrc` | Node.js バージョン固定 (20 LTS)。 |
| `.env.example` | 環境変数テンプレート。`.env` は Git 管理外。 |

## `src/` ディレクトリ

| パス | 役割 |
| ---- | ---- |
| `src/context/AppContext.tsx` | アプリ全体で共有する状態とメソッドを保持するメインのコンテキスト。Firebase 連携もここで行います。現行コードはこのファイルを参照しています。 |
| `src/navigation/AppNavigator.tsx` | React Navigation のスタック構成。Splash → Auth → Tutorial → Main のゲート制御を担当。 |
| `src/screens/` | 画面コンポーネント群（ホーム、投稿、タイムライン、オンライン食卓、1対1通話など）。 |
| `src/components/` | 再利用可能な UI コンポーネント（ボタン、チップなど）。 |
| `src/constants/` | 料理カテゴリ、チュートリアル文言、BGM リストなどの静的データ。 |
| `src/services/` | Firebase や Supabase など外部サービスとの通信ラッパー。 |
| `src/types/` | 共通データ型の定義。要件ドキュメントを反映。 |
| `src/utils/` | 日時計算や投稿制限ロジックなどのユーティリティ。 |
| `src/app/providers/` / `src/app/navigation/` | 将来的に構造を整理するための新フォルダ。現状のエントリポイントでは未使用なので、移行するか削除するか判断が必要です。 |

## 実行フロー

1. `App.tsx` で `AppProvider` と `AppNavigator` を読み込み。
2. `AppProvider`（= `src/context/AppContext.tsx`）が Firebase 初期化、認証状態、投稿制御、履歴、マッチングなどのロジックを管理。
3. `AppNavigator` がユーザの状態に応じて表示スタックを切り替え、`src/screens/*` の各画面を表示。
4. 写真投稿時は `src/services/firebase.ts` → Firebase Storage / Supabase Storage を順に試み、Firestore へ登録。

## 既知の課題 / TODO

- `src/context` と `src/app/providers` / `src/app/navigation` が重複して存在します。現行コードは `src/context` / `src/navigation` を正としています。不要なファイルを削除するか、新フォルダへ完全移行する計画を立ててください。
- Firebase 実装はスタブ部分が残っているため、実運用に向けて Firestore/Storage/Realtime の実コードとテストの追加が必要です。
- Supabase を使わない場合でも警告ログが出るので、利用有無に応じたログレベル調整やフラグの導入を検討してください。
