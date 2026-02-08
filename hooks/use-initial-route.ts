import { useEffect } from "react";
import { useFirebaseAuthContext } from "@/lib/firebase-auth-provider-modular";
import { router } from "expo-router";

/**
 * 初期起動時のルーティングを管理するフック
 * - 未ログイン: 会員登録画面へ
 * - ログイン済み: ホームタブへ
 */
export function useInitialRoute() {
  const { isAuthenticated, loading } = useFirebaseAuthContext();

  useEffect(() => {
    if (loading) return;

    // 未ログイン時は会員登録画面へ
    if (!isAuthenticated) {
      router.replace("/auth/signup" as any);
    }
  }, [isAuthenticated, loading]);
}
