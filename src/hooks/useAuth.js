'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get user's custom claims (role)
        const tokenResult = await user.getIdTokenResult();
        const role = tokenResult.claims.role || null;
        
        setUser(user);
        setUserRole(role);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get role from custom claims
      const tokenResult = await userCredential.user.getIdTokenResult();
      const role = tokenResult.claims.role;
      
      if (!role) {
        await firebaseSignOut(auth);
        throw new Error('No role assigned. Contact administrator.');
      }
      
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  // Check if user has specific role
  const hasRole = (requiredRole) => {
    if (!userRole) return false;
    
    const roleHierarchy = {
      'super_admin': 3,
      'admin': 2,
      'editor': 1,
    };
    
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  };

  // Check if user can access specific collection
  const canAccess = (collection) => {
    if (!userRole) return false;
    
    const permissions = {
      'super_admin': ['services_new', 'categories_new', 'tags_new'],
      'admin': ['services_new', 'categories_new'],
      'editor': ['services_new'],
    };
    
    return permissions[userRole]?.includes(collection) || false;
  };

  const value = {
    user,
    userRole,
    loading,
    signIn,
    signOut,
    hasRole,
    canAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
