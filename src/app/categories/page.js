// // NEW 4


// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { getAllCategories } from '../../lib/firestore';
// import { app } from '../../lib/firebase';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import LanguageTabs from '../../components/LanguageTabs';
// import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
// import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);

// export default function CategoriesPage() {
//   const { canAccess, canAccessCategory } = useAuth();
//   const [categories, setCategories]           = useState([]);
//   const [filteredCategories, setFilteredCategories] = useState([]);
//   const [loading, setLoading]                 = useState(true);
//   const [searchTerm, setSearchTerm]           = useState('');
//   const [showModal, setShowModal]             = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [confirmDialog, setConfirmDialog]     = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

//   const emptyForm = {
//     name_sor: '', name_bad: '', name_ar: '', name_en: '',
//     icon_sor: '', icon_bad: '', icon_ar: '', icon_en: '',
//     sortingorder_sor: 0, sortingorder_bad: 0, sortingorder_ar: 0, sortingorder_en: 0,
//     visibility_sor: true, visibility_bad: true, visibility_ar: true, visibility_en: true,
//   };
//   const [formData, setFormData] = useState(emptyForm);

//   useEffect(() => {
//     if (canAccess('categories_new')) loadCategories();
//   }, []);

//   useEffect(() => {
//     filterCategories();
//   }, [searchTerm, categories]);

//   const loadCategories = async () => {
//     try {
//       const data = await getAllCategories();
//       // Filter to only categories this user can access
//       const accessible = data.filter(cat => canAccessCategory(cat.id));
//       setCategories(accessible);
//     } catch (error) {
//       console.error('Error loading categories:', error);
//       toast.error('Failed to load categories');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterCategories = () => {
//     if (!searchTerm.trim()) { setFilteredCategories(categories); return; }
//     const term = searchTerm.toLowerCase();
//     setFilteredCategories(categories.filter(cat =>
//       cat.name_sor?.toLowerCase().includes(term) ||
//       cat.name_bad?.toLowerCase().includes(term) ||
//       cat.name_ar?.toLowerCase().includes(term)  ||
//       cat.name_en?.toLowerCase().includes(term)
//     ));
//   };

//   const handleOpenModal = (category = null) => {
//     if (category) {
//       setEditingCategory(category);
//       setFormData({
//         name_sor: category.name_sor || '', name_bad: category.name_bad || '',
//         name_ar:  category.name_ar  || '', name_en:  category.name_en  || '',
//         icon_sor: category.icon_sor || '', icon_bad: category.icon_bad || '',
//         icon_ar:  category.icon_ar  || '', icon_en:  category.icon_en  || '',
//         sortingorder_sor: category.sortingorder_sor || 0,
//         sortingorder_bad: category.sortingorder_bad || 0,
//         sortingorder_ar:  category.sortingorder_ar  || 0,
//         sortingorder_en:  category.sortingorder_en  || 0,
//         visibility_sor: category.visibility_sor ?? true,
//         visibility_bad: category.visibility_bad ?? true,
//         visibility_ar:  category.visibility_ar  ?? true,
//         visibility_en:  category.visibility_en  ?? true,
//       });
//     } else {
//       setEditingCategory(null);
//       setFormData(emptyForm);
//     }
//     setShowModal(true);
//   };

//   const handleCloseModal = () => { setShowModal(false); setEditingCategory(null); };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const fn = httpsCallable(functions, 'createOrUpdateCategory');
//       const result = await fn({
//         id: editingCategory?.id || null,
//         categoryData: formData,
//       });
//       toast.success(result.data.action === 'updated' ? 'Category updated!' : 'Category created!');
//       await loadCategories();
//       handleCloseModal();
//     } catch (error) {
//       console.error('Error saving category:', error);
//       toast.error(error.message || 'Failed to save category');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = (id) => {
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Category?',
//       message: 'Are you sure you want to delete this category?',
//       onConfirm: async () => {
//         try {
//           const fn = httpsCallable(functions, 'deleteItems');
//           await fn({ collection: 'categories_new', ids: [id] });
//           toast.success('Category deleted successfully!');
//           await loadCategories();
//         } catch (error) {
//           toast.error(error.message || 'Failed to delete category');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };

//   const handleDuplicate = async (id) => {
//     setLoading(true);
//     try {
//       const fn = httpsCallable(functions, 'duplicateItem');
//       await fn({ collection: 'categories_new', id });
//       toast.success('Category duplicated successfully!');
//       await loadCategories();
//     } catch (error) {
//       toast.error(error.message || 'Failed to duplicate category');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBulkDelete = () => {
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Selected Categories?',
//       message: `Are you sure you want to delete ${selectedCategories.length} selected categories?`,
//       onConfirm: async () => {
//         try {
//           const fn = httpsCallable(functions, 'deleteItems');
//           await fn({ collection: 'categories_new', ids: selectedCategories });
//           toast.success(`${selectedCategories.length} categories deleted successfully!`);
//           setSelectedCategories([]);
//           await loadCategories();
//         } catch (error) {
//           toast.error(error.message || 'Failed to delete categories');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };

//   if (!canAccess('categories_new')) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-xl text-gray-600">You don't have access to this page.</p>
//       </div>
//     );
//   }

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8">

//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
//               <p className="text-gray-600 mt-1">Manage all categories</p>
//             </div>
//             <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
//               <FiPlus size={20} /> Add New Category
//             </button>
//           </div>

//           <div className="card mb-6">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1 relative">
//                 <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search categories..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="input pl-10 pr-10 w-full"
//                 />
//                 {searchTerm && (
//                   <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Clear search">
//                     <FiX size={16} />
//                   </button>
//                 )}
//               </div>
//               {selectedCategories.length > 0 && (
//                 <button onClick={handleBulkDelete} className="btn btn-danger flex items-center gap-2">
//                   <FiTrash2 /> Delete {selectedCategories.length} selected
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Result count + divider */}
//           {!loading && (
//             <div className="flex items-center gap-3 mb-4">
//               <p className="text-sm text-gray-500 shrink-0">
//                 {searchTerm
//                   ? `${filteredCategories.length} of ${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`
//                   : `${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`}
//               </p>
//               <div className="flex-1 h-px bg-gray-200" />
//             </div>
//           )}

//           {loading && !categories.length ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//             </div>
//           ) : filteredCategories.length === 0 ? (
//             <div className="card text-center py-12">
//               <p className="text-gray-600">No categories found</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {filteredCategories.map((category) => (
//                 <div key={category.id} className="card hover:shadow-lg transition-all">
//                   <div className="flex items-start justify-between mb-3">
//                     <input
//                       type="checkbox"
//                       title="checkbox"
//                       checked={selectedCategories.includes(category.id)}
//                       onChange={(e) => {
//                         if (e.target.checked) setSelectedCategories([...selectedCategories, category.id]);
//                         else setSelectedCategories(selectedCategories.filter(id => id !== category.id));
//                       }}
//                       className="w-4 h-4 text-primary rounded"
//                     />
//                     <div className="flex gap-1">
//                       <button onClick={() => handleOpenModal(category)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit">
//                         <FiEdit2 size={16} className="text-gray-600" />
//                       </button>
//                       <button onClick={() => handleDuplicate(category.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate">
//                         <FiCopy size={16} className="text-gray-600" />
//                       </button>
//                       <button onClick={() => handleDelete(category.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete">
//                         <FiTrash2 size={16} className="text-red-600" />
//                       </button>
//                     </div>
//                   </div>

//                   {category.icon_sor && (
//                     <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
//                       <img src={category.icon_sor} alt={category.name_sor} className="w-full h-full object-cover" />
//                     </div>
//                   )}

//                   <div className="space-y-1">
//                     {category.name_sor && <p className="text-sm font-semibold">{category.name_sor}</p>}
//                     {category.name_en  && <p className="text-sm text-gray-600">{category.name_en}</p>}
//                     <div className="flex items-center gap-2 mt-2">
//                       <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
//                         Order: {category.sortingorder_sor || 0}
//                       </span>
//                       {category.visibility_sor
//                         ? <FiEye className="text-green-600" size={16} />
//                         : <FiEyeOff className="text-gray-400" size={16} />
//                       }
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </main>
//       </div>

//       <DeleteConfirmDialog
//         isOpen={confirmDialog.isOpen}
//         onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
//         onConfirm={confirmDialog.onConfirm}
//         title={confirmDialog.title}
//         message={confirmDialog.message}
//       />

//       {showModal && (
//         <div className="modal-overlay" onClick={handleCloseModal}>
//           <div className="modal" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
//               <button onClick={handleCloseModal} title="Close"><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div className="modal-body">
//                 <LanguageTabs>
//                   {(lang) => (
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Category Name ({lang.toUpperCase()}) *</label>
//                         <input type="text" value={formData[`name_${lang}`]} onChange={(e) => setFormData({ ...formData, [`name_${lang}`]: e.target.value })} className="input" placeholder={`Enter category name in ${lang}`} required />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Icon URL ({lang.toUpperCase()})</label>
//                         <input type="url" value={formData[`icon_${lang}`]} onChange={(e) => setFormData({ ...formData, [`icon_${lang}`]: e.target.value })} className="input" placeholder="https://example.com/icon.png" />
//                         {formData[`icon_${lang}`] && (
//                           <div className="mt-2"><img src={formData[`icon_${lang}`]} alt="Preview" className="w-32 h-32 object-cover rounded" /></div>
//                         )}
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Sorting Order ({lang.toUpperCase()})</label>
//                         <input type="number" value={formData[`sortingorder_${lang}`]} onChange={(e) => setFormData({ ...formData, [`sortingorder_${lang}`]: parseInt(e.target.value) || 0 })} className="input" placeholder="0" />
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <input type="checkbox" id={`visibility_${lang}`} checked={formData[`visibility_${lang}`]} onChange={(e) => setFormData({ ...formData, [`visibility_${lang}`]: e.target.checked })} className="w-4 h-4 text-primary rounded" />
//                         <label htmlFor={`visibility_${lang}`} className="text-sm font-medium text-gray-700">Visible in {lang.toUpperCase()}</label>
//                       </div>
//                     </div>
//                   )}
//                 </LanguageTabs>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editingCategory ? 'Update' : 'Create'}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </ProtectedRoute>
//   );
// }


// NEW 5 


// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { getAllCategories } from '../../lib/firestore';
// import { app } from '../../lib/firebase';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import LanguageTabs from '../../components/LanguageTabs';
// import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
// import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);
// const LANGS = ['sor', 'bad', 'ar', 'en'];

// // ── Parse Firestore array field → string[] ───────────────────────────────────
// // dart: _convertToStringListMap reads as List directly
// const parseStringList = (value) => {
//   if (!value) return [];
//   if (Array.isArray(value)) return value.map(String).filter(Boolean);
//   if (typeof value === 'object') return Object.values(value).map(String).filter(Boolean);
//   return [];
// };

// // ── Parse documenttagsdata → array of {sor, bad, ar, en} tag objects ─────────
// // dart: _convertToListMap reads 'documenttagsdata' as List<Map<String,String>>
// const parseDocumentTags = (value) => {
//   if (!value || !Array.isArray(value)) return [];
//   return value.map(tag => ({
//     sor: tag.sor || tag.documenttags_sor || '',
//     bad: tag.bad || tag.documenttags_bad || '',
//     ar:  tag.ar  || tag.documenttags_ar  || '',
//     en:  tag.en  || tag.documenttags_en  || '',
//   }));
// };

// // ── Empty form ────────────────────────────────────────────────────────────────
// const makeEmptyForm = () => {
//   const f = { json_export_name: '', documenttagsdata: [] };
//   LANGS.forEach(l => {
//     f[`name_${l}`]               = '';
//     f[`icon_${l}`]               = '';
//     f[`sortingorder_${l}`]       = '';
//     f[`visibility_${l}`]         = true;
//     f[`enablemapview_${l}`]      = false;
//     f[`shuffle_${l}`]            = false;
//     f[`sortingbydate_${l}`]      = false;
//     f[`sortingbynumber_${l}`]    = false;
//     f[`categoryinfo1_${l}`]      = '';
//     f[`categoryinfo2_${l}`]      = '';
//     f[`searchinfohome_${l}`]     = '';
//     f[`searchinfodocument_${l}`] = '';
//     f[`senderreportemail_${l}`]  = '';
//     f[`receiverreportemail_${l}`]= '';
//     f[`sendingpass_${l}`]        = '';
//     f[`categorytags_${l}`]       = [];   // List<String>
//     f[`searchwords_${l}`]        = [];   // List<String>
//     f[`reportingoptions_${l}`]   = [];   // List<String>
//     f[`advertaisingdata_${l}`]   = [];   // List<String>
//   });
//   return f;
// };

// // ── Parse existing category doc → form shape ─────────────────────────────────
// const categoryToForm = (c) => {
//   const f = {
//     json_export_name: c.json_export_name || '',
//     documenttagsdata: parseDocumentTags(c.documenttagsdata),
//   };
//   LANGS.forEach(l => {
//     f[`name_${l}`]               = c[`name_${l}`]               || '';
//     f[`icon_${l}`]               = c[`icon_${l}`]               || '';
//     f[`sortingorder_${l}`]       = c[`sortingorder_${l}`] != null ? String(c[`sortingorder_${l}`]) : '';
//     f[`visibility_${l}`]         = c[`visibility_${l}`]         ?? true;
//     f[`enablemapview_${l}`]      = c[`enablemapview_${l}`]      ?? false;
//     f[`shuffle_${l}`]            = c[`shuffle_${l}`]            ?? false;
//     f[`sortingbydate_${l}`]      = c[`sortingbydate_${l}`]      ?? false;
//     f[`sortingbynumber_${l}`]    = c[`sortingbynumber_${l}`]    ?? false;
//     f[`categoryinfo1_${l}`]      = c[`categoryinfo1_${l}`]      || '';
//     f[`categoryinfo2_${l}`]      = c[`categoryinfo2_${l}`]      || '';
//     f[`searchinfohome_${l}`]     = c[`searchinfohome_${l}`]     || '';
//     f[`searchinfodocument_${l}`] = c[`searchinfodocument_${l}`] || '';
//     f[`senderreportemail_${l}`]  = c[`senderreportemail_${l}`]  || '';
//     f[`receiverreportemail_${l}`]= c[`receiverreportemail_${l}`]|| '';
//     f[`sendingpass_${l}`]        = c[`sendingpass_${l}`]        || '';
//     f[`categorytags_${l}`]       = parseStringList(c[`categorytags_${l}`]);
//     f[`searchwords_${l}`]        = parseStringList(c[`searchwords_${l}`]);
//     f[`reportingoptions_${l}`]   = parseStringList(c[`reportingoptions_${l}`]);
//     f[`advertaisingdata_${l}`]   = parseStringList(c[`advertaisingdata_${l}`]);
//   });
//   return f;
// };

// // ── Convert form → Firestore categoryData ────────────────────────────────────
// // Must match CategoryNew.toMap() exactly
// const formToCategoryData = (f) => {
//   const out = {};

//   // Shared fields
//   if (f.json_export_name) out.json_export_name = f.json_export_name;
//   // documenttagsdata: List<Map<String,String>> — only write if non-empty
//   if (f.documenttagsdata && f.documenttagsdata.length > 0) {
//     out.documenttagsdata = f.documenttagsdata.map(tag => ({
//       sor: tag.sor || '',
//       bad: tag.bad || '',
//       ar:  tag.ar  || '',
//       en:  tag.en  || '',
//     }));
//   }

//   LANGS.forEach(l => {
//     // Strings — only write if non-empty (matches dart: if (x != null) map[key] = x)
//     if (f[`name_${l}`])               out[`name_${l}`]               = f[`name_${l}`];
//     if (f[`icon_${l}`])               out[`icon_${l}`]               = f[`icon_${l}`];
//     if (f[`categoryinfo1_${l}`])      out[`categoryinfo1_${l}`]      = f[`categoryinfo1_${l}`];
//     if (f[`categoryinfo2_${l}`])      out[`categoryinfo2_${l}`]      = f[`categoryinfo2_${l}`];
//     if (f[`searchinfohome_${l}`])     out[`searchinfohome_${l}`]     = f[`searchinfohome_${l}`];
//     if (f[`searchinfodocument_${l}`]) out[`searchinfodocument_${l}`] = f[`searchinfodocument_${l}`];
//     if (f[`senderreportemail_${l}`])  out[`senderreportemail_${l}`]  = f[`senderreportemail_${l}`];
//     if (f[`receiverreportemail_${l}`])out[`receiverreportemail_${l}`]= f[`receiverreportemail_${l}`];
//     if (f[`sendingpass_${l}`])        out[`sendingpass_${l}`]        = f[`sendingpass_${l}`];

//     // Int — sortingorder
//     const so = f[`sortingorder_${l}`];
//     if (so !== '' && so != null) out[`sortingorder_${l}`] = parseInt(so, 10);

//     // Booleans — always write (dart _addMapToFirestore writes if key exists in sourceMap)
//     out[`visibility_${l}`]      = f[`visibility_${l}`];
//     out[`enablemapview_${l}`]   = f[`enablemapview_${l}`];
//     out[`shuffle_${l}`]         = f[`shuffle_${l}`];
//     out[`sortingbydate_${l}`]   = f[`sortingbydate_${l}`];
//     out[`sortingbynumber_${l}`] = f[`sortingbynumber_${l}`];

//     // Lists — only write if non-empty
//     if (f[`categorytags_${l}`]?.length > 0)     out[`categorytags_${l}`]     = f[`categorytags_${l}`];
//     if (f[`searchwords_${l}`]?.length > 0)       out[`searchwords_${l}`]      = f[`searchwords_${l}`];
//     if (f[`reportingoptions_${l}`]?.length > 0)  out[`reportingoptions_${l}`] = f[`reportingoptions_${l}`];
//     if (f[`advertaisingdata_${l}`]?.length > 0)  out[`advertaisingdata_${l}`] = f[`advertaisingdata_${l}`];
//   });

//   return out;
// };

// // ── Array field helpers ───────────────────────────────────────────────────────
// const updateStringList = (formData, setFormData, key, idx, value) => {
//   const arr = [...(formData[key] || [])];
//   if (value === null) arr.splice(idx, 1);
//   else arr[idx] = value;
//   setFormData(prev => ({ ...prev, [key]: arr }));
// };
// const addStringListItem = (setFormData, key) =>
//   setFormData(prev => ({ ...prev, [key]: [...(prev[key] || []), ''] }));

// export default function CategoriesPage() {
//   const { canAccess, canAccessCategory } = useAuth();
//   const [categories, setCategories]           = useState([]);
//   const [filteredCategories, setFilteredCategories] = useState([]);
//   const [loading, setLoading]                 = useState(true);
//   const [searchTerm, setSearchTerm]           = useState('');
//   const [showModal, setShowModal]             = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [confirmDialog, setConfirmDialog]     = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
//   const [formData, setFormData]               = useState(makeEmptyForm());

//   useEffect(() => {
//     if (canAccess('categories_new')) loadCategories();
//   }, []);

//   useEffect(() => { filterCategories(); }, [searchTerm, categories]);

//   const loadCategories = async () => {
//     try {
//       const data = await getAllCategories();
//       const accessible = data.filter(cat => canAccessCategory(cat.id));
//       setCategories(accessible);
//     } catch (error) {
//       console.error('Error loading categories:', error);
//       toast.error('Failed to load categories');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterCategories = () => {
//     if (!searchTerm.trim()) { setFilteredCategories(categories); return; }
//     const term = searchTerm.toLowerCase();
//     setFilteredCategories(categories.filter(cat =>
//       cat.name_sor?.toLowerCase().includes(term) ||
//       cat.name_bad?.toLowerCase().includes(term) ||
//       cat.name_ar?.toLowerCase().includes(term)  ||
//       cat.name_en?.toLowerCase().includes(term)
//     ));
//   };

//   const handleOpenModal = (category = null) => {
//     if (category) {
//       setEditingCategory(category);
//       setFormData(categoryToForm(category));
//     } else {
//       setEditingCategory(null);
//       setFormData(makeEmptyForm());
//     }
//     setShowModal(true);
//   };

//   const handleCloseModal = () => { setShowModal(false); setEditingCategory(null); };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const categoryData = formToCategoryData(formData);
//       const fn = httpsCallable(functions, 'createOrUpdateCategory');
//       const result = await fn({ id: editingCategory?.id || null, categoryData });
//       toast.success(result.data.action === 'updated' ? 'Category updated!' : 'Category created!');
//       await loadCategories();
//       handleCloseModal();
//     } catch (error) {
//       console.error('Error saving category:', error);
//       toast.error(error.message || 'Failed to save category');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = (id) => {
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Category?',
//       message: 'Are you sure you want to delete this category?',
//       onConfirm: async () => {
//         try {
//           const fn = httpsCallable(functions, 'deleteItems');
//           await fn({ collection: 'categories_new', ids: [id] });
//           toast.success('Category deleted successfully!');
//           await loadCategories();
//         } catch (error) {
//           toast.error(error.message || 'Failed to delete category');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };

//   const handleDuplicate = async (id) => {
//     setLoading(true);
//     try {
//       const fn = httpsCallable(functions, 'duplicateItem');
//       await fn({ collection: 'categories_new', id });
//       toast.success('Category duplicated successfully!');
//       await loadCategories();
//     } catch (error) {
//       toast.error(error.message || 'Failed to duplicate category');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBulkDelete = () => {
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Selected Categories?',
//       message: `Are you sure you want to delete ${selectedCategories.length} selected categories?`,
//       onConfirm: async () => {
//         try {
//           const fn = httpsCallable(functions, 'deleteItems');
//           await fn({ collection: 'categories_new', ids: selectedCategories });
//           toast.success(`${selectedCategories.length} categories deleted successfully!`);
//           setSelectedCategories([]);
//           await loadCategories();
//         } catch (error) {
//           toast.error(error.message || 'Failed to delete categories');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };

//   // ── Document tags helpers ─────────────────────────────────────────────────
//   const addDocumentTag = () =>
//     setFormData(prev => ({ ...prev, documenttagsdata: [...prev.documenttagsdata, { sor: '', bad: '', ar: '', en: '' }] }));
//   const updateDocumentTag = (idx, lang, value) => {
//     const tags = [...formData.documenttagsdata];
//     tags[idx] = { ...tags[idx], [lang]: value };
//     setFormData(prev => ({ ...prev, documenttagsdata: tags }));
//   };
//   const removeDocumentTag = (idx) =>
//     setFormData(prev => ({ ...prev, documenttagsdata: prev.documenttagsdata.filter((_, i) => i !== idx) }));

//   if (!canAccess('categories_new')) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-xl text-gray-600">You don't have access to this page.</p>
//       </div>
//     );
//   }

//   const SectionHeader = ({ title }) => (
//     <h3 className="text-base font-semibold text-gray-800 border-b pb-2 mb-4 mt-8">{title}</h3>
//   );

//   // ── Reusable string-list editor ───────────────────────────────────────────
//   const StringListEditor = ({ fieldKey, placeholder, addLabel }) => (
//     <div className="space-y-2">
//       {(formData[fieldKey] || []).map((item, idx) => (
//         <div key={idx} className="flex gap-2">
//           <input
//             type="text"
//             value={item}
//             onChange={(e) => updateStringList(formData, setFormData, fieldKey, idx, e.target.value)}
//             className="input flex-1 text-sm"
//             placeholder={placeholder}
//           />
//           <button type="button" onClick={() => updateStringList(formData, setFormData, fieldKey, idx, null)} className="text-red-400 hover:text-red-600 px-2">
//             <FiX size={14} />
//           </button>
//         </div>
//       ))}
//       <button type="button" onClick={() => addStringListItem(setFormData, fieldKey)} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
//         <FiPlus size={12} /> {addLabel}
//       </button>
//     </div>
//   );

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8">

//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
//               <p className="text-gray-600 mt-1">Manage all categories</p>
//             </div>
//             <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
//               <FiPlus size={20} /> Add New Category
//             </button>
//           </div>

//           <div className="card mb-6">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1 relative">
//                 <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input type="text" placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10 pr-10 w-full" />
//                 {searchTerm && (
//                   <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Clear search"><FiX size={16} /></button>
//                 )}
//               </div>
//               {selectedCategories.length > 0 && (
//                 <button onClick={handleBulkDelete} className="btn btn-danger flex items-center gap-2">
//                   <FiTrash2 /> Delete {selectedCategories.length} selected
//                 </button>
//               )}
//             </div>
//           </div>

//           {!loading && (
//             <div className="flex items-center gap-3 mb-4">
//               <p className="text-sm text-gray-500 shrink-0">
//                 {searchTerm
//                   ? `${filteredCategories.length} of ${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`
//                   : `${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`}
//               </p>
//               <div className="flex-1 h-px bg-gray-200" />
//             </div>
//           )}

//           {loading && !categories.length ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//             </div>
//           ) : filteredCategories.length === 0 ? (
//             <div className="card text-center py-12"><p className="text-gray-600">No categories found</p></div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {filteredCategories.map((category) => (
//                 <div key={category.id} className="card hover:shadow-lg transition-all">
//                   <div className="flex items-start justify-between mb-3">
//                     <input type="checkbox" title="checkbox" checked={selectedCategories.includes(category.id)} onChange={(e) => { if (e.target.checked) setSelectedCategories([...selectedCategories, category.id]); else setSelectedCategories(selectedCategories.filter(id => id !== category.id)); }} className="w-4 h-4 text-primary rounded" />
//                     <div className="flex gap-1">
//                       <button onClick={() => handleOpenModal(category)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit"><FiEdit2 size={16} className="text-gray-600" /></button>
//                       <button onClick={() => handleDuplicate(category.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate"><FiCopy size={16} className="text-gray-600" /></button>
//                       <button onClick={() => handleDelete(category.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete"><FiTrash2 size={16} className="text-red-600" /></button>
//                     </div>
//                   </div>
//                   {category.icon_sor && (
//                     <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
//                       <img src={category.icon_sor} alt={category.name_sor} className="w-full h-full object-cover" />
//                     </div>
//                   )}
//                   <div className="space-y-1">
//                     {category.name_sor && <p className="text-sm font-semibold">{category.name_sor}</p>}
//                     {category.name_en  && <p className="text-sm text-gray-600">{category.name_en}</p>}
//                     <div className="flex items-center gap-2 mt-2">
//                       <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Order: {category.sortingorder_sor || 0}</span>
//                       {category.visibility_sor ? <FiEye className="text-green-600" size={16} /> : <FiEyeOff className="text-gray-400" size={16} />}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </main>
//       </div>

//       <DeleteConfirmDialog
//         isOpen={confirmDialog.isOpen}
//         onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
//         onConfirm={confirmDialog.onConfirm}
//         title={confirmDialog.title}
//         message={confirmDialog.message}
//       />

//       {/* ════════════════════════════════════════════════════════════════════════
//           MODAL — Create / Edit Category
//       ════════════════════════════════════════════════════════════════════════ */}
//       {showModal && (
//         <div className="modal-overlay" onClick={handleCloseModal}>
//           <div className="modal max-w-4xl" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
//               <button onClick={handleCloseModal} title="Close"><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="modal-body space-y-0">

//                 {/* ── Shared: JSON Export Name ──────────────────────────────── */}
//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">JSON Export Name</label>
//                   <input
//                     type="text"
//                     value={formData.json_export_name}
//                     onChange={(e) => setFormData(prev => ({ ...prev, json_export_name: e.target.value }))}
//                     className="input"
//                     placeholder="e.g. hospitals (used by mobile app to fetch JSON)"
//                   />
//                 </div>

//                 {/* ── Per-language fields ───────────────────────────────────── */}
//                 <LanguageTabs>
//                   {(lang) => (
//                     <div className="space-y-4 pt-2">

//                       {/* Name + Icon */}
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Name ({lang.toUpperCase()}) *</label>
//                           <input type="text" value={formData[`name_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`name_${lang}`]: e.target.value }))} className="input" placeholder="Category name" required={lang === 'sor'} />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Sorting Order ({lang.toUpperCase()})</label>
//                           <input type="number" value={formData[`sortingorder_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`sortingorder_${lang}`]: e.target.value }))} className="input" placeholder="0" />
//                         </div>
//                       </div>

//                       {/* Icon URL */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL ({lang.toUpperCase()})</label>
//                         <input type="url" value={formData[`icon_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`icon_${lang}`]: e.target.value }))} className="input" placeholder="https://example.com/icon.png" />
//                         {formData[`icon_${lang}`] && <img src={formData[`icon_${lang}`]} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded" />}
//                       </div>

//                       {/* Booleans */}
//                       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                         {[
//                           { key: `visibility_${lang}`,      label: 'Visible'          },
//                           { key: `enablemapview_${lang}`,   label: 'Enable Map View'  },
//                           { key: `shuffle_${lang}`,         label: 'Shuffle'          },
//                           { key: `sortingbydate_${lang}`,   label: 'Sort by Date'     },
//                           { key: `sortingbynumber_${lang}`, label: 'Sort by Number'   },
//                         ].map(({ key, label }) => (
//                           <div key={key} className="flex items-center gap-2">
//                             <input type="checkbox" id={key} checked={formData[key]} onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.checked }))} className="w-4 h-4 text-primary rounded" />
//                             <label htmlFor={key} className="text-sm text-gray-700">{label}</label>
//                           </div>
//                         ))}
//                       </div>

//                       {/* Info fields */}
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Category Info 1 ({lang.toUpperCase()})</label>
//                           <input type="text" value={formData[`categoryinfo1_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`categoryinfo1_${lang}`]: e.target.value }))} className="input" placeholder="Info text 1" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Category Info 2 ({lang.toUpperCase()})</label>
//                           <input type="text" value={formData[`categoryinfo2_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`categoryinfo2_${lang}`]: e.target.value }))} className="input" placeholder="Info text 2" />
//                         </div>
//                       </div>

//                       {/* Search info */}
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Search Info Home ({lang.toUpperCase()})</label>
//                           <input type="text" value={formData[`searchinfohome_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`searchinfohome_${lang}`]: e.target.value }))} className="input" placeholder="Home search hint" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Search Info Document ({lang.toUpperCase()})</label>
//                           <input type="text" value={formData[`searchinfodocument_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`searchinfodocument_${lang}`]: e.target.value }))} className="input" placeholder="Document search hint" />
//                         </div>
//                       </div>

//                       {/* Reporting emails + sending pass */}
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Sender Report Email ({lang.toUpperCase()})</label>
//                           <input type="email" value={formData[`senderreportemail_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`senderreportemail_${lang}`]: e.target.value }))} className="input" placeholder="sender@example.com" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Report Email ({lang.toUpperCase()})</label>
//                           <input type="email" value={formData[`receiverreportemail_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`receiverreportemail_${lang}`]: e.target.value }))} className="input" placeholder="receiver@example.com" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Sending Password ({lang.toUpperCase()})</label>
//                           <input type="password" value={formData[`sendingpass_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`sendingpass_${lang}`]: e.target.value }))} className="input" placeholder="Email app password" />
//                         </div>
//                       </div>

//                       {/* Category Tags */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Category Tags ({lang.toUpperCase()})</label>
//                         <StringListEditor fieldKey={`categorytags_${lang}`} placeholder="Tag name" addLabel="Add Tag" />
//                       </div>

//                       {/* Search Words */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Search Words ({lang.toUpperCase()})</label>
//                         <StringListEditor fieldKey={`searchwords_${lang}`} placeholder="Search keyword" addLabel="Add Search Word" />
//                       </div>

//                       {/* Reporting Options */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Options ({lang.toUpperCase()})</label>
//                         <StringListEditor fieldKey={`reportingoptions_${lang}`} placeholder="e.g. Spam" addLabel="Add Option" />
//                       </div>

//                       {/* Advertising Data */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Advertising Data ({lang.toUpperCase()})</label>
//                         <StringListEditor fieldKey={`advertaisingdata_${lang}`} placeholder="Ad data entry" addLabel="Add Entry" />
//                       </div>

//                     </div>
//                   )}
//                 </LanguageTabs>

//                 {/* ── Document Tags (shared, not per-lang) ─────────────────── */}
//                 <SectionHeader title="Document Tags" />
//                 <p className="text-xs text-gray-500 -mt-2 mb-4">
//                   Stored as <code className="bg-gray-100 px-1 rounded">documenttagsdata</code> — a list of localized tag maps.
//                 </p>
//                 <div className="space-y-3">
//                   {formData.documenttagsdata.map((tag, idx) => (
//                     <div key={idx} className="border rounded-lg p-3 space-y-2 bg-gray-50">
//                       <div className="flex items-center justify-between mb-1">
//                         <span className="text-xs font-medium text-gray-500">Tag #{idx + 1}</span>
//                         <button type="button" onClick={() => removeDocumentTag(idx)} className="text-red-400 hover:text-red-600"><FiX size={14} /></button>
//                       </div>
//                       <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                         {LANGS.map(l => (
//                           <div key={l}>
//                             <label className="block text-xs text-gray-500 mb-0.5">{l.toUpperCase()}</label>
//                             <input type="text" value={tag[l] || ''} onChange={(e) => updateDocumentTag(idx, l, e.target.value)} className="input text-sm" placeholder={`Tag (${l})`} />
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                   <button type="button" onClick={addDocumentTag} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
//                     <FiPlus size={12} /> Add Document Tag
//                   </button>
//                 </div>

//               </div>{/* end modal-body */}

//               <div className="modal-footer">
//                 <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>
//                   {loading ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </ProtectedRoute>
//   );
// }



// NEW 6


// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { getAllCategories } from '../../lib/firestore';
// import { app } from '../../lib/firebase';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import LanguageTabs from '../../components/LanguageTabs';
// import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
// import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);
// const LANGS = ['sor', 'bad', 'ar', 'en'];

// // ── Parse Firestore array field → string[] ───────────────────────────────────
// // dart: _convertToStringListMap reads as List directly
// const parseStringList = (value) => {
//   if (!value) return [];
//   if (Array.isArray(value)) return value.map(String).filter(Boolean);
//   if (typeof value === 'object') return Object.values(value).map(String).filter(Boolean);
//   return [];
// };

// // ── Parse documenttagsdata entries ──────────────────────────────────────────
// // dart list_view.dart _loadTagsFromCategory() reads:
// //   tagMap['documenttags_$lang']    → tag name
// //   tagMap['documenttagspic_$lang'] → tag image
// // We use name_*/pic_* as internal form keys, serialise to the exact Firestore keys.
// const parseDocumentTags = (value) => {
//   if (!value || !Array.isArray(value)) return [];
//   return value.map(tag => ({
//     name_sor: tag.documenttags_sor    || tag.name_sor || tag.sor || '',
//     name_bad: tag.documenttags_bad    || tag.name_bad || tag.bad || '',
//     name_ar:  tag.documenttags_ar     || tag.name_ar  || tag.ar  || '',
//     name_en:  tag.documenttags_en     || tag.name_en  || tag.en  || '',
//     pic_sor:  tag.documenttagspic_sor || tag.pic_sor  || '',
//     pic_bad:  tag.documenttagspic_bad || tag.pic_bad  || '',
//     pic_ar:   tag.documenttagspic_ar  || tag.pic_ar   || '',
//     pic_en:   tag.documenttagspic_en  || tag.pic_en   || '',
//   }));
// };

// // ── Empty form ────────────────────────────────────────────────────────────────
// const makeEmptyForm = () => {
//   const f = { json_export_name: '', documenttagsdata: [] };
//   LANGS.forEach(l => {
//     f[`name_${l}`]               = '';
//     f[`icon_${l}`]               = '';
//     f[`sortingorder_${l}`]       = '';
//     f[`visibility_${l}`]         = true;
//     f[`enablemapview_${l}`]      = false;
//     f[`shuffle_${l}`]            = false;
//     f[`sortingbydate_${l}`]      = false;
//     f[`sortingbynumber_${l}`]    = false;
//     f[`categoryinfo1_${l}`]      = '';
//     f[`categoryinfo2_${l}`]      = '';
//     f[`searchinfohome_${l}`]     = '';
//     f[`searchinfodocument_${l}`] = '';
//     f[`senderreportemail_${l}`]  = '';
//     f[`receiverreportemail_${l}`]= '';
//     f[`sendingpass_${l}`]        = '';
//     f[`categorytags_${l}`]       = [];   // List<String>
//     f[`searchwords_${l}`]        = [];   // List<String>
//     f[`reportingoptions_${l}`]   = [];   // List<String>
//     f[`advertaisingdata_${l}`]   = [];   // List<String>
//   });
//   return f;
// };

// // ── Parse existing category doc → form shape ─────────────────────────────────
// const categoryToForm = (c) => {
//   const f = {
//     json_export_name: c.json_export_name || '',
//     documenttagsdata: parseDocumentTags(c.documenttagsdata),
//   };
//   LANGS.forEach(l => {
//     f[`name_${l}`]               = c[`name_${l}`]               || '';
//     f[`icon_${l}`]               = c[`icon_${l}`]               || '';
//     f[`sortingorder_${l}`]       = c[`sortingorder_${l}`] != null ? String(c[`sortingorder_${l}`]) : '';
//     f[`visibility_${l}`]         = c[`visibility_${l}`]         ?? true;
//     f[`enablemapview_${l}`]      = c[`enablemapview_${l}`]      ?? false;
//     f[`shuffle_${l}`]            = c[`shuffle_${l}`]            ?? false;
//     f[`sortingbydate_${l}`]      = c[`sortingbydate_${l}`]      ?? false;
//     f[`sortingbynumber_${l}`]    = c[`sortingbynumber_${l}`]    ?? false;
//     f[`categoryinfo1_${l}`]      = c[`categoryinfo1_${l}`]      || '';
//     f[`categoryinfo2_${l}`]      = c[`categoryinfo2_${l}`]      || '';
//     f[`searchinfohome_${l}`]     = c[`searchinfohome_${l}`]     || '';
//     f[`searchinfodocument_${l}`] = c[`searchinfodocument_${l}`] || '';
//     f[`senderreportemail_${l}`]  = c[`senderreportemail_${l}`]  || '';
//     f[`receiverreportemail_${l}`]= c[`receiverreportemail_${l}`]|| '';
//     f[`sendingpass_${l}`]        = c[`sendingpass_${l}`]        || '';
//     f[`categorytags_${l}`]       = parseStringList(c[`categorytags_${l}`]);
//     f[`searchwords_${l}`]        = parseStringList(c[`searchwords_${l}`]);
//     f[`reportingoptions_${l}`]   = parseStringList(c[`reportingoptions_${l}`]);
//     f[`advertaisingdata_${l}`]   = parseStringList(c[`advertaisingdata_${l}`]);
//   });
//   return f;
// };

// // ── Convert form → Firestore categoryData ────────────────────────────────────
// // Must match CategoryNew.toMap() exactly
// const formToCategoryData = (f) => {
//   const out = {};

//   // Shared fields
//   if (f.json_export_name) out.json_export_name = f.json_export_name;
//   // documenttagsdata: List<Map<String,String>> — only write if non-empty
//   if (f.documenttagsdata && f.documenttagsdata.length > 0) {
//     out.documenttagsdata = f.documenttagsdata.map(tag => ({
//       documenttags_sor:    tag.name_sor || '',
//       documenttags_bad:    tag.name_bad || '',
//       documenttags_ar:     tag.name_ar  || '',
//       documenttags_en:     tag.name_en  || '',
//       documenttagspic_sor: tag.pic_sor  || '',
//       documenttagspic_bad: tag.pic_bad  || '',
//       documenttagspic_ar:  tag.pic_ar   || '',
//       documenttagspic_en:  tag.pic_en   || '',
//     }));
//   }

//   LANGS.forEach(l => {
//     // Strings — only write if non-empty (matches dart: if (x != null) map[key] = x)
//     if (f[`name_${l}`])               out[`name_${l}`]               = f[`name_${l}`];
//     if (f[`icon_${l}`])               out[`icon_${l}`]               = f[`icon_${l}`];
//     if (f[`categoryinfo1_${l}`])      out[`categoryinfo1_${l}`]      = f[`categoryinfo1_${l}`];
//     if (f[`categoryinfo2_${l}`])      out[`categoryinfo2_${l}`]      = f[`categoryinfo2_${l}`];
//     if (f[`searchinfohome_${l}`])     out[`searchinfohome_${l}`]     = f[`searchinfohome_${l}`];
//     if (f[`searchinfodocument_${l}`]) out[`searchinfodocument_${l}`] = f[`searchinfodocument_${l}`];
//     if (f[`senderreportemail_${l}`])  out[`senderreportemail_${l}`]  = f[`senderreportemail_${l}`];
//     if (f[`receiverreportemail_${l}`])out[`receiverreportemail_${l}`]= f[`receiverreportemail_${l}`];
//     if (f[`sendingpass_${l}`])        out[`sendingpass_${l}`]        = f[`sendingpass_${l}`];

//     // Int — sortingorder
//     const so = f[`sortingorder_${l}`];
//     if (so !== '' && so != null) out[`sortingorder_${l}`] = parseInt(so, 10);

//     // Booleans — always write (dart _addMapToFirestore writes if key exists in sourceMap)
//     out[`visibility_${l}`]      = f[`visibility_${l}`];
//     out[`enablemapview_${l}`]   = f[`enablemapview_${l}`];
//     out[`shuffle_${l}`]         = f[`shuffle_${l}`];
//     out[`sortingbydate_${l}`]   = f[`sortingbydate_${l}`];
//     out[`sortingbynumber_${l}`] = f[`sortingbynumber_${l}`];

//     // Lists — only write if non-empty
//     if (f[`categorytags_${l}`]?.length > 0)     out[`categorytags_${l}`]     = f[`categorytags_${l}`];
//     if (f[`searchwords_${l}`]?.length > 0)       out[`searchwords_${l}`]      = f[`searchwords_${l}`];
//     if (f[`reportingoptions_${l}`]?.length > 0)  out[`reportingoptions_${l}`] = f[`reportingoptions_${l}`];
//     if (f[`advertaisingdata_${l}`]?.length > 0)  out[`advertaisingdata_${l}`] = f[`advertaisingdata_${l}`];
//   });

//   return out;
// };

// // ── Array field helpers ───────────────────────────────────────────────────────
// const updateStringList = (formData, setFormData, key, idx, value) => {
//   const arr = [...(formData[key] || [])];
//   if (value === null) arr.splice(idx, 1);
//   else arr[idx] = value;
//   setFormData(prev => ({ ...prev, [key]: arr }));
// };
// const addStringListItem = (setFormData, key) =>
//   setFormData(prev => ({ ...prev, [key]: [...(prev[key] || []), ''] }));

// export default function CategoriesPage() {
//   const { canAccess, canAccessCategory } = useAuth();
//   const [categories, setCategories]           = useState([]);
//   const [filteredCategories, setFilteredCategories] = useState([]);
//   const [loading, setLoading]                 = useState(true);
//   const [searchTerm, setSearchTerm]           = useState('');
//   const [showModal, setShowModal]             = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [confirmDialog, setConfirmDialog]     = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
//   const [formData, setFormData]               = useState(makeEmptyForm());

//   useEffect(() => {
//     if (canAccess('categories_new')) loadCategories();
//   }, []);

//   useEffect(() => { filterCategories(); }, [searchTerm, categories]);

//   const loadCategories = async () => {
//     try {
//       const data = await getAllCategories();
//       const accessible = data.filter(cat => canAccessCategory(cat.id));
//       setCategories(accessible);
//     } catch (error) {
//       console.error('Error loading categories:', error);
//       toast.error('Failed to load categories');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterCategories = () => {
//     if (!searchTerm.trim()) { setFilteredCategories(categories); return; }
//     const term = searchTerm.toLowerCase();
//     setFilteredCategories(categories.filter(cat =>
//       cat.name_sor?.toLowerCase().includes(term) ||
//       cat.name_bad?.toLowerCase().includes(term) ||
//       cat.name_ar?.toLowerCase().includes(term)  ||
//       cat.name_en?.toLowerCase().includes(term)
//     ));
//   };

//   const handleOpenModal = (category = null) => {
//     if (category) {
//       setEditingCategory(category);
//       setFormData(categoryToForm(category));
//     } else {
//       setEditingCategory(null);
//       setFormData(makeEmptyForm());
//     }
//     setShowModal(true);
//   };

//   const handleCloseModal = () => { setShowModal(false); setEditingCategory(null); };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const categoryData = formToCategoryData(formData);
//       const fn = httpsCallable(functions, 'createOrUpdateCategory');
//       const result = await fn({ id: editingCategory?.id || null, categoryData });
//       toast.success(result.data.action === 'updated' ? 'Category updated!' : 'Category created!');
//       await loadCategories();
//       handleCloseModal();
//     } catch (error) {
//       console.error('Error saving category:', error);
//       toast.error(error.message || 'Failed to save category');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = (id) => {
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Category?',
//       message: 'Are you sure you want to delete this category?',
//       onConfirm: async () => {
//         try {
//           const fn = httpsCallable(functions, 'deleteItems');
//           await fn({ collection: 'categories_new', ids: [id] });
//           toast.success('Category deleted successfully!');
//           await loadCategories();
//         } catch (error) {
//           toast.error(error.message || 'Failed to delete category');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };

//   const handleDuplicate = async (id) => {
//     setLoading(true);
//     try {
//       const fn = httpsCallable(functions, 'duplicateItem');
//       await fn({ collection: 'categories_new', id });
//       toast.success('Category duplicated successfully!');
//       await loadCategories();
//     } catch (error) {
//       toast.error(error.message || 'Failed to duplicate category');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBulkDelete = () => {
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Selected Categories?',
//       message: `Are you sure you want to delete ${selectedCategories.length} selected categories?`,
//       onConfirm: async () => {
//         try {
//           const fn = httpsCallable(functions, 'deleteItems');
//           await fn({ collection: 'categories_new', ids: selectedCategories });
//           toast.success(`${selectedCategories.length} categories deleted successfully!`);
//           setSelectedCategories([]);
//           await loadCategories();
//         } catch (error) {
//           toast.error(error.message || 'Failed to delete categories');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };

//   // ── Document tags helpers ─────────────────────────────────────────────────
//   const addDocumentTag = () =>
//     setFormData(prev => ({ ...prev, documenttagsdata: [...prev.documenttagsdata, {
//       name_sor: '', name_bad: '', name_ar: '', name_en: '',
//       pic_sor:  '', pic_bad:  '', pic_ar:  '', pic_en:  '',
//     }] }));
//   const updateDocumentTag = (idx, field, value) => {
//     const tags = [...formData.documenttagsdata];
//     tags[idx] = { ...tags[idx], [field]: value };
//     setFormData(prev => ({ ...prev, documenttagsdata: tags }));
//   };
//   const removeDocumentTag = (idx) =>
//     setFormData(prev => ({ ...prev, documenttagsdata: prev.documenttagsdata.filter((_, i) => i !== idx) }));

//   if (!canAccess('categories_new')) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-xl text-gray-600">You don't have access to this page.</p>
//       </div>
//     );
//   }

//   const SectionHeader = ({ title }) => (
//     <h3 className="text-base font-semibold text-gray-800 border-b pb-2 mb-4 mt-8">{title}</h3>
//   );

//   // ── Reusable string-list editor ───────────────────────────────────────────
//   const StringListEditor = ({ fieldKey, placeholder, addLabel }) => (
//     <div className="space-y-2">
//       {(formData[fieldKey] || []).map((item, idx) => (
//         <div key={idx} className="flex gap-2">
//           <input
//             type="text"
//             value={item}
//             onChange={(e) => updateStringList(formData, setFormData, fieldKey, idx, e.target.value)}
//             className="input flex-1 text-sm"
//             placeholder={placeholder}
//           />
//           <button type="button" onClick={() => updateStringList(formData, setFormData, fieldKey, idx, null)} className="text-red-400 hover:text-red-600 px-2">
//             <FiX size={14} />
//           </button>
//         </div>
//       ))}
//       <button type="button" onClick={() => addStringListItem(setFormData, fieldKey)} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
//         <FiPlus size={12} /> {addLabel}
//       </button>
//     </div>
//   );

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8">

//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
//               <p className="text-gray-600 mt-1">Manage all categories</p>
//             </div>
//             <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
//               <FiPlus size={20} /> Add New Category
//             </button>
//           </div>

//           <div className="card mb-6">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1 relative">
//                 <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input type="text" placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10 pr-10 w-full" />
//                 {searchTerm && (
//                   <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Clear search"><FiX size={16} /></button>
//                 )}
//               </div>
//               {selectedCategories.length > 0 && (
//                 <button onClick={handleBulkDelete} className="btn btn-danger flex items-center gap-2">
//                   <FiTrash2 /> Delete {selectedCategories.length} selected
//                 </button>
//               )}
//             </div>
//           </div>

//           {!loading && (
//             <div className="flex items-center gap-3 mb-4">
//               <p className="text-sm text-gray-500 shrink-0">
//                 {searchTerm
//                   ? `${filteredCategories.length} of ${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`
//                   : `${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`}
//               </p>
//               <div className="flex-1 h-px bg-gray-200" />
//             </div>
//           )}

//           {loading && !categories.length ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//             </div>
//           ) : filteredCategories.length === 0 ? (
//             <div className="card text-center py-12"><p className="text-gray-600">No categories found</p></div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {filteredCategories.map((category) => (
//                 <div key={category.id} className="card hover:shadow-lg transition-all">
//                   <div className="flex items-start justify-between mb-3">
//                     <input type="checkbox" title="checkbox" checked={selectedCategories.includes(category.id)} onChange={(e) => { if (e.target.checked) setSelectedCategories([...selectedCategories, category.id]); else setSelectedCategories(selectedCategories.filter(id => id !== category.id)); }} className="w-4 h-4 text-primary rounded" />
//                     <div className="flex gap-1">
//                       <button onClick={() => handleOpenModal(category)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit"><FiEdit2 size={16} className="text-gray-600" /></button>
//                       <button onClick={() => handleDuplicate(category.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate"><FiCopy size={16} className="text-gray-600" /></button>
//                       <button onClick={() => handleDelete(category.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete"><FiTrash2 size={16} className="text-red-600" /></button>
//                     </div>
//                   </div>
//                   {category.icon_sor && (
//                     <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
//                       <img src={category.icon_sor} alt={category.name_sor} className="w-full h-full object-cover" />
//                     </div>
//                   )}
//                   <div className="space-y-1">
//                     {category.name_sor && <p className="text-sm font-semibold">{category.name_sor}</p>}
//                     {category.name_en  && <p className="text-sm text-gray-600">{category.name_en}</p>}
//                     <div className="flex items-center gap-2 mt-2">
//                       <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Order: {category.sortingorder_sor || 0}</span>
//                       {category.visibility_sor ? <FiEye className="text-green-600" size={16} /> : <FiEyeOff className="text-gray-400" size={16} />}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </main>
//       </div>

//       <DeleteConfirmDialog
//         isOpen={confirmDialog.isOpen}
//         onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
//         onConfirm={confirmDialog.onConfirm}
//         title={confirmDialog.title}
//         message={confirmDialog.message}
//       />

//       {/* ════════════════════════════════════════════════════════════════════════
//           MODAL — Create / Edit Category
//       ════════════════════════════════════════════════════════════════════════ */}
//       {showModal && (
//         <div className="modal-overlay" onClick={handleCloseModal}>
//           <div className="modal max-w-4xl" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
//               <button onClick={handleCloseModal} title="Close"><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="modal-body space-y-0">

//                 {/* ── Shared: JSON Export Name ──────────────────────────────── */}
//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">JSON Export Name</label>
//                   <input
//                     type="text"
//                     value={formData.json_export_name}
//                     onChange={(e) => setFormData(prev => ({ ...prev, json_export_name: e.target.value }))}
//                     className="input"
//                     placeholder="e.g. hospitals (used by mobile app to fetch JSON)"
//                   />
//                 </div>

//                 {/* ── Per-language fields ───────────────────────────────────── */}
//                 <LanguageTabs>
//                   {(lang) => (
//                     <div className="space-y-4 pt-2">

//                       {/* Name + Icon */}
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Name ({lang.toUpperCase()}) *</label>
//                           <input type="text" value={formData[`name_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`name_${lang}`]: e.target.value }))} className="input" placeholder="Category name" required={lang === 'sor'} />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Sorting Order ({lang.toUpperCase()})</label>
//                           <input type="number" value={formData[`sortingorder_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`sortingorder_${lang}`]: e.target.value }))} className="input" placeholder="0" />
//                         </div>
//                       </div>

//                       {/* Icon URL */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL ({lang.toUpperCase()})</label>
//                         <input type="url" value={formData[`icon_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`icon_${lang}`]: e.target.value }))} className="input" placeholder="https://example.com/icon.png" />
//                         {formData[`icon_${lang}`] && <img src={formData[`icon_${lang}`]} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded" />}
//                       </div>

//                       {/* Booleans */}
//                       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                         {[
//                           { key: `visibility_${lang}`,      label: 'Visible'          },
//                           { key: `enablemapview_${lang}`,   label: 'Enable Map View'  },
//                           { key: `shuffle_${lang}`,         label: 'Shuffle'          },
//                           { key: `sortingbydate_${lang}`,   label: 'Sort by Date'     },
//                           { key: `sortingbynumber_${lang}`, label: 'Sort by Number'   },
//                         ].map(({ key, label }) => (
//                           <div key={key} className="flex items-center gap-2">
//                             <input type="checkbox" id={key} checked={formData[key]} onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.checked }))} className="w-4 h-4 text-primary rounded" />
//                             <label htmlFor={key} className="text-sm text-gray-700">{label}</label>
//                           </div>
//                         ))}
//                       </div>

//                       {/* Info fields */}
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Category Info 1 ({lang.toUpperCase()})</label>
//                           <input type="text" value={formData[`categoryinfo1_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`categoryinfo1_${lang}`]: e.target.value }))} className="input" placeholder="Info text 1" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Category Info 2 ({lang.toUpperCase()})</label>
//                           <input type="text" value={formData[`categoryinfo2_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`categoryinfo2_${lang}`]: e.target.value }))} className="input" placeholder="Info text 2" />
//                         </div>
//                       </div>

//                       {/* Search info */}
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Search Info Home ({lang.toUpperCase()})</label>
//                           <input type="text" value={formData[`searchinfohome_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`searchinfohome_${lang}`]: e.target.value }))} className="input" placeholder="Home search hint" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Search Info Document ({lang.toUpperCase()})</label>
//                           <input type="text" value={formData[`searchinfodocument_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`searchinfodocument_${lang}`]: e.target.value }))} className="input" placeholder="Document search hint" />
//                         </div>
//                       </div>

//                       {/* Reporting emails + sending pass */}
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Sender Report Email ({lang.toUpperCase()})</label>
//                           <input type="email" value={formData[`senderreportemail_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`senderreportemail_${lang}`]: e.target.value }))} className="input" placeholder="sender@example.com" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Report Email ({lang.toUpperCase()})</label>
//                           <input type="email" value={formData[`receiverreportemail_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`receiverreportemail_${lang}`]: e.target.value }))} className="input" placeholder="receiver@example.com" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Sending Password ({lang.toUpperCase()})</label>
//                           <input type="password" value={formData[`sendingpass_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`sendingpass_${lang}`]: e.target.value }))} className="input" placeholder="Email app password" />
//                         </div>
//                       </div>

//                       {/* Category Tags */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Category Tags ({lang.toUpperCase()})</label>
//                         <StringListEditor fieldKey={`categorytags_${lang}`} placeholder="Tag name" addLabel="Add Tag" />
//                       </div>

//                       {/* Search Words */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Search Words ({lang.toUpperCase()})</label>
//                         <StringListEditor fieldKey={`searchwords_${lang}`} placeholder="Search keyword" addLabel="Add Search Word" />
//                       </div>

//                       {/* Reporting Options */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Options ({lang.toUpperCase()})</label>
//                         <StringListEditor fieldKey={`reportingoptions_${lang}`} placeholder="e.g. Spam" addLabel="Add Option" />
//                       </div>

//                       {/* Advertising Data */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Advertising Data ({lang.toUpperCase()})</label>
//                         <StringListEditor fieldKey={`advertaisingdata_${lang}`} placeholder="Ad data entry" addLabel="Add Entry" />
//                       </div>

//                     </div>
//                   )}
//                 </LanguageTabs>

//                 {/* ── Document Tags (shared, not per-lang) ─────────────────── */}
//                 <SectionHeader title="Document Tags" />
//                 <p className="text-xs text-gray-500 -mt-2 mb-4">
//                   Stored as <code className="bg-gray-100 px-1 rounded">documenttagsdata</code> — a list of localized tag maps.
//                 </p>
//                 <div className="space-y-3">
//                   {formData.documenttagsdata.map((tag, idx) => (
//                     <div key={idx} className="border rounded-lg p-3 space-y-3 bg-gray-50">
//                       <div className="flex items-center justify-between">
//                         <span className="text-xs font-medium text-gray-500">Tag #{idx + 1}</span>
//                         <button type="button" onClick={() => removeDocumentTag(idx)} className="text-red-400 hover:text-red-600"><FiX size={14} /></button>
//                       </div>
//                       <div>
//                         <p className="text-xs text-gray-400 mb-1">Tag Name (per language)</p>
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                           {LANGS.map(l => (
//                             <div key={l}>
//                               <label className="block text-xs text-gray-500 mb-0.5">{l.toUpperCase()}</label>
//                               <input type="text" value={tag[`name_${l}`] || ''} onChange={(e) => updateDocumentTag(idx, `name_${l}`, e.target.value)} className="input text-sm" placeholder={`Name (${l})`} />
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                       <div>
//                         <p className="text-xs text-gray-400 mb-1">Tag Image URL (per language)</p>
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                           {LANGS.map(l => (
//                             <div key={l}>
//                               <label className="block text-xs text-gray-500 mb-0.5">{l.toUpperCase()}</label>
//                               <input type="url" value={tag[`pic_${l}`] || ''} onChange={(e) => updateDocumentTag(idx, `pic_${l}`, e.target.value)} className="input text-sm" placeholder={`Image URL (${l})`} />
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                   <button type="button" onClick={addDocumentTag} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
//                     <FiPlus size={12} /> Add Document Tag
//                   </button>
//                 </div>

//               </div>{/* end modal-body */}

//               <div className="modal-footer">
//                 <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>
//                   {loading ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </ProtectedRoute>
//   );
// }


// NEW 7


// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { getAllCategories } from '../../lib/firestore';
// import { app } from '../../lib/firebase';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import LanguageTabs from '../../components/LanguageTabs';
// import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
// import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);
// const LANGS = ['sor', 'bad', 'ar', 'en'];

// // ── Parse Firestore array field → string[] ───────────────────────────────────
// // dart: _convertToStringListMap reads as List directly
// const parseStringList = (value) => {
//   if (!value) return [];
//   if (Array.isArray(value)) return value.map(String).filter(Boolean);
//   if (typeof value === 'object') return Object.values(value).map(String).filter(Boolean);
//   return [];
// };

// // ── Parse documenttagsdata entries ──────────────────────────────────────────
// // dart list_view.dart _loadTagsFromCategory() reads:
// //   tagMap['documenttags_$lang']    → tag name
// //   tagMap['documenttagspic_$lang'] → tag image
// // We use name_*/pic_* as internal form keys, serialise to the exact Firestore keys.
// const parseDocumentTags = (value) => {
//   if (!value || !Array.isArray(value)) return [];
//   return value.map(tag => ({
//     name_sor: tag.documenttags_sor    || tag.name_sor || tag.sor || '',
//     name_bad: tag.documenttags_bad    || tag.name_bad || tag.bad || '',
//     name_ar:  tag.documenttags_ar     || tag.name_ar  || tag.ar  || '',
//     name_en:  tag.documenttags_en     || tag.name_en  || tag.en  || '',
//     pic_sor:  tag.documenttagspic_sor || tag.pic_sor  || '',
//     pic_bad:  tag.documenttagspic_bad || tag.pic_bad  || '',
//     pic_ar:   tag.documenttagspic_ar  || tag.pic_ar   || '',
//     pic_en:   tag.documenttagspic_en  || tag.pic_en   || '',
//   }));
// };

// // ── Empty form ────────────────────────────────────────────────────────────────
// const makeEmptyForm = () => {
//   const f = { json_export_name: '', documenttagsdata: [] };
//   LANGS.forEach(l => {
//     f[`name_${l}`]               = '';
//     f[`icon_${l}`]               = '';
//     f[`sortingorder_${l}`]       = '';
//     f[`visibility_${l}`]         = true;
//     f[`enablemapview_${l}`]      = false;
//     f[`shuffle_${l}`]            = false;
//     f[`sortingbydate_${l}`]      = false;
//     f[`sortingbynumber_${l}`]    = false;
//     f[`categoryinfo1_${l}`]      = '';
//     f[`categoryinfo2_${l}`]      = '';
//     f[`searchinfohome_${l}`]     = '';
//     f[`searchinfodocument_${l}`] = '';
//     f[`senderreportemail_${l}`]  = '';
//     f[`receiverreportemail_${l}`]= '';
//     f[`sendingpass_${l}`]        = '';
//     f[`categorytags_${l}`]       = [];   // List<String>
//     f[`searchwords_${l}`]        = [];   // List<String>
//     f[`reportingoptions_${l}`]   = [];   // List<String>
//     f[`advertaisingdata_${l}`]   = [];   // List<String>
//   });
//   return f;
// };

// // ── Parse existing category doc → form shape ─────────────────────────────────
// const categoryToForm = (c) => {
//   const f = {
//     json_export_name: c.json_export_name || '',
//     documenttagsdata: parseDocumentTags(c.documenttagsdata),
//   };
//   LANGS.forEach(l => {
//     f[`name_${l}`]               = c[`name_${l}`]               || '';
//     f[`icon_${l}`]               = c[`icon_${l}`]               || '';
//     f[`sortingorder_${l}`]       = c[`sortingorder_${l}`] != null ? String(c[`sortingorder_${l}`]) : '';
//     f[`visibility_${l}`]         = c[`visibility_${l}`]         ?? true;
//     f[`enablemapview_${l}`]      = c[`enablemapview_${l}`]      ?? false;
//     f[`shuffle_${l}`]            = c[`shuffle_${l}`]            ?? false;
//     f[`sortingbydate_${l}`]      = c[`sortingbydate_${l}`]      ?? false;
//     f[`sortingbynumber_${l}`]    = c[`sortingbynumber_${l}`]    ?? false;
//     f[`categoryinfo1_${l}`]      = c[`categoryinfo1_${l}`]      || '';
//     f[`categoryinfo2_${l}`]      = c[`categoryinfo2_${l}`]      || '';
//     f[`searchinfohome_${l}`]     = c[`searchinfohome_${l}`]     || '';
//     f[`searchinfodocument_${l}`] = c[`searchinfodocument_${l}`] || '';
//     f[`senderreportemail_${l}`]  = c[`senderreportemail_${l}`]  || '';
//     f[`receiverreportemail_${l}`]= c[`receiverreportemail_${l}`]|| '';
//     f[`sendingpass_${l}`]        = c[`sendingpass_${l}`]        || '';
//     f[`categorytags_${l}`]       = parseStringList(c[`categorytags_${l}`]);
//     f[`searchwords_${l}`]        = parseStringList(c[`searchwords_${l}`]);
//     f[`reportingoptions_${l}`]   = parseStringList(c[`reportingoptions_${l}`]);
//     f[`advertaisingdata_${l}`]   = parseStringList(c[`advertaisingdata_${l}`]);
//   });
//   return f;
// };

// // ── Convert form → Firestore categoryData ────────────────────────────────────
// // Must match CategoryNew.toMap() exactly
// const formToCategoryData = (f) => {
//   const out = {};

//   // Shared fields
//   if (f.json_export_name) out.json_export_name = f.json_export_name;
//   // documenttagsdata: List<Map<String,String>> — only write if non-empty
//   if (f.documenttagsdata && f.documenttagsdata.length > 0) {
//     out.documenttagsdata = f.documenttagsdata.map(tag => ({
//       documenttags_sor:    tag.name_sor || '',
//       documenttags_bad:    tag.name_bad || '',
//       documenttags_ar:     tag.name_ar  || '',
//       documenttags_en:     tag.name_en  || '',
//       documenttagspic_sor: tag.pic_sor  || '',
//       documenttagspic_bad: tag.pic_bad  || '',
//       documenttagspic_ar:  tag.pic_ar   || '',
//       documenttagspic_en:  tag.pic_en   || '',
//     }));
//   }

//   LANGS.forEach(l => {
//     // Strings — only write if non-empty (matches dart: if (x != null) map[key] = x)
//     if (f[`name_${l}`])               out[`name_${l}`]               = f[`name_${l}`];
//     if (f[`icon_${l}`])               out[`icon_${l}`]               = f[`icon_${l}`];
//     if (f[`categoryinfo1_${l}`])      out[`categoryinfo1_${l}`]      = f[`categoryinfo1_${l}`];
//     if (f[`categoryinfo2_${l}`])      out[`categoryinfo2_${l}`]      = f[`categoryinfo2_${l}`];
//     if (f[`searchinfohome_${l}`])     out[`searchinfohome_${l}`]     = f[`searchinfohome_${l}`];
//     if (f[`searchinfodocument_${l}`]) out[`searchinfodocument_${l}`] = f[`searchinfodocument_${l}`];
//     if (f[`senderreportemail_${l}`])  out[`senderreportemail_${l}`]  = f[`senderreportemail_${l}`];
//     if (f[`receiverreportemail_${l}`])out[`receiverreportemail_${l}`]= f[`receiverreportemail_${l}`];
//     if (f[`sendingpass_${l}`])        out[`sendingpass_${l}`]        = f[`sendingpass_${l}`];

//     // Int — sortingorder
//     const so = f[`sortingorder_${l}`];
//     if (so !== '' && so != null) out[`sortingorder_${l}`] = parseInt(so, 10);

//     // Booleans — always write (dart _addMapToFirestore writes if key exists in sourceMap)
//     out[`visibility_${l}`]      = f[`visibility_${l}`];
//     out[`enablemapview_${l}`]   = f[`enablemapview_${l}`];
//     out[`shuffle_${l}`]         = f[`shuffle_${l}`];
//     out[`sortingbydate_${l}`]   = f[`sortingbydate_${l}`];
//     out[`sortingbynumber_${l}`] = f[`sortingbynumber_${l}`];

//     // Lists — only write if non-empty
//     if (f[`categorytags_${l}`]?.length > 0)     out[`categorytags_${l}`]     = f[`categorytags_${l}`];
//     if (f[`searchwords_${l}`]?.length > 0)       out[`searchwords_${l}`]      = f[`searchwords_${l}`];
//     if (f[`reportingoptions_${l}`]?.length > 0)  out[`reportingoptions_${l}`] = f[`reportingoptions_${l}`];
//     if (f[`advertaisingdata_${l}`]?.length > 0)  out[`advertaisingdata_${l}`] = f[`advertaisingdata_${l}`];
//   });

//   return out;
// };

// // ── Array field helpers ───────────────────────────────────────────────────────
// const updateStringList = (formData, setFormData, key, idx, value) => {
//   const arr = [...(formData[key] || [])];
//   if (value === null) arr.splice(idx, 1);
//   else arr[idx] = value;
//   setFormData(prev => ({ ...prev, [key]: arr }));
// };
// const addStringListItem = (setFormData, key) =>
//   setFormData(prev => ({ ...prev, [key]: [...(prev[key] || []), ''] }));

// export default function CategoriesPage() {
//   const { canAccess, canAccessCategory } = useAuth();
//   const [categories, setCategories]           = useState([]);
//   const [filteredCategories, setFilteredCategories] = useState([]);
//   const [loading, setLoading]                 = useState(true);
//   const [searchTerm, setSearchTerm]           = useState('');
//   const [showModal, setShowModal]             = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [confirmDialog, setConfirmDialog]     = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
//   const [formData, setFormData]               = useState(makeEmptyForm());

//   useEffect(() => {
//     if (canAccess('categories_new')) loadCategories();
//   }, []);

//   useEffect(() => { filterCategories(); }, [searchTerm, categories]);

//   const loadCategories = async () => {
//     try {
//       const data = await getAllCategories();
//       const accessible = data.filter(cat => canAccessCategory(cat.id));
//       setCategories(accessible);
//     } catch (error) {
//       console.error('Error loading categories:', error);
//       toast.error('Failed to load categories');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterCategories = () => {
//     if (!searchTerm.trim()) { setFilteredCategories(categories); return; }
//     const term = searchTerm.toLowerCase();
//     setFilteredCategories(categories.filter(cat =>
//       cat.name_sor?.toLowerCase().includes(term) ||
//       cat.name_bad?.toLowerCase().includes(term) ||
//       cat.name_ar?.toLowerCase().includes(term)  ||
//       cat.name_en?.toLowerCase().includes(term)
//     ));
//   };

//   const handleOpenModal = (category = null) => {
//     if (category) {
//       setEditingCategory(category);
//       setFormData(categoryToForm(category));
//     } else {
//       setEditingCategory(null);
//       setFormData(makeEmptyForm());
//     }
//     setShowModal(true);
//   };

//   const handleCloseModal = () => { setShowModal(false); setEditingCategory(null); };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const categoryData = formToCategoryData(formData);
//       const fn = httpsCallable(functions, 'createOrUpdateCategory');
//       const result = await fn({ id: editingCategory?.id || null, categoryData });
//       toast.success(result.data.action === 'updated' ? 'Category updated!' : 'Category created!');
//       await loadCategories();
//       handleCloseModal();
//     } catch (error) {
//       console.error('Error saving category:', error);
//       toast.error(error.message || 'Failed to save category');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = (id) => {
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Category?',
//       message: 'Are you sure you want to delete this category?',
//       onConfirm: async () => {
//         try {
//           const fn = httpsCallable(functions, 'deleteItems');
//           await fn({ collection: 'categories_new', ids: [id] });
//           toast.success('Category deleted successfully!');
//           await loadCategories();
//         } catch (error) {
//           toast.error(error.message || 'Failed to delete category');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };

//   const handleDuplicate = async (id) => {
//     setLoading(true);
//     try {
//       const fn = httpsCallable(functions, 'duplicateItem');
//       await fn({ collection: 'categories_new', id });
//       toast.success('Category duplicated successfully!');
//       await loadCategories();
//     } catch (error) {
//       toast.error(error.message || 'Failed to duplicate category');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBulkDelete = () => {
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Selected Categories?',
//       message: `Are you sure you want to delete ${selectedCategories.length} selected categories?`,
//       onConfirm: async () => {
//         try {
//           const fn = httpsCallable(functions, 'deleteItems');
//           await fn({ collection: 'categories_new', ids: selectedCategories });
//           toast.success(`${selectedCategories.length} categories deleted successfully!`);
//           setSelectedCategories([]);
//           await loadCategories();
//         } catch (error) {
//           toast.error(error.message || 'Failed to delete categories');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };

//   // ── Document tags helpers ─────────────────────────────────────────────────
//   const addDocumentTag = () =>
//     setFormData(prev => ({ ...prev, documenttagsdata: [...prev.documenttagsdata, {
//       name_sor: '', name_bad: '', name_ar: '', name_en: '',
//       pic_sor:  '', pic_bad:  '', pic_ar:  '', pic_en:  '',
//     }] }));
//   const updateDocumentTag = (idx, field, value) => {
//     const tags = [...formData.documenttagsdata];
//     tags[idx] = { ...tags[idx], [field]: value };
//     setFormData(prev => ({ ...prev, documenttagsdata: tags }));
//   };
//   const removeDocumentTag = (idx) =>
//     setFormData(prev => ({ ...prev, documenttagsdata: prev.documenttagsdata.filter((_, i) => i !== idx) }));

//   if (!canAccess('categories_new')) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-xl text-gray-600">You don't have access to this page.</p>
//       </div>
//     );
//   }

//   const SectionHeader = ({ title }) => (
//     <h3 className="text-base font-semibold text-gray-800 border-b pb-2 mb-4 mt-8">{title}</h3>
//   );

//   // ── Reusable string-list editor ───────────────────────────────────────────
//   const StringListEditor = ({ fieldKey, placeholder, addLabel }) => (
//     <div className="space-y-2">
//       {(formData[fieldKey] || []).map((item, idx) => (
//         <div key={idx} className="flex gap-2">
//           <input
//             type="text"
//             value={item}
//             onChange={(e) => updateStringList(formData, setFormData, fieldKey, idx, e.target.value)}
//             className="input flex-1 text-sm"
//             placeholder={placeholder}
//           />
//           <button type="button" onClick={() => updateStringList(formData, setFormData, fieldKey, idx, null)} className="text-red-400 hover:text-red-600 px-2">
//             <FiX size={14} />
//           </button>
//         </div>
//       ))}
//       <button type="button" onClick={() => addStringListItem(setFormData, fieldKey)} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
//         <FiPlus size={12} /> {addLabel}
//       </button>
//     </div>
//   );

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8">

//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
//               <p className="text-gray-600 mt-1">Manage all categories</p>
//             </div>
//             <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
//               <FiPlus size={20} /> Add New Category
//             </button>
//           </div>

//           <div className="card mb-6">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1 relative">
//                 <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input type="text" placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10 pr-10 w-full" />
//                 {searchTerm && (
//                   <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Clear search"><FiX size={16} /></button>
//                 )}
//               </div>
//               {selectedCategories.length > 0 && (
//                 <button onClick={handleBulkDelete} className="btn btn-danger flex items-center gap-2">
//                   <FiTrash2 /> Delete {selectedCategories.length} selected
//                 </button>
//               )}
//             </div>
//           </div>

//           {!loading && (
//             <div className="flex items-center gap-3 mb-4">
//               <p className="text-sm text-gray-500 shrink-0">
//                 {searchTerm
//                   ? `${filteredCategories.length} of ${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`
//                   : `${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`}
//               </p>
//               <div className="flex-1 h-px bg-gray-200" />
//             </div>
//           )}

//           {loading && !categories.length ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//             </div>
//           ) : filteredCategories.length === 0 ? (
//             <div className="card text-center py-12"><p className="text-gray-600">No categories found</p></div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {filteredCategories.map((category) => (
//                 <div key={category.id} className="card hover:shadow-lg transition-all">
//                   <div className="flex items-start justify-between mb-3">
//                     <input type="checkbox" title="checkbox" checked={selectedCategories.includes(category.id)} onChange={(e) => { if (e.target.checked) setSelectedCategories([...selectedCategories, category.id]); else setSelectedCategories(selectedCategories.filter(id => id !== category.id)); }} className="w-4 h-4 text-primary rounded" />
//                     <div className="flex gap-1">
//                       <button onClick={() => handleOpenModal(category)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit"><FiEdit2 size={16} className="text-gray-600" /></button>
//                       <button onClick={() => handleDuplicate(category.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate"><FiCopy size={16} className="text-gray-600" /></button>
//                       <button onClick={() => handleDelete(category.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete"><FiTrash2 size={16} className="text-red-600" /></button>
//                     </div>
//                   </div>
//                   {category.icon_sor && (
//                     <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
//                       <img src={category.icon_sor} alt={category.name_sor} className="w-full h-full object-cover" />
//                     </div>
//                   )}
//                   <div className="space-y-1">
//                     {category.name_sor && <p className="text-sm font-semibold">{category.name_sor}</p>}
//                     {category.name_en  && <p className="text-sm text-gray-600">{category.name_en}</p>}
//                     <div className="flex items-center gap-2 mt-2">
//                       <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Order: {category.sortingorder_sor || 0}</span>
//                       {category.visibility_sor ? <FiEye className="text-green-600" size={16} /> : <FiEyeOff className="text-gray-400" size={16} />}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </main>
//       </div>

//       <DeleteConfirmDialog
//         isOpen={confirmDialog.isOpen}
//         onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
//         onConfirm={confirmDialog.onConfirm}
//         title={confirmDialog.title}
//         message={confirmDialog.message}
//       />

//       {/* ════════════════════════════════════════════════════════════════════════
//           MODAL — Create / Edit Category
//       ════════════════════════════════════════════════════════════════════════ */}
//       {showModal && (
//         <div className="modal-overlay" onClick={handleCloseModal}>
//           <div className="modal max-w-4xl" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
//               <button onClick={handleCloseModal} title="Close"><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="modal-body space-y-0">

//                 {/* ── Shared: JSON Export Name ──────────────────────────────── */}
//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-1">JSON Export Name</label>
//                   <input
//                     type="text"
//                     value={formData.json_export_name}
//                     onChange={(e) => setFormData(prev => ({ ...prev, json_export_name: e.target.value }))}
//                     className="input"
//                     placeholder="e.g. hospitals (used by mobile app to fetch JSON)"
//                   />
//                 </div>

//                 {/* ── Per-language fields ───────────────────────────────────── */}
//                 <LanguageTabs>
//                   {(lang) => (
//                     <div className="space-y-4 pt-2">

//                       {/* Name + Icon */}
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Name ({lang.toUpperCase()}) *</label>
//                           <input type="text" value={formData[`name_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`name_${lang}`]: e.target.value }))} className="input" placeholder="Category name" required={lang === 'sor'} />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Sorting Order ({lang.toUpperCase()})</label>
//                           <input type="number" value={formData[`sortingorder_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`sortingorder_${lang}`]: e.target.value }))} className="input" placeholder="0" />
//                         </div>
//                       </div>

//                       {/* Icon URL */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Icon URL ({lang.toUpperCase()})</label>
//                         <input type="url" value={formData[`icon_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`icon_${lang}`]: e.target.value }))} className="input" placeholder="https://example.com/icon.png" />
//                         {formData[`icon_${lang}`] && <img src={formData[`icon_${lang}`]} alt="Preview" className="mt-2 w-20 h-20 object-cover rounded" />}
//                       </div>

//                       {/* Booleans */}
//                       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//                         {[
//                           { key: `visibility_${lang}`,      label: 'Visible'          },
//                           { key: `enablemapview_${lang}`,   label: 'Enable Map View'  },
//                           { key: `shuffle_${lang}`,         label: 'Shuffle'          },
//                           { key: `sortingbydate_${lang}`,   label: 'Sort by Date'     },
//                           { key: `sortingbynumber_${lang}`, label: 'Sort by Number'   },
//                         ].map(({ key, label }) => (
//                           <div key={key} className="flex items-center gap-2">
//                             <input type="checkbox" id={key} checked={formData[key]} onChange={(e) => setFormData(prev => ({ ...prev, [key]: e.target.checked }))} className="w-4 h-4 text-primary rounded" />
//                             <label htmlFor={key} className="text-sm text-gray-700">{label}</label>
//                           </div>
//                         ))}
//                       </div>

//                       {/* Info fields */}
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Category Info 1 ({lang.toUpperCase()})</label>
//                           <input type="text" value={formData[`categoryinfo1_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`categoryinfo1_${lang}`]: e.target.value }))} className="input" placeholder="Info text 1" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Category Info 2 ({lang.toUpperCase()})</label>
//                           <input type="text" value={formData[`categoryinfo2_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`categoryinfo2_${lang}`]: e.target.value }))} className="input" placeholder="Info text 2" />
//                         </div>
//                       </div>

//                       {/* Search info */}
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Search Info Home ({lang.toUpperCase()})</label>
//                           <input type="text" value={formData[`searchinfohome_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`searchinfohome_${lang}`]: e.target.value }))} className="input" placeholder="Home search hint" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Search Info Document ({lang.toUpperCase()})</label>
//                           <input type="text" value={formData[`searchinfodocument_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`searchinfodocument_${lang}`]: e.target.value }))} className="input" placeholder="Document search hint" />
//                         </div>
//                       </div>

//                       {/* Reporting emails + sending pass */}
//                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Sender Report Email ({lang.toUpperCase()})</label>
//                           <input type="email" value={formData[`senderreportemail_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`senderreportemail_${lang}`]: e.target.value }))} className="input" placeholder="sender@example.com" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Receiver Report Email ({lang.toUpperCase()})</label>
//                           <input type="email" value={formData[`receiverreportemail_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`receiverreportemail_${lang}`]: e.target.value }))} className="input" placeholder="receiver@example.com" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Sending Password ({lang.toUpperCase()})</label>
//                           <input type="password" value={formData[`sendingpass_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`sendingpass_${lang}`]: e.target.value }))} className="input" placeholder="Email app password" />
//                         </div>
//                       </div>

//                       {/* Category Tags */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Category Tags ({lang.toUpperCase()})</label>
//                         <StringListEditor fieldKey={`categorytags_${lang}`} placeholder="Tag name" addLabel="Add Tag" />
//                       </div>

//                       {/* Search Words */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Search Words ({lang.toUpperCase()})</label>
//                         <StringListEditor fieldKey={`searchwords_${lang}`} placeholder="Search keyword" addLabel="Add Search Word" />
//                       </div>

//                       {/* Reporting Options */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Options ({lang.toUpperCase()})</label>
//                         <StringListEditor fieldKey={`reportingoptions_${lang}`} placeholder="e.g. Spam" addLabel="Add Option" />
//                       </div>

//                       {/* Advertising Data */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Advertising Data ({lang.toUpperCase()})</label>
//                         <StringListEditor fieldKey={`advertaisingdata_${lang}`} placeholder="Ad data entry" addLabel="Add Entry" />
//                       </div>

//                     </div>
//                   )}
//                 </LanguageTabs>

//                 {/* ── Document Tags (shared, not per-lang) ─────────────────── */}
//                 <SectionHeader title="Document Tags" />
//                 <p className="text-xs text-gray-500 -mt-2 mb-4">
//                   Stored as <code className="bg-gray-100 px-1 rounded">documenttagsdata</code> — a list of localized tag maps.
//                 </p>
//                 <div className="space-y-3">
//                   {formData.documenttagsdata.map((tag, idx) => (
//                     <div key={idx} className="border rounded-lg p-3 space-y-3 bg-gray-50">
//                       <div className="flex items-center justify-between">
//                         <span className="text-xs font-medium text-gray-500">Tag #{idx + 1}</span>
//                         <button type="button" onClick={() => removeDocumentTag(idx)} className="text-red-400 hover:text-red-600"><FiX size={14} /></button>
//                       </div>
//                       <div>
//                         <p className="text-xs text-gray-400 mb-1">Tag Name (per language)</p>
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                           {LANGS.map(l => (
//                             <div key={l}>
//                               <label className="block text-xs text-gray-500 mb-0.5">{l.toUpperCase()}</label>
//                               <input type="text" value={tag[`name_${l}`] || ''} onChange={(e) => updateDocumentTag(idx, `name_${l}`, e.target.value)} className="input text-sm" placeholder={`Name (${l})`} />
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                       <div>
//                         <p className="text-xs text-gray-400 mb-1">Tag Image URL (per language)</p>
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
//                           {LANGS.map(l => (
//                             <div key={l}>
//                               <label className="block text-xs text-gray-500 mb-0.5">{l.toUpperCase()}</label>
//                               <input type="url" value={tag[`pic_${l}`] || ''} onChange={(e) => updateDocumentTag(idx, `pic_${l}`, e.target.value)} className="input text-sm" placeholder={`Image URL (${l})`} />
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                   <button type="button" onClick={addDocumentTag} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
//                     <FiPlus size={12} /> Add Document Tag
//                   </button>
//                 </div>

//               </div>{/* end modal-body */}

//               <div className="modal-footer">
//                 <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>
//                   {loading ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </ProtectedRoute>
//   );
// }


// NEW 8


// COMPLETE REBUILD — all fields per Firestore schema

// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { getAllCategories } from '../../lib/firestore';
// import { app } from '../../lib/firebase';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import LanguageTabs from '../../components/LanguageTabs';
// import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
// import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX, FiEye, FiEyeOff, FiChevronDown, FiChevronUp } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);
// const LANGS = ['sor', 'bad', 'ar', 'en'];

// // ── Collapsible Section ────────────────────────────────────────────────────────
// function Section({ title, children, defaultOpen = false }) {
//   const [open, setOpen] = useState(defaultOpen);
//   return (
//     <div className="border border-gray-200 rounded-lg overflow-hidden">
//       <button type="button" onClick={() => setOpen(o => !o)}
//         className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
//         <span className="font-semibold text-gray-800 text-sm">{title}</span>
//         {open ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
//       </button>
//       {open && <div className="p-4 space-y-4">{children}</div>}
//     </div>
//   );
// }

// // ── Empty form factory ─────────────────────────────────────────────────────────
// function emptyForm() {
//   const f = { json_export_name: '' };
//   LANGS.forEach(l => {
//     f[`name_${l}`]                  = '';
//     f[`icon_${l}`]                  = '';
//     f[`sortingorder_${l}`]          = '';
//     f[`visibility_${l}`]            = true;
//     f[`categorytags_${l}`]          = '';   // comma-separated
//     f[`reportingoptions_${l}`]      = '';   // comma-separated
//     f[`senderreportemail_${l}`]     = '';
//     f[`receiverreportemail_${l}`]   = '';
//     f[`sendingpass_${l}`]           = '';
//     f[`searchwords_${l}`]           = '';   // comma-separated
//     f[`enablemapview_${l}`]         = false;
//     f[`categoryinfo1_${l}`]         = '';
//     f[`categoryinfo2_${l}`]         = '';
//     f[`advertaisingdata_${l}`]      = '';   // comma-separated
//     f[`searchinfodocument_${l}`]    = '';
//     f[`searchinfohome_${l}`]        = '';
//     f[`sortingbynumber_${l}`]       = false;
//     f[`shuffle_${l}`]               = false;
//     f[`sortingbydate_${l}`]         = false;
//   });
//   // documenttagsdata — array of { documenttags_sor, documenttags_bad, documenttags_ar, documenttags_en,
//   //                               documenttagspic_sor, documenttagspic_bad, documenttagspic_ar, documenttagspic_en }
//   f.documenttagsdata = [];
//   return f;
// }

// // Safely read a Firestore array/map/string as comma-separated string
// function toCSV(value) {
//   if (!value) return '';
//   if (typeof value === 'string') return value;
//   if (Array.isArray(value)) return value.join(', ');
//   if (typeof value === 'object') return Object.values(value).join(', ');
//   return String(value);
// }

// // Parse existing category into form state
// function categoryToForm(cat) {
//   const f = emptyForm();
//   f.json_export_name = cat.json_export_name || '';
//   LANGS.forEach(l => {
//     f[`name_${l}`]               = cat[`name_${l}`]               || '';
//     f[`icon_${l}`]               = cat[`icon_${l}`]               || '';
//     f[`sortingorder_${l}`]       = cat[`sortingorder_${l}`]       ?? '';
//     f[`visibility_${l}`]         = cat[`visibility_${l}`]         ?? true;
//     f[`enablemapview_${l}`]      = cat[`enablemapview_${l}`]      ?? false;
//     f[`sortingbynumber_${l}`]    = cat[`sortingbynumber_${l}`]    ?? false;
//     f[`shuffle_${l}`]            = cat[`shuffle_${l}`]            ?? false;
//     f[`sortingbydate_${l}`]      = cat[`sortingbydate_${l}`]      ?? false;
//     f[`senderreportemail_${l}`]  = cat[`senderreportemail_${l}`]  || '';
//     f[`receiverreportemail_${l}`]= cat[`receiverreportemail_${l}`]|| '';
//     f[`sendingpass_${l}`]        = cat[`sendingpass_${l}`]        || '';
//     f[`categoryinfo1_${l}`]      = cat[`categoryinfo1_${l}`]      || '';
//     f[`categoryinfo2_${l}`]      = cat[`categoryinfo2_${l}`]      || '';
//     f[`searchinfodocument_${l}`] = cat[`searchinfodocument_${l}`] || '';
//     f[`searchinfohome_${l}`]     = cat[`searchinfohome_${l}`]     || '';
//     f[`categorytags_${l}`]       = toCSV(cat[`categorytags_${l}`]);
//     f[`reportingoptions_${l}`]   = toCSV(cat[`reportingoptions_${l}`]);
//     f[`searchwords_${l}`]        = toCSV(cat[`searchwords_${l}`]);
//     f[`advertaisingdata_${l}`]   = toCSV(cat[`advertaisingdata_${l}`]);
//   });
//   // documenttagsdata
//   const raw = cat.documenttagsdata;
//   if (Array.isArray(raw)) {
//     f.documenttagsdata = raw.map(item => {
//       const entry = {};
//       LANGS.forEach(l => {
//         entry[`documenttags_${l}`]    = item[`documenttags_${l}`]    || '';
//         entry[`documenttagspic_${l}`] = item[`documenttagspic_${l}`] || '';
//       });
//       return entry;
//     });
//   }
//   return f;
// }

// // Build Firestore categoryData from form state
// function formToCategoryData(f) {
//   const data = { json_export_name: f.json_export_name };
//   LANGS.forEach(l => {
//     data[`name_${l}`]               = f[`name_${l}`];
//     data[`icon_${l}`]               = f[`icon_${l}`];
//     data[`sortingorder_${l}`]       = f[`sortingorder_${l}`] !== '' ? Number(f[`sortingorder_${l}`]) : 0;
//     data[`visibility_${l}`]         = f[`visibility_${l}`];
//     data[`enablemapview_${l}`]      = f[`enablemapview_${l}`];
//     data[`sortingbynumber_${l}`]    = f[`sortingbynumber_${l}`];
//     data[`shuffle_${l}`]            = f[`shuffle_${l}`];
//     data[`sortingbydate_${l}`]      = f[`sortingbydate_${l}`];
//     data[`senderreportemail_${l}`]  = f[`senderreportemail_${l}`];
//     data[`receiverreportemail_${l}`]= f[`receiverreportemail_${l}`];
//     data[`sendingpass_${l}`]        = f[`sendingpass_${l}`];
//     data[`categoryinfo1_${l}`]      = f[`categoryinfo1_${l}`];
//     data[`categoryinfo2_${l}`]      = f[`categoryinfo2_${l}`];
//     data[`searchinfodocument_${l}`] = f[`searchinfodocument_${l}`];
//     data[`searchinfohome_${l}`]     = f[`searchinfohome_${l}`];
//     // comma-separated → array
//     data[`categorytags_${l}`]    = f[`categorytags_${l}`].split(',').map(s => s.trim()).filter(Boolean);
//     data[`reportingoptions_${l}`]= f[`reportingoptions_${l}`].split(',').map(s => s.trim()).filter(Boolean);
//     data[`searchwords_${l}`]     = f[`searchwords_${l}`].split(',').map(s => s.trim()).filter(Boolean);
//     data[`advertaisingdata_${l}`]= f[`advertaisingdata_${l}`].split(',').map(s => s.trim()).filter(Boolean);
//   });
//   // documenttagsdata
//   data.documenttagsdata = (f.documenttagsdata || []).map(entry => {
//     const item = {};
//     LANGS.forEach(l => {
//       item[`documenttags_${l}`]    = entry[`documenttags_${l}`]    || '';
//       item[`documenttagspic_${l}`] = entry[`documenttagspic_${l}`] || '';
//     });
//     return item;
//   });
//   return data;
// }

// // ── Document Tags Editor ───────────────────────────────────────────────────────
// function DocumentTagsEditor({ tags, onChange }) {
//   const addTag = () => {
//     const entry = {};
//     LANGS.forEach(l => { entry[`documenttags_${l}`] = ''; entry[`documenttagspic_${l}`] = ''; });
//     onChange([...tags, entry]);
//   };
//   const removeTag = (i) => onChange(tags.filter((_, idx) => idx !== i));
//   const updateTag = (i, field, value) => onChange(tags.map((t, idx) => idx === i ? { ...t, [field]: value } : t));

//   return (
//     <div className="space-y-3">
//       {tags.map((tag, i) => (
//         <div key={i} className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-3">
//           <div className="flex justify-between items-center">
//             <span className="text-xs font-semibold text-gray-500">Document Tag {i + 1}</span>
//             <button type="button" onClick={() => removeTag(i)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
//           </div>
//           {LANGS.map(l => (
//             <div key={l} className="grid grid-cols-2 gap-2">
//               <div>
//                 <label className="block text-xs text-gray-500 mb-1">Tag Name ({l.toUpperCase()})</label>
//                 <input type="text" value={tag[`documenttags_${l}`] || ''} onChange={e => updateTag(i, `documenttags_${l}`, e.target.value)} className="input text-sm py-1" placeholder="Tag label" />
//               </div>
//               <div>
//                 <label className="block text-xs text-gray-500 mb-1">Tag Image URL ({l.toUpperCase()})</label>
//                 <input type="url" value={tag[`documenttagspic_${l}`] || ''} onChange={e => updateTag(i, `documenttagspic_${l}`, e.target.value)} className="input text-sm py-1" placeholder="https://..." />
//               </div>
//             </div>
//           ))}
//         </div>
//       ))}
//       <button type="button" onClick={addTag} className="btn btn-secondary btn-sm w-full">+ Add Document Tag</button>
//     </div>
//   );
// }

// // ── Main Page ──────────────────────────────────────────────────────────────────
// export default function CategoriesPage() {
//   const { canAccess, canAccessCategory } = useAuth();
//   const [categories, setCategories]       = useState([]);
//   const [filteredCategories, setFilteredCategories] = useState([]);
//   const [loading, setLoading]             = useState(true);
//   const [saving, setSaving]               = useState(false);
//   const [searchTerm, setSearchTerm]       = useState('');
//   const [showModal, setShowModal]         = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
//   const [formData, setFormData]           = useState(emptyForm());

//   useEffect(() => { if (canAccess('categories_new')) loadCategories(); }, []);
//   useEffect(() => { filterCategories(); }, [searchTerm, categories]);

//   const loadCategories = async () => {
//     try {
//       const data = await getAllCategories();
//       const accessible = data.filter(cat => canAccessCategory(cat.id));
//       setCategories(accessible);
//     } catch (error) {
//       toast.error('Failed to load categories');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterCategories = () => {
//     if (!searchTerm.trim()) { setFilteredCategories(categories); return; }
//     const term = searchTerm.toLowerCase();
//     setFilteredCategories(categories.filter(cat =>
//       LANGS.some(l => cat[`name_${l}`]?.toLowerCase().includes(term))
//     ));
//   };

//   const handleOpenModal = (category = null) => {
//     setEditingCategory(category || null);
//     setFormData(category ? categoryToForm(category) : emptyForm());
//     setShowModal(true);
//   };

//   const handleCloseModal = () => { setShowModal(false); setEditingCategory(null); };

//   const setField = (key, value) => setFormData(f => ({ ...f, [key]: value }));

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSaving(true);
//     try {
//       const categoryData = formToCategoryData(formData);
//       const fn = httpsCallable(functions, 'createOrUpdateCategory');
//       const result = await fn({ id: editingCategory?.id || null, categoryData });
//       toast.success(result.data.action === 'updated' ? 'Category updated!' : 'Category created!');
//       await loadCategories();
//       handleCloseModal();
//     } catch (error) {
//       toast.error(error.message || 'Failed to save category');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleDelete = (id) => {
//     setConfirmDialog({
//       isOpen: true, title: 'Delete Category?', message: 'Are you sure you want to delete this category?',
//       onConfirm: async () => {
//         try {
//           await httpsCallable(functions, 'deleteItems')({ collection: 'categories_new', ids: [id] });
//           toast.success('Category deleted!');
//           await loadCategories();
//         } catch (error) { toast.error(error.message || 'Failed to delete'); }
//         finally { setConfirmDialog(p => ({ ...p, isOpen: false })); }
//       },
//     });
//   };

//   const handleDuplicate = async (id) => {
//     setLoading(true);
//     try {
//       await httpsCallable(functions, 'duplicateItem')({ collection: 'categories_new', id });
//       toast.success('Category duplicated!');
//       await loadCategories();
//     } catch (error) { toast.error(error.message || 'Failed to duplicate'); }
//     finally { setLoading(false); }
//   };

//   const handleBulkDelete = () => {
//     setConfirmDialog({
//       isOpen: true, title: 'Delete Selected?',
//       message: `Delete ${selectedCategories.length} selected categories?`,
//       onConfirm: async () => {
//         try {
//           await httpsCallable(functions, 'deleteItems')({ collection: 'categories_new', ids: selectedCategories });
//           toast.success(`${selectedCategories.length} categories deleted!`);
//           setSelectedCategories([]);
//           await loadCategories();
//         } catch (error) { toast.error(error.message || 'Failed'); }
//         finally { setConfirmDialog(p => ({ ...p, isOpen: false })); }
//       },
//     });
//   };

//   if (!canAccess('categories_new')) return (
//     <div className="min-h-screen flex items-center justify-center">
//       <p className="text-xl text-gray-600">You don't have access to this page.</p>
//     </div>
//   );

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8">

//           {/* Header */}
//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
//               <p className="text-gray-600 mt-1">Manage all categories</p>
//             </div>
//             <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
//               <FiPlus size={20} /> Add New Category
//             </button>
//           </div>

//           {/* Search */}
//           <div className="card mb-6">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1 relative">
//                 <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                 <input type="text" placeholder="Search categories..." value={searchTerm}
//                   onChange={e => setSearchTerm(e.target.value)} className="input pl-10 pr-10 w-full" />
//                 {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><FiX size={16} /></button>}
//               </div>
//               {selectedCategories.length > 0 && (
//                 <button onClick={handleBulkDelete} className="btn btn-danger flex items-center gap-2">
//                   <FiTrash2 /> Delete {selectedCategories.length} selected
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Count */}
//           {!loading && (
//             <div className="flex items-center gap-3 mb-4">
//               <p className="text-sm text-gray-500 shrink-0">
//                 {searchTerm
//                   ? `${filteredCategories.length} of ${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`
//                   : `${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`}
//               </p>
//               <div className="flex-1 h-px bg-gray-200" />
//             </div>
//           )}

//           {/* Grid */}
//           {loading && !categories.length ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//             </div>
//           ) : filteredCategories.length === 0 ? (
//             <div className="card text-center py-12"><p className="text-gray-600">No categories found</p></div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {filteredCategories.map(category => (
//                 <div key={category.id} className="card hover:shadow-lg transition-all">
//                   <div className="flex items-start justify-between mb-3">
//                     <input type="checkbox" checked={selectedCategories.includes(category.id)}
//                       onChange={e => {
//                         if (e.target.checked) setSelectedCategories(p => [...p, category.id]);
//                         else setSelectedCategories(p => p.filter(id => id !== category.id));
//                       }} className="w-4 h-4 text-primary rounded" />
//                     <div className="flex gap-1">
//                       <button onClick={() => handleOpenModal(category)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit"><FiEdit2 size={16} className="text-gray-600" /></button>
//                       <button onClick={() => handleDuplicate(category.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate"><FiCopy size={16} className="text-gray-600" /></button>
//                       <button onClick={() => handleDelete(category.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete"><FiTrash2 size={16} className="text-red-600" /></button>
//                     </div>
//                   </div>
//                   {category.icon_sor && (
//                     <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
//                       <img src={category.icon_sor} alt={category.name_sor} className="w-full h-full object-cover" />
//                     </div>
//                   )}
//                   <div className="space-y-1">
//                     {category.name_sor && <p className="text-sm font-semibold">{category.name_sor}</p>}
//                     {category.name_en && <p className="text-sm text-gray-600">{category.name_en}</p>}
//                     <div className="flex items-center gap-2 mt-2 flex-wrap">
//                       <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Order: {category.sortingorder_sor ?? 0}</span>
//                       {category.visibility_sor ? <FiEye className="text-green-600" size={16} /> : <FiEyeOff className="text-gray-400" size={16} />}
//                       {category.json_export_name && <span className="text-xs text-gray-400 truncate">ID: {category.json_export_name}</span>}
//                     </div>
//                     {(category.documenttagsdata?.length > 0) && (
//                       <p className="text-xs text-blue-600">{category.documenttagsdata.length} document tag{category.documenttagsdata.length !== 1 ? 's' : ''}</p>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </main>
//       </div>

//       <DeleteConfirmDialog
//         isOpen={confirmDialog.isOpen}
//         onClose={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
//         onConfirm={confirmDialog.onConfirm}
//         title={confirmDialog.title}
//         message={confirmDialog.message}
//       />

//       {/* ── Create / Edit Modal ── */}
//       {showModal && (
//         <div className="modal-overlay" onClick={handleCloseModal}>
//           <div className="modal max-w-5xl" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
//               <button onClick={handleCloseModal} title="Close"><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="modal-body space-y-4">

//                 {/* Export Name */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     JSON Export Name <span className="text-gray-400 font-normal text-xs">(non-localized identifier used by Flutter app)</span>
//                   </label>
//                   <input type="text" value={formData.json_export_name} onChange={e => setField('json_export_name', e.target.value)} className="input" placeholder="e.g. ATM or otombel" />
//                 </div>

//                 {/* Names & Icons */}
//                 <Section title="📝 Names & Icons" defaultOpen>
//                   <LanguageTabs>
//                     {lang => (
//                       <div className="space-y-3">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">Category Name ({lang.toUpperCase()}) *</label>
//                           <input type="text" value={formData[`name_${lang}`]} onChange={e => setField(`name_${lang}`, e.target.value)} className="input" placeholder={`Category name in ${lang}`} required />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">Icon URL ({lang.toUpperCase()})</label>
//                           <input type="url" value={formData[`icon_${lang}`]} onChange={e => setField(`icon_${lang}`, e.target.value)} className="input" placeholder="https://..." />
//                           {formData[`icon_${lang}`] && <img src={formData[`icon_${lang}`]} alt="Preview" className="w-20 h-20 object-cover rounded mt-2" />}
//                         </div>
//                       </div>
//                     )}
//                   </LanguageTabs>
//                 </Section>

//                 {/* Visibility & Sorting */}
//                 <Section title="👁️ Visibility & Sorting">
//                   <LanguageTabs>
//                     {lang => (
//                       <div className="space-y-3">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">Sorting Order ({lang.toUpperCase()})</label>
//                           <input type="number" value={formData[`sortingorder_${lang}`]} onChange={e => setField(`sortingorder_${lang}`, e.target.value)} className="input" placeholder="0" />
//                         </div>
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                           {[
//                             { key: `visibility_${lang}`, label: 'Visible' },
//                             { key: `enablemapview_${lang}`, label: 'Enable Map View' },
//                             { key: `sortingbynumber_${lang}`, label: 'Sort by Number' },
//                             { key: `sortingbydate_${lang}`, label: 'Sort by Date' },
//                             { key: `shuffle_${lang}`, label: 'Shuffle' },
//                           ].map(({ key, label }) => (
//                             <label key={key} className="flex items-center gap-2 cursor-pointer">
//                               <input type="checkbox" checked={formData[key]} onChange={e => setField(key, e.target.checked)} className="w-4 h-4 text-primary rounded" />
//                               <span className="text-sm text-gray-700">{label}</span>
//                             </label>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                   </LanguageTabs>
//                 </Section>

//                 {/* Search & Info */}
//                 <Section title="🔍 Search Info & Category Info">
//                   <LanguageTabs>
//                     {lang => (
//                       <div className="space-y-3">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">Search Info (Home) ({lang.toUpperCase()})</label>
//                           <textarea value={formData[`searchinfohome_${lang}`]} onChange={e => setField(`searchinfohome_${lang}`, e.target.value)} className="textarea" rows={2} placeholder="Search hint shown on home screen" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">Search Info (Document) ({lang.toUpperCase()})</label>
//                           <textarea value={formData[`searchinfodocument_${lang}`]} onChange={e => setField(`searchinfodocument_${lang}`, e.target.value)} className="textarea" rows={2} placeholder="Search hint shown in document view" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">Category Info 1 ({lang.toUpperCase()})</label>
//                           <textarea value={formData[`categoryinfo1_${lang}`]} onChange={e => setField(`categoryinfo1_${lang}`, e.target.value)} className="textarea" rows={2} placeholder="Category info text 1" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">Category Info 2 ({lang.toUpperCase()}) <span className="text-gray-400 font-normal text-xs">— shown as "Guide" button</span></label>
//                           <textarea value={formData[`categoryinfo2_${lang}`]} onChange={e => setField(`categoryinfo2_${lang}`, e.target.value)} className="textarea" rows={2} placeholder="Guide content shown to users" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">Search Keywords ({lang.toUpperCase()}) <span className="text-gray-400 font-normal">— comma separated</span></label>
//                           <input type="text" value={formData[`searchwords_${lang}`]} onChange={e => setField(`searchwords_${lang}`, e.target.value)} className="input" placeholder="word1, word2" />
//                         </div>
//                       </div>
//                     )}
//                   </LanguageTabs>
//                 </Section>

//                 {/* Tags */}
//                 <Section title="🏷️ Category Tags & Advertising">
//                   <LanguageTabs>
//                     {lang => (
//                       <div className="space-y-3">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">Category Tags ({lang.toUpperCase()}) <span className="text-gray-400 font-normal">— comma separated</span></label>
//                           <input type="text" value={formData[`categorytags_${lang}`]} onChange={e => setField(`categorytags_${lang}`, e.target.value)} className="input" placeholder="KRG, IQ, ..." />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">Advertising Data ({lang.toUpperCase()}) <span className="text-gray-400 font-normal">— comma separated</span></label>
//                           <input type="text" value={formData[`advertaisingdata_${lang}`]} onChange={e => setField(`advertaisingdata_${lang}`, e.target.value)} className="input" placeholder="ad1, ad2" />
//                         </div>
//                       </div>
//                     )}
//                   </LanguageTabs>
//                 </Section>

//                 {/* Reporting */}
//                 <Section title="📧 Reporting & Email Settings">
//                   <LanguageTabs>
//                     {lang => (
//                       <div className="space-y-3">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Options ({lang.toUpperCase()}) <span className="text-gray-400 font-normal">— comma separated</span></label>
//                           <input type="text" value={formData[`reportingoptions_${lang}`]} onChange={e => setField(`reportingoptions_${lang}`, e.target.value)} className="input" placeholder="1, 2, 3" />
//                         </div>
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Sender Report Email ({lang.toUpperCase()})</label>
//                             <input type="email" value={formData[`senderreportemail_${lang}`]} onChange={e => setField(`senderreportemail_${lang}`, e.target.value)} className="input" placeholder="sender@example.com" />
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Receiver Report Email ({lang.toUpperCase()})</label>
//                             <input type="email" value={formData[`receiverreportemail_${lang}`]} onChange={e => setField(`receiverreportemail_${lang}`, e.target.value)} className="input" placeholder="receiver@example.com" />
//                           </div>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Sending Password ({lang.toUpperCase()})</label>
//                             <input type="text" value={formData[`sendingpass_${lang}`]} onChange={e => setField(`sendingpass_${lang}`, e.target.value)} className="input" placeholder="App password" />
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </LanguageTabs>
//                 </Section>

//                 {/* Document Tags */}
//                 <Section title="📄 Document Tags (shown as filter chips in app)">
//                   <p className="text-xs text-gray-500 mb-3">
//                     These are the scrollable tag chips shown at the top of the services list when a dd1 filter is selected. Each tag has a name and optional image per language.
//                   </p>
//                   <DocumentTagsEditor
//                     tags={formData.documenttagsdata}
//                     onChange={tags => setField('documenttagsdata', tags)}
//                   />
//                 </Section>

//               </div>

//               <div className="modal-footer">
//                 <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={saving}>
//                   {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </ProtectedRoute>
//   );
// }



// NEW 9

// COMPLETE REBUILD — all fields per Firestore schema

// COMPLETE REBUILD — all fields per Firestore schema

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAllCategories } from '../../lib/firestore';
import { app } from '../../lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Timestamp } from 'firebase/firestore';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import LanguageTabs from '../../components/LanguageTabs';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX, FiEye, FiEyeOff, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const functions = getFunctions(app);
const LANGS = ['sor', 'bad', 'ar', 'en'];

// ── Collapsible Section ────────────────────────────────────────────────────────
function Section({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button type="button" onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
        <span className="font-semibold text-gray-800 text-sm">{title}</span>
        {open ? <FiChevronUp className="text-gray-500" /> : <FiChevronDown className="text-gray-500" />}
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  );
}

// ── Empty form factory ─────────────────────────────────────────────────────────
function emptyForm() {
  const f = { json_export_name: '' };
  LANGS.forEach(l => {
    f[`name_${l}`]                  = '';
    f[`icon_${l}`]                  = '';
    f[`sortingorder_${l}`]          = '';
    f[`visibility_${l}`]            = true;
    f[`categorytags_${l}`]          = '';   // comma-separated
    f[`reportingoptions_${l}`]      = '';   // comma-separated
    f[`senderreportemail_${l}`]     = '';
    f[`receiverreportemail_${l}`]   = '';
    f[`sendingpass_${l}`]           = '';
    f[`searchwords_${l}`]           = '';   // comma-separated
    f[`enablemapview_${l}`]         = false;
    f[`categoryinfo1_${l}`]         = '';
    f[`categoryinfo2_${l}`]         = '';
    f[`advertaisingdata_${l}`]      = '';   // comma-separated
    f[`searchinfodocument_${l}`]    = '';
    f[`searchinfohome_${l}`]        = '';
    f[`sortingbynumber_${l}`]       = false;
    f[`shuffle_${l}`]               = false;
    f[`sortingbydate_${l}`]         = false;
  });
  // documenttagsdata — array of { documenttags_sor, documenttags_bad, documenttags_ar, documenttags_en,
  //                               documenttagspic_sor, documenttagspic_bad, documenttagspic_ar, documenttagspic_en }
  f.documenttagsdata = [];
  // notifications — array of { title_sor/bad/ar/en, body_sor/bad/ar/en, date_sor/bad/ar/en }
  f.notifications = [];
  return f;
}

// Convert Firestore Timestamp to "YYYY-MM-DD" string for date inputs
function timestampToDateString(ts) {
  if (!ts) return '';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toISOString().split('T')[0];
  } catch { return ''; }
}

// Convert "YYYY-MM-DD" string to Firestore Timestamp
function dateStringToTimestamp(str) {
  if (!str) return null;
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  return Timestamp.fromDate(d);
}

// Safely read a Firestore array/map/string as comma-separated string
function toCSV(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return Object.values(value).join(', ');
  return String(value);
}

// Parse existing category into form state
function categoryToForm(cat) {
  const f = emptyForm();
  f.json_export_name = cat.json_export_name || '';
  LANGS.forEach(l => {
    f[`name_${l}`]               = cat[`name_${l}`]               || '';
    f[`icon_${l}`]               = cat[`icon_${l}`]               || '';
    f[`sortingorder_${l}`]       = cat[`sortingorder_${l}`]       ?? '';
    f[`visibility_${l}`]         = cat[`visibility_${l}`]         ?? true;
    f[`enablemapview_${l}`]      = cat[`enablemapview_${l}`]      ?? false;
    f[`sortingbynumber_${l}`]    = cat[`sortingbynumber_${l}`]    ?? false;
    f[`shuffle_${l}`]            = cat[`shuffle_${l}`]            ?? false;
    f[`sortingbydate_${l}`]      = cat[`sortingbydate_${l}`]      ?? false;
    f[`senderreportemail_${l}`]  = cat[`senderreportemail_${l}`]  || '';
    f[`receiverreportemail_${l}`]= cat[`receiverreportemail_${l}`]|| '';
    f[`sendingpass_${l}`]        = cat[`sendingpass_${l}`]        || '';
    f[`categoryinfo1_${l}`]      = cat[`categoryinfo1_${l}`]      || '';
    f[`categoryinfo2_${l}`]      = cat[`categoryinfo2_${l}`]      || '';
    f[`searchinfodocument_${l}`] = cat[`searchinfodocument_${l}`] || '';
    f[`searchinfohome_${l}`]     = cat[`searchinfohome_${l}`]     || '';
    f[`categorytags_${l}`]       = toCSV(cat[`categorytags_${l}`]);
    f[`reportingoptions_${l}`]   = toCSV(cat[`reportingoptions_${l}`]);
    f[`searchwords_${l}`]        = toCSV(cat[`searchwords_${l}`]);
    f[`advertaisingdata_${l}`]   = toCSV(cat[`advertaisingdata_${l}`]);
  });
  // documenttagsdata
  const raw = cat.documenttagsdata;
  if (Array.isArray(raw)) {
    f.documenttagsdata = raw.map(item => {
      const entry = {};
      LANGS.forEach(l => {
        entry[`documenttags_${l}`]    = item[`documenttags_${l}`]    || '';
        entry[`documenttagspic_${l}`] = item[`documenttagspic_${l}`] || '';
      });
      return entry;
    });
  }
  // notifications
  const notifRaw = cat.notifications;
  if (Array.isArray(notifRaw)) {
    f.notifications = notifRaw.map(n => {
      const entry = {};
      LANGS.forEach(l => {
        entry[`title_${l}`] = n[`title_${l}`] || '';
        entry[`body_${l}`]  = n[`body_${l}`]  || '';
        entry[`date_${l}`]  = timestampToDateString(n[`date_${l}`]);
      });
      return entry;
    });
  }
  return f;
}

function formToCategoryData(f) {
  const data = { json_export_name: f.json_export_name };
  LANGS.forEach(l => {
    data[`name_${l}`]               = f[`name_${l}`];
    data[`icon_${l}`]               = f[`icon_${l}`];
    data[`sortingorder_${l}`]       = f[`sortingorder_${l}`] !== '' ? Number(f[`sortingorder_${l}`]) : 0;
    data[`visibility_${l}`]         = f[`visibility_${l}`];
    data[`enablemapview_${l}`]      = f[`enablemapview_${l}`];
    data[`sortingbynumber_${l}`]    = f[`sortingbynumber_${l}`];
    data[`shuffle_${l}`]            = f[`shuffle_${l}`];
    data[`sortingbydate_${l}`]      = f[`sortingbydate_${l}`];
    data[`senderreportemail_${l}`]  = f[`senderreportemail_${l}`];
    data[`receiverreportemail_${l}`]= f[`receiverreportemail_${l}`];
    data[`sendingpass_${l}`]        = f[`sendingpass_${l}`];
    data[`categoryinfo1_${l}`]      = f[`categoryinfo1_${l}`];
    data[`categoryinfo2_${l}`]      = f[`categoryinfo2_${l}`];
    data[`searchinfodocument_${l}`] = f[`searchinfodocument_${l}`];
    data[`searchinfohome_${l}`]     = f[`searchinfohome_${l}`];
    // comma-separated → array
    data[`categorytags_${l}`]    = f[`categorytags_${l}`].split(',').map(s => s.trim()).filter(Boolean);
    data[`reportingoptions_${l}`]= f[`reportingoptions_${l}`].split(',').map(s => s.trim()).filter(Boolean);
    data[`searchwords_${l}`]     = f[`searchwords_${l}`].split(',').map(s => s.trim()).filter(Boolean);
    data[`advertaisingdata_${l}`]= f[`advertaisingdata_${l}`].split(',').map(s => s.trim()).filter(Boolean);
  });
  // documenttagsdata
  data.documenttagsdata = (f.documenttagsdata || []).map(entry => {
    const item = {};
    LANGS.forEach(l => {
      item[`documenttags_${l}`]    = entry[`documenttags_${l}`]    || '';
      item[`documenttagspic_${l}`] = entry[`documenttagspic_${l}`] || '';
    });
    return item;
  });
  // notifications
  data.notifications = (f.notifications || []).map(n => {
    const item = {};
    LANGS.forEach(l => {
      item[`title_${l}`] = n[`title_${l}`] || '';
      item[`body_${l}`]  = n[`body_${l}`]  || '';
      item[`date_${l}`]  = dateStringToTimestamp(n[`date_${l}`]);
    });
    return item;
  });
  return data;
}

// ── Document Tags Editor ───────────────────────────────────────────────────────
function DocumentTagsEditor({ tags, onChange }) {
  const addTag = () => {
    const entry = {};
    LANGS.forEach(l => { entry[`documenttags_${l}`] = ''; entry[`documenttagspic_${l}`] = ''; });
    onChange([...tags, entry]);
  };
  const removeTag = (i) => onChange(tags.filter((_, idx) => idx !== i));
  const updateTag = (i, field, value) => onChange(tags.map((t, idx) => idx === i ? { ...t, [field]: value } : t));

  return (
    <div className="space-y-3">
      {tags.map((tag, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500">Document Tag {i + 1}</span>
            <button type="button" onClick={() => removeTag(i)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
          </div>
          {LANGS.map(l => (
            <div key={l} className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tag Name ({l.toUpperCase()})</label>
                <input type="text" value={tag[`documenttags_${l}`] || ''} onChange={e => updateTag(i, `documenttags_${l}`, e.target.value)} className="input text-sm py-1" placeholder="Tag label" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tag Image URL ({l.toUpperCase()})</label>
                <input type="url" value={tag[`documenttagspic_${l}`] || ''} onChange={e => updateTag(i, `documenttagspic_${l}`, e.target.value)} className="input text-sm py-1" placeholder="https://..." />
              </div>
            </div>
          ))}
        </div>
      ))}
      <button type="button" onClick={addTag} className="btn btn-secondary btn-sm w-full">+ Add Document Tag</button>
    </div>
  );
}

// ── Notifications Editor ───────────────────────────────────────────────────────
function NotificationsEditor({ notifications, onChange }) {
  const addNotif = () => {
    const entry = {};
    LANGS.forEach(l => {
      entry[`title_${l}`] = '';
      entry[`body_${l}`]  = '';
      entry[`date_${l}`]  = '';
    });
    onChange([...notifications, entry]);
  };

  const removeNotif = (i) => onChange(notifications.filter((_, idx) => idx !== i));

  const updateNotif = (i, field, value) =>
    onChange(notifications.map((n, idx) => idx === i ? { ...n, [field]: value } : n));

  return (
    <div className="space-y-3">
      {notifications.map((notif, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500">Notification {i + 1}</span>
            <button type="button" onClick={() => removeNotif(i)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
          </div>
          {LANGS.map(l => (
            <div key={l} className="border border-gray-100 rounded-lg p-3 bg-white space-y-2">
              <p className="text-xs font-semibold text-primary">{l.toUpperCase()}</p>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Title ({l.toUpperCase()})</label>
                <input type="text" value={notif[`title_${l}`] || ''} onChange={e => updateNotif(i, `title_${l}`, e.target.value)} className="input text-sm py-1" placeholder="Notification title" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Body ({l.toUpperCase()})</label>
                <textarea value={notif[`body_${l}`] || ''} onChange={e => updateNotif(i, `body_${l}`, e.target.value)} className="textarea text-sm py-1" rows={2} placeholder="Notification body text" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date ({l.toUpperCase()})</label>
                <input type="date" value={notif[`date_${l}`] || ''} onChange={e => updateNotif(i, `date_${l}`, e.target.value)} className="input text-sm py-1" />
              </div>
            </div>
          ))}
        </div>
      ))}
      <button type="button" onClick={addNotif} className="btn btn-secondary btn-sm w-full">
        + Add Notification
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const { canAccess, canAccessCategory } = useAuth();
  const [categories, setCategories]       = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [searchTerm, setSearchTerm]       = useState('');
  const [showModal, setShowModal]         = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [formData, setFormData]           = useState(emptyForm());

  useEffect(() => { if (canAccess('categories_new')) loadCategories(); }, []);
  useEffect(() => { filterCategories(); }, [searchTerm, categories]);

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      const accessible = data.filter(cat => canAccessCategory(cat.id));
      setCategories(accessible);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    if (!searchTerm.trim()) { setFilteredCategories(categories); return; }
    const term = searchTerm.toLowerCase();
    setFilteredCategories(categories.filter(cat =>
      LANGS.some(l => cat[`name_${l}`]?.toLowerCase().includes(term))
    ));
  };

  const handleOpenModal = (category = null) => {
    setEditingCategory(category || null);
    setFormData(category ? categoryToForm(category) : emptyForm());
    setShowModal(true);
  };

  const handleCloseModal = () => { setShowModal(false); setEditingCategory(null); };

  const setField = (key, value) => setFormData(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const categoryData = formToCategoryData(formData);
      const fn = httpsCallable(functions, 'createOrUpdateCategory');
      const result = await fn({ id: editingCategory?.id || null, categoryData });
      toast.success(result.data.action === 'updated' ? 'Category updated!' : 'Category created!');
      await loadCategories();
      handleCloseModal();
    } catch (error) {
      toast.error(error.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true, title: 'Delete Category?', message: 'Are you sure you want to delete this category?',
      onConfirm: async () => {
        try {
          await httpsCallable(functions, 'deleteItems')({ collection: 'categories_new', ids: [id] });
          toast.success('Category deleted!');
          await loadCategories();
        } catch (error) { toast.error(error.message || 'Failed to delete'); }
        finally { setConfirmDialog(p => ({ ...p, isOpen: false })); }
      },
    });
  };

  const handleDuplicate = async (id) => {
    setLoading(true);
    try {
      await httpsCallable(functions, 'duplicateItem')({ collection: 'categories_new', id });
      toast.success('Category duplicated!');
      await loadCategories();
    } catch (error) { toast.error(error.message || 'Failed to duplicate'); }
    finally { setLoading(false); }
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      isOpen: true, title: 'Delete Selected?',
      message: `Delete ${selectedCategories.length} selected categories?`,
      onConfirm: async () => {
        try {
          await httpsCallable(functions, 'deleteItems')({ collection: 'categories_new', ids: selectedCategories });
          toast.success(`${selectedCategories.length} categories deleted!`);
          setSelectedCategories([]);
          await loadCategories();
        } catch (error) { toast.error(error.message || 'Failed'); }
        finally { setConfirmDialog(p => ({ ...p, isOpen: false })); }
      },
    });
  };

  if (!canAccess('categories_new')) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl text-gray-600">You don't have access to this page.</p>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8">

          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-600 mt-1">Manage all categories</p>
            </div>
            <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
              <FiPlus size={20} /> Add New Category
            </button>
          </div>

          {/* Search */}
          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search categories..." value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)} className="input pl-10 pr-10 w-full" />
                {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><FiX size={16} /></button>}
              </div>
              {selectedCategories.length > 0 && (
                <button onClick={handleBulkDelete} className="btn btn-danger flex items-center gap-2">
                  <FiTrash2 /> Delete {selectedCategories.length} selected
                </button>
              )}
            </div>
          </div>

          {/* Count */}
          {!loading && (
            <div className="flex items-center gap-3 mb-4">
              <p className="text-sm text-gray-500 shrink-0">
                {searchTerm
                  ? `${filteredCategories.length} of ${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`
                  : `${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`}
              </p>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}

          {/* Grid */}
          {loading && !categories.length ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="card text-center py-12"><p className="text-gray-600">No categories found</p></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCategories.map(category => (
                <div key={category.id} className="card hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <input type="checkbox" checked={selectedCategories.includes(category.id)}
                      onChange={e => {
                        if (e.target.checked) setSelectedCategories(p => [...p, category.id]);
                        else setSelectedCategories(p => p.filter(id => id !== category.id));
                      }} className="w-4 h-4 text-primary rounded" />
                    <div className="flex gap-1">
                      <button onClick={() => handleOpenModal(category)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit"><FiEdit2 size={16} className="text-gray-600" /></button>
                      <button onClick={() => handleDuplicate(category.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate"><FiCopy size={16} className="text-gray-600" /></button>
                      <button onClick={() => handleDelete(category.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete"><FiTrash2 size={16} className="text-red-600" /></button>
                    </div>
                  </div>
                  {category.icon_sor && (
                    <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <img src={category.icon_sor} alt={category.name_sor} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-1">
                    {category.name_sor && <p className="text-sm font-semibold">{category.name_sor}</p>}
                    {category.name_en && <p className="text-sm text-gray-600">{category.name_en}</p>}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Order: {category.sortingorder_sor ?? 0}</span>
                      {category.visibility_sor ? <FiEye className="text-green-600" size={16} /> : <FiEyeOff className="text-gray-400" size={16} />}
                      {category.json_export_name && <span className="text-xs text-gray-400 truncate">ID: {category.json_export_name}</span>}
                    </div>
                    {(category.documenttagsdata?.length > 0) && (
                      <p className="text-xs text-blue-600">{category.documenttagsdata.length} document tag{category.documenttagsdata.length !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <DeleteConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(p => ({ ...p, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal max-w-5xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={handleCloseModal} title="Close"><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">

                {/* Export Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    JSON Export Name <span className="text-gray-400 font-normal text-xs">(non-localized identifier used by Flutter app)</span>
                  </label>
                  <input type="text" value={formData.json_export_name} onChange={e => setField('json_export_name', e.target.value)} className="input" placeholder="e.g. ATM or otombel" />
                </div>

                {/* Names & Icons */}
                <Section title="📝 Names & Icons" defaultOpen>
                  <LanguageTabs>
                    {lang => (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category Name ({lang.toUpperCase()}) *</label>
                          <input type="text" value={formData[`name_${lang}`]} onChange={e => setField(`name_${lang}`, e.target.value)} className="input" placeholder={`Category name in ${lang}`} required />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Icon URL ({lang.toUpperCase()})</label>
                          <input type="url" value={formData[`icon_${lang}`]} onChange={e => setField(`icon_${lang}`, e.target.value)} className="input" placeholder="https://..." />
                          {formData[`icon_${lang}`] && <img src={formData[`icon_${lang}`]} alt="Preview" className="w-20 h-20 object-cover rounded mt-2" />}
                        </div>
                      </div>
                    )}
                  </LanguageTabs>
                </Section>

                {/* Visibility & Sorting */}
                <Section title="👁️ Visibility & Sorting">
                  <LanguageTabs>
                    {lang => (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Sorting Order ({lang.toUpperCase()})</label>
                          <input type="number" value={formData[`sortingorder_${lang}`]} onChange={e => setField(`sortingorder_${lang}`, e.target.value)} className="input" placeholder="0" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { key: `visibility_${lang}`, label: 'Visible' },
                            { key: `enablemapview_${lang}`, label: 'Enable Map View' },
                            { key: `sortingbynumber_${lang}`, label: 'Sort by Number' },
                            { key: `sortingbydate_${lang}`, label: 'Sort by Date' },
                            { key: `shuffle_${lang}`, label: 'Shuffle' },
                          ].map(({ key, label }) => (
                            <label key={key} className="flex items-center gap-2 cursor-pointer">
                              <input type="checkbox" checked={formData[key]} onChange={e => setField(key, e.target.checked)} className="w-4 h-4 text-primary rounded" />
                              <span className="text-sm text-gray-700">{label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </LanguageTabs>
                </Section>

                {/* Search & Info */}
                <Section title="🔍 Search Info & Category Info">
                  <LanguageTabs>
                    {lang => (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Search Info (Home) ({lang.toUpperCase()})</label>
                          <textarea value={formData[`searchinfohome_${lang}`]} onChange={e => setField(`searchinfohome_${lang}`, e.target.value)} className="textarea" rows={2} placeholder="Search hint shown on home screen" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Search Info (Document) ({lang.toUpperCase()})</label>
                          <textarea value={formData[`searchinfodocument_${lang}`]} onChange={e => setField(`searchinfodocument_${lang}`, e.target.value)} className="textarea" rows={2} placeholder="Search hint shown in document view" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category Info 1 ({lang.toUpperCase()})</label>
                          <textarea value={formData[`categoryinfo1_${lang}`]} onChange={e => setField(`categoryinfo1_${lang}`, e.target.value)} className="textarea" rows={2} placeholder="Category info text 1" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category Info 2 ({lang.toUpperCase()}) <span className="text-gray-400 font-normal text-xs">— shown as "Guide" button</span></label>
                          <textarea value={formData[`categoryinfo2_${lang}`]} onChange={e => setField(`categoryinfo2_${lang}`, e.target.value)} className="textarea" rows={2} placeholder="Guide content shown to users" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Search Keywords ({lang.toUpperCase()}) <span className="text-gray-400 font-normal">— comma separated</span></label>
                          <input type="text" value={formData[`searchwords_${lang}`]} onChange={e => setField(`searchwords_${lang}`, e.target.value)} className="input" placeholder="word1, word2" />
                        </div>
                      </div>
                    )}
                  </LanguageTabs>
                </Section>

                {/* Tags */}
                <Section title="🏷️ Category Tags & Advertising">
                  <LanguageTabs>
                    {lang => (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category Tags ({lang.toUpperCase()}) <span className="text-gray-400 font-normal">— comma separated</span></label>
                          <input type="text" value={formData[`categorytags_${lang}`]} onChange={e => setField(`categorytags_${lang}`, e.target.value)} className="input" placeholder="KRG, IQ, ..." />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Advertising Data ({lang.toUpperCase()}) <span className="text-gray-400 font-normal">— comma separated</span></label>
                          <input type="text" value={formData[`advertaisingdata_${lang}`]} onChange={e => setField(`advertaisingdata_${lang}`, e.target.value)} className="input" placeholder="ad1, ad2" />
                        </div>
                      </div>
                    )}
                  </LanguageTabs>
                </Section>

                {/* Reporting */}
                <Section title="📧 Reporting & Email Settings">
                  <LanguageTabs>
                    {lang => (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Options ({lang.toUpperCase()}) <span className="text-gray-400 font-normal">— comma separated</span></label>
                          <input type="text" value={formData[`reportingoptions_${lang}`]} onChange={e => setField(`reportingoptions_${lang}`, e.target.value)} className="input" placeholder="1, 2, 3" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sender Report Email ({lang.toUpperCase()})</label>
                            <input type="email" value={formData[`senderreportemail_${lang}`]} onChange={e => setField(`senderreportemail_${lang}`, e.target.value)} className="input" placeholder="sender@example.com" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Receiver Report Email ({lang.toUpperCase()})</label>
                            <input type="email" value={formData[`receiverreportemail_${lang}`]} onChange={e => setField(`receiverreportemail_${lang}`, e.target.value)} className="input" placeholder="receiver@example.com" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sending Password ({lang.toUpperCase()})</label>
                            <input type="text" value={formData[`sendingpass_${lang}`]} onChange={e => setField(`sendingpass_${lang}`, e.target.value)} className="input" placeholder="App password" />
                          </div>
                        </div>
                      </div>
                    )}
                  </LanguageTabs>
                </Section>

                {/* Document Tags */}
                <Section title="📄 Document Tags (shown as filter chips in app)">
                  <p className="text-xs text-gray-500 mb-3">
                    These are the scrollable tag chips shown at the top of the services list when a dd1 filter is selected. Each tag has a name and optional image per language.
                  </p>
                  <DocumentTagsEditor
                    tags={formData.documenttagsdata}
                    onChange={tags => setField('documenttagsdata', tags)}
                  />
                </Section>

                {/* Notifications */}
                <Section title="🔔 Notifications">
                  <p className="text-xs text-gray-500 mb-3">
                    Push notifications associated with this category. Each notification has a title, body, and date per language.
                  </p>
                  <NotificationsEditor
                    notifications={formData.notifications}
                    onChange={notifs => setField('notifications', notifs)}
                  />
                </Section>

              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}