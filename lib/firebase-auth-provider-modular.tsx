import React, { createContext, useContext } from 'react';
import { useFirebaseAuth } from '@/hooks/use-firebase-auth-modular';

interface FirebaseAuthContextType {
  user: any;
  profile: any;
  loading: boolean;
  error: string | null;
  signup: (email: string, password: string, displayName: string, age?: number, gender?: string, address?: string, occupation?: string) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (updates: any) => Promise<any>;
  isAuthenticated: boolean;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | undefined>(undefined);

export function FirebaseAuthProviderModular({ children }: { children: React.ReactNode }) {
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
    throw new Error('useFirebaseAuthContext must be used within FirebaseAuthProviderModular');
  }
  return context;
}
