// const functions = require('firebase-functions');
// const admin = require('firebase-admin');

// admin.initializeApp();

// // ============================================
// // CREATE USER WITH ROLE
// // ============================================
// exports.createUserWithRole = functions.https.onCall(async (data, context) => {
//   // Verify caller is authenticated and is super admin
//   if (!context.auth) {
//     throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
//   }

//   // Get caller's custom claims
//   const callerToken = await admin.auth().getUser(context.auth.uid);
//   const callerClaims = callerToken.customClaims || {};

//   if (callerClaims.role !== 'super_admin') {
//     throw new functions.https.HttpsError(
//       'permission-denied',
//       'Only super admins can create users'
//     );
//   }

//   const { email, password, role } = data;

//   // Validate input
//   if (!email || !password || !role) {
//     throw new functions.https.HttpsError(
//       'invalid-argument',
//       'Email, password, and role are required'
//     );
//   }

//   if (!['super_admin', 'admin', 'editor'].includes(role)) {
//     throw new functions.https.HttpsError(
//       'invalid-argument',
//       'Invalid role. Must be super_admin, admin, or editor'
//     );
//   }

//   if (password.length < 6) {
//     throw new functions.https.HttpsError(
//       'invalid-argument',
//       'Password must be at least 6 characters'
//     );
//   }

//   try {
//     // Create user in Firebase Auth
//     const userRecord = await admin.auth().createUser({
//       email: email,
//       password: password,
//       emailVerified: false,
//     });

//     // Set custom claims for role
//     await admin.auth().setCustomUserClaims(userRecord.uid, { role: role });

//     // Return success
//     return {
//       success: true,
//       uid: userRecord.uid,
//       email: email,
//       role: role,
//       message: `User created successfully with role: ${role}`,
//     };
//   } catch (error) {
//     console.error('Error creating user:', error);
//     throw new functions.https.HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // UPDATE USER ROLE
// // ============================================
// exports.updateUserRole = functions.https.onCall(async (data, context) => {
//   // Verify caller is authenticated and is super admin
//   if (!context.auth) {
//     throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
//   }

//   const callerToken = await admin.auth().getUser(context.auth.uid);
//   const callerClaims = callerToken.customClaims || {};

//   if (callerClaims.role !== 'super_admin') {
//     throw new functions.https.HttpsError(
//       'permission-denied',
//       'Only super admins can update user roles'
//     );
//   }

//   const { uid, role } = data;

//   if (!uid || !role) {
//     throw new functions.https.HttpsError(
//       'invalid-argument',
//       'UID and role are required'
//     );
//   }

//   if (!['super_admin', 'admin', 'editor'].includes(role)) {
//     throw new functions.https.HttpsError(
//       'invalid-argument',
//       'Invalid role. Must be super_admin, admin, or editor'
//     );
//   }

//   try {
//     // Update custom claims
//     await admin.auth().setCustomUserClaims(uid, { role: role });

//     // Get updated user info
//     const userRecord = await admin.auth().getUser(uid);

//     return {
//       success: true,
//       uid: uid,
//       email: userRecord.email,
//       role: role,
//       message: 'User role updated successfully',
//     };
//   } catch (error) {
//     console.error('Error updating user role:', error);
//     throw new functions.https.HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // DELETE USER
// // ============================================
// exports.deleteUser = functions.https.onCall(async (data, context) => {
//   // Verify caller is authenticated and is super admin
//   if (!context.auth) {
//     throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
//   }

//   const callerToken = await admin.auth().getUser(context.auth.uid);
//   const callerClaims = callerToken.customClaims || {};

//   if (callerClaims.role !== 'super_admin') {
//     throw new functions.https.HttpsError(
//       'permission-denied',
//       'Only super admins can delete users'
//     );
//   }

//   const { uid } = data;

//   if (!uid) {
//     throw new functions.https.HttpsError('invalid-argument', 'UID is required');
//   }

//   // Prevent deleting self
//   if (uid === context.auth.uid) {
//     throw new functions.https.HttpsError(
//       'permission-denied',
//       'Cannot delete your own account'
//     );
//   }

//   try {
//     // Get user info before deletion
//     const userRecord = await admin.auth().getUser(uid);
//     const email = userRecord.email;

//     // Delete user
//     await admin.auth().deleteUser(uid);

//     return {
//       success: true,
//       uid: uid,
//       email: email,
//       message: 'User deleted successfully',
//     };
//   } catch (error) {
//     console.error('Error deleting user:', error);
//     throw new functions.https.HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // LIST ALL ADMIN USERS
// // ============================================
// exports.listAdminUsers = functions.https.onCall(async (data, context) => {
//   // Verify caller is authenticated and is super admin
//   if (!context.auth) {
//     throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
//   }

//   const callerToken = await admin.auth().getUser(context.auth.uid);
//   const callerClaims = callerToken.customClaims || {};

//   if (callerClaims.role !== 'super_admin') {
//     throw new functions.https.HttpsError(
//       'permission-denied',
//       'Only super admins can list users'
//     );
//   }

//   try {
//     const listUsersResult = await admin.auth().listUsers(1000); // Max 1000 users

//     const users = listUsersResult.users.map(user => ({
//       uid: user.uid,
//       email: user.email,
//       role: user.customClaims?.role || null,
//       emailVerified: user.emailVerified,
//       disabled: user.disabled,
//       creationTime: user.metadata.creationTime,
//       lastSignInTime: user.metadata.lastSignInTime,
//     }));

//     // Filter only users with roles (admin users)
//     const adminUsers = users.filter(user => user.role);

//     return {
//       success: true,
//       users: adminUsers,
//       count: adminUsers.length,
//     };
//   } catch (error) {
//     console.error('Error listing users:', error);
//     throw new functions.https.HttpsError('internal', error.message);
//   }
// });


const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require('firebase-admin');

admin.initializeApp();

// ============================================
// CREATE USER WITH ROLE
// ============================================
exports.createUserWithRole = onCall({ cors: true }, async (request) => {
  const { data, auth } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const callerToken = await admin.auth().getUser(auth.uid);
  const callerClaims = callerToken.customClaims || {};

  if (callerClaims.role !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Only super admins can create users');
  }

  const { email, password, role } = data;

  if (!email || !password || !role) {
    throw new HttpsError('invalid-argument', 'Email, password, and role are required');
  }

  try {
    const userRecord = await admin.auth().createUser({ email, password });
    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    return { success: true, uid: userRecord.uid, email, role };
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});

// ============================================
// UPDATE USER ROLE
// ============================================
exports.updateUserRole = onCall({ cors: true }, async (request) => {
  const { data, auth } = request;

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const callerToken = await admin.auth().getUser(auth.uid);
  if (callerToken.customClaims?.role !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Only super admins can update roles');
  }

  const { uid, role } = data;
  try {
    await admin.auth().setCustomUserClaims(uid, { role });
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

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const callerToken = await admin.auth().getUser(auth.uid);
  if (callerToken.customClaims?.role !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Only super admins can delete users');
  }

  if (data.uid === auth.uid) {
    throw new HttpsError('permission-denied', 'Cannot delete your own account');
  }

  try {
    await admin.auth().deleteUser(data.uid);
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

  if (!auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const callerToken = await admin.auth().getUser(auth.uid);
  if (callerToken.customClaims?.role !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Only super admins can list users');
  }

  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    const adminUsers = listUsersResult.users
      .map(user => ({
        uid: user.uid,
        email: user.email,
        role: user.customClaims?.role || null,
        lastSignInTime: user.metadata.lastSignInTime,
      }))
      .filter(user => user.role);

    return { success: true, users: adminUsers };
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});
