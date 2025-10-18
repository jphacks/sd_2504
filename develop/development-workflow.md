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
