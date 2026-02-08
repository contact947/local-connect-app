import React, { createContext, useContext } from "react";
import { useFirebaseAuth, UserProfile } from "@/hooks/use-firebase-auth";

interface FirebaseAuthContextType {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, name: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<UserProfile, "uid" | "email" | "createdAt">>) => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useFirebaseAuth();

  return (
    <FirebaseAuthContext.Provider value={auth}>
      {children}
    </FirebaseAuthContext.Provider>
  );
}

export function useFirebaseAuthContext() {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error("useFirebaseAuthContext must be used within FirebaseAuthProvider");
  }
  return context;
}
