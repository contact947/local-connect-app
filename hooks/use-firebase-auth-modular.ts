import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase-modular';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  age?: number;
  gender?: string;
  address?: string;
  occupation?: string;
  role: 'user' | 'planner' | 'admin';
  createdAt: Date;
}

export function useFirebaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 認証状態の監視
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      try {
        setUser(currentUser);
        if (currentUser) {
          // Firestore からプロフィール取得
          const profileDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (profileDoc.exists()) {
            setProfile(profileDoc.data() as UserProfile);
          }
        } else {
          setProfile(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // サインアップ
  const signup = async (
    email: string,
    password: string,
    displayName: string,
    age?: number,
    gender?: string,
    address?: string,
    occupation?: string
  ) => {
    try {
      setError(null);
      setLoading(true);

      // Firebase Authentication でユーザー作成
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Firestore にプロフィール保存
      const userProfile: UserProfile = {
        uid: newUser.uid,
        email: newUser.email || '',
        displayName,
        age,
        gender,
        address,
        occupation,
        role: 'user', // デフォルトロール
        createdAt: new Date(),
      };

      await setDoc(doc(db, 'users', newUser.uid), userProfile);
      setProfile(userProfile);
      return newUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ログイン
  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);

      // ローカルストレージに認証情報を保持
      await setPersistence(auth, browserLocalPersistence);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loginUser = userCredential.user;

      // Firestore からプロフィール取得
      const profileDoc = await getDoc(doc(db, 'users', loginUser.uid));
      if (profileDoc.exists()) {
        setProfile(profileDoc.data() as UserProfile);
      }

      return loginUser;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ログアウト
  const logout = async () => {
    try {
      setError(null);
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw err;
    }
  };

  // プロフィール更新
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      setError(null);
      setLoading(true);

      const updatedProfile = { ...profile, ...updates } as UserProfile;
      await setDoc(doc(db, 'users', user.uid), updatedProfile);
      setProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Update failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    loading,
    error,
    signup,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };
}
