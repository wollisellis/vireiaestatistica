'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { useFirebaseAuth, useFirebaseProfile } from '@/hooks/useFirebaseAuth';
import { User } from '@/lib/firebase';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signInWithGoogle: (role: 'student' | 'professor') => Promise<any>;
  signUp: (email: string, password: string, fullName: string, role: 'professor' | 'student', courseCode?: string) => Promise<any>;
  signOut: () => Promise<any>;
  enableGuestMode: () => void;
  getUserByEmail: (email: string) => Promise<User | null>;
  updateProfile: (updates: Partial<User>) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const firebaseAuth = useFirebaseAuth();
  const { profile, loading: profileLoading, updateProfile } = useFirebaseProfile(firebaseAuth.user?.uid || '');
  
  const contextValue: AuthContextType = {
    user: firebaseAuth.user,
    profile,
    loading: firebaseAuth.loading || profileLoading,
    signIn: firebaseAuth.signIn,
    signInWithGoogle: firebaseAuth.signInWithGoogle,
    signUp: firebaseAuth.signUp,
    signOut: firebaseAuth.signOut,
    enableGuestMode: firebaseAuth.enableGuestMode,
    getUserByEmail: firebaseAuth.getUserByEmail,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Extended hook for user data with role
export function useAuthWithRole() {
  const { user, profile, loading } = useAuth();
  
  return {
    user: user ? {
      ...user,
      role: profile?.role || 'student',
      anonymousId: profile?.anonymousId,
      fullName: profile?.fullName || user.displayName || 'Usuário'
    } : null,
    loading,
    isAuthenticated: !!user,
    isProfessor: profile?.role === 'professor',
    isStudent: profile?.role === 'student'
  };
}