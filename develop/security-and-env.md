# 環境変数とセキュリティの運用

## 1. 環境変数の扱い
- `.env.example` をコピーして `.env` を作成し、Expo が参照する `EXPO_PUBLIC_` 付きの値を記入する。
- Firebase Web App の値は必須:
  - `EXPO_PUBLIC_FIREBASE_API_KEY`
  - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
  - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `EXPO_PUBLIC_FIREBASE_APP_ID`
  - `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`
- Supabase を利用する場合のみ以下を設定（未設定なら Firebase Storage にフォールバック）:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  - `EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET`（既定値 `posts`）
- `.env` は Git ignore 済み。値を更新したら `.env.example` にキーを追記し、チームへ共有する。

## 2. 露出リスクと対策
- `EXPO_PUBLIC_*` の値はクライアントバンドルから取得可能。Firebase/Supabase のセキュリティルールでアクセス制限を行い、キーのみで不正操作できないようにする。
- もし秘密値を誤ってコミットした場合は、該当サービス（Firebase など）でキーを即ローテーションし、`.env` を更新する。
- Supabase を使う場合はストレージポリシーで匿名ユーザーの書き込み権限を制限する。

## 3. 開発中の注意
- ログにキーを出力しない。`console.log(process.env...)` を残さないこと。
- 共有リポジトリには `.env` を push しない。レビュー時に公開リポへ漏れていないか確認する。
- CI/CD 環境でのビルド時は、Expo の Secrets や GitHub Actions の Secrets を使用し、直接 `.env` をコミットしない。
