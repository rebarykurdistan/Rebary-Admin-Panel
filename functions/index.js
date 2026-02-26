// const { onCall, HttpsError } = require("firebase-functions/v2/https");
// const admin = require('firebase-admin');

// admin.initializeApp();

// const db = admin.firestore();

// // ============================================
// // CREATE USER WITH ROLE
// // ============================================
// exports.createUserWithRole = onCall({ cors: true }, async (request) => {
//   const { data, auth } = request;

//   if (!auth) {
//     throw new HttpsError('unauthenticated', 'User must be authenticated');
//   }

//   // Force refresh to get latest claims
//   const callerToken = await admin.auth().getUser(auth.uid);
//   const callerClaims = callerToken.customClaims || {};

//   if (callerClaims.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can create users');
//   }

//   const { email, password, role, displayName } = data;

//   if (!email || !password || !role) {
//     throw new HttpsError('invalid-argument', 'Email, password, and role are required');
//   }

//   if (!['super_admin', 'admin', 'editor'].includes(role)) {
//     throw new HttpsError('invalid-argument', 'Invalid role');
//   }

//   if (password.length < 6) {
//     throw new HttpsError('invalid-argument', 'Password must be at least 6 characters');
//   }

//   try {
//     let userRecord;
    
//     try {
//       // Try to create new user
//       userRecord = await admin.auth().createUser({ email, password });
//     } catch (authError) {
//       if (authError.code === 'auth/email-already-exists') {
//         // User exists in Auth but maybe not in Firestore — just get them
//         userRecord = await admin.auth().getUserByEmail(email);
//       } else {
//         throw authError;
//       }
//     }
  
//     // Set/update custom claims
//     await admin.auth().setCustomUserClaims(userRecord.uid, { role });
  
//     // Create or overwrite Firestore doc
//     await db.collection('users_new').doc(userRecord.uid).set({
//       uid: userRecord.uid,
//       email,
//       role,
//       displayName: displayName || '',
//       disabled: false,
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//       createdBy: auth.uid,
//     }, { merge: true }); // merge:true so existing fields aren't wiped
  
//     return { success: true, uid: userRecord.uid, email, role };
//   } catch (error) {
//     console.error('Error creating user:', error);
//     throw new HttpsError('internal', error.message);
//   }


//   // try {
//   //   // 1. Create user in Firebase Auth
//   //   const userRecord = await admin.auth().createUser({ email, password });

//   //   // 2. Set custom claims
//   //   await admin.auth().setCustomUserClaims(userRecord.uid, { role });

//   //   // 3. Create document in users_new collection
//   //   await db.collection('users_new').doc(userRecord.uid).set({
//   //     uid: userRecord.uid,
//   //     email,
//   //     role,
//   //     displayName: displayName || '',
//   //     disabled: false,
//   //     createdAt: admin.firestore.FieldValue.serverTimestamp(),
//   //     createdBy: auth.uid,
//   //   });

//   //   return { success: true, uid: userRecord.uid, email, role };
//   // } catch (error) {
//   //   console.error('Error creating user:', error);
//   //   throw new HttpsError('internal', error.message);
//   // }
// });

// // ============================================
// // UPDATE USER ROLE
// // ============================================
// exports.updateUserRole = onCall({ cors: true }, async (request) => {
//   const { data, auth } = request;

//   if (!auth) {
//     throw new HttpsError('unauthenticated', 'User must be authenticated');
//   }

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can update roles');
//   }

//   const { uid, role } = data;

//   if (!uid || !role) {
//     throw new HttpsError('invalid-argument', 'UID and role are required');
//   }

//   try {
//     // Update custom claims
//     await admin.auth().setCustomUserClaims(uid, { role });

//     // Update Firestore document
//     await db.collection('users_new').doc(uid).update({
//       role,
//       updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//       updatedBy: auth.uid,
//     });

//     return { success: true, message: 'User role updated successfully' };
//   } catch (error) {
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // DELETE USER
// // ============================================
// exports.deleteUser = onCall({ cors: true }, async (request) => {
//   const { data, auth } = request;

//   if (!auth) {
//     throw new HttpsError('unauthenticated', 'User must be authenticated');
//   }

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can delete users');
//   }

//   if (data.uid === auth.uid) {
//     throw new HttpsError('permission-denied', 'Cannot delete your own account');
//   }

//   try {
//     // Delete from Firebase Auth
//     await admin.auth().deleteUser(data.uid);

//     // Delete from Firestore
//     await db.collection('users_new').doc(data.uid).delete();

//     return { success: true, message: 'User deleted successfully' };
//   } catch (error) {
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // LIST ALL ADMIN USERS
// // ============================================
// exports.listAdminUsers = onCall({ cors: true }, async (request) => {
//   const { auth } = request;

//   if (!auth) {
//     throw new HttpsError('unauthenticated', 'User must be authenticated');
//   }

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can list users');
//   }

//   try {
//     const snapshot = await db.collection('users_new').orderBy('createdAt', 'desc').get();
//     const users = snapshot.docs.map(doc => ({
//       uid: doc.id,
//       ...doc.data(),
//       // Convert Firestore timestamps to ISO strings for JSON serialization
//       createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
//       updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
//     }));

//     return { success: true, users };
//   } catch (error) {
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // TOGGLE USER DISABLED STATUS
// // ============================================
// exports.toggleUserDisabled = onCall({ cors: true }, async (request) => {
//   const { data, auth } = request;

//   if (!auth) {
//     throw new HttpsError('unauthenticated', 'User must be authenticated');
//   }

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can disable users');
//   }

//   const { uid, disabled } = data;

//   try {
//     // Update Firebase Auth
//     await admin.auth().updateUser(uid, { disabled });

//     // Update Firestore
//     await db.collection('users_new').doc(uid).update({
//       disabled,
//       updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//     });

//     return { success: true, disabled };
//   } catch (error) {
//     throw new HttpsError('internal', error.message);
//   }
// });





















const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// Helper — get super admin UID from env (set in Firebase Functions config or .env)
// We protect by UID (not email) so it can't be spoofed
const SUPER_ADMIN_UID = process.env.SUPER_ADMIN_UID;

// ============================================
// CREATE USER WITH ROLE
// ============================================
exports.createUserWithRole = onCall({ cors: true }, async (request) => {
  const { data, auth } = request;

  if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

  const callerToken = await admin.auth().getUser(auth.uid);
  const callerClaims = callerToken.customClaims || {};
  if (callerClaims.role !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Only super admins can create users');
  }

  const { email, password, role, displayName } = data;
  if (!email || !password || !role) {
    throw new HttpsError('invalid-argument', 'Email, password, and role are required');
  }
  if (!['super_admin', 'admin', 'editor'].includes(role)) {
    throw new HttpsError('invalid-argument', 'Invalid role');
  }
  if (password.length < 6) {
    throw new HttpsError('invalid-argument', 'Password must be at least 6 characters');
  }

  try {
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({ email, password });
    } catch (authError) {
      if (authError.code === 'auth/email-already-exists') {
        userRecord = await admin.auth().getUserByEmail(email);
      } else {
        throw authError;
      }
    }

    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    await db.collection('users_new').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      role,
      displayName: displayName || '',
      disabled: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: auth.uid,
    }, { merge: true });

    return { success: true, uid: userRecord.uid, email, role };
  } catch (error) {
    console.error('Error creating user:', error);
    throw new HttpsError('internal', error.message);
  }
});

// ============================================
// UPDATE USER ROLE
// ============================================
exports.updateUserRole = onCall({ cors: true }, async (request) => {
  const { data, auth } = request;

  if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

  const callerToken = await admin.auth().getUser(auth.uid);
  if (callerToken.customClaims?.role !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Only super admins can update roles');
  }

  const { uid, role } = data;
  if (!uid || !role) throw new HttpsError('invalid-argument', 'UID and role are required');

  // LAYER 1: Block role change on super admin
  if (SUPER_ADMIN_UID && uid === SUPER_ADMIN_UID) {
    throw new HttpsError('permission-denied', 'The super admin role cannot be changed.');
  }

  try {
    await admin.auth().setCustomUserClaims(uid, { role });
    await db.collection('users_new').doc(uid).update({
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: auth.uid,
    });
    return { success: true, message: 'User role updated successfully' };
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});

// ============================================
// DELETE USER
// ============================================
exports.deleteUser = onCall({ cors: true }, async (request) => {
  const { data, auth } = request;

  if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

  const callerToken = await admin.auth().getUser(auth.uid);
  if (callerToken.customClaims?.role !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Only super admins can delete users');
  }

  if (data.uid === auth.uid) {
    throw new HttpsError('permission-denied', 'Cannot delete your own account');
  }

  // LAYER 1: Block deletion of super admin UID entirely
  if (SUPER_ADMIN_UID && data.uid === SUPER_ADMIN_UID) {
    throw new HttpsError('permission-denied', 'The super admin account cannot be deleted.');
  }

  try {
    await admin.auth().deleteUser(data.uid);
    await db.collection('users_new').doc(data.uid).delete();
    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});

// ============================================
// LIST ALL ADMIN USERS
// ============================================
exports.listAdminUsers = onCall({ cors: true }, async (request) => {
  const { auth } = request;

  if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

  const callerToken = await admin.auth().getUser(auth.uid);
  if (callerToken.customClaims?.role !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Only super admins can list users');
  }

  try {
    const snapshot = await db.collection('users_new').orderBy('createdAt', 'desc').get();
    const users = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
    }));
    return { success: true, users };
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});

// ============================================
// TOGGLE USER DISABLED STATUS
// ============================================
exports.toggleUserDisabled = onCall({ cors: true }, async (request) => {
  const { data, auth } = request;

  if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

  const callerToken = await admin.auth().getUser(auth.uid);
  if (callerToken.customClaims?.role !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Only super admins can disable users');
  }

  // Also block disabling the super admin
  if (SUPER_ADMIN_UID && data.uid === SUPER_ADMIN_UID) {
    throw new HttpsError('permission-denied', 'The super admin account cannot be disabled.');
  }

  const { uid, disabled } = data;
  try {
    await admin.auth().updateUser(uid, { disabled });
    await db.collection('users_new').doc(uid).update({
      disabled,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, disabled };
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});