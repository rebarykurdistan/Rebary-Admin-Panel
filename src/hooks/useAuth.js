// NEW 4


'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userAccess, setUserAccess] = useState(null); // granular access object
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        const role = tokenResult.claims.role || null;

        // Load access object from users_new
        let access = null;
        try {
          const userDoc = await getDoc(doc(db, 'users_new', firebaseUser.uid));
          if (userDoc.exists()) {
            access = userDoc.data().access || null;
          }
        } catch (e) {
          // super_admin may not have an access object — that's fine
        }

        setUser(firebaseUser);
        setUserRole(role);
        setUserAccess(access);
      } else {
        setUser(null);
        setUserRole(null);
        setUserAccess(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const tokenResult = await firebaseUser.getIdTokenResult(true);
      const role = tokenResult.claims.role;

      if (!role) {
        await firebaseSignOut(auth);
        throw new Error('No role assigned. Contact administrator.');
      }

      // Check users_new collection
      const userDoc = await getDoc(doc(db, 'users_new', firebaseUser.uid));

      if (!userDoc.exists() && role !== 'super_admin') {
        await firebaseSignOut(auth);
        throw new Error('Account not found. Contact administrator.');
      }

      if (userDoc.exists() && userDoc.data().disabled === true) {
        await firebaseSignOut(auth);
        throw new Error('Your account has been disabled. Contact administrator.');
      }

      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';

      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
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
      toast.error('Logout failed');
    }
  };

  // ── Role hierarchy check ──────────────────────────────
  const hasRole = (requiredRole) => {
    if (!userRole) return false;
    const hierarchy = { super_admin: 3, admin: 2, editor: 1 };
    return (hierarchy[userRole] || 0) >= (hierarchy[requiredRole] || 0);
  };

  // ── Collection-level access (for sidebar/page visibility) ─
  const canAccess = (collection) => {
    if (!userRole) return false;
    const permissions = {
      super_admin: ['services_new', 'categories_new', 'tags_new'],
      admin:       ['services_new', 'categories_new'],
      editor:      ['services_new'],
    };
    return permissions[userRole]?.includes(collection) || false;
  };

  // ── Granular: can user read/see this specific category? ──
  const canAccessCategory = (categoryId) => {
    if (!userRole) return false;
    if (userRole === 'super_admin') return true;
    if (userRole === 'editor') return false; // editors never see categories page
    // admin
    if (!userAccess) return false;
    // Fix #6: check excludedCategories even when allCategories=true
    const excludedCats = userAccess.excludedCategories || [];
    if (userAccess.allCategories) return !excludedCats.includes(categoryId);
    return userAccess.categories?.includes(categoryId) || false;
  };

  // ── Safely extract category ID from any format ───────────
  // categoryref can be: a string "categories_new/ID", a plain ID string,
  // or a Firestore DocumentReference object ({ id, path, ... })
  const extractCatId = (categoryRef) => {
    if (!categoryRef) return null;
    // Firestore DocumentReference has an .id property
    if (typeof categoryRef === 'object' && categoryRef.id) return categoryRef.id;
    // Firestore DocumentReference may also have a .path like "categories_new/ID"
    if (typeof categoryRef === 'object' && categoryRef.path) {
      return categoryRef.path.split('/').pop();
    }
    // Plain string: "categories_new/ID" or just "ID"
    if (typeof categoryRef === 'string') {
      return categoryRef.includes('/') ? categoryRef.split('/').pop() : categoryRef;
    }
    return null;
  };

  // ── Granular: can user read/see this specific service? ───
  const canAccessService = (serviceId, categoryRef) => {
    if (!userRole) return false;
    if (userRole === 'super_admin') return true;
    if (!userAccess) return false;

    // Always check exclusions first — explicitly excluded = deny regardless of other rules
    const excluded = userAccess.excludedServices || [];
    if (serviceId && excluded.includes(serviceId)) return false;

    if (userAccess.allServices) return true;
    if (serviceId && userAccess.services?.includes(serviceId)) return true;

    // Allow if service belongs to an allowed category (also check excluded categories)
    const catId = extractCatId(categoryRef);
    if (catId) {
      const excludedCats = userAccess.excludedCategories || [];
      if (userAccess.allCategories && !excludedCats.includes(catId)) return true;
      // Fix #7: only grant category-inherited access if category itself is not excluded
      if (userAccess.categories?.includes(catId) && !excludedCats.includes(catId)) return true;
    }
    return false;
  };

  const value = {
    user,
    userRole,
    userAccess,
    loading,
    signIn,
    signOut,
    hasRole,
    canAccess,
    canAccessCategory,
    canAccessService,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};