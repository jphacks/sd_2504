# Co-食 (こしょく)

React Native / Expo implementation draft that follows the provided requirements specification for the Co-食 Well-being application. The project currently focuses on an offline-first simulation so that the UX and feature flow can be appreciated before connecting a real backend.

## Team Onboarding (必ず共有)

1. Node.js を `nvm use` で `.nvmrc` (Node 20 LTS) に合わせる  
2. 依存関係は `npm ci` で再構築（`node_modules/` は Git 管理しない）  
3. `cp .env.example .env` で環境変数を用意し、Firebase キーなどを記入する  
4. Expo を起動する際は `npm run start` もしくは `npx expo start`  
5. うまく動かない場合は `npx expo-doctor` や `npm run start -- --clear` でキャッシュをクリア

Why `npm install`/`npm ci` locally?  
`package.json` と `package-lock.json` を Git で共有し、各開発者がローカルで依存関係をインストールするのが Node プロジェクトの標準的な運用です。`node_modules/` をコミットしないことで、環境差分が起こっても必要なモジュールを再構築でき、Expo のローカル CLI も自動的に導入されます。

チーム全体のワークフローや PR テンプレート案など、詳細な運用手順は `docs/team-setup.md` を参照してください。

## Getting Started

```bash
npm ci
npm run ios   # or npm run android / npm run web
```

The app relies on Expo modules for navigation, camera access, and AV playback. Ensure the Expo CLI is installed globally or use `npx expo`.

## Project Structure

```
co-shoku/
├── App.tsx
├── src/
│   ├── components/        # Shared UI atoms (buttons, containers, chips)
│   ├── constants/         # Static data (categories, tutorial slides, BGM, report reasons)
│   ├── context/           # Global app state (AppContext)
│   ├── navigation/        # React Navigation stacks
│   ├── screens/           # Screen implementations for all required flows
│   ├── services/          # Firebase integration placeholders
│   └── utils/             # Date/time helpers (JST reset logic, timers)
```

## Key Implementation Notes

- **Navigation flow** mirrors the requirement document: splash → auth → tutorial (first launch) → home, with gated access to timeline, dining room, and one-on-one talk.
- **App state** lives in `AppContext`, which simulates authentication, posting, unlock windows, miracle match scoring, and food history aggregation. This is the primary point to integrate Firebase Authentication, Firestore, Storage, and Realtime Database calls.
- **Posting restrictions** (3 posts/day, JST 2:00 reset) and the one-hour feature unlock window are enforced in context utilities.
- **Media handling** uses Expo Camera/Image Picker to fetch an image before category selection.
- **Realtime features** (timeline, dining room, one-on-one talk) are stubbed with deterministic UI to make UX reviews possible until WebRTC / Realtime DB plumbing is wired.
- **My Page** aggregates the last 30 days of history, renders a bar-graph placeholder instead of a pie chart, and exposes the recommendation algorithm from the specs.
- **Reporting** flows to a dedicated screen where reasons can be selected; collected reports are stored locally for now.

### Data Model Overview

The following TypeScript types (see `src/types`) mirror the requirement spec and should map 1:1 to Firebase collections:

| Entity | Fields |
| ------ | ------ |
| `User` | `id`, `nickname`, `email`, `miracleMatchPoints`, `createdAt` |
| `Post` | `id`, `userId`, `imageUri`, `category`, `parentCategory`, `postedAt`, `expiresAt` |
| `FoodHistory` | `id`, `userId`, `category`, `parentCategory`, `postedAt` |
| `Report` | `id`, `reporterId`, `reportedUserId`, `reason`, `createdAt` |

`CallMatch` is derived at runtime to indicate opponent category + Miracle Match metadata.

## Firebase Integration Hooks

`src/services/firebase.ts` contains placeholders (`initializeFirebase`, `registerWithFirebase`, `uploadImageToStorage`, etc.) with descriptive warnings. Replace them with actual Firebase SDK calls and wire them into the corresponding methods in `AppContext`.

Suggested mapping:

- Authentication → `registerWithFirebase`, `loginWithFirebase`, `logoutFromFirebase`
- Firestore → `createPostDocument`, user profile reads, miracle match updates
- Storage → `uploadImageToStorage` for photos
- Realtime Database / WebRTC → online dining room + one-on-one talking features

## Next Steps

1. Replace context stubs with production-grade Firebase implementations and persist auth state (e.g., SecureStore).
2. Swap the My Page placeholder bar chart for a proper pie chart using `react-native-svg`/`victory-native` or Recharts.
3. Implement real timeline feeds and presence with Firestore queries and Realtime Database subscriptions.
4. Integrate WebRTC (e.g., `react-native-webrtc`) for video streams in dining / call screens.
5. Harden permission handling, add analytics, and prepare production builds for iOS/Android.
