# Co-食 チーム開発セットアップ

このドキュメントは「誰がクローンしてもすぐ Expo が起動する」ことを目的に、レポジトリ運用とローカルセットアップの手順をまとめたものです。

## リポジトリ運用方針
- **単一リポ構成**: 現状は `co-shoku/` (React Native / Expo) を中心に管理し、モノレポ化は必要になったら検討する。
- **ブランチ運用**: `main` を常時起動可能な状態で保ち、作業は短命の `feat/<topic>` / `fix/<issue>` ブランチで行う。
- **プルリクフロー**: 作業が終わったら PR を作成し、最低 1 名のレビューと CI（導入済みの場合）の成功を確認してから `main` にマージする。
- **コミットメッセージ**: `feat:`, `fix:`, `chore:` などの prefix を付けて内容を簡潔に記述する。

## 新規メンバーの初回セットアップ
```bash
git clone <repository-url>
cd co-shoku
nvm install          # 初回のみ。Node 20 LTS を入れる
nvm use              # .nvmrc に合わせる
npm ci               # 依存関係を lockfile どおりに復元
cp .env.example .env # 必要に応じて値をセット
npm run start        # or npx expo start
```

### なぜ `npm ci` を使うのか
`package-lock.json` に記録されたバージョンでインストールするため、全員の環境差異を最小化できます。`node_modules/` は Git に含めず、各自がこのコマンドで再構築します。

### Expo CLI について
ローカルに `node_modules/.bin/expo` が用意されるので、グローバルの旧 `expo-cli` は不要です。もし旧バージョンが影響している場合は `npm uninstall -g expo-cli` を検討してください。

## ローカル開発の基本コマンド
- `npm run start` : Expo Dev Server を起動
- `npm run android` / `npm run ios` / `npm run web` : 各プラットフォームを直接起動
- `npx expo-doctor` : 依存関係の整合性チェック
- `npm run lint`（導入済みの場合）: コードスタイルの検証

## 環境変数の扱い
- 機密値は `.env` に記入し、Git にはコミットしない（`.gitignore` 済み）。
- 新しい環境変数が必要になったら `.env.example` にも同じキーを追加して他メンバーに共有する。
- Firebase の API キーなどが一度でも公開リポに含まれた場合は、Firebase コンソールでキーをローテーションしてから `.env` に設定し直す。

## PR 作成時の推奨チェックリスト
- [ ] `npm ci` からのクリーン状態で `npm run start` が成功するか
- [ ] UI に変更がある場合はスクリーンショットまたは Expo QR を添付する
- [ ] 追加した環境変数や設定ファイルの更新が README / `.env.example` に反映されているか

## 追加タスク（時間ができたら）
1. GitHub Actions で `npm ci` → `npm run lint` → `npx expo-doctor` の簡易 CI を導入
2. PR テンプレートを `.github/pull_request_template.md` に追加
3. Firebase 連携が進んだら、セットアップ手順を本ドキュメントに追記

以上の運用を共有しておけば、ローカルコピー間の差異で「動かない」状態に陥るリスクを最小化できます。
