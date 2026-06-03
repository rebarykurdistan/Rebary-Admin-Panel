import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ================== SERVICES ==================

export const servicesCollection = collection(db, 'services_new');

// ── Legacy: still used by other pages that haven't been refactored ─────────────
export const getAllServices = async () => {
  const snapshot = await getDocs(servicesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getServiceById = async (id) => {
  const docRef = doc(db, 'services_new', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getServicesByCategory = async (categoryRef) => {
  const q = query(servicesCollection, where('categoryref', '==', categoryRef));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createService = async (serviceData) => {
  const data = { ...serviceData, updatedAt: serverTimestamp() };
  const docRef = await addDoc(servicesCollection, data);
  return docRef.id;
};

export const updateService = async (id, serviceData) => {
  const docRef = doc(db, 'services_new', id);
  await updateDoc(docRef, { ...serviceData, updatedAt: serverTimestamp() });
};

export const deleteService = async (id) => {
  const docRef = doc(db, 'services_new', id);
  await deleteDoc(docRef);
};

export const duplicateService = async (id) => {
  const service = await getServiceById(id);
  if (!service) throw new Error('Service not found');
  const { id: _, updatedAt, ...serviceData } = service;
  if (serviceData.name_sor) serviceData.name_sor += ' (نووسخە)';
  if (serviceData.name_bad) serviceData.name_bad += ' (نووسخە)';
  if (serviceData.name_ar)  serviceData.name_ar  += ' (نسخة)';
  if (serviceData.name_en)  serviceData.name_en  += ' (Copy)';
  return await createService(serviceData);
};

export const searchServices = async (searchTerm, language = 'sor') => {
  const allServices = await getAllServices();
  const searchLower = searchTerm.toLowerCase();
  return allServices.filter(service => {
    const name     = service[`name_${language}`];
    const job      = service[`job_${language}`];
    const jobTitle = service[`jobtitle_${language}`];
    return (
      (name     && name.toLowerCase().includes(searchLower)) ||
      (job      && job.toLowerCase().includes(searchLower))  ||
      (jobTitle && jobTitle.toLowerCase().includes(searchLower))
    );
  });
};

// ── Paginated fetch ────────────────────────────────────────────────────────────
// Returns { docs, cursor, hasMore }
// cursor = last Firestore DocumentSnapshot (pass back as `afterCursor` for next page)
// Filters applied server-side: categoryId only (Firestore limitation)
// subcategory / dd filters are applied client-side on the fetched page
export const getServicesPaginated = async ({
  categoryId = null,
  afterCursor = null,
  pageSize    = 15,
} = {}) => {
  const constraints = [orderBy('updatedAt', 'desc'), limit(pageSize + 1)];

  if (categoryId) {
    const categoryDocRef = doc(db, 'categories_new', categoryId);
    constraints.unshift(where('categoryref', '==', categoryDocRef));
  }

  if (afterCursor) {
    constraints.push(startAfter(afterCursor));
  }

  const q        = query(servicesCollection, ...constraints);
  const snapshot = await getDocs(q);
  const all      = snapshot.docs;
  const hasMore  = all.length > pageSize;
  const pageDocs = hasMore ? all.slice(0, pageSize) : all;

  return {
    docs:   pageDocs.map(d => ({ id: d.id, ...d.data() })),
    // Keep the raw snapshot for use as the next cursor
    cursor: pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null,
    hasMore,
  };
};

// ── Meta listener ──────────────────────────────────────────────────────────────
// Listens to services_new/reference and calls back with the updatedAt Date
// Returns unsubscribe function
export const subscribeToServicesMeta = (callback) => {
  const metaRef = doc(db, 'services_new', 'reference');
  return onSnapshot(metaRef, (snap) => {
    if (!snap.exists()) return;
    const data      = snap.data();
    const updatedAt = data.updatedAt;
    if (!updatedAt) return;
    // Normalise to JS Date regardless of Firestore Timestamp or plain object
    const date = updatedAt.toDate ? updatedAt.toDate() : new Date(updatedAt.seconds * 1000);
    callback(date);
  });
};

// ================== LOCKS ==================
// Lock document lives at locks/{serviceId}
// Fields: lockedBy (uid), lockedByName (string), lockedAt (timestamp), expiresAt (timestamp)

const LOCK_TTL_MS = 3 * 60 * 1000; // 3 minutes

export const acquireLock = async (serviceId, uid, displayName) => {
  const lockRef  = doc(db, 'locks', serviceId);
  const lockSnap = await getDoc(lockRef);

  if (lockSnap.exists()) {
    const lock      = lockSnap.data();
    const expiresAt = lock.expiresAt?.toDate
      ? lock.expiresAt.toDate()
      : new Date(lock.expiresAt.seconds * 1000);

    // Lock held by someone else and not yet expired
    if (lock.lockedBy !== uid && expiresAt > new Date()) {
      return {
        acquired:      false,
        lockedBy:      lock.lockedBy,
        lockedByName:  lock.lockedByName || 'Another user',
        expiresAt,
      };
    }
  }

  // Either no lock, expired lock, or our own lock — acquire / renew
  const now       = new Date();
  const expiresAt = new Date(now.getTime() + LOCK_TTL_MS);

  await setDoc(lockRef, {
    lockedBy:     uid,
    lockedByName: displayName || uid,
    lockedAt:     Timestamp.fromDate(now),
    expiresAt:    Timestamp.fromDate(expiresAt),
  });

  return { acquired: true };
};

export const renewLock = async (serviceId, uid) => {
  const lockRef  = doc(db, 'locks', serviceId);
  const lockSnap = await getDoc(lockRef);
  // Only renew if we still own it
  if (!lockSnap.exists() || lockSnap.data().lockedBy !== uid) return;
  await updateDoc(lockRef, {
    expiresAt: Timestamp.fromDate(new Date(Date.now() + LOCK_TTL_MS)),
  });
};

export const releaseLock = async (serviceId, uid) => {
  const lockRef  = doc(db, 'locks', serviceId);
  const lockSnap = await getDoc(lockRef);
  // Only release our own lock
  if (!lockSnap.exists() || lockSnap.data().lockedBy !== uid) return;
  await deleteDoc(lockRef);
};

export const getLock = async (serviceId) => {
  const lockRef  = doc(db, 'locks', serviceId);
  const lockSnap = await getDoc(lockRef);
  if (!lockSnap.exists()) return null;
  const lock      = lockSnap.data();
  const expiresAt = lock.expiresAt?.toDate
    ? lock.expiresAt.toDate()
    : new Date(lock.expiresAt.seconds * 1000);
  // Treat expired locks as non-existent
  if (expiresAt <= new Date()) return null;
  return { ...lock, expiresAt };
};

// ================== CATEGORIES ==================

export const categoriesCollection = collection(db, 'categories_new');

export const getAllCategories = async () => {
  const snapshot = await getDocs(categoriesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getCategoryById = async (id) => {
  const docRef  = doc(db, 'categories_new', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const createCategory = async (categoryData) => {
  const data   = { ...categoryData, updatedAt: serverTimestamp() };
  const docRef = await addDoc(categoriesCollection, data);
  return docRef.id;
};

export const updateCategory = async (id, categoryData) => {
  const docRef = doc(db, 'categories_new', id);
  await updateDoc(docRef, { ...categoryData, updatedAt: serverTimestamp() });
};

export const deleteCategory = async (id) => {
  const docRef = doc(db, 'categories_new', id);
  await deleteDoc(docRef);
};

export const duplicateCategory = async (id) => {
  const category = await getCategoryById(id);
  if (!category) throw new Error('Category not found');
  const { id: _, updatedAt, ...categoryData } = category;
  if (categoryData.name_sor) categoryData.name_sor += ' (نووسخە)';
  if (categoryData.name_bad) categoryData.name_bad += ' (نووسخە)';
  if (categoryData.name_ar)  categoryData.name_ar  += ' (نسخة)';
  if (categoryData.name_en)  categoryData.name_en  += ' (Copy)';
  return await createCategory(categoryData);
};

// ================== TAGS ==================

export const tagsCollection = collection(db, 'tags_new');

export const getAllTags = async () => {
  const snapshot = await getDocs(tagsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getTagById = async (id) => {
  const docRef  = doc(db, 'tags_new', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const createTag = async (tagData) => {
  const data   = { ...tagData, updatedAt: serverTimestamp() };
  const docRef = await addDoc(tagsCollection, data);
  return docRef.id;
};

export const updateTag = async (id, tagData) => {
  const docRef = doc(db, 'tags_new', id);
  await updateDoc(docRef, { ...tagData, updatedAt: serverTimestamp() });
};

export const deleteTag = async (id) => {
  const docRef = doc(db, 'tags_new', id);
  await deleteDoc(docRef);
};

export const duplicateTag = async (id) => {
  const tag = await getTagById(id);
  if (!tag) throw new Error('Tag not found');
  const { id: _, updatedAt, ...tagData } = tag;
  if (tagData.tagsname_sor) tagData.tagsname_sor += ' (نووسخە)';
  if (tagData.tagsname_bad) tagData.tagsname_bad += ' (نووسخە)';
  if (tagData.tagsname_ar)  tagData.tagsname_ar  += ' (نسخة)';
  if (tagData.tagsname_en)  tagData.tagsname_en  += ' (Copy)';
  return await createTag(tagData);
};

// ================== BULK OPERATIONS ==================

export const bulkDeleteServices  = async (ids) => Promise.all(ids.map(deleteService));
export const bulkDeleteCategories = async (ids) => Promise.all(ids.map(deleteCategory));
export const bulkDeleteTags       = async (ids) => Promise.all(ids.map(deleteTag));

// ================== USERS ==================

export const usersCollection = collection(db, 'users_new');

export const getAllUsers = async () => {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserById = async (id) => {
  const docRef  = doc(db, 'users_new', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getUserByEmail = async (email) => {
  const q        = query(usersCollection, where('email', '==', email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
};

export const createUser = async (userData) => {
  const data   = { ...userData, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  const docRef = await addDoc(usersCollection, data);
  return docRef.id;
};

export const updateUser = async (id, userData) => {
  const docRef = doc(db, 'users_new', id);
  await updateDoc(docRef, { ...userData, updatedAt: serverTimestamp() });
};

export const deleteUser = async (id) => {
  const docRef = doc(db, 'users_new', id);
  await deleteDoc(docRef);
};

// ================== STATS ==================

export const getStats = async () => {
  const [services, categories, tags, users] = await Promise.all([
    getAllServices(),
    getAllCategories(),
    getAllTags(),
    getAllUsers(),
  ]);
  return {
    servicesCount:    services.length,
    categoriesCount:  categories.length,
    tagsCount:        tags.length,
    usersCount:       users.length,
  };
};
