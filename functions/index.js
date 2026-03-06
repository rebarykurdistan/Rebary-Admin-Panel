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
















// OLD




// const { onCall, HttpsError } = require("firebase-functions/v2/https");
// const admin = require('firebase-admin');

// admin.initializeApp();

// const db = admin.firestore();

// // Helper — get super admin UID from env (set in Firebase Functions config or .env)
// // We protect by UID (not email) so it can't be spoofed
// const SUPER_ADMIN_UID = process.env.SUPER_ADMIN_UID;

// // ============================================
// // CREATE USER WITH ROLE
// // ============================================
// exports.createUserWithRole = onCall({ cors: true }, async (request) => {
//   const { data, auth } = request;

//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

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
//       userRecord = await admin.auth().createUser({ email, password });
//     } catch (authError) {
//       if (authError.code === 'auth/email-already-exists') {
//         userRecord = await admin.auth().getUserByEmail(email);
//       } else {
//         throw authError;
//       }
//     }

//     await admin.auth().setCustomUserClaims(userRecord.uid, { role });

//     await db.collection('users_new').doc(userRecord.uid).set({
//       uid: userRecord.uid,
//       email,
//       role,
//       displayName: displayName || '',
//       disabled: false,
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//       createdBy: auth.uid,
//     }, { merge: true });

//     return { success: true, uid: userRecord.uid, email, role };
//   } catch (error) {
//     console.error('Error creating user:', error);
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // UPDATE USER ROLE
// // ============================================
// exports.updateUserRole = onCall({ cors: true }, async (request) => {
//   const { data, auth } = request;

//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can update roles');
//   }

//   const { uid, role } = data;
//   if (!uid || !role) throw new HttpsError('invalid-argument', 'UID and role are required');

//   // LAYER 1: Block role change on super admin
//   if (SUPER_ADMIN_UID && uid === SUPER_ADMIN_UID) {
//     throw new HttpsError('permission-denied', 'The super admin role cannot be changed.');
//   }

//   try {
//     await admin.auth().setCustomUserClaims(uid, { role });
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

//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can delete users');
//   }

//   if (data.uid === auth.uid) {
//     throw new HttpsError('permission-denied', 'Cannot delete your own account');
//   }

//   // LAYER 1: Block deletion of super admin UID entirely
//   if (SUPER_ADMIN_UID && data.uid === SUPER_ADMIN_UID) {
//     throw new HttpsError('permission-denied', 'The super admin account cannot be deleted.');
//   }

//   try {
//     await admin.auth().deleteUser(data.uid);
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

//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can list users');
//   }

//   try {
//     const snapshot = await db.collection('users_new').orderBy('createdAt', 'desc').get();
//     const users = snapshot.docs.map(doc => ({
//       uid: doc.id,
//       ...doc.data(),
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

//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can disable users');
//   }

//   // Also block disabling the super admin
//   if (SUPER_ADMIN_UID && data.uid === SUPER_ADMIN_UID) {
//     throw new HttpsError('permission-denied', 'The super admin account cannot be disabled.');
//   }

//   const { uid, disabled } = data;
//   try {
//     await admin.auth().updateUser(uid, { disabled });
//     await db.collection('users_new').doc(uid).update({
//       disabled,
//       updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//     });
//     return { success: true, disabled };
//   } catch (error) {
//     throw new HttpsError('internal', error.message);
//   }
// });




// NEW 1

// const { onCall, HttpsError } = require("firebase-functions/v2/https");
// const admin = require('firebase-admin');

// admin.initializeApp();

// const db = admin.firestore();

// const SUPER_ADMIN_UID = process.env.SUPER_ADMIN_UID;

// // ============================================
// // HELPERS
// // ============================================

// // Get user's access object from users_new
// async function getUserAccess(uid) {
//   const doc = await db.collection('users_new').doc(uid).get();
//   if (!doc.exists) return null;
//   return doc.data();
// }

// // Check if user can write to a specific service
// function canWriteService(userData, serviceId, categoryRef) {
//   const role = userData.customClaims?.role || userData.role;
//   if (role === 'super_admin' || role === 'admin') {
//     // Check if admin has allCategories or specific category access
//     const access = userData.access;
//     if (!access) return role === 'super_admin'; // no access object = super_admin only
//     if (access.allServices) return true;
//     if (serviceId && access.services?.includes(serviceId)) return true;
//     // Also allow if the service's category is in their allowed categories
//     if (categoryRef && access.allCategories) return true;
//     if (categoryRef && access.categories?.includes(categoryRef)) return true;
//     return false;
//   }
//   if (role === 'editor') {
//     const access = userData.access;
//     if (!access) return false;
//     if (access.allServices) return true;
//     if (serviceId && access.services?.includes(serviceId)) return true;
//     return false;
//   }
//   return false;
// }

// // Check if user can write to a specific category
// function canWriteCategory(userData, categoryId) {
//   const role = userData.customClaims?.role || userData.role;
//   if (role === 'super_admin') return true;
//   if (role === 'admin') {
//     const access = userData.access;
//     if (!access) return false;
//     if (access.allCategories) return true;
//     if (categoryId && access.categories?.includes(categoryId)) return true;
//     return false;
//   }
//   return false; // editors can never write categories
// }

// // ============================================
// // CREATE OR UPDATE SERVICE
// // ============================================
// exports.createOrUpdateService = onCall({ cors: true }, async (request) => {
//   const { data, auth } = request;
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const authUser = await admin.auth().getUser(auth.uid);
//   const claims = authUser.customClaims || {};
//   const role = claims.role;

//   if (!role) throw new HttpsError('permission-denied', 'No role assigned');

//   // super_admin can always write
//   if (role !== 'super_admin') {
//     const userData = await getUserAccess(auth.uid);
//     if (!userData) throw new HttpsError('permission-denied', 'User not found');

//     // Merge role into userData for helper
//     userData.role = role;

//     const serviceId = data.id || null;
//     const categoryRef = data.serviceData?.categoryref || null;

//     if (!canWriteService(userData, serviceId, categoryRef)) {
//       throw new HttpsError('permission-denied', 'You do not have access to write this service');
//     }
//   }

//   const { id, serviceData } = data;

//   try {
//     if (id) {
//       // Update
//       await db.collection('services_new').doc(id).update({
//         ...serviceData,
//         updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//       });
//       return { success: true, id, action: 'updated' };
//     } else {
//       // Create
//       const ref = await db.collection('services_new').add({
//         ...serviceData,
//         updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//       });
//       return { success: true, id: ref.id, action: 'created' };
//     }
//   } catch (error) {
//     console.error('Error saving service:', error);
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // CREATE OR UPDATE CATEGORY
// // ============================================
// exports.createOrUpdateCategory = onCall({ cors: true }, async (request) => {
//   const { data, auth } = request;
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const authUser = await admin.auth().getUser(auth.uid);
//   const claims = authUser.customClaims || {};
//   const role = claims.role;

//   if (!role) throw new HttpsError('permission-denied', 'No role assigned');

//   if (role !== 'super_admin') {
//     const userData = await getUserAccess(auth.uid);
//     if (!userData) throw new HttpsError('permission-denied', 'User not found');
//     userData.role = role;

//     const categoryId = data.id || null;
//     if (!canWriteCategory(userData, categoryId)) {
//       throw new HttpsError('permission-denied', 'You do not have access to write this category');
//     }
//   }

//   const { id, categoryData } = data;

//   try {
//     if (id) {
//       await db.collection('categories_new').doc(id).update({
//         ...categoryData,
//         updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//       });
//       return { success: true, id, action: 'updated' };
//     } else {
//       const ref = await db.collection('categories_new').add({
//         ...categoryData,
//         updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//       });
//       return { success: true, id: ref.id, action: 'created' };
//     }
//   } catch (error) {
//     console.error('Error saving category:', error);
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // DELETE ITEMS (services or categories)
// // ============================================
// exports.deleteItems = onCall({ cors: true }, async (request) => {
//   const { data, auth } = request;
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const authUser = await admin.auth().getUser(auth.uid);
//   const claims = authUser.customClaims || {};
//   const role = claims.role;

//   if (!role) throw new HttpsError('permission-denied', 'No role assigned');

//   // { collection: 'services_new' | 'categories_new', ids: [...] }
//   const { collection, ids } = data;

//   if (!['services_new', 'categories_new'].includes(collection)) {
//     throw new HttpsError('invalid-argument', 'Invalid collection');
//   }

//   if (role !== 'super_admin') {
//     const userData = await getUserAccess(auth.uid);
//     if (!userData) throw new HttpsError('permission-denied', 'User not found');
//     userData.role = role;

//     // Check each ID
//     for (const id of ids) {
//       const allowed = collection === 'services_new'
//         ? canWriteService(userData, id, null)
//         : canWriteCategory(userData, id);

//       if (!allowed) {
//         throw new HttpsError('permission-denied', `You do not have access to delete item: ${id}`);
//       }
//     }
//   }

//   try {
//     const batch = db.batch();
//     for (const id of ids) {
//       batch.delete(db.collection(collection).doc(id));
//     }
//     await batch.commit();
//     return { success: true, deleted: ids.length };
//   } catch (error) {
//     console.error('Error deleting items:', error);
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // DUPLICATE ITEM
// // ============================================
// exports.duplicateItem = onCall({ cors: true }, async (request) => {
//   const { data, auth } = request;
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const authUser = await admin.auth().getUser(auth.uid);
//   const claims = authUser.customClaims || {};
//   const role = claims.role;

//   if (!role) throw new HttpsError('permission-denied', 'No role assigned');

//   const { collection, id } = data;

//   if (!['services_new', 'categories_new'].includes(collection)) {
//     throw new HttpsError('invalid-argument', 'Invalid collection');
//   }

//   if (role !== 'super_admin') {
//     const userData = await getUserAccess(auth.uid);
//     if (!userData) throw new HttpsError('permission-denied', 'User not found');
//     userData.role = role;

//     const allowed = collection === 'services_new'
//       ? canWriteService(userData, id, null)
//       : canWriteCategory(userData, id);

//     if (!allowed) {
//       throw new HttpsError('permission-denied', 'You do not have access to duplicate this item');
//     }
//   }

//   try {
//     const docSnap = await db.collection(collection).doc(id).get();
//     if (!docSnap.exists) throw new HttpsError('not-found', 'Item not found');

//     const itemData = docSnap.data();
//     delete itemData.updatedAt;

//     // Add copy suffix to name fields
//     const copySuffix = { sor: ' (نووسخە)', bad: ' (نووسخە)', ar: ' (نسخة)', en: ' (Copy)' };
//     const namePrefix = collection === 'services_new' ? 'name' : 'name';
//     const tagPrefix = collection === 'tags_new' ? 'tagsname' : null;

//     for (const [lang, suffix] of Object.entries(copySuffix)) {
//       const key = tagPrefix ? `${tagPrefix}_${lang}` : `${namePrefix}_${lang}`;
//       if (itemData[key]) itemData[key] += suffix;
//     }

//     const newRef = await db.collection(collection).add({
//       ...itemData,
//       updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//     });

//     return { success: true, id: newRef.id };
//   } catch (error) {
//     console.error('Error duplicating item:', error);
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // CREATE USER WITH ROLE
// // ============================================
// exports.createUserWithRole = onCall({ cors: true }, async (request) => {
//   const { data, auth } = request;
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can create users');
//   }

//   const { email, password, role, displayName, access } = data;

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
//       userRecord = await admin.auth().createUser({ email, password });
//     } catch (authError) {
//       if (authError.code === 'auth/email-already-exists') {
//         userRecord = await admin.auth().getUserByEmail(email);
//       } else {
//         throw authError;
//       }
//     }

//     await admin.auth().setCustomUserClaims(userRecord.uid, { role });

//     // Build access object
//     const accessObj = access || {
//       allCategories: role === 'super_admin',
//       allServices: role === 'super_admin' || role === 'admin',
//       categories: [],
//       services: [],
//     };

//     await db.collection('users_new').doc(userRecord.uid).set({
//       uid: userRecord.uid,
//       email,
//       role,
//       displayName: displayName || '',
//       disabled: false,
//       access: accessObj,
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//       createdBy: auth.uid,
//     }, { merge: true });

//     return { success: true, uid: userRecord.uid, email, role };
//   } catch (error) {
//     console.error('Error creating user:', error);
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // UPDATE USER ROLE
// // ============================================
// exports.updateUserRole = onCall({ cors: true }, async (request) => {
//   const { data, auth } = request;
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can update roles');
//   }

//   const { uid, role } = data;
//   if (!uid || !role) throw new HttpsError('invalid-argument', 'UID and role are required');

//   if (SUPER_ADMIN_UID && uid === SUPER_ADMIN_UID) {
//     throw new HttpsError('permission-denied', 'The super admin role cannot be changed.');
//   }

//   try {
//     await admin.auth().setCustomUserClaims(uid, { role });
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
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can delete users');
//   }

//   if (data.uid === auth.uid) {
//     throw new HttpsError('permission-denied', 'Cannot delete your own account');
//   }

//   if (SUPER_ADMIN_UID && data.uid === SUPER_ADMIN_UID) {
//     throw new HttpsError('permission-denied', 'The super admin account cannot be deleted.');
//   }

//   try {
//     await admin.auth().deleteUser(data.uid);
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
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can list users');
//   }

//   try {
//     const snapshot = await db.collection('users_new').orderBy('createdAt', 'desc').get();
//     const users = snapshot.docs.map(doc => ({
//       uid: doc.id,
//       ...doc.data(),
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
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can disable users');
//   }

//   if (SUPER_ADMIN_UID && data.uid === SUPER_ADMIN_UID) {
//     throw new HttpsError('permission-denied', 'The super admin account cannot be disabled.');
//   }

//   const { uid, disabled } = data;
//   try {
//     await admin.auth().updateUser(uid, { disabled });
//     await db.collection('users_new').doc(uid).update({
//       disabled,
//       updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//     });
//     return { success: true, disabled };
//   } catch (error) {
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // UPDATE USER ACCESS
// // ============================================
// exports.updateUserAccess = onCall({ cors: true }, async (request) => {
//   const { data, auth } = request;
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can update user access');
//   }

//   const { uid, access } = data;
//   if (!uid || !access) throw new HttpsError('invalid-argument', 'UID and access are required');

//   try {
//     await db.collection('users_new').doc(uid).update({
//       access,
//       updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//       updatedBy: auth.uid,
//     });
//     return { success: true };
//   } catch (error) {
//     throw new HttpsError('internal', error.message);
//   }
// });


// NEW 2



// const { onCall, HttpsError } = require("firebase-functions/v2/https");
// const admin = require('firebase-admin');

// admin.initializeApp();

// const db = admin.firestore();
// const SUPER_ADMIN_UID = process.env.SUPER_ADMIN_UID;

// // Shared CORS config — allows all origins (safe for onCall which verifies Firebase auth tokens)
// const CORS_CONFIG = { cors: true };

// // ============================================
// // HELPERS
// // ============================================
// async function getUserAccess(uid) {
//   const docSnap = await db.collection('users_new').doc(uid).get();
//   if (!docSnap.exists) return null;
//   return docSnap.data();
// }

// function canWriteService(userData, serviceId, categoryRef) {
//   const role = userData.role;
//   if (role === 'super_admin') return true;
//   const access = userData.access;
//   if (!access) return false;
//   if (access.allServices) return true;
//   if (serviceId && access.services?.includes(serviceId)) return true;
//   if (categoryRef) {
//     const catId = categoryRef.includes('/') ? categoryRef.split('/').pop() : categoryRef;
//     if (access.allCategories) return true;
//     if (access.categories?.includes(catId)) return true;
//   }
//   return false;
// }

// function canWriteCategory(userData, categoryId) {
//   const role = userData.role;
//   if (role === 'super_admin') return true;
//   if (role === 'admin') {
//     const access = userData.access;
//     if (!access) return false;
//     if (access.allCategories) return true;
//     if (categoryId && access.categories?.includes(categoryId)) return true;
//   }
//   return false;
// }

// // ============================================
// // CREATE OR UPDATE SERVICE
// // ============================================
// exports.createOrUpdateService = onCall(CORS_CONFIG, async (request) => {
//   const { data, auth } = request;
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const authUser = await admin.auth().getUser(auth.uid);
//   const role = authUser.customClaims?.role;
//   if (!role) throw new HttpsError('permission-denied', 'No role assigned');

//   if (role !== 'super_admin') {
//     const userData = await getUserAccess(auth.uid);
//     if (!userData) throw new HttpsError('permission-denied', 'User not found');
//     userData.role = role;

//     const serviceId  = data.id || null;
//     const categoryRef = data.serviceData?.categoryref || null;
//     if (!canWriteService(userData, serviceId, categoryRef)) {
//       throw new HttpsError('permission-denied', 'You do not have access to write this service');
//     }
//   }

//   const { id, serviceData } = data;
//   try {
//     if (id) {
//       await db.collection('services_new').doc(id).update({ ...serviceData, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
//       return { success: true, id, action: 'updated' };
//     } else {
//       const ref = await db.collection('services_new').add({ ...serviceData, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
//       return { success: true, id: ref.id, action: 'created' };
//     }
//   } catch (error) {
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // CREATE OR UPDATE CATEGORY
// // ============================================
// exports.createOrUpdateCategory = onCall(CORS_CONFIG, async (request) => {
//   const { data, auth } = request;
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const authUser = await admin.auth().getUser(auth.uid);
//   const role = authUser.customClaims?.role;
//   if (!role) throw new HttpsError('permission-denied', 'No role assigned');

//   if (role !== 'super_admin') {
//     const userData = await getUserAccess(auth.uid);
//     if (!userData) throw new HttpsError('permission-denied', 'User not found');
//     userData.role = role;
//     if (!canWriteCategory(userData, data.id || null)) {
//       throw new HttpsError('permission-denied', 'You do not have access to write this category');
//     }
//   }

//   const { id, categoryData } = data;
//   try {
//     if (id) {
//       await db.collection('categories_new').doc(id).update({ ...categoryData, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
//       return { success: true, id, action: 'updated' };
//     } else {
//       const ref = await db.collection('categories_new').add({ ...categoryData, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
//       return { success: true, id: ref.id, action: 'created' };
//     }
//   } catch (error) {
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // DELETE ITEMS
// // ============================================
// exports.deleteItems = onCall(CORS_CONFIG, async (request) => {
//   const { data, auth } = request;
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const authUser = await admin.auth().getUser(auth.uid);
//   const role = authUser.customClaims?.role;
//   if (!role) throw new HttpsError('permission-denied', 'No role assigned');

//   const { collection, ids } = data;
//   if (!['services_new', 'categories_new'].includes(collection)) {
//     throw new HttpsError('invalid-argument', 'Invalid collection');
//   }

//   if (role !== 'super_admin') {
//     const userData = await getUserAccess(auth.uid);
//     if (!userData) throw new HttpsError('permission-denied', 'User not found');
//     userData.role = role;

//     for (const id of ids) {
//       const allowed = collection === 'services_new'
//         ? canWriteService(userData, id, null)
//         : canWriteCategory(userData, id);
//       if (!allowed) throw new HttpsError('permission-denied', `No access to delete: ${id}`);
//     }
//   }

//   try {
//     const batch = db.batch();
//     for (const id of ids) batch.delete(db.collection(collection).doc(id));
//     await batch.commit();
//     return { success: true, deleted: ids.length };
//   } catch (error) {
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // DUPLICATE ITEM
// // ============================================
// exports.duplicateItem = onCall(CORS_CONFIG, async (request) => {
//   const { data, auth } = request;
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const authUser = await admin.auth().getUser(auth.uid);
//   const role = authUser.customClaims?.role;
//   if (!role) throw new HttpsError('permission-denied', 'No role assigned');

//   const { collection, id } = data;
//   if (!['services_new', 'categories_new'].includes(collection)) {
//     throw new HttpsError('invalid-argument', 'Invalid collection');
//   }

//   if (role !== 'super_admin') {
//     const userData = await getUserAccess(auth.uid);
//     if (!userData) throw new HttpsError('permission-denied', 'User not found');
//     userData.role = role;
//     const allowed = collection === 'services_new'
//       ? canWriteService(userData, id, null)
//       : canWriteCategory(userData, id);
//     if (!allowed) throw new HttpsError('permission-denied', 'No access to duplicate this item');
//   }

//   try {
//     const docSnap = await db.collection(collection).doc(id).get();
//     if (!docSnap.exists) throw new HttpsError('not-found', 'Item not found');

//     const itemData = { ...docSnap.data() };
//     delete itemData.updatedAt;

//     const suffixes = { sor: ' (نووسخە)', bad: ' (نووسخە)', ar: ' (نسخة)', en: ' (Copy)' };
//     for (const [lang, suffix] of Object.entries(suffixes)) {
//       if (itemData[`name_${lang}`]) itemData[`name_${lang}`] += suffix;
//     }

//     const newRef = await db.collection(collection).add({ ...itemData, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
//     return { success: true, id: newRef.id };
//   } catch (error) {
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // UPDATE USER ACCESS
// // ============================================
// exports.updateUserAccess = onCall(CORS_CONFIG, async (request) => {
//   const { data, auth } = request;
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can update user access');
//   }

//   const { uid, access } = data;
//   if (!uid || !access) throw new HttpsError('invalid-argument', 'UID and access are required');

//   try {
//     await db.collection('users_new').doc(uid).update({
//       access,
//       updatedAt: admin.firestore.FieldValue.serverTimestamp(),
//       updatedBy: auth.uid,
//     });
//     return { success: true };
//   } catch (error) {
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // CREATE USER WITH ROLE
// // ============================================
// exports.createUserWithRole = onCall(CORS_CONFIG, async (request) => {
//   const { data, auth } = request;
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can create users');
//   }

//   const { email, password, role, displayName, access } = data;
//   if (!email || !password || !role) throw new HttpsError('invalid-argument', 'Email, password, and role are required');
//   if (!['super_admin', 'admin', 'editor'].includes(role)) throw new HttpsError('invalid-argument', 'Invalid role');
//   if (password.length < 6) throw new HttpsError('invalid-argument', 'Password must be at least 6 characters');

//   try {
//     let userRecord;
//     try {
//       userRecord = await admin.auth().createUser({ email, password });
//     } catch (authError) {
//       if (authError.code === 'auth/email-already-exists') {
//         userRecord = await admin.auth().getUserByEmail(email);
//       } else throw authError;
//     }

//     await admin.auth().setCustomUserClaims(userRecord.uid, { role });

//     const accessObj = access || {
//       allCategories: role === 'super_admin',
//       allServices: role === 'super_admin',
//       categories: [],
//       services: [],
//     };

//     await db.collection('users_new').doc(userRecord.uid).set({
//       uid: userRecord.uid,
//       email,
//       role,
//       displayName: displayName || '',
//       disabled: false,
//       access: accessObj,
//       createdAt: admin.firestore.FieldValue.serverTimestamp(),
//       createdBy: auth.uid,
//     }, { merge: true });

//     return { success: true, uid: userRecord.uid, email, role };
//   } catch (error) {
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // UPDATE USER ROLE
// // ============================================
// exports.updateUserRole = onCall(CORS_CONFIG, async (request) => {
//   const { data, auth } = request;
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') {
//     throw new HttpsError('permission-denied', 'Only super admins can update roles');
//   }

//   const { uid, role } = data;
//   if (!uid || !role) throw new HttpsError('invalid-argument', 'UID and role are required');
//   if (SUPER_ADMIN_UID && uid === SUPER_ADMIN_UID) throw new HttpsError('permission-denied', 'The super admin role cannot be changed.');

//   try {
//     await admin.auth().setCustomUserClaims(uid, { role });
//     await db.collection('users_new').doc(uid).update({ role, updatedAt: admin.firestore.FieldValue.serverTimestamp(), updatedBy: auth.uid });
//     return { success: true };
//   } catch (error) {
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // DELETE USER
// // ============================================
// exports.deleteUser = onCall(CORS_CONFIG, async (request) => {
//   const { data, auth } = request;
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') throw new HttpsError('permission-denied', 'Only super admins can delete users');
//   if (data.uid === auth.uid) throw new HttpsError('permission-denied', 'Cannot delete your own account');
//   if (SUPER_ADMIN_UID && data.uid === SUPER_ADMIN_UID) throw new HttpsError('permission-denied', 'The super admin account cannot be deleted.');

//   try {
//     await admin.auth().deleteUser(data.uid);
//     await db.collection('users_new').doc(data.uid).delete();
//     return { success: true };
//   } catch (error) {
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // LIST ALL ADMIN USERS
// // ============================================
// exports.listAdminUsers = onCall(CORS_CONFIG, async (request) => {
//   const { auth } = request;
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') throw new HttpsError('permission-denied', 'Only super admins can list users');

//   try {
//     const snapshot = await db.collection('users_new').orderBy('createdAt', 'desc').get();
//     const users = snapshot.docs.map(doc => ({
//       uid: doc.id,
//       ...doc.data(),
//       createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
//       updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || null,
//     }));
//     return { success: true, users };
//   } catch (error) {
//     throw new HttpsError('internal', error.message);
//   }
// });

// // ============================================
// // TOGGLE USER DISABLED
// // ============================================
// exports.toggleUserDisabled = onCall(CORS_CONFIG, async (request) => {
//   const { data, auth } = request;
//   if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

//   const callerToken = await admin.auth().getUser(auth.uid);
//   if (callerToken.customClaims?.role !== 'super_admin') throw new HttpsError('permission-denied', 'Only super admins can disable users');
//   if (SUPER_ADMIN_UID && data.uid === SUPER_ADMIN_UID) throw new HttpsError('permission-denied', 'The super admin account cannot be disabled.');

//   const { uid, disabled } = data;
//   try {
//     await admin.auth().updateUser(uid, { disabled });
//     await db.collection('users_new').doc(uid).update({ disabled, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
//     return { success: true, disabled };
//   } catch (error) {
//     throw new HttpsError('internal', error.message);
//   }
// });



// NEW 3


const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const SUPER_ADMIN_UID = process.env.SUPER_ADMIN_UID;

// Shared CORS config — allows all origins (safe for onCall which verifies Firebase auth tokens)
const CORS_CONFIG = { cors: true };

// ============================================
// HELPERS
// ============================================
async function getUserAccess(uid) {
  const docSnap = await db.collection('users_new').doc(uid).get();
  if (!docSnap.exists) return null;
  return docSnap.data();
}

// Fix #2: safely extract category ID from string or Firestore DocumentReference
function extractCatId(categoryRef) {
  if (!categoryRef) return null;
  if (typeof categoryRef === 'object' && categoryRef.id) return categoryRef.id;
  if (typeof categoryRef === 'object' && categoryRef.path) return categoryRef.path.split('/').pop();
  if (typeof categoryRef === 'string') return categoryRef.includes('/') ? categoryRef.split('/').pop() : categoryRef;
  return null;
}

function canWriteService(userData, serviceId, categoryRef) {
  const role = userData.role;
  if (role === 'super_admin') return true;
  const access = userData.access;
  if (!access) return false;

  // Fix #1: check excludedServices first — explicit exclusion always wins
  const excluded = access.excludedServices || [];
  if (serviceId && excluded.includes(serviceId)) return false;

  if (access.allServices) return true;
  if (serviceId && access.services?.includes(serviceId)) return true;

  // Fix #2: use extractCatId so DocumentReference objects work
  const catId = extractCatId(categoryRef);
  if (catId) {
    const excludedCats = access.excludedCategories || [];
    if (access.allCategories && !excludedCats.includes(catId)) return true;
    if (access.categories?.includes(catId) && !excludedCats.includes(catId)) return true;
  }
  return false;
}

function canWriteCategory(userData, categoryId) {
  const role = userData.role;
  if (role === 'super_admin') return true;
  if (role === 'admin') {
    const access = userData.access;
    if (!access) return false;
    // Fix #3: check excludedCategories even when allCategories=true
    const excludedCats = access.excludedCategories || [];
    if (access.allCategories) return !excludedCats.includes(categoryId);
    if (categoryId && access.categories?.includes(categoryId)) return true;
  }
  return false;
}

// ============================================
// CREATE OR UPDATE SERVICE
// ============================================
exports.createOrUpdateService = onCall(CORS_CONFIG, async (request) => {
  const { data, auth } = request;
  if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

  const authUser = await admin.auth().getUser(auth.uid);
  const role = authUser.customClaims?.role;
  if (!role) throw new HttpsError('permission-denied', 'No role assigned');

  if (role !== 'super_admin') {
    const userData = await getUserAccess(auth.uid);
    if (!userData) throw new HttpsError('permission-denied', 'User not found');
    userData.role = role;

    const serviceId  = data.id || null;
    const categoryRef = data.serviceData?.categoryref || null;
    if (!canWriteService(userData, serviceId, categoryRef)) {
      throw new HttpsError('permission-denied', 'You do not have access to write this service');
    }
  }

  const { id, serviceData } = data;
  try {
    if (id) {
      await db.collection('services_new').doc(id).update({ ...serviceData, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      return { success: true, id, action: 'updated' };
    } else {
      const ref = await db.collection('services_new').add({ ...serviceData, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      return { success: true, id: ref.id, action: 'created' };
    }
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});

// ============================================
// CREATE OR UPDATE CATEGORY
// ============================================
exports.createOrUpdateCategory = onCall(CORS_CONFIG, async (request) => {
  const { data, auth } = request;
  if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

  const authUser = await admin.auth().getUser(auth.uid);
  const role = authUser.customClaims?.role;
  if (!role) throw new HttpsError('permission-denied', 'No role assigned');

  if (role !== 'super_admin') {
    const userData = await getUserAccess(auth.uid);
    if (!userData) throw new HttpsError('permission-denied', 'User not found');
    userData.role = role;
    if (!canWriteCategory(userData, data.id || null)) {
      throw new HttpsError('permission-denied', 'You do not have access to write this category');
    }
  }

  const { id, categoryData } = data;
  try {
    if (id) {
      await db.collection('categories_new').doc(id).update({ ...categoryData, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      return { success: true, id, action: 'updated' };
    } else {
      const ref = await db.collection('categories_new').add({ ...categoryData, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      return { success: true, id: ref.id, action: 'created' };
    }
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});

// ============================================
// DELETE ITEMS
// ============================================
exports.deleteItems = onCall(CORS_CONFIG, async (request) => {
  const { data, auth } = request;
  if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

  const authUser = await admin.auth().getUser(auth.uid);
  const role = authUser.customClaims?.role;
  if (!role) throw new HttpsError('permission-denied', 'No role assigned');

  const { collection, ids } = data;
  if (!['services_new', 'categories_new'].includes(collection)) {
    throw new HttpsError('invalid-argument', 'Invalid collection');
  }

  if (role !== 'super_admin') {
    const userData = await getUserAccess(auth.uid);
    if (!userData) throw new HttpsError('permission-denied', 'User not found');
    userData.role = role;

    for (const id of ids) {
      let allowed = false;
      if (collection === 'services_new') {
        // Fix #4: fetch the service's actual categoryref so category-inherited access works correctly
        const svcSnap = await db.collection('services_new').doc(id).get();
        const categoryRef = svcSnap.exists ? svcSnap.data().categoryref : null;
        allowed = canWriteService(userData, id, categoryRef);
      } else {
        allowed = canWriteCategory(userData, id);
      }
      if (!allowed) throw new HttpsError('permission-denied', `No access to delete: ${id}`);
    }
  }

  try {
    const batch = db.batch();
    for (const id of ids) batch.delete(db.collection(collection).doc(id));
    await batch.commit();
    return { success: true, deleted: ids.length };
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});

// ============================================
// DUPLICATE ITEM
// ============================================
exports.duplicateItem = onCall(CORS_CONFIG, async (request) => {
  const { data, auth } = request;
  if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

  const authUser = await admin.auth().getUser(auth.uid);
  const role = authUser.customClaims?.role;
  if (!role) throw new HttpsError('permission-denied', 'No role assigned');

  const { collection, id } = data;
  if (!['services_new', 'categories_new'].includes(collection)) {
    throw new HttpsError('invalid-argument', 'Invalid collection');
  }

  // Fix #5: fetch the document first so we can check the actual categoryref
  const docSnap = await db.collection(collection).doc(id).get();
  if (!docSnap.exists) throw new HttpsError('not-found', 'Item not found');

  if (role !== 'super_admin') {
    const userData = await getUserAccess(auth.uid);
    if (!userData) throw new HttpsError('permission-denied', 'User not found');
    userData.role = role;
    const categoryRef = collection === 'services_new' ? docSnap.data().categoryref : null;
    const allowed = collection === 'services_new'
      ? canWriteService(userData, id, categoryRef)
      : canWriteCategory(userData, id);
    if (!allowed) throw new HttpsError('permission-denied', 'No access to duplicate this item');
  }

  try {
    // docSnap already fetched above
    if (!docSnap.exists) throw new HttpsError('not-found', 'Item not found');

    const itemData = { ...docSnap.data() };
    delete itemData.updatedAt;

    const suffixes = { sor: ' (نووسخە)', bad: ' (نووسخە)', ar: ' (نسخة)', en: ' (Copy)' };
    for (const [lang, suffix] of Object.entries(suffixes)) {
      if (itemData[`name_${lang}`]) itemData[`name_${lang}`] += suffix;
    }

    const newRef = await db.collection(collection).add({ ...itemData, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return { success: true, id: newRef.id };
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});

// ============================================
// UPDATE USER ACCESS
// ============================================
exports.updateUserAccess = onCall(CORS_CONFIG, async (request) => {
  const { data, auth } = request;
  if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

  const callerToken = await admin.auth().getUser(auth.uid);
  if (callerToken.customClaims?.role !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Only super admins can update user access');
  }

  const { uid, access } = data;
  if (!uid || !access) throw new HttpsError('invalid-argument', 'UID and access are required');

  try {
    await db.collection('users_new').doc(uid).update({
      access,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedBy: auth.uid,
    });
    return { success: true };
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});

// ============================================
// CREATE USER WITH ROLE
// ============================================
exports.createUserWithRole = onCall(CORS_CONFIG, async (request) => {
  const { data, auth } = request;
  if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

  const callerToken = await admin.auth().getUser(auth.uid);
  if (callerToken.customClaims?.role !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Only super admins can create users');
  }

  const { email, password, role, displayName, access } = data;
  if (!email || !password || !role) throw new HttpsError('invalid-argument', 'Email, password, and role are required');
  if (!['super_admin', 'admin', 'editor'].includes(role)) throw new HttpsError('invalid-argument', 'Invalid role');
  if (password.length < 6) throw new HttpsError('invalid-argument', 'Password must be at least 6 characters');

  try {
    let userRecord;
    try {
      userRecord = await admin.auth().createUser({ email, password });
    } catch (authError) {
      if (authError.code === 'auth/email-already-exists') {
        userRecord = await admin.auth().getUserByEmail(email);
      } else throw authError;
    }

    await admin.auth().setCustomUserClaims(userRecord.uid, { role });

    const accessObj = access || {
      allCategories: role === 'super_admin',
      allServices: role === 'super_admin',
      categories: [],
      services: [],
    };

    await db.collection('users_new').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email,
      role,
      displayName: displayName || '',
      disabled: false,
      access: accessObj,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: auth.uid,
    }, { merge: true });

    return { success: true, uid: userRecord.uid, email, role };
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});

// ============================================
// UPDATE USER ROLE
// ============================================
exports.updateUserRole = onCall(CORS_CONFIG, async (request) => {
  const { data, auth } = request;
  if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

  const callerToken = await admin.auth().getUser(auth.uid);
  if (callerToken.customClaims?.role !== 'super_admin') {
    throw new HttpsError('permission-denied', 'Only super admins can update roles');
  }

  const { uid, role } = data;
  if (!uid || !role) throw new HttpsError('invalid-argument', 'UID and role are required');
  if (SUPER_ADMIN_UID && uid === SUPER_ADMIN_UID) throw new HttpsError('permission-denied', 'The super admin role cannot be changed.');

  try {
    await admin.auth().setCustomUserClaims(uid, { role });
    await db.collection('users_new').doc(uid).update({ role, updatedAt: admin.firestore.FieldValue.serverTimestamp(), updatedBy: auth.uid });
    return { success: true };
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});

// ============================================
// DELETE USER
// ============================================
exports.deleteUser = onCall(CORS_CONFIG, async (request) => {
  const { data, auth } = request;
  if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

  const callerToken = await admin.auth().getUser(auth.uid);
  if (callerToken.customClaims?.role !== 'super_admin') throw new HttpsError('permission-denied', 'Only super admins can delete users');
  if (data.uid === auth.uid) throw new HttpsError('permission-denied', 'Cannot delete your own account');
  if (SUPER_ADMIN_UID && data.uid === SUPER_ADMIN_UID) throw new HttpsError('permission-denied', 'The super admin account cannot be deleted.');

  try {
    await admin.auth().deleteUser(data.uid);
    await db.collection('users_new').doc(data.uid).delete();
    return { success: true };
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});

// ============================================
// LIST ALL ADMIN USERS
// ============================================
exports.listAdminUsers = onCall(CORS_CONFIG, async (request) => {
  const { auth } = request;
  if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

  const callerToken = await admin.auth().getUser(auth.uid);
  if (callerToken.customClaims?.role !== 'super_admin') throw new HttpsError('permission-denied', 'Only super admins can list users');

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
// TOGGLE USER DISABLED
// ============================================
exports.toggleUserDisabled = onCall(CORS_CONFIG, async (request) => {
  const { data, auth } = request;
  if (!auth) throw new HttpsError('unauthenticated', 'User must be authenticated');

  const callerToken = await admin.auth().getUser(auth.uid);
  if (callerToken.customClaims?.role !== 'super_admin') throw new HttpsError('permission-denied', 'Only super admins can disable users');
  if (SUPER_ADMIN_UID && data.uid === SUPER_ADMIN_UID) throw new HttpsError('permission-denied', 'The super admin account cannot be disabled.');

  const { uid, disabled } = data;
  try {
    await admin.auth().updateUser(uid, { disabled });
    await db.collection('users_new').doc(uid).update({ disabled, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return { success: true, disabled };
  } catch (error) {
    throw new HttpsError('internal', error.message);
  }
});