# 開発の進め方

## 1. ブランチ戦略
- `main`: 常に起動可能。直接 push せず PR で更新。
- 作業単位で `feat/<機能>`、`fix/<不具合>`、`chore/<雑タスク>` などの短命ブランチを作成。
- 作業完了後、PR を出しレビュー + CI を通過してからマージ。

## 2. 毎回の作業手順
1. 最新化: `git fetch` → `git checkout main` → `git pull`
2. ブランチ作成: `git checkout -b feat/<topic>`
3. 依存更新がある場合のみ `npm install`、基本は `npm ci`
4. 実装 → `npm run start` で動作確認
5. 必要に応じて `npm run lint` / `npx expo-doctor`
6. PR 作成時にスクリーンショットや動作確認メモを添付

## 3. コミット/PR ルール
- コミットメッセージは `feat: ...`, `fix: ...`, `chore: ...` など簡潔に。
- PR テンプレート (`docs/team-setup.md` 参照) のチェック項目を満たす。
- UI 変更はスクショ、機能変更はテスト手順を記載。

## 4. CI / 品質確認
- 最低限: `npm ci` → `npm run lint` → `npx expo-doctor`
- 余裕があれば E2E / UI テストを追加。
- CI で `.env` が必要な場合は Secrets を利用し、リポジトリに直接含めない。

## 5. 情報共有
- 仕様や要件は要件定義書を参照（Notion/Drive 等）。
- 進捗や課題は Slack / Issue で共有。
- 共通ルールは `dev-handbook/README.md` とこの `develop` フォルダを最新化しておく。
# 開発の進め方（最新版）

チームが迷わず作業できるよう、ブランチ運用からレビュー、品質確認までの流れを整理しました。

## 1. ブランチ戦略

- `main` … 常に起動可能な状態を維持。直接 push せず PR 経由で更新。
- 作業単位で短命ブランチを作成  
  - 新機能: `feat/<feature-name>`  
  - 不具合修正: `fix/<bug-id>`  
  - 雑タスク/設定更新: `chore/<task>`
- 長期ブランチは作らず、こまめに `main` を取り込んでコンフリクトを防ぐ。

## 2. 着手前チェックリスト

1. `git fetch --all` → `git checkout main` → `git pull`
2. Issue / タスク管理表で担当範囲を確認
3. `.env.example` に新しいキーが追加されていないか確認し、必要なら `.env` を更新
4. `npm ci` を実行（依存追加が無い限り `npm install` は使わない）

## 3. 実装サイクル

1. `git checkout -b feat/<topic>` でブランチ作成
2. 実装 → `npm run start` で手元確認
3. 変更が大きい場合は `npm run lint` / `npx expo-doctor` を実行
4. UI 変更はスクリーンショット or 動画を用意
5. ローカルで Firebase/Supabase の設定が必要な場合は `.env` を更新してから再起動

## 4. コミット & PR

- コミット粒度は「テストが通る」「画面が崩れない」単位でまとめる
- コミットメッセージは `feat: ...` / `fix: ...` / `chore: ...` / `docs: ...` など prefix を付与
- PR テンプレート（`docs/team-setup.md`）のチェック項目を埋める
- PR 説明に「何をしたか」「動作確認方法」「影響範囲」を記載し、必要なスクリーンショットを添付
- レビュー指摘は追加コミットで対応し、解決後にスレッドを Resolve

## 5. 品質確認・CI

- 最低ライン: `npm ci` → `npm run lint` → `npx expo-doctor`
- 追加で実施できると理想:  
  - 主要画面の手動動作確認  
  - Firebase/Storage との接続確認（スタブを本実装に切り替えた際）  
  - Expo Prebuild / EAS Build の動作検証（必要に応じて）
- CI 環境では Secrets を使って環境変数を注入し、`.env` をコミットしない

## 6. 情報共有とドキュメント更新

- 要件や仕様変更は既定の共有ツール（Notion / Slack / Issue 等）に即反映
- ハンドブックや `develop/` 配下のドキュメントは変更があれば PR で更新
- Firebase のキーをローテーションした際は、手順と新しい値の反映状況をチームに周知

## 7. 次のステップ（任意）

- GitHub Actions で `npm ci` と `npx expo-doctor` を自動化
- Storybook や UI スナップショットテストを導入して画面差分を検知
- リリースフローを決め、TestFlight / Play Store 内部テストへのアップロード手順を整備
