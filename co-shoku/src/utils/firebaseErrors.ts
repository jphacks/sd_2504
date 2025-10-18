export const getAuthErrorMessage = (code?: string) => {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'このメールアドレスは既に登録されています。ログインをご利用ください。';
    case 'auth/invalid-email':
      return 'メールアドレスの形式が正しくありません。';
    case 'auth/weak-password':
      return 'パスワードは6文字以上で設定してください。';
    case 'auth/network-request-failed':
      return 'ネットワークに接続できませんでした。通信環境をご確認ください。';
    case 'auth/user-not-found':
      return '該当するユーザーが見つかりません。メールアドレスをご確認ください。';
    case 'auth/wrong-password':
      return 'パスワードが正しくありません。';
    case 'auth/too-many-requests':
      return '短時間に多数のリクエストがありました。時間をおいて再度お試しください。';
    default:
      return '処理中にエラーが発生しました。時間をおいて再度お試しください。';
  }
};

