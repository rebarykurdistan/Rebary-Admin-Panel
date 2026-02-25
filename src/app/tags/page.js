// // 'use client';

// // import { useEffect, useState } from 'react';
// // import { useAuth } from '../../hooks/useAuth';
// // import {
// //   getAllTags,
// //   createTag,
// //   updateTag,
// //   deleteTag,
// //   duplicateTag,
// //   bulkDeleteTags,
// // } from '../../lib/firestore';
// // import Sidebar from '../../components/Sidebar';
// // import ProtectedRoute from '../../components/ProtectedRoute';
// // import LanguageTabs from '../../components/LanguageTabs';
// // import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX } from 'react-icons/fi';
// // import toast from 'react-hot-toast';

// // export default function TagsPage() {
// //   const { canAccess } = useAuth();
// //   const [tags, setTags] = useState([]);
// //   const [filteredTags, setFilteredTags] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [showModal, setShowModal] = useState(false);
// //   const [editingTag, setEditingTag] = useState(null);
// //   const [selectedTags, setSelectedTags] = useState([]);

// //   const [formData, setFormData] = useState({
// //     tagsname_sor: '',
// //     tagsname_bad: '',
// //     tagsname_ar: '',
// //     tagsname_en: '',
// //     image: '',
// //     name: '',
// //   });

// //   useEffect(() => {
// //     if (canAccess('tags_new')) {
// //       loadTags();
// //     }
// //   }, []);

// //   useEffect(() => {
// //     filterTags();
// //   }, [searchTerm, tags]);

// //   const loadTags = async () => {
// //     try {
// //       const data = await getAllTags();
// //       setTags(data);
// //     } catch (error) {
// //       console.error('Error loading tags:', error);
// //       toast.error('Failed to load tags');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const filterTags = () => {
// //     if (!searchTerm.trim()) {
// //       setFilteredTags(tags);
// //       return;
// //     }

// //     const term = searchTerm.toLowerCase();
// //     const filtered = tags.filter(tag =>
// //       tag.tagsname_sor?.toLowerCase().includes(term) ||
// //       tag.tagsname_bad?.toLowerCase().includes(term) ||
// //       tag.tagsname_ar?.toLowerCase().includes(term) ||
// //       tag.tagsname_en?.toLowerCase().includes(term) ||
// //       tag.name?.toLowerCase().includes(term)
// //     );
// //     setFilteredTags(filtered);
// //   };

// //   const handleOpenModal = (tag = null) => {
// //     if (tag) {
// //       setEditingTag(tag);
// //       setFormData({
// //         tagsname_sor: tag.tagsname_sor || '',
// //         tagsname_bad: tag.tagsname_bad || '',
// //         tagsname_ar: tag.tagsname_ar || '',
// //         tagsname_en: tag.tagsname_en || '',
// //         image: tag.image || '',
// //         name: tag.name || '',
// //       });
// //     } else {
// //       setEditingTag(null);
// //       setFormData({
// //         tagsname_sor: '',
// //         tagsname_bad: '',
// //         tagsname_ar: '',
// //         tagsname_en: '',
// //         image: '',
// //         name: '',
// //       });
// //     }
// //     setShowModal(true);
// //   };

// //   const handleCloseModal = () => {
// //     setShowModal(false);
// //     setEditingTag(null);
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);

// //     try {
// //       if (editingTag) {
// //         await updateTag(editingTag.id, formData);
// //         toast.success('Tag updated successfully!');
// //       } else {
// //         await createTag(formData);
// //         toast.success('Tag created successfully!');
// //       }
// //       await loadTags();
// //       handleCloseModal();
// //     } catch (error) {
// //       console.error('Error saving tag:', error);
// //       toast.error('Failed to save tag');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleDelete = async (id) => {
// //     if (!confirm('Are you sure you want to delete this tag?')) return;

// //     setLoading(true);
// //     try {
// //       await deleteTag(id);
// //       toast.success('Tag deleted successfully!');
// //       await loadTags();
// //     } catch (error) {
// //       console.error('Error deleting tag:', error);
// //       toast.error('Failed to delete tag');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleDuplicate = async (id) => {
// //     setLoading(true);
// //     try {
// //       await duplicateTag(id);
// //       toast.success('Tag duplicated successfully!');
// //       await loadTags();
// //     } catch (error) {
// //       console.error('Error duplicating tag:', error);
// //       toast.error('Failed to duplicate tag');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleBulkDelete = async () => {
// //     if (!confirm(`Delete ${selectedTags.length} tags?`)) return;

// //     setLoading(true);
// //     try {
// //       await bulkDeleteTags(selectedTags);
// //       toast.success(`${selectedTags.length} tags deleted!`);
// //       setSelectedTags([]);
// //       await loadTags();
// //     } catch (error) {
// //       console.error('Error deleting tags:', error);
// //       toast.error('Failed to delete tags');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   if (!canAccess('tags_new')) {
// //     return (
// //       <div className="min-h-screen flex items-center justify-center">
// //         <p className="text-xl text-gray-600">You don't have access to this page.</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <ProtectedRoute>
// //       <div className="flex min-h-screen bg-gray-50">
// //         <Sidebar />
        
// //         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
// //           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
// //             <div>
// //               <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
// //               <p className="text-gray-600 mt-1">Manage all tags</p>
// //             </div>
// //             <button
// //               onClick={() => handleOpenModal()}
// //               className="btn btn-primary flex items-center gap-2"
// //             >
// //               <FiPlus size={20} />
// //               Add New Tag
// //             </button>
// //           </div>

// //           <div className="card mb-6">
// //             <div className="flex flex-col sm:flex-row gap-4">
// //               <div className="flex-1 relative">
// //                 <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// //                 <input
// //                   type="text"
// //                   placeholder="Search tags..."
// //                   value={searchTerm}
// //                   onChange={(e) => setSearchTerm(e.target.value)}
// //                   className="input pl-10 w-full"
// //                 />
// //               </div>
// //               {selectedTags.length > 0 && (
// //                 <button
// //                   onClick={handleBulkDelete}
// //                   className="btn btn-danger flex items-center gap-2"
// //                 >
// //                   <FiTrash2 />
// //                   Delete {selectedTags.length} selected
// //                 </button>
// //               )}
// //             </div>
// //           </div>

// //           {loading && !tags.length ? (
// //             <div className="flex items-center justify-center py-12">
// //               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
// //             </div>
// //           ) : filteredTags.length === 0 ? (
// //             <div className="card text-center py-12">
// //               <p className="text-gray-600">No tags found</p>
// //             </div>
// //           ) : (
// //             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
// //               {filteredTags.map((tag) => (
// //                 <div key={tag.id} className="card hover:shadow-lg transition-all">
// //                   <div className="flex items-start justify-between mb-3">
// //                     <input
// //                       type="checkbox"
// //                       checked={selectedTags.includes(tag.id)}
// //                       onChange={(e) => {
// //                         if (e.target.checked) {
// //                           setSelectedTags([...selectedTags, tag.id]);
// //                         } else {
// //                           setSelectedTags(selectedTags.filter(id => id !== tag.id));
// //                         }
// //                       }}
// //                       className="w-4 h-4 text-primary rounded"
// //                     />
// //                     <div className="flex gap-1">
// //                       <button
// //                         onClick={() => handleOpenModal(tag)}
// //                         className="p-1.5 hover:bg-gray-100 rounded"
// //                       >
// //                         <FiEdit2 size={16} className="text-gray-600" />
// //                       </button>
// //                       <button
// //                         onClick={() => handleDuplicate(tag.id)}
// //                         className="p-1.5 hover:bg-gray-100 rounded"
// //                       >
// //                         <FiCopy size={16} className="text-gray-600" />
// //                       </button>
// //                       <button
// //                         onClick={() => handleDelete(tag.id)}
// //                         className="p-1.5 hover:bg-gray-100 rounded"
// //                       >
// //                         <FiTrash2 size={16} className="text-red-600" />
// //                       </button>
// //                     </div>
// //                   </div>

// //                   {tag.image && (
// //                     <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
// //                       <img src={tag.image} alt={tag.name} className="w-full h-full object-cover" />
// //                     </div>
// //                   )}

// //                   <div className="space-y-1">
// //                     {tag.tagsname_sor && (
// //                       <p className="text-sm"><span className="font-medium">Sorani:</span> {tag.tagsname_sor}</p>
// //                     )}
// //                     {tag.tagsname_bad && (
// //                       <p className="text-sm"><span className="font-medium">Badini:</span> {tag.tagsname_bad}</p>
// //                     )}
// //                     {tag.tagsname_ar && (
// //                       <p className="text-sm"><span className="font-medium">Arabic:</span> {tag.tagsname_ar}</p>
// //                     )}
// //                     {tag.tagsname_en && (
// //                       <p className="text-sm"><span className="font-medium">English:</span> {tag.tagsname_en}</p>
// //                     )}
// //                     {tag.name && (
// //                       <p className="text-sm text-gray-500">ID: {tag.name}</p>
// //                     )}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </main>
// //       </div>

// //       {showModal && (
// //         <div className="modal-overlay" onClick={handleCloseModal}>
// //           <div className="modal" onClick={(e) => e.stopPropagation()}>
// //             <div className="modal-header">
// //               <h2 className="text-xl font-bold">
// //                 {editingTag ? 'Edit Tag' : 'Add New Tag'}
// //               </h2>
// //               <button onClick={handleCloseModal}>
// //                 <FiX size={24} className="text-gray-600 hover:text-gray-900" />
// //               </button>
// //             </div>

// //             <form onSubmit={handleSubmit}>
// //               <div className="modal-body">
// //                 <LanguageTabs>
// //                   {(lang) => (
// //                     <div className="space-y-4">
// //                       <div>
// //                         <label className="block text-sm font-medium text-gray-700 mb-2">
// //                           Tag Name ({lang.toUpperCase()})
// //                         </label>
// //                         <input
// //                           type="text"
// //                           value={formData[`tagsname_${lang}`]}
// //                           onChange={(e) => setFormData({
// //                             ...formData,
// //                             [`tagsname_${lang}`]: e.target.value
// //                           })}
// //                           className="input"
// //                           placeholder={`Enter tag name in ${lang}`}
// //                         />
// //                       </div>
// //                     </div>
// //                   )}
// //                 </LanguageTabs>

// //                 <div className="mt-6">
// //                   <label className="block text-sm font-medium text-gray-700 mb-2">
// //                     Image URL
// //                   </label>
// //                   <input
// //                     type="url"
// //                     value={formData.image}
// //                     onChange={(e) => setFormData({ ...formData, image: e.target.value })}
// //                     className="input"
// //                     placeholder="https://example.com/image.png"
// //                   />
// //                   {formData.image && (
// //                     <div className="mt-2">
// //                       <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded" />
// //                     </div>
// //                   )}
// //                 </div>

// //                 <div className="mt-4">
// //                   <label className="block text-sm font-medium text-gray-700 mb-2">
// //                     Internal Name/ID (Optional)
// //                   </label>
// //                   <input
// //                     type="text"
// //                     value={formData.name}
// //                     onChange={(e) => setFormData({ ...formData, name: e.target.value })}
// //                     className="input"
// //                     placeholder="tag_identifier"
// //                   />
// //                 </div>
// //               </div>

// //               <div className="modal-footer">
// //                 <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
// //                   Cancel
// //                 </button>
// //                 <button type="submit" className="btn btn-primary" disabled={loading}>
// //                   {loading ? 'Saving...' : editingTag ? 'Update' : 'Create'}
// //                 </button>
// //               </div>
// //             </form>
// //           </div>
// //         </div>
// //       )}
// //     </ProtectedRoute>
// //   );
// // }




'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  duplicateTag,
  bulkDeleteTags,
} from '../../lib/firestore';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import LanguageTabs from '../../components/LanguageTabs';
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function TagsPage() {
  const { canAccess } = useAuth();
  const [tags, setTags] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });
  const [formData, setFormData] = useState({
    tagsname_sor: '',
    tagsname_bad: '',
    tagsname_ar: '',
    tagsname_en: '',
    image: '',
    name: '',
  });

  useEffect(() => {
    if (canAccess('tags_new')) {
      loadTags();
    }
  }, []);

  useEffect(() => {
    filterTags();
  }, [searchTerm, tags]);

  const loadTags = async () => {
    try {
      const data = await getAllTags();
      setTags(data);
    } catch (error) {
      console.error('Error loading tags:', error);
      toast.error('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  // Helper to safely get tag name (handles both string and object formats)
  const getTagName = (tagData, lang) => {
    if (!tagData) return '';
    
    const fieldValue = tagData[`tagsname_${lang}`];
    
    // If it's already a string, return it
    if (typeof fieldValue === 'string') return fieldValue;
    
    // If it's an object (nested structure like {"0": {"name": "...", "image": "..."}})
    if (typeof fieldValue === 'object' && fieldValue !== null) {
      // Try to get first entry
      const firstKey = Object.keys(fieldValue)[0];
      if (firstKey && fieldValue[firstKey]?.name) {
        return fieldValue[firstKey].name;
      }
    }
    
    return '';
  };

  const filterTags = () => {
    if (!searchTerm.trim()) {
      setFilteredTags(tags);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = tags.filter(tag => {
      const sorName = getTagName(tag, 'sor').toLowerCase();
      const badName = getTagName(tag, 'bad').toLowerCase();
      const arName = getTagName(tag, 'ar').toLowerCase();
      const enName = getTagName(tag, 'en').toLowerCase();
      const name = (tag.name || '').toLowerCase();
      
      return sorName.includes(term) || 
             badName.includes(term) || 
             arName.includes(term) || 
             enName.includes(term) || 
             name.includes(term);
    });
    setFilteredTags(filtered);
  };

  const handleOpenModal = (tag = null) => {
    if (tag) {
      setEditingTag(tag);
      setFormData({
        tagsname_sor: getTagName(tag, 'sor'),
        tagsname_bad: getTagName(tag, 'bad'),
        tagsname_ar: getTagName(tag, 'ar'),
        tagsname_en: getTagName(tag, 'en'),
        image: tag.image || '',
        name: tag.name || '',
      });
    } else {
      setEditingTag(null);
      setFormData({
        tagsname_sor: '',
        tagsname_bad: '',
        tagsname_ar: '',
        tagsname_en: '',
        image: '',
        name: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTag(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingTag) {
        await updateTag(editingTag.id, formData);
        toast.success('Tag updated successfully!');
      } else {
        await createTag(formData);
        toast.success('Tag created successfully!');
      }
      await loadTags();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving tag:', error);
      toast.error('Failed to save tag');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    // if (!confirm('Are you sure you want to delete this tag?')) return;

    // setLoading(true);
    // try {
    //   await deleteTag(id);
    //   toast.success('Tag deleted successfully!');
    //   await loadTags();
    // } catch (error) {
    //   console.error('Error deleting tag:', error);
    //   toast.error('Failed to delete tag');
    // } finally {
    //   setLoading(false);
    // }

    // We don't need a try/catch around the state setter itself, 
        // only inside the actual deletion logic.
        setConfirmDialog({
          isOpen: true,
          title: 'Delete Tag?',
          message: 'Are you sure you want to delete this tag? This action cannot be undone.',
          onConfirm: async () => {
            try {
              await deleteTag(id);
              toast.success('Tag deleted successfully!');
              await loadTags();
            } catch (error) {
              console.error('Error deleting tag:', error);
              toast.error('Failed to delete tag');
            } finally {
              // Close the dialog only AFTER the user confirms and the action completes
              setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
            }
          },
        });

  };

  const handleDuplicate = async (id) => {
    setLoading(true);
    try {
      await duplicateTag(id);
      toast.success('Tag duplicated successfully!');
      await loadTags();
    } catch (error) {
      console.error('Error duplicating tag:', error);
      toast.error('Failed to duplicate tag');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    // if (!confirm(`Delete ${selectedTags.length} tags?`)) return;

    // setLoading(true);
    // try {
    //   await bulkDeleteTags(selectedTags);
    //   toast.success(`${selectedTags.length} tags deleted!`);
    //   setSelectedTags([]);
    //   await loadTags();
    // } catch (error) {
    //   console.error('Error deleting tags:', error);
    //   toast.error('Failed to delete tags');
    // } finally {
    //   setLoading(false);
    // }

setConfirmDialog({
      isOpen: true,
      title: 'Delete Selected Tags?',
      message: `Are you sure you want to delete ${selectedTags.length} selected tags? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await bulkDeleteTags(selectedTags);
          toast.success(`${selectedTags.length} tags deleted successfully!`);
          setSelectedTags([]);
          await loadTags();
        } catch (error) {
          console.error('Error deleting tags:', error);
          toast.error('Failed to delete tags');
        } finally {
          // Close the dialog only AFTER the user confirms and the action completes
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });

  };

  if (!canAccess('tags_new')) {
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
              <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
              <p className="text-gray-600 mt-1">Manage all tags</p>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="btn btn-primary flex items-center gap-2"
            >
              <FiPlus size={20} />
              Add New Tag
            </button>
          </div>

          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10 pr-10 w-full"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    title="Clear search"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>
              {selectedTags.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="btn btn-danger flex items-center gap-2"
                >
                  <FiTrash2 />
                  Delete {selectedTags.length} selected
                </button>
              )}
            </div>
          </div>

          {loading && !tags.length ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600">
                {tags.length === 0 ? 'No tags found. Create your first tag!' : 'No tags match your search.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTags.map((tag) => {
                const sorName = getTagName(tag, 'sor');
                const badName = getTagName(tag, 'bad');
                const arName = getTagName(tag, 'ar');
                const enName = getTagName(tag, 'en');
                
                return (
                  <div key={tag.id} className="card hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <input
                        type="checkbox"
                        title="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTags([...selectedTags, tag.id]);
                          } else {
                            setSelectedTags(selectedTags.filter(id => id !== tag.id));
                          }
                        }}
                        className="w-4 h-4 text-primary rounded"
                      />
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenModal(tag)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="Edit"
                        >
                          <FiEdit2 size={16} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(tag.id)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="Duplicate"
                        >
                          <FiCopy size={16} className="text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id)}
                          className="p-1.5 hover:bg-gray-100 rounded"
                          title="Delete"
                        >
                          <FiTrash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>

                    {tag.image && (
                      <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        <img src={tag.image} alt={tag.name || 'Tag'} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="space-y-1">
                      {sorName && (
                        <p className="text-sm"><span className="font-medium">Sorani:</span> {sorName}</p>
                      )}
                      {badName && (
                        <p className="text-sm"><span className="font-medium">Badini:</span> {badName}</p>
                      )}
                      {arName && (
                        <p className="text-sm"><span className="font-medium">Arabic:</span> {arName}</p>
                      )}
                      {enName && (
                        <p className="text-sm"><span className="font-medium">English:</span> {enName}</p>
                      )}
                      {tag.name && (
                        <p className="text-sm text-gray-500">ID: {tag.name}</p>
                      )}
                      {!sorName && !badName && !arName && !enName && (
                        <p className="text-sm text-gray-400 italic">No name set</p>
                      )}
                    </div>
                  </div>
                );
              })}
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
              <h2 className="text-xl font-bold">
                {editingTag ? 'Edit Tag' : 'Add New Tag'}
              </h2>
              <button onClick={handleCloseModal}>
                <FiX size={24} className="text-gray-600 hover:text-gray-900" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <LanguageTabs>
                  {(lang) => (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tag Name ({lang.toUpperCase()})
                        </label>
                        <input
                          type="text"
                          value={formData[`tagsname_${lang}`]}
                          onChange={(e) => setFormData({
                            ...formData,
                            [`tagsname_${lang}`]: e.target.value
                          })}
                          className="input"
                          placeholder={`Enter tag name in ${lang}`}
                        />
                      </div>
                    </div>
                  )}
                </LanguageTabs>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="input"
                    placeholder="https://example.com/image.png"
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded" />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Internal Name/ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                    placeholder="tag_identifier"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingTag ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}







// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import {
//   getAllTags,
//   createTag,
//   updateTag,
//   deleteTag,
//   duplicateTag,
//   bulkDeleteTags,
// } from '../../lib/firestore';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// export default function TagsPage() {
//   const { canAccess } = useAuth();
//   const [tags, setTags] = useState([]);
//   const [filteredTags, setFilteredTags] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [editingTag, setEditingTag] = useState(null);
//   const [selectedTags, setSelectedTags] = useState([]);

//   const [formData, setFormData] = useState({
//     tagsname_sor: '',
//     tagsname_bad: '',
//     tagsname_ar: '',
//     tagsname_en: '',
//     image: '',
//     name: '',
//   });

//   // --- HYBRID HELPER: Prevents React Crashes by extracting string from any format ---
//   const getTagName = (tagData, lang) => {
//     if (!tagData) return '';
//     const fieldKey = `tagsname_${lang}`;
//     const fieldValue = tagData[fieldKey];
    
//     if (!fieldValue) return '';

//     // 1. Handle New Format (Simple String) - return as is
//     if (typeof fieldValue === 'string') return fieldValue;

//     // 2. Handle Old Format (Array): [ { name: "...", image: "..." } ]
//     if (Array.isArray(fieldValue) && fieldValue.length > 0) {
//       return fieldValue[0]?.name || '';
//     }

//     // 3. Handle Old Format (Map/Object): { "0": { name: "...", image: "..." } }
//     if (typeof fieldValue === 'object' && fieldValue !== null) {
//       const keys = Object.keys(fieldValue);
//       return fieldValue[keys[0]]?.name || '';
//     }

//     return '';
//   };

//   useEffect(() => {
//     if (canAccess('tags_new')) {
//       loadTags();
//     }
//   }, [canAccess]);

//   useEffect(() => {
//     filterTags();
//   }, [searchTerm, tags]);

//   const loadTags = async () => {
//     try {
//       const data = await getAllTags();
//       setTags(data);
//     } catch (error) {
//       console.error('Error loading tags:', error);
//       toast.error('Failed to load tags');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterTags = () => {
//     if (!searchTerm.trim()) {
//       setFilteredTags(tags);
//       return;
//     }
//     const term = searchTerm.toLowerCase();
//     const filtered = tags.filter(tag => {
//       const sor = getTagName(tag, 'sor').toLowerCase();
//       const bad = getTagName(tag, 'bad').toLowerCase();
//       const ar = getTagName(tag, 'ar').toLowerCase();
//       const en = getTagName(tag, 'en').toLowerCase();
//       const main = (tag.name || '').toLowerCase();
//       return sor.includes(term) || bad.includes(term) || ar.includes(term) || en.includes(term) || main.includes(term);
//     });
//     setFilteredTags(filtered);
//   };

//   const handleOpenModal = (tag = null) => {
//     if (tag) {
//       setEditingTag(tag);
//       setFormData({
//         tagsname_sor: getTagName(tag, 'sor'),
//         tagsname_bad: getTagName(tag, 'bad'),
//         tagsname_ar: getTagName(tag, 'ar'),
//         tagsname_en: getTagName(tag, 'en'),
//         image: tag.image || '',
//         name: tag.name || '',
//       });
//     } else {
//       setEditingTag(null);
//       setFormData({ tagsname_sor: '', tagsname_bad: '', tagsname_ar: '', tagsname_en: '', image: '', name: '' });
//     }
//     setShowModal(true);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     // --- ENFORCER: Wraps simple form strings back into the OLD ARRAY FORMAT for Firestore ---
//     const dataToSave = {
//       tagsname_sor: [{ name: formData.tagsname_sor, image: formData.image }],
//       tagsname_bad: [{ name: formData.tagsname_bad, image: formData.image }],
//       tagsname_ar: [{ name: formData.tagsname_ar, image: formData.image }],
//       tagsname_en: [{ name: formData.tagsname_en, image: formData.image }],
//       name: formData.tagsname_en || formData.name, // Primary name for search
//       image: formData.image,
//       updatedAt: new Date(),
//     };

//     try {
//       if (editingTag) {
//         await updateTag(editingTag.id, dataToSave);
//         toast.success('Tag updated successfully (Old Format Restored)!');
//       } else {
//         await createTag(dataToSave);
//         toast.success('Tag created successfully in Old Format!');
//       }
//       await loadTags();
//       setShowModal(false);
//     } catch (error) {
//       console.error('Error saving:', error);
//       toast.error('Save failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm('Are you sure?')) return;
//     try {
//       await deleteTag(id);
//       toast.success('Deleted');
//       await loadTags();
//     } catch (e) { toast.error('Delete failed'); }
//   };

//   if (!canAccess('tags_new')) return <div className="p-20 text-center">Access Denied</div>;

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//           <div className="flex justify-between items-center mb-8">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
//               <p className="text-gray-500">Manage category tags and translations</p>
//             </div>
//             <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
//               <FiPlus /> Add Tag
//             </button>
//           </div>

//           {/* Search Bar */}
//           <div className="bg-white p-4 rounded-xl shadow-sm mb-6 flex gap-4">
//             <div className="flex-1 relative">
//               <FiSearch className="absolute left-3 top-3 text-gray-400" />
//               <input 
//                 type="text" placeholder="Search tags..." 
//                 className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
//               />
//             </div>
//           </div>

//           {/* Tag Grid */}
//           {loading && !tags.length ? (
//             <div className="text-center py-20"><div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div></div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {filteredTags.map((tag) => (
//                 <div key={tag.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
//                   <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center overflow-hidden">
//                       {tag.image ? <img src={tag.image} alt="" className="w-full h-full object-contain" /> : <div className="text-gray-300 text-xs">No Icon</div>}
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <h3 className="font-bold text-gray-900 truncate">{getTagName(tag, 'en')}</h3>
//                       <p className="text-xs text-gray-400 truncate">{getTagName(tag, 'ar')}</p>
//                     </div>
//                     <div className="flex flex-col gap-1">
//                       <button onClick={() => handleOpenModal(tag)} className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"><FiEdit2 size={14} /></button>
//                       <button onClick={() => handleDelete(tag.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><FiTrash2 size={14} /></button>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Modal */}
//           {showModal && (
//             <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
//               <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
//                 <div className="flex justify-between items-center mb-6">
//                   <h2 className="text-xl font-bold">{editingTag ? 'Edit Tag' : 'Create New Tag'}</h2>
//                   <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
//                 </div>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   <div><label className="text-xs font-semibold text-gray-500 uppercase">English Name</label>
//                   <input type="text" className="w-full p-2.5 border rounded-lg mt-1" value={formData.tagsname_en} onChange={(e) => setFormData({...formData, tagsname_en: e.target.value})} required /></div>
                  
//                   <div className="grid grid-cols-1 gap-4">
//                     <div><label className="text-xs font-semibold text-gray-500 uppercase">Arabic</label>
//                     <input type="text" className="w-full p-2.5 border rounded-lg mt-1" value={formData.tagsname_ar} onChange={(e) => setFormData({...formData, tagsname_ar: e.target.value})} /></div>
                    
//                     <div><label className="text-xs font-semibold text-gray-500 uppercase">Sorani</label>
//                     <input type="text" className="w-full p-2.5 border rounded-lg mt-1" value={formData.tagsname_sor} onChange={(e) => setFormData({...formData, tagsname_sor: e.target.value})} /></div>
                    
//                     <div><label className="text-xs font-semibold text-gray-500 uppercase">Badini</label>
//                     <input type="text" className="w-full p-2.5 border rounded-lg mt-1" value={formData.tagsname_bad} onChange={(e) => setFormData({...formData, tagsname_bad: e.target.value})} /></div>
//                   </div>

//                   <div><label className="text-xs font-semibold text-gray-500 uppercase">Icon URL</label>
//                   <input type="text" className="w-full p-2.5 border rounded-lg mt-1" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} placeholder="https://..." /></div>

//                   <div className="flex gap-3 pt-4">
//                     <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
//                     <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50">
//                       {loading ? 'Processing...' : 'Save Tag'}
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           )}
//         </main>
//       </div>
//     </ProtectedRoute>
//   );
// }
