import { useEffect, useState, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import * as SecureStore from "expo-secure-store";

export interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
  age: number | null;
  gender: string | null;
  address: string | null;
  occupation: string | null;
  role: "admin" | "planner" | "user";
  createdAt: Date;
  updatedAt: Date;
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auth状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setLoading(true);
        if (firebaseUser) {
          setFirebaseUser(firebaseUser);
          // Firestoreからユーザープロフィールを取得
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: userData.name || null,
              age: userData.age || null,
              gender: userData.gender || null,
              address: userData.address || null,
              occupation: userData.occupation || null,
              role: (userData.role || "user") as "admin" | "planner" | "user",
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
            });
          } else {
            // 新規ユーザーの場合、デフォルトプロフィールを作成
            const defaultProfile = {
              email: firebaseUser.email,
              name: null,
              age: null,
              gender: null,
              address: null,
              occupation: null,
              role: "user",
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            await setDoc(userDocRef, defaultProfile);
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: null,
              age: null,
              gender: null,
              address: null,
              occupation: null,
              role: "user" as const,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        } else {
          setUser(null);
          setFirebaseUser(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "認証エラーが発生しました");
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // 新規登録
  const signUp = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        setError(null);
        const result = await createUserWithEmailAndPassword(auth, email, password);

        // Firestoreにユーザープロフィールを作成
        const userDocRef = doc(db, "users", result.user.uid);
        await setDoc(userDocRef, {
          email,
          name,
          age: null,
          gender: null,
          address: null,
          occupation: null,
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return result.user;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "登録に失敗しました";
        setError(errorMessage);
        throw err;
      }
    },
    []
  );

  // ログイン
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result.user;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "ログインに失敗しました";
      setError(errorMessage);
      throw err;
    }
  }, []);

  // ログアウト
  const logout = useCallback(async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "ログアウトに失敗しました";
      setError(errorMessage);
      throw err;
    }
  }, []);

  // ユーザープロフィール更新
  const updateProfile = useCallback(
    async (updates: Partial<Omit<UserProfile, "uid" | "email" | "createdAt">>) => {
      if (!firebaseUser) throw new Error("ユーザーがログインしていません");

      try {
        setError(null);
        const userDocRef = doc(db, "users", firebaseUser.uid);
        await setDoc(
          userDocRef,
          {
            ...updates,
            updatedAt: new Date(),
          },
          { merge: true }
        );

        // ローカル状態を更新
        setUser((prev) =>
          prev
            ? {
                ...prev,
                ...updates,
                updatedAt: new Date(),
              }
            : null
        );
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "プロフィール更新に失敗しました";
        setError(errorMessage);
        throw err;
      }
    },
    [firebaseUser]
  );

  return {
    user,
    firebaseUser,
    loading,
    error,
    isAuthenticated: !!firebaseUser,
    signUp,
    signIn,
    logout,
    updateProfile,
  };
}
