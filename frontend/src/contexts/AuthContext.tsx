'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updateEmail,
  updatePassword,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  updateUserEmail: (newEmail: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            createdAt: userData.createdAt?.toDate() || new Date(),
            updatedAt: userData.updatedAt?.toDate() || new Date(),
          });
        } else {
          // Create user document if it doesn't exist
          const newUser: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(firebaseUser, { displayName });
    
    const newUser: User = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName,
      photoURL: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) throw new Error('No user logged in');
    
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) throw new Error('No Firebase user found');

    // Update Firebase Auth profile
    if (updates.displayName !== undefined) {
      await updateProfile(firebaseUser, { displayName: updates.displayName });
    }

    // Update Firestore document
    await updateDoc(doc(db, 'users', user.uid), {
      ...updates,
      updatedAt: new Date(),
    });

    setUser(prev => prev ? { ...prev, ...updates, updatedAt: new Date() } : null);
  };

  const updateUserEmail = async (newEmail: string) => {
    if (!auth.currentUser) throw new Error('No user logged in');
    await updateEmail(auth.currentUser, newEmail);
    await updateUserProfile({ email: newEmail });
  };

  const updateUserPassword = async (newPassword: string) => {
    if (!auth.currentUser) throw new Error('No user logged in');
    await updatePassword(auth.currentUser, newPassword);
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    updateUserProfile,
    updateUserEmail,
    updateUserPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
