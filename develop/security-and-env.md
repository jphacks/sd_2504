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
# 環境変数とセキュリティ運用（最新）

Expo アプリではクライアント側にバンドルされる値も多いため、秘密情報の取り扱いに注意してください。

## 1. 必須環境変数

`.env.example` を基に `.env` を作成し、以下のキーを設定します。Expo は `EXPO_PUBLIC_` で始まる値をクライアントに露出させる点に留意してください。

| キー | 用途 | 備考 |
| ---- | ---- | ---- |
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase Web API Key | 漏れても Firebase 側のセキュリティルールで制限すること |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase Auth ドメイン | |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firestore/Storage のプロジェクト ID | |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage バケット名 | |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging ID | |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase アプリ ID | |
| `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID` | GA4 用 ID（必要な場合） | |
| `EXPO_PUBLIC_API_BASE` | クライアントから叩く API のベース URL | ダミー値でも構いません |

### Supabase を利用する場合

画像アップロードを Supabase Storage 経由で行う場合のみ、下記を追加します（未設定なら Firebase Storage にフォールバックします）。

| キー | 用途 |
| ---- | ---- |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase インスタンスの URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase アノンキー |
| `EXPO_PUBLIC_SUPABASE_STORAGE_BUCKET` | 使用するバケット名（既定値 `posts`） |

## 2. セキュリティ上の注意点

1. **Expo の公開特性**  
   - `EXPO_PUBLIC_*` はアプリバンドルから復元可能です。Firebase/Supabase のルールを必ず設定し、認証済みユーザーのみに操作を許可してください。

2. **キー漏えい時の対応**  
   - 誤って鍵をコミットしたり共有した場合は、Firebase・Supabase のダッシュボードから速やかにキーをローテーションし、`.env` を更新のうえチームへ共有します。

3. **ログ/デバッグ**  
   - API キーを `console.log` で出力しない。デバッグ用に出力した場合は必ず削除します。

4. **リポジトリ管理**  
   - `.env` は `.gitignore` 済み。レビュー時に `.env` や秘密値が PR に含まれていないか確認する習慣をつけてください。

5. **CI/CD 環境**  
   - GitHub Actions 等でビルドする場合は、Secrets 機能に環境変数を登録し `eas secret` などで参照させる。`.env` の直接コミットは禁止。

## 3. 補足

- Firebase Authentication のセッション管理、Firestore のセキュリティルール、Storage ルールを要件に従って整備することが前提です。
- Supabase を利用する場合は、Storage のポリシーで匿名書き込みを抑止し、必要に応じて Edge Functions 等で署名付き URL を発行することを検討してください。
