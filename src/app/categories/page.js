// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import {
//   getAllCategories,
//   createCategory,
//   updateCategory,
//   deleteCategory,
//   duplicateCategory,
//   bulkDeleteCategories,
// } from '../../lib/firestore';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import LanguageTabs from '../../components/LanguageTabs';
// import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
// import toast from 'react-hot-toast';
// import ConfirmDialog from '../../components/ConfirmDialog';

// export default function CategoriesPage() {
//   const { canAccess } = useAuth();
//   const [categories, setCategories] = useState([]);
//   const [filteredCategories, setFilteredCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [selectedCategories, setSelectedCategories] = useState([]);
//   const [confirmDialog, setConfirmDialog] = useState({
//     isOpen: false,
//     title: '',
//     message: '',
//     onConfirm: () => { },
//   });

//   const [formData, setFormData] = useState({
//     name_sor: '',
//     name_bad: '',
//     name_ar: '',
//     name_en: '',
//     icon_sor: '',
//     icon_bad: '',
//     icon_ar: '',
//     icon_en: '',
//     sortingorder_sor: 0,
//     sortingorder_bad: 0,
//     sortingorder_ar: 0,
//     sortingorder_en: 0,
//     visibility_sor: true,
//     visibility_bad: true,
//     visibility_ar: true,
//     visibility_en: true,
//   });

//   useEffect(() => {
//     if (canAccess('categories_new')) {
//       loadCategories();
//     }
//   }, []);

//   useEffect(() => {
//     filterCategories();
//   }, [searchTerm, categories]);

//   const loadCategories = async () => {
//     try {
//       const data = await getAllCategories();
//       setCategories(data);
//     } catch (error) {
//       console.error('Error loading categories:', error);
//       toast.error('Failed to load categories');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterCategories = () => {
//     if (!searchTerm.trim()) {
//       setFilteredCategories(categories);
//       return;
//     }

//     const term = searchTerm.toLowerCase();
//     const filtered = categories.filter(cat =>
//       cat.name_sor?.toLowerCase().includes(term) ||
//       cat.name_bad?.toLowerCase().includes(term) ||
//       cat.name_ar?.toLowerCase().includes(term) ||
//       cat.name_en?.toLowerCase().includes(term)
//     );
//     setFilteredCategories(filtered);
//   };

//   const handleOpenModal = (category = null) => {
//     if (category) {
//       setEditingCategory(category);
//       setFormData({
//         name_sor: category.name_sor || '',
//         name_bad: category.name_bad || '',
//         name_ar: category.name_ar || '',
//         name_en: category.name_en || '',
//         icon_sor: category.icon_sor || '',
//         icon_bad: category.icon_bad || '',
//         icon_ar: category.icon_ar || '',
//         icon_en: category.icon_en || '',
//         sortingorder_sor: category.sortingorder_sor || 0,
//         sortingorder_bad: category.sortingorder_bad || 0,
//         sortingorder_ar: category.sortingorder_ar || 0,
//         sortingorder_en: category.sortingorder_en || 0,
//         visibility_sor: category.visibility_sor ?? true,
//         visibility_bad: category.visibility_bad ?? true,
//         visibility_ar: category.visibility_ar ?? true,
//         visibility_en: category.visibility_en ?? true,
//       });
//     } else {
//       setEditingCategory(null);
//       setFormData({
//         name_sor: '',
//         name_bad: '',
//         name_ar: '',
//         name_en: '',
//         icon_sor: '',
//         icon_bad: '',
//         icon_ar: '',
//         icon_en: '',
//         sortingorder_sor: 0,
//         sortingorder_bad: 0,
//         sortingorder_ar: 0,
//         sortingorder_en: 0,
//         visibility_sor: true,
//         visibility_bad: true,
//         visibility_ar: true,
//         visibility_en: true,
//       });
//     }
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setEditingCategory(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       if (editingCategory) {
//         await updateCategory(editingCategory.id, formData);
//         toast.success('Category updated successfully!');
//       } else {
//         await createCategory(formData);
//         toast.success('Category created successfully!');
//       }
//       await loadCategories();
//       handleCloseModal();
//     } catch (error) {
//       console.error('Error saving category:', error);
//       toast.error('Failed to save category');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // const handleDelete = async (id) => {
//   //   if (!confirm('Are you sure you want to delete this category?')) return;

//   //   setLoading(true);
//   //   try {
//   //     await deleteCategory(id);
//   //     toast.success('Category deleted successfully!');
//   //     await loadCategories();
//   //   } catch (error) {
//   //     console.error('Error deleting category:', error);
//   //     toast.error('Failed to delete category');
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   const handleDelete = async (id) => {
//     // We don't need a try/catch around the state setter itself, 
//     // only inside the actual deletion logic.
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Category?',
//       message: 'Are you sure you want to delete this category? This action cannot be undone.',
//       onConfirm: async () => {
//         try {
//           await deleteCategory(id);
//           toast.success('Category deleted successfully!');
//           await loadCategories();
//         } catch (error) {
//           console.error('Error deleting category:', error);
//           toast.error('Failed to delete category');
//         } finally {
//           // Close the dialog only AFTER the user confirms and the action completes
//           setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };

//   const handleDuplicate = async (id) => {
//     setLoading(true);
//     try {
//       await duplicateCategory(id);
//       toast.success('Category duplicated successfully!');
//       await loadCategories();
//     } catch (error) {
//       console.error('Error duplicating category:', error);
//       toast.error('Failed to duplicate category');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBulkDelete = async () => {
//     // if (!confirm(`Delete ${selectedCategories.length} categories?`)) return;

//     // setLoading(true);
//     // try {
//     //   await bulkDeleteCategories(selectedCategories);
//     //   toast.success(`${selectedCategories.length} categories deleted!`);
//     //   setSelectedCategories([]);
//     //   await loadCategories();
//     // } catch (error) {
//     //   console.error('Error deleting categories:', error);
//     //   toast.error('Failed to delete categories');
//     // } finally {
//     //   setLoading(false);
//     // }


//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Selected Categories?',
//       message: `Are you sure you want to delete ${selectedCategories.length} selected categories? This action cannot be undone.`,
//       onConfirm: async () => {
//         try {
//           await bulkDeleteCategories(selectedCategories);
//           toast.success(`${selectedCategories.length} categories deleted successfully!`);
//           setSelectedCategories([]);
//           await loadCategories();
//         } catch (error) {
//           console.error('Error deleting categories:', error);
//           toast.error('Failed to delete categories');
//         } finally {
//           // Close the dialog only AFTER the user confirms and the action completes
//           setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
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

//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
//               <p className="text-gray-600 mt-1">Manage all categories</p>
//             </div>
//             <button
//               onClick={() => handleOpenModal()}
//               className="btn btn-primary flex items-center gap-2"
//             >
//               <FiPlus size={20} />
//               Add New Category
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
//                   <button
//                     onClick={() => setSearchTerm('')}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     title="Clear search"
//                   >
//                     <FiX size={16} />
//                   </button>
//                 )}
//               </div>
//               {selectedCategories.length > 0 && (
//                 <button
//                   onClick={handleBulkDelete}
//                   className="btn btn-danger flex items-center gap-2"
//                 >
//                   <FiTrash2 />
//                   Delete {selectedCategories.length} selected
//                 </button>
//               )}
//             </div>
//           </div>

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
//                         if (e.target.checked) {
//                           setSelectedCategories([...selectedCategories, category.id]);
//                         } else {
//                           setSelectedCategories(selectedCategories.filter(id => id !== category.id));
//                         }
//                       }}
//                       className="w-4 h-4 text-primary rounded"
//                     />
//                     <div className="flex gap-1">
//                       <button
//                         onClick={() => handleOpenModal(category)}
//                         className="p-1.5 hover:bg-gray-100 rounded"
//                         title="Edit"
//                       >
//                         <FiEdit2 size={16} className="text-gray-600" />
//                       </button>
//                       <button
//                         onClick={() => handleDuplicate(category.id)}
//                         className="p-1.5 hover:bg-gray-100 rounded"
//                         title="Duplicate"
//                       >
//                         <FiCopy size={16} className="text-gray-600" />
//                       </button>
//                       <button
//                         onClick={() => handleDelete(category.id)}
//                         className="p-1.5 hover:bg-gray-100 rounded"
//                         title="Delete"
//                       >
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
//                     {category.name_sor && (
//                       <p className="text-sm font-semibold">{category.name_sor}</p>
//                     )}
//                     {category.name_en && (
//                       <p className="text-sm text-gray-600">{category.name_en}</p>
//                     )}
//                     <div className="flex items-center gap-2 mt-2">
//                       <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
//                         Order: {category.sortingorder_sor || 0}
//                       </span>
//                       {category.visibility_sor ? (
//                         <FiEye className="text-green-600" size={16} />
//                       ) : (
//                         <FiEyeOff className="text-gray-400" size={16} />
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </main>
//       </div>

//       <ConfirmDialog
//         isOpen={confirmDialog.isOpen}
//         onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
//         onConfirm={confirmDialog.onConfirm}
//         title={confirmDialog.title}
//         message={confirmDialog.message}
//         confirmText="Delete"
//         cancelText="Cancel"
//         type="danger"
//       />

//       {showModal && (
//         <div className="modal-overlay" onClick={handleCloseModal}>
//           <div className="modal" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">
//                 {editingCategory ? 'Edit Category' : 'Add New Category'}
//               </h2>
//               <button onClick={handleCloseModal}>
//                 <FiX size={24} className="text-gray-600 hover:text-gray-900" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="modal-body">
//                 <LanguageTabs>
//                   {(lang) => (
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Category Name ({lang.toUpperCase()}) *
//                         </label>
//                         <input
//                           type="text"
//                           value={formData[`name_${lang}`]}
//                           onChange={(e) => setFormData({
//                             ...formData,
//                             [`name_${lang}`]: e.target.value
//                           })}
//                           className="input"
//                           placeholder={`Enter category name in ${lang}`}
//                           required
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Icon URL ({lang.toUpperCase()})
//                         </label>
//                         <input
//                           type="url"
//                           value={formData[`icon_${lang}`]}
//                           onChange={(e) => setFormData({
//                             ...formData,
//                             [`icon_${lang}`]: e.target.value
//                           })}
//                           className="input"
//                           placeholder="https://example.com/icon.png"
//                         />
//                         {formData[`icon_${lang}`] && (
//                           <div className="mt-2">
//                             <img src={formData[`icon_${lang}`]} alt="Preview" className="w-32 h-32 object-cover rounded" />
//                           </div>
//                         )}
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Sorting Order ({lang.toUpperCase()})
//                         </label>
//                         <input
//                           type="number"
//                           value={formData[`sortingorder_${lang}`]}
//                           onChange={(e) => setFormData({
//                             ...formData,
//                             [`sortingorder_${lang}`]: parseInt(e.target.value) || 0
//                           })}
//                           className="input"
//                           placeholder="0"
//                         />
//                       </div>

//                       <div className="flex items-center gap-2">
//                         <input
//                           type="checkbox"
//                           id={`visibility_${lang}`}
//                           checked={formData[`visibility_${lang}`]}
//                           onChange={(e) => setFormData({
//                             ...formData,
//                             [`visibility_${lang}`]: e.target.checked
//                           })}
//                           className="w-4 h-4 text-primary rounded"
//                         />
//                         <label htmlFor={`visibility_${lang}`} className="text-sm font-medium text-gray-700">
//                           Visible in {lang.toUpperCase()}
//                         </label>
//                       </div>
//                     </div>
//                   )}
//                 </LanguageTabs>
//               </div>

//               <div className="modal-footer">
//                 <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
//                   Cancel
//                 </button>
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




// NEW



'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAllCategories } from '../../lib/firestore';
import { app } from '../../lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import LanguageTabs from '../../components/LanguageTabs';
import ConfirmDialog from '../../components/ConfirmDialog';
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

const functions = getFunctions(app);

export default function CategoriesPage() {
  const { canAccess, canAccessCategory } = useAuth();
  const [categories, setCategories]           = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [searchTerm, setSearchTerm]           = useState('');
  const [showModal, setShowModal]             = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [confirmDialog, setConfirmDialog]     = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const emptyForm = {
    name_sor: '', name_bad: '', name_ar: '', name_en: '',
    icon_sor: '', icon_bad: '', icon_ar: '', icon_en: '',
    sortingorder_sor: 0, sortingorder_bad: 0, sortingorder_ar: 0, sortingorder_en: 0,
    visibility_sor: true, visibility_bad: true, visibility_ar: true, visibility_en: true,
  };
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (canAccess('categories_new')) loadCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [searchTerm, categories]);

  const loadCategories = async () => {
    try {
      const data = await getAllCategories();
      // Filter to only categories this user can access
      const accessible = data.filter(cat => canAccessCategory(cat.id));
      setCategories(accessible);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    if (!searchTerm.trim()) { setFilteredCategories(categories); return; }
    const term = searchTerm.toLowerCase();
    setFilteredCategories(categories.filter(cat =>
      cat.name_sor?.toLowerCase().includes(term) ||
      cat.name_bad?.toLowerCase().includes(term) ||
      cat.name_ar?.toLowerCase().includes(term)  ||
      cat.name_en?.toLowerCase().includes(term)
    ));
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name_sor: category.name_sor || '', name_bad: category.name_bad || '',
        name_ar:  category.name_ar  || '', name_en:  category.name_en  || '',
        icon_sor: category.icon_sor || '', icon_bad: category.icon_bad || '',
        icon_ar:  category.icon_ar  || '', icon_en:  category.icon_en  || '',
        sortingorder_sor: category.sortingorder_sor || 0,
        sortingorder_bad: category.sortingorder_bad || 0,
        sortingorder_ar:  category.sortingorder_ar  || 0,
        sortingorder_en:  category.sortingorder_en  || 0,
        visibility_sor: category.visibility_sor ?? true,
        visibility_bad: category.visibility_bad ?? true,
        visibility_ar:  category.visibility_ar  ?? true,
        visibility_en:  category.visibility_en  ?? true,
      });
    } else {
      setEditingCategory(null);
      setFormData(emptyForm);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => { setShowModal(false); setEditingCategory(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fn = httpsCallable(functions, 'createOrUpdateCategory');
      const result = await fn({
        id: editingCategory?.id || null,
        categoryData: formData,
      });
      toast.success(result.data.action === 'updated' ? 'Category updated!' : 'Category created!');
      await loadCategories();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(error.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Category?',
      message: 'Are you sure you want to delete this category? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const fn = httpsCallable(functions, 'deleteItems');
          await fn({ collection: 'categories_new', ids: [id] });
          toast.success('Category deleted successfully!');
          await loadCategories();
        } catch (error) {
          toast.error(error.message || 'Failed to delete category');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleDuplicate = async (id) => {
    setLoading(true);
    try {
      const fn = httpsCallable(functions, 'duplicateItem');
      await fn({ collection: 'categories_new', id });
      toast.success('Category duplicated successfully!');
      await loadCategories();
    } catch (error) {
      toast.error(error.message || 'Failed to duplicate category');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Selected Categories?',
      message: `Are you sure you want to delete ${selectedCategories.length} selected categories? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const fn = httpsCallable(functions, 'deleteItems');
          await fn({ collection: 'categories_new', ids: selectedCategories });
          toast.success(`${selectedCategories.length} categories deleted successfully!`);
          setSelectedCategories([]);
          await loadCategories();
        } catch (error) {
          toast.error(error.message || 'Failed to delete categories');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  if (!canAccess('categories_new')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">You don't have access to this page.</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 lg:p-8">

          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
              <p className="text-gray-600 mt-1">Manage all categories</p>
            </div>
            <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
              <FiPlus size={20} /> Add New Category
            </button>
          </div>

          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 pr-10 w-full"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <FiX size={16} />
                  </button>
                )}
              </div>
              {selectedCategories.length > 0 && (
                <button onClick={handleBulkDelete} className="btn btn-danger flex items-center gap-2">
                  <FiTrash2 /> Delete {selectedCategories.length} selected
                </button>
              )}
            </div>
          </div>

          {loading && !categories.length ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600">No categories found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCategories.map((category) => (
                <div key={category.id} className="card hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <input
                      type="checkbox"
                      title="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedCategories([...selectedCategories, category.id]);
                        else setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                      }}
                      className="w-4 h-4 text-primary rounded"
                    />
                    <div className="flex gap-1">
                      <button onClick={() => handleOpenModal(category)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit">
                        <FiEdit2 size={16} className="text-gray-600" />
                      </button>
                      <button onClick={() => handleDuplicate(category.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate">
                        <FiCopy size={16} className="text-gray-600" />
                      </button>
                      <button onClick={() => handleDelete(category.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete">
                        <FiTrash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>

                  {category.icon_sor && (
                    <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <img src={category.icon_sor} alt={category.name_sor} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="space-y-1">
                    {category.name_sor && <p className="text-sm font-semibold">{category.name_sor}</p>}
                    {category.name_en  && <p className="text-sm text-gray-600">{category.name_en}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Order: {category.sortingorder_sor || 0}
                      </span>
                      {category.visibility_sor
                        ? <FiEye className="text-green-600" size={16} />
                        : <FiEyeOff className="text-gray-400" size={16} />
                      }
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={handleCloseModal}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <LanguageTabs>
                  {(lang) => (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category Name ({lang.toUpperCase()}) *</label>
                        <input type="text" value={formData[`name_${lang}`]} onChange={(e) => setFormData({ ...formData, [`name_${lang}`]: e.target.value })} className="input" placeholder={`Enter category name in ${lang}`} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Icon URL ({lang.toUpperCase()})</label>
                        <input type="url" value={formData[`icon_${lang}`]} onChange={(e) => setFormData({ ...formData, [`icon_${lang}`]: e.target.value })} className="input" placeholder="https://example.com/icon.png" />
                        {formData[`icon_${lang}`] && (
                          <div className="mt-2"><img src={formData[`icon_${lang}`]} alt="Preview" className="w-32 h-32 object-cover rounded" /></div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Sorting Order ({lang.toUpperCase()})</label>
                        <input type="number" value={formData[`sortingorder_${lang}`]} onChange={(e) => setFormData({ ...formData, [`sortingorder_${lang}`]: parseInt(e.target.value) || 0 })} className="input" placeholder="0" />
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id={`visibility_${lang}`} checked={formData[`visibility_${lang}`]} onChange={(e) => setFormData({ ...formData, [`visibility_${lang}`]: e.target.checked })} className="w-4 h-4 text-primary rounded" />
                        <label htmlFor={`visibility_${lang}`} className="text-sm font-medium text-gray-700">Visible in {lang.toUpperCase()}</label>
                      </div>
                    </div>
                  )}
                </LanguageTabs>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editingCategory ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}