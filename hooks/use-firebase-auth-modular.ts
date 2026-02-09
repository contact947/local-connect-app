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
import { doc, setDoc, getDoc, FirestoreError } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

/**
 * ネットワークエラーかどうかを判定
 */
function isNetworkError(error: unknown): boolean {
  if (error instanceof FirestoreError) {
    return error.code === 'unavailable' || 
           error.message.includes('offline') ||
           error.message.includes('network');
  }
  if (error instanceof Error) {
    return error.message.includes('network') ||
           error.message.includes('offline') ||
           error.message.includes('unavailable');
  }
  return false;
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
          // Firestore からプロフィール取得を試みる
          try {
            const profileDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (profileDoc.exists()) {
              const profileData = profileDoc.data() as UserProfile;
              setProfile(profileData);
              // キャッシュに保存
              await AsyncStorage.setItem(`user_profile_${currentUser.uid}`, JSON.stringify(profileData));
            }
          } catch (firestoreError) {
            console.warn("Error fetching profile from Firestore:", firestoreError);
            
            // ネットワークエラーの場合、ローカルキャッシュから取得
            if (isNetworkError(firestoreError)) {
              try {
                const cachedProfile = await AsyncStorage.getItem(`user_profile_${currentUser.uid}`);
                if (cachedProfile) {
                  console.log("Using cached profile on auth state change");
                  setProfile(JSON.parse(cachedProfile) as UserProfile);
                }
              } catch (cacheError) {
                console.warn("Error reading cache:", cacheError);
              }
            } else {
              // その他のエラーは無視（プロフィール未作成の可能性）
              console.warn("Profile not found or other error:", firestoreError);
            }
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

      try {
        await setDoc(doc(db, 'users', newUser.uid), userProfile);
        // キャッシュに保存
        await AsyncStorage.setItem(`user_profile_${newUser.uid}`, JSON.stringify(userProfile));
      } catch (firestoreError) {
        console.warn("Error saving profile to Firestore:", firestoreError);
        if (!isNetworkError(firestoreError)) {
          throw firestoreError;
        }
        // ネットワークエラーの場合はキャッシュのみに保存
        await AsyncStorage.setItem(`user_profile_${newUser.uid}`, JSON.stringify(userProfile));
      }

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

      // Firestore からプロフィール取得を試みる
      try {
        const profileDoc = await getDoc(doc(db, 'users', loginUser.uid));
        if (profileDoc.exists()) {
          const profileData = profileDoc.data() as UserProfile;
          setProfile(profileData);
          // キャッシュに保存
          await AsyncStorage.setItem(`user_profile_${loginUser.uid}`, JSON.stringify(profileData));
        }
      } catch (firestoreError) {
        console.warn("Error fetching profile during login:", firestoreError);
        
        // ネットワークエラーの場合、ローカルキャッシュから取得
        if (isNetworkError(firestoreError)) {
          try {
            const cachedProfile = await AsyncStorage.getItem(`user_profile_${loginUser.uid}`);
            if (cachedProfile) {
              console.log("Using cached profile during login");
              setProfile(JSON.parse(cachedProfile) as UserProfile);
            }
          } catch (cacheError) {
            console.warn("Error reading cache:", cacheError);
          }
        }
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
      
      try {
        await setDoc(doc(db, 'users', user.uid), updatedProfile);
        // キャッシュに保存
        await AsyncStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(updatedProfile));
      } catch (firestoreError) {
        console.warn("Error updating profile in Firestore:", firestoreError);
        if (!isNetworkError(firestoreError)) {
          throw firestoreError;
        }
        // ネットワークエラーの場合はキャッシュのみに保存
        await AsyncStorage.setItem(`user_profile_${user.uid}`, JSON.stringify(updatedProfile));
      }

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
