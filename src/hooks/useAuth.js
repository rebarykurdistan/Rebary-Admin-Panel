// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';
// import { 
//   onAuthStateChanged, 
//   signInWithEmailAndPassword, 
//   signOut as firebaseSignOut 
// } from 'firebase/auth';
// import { auth } from '../lib/firebase';
// import { useRouter } from 'next/navigation';
// import toast from 'react-hot-toast';

// const AuthContext = createContext({});

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [userRole, setUserRole] = useState(null);
//   const router = useRouter();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         // Get user's custom claims (role)
//         const tokenResult = await user.getIdTokenResult();
//         const role = tokenResult.claims.role || null;
        
//         setUser(user);
//         setUserRole(role);
//       } else {
//         setUser(null);
//         setUserRole(null);
//       }
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   const signIn = async (email, password) => {
//     try {
//       setLoading(true);
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
//       // Get role from custom claims
//       const tokenResult = await userCredential.user.getIdTokenResult();
//       const role = tokenResult.claims.role;
      
//       if (!role) {
//         await firebaseSignOut(auth);
//         throw new Error('No role assigned. Contact administrator.');
//       }
      
//       toast.success('Login successful!');
//       router.push('/dashboard');
//     } catch (error) {
//       console.error('Login error:', error);
//       let errorMessage = 'Login failed. Please try again.';
      
//       if (error.code === 'auth/user-not-found') {
//         errorMessage = 'No user found with this email.';
//       } else if (error.code === 'auth/wrong-password') {
//         errorMessage = 'Incorrect password.';
//       } else if (error.code === 'auth/invalid-email') {
//         errorMessage = 'Invalid email address.';
//       } else if (error.message) {
//         errorMessage = error.message;
//       }
      
//       toast.error(errorMessage);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const signOut = async () => {
//     try {
//       await firebaseSignOut(auth);
//       toast.success('Logged out successfully');
//       router.push('/login');
//     } catch (error) {
//       console.error('Logout error:', error);
//       toast.error('Logout failed');
//     }
//   };

//   // Check if user has specific role
//   const hasRole = (requiredRole) => {
//     if (!userRole) return false;
    
//     const roleHierarchy = {
//       'super_admin': 3,
//       'admin': 2,
//       'editor': 1,
//     };
    
//     return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
//   };

//   // Check if user can access specific collection
//   const canAccess = (collection) => {
//     if (!userRole) return false;
    
//     const permissions = {
//       'super_admin': ['services_new', 'categories_new', 'tags_new'],
//       'admin': ['services_new', 'categories_new'],
//       'editor': ['services_new'],
//     };
    
//     return permissions[userRole]?.includes(collection) || false;
//   };

//   const value = {
//     user,
//     userRole,
//     loading,
//     signIn,
//     signOut,
//     hasRole,
//     canAccess,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };





///////////////////////////////////////




// 'use client';

// import { createContext, useContext, useEffect, useState } from 'react';
// import { 
//   onAuthStateChanged, 
//   signInWithEmailAndPassword, 
//   signOut as firebaseSignOut 
// } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';
// import { auth, db } from '../lib/firebase';
// import { useRouter } from 'next/navigation';
// import toast from 'react-hot-toast';

// const AuthContext = createContext({});

// export const useAuth = () => useContext(AuthContext);

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [userRole, setUserRole] = useState(null);
//   const router = useRouter();

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, async (user) => {
//       if (user) {
//         try {
//           // Check if user exists in Firestore
//           const userDocRef = doc(db, 'users_new', user.uid);
//           const userDocSnap = await getDoc(userDocRef);
          
//           if (!userDocSnap.exists()) {
//             // User not in Firestore - only allow super admin
//             if (user.uid === process.env.NEXT_PUBLIC_SUPER_ADMIN_UID) {
//               // Super admin - allow access
//               const tokenResult = await user.getIdTokenResult();
//               const role = tokenResult.claims.role || null;
//               setUser(user);
//               setUserRole(role);
//             } else {
//               // Regular user not in database - deny access
//               await firebaseSignOut(auth);
//               toast.error('User not found in database. Contact administrator.');
//               setUser(null);
//               setUserRole(null);
//             }
//           } else {
//             // User exists in Firestore
//             const userData = userDocSnap.data();
            
//             if (userData.disabled) {
//               await firebaseSignOut(auth);
//               toast.error('This account has been disabled.');
//               setUser(null);
//               setUserRole(null);
//             } else {
//               // Get role from custom claims
//               const tokenResult = await user.getIdTokenResult();
//               const role = tokenResult.claims.role || userData.role;
              
//               setUser(user);
//               setUserRole(role);
//             }
//           }
//         } catch (error) {
//           console.error('Error checking user:', error);
//           // If Firestore check fails, fallback to checking custom claims only
//           const tokenResult = await user.getIdTokenResult();
//           const role = tokenResult.claims.role || null;
//           setUser(user);
//           setUserRole(role);
//         }
//       } else {
//         setUser(null);
//         setUserRole(null);
//       }
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   const signIn = async (email, password) => {
//     try {
//       setLoading(true);
//       const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
//       // Check if user exists in Firestore (except super admin)
//       if (userCredential.user.uid !== process.env.NEXT_PUBLIC_SUPER_ADMIN_UID) {
//         const userDocRef = doc(db, 'users_new', userCredential.user.uid);
//         const userDocSnap = await getDoc(userDocRef);
        
//         if (!userDocSnap.exists()) {
//           await firebaseSignOut(auth);
//           throw new Error('User not found in database. Contact administrator.');
//         }
        
//         const userData = userDocSnap.data();
//         if (userData.disabled) {
//           await firebaseSignOut(auth);
//           throw new Error('This account has been disabled.');
//         }
//       }
      
//       // Get role from custom claims
//       const tokenResult = await userCredential.user.getIdTokenResult();
//       const role = tokenResult.claims.role;
      
//       if (!role) {
//         await firebaseSignOut(auth);
//         throw new Error('No role assigned. Contact administrator.');
//       }
      
//       toast.success('Login successful!');
//       router.push('/dashboard');
//     } catch (error) {
//       console.error('Login error:', error);
//       let errorMessage = 'Login failed. Please try again.';
      
//       if (error.code === 'auth/user-not-found') {
//         errorMessage = 'No user found with this email.';
//       } else if (error.code === 'auth/wrong-password') {
//         errorMessage = 'Incorrect password.';
//       } else if (error.code === 'auth/invalid-email') {
//         errorMessage = 'Invalid email address.';
//       } else if (error.message) {
//         errorMessage = error.message;
//       }
      
//       toast.error(errorMessage);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const signOut = async () => {
//     try {
//       await firebaseSignOut(auth);
//       toast.success('Logged out successfully');
//       router.push('/login');
//     } catch (error) {
//       console.error('Logout error:', error);
//       toast.error('Logout failed');
//     }
//   };

//   // Check if user has specific role
//   const hasRole = (requiredRole) => {
//     if (!userRole) return false;
    
//     const roleHierarchy = {
//       'super_admin': 3,
//       'admin': 2,
//       'editor': 1,
//     };
    
//     return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
//   };

//   // Check if user can access specific collection
//   const canAccess = (collection) => {
//     if (!userRole) return false;
    
//     const permissions = {
//       'super_admin': ['services_new', 'categories_new', 'tags_new'],
//       'admin': ['services_new', 'categories_new'],
//       'editor': ['services_new'],
//     };
    
//     return permissions[userRole]?.includes(collection) || false;
//   };

//   const value = {
//     user,
//     userRole,
//     loading,
//     signIn,
//     signOut,
//     hasRole,
//     canAccess,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };











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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Force refresh token to get latest custom claims
        const tokenResult = await firebaseUser.getIdTokenResult(true);
        const role = tokenResult.claims.role || null;

        setUser(firebaseUser);
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
      const firebaseUser = userCredential.user;

      // Force refresh token to get latest custom claims
      const tokenResult = await firebaseUser.getIdTokenResult(true);
      const role = tokenResult.claims.role;

      if (!role) {
        await firebaseSignOut(auth);
        throw new Error('No role assigned. Contact administrator.');
      }

      // Check users_new collection — user must exist and not be disabled
      const userDoc = await getDoc(doc(db, 'users_new', firebaseUser.uid));

      // Super admin is allowed even if not in users_new (bootstrapped via set-role.js)
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
      console.error('Logout error:', error);
      toast.error('Logout failed');
    }
  };

  // Check if user has specific role or higher
  const hasRole = (requiredRole) => {
    if (!userRole) return false;

    const roleHierarchy = {
      'super_admin': 3,
      'admin': 2,
      'editor': 1,
    };

    return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0);
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