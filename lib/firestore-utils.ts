import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  age?: number;
  gender?: "male" | "female" | "other" | "prefer_not_to_say";
  address?: string;
  prefecture?: string;
  city?: string;
  occupation?: string;
  schoolType?: "high_school" | "university" | "working" | "other";
  role: "admin" | "planner" | "user";
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * ユーザープロフィールを Firestore から取得
 */
export async function getUserProfileFromFirestore(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
}

/**
 * ユーザープロフィールを Firestore に作成
 */
export async function createUserProfileInFirestore(
  uid: string,
  data: Omit<UserProfile, "uid" | "createdAt" | "updatedAt">
): Promise<void> {
  try {
    const now = Timestamp.now();
    const docRef = doc(db, "users", uid);

    await setDoc(docRef, {
      uid,
      ...data,
      role: "user", // デフォルトロール
      createdAt: now,
      updatedAt: now,
    });
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
}

/**
 * ユーザープロフィールを Firestore で更新
 */
export async function updateUserProfileInFirestore(
  uid: string,
  data: Partial<Omit<UserProfile, "uid" | "createdAt">>
): Promise<void> {
  try {
    const docRef = doc(db, "users", uid);
    const now = Timestamp.now();

    await updateDoc(docRef, {
      ...data,
      updatedAt: now,
    });
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

/**
 * メールアドレスからユーザープロフィールを検索
 */
export async function getUserProfileByEmail(email: string): Promise<UserProfile | null> {
  try {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    return querySnapshot.docs[0].data() as UserProfile;
  } catch (error) {
    console.error("Error fetching user profile by email:", error);
    throw error;
  }
}

/**
 * 都道府県からユーザープロフィール一覧を取得
 */
export async function getUserProfilesByPrefecture(prefecture: string): Promise<UserProfile[]> {
  try {
    const q = query(collection(db, "users"), where("prefecture", "==", prefecture));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => doc.data() as UserProfile);
  } catch (error) {
    console.error("Error fetching user profiles by prefecture:", error);
    throw error;
  }
}
