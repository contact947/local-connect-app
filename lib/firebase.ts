import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Firebase設定
// 注意: 本番環境ではこれらの値を環境変数から取得してください
const firebaseConfig = {
  apiKey: "AIzaSyDemoKey123456789", // 開発用ダミーキー
  authDomain: "local-connect-app.firebaseapp.com",
  projectId: "local-connect-app",
  storageBucket: "local-connect-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
};

// Firebase初期化
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Auth と Firestore の初期化
export const auth = getAuth(app);
export const db = getFirestore(app);

// 開発環境でエミュレーターを使用する場合
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  try {
    // Auth エミュレーター
    if (window.location.hostname === "localhost") {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
    }
  } catch (error) {
    // エミュレーターは既に接続済み
  }
}

export default app;
