import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

// ================== SERVICES ==================

export const servicesCollection = collection(db, 'services_new');

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
  const data = {
    ...serviceData,
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(servicesCollection, data);
  return docRef.id;
};

export const updateService = async (id, serviceData) => {
  const docRef = doc(db, 'services_new', id);
  await updateDoc(docRef, {
    ...serviceData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteService = async (id) => {
  const docRef = doc(db, 'services_new', id);
  await deleteDoc(docRef);
};

export const duplicateService = async (id) => {
  const service = await getServiceById(id);
  if (!service) throw new Error('Service not found');
  
  const { id: _, updatedAt, ...serviceData } = service;
  
  // Add " (Copy)" to the name fields
  if (serviceData.name_sor) serviceData.name_sor += ' (نووسخە)';
  if (serviceData.name_bad) serviceData.name_bad += ' (نووسخە)';
  if (serviceData.name_ar) serviceData.name_ar += ' (نسخة)';
  if (serviceData.name_en) serviceData.name_en += ' (Copy)';
  
  return await createService(serviceData);
};

export const searchServices = async (searchTerm, language = 'sor') => {
  const allServices = await getAllServices();
  const searchLower = searchTerm.toLowerCase();
  
  return allServices.filter(service => {
    const name = service[`name_${language}`];
    const job = service[`job_${language}`];
    const jobTitle = service[`jobtitle_${language}`];
    
    return (
      (name && name.toLowerCase().includes(searchLower)) ||
      (job && job.toLowerCase().includes(searchLower)) ||
      (jobTitle && jobTitle.toLowerCase().includes(searchLower))
    );
  });
};

// ================== CATEGORIES ==================

export const categoriesCollection = collection(db, 'categories_new');

export const getAllCategories = async () => {
  const snapshot = await getDocs(categoriesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getCategoryById = async (id) => {
  const docRef = doc(db, 'categories_new', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const createCategory = async (categoryData) => {
  const data = {
    ...categoryData,
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(categoriesCollection, data);
  return docRef.id;
};

export const updateCategory = async (id, categoryData) => {
  const docRef = doc(db, 'categories_new', id);
  await updateDoc(docRef, {
    ...categoryData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteCategory = async (id) => {
  const docRef = doc(db, 'categories_new', id);
  await deleteDoc(docRef);
};

export const duplicateCategory = async (id) => {
  const category = await getCategoryById(id);
  if (!category) throw new Error('Category not found');
  
  const { id: _, updatedAt, ...categoryData } = category;
  
  // Add " (Copy)" to the name fields
  if (categoryData.name_sor) categoryData.name_sor += ' (نووسخە)';
  if (categoryData.name_bad) categoryData.name_bad += ' (نووسخە)';
  if (categoryData.name_ar) categoryData.name_ar += ' (نسخة)';
  if (categoryData.name_en) categoryData.name_en += ' (Copy)';
  
  return await createCategory(categoryData);
};

// ================== TAGS ==================

export const tagsCollection = collection(db, 'tags_new');

export const getAllTags = async () => {
  const snapshot = await getDocs(tagsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getTagById = async (id) => {
  const docRef = doc(db, 'tags_new', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const createTag = async (tagData) => {
  const data = {
    ...tagData,
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(tagsCollection, data);
  return docRef.id;
};

export const updateTag = async (id, tagData) => {
  const docRef = doc(db, 'tags_new', id);
  await updateDoc(docRef, {
    ...tagData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteTag = async (id) => {
  const docRef = doc(db, 'tags_new', id);
  await deleteDoc(docRef);
};

export const duplicateTag = async (id) => {
  const tag = await getTagById(id);
  if (!tag) throw new Error('Tag not found');
  
  const { id: _, updatedAt, ...tagData } = tag;
  
  // Add " (Copy)" to the name fields
  if (tagData.tagsname_sor) tagData.tagsname_sor += ' (نووسخە)';
  if (tagData.tagsname_bad) tagData.tagsname_bad += ' (نووسخە)';
  if (tagData.tagsname_ar) tagData.tagsname_ar += ' (نسخة)';
  if (tagData.tagsname_en) tagData.tagsname_en += ' (Copy)';
  
  return await createTag(tagData);
};

// ================== BULK OPERATIONS ==================

export const bulkDeleteServices = async (ids) => {
  const promises = ids.map(id => deleteService(id));
  await Promise.all(promises);
};

export const bulkDeleteCategories = async (ids) => {
  const promises = ids.map(id => deleteCategory(id));
  await Promise.all(promises);
};

export const bulkDeleteTags = async (ids) => {
  const promises = ids.map(id => deleteTag(id));
  await Promise.all(promises);
};

// ================== USERS ==================

export const usersCollection = collection(db, 'users_new');

export const getAllUsers = async () => {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getUserById = async (id) => {
  const docRef = doc(db, 'users_new', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

export const getUserByEmail = async (email) => {
  const q = query(usersCollection, where('email', '==', email));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
};

export const createUser = async (userData) => {
  const data = {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(usersCollection, data);
  return docRef.id;
};

export const updateUser = async (id, userData) => {
  const docRef = doc(db, 'users_new', id);
  await updateDoc(docRef, {
    ...userData,
    updatedAt: serverTimestamp(),
  });
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
    servicesCount: services.length,
    categoriesCount: categories.length,
    tagsCount: tags.length,
    usersCount: users.length,
  };
};
