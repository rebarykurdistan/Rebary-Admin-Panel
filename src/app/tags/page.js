// // NEW 3


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
// import LanguageTabs from '../../components/LanguageTabs';
// import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX } from 'react-icons/fi';
// import toast from 'react-hot-toast';
// import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';

// export default function TagsPage() {
//   const { canAccess } = useAuth();
//   const [tags, setTags] = useState([]);
//   const [filteredTags, setFilteredTags] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [showModal, setShowModal] = useState(false);
//   const [editingTag, setEditingTag] = useState(null);
//   const [selectedTags, setSelectedTags] = useState([]);
//   const [confirmDialog, setConfirmDialog] = useState({
//     isOpen: false,
//     title: '',
//     message: '',
//     onConfirm: () => {},
//   });
//   const [formData, setFormData] = useState({
//     tagsname_sor: '',
//     tagsname_bad: '',
//     tagsname_ar: '',
//     tagsname_en: '',
//     image: '',
//     name: '',
//   });

//   useEffect(() => {
//     if (canAccess('tags_new')) {
//       loadTags();
//     }
//   }, []);

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

//   const getTagName = (tagData, lang) => {
//     if (!tagData) return '';
//     const fieldValue = tagData[`tagsname_${lang}`];
//     if (typeof fieldValue === 'string') return fieldValue;
//     if (typeof fieldValue === 'object' && fieldValue !== null) {
//       const firstKey = Object.keys(fieldValue)[0];
//       if (firstKey && fieldValue[firstKey]?.name) return fieldValue[firstKey].name;
//     }
//     return '';
//   };

//   const filterTags = () => {
//     if (!searchTerm.trim()) {
//       setFilteredTags(tags);
//       return;
//     }
//     const term = searchTerm.toLowerCase();
//     const filtered = tags.filter(tag => {
//       const sorName = getTagName(tag, 'sor').toLowerCase();
//       const badName = getTagName(tag, 'bad').toLowerCase();
//       const arName  = getTagName(tag, 'ar').toLowerCase();
//       const enName  = getTagName(tag, 'en').toLowerCase();
//       const name    = (tag.name || '').toLowerCase();
//       return sorName.includes(term) || badName.includes(term) ||
//              arName.includes(term)  || enName.includes(term)  || name.includes(term);
//     });
//     setFilteredTags(filtered);
//   };

//   const handleOpenModal = (tag = null) => {
//     if (tag) {
//       setEditingTag(tag);
//       setFormData({
//         tagsname_sor: getTagName(tag, 'sor'),
//         tagsname_bad: getTagName(tag, 'bad'),
//         tagsname_ar:  getTagName(tag, 'ar'),
//         tagsname_en:  getTagName(tag, 'en'),
//         image: tag.image || '',
//         name:  tag.name  || '',
//       });
//     } else {
//       setEditingTag(null);
//       setFormData({ tagsname_sor: '', tagsname_bad: '', tagsname_ar: '', tagsname_en: '', image: '', name: '' });
//     }
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setEditingTag(null);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       if (editingTag) {
//         await updateTag(editingTag.id, formData);
//         toast.success('Tag updated successfully!');
//       } else {
//         await createTag(formData);
//         toast.success('Tag created successfully!');
//       }
//       await loadTags();
//       handleCloseModal();
//     } catch (error) {
//       console.error('Error saving tag:', error);
//       toast.error('Failed to save tag');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = (id) => {
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Tag?',
//       message: 'Are you sure you want to delete this tag?',
//       onConfirm: async () => {
//         try {
//           await deleteTag(id);
//           toast.success('Tag deleted successfully!');
//           await loadTags();
//         } catch (error) {
//           console.error('Error deleting tag:', error);
//           toast.error('Failed to delete tag');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };

//   const handleDuplicate = async (id) => {
//     setLoading(true);
//     try {
//       await duplicateTag(id);
//       toast.success('Tag duplicated successfully!');
//       await loadTags();
//     } catch (error) {
//       console.error('Error duplicating tag:', error);
//       toast.error('Failed to duplicate tag');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBulkDelete = () => {
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Selected Tags?',
//       message: `Are you sure you want to delete ${selectedTags.length} selected tags?`,
//       onConfirm: async () => {
//         try {
//           await bulkDeleteTags(selectedTags);
//           toast.success(`${selectedTags.length} tags deleted successfully!`);
//           setSelectedTags([]);
//           await loadTags();
//         } catch (error) {
//           console.error('Error deleting tags:', error);
//           toast.error('Failed to delete tags');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };

//   if (!canAccess('tags_new')) {
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
//               <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
//               <p className="text-gray-600 mt-1">Manage all tags</p>
//             </div>
//             <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
//               <FiPlus size={20} />
//               Add New Tag
//             </button>
//           </div>

//           <div className="card mb-6">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1 relative">
//                 <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search tags..."
//                   value={searchTerm}
//                   onChange={e => setSearchTerm(e.target.value)}
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
//               {selectedTags.length > 0 && (
//                 <button onClick={handleBulkDelete} className="btn btn-danger flex items-center gap-2">
//                   <FiTrash2 />
//                   Delete {selectedTags.length} selected
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* Result count + divider */}
//           {!loading && (
//             <div className="flex items-center gap-3 mb-4">
//               <p className="text-sm text-gray-500 shrink-0">
//                 {searchTerm
//                   ? `${filteredTags.length} of ${tags.length} tag${tags.length !== 1 ? 's' : ''}`
//                   : `${tags.length} tag${tags.length !== 1 ? 's' : ''}`}
//               </p>
//               <div className="flex-1 h-px bg-gray-200" />
//             </div>
//           )}

//           {loading && !tags.length ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//             </div>
//           ) : filteredTags.length === 0 ? (
//             <div className="card text-center py-12">
//               <p className="text-gray-600">
//                 {tags.length === 0 ? 'No tags found. Create your first tag!' : 'No tags match your search.'}
//               </p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {filteredTags.map(tag => {
//                 const sorName = getTagName(tag, 'sor');
//                 const badName = getTagName(tag, 'bad');
//                 const arName  = getTagName(tag, 'ar');
//                 const enName  = getTagName(tag, 'en');
//                 return (
//                   <div key={tag.id} className="card hover:shadow-lg transition-all">
//                     <div className="flex items-start justify-between mb-3">
//                       <input
//                         type="checkbox"
//                         checked={selectedTags.includes(tag.id)}
//                         onChange={e => {
//                           if (e.target.checked) setSelectedTags([...selectedTags, tag.id]);
//                           else setSelectedTags(selectedTags.filter(id => id !== tag.id));
//                         }}
//                         className="w-4 h-4 text-primary rounded"
//                       />
//                       <div className="flex gap-1">
//                         <button onClick={() => handleOpenModal(tag)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit">
//                           <FiEdit2 size={16} className="text-gray-600" />
//                         </button>
//                         <button onClick={() => handleDuplicate(tag.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate">
//                           <FiCopy size={16} className="text-gray-600" />
//                         </button>
//                         <button onClick={() => handleDelete(tag.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete">
//                           <FiTrash2 size={16} className="text-red-600" />
//                         </button>
//                       </div>
//                     </div>

//                     {tag.image && (
//                       <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
//                         <img src={tag.image} alt={tag.name || 'Tag'} className="w-full h-full object-cover" />
//                       </div>
//                     )}

//                     <div className="space-y-1">
//                       {sorName && <p className="text-sm"><span className="font-medium">Sorani:</span> {sorName}</p>}
//                       {badName && <p className="text-sm"><span className="font-medium">Badini:</span> {badName}</p>}
//                       {arName  && <p className="text-sm"><span className="font-medium">Arabic:</span> {arName}</p>}
//                       {enName  && <p className="text-sm"><span className="font-medium">English:</span> {enName}</p>}
//                       {tag.name && <p className="text-sm text-gray-500">ID: {tag.name}</p>}
//                       {!sorName && !badName && !arName && !enName && (
//                         <p className="text-sm text-gray-400 italic">No name set</p>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
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
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">{editingTag ? 'Edit Tag' : 'Add New Tag'}</h2>
//               <button onClick={handleCloseModal} title="Close">
//                 <FiX size={24} className="text-gray-600 hover:text-gray-900" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="modal-body">
//                 <LanguageTabs>
//                   {lang => (
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">
//                           Tag Name ({lang.toUpperCase()})
//                         </label>
//                         <input
//                           type="text"
//                           value={formData[`tagsname_${lang}`]}
//                           onChange={e => setFormData({ ...formData, [`tagsname_${lang}`]: e.target.value })}
//                           className="input"
//                           placeholder={`Enter tag name in ${lang}`}
//                         />
//                       </div>
//                     </div>
//                   )}
//                 </LanguageTabs>

//                 <div className="mt-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
//                   <input
//                     type="url"
//                     value={formData.image}
//                     onChange={e => setFormData({ ...formData, image: e.target.value })}
//                     className="input"
//                     placeholder="https://example.com/image.png"
//                   />
//                   {formData.image && (
//                     <div className="mt-2">
//                       <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded" />
//                     </div>
//                   )}
//                 </div>

//                 <div className="mt-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Internal Name/ID (Optional)
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.name}
//                     onChange={e => setFormData({ ...formData, name: e.target.value })}
//                     className="input"
//                     placeholder="tag_identifier"
//                   />
//                 </div>
//               </div>

//               <div className="modal-footer">
//                 <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>
//                   {loading ? 'Saving...' : editingTag ? 'Update' : 'Create'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </ProtectedRoute>
//   );
// }




// NEW 4 (old multi enteries one)



// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { getAllTags, createTag, updateTag, deleteTag, duplicateTag, bulkDeleteTags } from '../../lib/firestore';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import LanguageTabs from '../../components/LanguageTabs';
// import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX } from 'react-icons/fi';
// import toast from 'react-hot-toast';
// import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';

// // ── Constants ─────────────────────────────────────────────────────────────────
// const LANGS = ['sor', 'bad', 'ar', 'en'];
// const HOME_SEARCH_INFO_ID = 'homeSearchInfo';

// // ── Parse tagsname_* from Firestore ──────────────────────────────────────────
// // Firestore stores tagsname_* as {"0": {"name": "KRG", "image": "url"}, "1": {...}}
// // dart model: _convertToStringMap reads entire field as .toString() but actual
// // flutter app uses it as a map of {name, image} entries per index.
// // We store/read as array of {name, image} entries.
// const parseTagsName = (value) => {
//   if (!value) return [];
//   if (typeof value === 'string') return [{ name: value, image: '' }];
//   if (Array.isArray(value)) return value.map(e => ({ name: e?.name || '', image: e?.image || '' }));
//   if (typeof value === 'object') {
//     return Object.values(value).map(e => {
//       if (typeof e === 'string') return { name: e, image: '' };
//       return { name: e?.name || '', image: e?.image || '' };
//     });
//   }
//   return [];
// };

// // ── Serialise tagsname entries → Firestore map {"0": {name, image}, ...} ─────
// const serializeTagsName = (entries) => {
//   if (!entries || entries.length === 0) return null;
//   const result = {};
//   entries.forEach((e, i) => { result[String(i)] = { name: e.name || '', image: e.image || '' }; });
//   return result;
// };

// // ── Get display name from a tagsname value (for list view) ───────────────────
// const getDisplayName = (tag, lang) => {
//   const val = tag[`tagsname_${lang}`];
//   if (!val) return '';
//   if (typeof val === 'string') return val;
//   if (typeof val === 'object') {
//     const first = Object.values(val)[0];
//     if (typeof first === 'string') return first;
//     return first?.name || '';
//   }
//   return '';
// };

// // ── Empty forms ───────────────────────────────────────────────────────────────
// const makeEmptyTagForm = () => {
//   const f = { image: '', name: '' };
//   LANGS.forEach(l => { f[`tagsname_${l}`] = []; }); // array of {name, image}
//   return f;
// };

// const makeEmptyHomeSearchForm = () => ({
//   searchInfo_sor: '',
//   searchInfo_en: '',
//   searchInfo_ar: '',
// });

// // ── Parse existing tag doc → form shape ──────────────────────────────────────
// const tagToForm = (tag) => {
//   const f = { image: tag.image || '', name: tag.name || '' };
//   LANGS.forEach(l => { f[`tagsname_${l}`] = parseTagsName(tag[`tagsname_${l}`]); });
//   return f;
// };

// const homeSearchToForm = (tag) => ({
//   searchInfo_sor: tag.searchInfo_sor || '',
//   searchInfo_en:  tag.searchInfo_en  || '',
//   searchInfo_ar:  tag.searchInfo_ar  || '',
// });

// // ── Convert tag form → Firestore data ────────────────────────────────────────
// const tagFormToData = (f) => {
//   const out = {};
//   if (f.image) out.image = f.image;
//   if (f.name)  out.name  = f.name;
//   LANGS.forEach(l => {
//     const ser = serializeTagsName(f[`tagsname_${l}`]);
//     if (ser) out[`tagsname_${l}`] = ser;
//   });
//   return out;
// };

// const homeSearchFormToData = (f) => {
//   const out = {};
//   if (f.searchInfo_sor) out.searchInfo_sor = f.searchInfo_sor;
//   if (f.searchInfo_en)  out.searchInfo_en  = f.searchInfo_en;
//   if (f.searchInfo_ar)  out.searchInfo_ar  = f.searchInfo_ar;
//   return out;
// };

// export default function TagsPage() {
//   const { canAccess } = useAuth();
//   const [tags, setTags]               = useState([]);
//   const [filteredTags, setFilteredTags] = useState([]);
//   const [loading, setLoading]         = useState(true);
//   const [searchTerm, setSearchTerm]   = useState('');
//   const [showModal, setShowModal]     = useState(false);
//   const [editingTag, setEditingTag]   = useState(null);
//   const [selectedTags, setSelectedTags] = useState([]);
//   const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

//   // Two separate form states — which one is active depends on isHomeSearchInfo
//   const [tagForm, setTagForm]             = useState(makeEmptyTagForm());
//   const [homeSearchForm, setHomeSearchForm] = useState(makeEmptyHomeSearchForm());
//   const [isHomeSearchInfo, setIsHomeSearchInfo] = useState(false);

//   useEffect(() => { if (canAccess('tags_new')) loadTags(); }, []);
//   useEffect(() => { filterTags(); }, [searchTerm, tags]);

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
//     if (!searchTerm.trim()) { setFilteredTags(tags); return; }
//     const term = searchTerm.toLowerCase();
//     setFilteredTags(tags.filter(tag => {
//       if (tag.id === HOME_SEARCH_INFO_ID) {
//         return (tag.searchInfo_sor || '').toLowerCase().includes(term) ||
//                (tag.searchInfo_en  || '').toLowerCase().includes(term);
//       }
//       return LANGS.some(l => getDisplayName(tag, l).toLowerCase().includes(term)) ||
//              (tag.name || '').toLowerCase().includes(term);
//     }));
//   };

//   const handleOpenModal = (tag = null) => {
//     if (tag) {
//       setEditingTag(tag);
//       const isHSI = tag.id === HOME_SEARCH_INFO_ID;
//       setIsHomeSearchInfo(isHSI);
//       if (isHSI) {
//         setHomeSearchForm(homeSearchToForm(tag));
//       } else {
//         setTagForm(tagToForm(tag));
//       }
//     } else {
//       setEditingTag(null);
//       setIsHomeSearchInfo(false);
//       setTagForm(makeEmptyTagForm());
//       setHomeSearchForm(makeEmptyHomeSearchForm());
//     }
//     setShowModal(true);
//   };

//   const handleCloseModal = () => { setShowModal(false); setEditingTag(null); };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       if (isHomeSearchInfo) {
//         // homeSearchInfo is always an update (fixed id)
//         await updateTag(HOME_SEARCH_INFO_ID, homeSearchFormToData(homeSearchForm));
//         toast.success('Search info updated!');
//       } else {
//         const data = tagFormToData(tagForm);
//         if (editingTag) {
//           await updateTag(editingTag.id, data);
//           toast.success('Tag updated successfully!');
//         } else {
//           await createTag(data);
//           toast.success('Tag created successfully!');
//         }
//       }
//       await loadTags();
//       handleCloseModal();
//     } catch (error) {
//       console.error('Error saving tag:', error);
//       toast.error('Failed to save tag');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = (id) => {
//     if (id === HOME_SEARCH_INFO_ID) {
//       toast.error('The homeSearchInfo document cannot be deleted.');
//       return;
//     }
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Tag?',
//       message: 'Are you sure you want to delete this tag?',
//       onConfirm: async () => {
//         try {
//           await deleteTag(id);
//           toast.success('Tag deleted successfully!');
//           await loadTags();
//         } catch (error) {
//           toast.error('Failed to delete tag');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };

//   const handleDuplicate = async (id) => {
//     if (id === HOME_SEARCH_INFO_ID) { toast.error('Cannot duplicate homeSearchInfo.'); return; }
//     setLoading(true);
//     try {
//       await duplicateTag(id);
//       toast.success('Tag duplicated successfully!');
//       await loadTags();
//     } catch (error) {
//       toast.error('Failed to duplicate tag');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBulkDelete = () => {
//     const safeIds = selectedTags.filter(id => id !== HOME_SEARCH_INFO_ID);
//     if (safeIds.length === 0) { toast.error('No deletable tags selected.'); return; }
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Selected Tags?',
//       message: `Are you sure you want to delete ${safeIds.length} tag${safeIds.length !== 1 ? 's' : ''}?`,
//       onConfirm: async () => {
//         try {
//           await bulkDeleteTags(safeIds);
//           toast.success(`${safeIds.length} tags deleted successfully!`);
//           setSelectedTags([]);
//           await loadTags();
//         } catch (error) {
//           toast.error('Failed to delete tags');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };

//   // ── tagsname entry helpers ────────────────────────────────────────────────
//   const addTagsNameEntry = (lang) =>
//     setTagForm(prev => ({ ...prev, [`tagsname_${lang}`]: [...(prev[`tagsname_${lang}`] || []), { name: '', image: '' }] }));
//   const updateTagsNameEntry = (lang, idx, field, value) => {
//     const arr = [...(tagForm[`tagsname_${lang}`] || [])];
//     arr[idx] = { ...arr[idx], [field]: value };
//     setTagForm(prev => ({ ...prev, [`tagsname_${lang}`]: arr }));
//   };
//   const removeTagsNameEntry = (lang, idx) =>
//     setTagForm(prev => ({ ...prev, [`tagsname_${lang}`]: prev[`tagsname_${lang}`].filter((_, i) => i !== idx) }));

//   if (!canAccess('tags_new')) {
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
//               <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
//               <p className="text-gray-600 mt-1">Manage all tags</p>
//             </div>
//             <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
//               <FiPlus size={20} /> Add New Tag
//             </button>
//           </div>

//           <div className="card mb-6">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1 relative">
//                 <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input type="text" placeholder="Search tags..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input pl-10 pr-10 w-full" />
//                 {searchTerm && (
//                   <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Clear search"><FiX size={16} /></button>
//                 )}
//               </div>
//               {selectedTags.length > 0 && (
//                 <button onClick={handleBulkDelete} className="btn btn-danger flex items-center gap-2">
//                   <FiTrash2 /> Delete {selectedTags.length} selected
//                 </button>
//               )}
//             </div>
//           </div>

//           {!loading && (
//             <div className="flex items-center gap-3 mb-4">
//               <p className="text-sm text-gray-500 shrink-0">
//                 {searchTerm
//                   ? `${filteredTags.length} of ${tags.length} tag${tags.length !== 1 ? 's' : ''}`
//                   : `${tags.length} tag${tags.length !== 1 ? 's' : ''}`}
//               </p>
//               <div className="flex-1 h-px bg-gray-200" />
//             </div>
//           )}

//           {loading && !tags.length ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//             </div>
//           ) : filteredTags.length === 0 ? (
//             <div className="card text-center py-12">
//               <p className="text-gray-600">{tags.length === 0 ? 'No tags found. Create your first tag!' : 'No tags match your search.'}</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {filteredTags.map(tag => {
//                 const isHSI = tag.id === HOME_SEARCH_INFO_ID;
//                 return (
//                   <div key={tag.id} className={`card hover:shadow-lg transition-all ${isHSI ? 'border-2 border-primary/30 bg-primary/5' : ''}`}>
//                     <div className="flex items-start justify-between mb-3">
//                       <input
//                         type="checkbox"
//                         checked={selectedTags.includes(tag.id)}
//                         onChange={e => {
//                           if (e.target.checked) setSelectedTags([...selectedTags, tag.id]);
//                           else setSelectedTags(selectedTags.filter(id => id !== tag.id));
//                         }}
//                         className="w-4 h-4 text-primary rounded"
//                         disabled={isHSI}
//                       />
//                       <div className="flex gap-1">
//                         <button onClick={() => handleOpenModal(tag)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit"><FiEdit2 size={16} className="text-gray-600" /></button>
//                         {!isHSI && <>
//                           <button onClick={() => handleDuplicate(tag.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate"><FiCopy size={16} className="text-gray-600" /></button>
//                           <button onClick={() => handleDelete(tag.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete"><FiTrash2 size={16} className="text-red-600" /></button>
//                         </>}
//                       </div>
//                     </div>

//                     {isHSI ? (
//                       <div className="space-y-1">
//                         <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Home Search Info</p>
//                         {tag.searchInfo_sor && <p className="text-sm"><span className="font-medium">SOR:</span> {tag.searchInfo_sor}</p>}
//                         {tag.searchInfo_en  && <p className="text-sm"><span className="font-medium">EN:</span>  {tag.searchInfo_en}</p>}
//                         {tag.searchInfo_ar  && <p className="text-sm"><span className="font-medium">AR:</span>  {tag.searchInfo_ar}</p>}
//                       </div>
//                     ) : (
//                       <>
//                         {tag.image && (
//                           <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
//                             <img src={tag.image} alt={tag.name || 'Tag'} className="w-full h-full object-cover" />
//                           </div>
//                         )}
//                         <div className="space-y-1">
//                           {LANGS.map(l => { const n = getDisplayName(tag, l); return n ? <p key={l} className="text-sm"><span className="font-medium capitalize">{l}:</span> {n}</p> : null; })}
//                           {tag.name && <p className="text-xs text-gray-500 mt-1">ID: {tag.name}</p>}
//                           {LANGS.every(l => !getDisplayName(tag, l)) && <p className="text-sm text-gray-400 italic">No name set</p>}
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 );
//               })}
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
//           MODAL — Create / Edit Tag  OR  Edit homeSearchInfo
//       ════════════════════════════════════════════════════════════════════════ */}
//       {showModal && (
//         <div className="modal-overlay" onClick={handleCloseModal}>
//           <div className="modal max-w-2xl" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">
//                 {isHomeSearchInfo ? 'Edit Home Search Info' : editingTag ? 'Edit Tag' : 'Add New Tag'}
//               </h2>
//               <button onClick={handleCloseModal} title="Close"><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="modal-body">

//                 {/* ── homeSearchInfo form — only searchInfo_sor/en/ar ────── */}
//                 {isHomeSearchInfo ? (
//                   <div className="space-y-4">
//                     <p className="text-sm text-gray-500 bg-primary/5 border border-primary/20 rounded p-3">
//                       This is a special fixed document used by the mobile app for home search hints.
//                     </p>
//                     {[
//                       { key: 'searchInfo_sor', label: 'Search Info (SOR)' },
//                       { key: 'searchInfo_en',  label: 'Search Info (EN)'  },
//                       { key: 'searchInfo_ar',  label: 'Search Info (AR)'  },
//                     ].map(({ key, label }) => (
//                       <div key={key}>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//                         <input
//                           type="text"
//                           value={homeSearchForm[key]}
//                           onChange={e => setHomeSearchForm(prev => ({ ...prev, [key]: e.target.value }))}
//                           className="input"
//                           placeholder={`Enter ${label}`}
//                         />
//                       </div>
//                     ))}
//                   </div>

//                 ) : (
//                   /* ── Regular tag form ─────────────────────────────────── */
//                   <div className="space-y-6">

//                     {/* Shared: image + name */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
//                         <input type="url" value={tagForm.image} onChange={e => setTagForm(prev => ({ ...prev, image: e.target.value }))} className="input" placeholder="https://example.com/image.png" />
//                         {tagForm.image && <img src={tagForm.image} alt="Preview" className="mt-2 w-16 h-16 object-cover rounded" />}
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Internal Name / ID</label>
//                         <input type="text" value={tagForm.name} onChange={e => setTagForm(prev => ({ ...prev, name: e.target.value }))} className="input" placeholder="tag_identifier (optional)" />
//                       </div>
//                     </div>

//                     {/* Per-language tagsname entries */}
//                     <LanguageTabs>
//                       {lang => (
//                         <div className="space-y-3 pt-2">
//                           <p className="text-xs text-gray-500">
//                             Each entry is stored as <code className="bg-gray-100 px-1 rounded">{"{ name, image }"}</code> in <code className="bg-gray-100 px-1 rounded">tagsname_{lang}</code>.
//                           </p>
//                           {(tagForm[`tagsname_${lang}`] || []).map((entry, idx) => (
//                             <div key={idx} className="border rounded-lg p-3 space-y-2 bg-gray-50">
//                               <div className="flex items-center justify-between">
//                                 <span className="text-xs font-medium text-gray-500">Entry #{idx + 1}</span>
//                                 <button type="button" onClick={() => removeTagsNameEntry(lang, idx)} className="text-red-400 hover:text-red-600"><FiX size={14} /></button>
//                               </div>
//                               <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
//                                 <div>
//                                   <label className="block text-xs text-gray-500 mb-0.5">Name</label>
//                                   <input type="text" value={entry.name} onChange={e => updateTagsNameEntry(lang, idx, 'name', e.target.value)} className="input text-sm" placeholder="Tag name" />
//                                 </div>
//                                 <div>
//                                   <label className="block text-xs text-gray-500 mb-0.5">Image URL</label>
//                                   <input type="url" value={entry.image} onChange={e => updateTagsNameEntry(lang, idx, 'image', e.target.value)} className="input text-sm" placeholder="https://..." />
//                                 </div>
//                               </div>
//                               {entry.image && <img src={entry.image} alt="Preview" className="w-10 h-10 object-cover rounded" />}
//                             </div>
//                           ))}
//                           <button type="button" onClick={() => addTagsNameEntry(lang)} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1">
//                             <FiPlus size={12} /> Add {lang.toUpperCase()} Entry
//                           </button>
//                         </div>
//                       )}
//                     </LanguageTabs>
//                   </div>
//                 )}
//               </div>

//               <div className="modal-footer">
//                 <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>
//                   {loading ? 'Saving...' : isHomeSearchInfo ? 'Update' : editingTag ? 'Update' : 'Create'}
//                 </button>
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
// import { getAllTags, createTag, updateTag, deleteTag, duplicateTag, bulkDeleteTags } from '../../lib/firestore';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import LanguageTabs from '../../components/LanguageTabs';
// import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX } from 'react-icons/fi';
// import toast from 'react-hot-toast';
// import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';

// // ── Constants ─────────────────────────────────────────────────────────────────
// const LANGS = ['sor', 'bad', 'ar', 'en'];
// const HOME_SEARCH_INFO_ID = 'homeSearchInfo';

// // ── Parse tagsname_* from Firestore → plain string ───────────────────────────
// // dart model: _convertToStringMap reads tagsname_* as plain string per lang.
// // Old Firestore data may be {"0": {"name": "KRG", "image": "url"}} from old
// // codebase — we gracefully read it but always write plain string going forward.
// const parseTagsName = (value) => {
//   if (!value) return '';
//   if (typeof value === 'string') return value;
//   if (typeof value === 'object') {
//     const first = Object.values(value)[0];
//     if (typeof first === 'string') return first;
//     return first?.name || '';
//   }
//   return '';
// };

// // ── Get card image — top-level image field only (dart model) ─────────────────
// const getCardImage = (tag) => tag.image || null;

// // ── Get display name from a tagsname value (for list view) ───────────────────
// const getDisplayName = (tag, lang) => {
//   const val = tag[`tagsname_${lang}`];
//   if (!val) return '';
//   if (typeof val === 'string') return val;
//   if (typeof val === 'object') {
//     const first = Object.values(val)[0];
//     if (typeof first === 'string') return first;
//     return first?.name || '';
//   }
//   return '';
// };

// // ── Empty forms ───────────────────────────────────────────────────────────────
// const makeEmptyTagForm = () => {
//   const f = { image: '', name: '' };
//   LANGS.forEach(l => { f[`tagsname_${l}`] = ''; }); // plain string per dart model
//   return f;
// };

// const makeEmptyHomeSearchForm = () => ({
//   searchInfo_sor: '',
//   searchInfo_en: '',
//   searchInfo_ar: '',
// });

// const tagToForm = (tag) => {
//   const f = { image: tag.image || '', name: tag.name || '' };
//   LANGS.forEach(l => { f[`tagsname_${l}`] = parseTagsName(tag[`tagsname_${l}`]); });
//   return f;
// };

// const homeSearchToForm = (tag) => ({
//   searchInfo_sor: tag.searchInfo_sor || '',
//   searchInfo_en:  tag.searchInfo_en  || '',
//   searchInfo_ar:  tag.searchInfo_ar  || '',
// });

// // ── Convert tag form → Firestore data ────────────────────────────────────────
// // dart TagsNew.toMap(): image, name as plain strings; tagsname_* as plain strings
// const tagFormToData = (f) => {
//   const out = {};
//   if (f.image) out.image = f.image;
//   if (f.name)  out.name  = f.name;
//   LANGS.forEach(l => {
//     if (f[`tagsname_${l}`]) out[`tagsname_${l}`] = f[`tagsname_${l}`];
//   });
//   return out;
// };

// const homeSearchFormToData = (f) => {
//   const out = {};
//   if (f.searchInfo_sor) out.searchInfo_sor = f.searchInfo_sor;
//   if (f.searchInfo_en)  out.searchInfo_en  = f.searchInfo_en;
//   if (f.searchInfo_ar)  out.searchInfo_ar  = f.searchInfo_ar;
//   return out;
// };

// export default function TagsPage() {
//   const { canAccess } = useAuth();
//   const [tags, setTags]               = useState([]);
//   const [filteredTags, setFilteredTags] = useState([]);
//   const [loading, setLoading]         = useState(true);
//   const [searchTerm, setSearchTerm]   = useState('');
//   const [showModal, setShowModal]     = useState(false);
//   const [editingTag, setEditingTag]   = useState(null);
//   const [selectedTags, setSelectedTags] = useState([]);
//   const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

//   // Two separate form states — which one is active depends on isHomeSearchInfo
//   const [tagForm, setTagForm]             = useState(makeEmptyTagForm());
//   const [homeSearchForm, setHomeSearchForm] = useState(makeEmptyHomeSearchForm());
//   const [isHomeSearchInfo, setIsHomeSearchInfo] = useState(false);

//   useEffect(() => { if (canAccess('tags_new')) loadTags(); }, []);
//   useEffect(() => { filterTags(); }, [searchTerm, tags]);

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
//     if (!searchTerm.trim()) { setFilteredTags(tags); return; }
//     const term = searchTerm.toLowerCase();
//     setFilteredTags(tags.filter(tag => {
//       if (tag.id === HOME_SEARCH_INFO_ID) {
//         return (tag.searchInfo_sor || '').toLowerCase().includes(term) ||
//                (tag.searchInfo_en  || '').toLowerCase().includes(term);
//       }
//       return LANGS.some(l => getDisplayName(tag, l).toLowerCase().includes(term)) ||
//              (tag.name || '').toLowerCase().includes(term);
//     }));
//   };

//   const handleOpenModal = (tag = null) => {
//     if (tag) {
//       setEditingTag(tag);
//       const isHSI = tag.id === HOME_SEARCH_INFO_ID;
//       setIsHomeSearchInfo(isHSI);
//       if (isHSI) {
//         setHomeSearchForm(homeSearchToForm(tag));
//       } else {
//         setTagForm(tagToForm(tag));
//       }
//     } else {
//       setEditingTag(null);
//       setIsHomeSearchInfo(false);
//       setTagForm(makeEmptyTagForm());
//       setHomeSearchForm(makeEmptyHomeSearchForm());
//     }
//     setShowModal(true);
//   };

//   const handleCloseModal = () => { setShowModal(false); setEditingTag(null); };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       if (isHomeSearchInfo) {
//         // homeSearchInfo is always an update (fixed id)
//         await updateTag(HOME_SEARCH_INFO_ID, homeSearchFormToData(homeSearchForm));
//         toast.success('Search info updated!');
//       } else {
//         const data = tagFormToData(tagForm);
//         if (editingTag) {
//           await updateTag(editingTag.id, data);
//           toast.success('Tag updated successfully!');
//         } else {
//           await createTag(data);
//           toast.success('Tag created successfully!');
//         }
//       }
//       await loadTags();
//       handleCloseModal();
//     } catch (error) {
//       console.error('Error saving tag:', error);
//       toast.error('Failed to save tag');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = (id) => {
//     if (id === HOME_SEARCH_INFO_ID) {
//       toast.error('The homeSearchInfo document cannot be deleted.');
//       return;
//     }
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Tag?',
//       message: 'Are you sure you want to delete this tag?',
//       onConfirm: async () => {
//         try {
//           await deleteTag(id);
//           toast.success('Tag deleted successfully!');
//           await loadTags();
//         } catch (error) {
//           toast.error('Failed to delete tag');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };

//   const handleDuplicate = async (id) => {
//     if (id === HOME_SEARCH_INFO_ID) { toast.error('Cannot duplicate homeSearchInfo.'); return; }
//     setLoading(true);
//     try {
//       await duplicateTag(id);
//       toast.success('Tag duplicated successfully!');
//       await loadTags();
//     } catch (error) {
//       toast.error('Failed to duplicate tag');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBulkDelete = () => {
//     const safeIds = selectedTags.filter(id => id !== HOME_SEARCH_INFO_ID);
//     if (safeIds.length === 0) { toast.error('No deletable tags selected.'); return; }
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Selected Tags?',
//       message: `Are you sure you want to delete ${safeIds.length} tag${safeIds.length !== 1 ? 's' : ''}?`,
//       onConfirm: async () => {
//         try {
//           await bulkDeleteTags(safeIds);
//           toast.success(`${safeIds.length} tags deleted successfully!`);
//           setSelectedTags([]);
//           await loadTags();
//         } catch (error) {
//           toast.error('Failed to delete tags');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };


//   if (!canAccess('tags_new')) {
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
//               <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
//               <p className="text-gray-600 mt-1">Manage all tags</p>
//             </div>
//             <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
//               <FiPlus size={20} /> Add New Tag
//             </button>
//           </div>

//           <div className="card mb-6">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1 relative">
//                 <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input type="text" placeholder="Search tags..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input pl-10 pr-10 w-full" />
//                 {searchTerm && (
//                   <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Clear search"><FiX size={16} /></button>
//                 )}
//               </div>
//               {selectedTags.length > 0 && (
//                 <button onClick={handleBulkDelete} className="btn btn-danger flex items-center gap-2">
//                   <FiTrash2 /> Delete {selectedTags.length} selected
//                 </button>
//               )}
//             </div>
//           </div>

//           {!loading && (
//             <div className="flex items-center gap-3 mb-4">
//               <p className="text-sm text-gray-500 shrink-0">
//                 {searchTerm
//                   ? `${filteredTags.length} of ${tags.length} tag${tags.length !== 1 ? 's' : ''}`
//                   : `${tags.length} tag${tags.length !== 1 ? 's' : ''}`}
//               </p>
//               <div className="flex-1 h-px bg-gray-200" />
//             </div>
//           )}

//           {loading && !tags.length ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//             </div>
//           ) : filteredTags.length === 0 ? (
//             <div className="card text-center py-12">
//               <p className="text-gray-600">{tags.length === 0 ? 'No tags found. Create your first tag!' : 'No tags match your search.'}</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {filteredTags.map(tag => {
//                 const isHSI = tag.id === HOME_SEARCH_INFO_ID;
//                 return (
//                   <div key={tag.id} className={`card hover:shadow-lg transition-all ${isHSI ? 'border-2 border-primary/30 bg-primary/5' : ''}`}>
//                     <div className="flex items-start justify-between mb-3">
//                       <input
//                         type="checkbox"
//                         checked={selectedTags.includes(tag.id)}
//                         onChange={e => {
//                           if (e.target.checked) setSelectedTags([...selectedTags, tag.id]);
//                           else setSelectedTags(selectedTags.filter(id => id !== tag.id));
//                         }}
//                         className="w-4 h-4 text-primary rounded"
//                         disabled={isHSI}
//                       />
//                       <div className="flex gap-1">
//                         <button onClick={() => handleOpenModal(tag)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit"><FiEdit2 size={16} className="text-gray-600" /></button>
//                         {!isHSI && <>
//                           <button onClick={() => handleDuplicate(tag.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate"><FiCopy size={16} className="text-gray-600" /></button>
//                           <button onClick={() => handleDelete(tag.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete"><FiTrash2 size={16} className="text-red-600" /></button>
//                         </>}
//                       </div>
//                     </div>

//                     {isHSI ? (
//                       <div className="space-y-1">
//                         <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Home Search Info</p>
//                         {tag.searchInfo_sor && <p className="text-sm"><span className="font-medium">SOR:</span> {tag.searchInfo_sor}</p>}
//                         {tag.searchInfo_en  && <p className="text-sm"><span className="font-medium">EN:</span>  {tag.searchInfo_en}</p>}
//                         {tag.searchInfo_ar  && <p className="text-sm"><span className="font-medium">AR:</span>  {tag.searchInfo_ar}</p>}
//                       </div>
//                     ) : (
//                       <>
//                         {getCardImage(tag) && (
//                           <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
//                             <img src={getCardImage(tag)} alt={tag.name || 'Tag'} className="w-full h-full object-cover" />
//                           </div>
//                         )}
//                         <div className="space-y-1">
//                           {LANGS.map(l => { const n = getDisplayName(tag, l); return n ? <p key={l} className="text-sm"><span className="font-medium capitalize">{l}:</span> {n}</p> : null; })}
//                           {tag.name && <p className="text-xs text-gray-500 mt-1">ID: {tag.name}</p>}
//                           {LANGS.every(l => !getDisplayName(tag, l)) && <p className="text-sm text-gray-400 italic">No name set</p>}
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 );
//               })}
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
//           MODAL — Create / Edit Tag  OR  Edit homeSearchInfo
//       ════════════════════════════════════════════════════════════════════════ */}
//       {showModal && (
//         <div className="modal-overlay" onClick={handleCloseModal}>
//           <div className="modal max-w-2xl" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">
//                 {isHomeSearchInfo ? 'Edit Home Search Info' : editingTag ? 'Edit Tag' : 'Add New Tag'}
//               </h2>
//               <button onClick={handleCloseModal} title="Close"><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="modal-body">

//                 {/* ── homeSearchInfo form — only searchInfo_sor/en/ar ────── */}
//                 {isHomeSearchInfo ? (
//                   <div className="space-y-4">
//                     <p className="text-sm text-gray-500 bg-primary/5 border border-primary/20 rounded p-3">
//                       This is a special fixed document used by the mobile app for home search hints.
//                     </p>
//                     {[
//                       { key: 'searchInfo_sor', label: 'Search Info (SOR)' },
//                       { key: 'searchInfo_en',  label: 'Search Info (EN)'  },
//                       { key: 'searchInfo_ar',  label: 'Search Info (AR)'  },
//                     ].map(({ key, label }) => (
//                       <div key={key}>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//                         <input
//                           type="text"
//                           value={homeSearchForm[key]}
//                           onChange={e => setHomeSearchForm(prev => ({ ...prev, [key]: e.target.value }))}
//                           className="input"
//                           placeholder={`Enter ${label}`}
//                         />
//                       </div>
//                     ))}
//                   </div>

//                 ) : (
//                   /* ── Regular tag form ─────────────────────────────────── */
//                   <div className="space-y-6">

//                     {/* Shared: image + name */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
//                         <input type="url" value={tagForm.image} onChange={e => setTagForm(prev => ({ ...prev, image: e.target.value }))} className="input" placeholder="https://example.com/image.png" />
//                         {tagForm.image && <img src={tagForm.image} alt="Preview" className="mt-2 w-16 h-16 object-cover rounded" />}
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Internal Name / ID</label>
//                         <input type="text" value={tagForm.name} onChange={e => setTagForm(prev => ({ ...prev, name: e.target.value }))} className="input" placeholder="tag_identifier (optional)" />
//                       </div>
//                     </div>

//                     {/* Per-language tagsname — plain string per dart model */}
//                     <LanguageTabs>
//                       {lang => (
//                         <div className="space-y-3 pt-2">
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                               Tag Name ({lang.toUpperCase()})
//                             </label>
//                             <input
//                               type="text"
//                               value={tagForm[`tagsname_${lang}`]}
//                               onChange={e => setTagForm(prev => ({ ...prev, [`tagsname_${lang}`]: e.target.value }))}
//                               className="input"
//                               placeholder={`Tag name in ${lang}`}
//                             />
//                           </div>
//                         </div>
//                       )}
//                     </LanguageTabs>
//                   </div>
//                 )}
//               </div>

//               <div className="modal-footer">
//                 <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>
//                   {loading ? 'Saving...' : isHomeSearchInfo ? 'Update' : editingTag ? 'Update' : 'Create'}
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
// import { getAllTags, createTag, updateTag, deleteTag, duplicateTag, bulkDeleteTags } from '../../lib/firestore';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import LanguageTabs from '../../components/LanguageTabs';
// import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX } from 'react-icons/fi';
// import toast from 'react-hot-toast';
// import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';

// // ── Constants ─────────────────────────────────────────────────────────────────
// const LANGS = ['sor', 'bad', 'ar', 'en'];
// const HOME_SEARCH_INFO_ID = 'homeSearchInfo';

// // ── Parse tagsname_* from Firestore → plain string ───────────────────────────
// // dart model: _convertToStringMap reads tagsname_* as plain string per lang.
// // Old Firestore data may be {"0": {"name": "KRG", "image": "url"}} from old
// // codebase — we gracefully read it but always write plain string going forward.
// const parseTagsName = (value) => {
//   if (!value) return '';
//   if (typeof value === 'string') return value;
//   if (typeof value === 'object') {
//     const first = Object.values(value)[0];
//     if (typeof first === 'string') return first;
//     return first?.name || '';
//   }
//   return '';
// };

// // ── Get card image — top-level image field only (dart model) ─────────────────
// const getCardImage = (tag) => tag.image || null;

// // ── Get display name from a tagsname value (for list view) ───────────────────
// const getDisplayName = (tag, lang) => {
//   const val = tag[`tagsname_${lang}`];
//   if (!val) return '';
//   if (typeof val === 'string') return val;
//   if (typeof val === 'object') {
//     const first = Object.values(val)[0];
//     if (typeof first === 'string') return first;
//     return first?.name || '';
//   }
//   return '';
// };

// // ── Empty forms ───────────────────────────────────────────────────────────────
// const makeEmptyTagForm = () => {
//   const f = { image: '', name: '' };
//   LANGS.forEach(l => { f[`tagsname_${l}`] = ''; }); // plain string per dart model
//   return f;
// };

// const makeEmptyHomeSearchForm = () => ({
//   searchInfo_sor: '',
//   searchInfo_en: '',
//   searchInfo_ar: '',
// });

// const tagToForm = (tag) => {
//   const f = { image: tag.image || '', name: tag.name || '' };
//   LANGS.forEach(l => { f[`tagsname_${l}`] = parseTagsName(tag[`tagsname_${l}`]); });
//   return f;
// };

// const homeSearchToForm = (tag) => ({
//   searchInfo_sor: tag.searchInfo_sor || '',
//   searchInfo_en:  tag.searchInfo_en  || '',
//   searchInfo_ar:  tag.searchInfo_ar  || '',
// });

// // ── Convert tag form → Firestore data ────────────────────────────────────────
// // dart TagsNew.toMap(): image, name as plain strings; tagsname_* as plain strings
// const tagFormToData = (f) => {
//   const out = {};
//   if (f.image) out.image = f.image;
//   if (f.name)  out.name  = f.name;
//   LANGS.forEach(l => {
//     if (f[`tagsname_${l}`]) out[`tagsname_${l}`] = f[`tagsname_${l}`];
//   });
//   return out;
// };

// const homeSearchFormToData = (f) => {
//   const out = {};
//   if (f.searchInfo_sor) out.searchInfo_sor = f.searchInfo_sor;
//   if (f.searchInfo_en)  out.searchInfo_en  = f.searchInfo_en;
//   if (f.searchInfo_ar)  out.searchInfo_ar  = f.searchInfo_ar;
//   return out;
// };

// export default function TagsPage() {
//   const { canAccess } = useAuth();
//   const [tags, setTags]               = useState([]);
//   const [filteredTags, setFilteredTags] = useState([]);
//   const [loading, setLoading]         = useState(true);
//   const [searchTerm, setSearchTerm]   = useState('');
//   const [showModal, setShowModal]     = useState(false);
//   const [editingTag, setEditingTag]   = useState(null);
//   const [selectedTags, setSelectedTags] = useState([]);
//   const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

//   // Two separate form states — which one is active depends on isHomeSearchInfo
//   const [tagForm, setTagForm]             = useState(makeEmptyTagForm());
//   const [homeSearchForm, setHomeSearchForm] = useState(makeEmptyHomeSearchForm());
//   const [isHomeSearchInfo, setIsHomeSearchInfo] = useState(false);

//   useEffect(() => { if (canAccess('tags_new')) loadTags(); }, []);
//   useEffect(() => { filterTags(); }, [searchTerm, tags]);

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
//     if (!searchTerm.trim()) { setFilteredTags(tags); return; }
//     const term = searchTerm.toLowerCase();
//     setFilteredTags(tags.filter(tag => {
//       if (tag.id === HOME_SEARCH_INFO_ID) {
//         return (tag.searchInfo_sor || '').toLowerCase().includes(term) ||
//                (tag.searchInfo_en  || '').toLowerCase().includes(term);
//       }
//       return LANGS.some(l => getDisplayName(tag, l).toLowerCase().includes(term)) ||
//              (tag.name || '').toLowerCase().includes(term);
//     }));
//   };

//   const handleOpenModal = (tag = null) => {
//     if (tag) {
//       setEditingTag(tag);
//       const isHSI = tag.id === HOME_SEARCH_INFO_ID;
//       setIsHomeSearchInfo(isHSI);
//       if (isHSI) {
//         setHomeSearchForm(homeSearchToForm(tag));
//       } else {
//         setTagForm(tagToForm(tag));
//       }
//     } else {
//       setEditingTag(null);
//       setIsHomeSearchInfo(false);
//       setTagForm(makeEmptyTagForm());
//       setHomeSearchForm(makeEmptyHomeSearchForm());
//     }
//     setShowModal(true);
//   };

//   const handleCloseModal = () => { setShowModal(false); setEditingTag(null); };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       if (isHomeSearchInfo) {
//         // homeSearchInfo is always an update (fixed id)
//         await updateTag(HOME_SEARCH_INFO_ID, homeSearchFormToData(homeSearchForm));
//         toast.success('Search info updated!');
//       } else {
//         const data = tagFormToData(tagForm);
//         if (editingTag) {
//           await updateTag(editingTag.id, data);
//           toast.success('Tag updated successfully!');
//         } else {
//           await createTag(data);
//           toast.success('Tag created successfully!');
//         }
//       }
//       await loadTags();
//       handleCloseModal();
//     } catch (error) {
//       console.error('Error saving tag:', error);
//       toast.error('Failed to save tag');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = (id) => {
//     if (id === HOME_SEARCH_INFO_ID) {
//       toast.error('The homeSearchInfo document cannot be deleted.');
//       return;
//     }
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Tag?',
//       message: 'Are you sure you want to delete this tag?',
//       onConfirm: async () => {
//         try {
//           await deleteTag(id);
//           toast.success('Tag deleted successfully!');
//           await loadTags();
//         } catch (error) {
//           toast.error('Failed to delete tag');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };

//   const handleDuplicate = async (id) => {
//     if (id === HOME_SEARCH_INFO_ID) { toast.error('Cannot duplicate homeSearchInfo.'); return; }
//     setLoading(true);
//     try {
//       await duplicateTag(id);
//       toast.success('Tag duplicated successfully!');
//       await loadTags();
//     } catch (error) {
//       toast.error('Failed to duplicate tag');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBulkDelete = () => {
//     const safeIds = selectedTags.filter(id => id !== HOME_SEARCH_INFO_ID);
//     if (safeIds.length === 0) { toast.error('No deletable tags selected.'); return; }
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Selected Tags?',
//       message: `Are you sure you want to delete ${safeIds.length} tag${safeIds.length !== 1 ? 's' : ''}?`,
//       onConfirm: async () => {
//         try {
//           await bulkDeleteTags(safeIds);
//           toast.success(`${safeIds.length} tags deleted successfully!`);
//           setSelectedTags([]);
//           await loadTags();
//         } catch (error) {
//           toast.error('Failed to delete tags');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };


//   if (!canAccess('tags_new')) {
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
//               <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
//               <p className="text-gray-600 mt-1">Manage all tags</p>
//             </div>
//             <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
//               <FiPlus size={20} /> Add New Tag
//             </button>
//           </div>

//           <div className="card mb-6">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1 relative">
//                 <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input type="text" placeholder="Search tags..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input pl-10 pr-10 w-full" />
//                 {searchTerm && (
//                   <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Clear search"><FiX size={16} /></button>
//                 )}
//               </div>
//               {selectedTags.length > 0 && (
//                 <button onClick={handleBulkDelete} className="btn btn-danger flex items-center gap-2">
//                   <FiTrash2 /> Delete {selectedTags.length} selected
//                 </button>
//               )}
//             </div>
//           </div>

//           {!loading && (
//             <div className="flex items-center gap-3 mb-4">
//               <p className="text-sm text-gray-500 shrink-0">
//                 {searchTerm
//                   ? `${filteredTags.length} of ${tags.length} tag${tags.length !== 1 ? 's' : ''}`
//                   : `${tags.length} tag${tags.length !== 1 ? 's' : ''}`}
//               </p>
//               <div className="flex-1 h-px bg-gray-200" />
//             </div>
//           )}

//           {loading && !tags.length ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//             </div>
//           ) : filteredTags.length === 0 ? (
//             <div className="card text-center py-12">
//               <p className="text-gray-600">{tags.length === 0 ? 'No tags found. Create your first tag!' : 'No tags match your search.'}</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {filteredTags.map(tag => {
//                 const isHSI = tag.id === HOME_SEARCH_INFO_ID;
//                 return (
//                   <div key={tag.id} className={`card hover:shadow-lg transition-all ${isHSI ? 'border-2 border-primary/30 bg-primary/5' : ''}`}>
//                     <div className="flex items-start justify-between mb-3">
//                       <input
//                         type="checkbox"
//                         checked={selectedTags.includes(tag.id)}
//                         onChange={e => {
//                           if (e.target.checked) setSelectedTags([...selectedTags, tag.id]);
//                           else setSelectedTags(selectedTags.filter(id => id !== tag.id));
//                         }}
//                         className="w-4 h-4 text-primary rounded"
//                         disabled={isHSI}
//                       />
//                       <div className="flex gap-1">
//                         <button onClick={() => handleOpenModal(tag)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit"><FiEdit2 size={16} className="text-gray-600" /></button>
//                         {!isHSI && <>
//                           <button onClick={() => handleDuplicate(tag.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate"><FiCopy size={16} className="text-gray-600" /></button>
//                           <button onClick={() => handleDelete(tag.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete"><FiTrash2 size={16} className="text-red-600" /></button>
//                         </>}
//                       </div>
//                     </div>

//                     {isHSI ? (
//                       <div className="space-y-1">
//                         <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">Home Search Info</p>
//                         {tag.searchInfo_sor && <p className="text-sm"><span className="font-medium">SOR:</span> {tag.searchInfo_sor}</p>}
//                         {tag.searchInfo_en  && <p className="text-sm"><span className="font-medium">EN:</span>  {tag.searchInfo_en}</p>}
//                         {tag.searchInfo_ar  && <p className="text-sm"><span className="font-medium">AR:</span>  {tag.searchInfo_ar}</p>}
//                       </div>
//                     ) : (
//                       <>
//                         {getCardImage(tag) && (
//                           <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
//                             <img src={getCardImage(tag)} alt={tag.name || 'Tag'} className="w-full h-full object-cover" />
//                           </div>
//                         )}
//                         <div className="space-y-1">
//                           {LANGS.map(l => { const n = getDisplayName(tag, l); return n ? <p key={l} className="text-sm"><span className="font-medium capitalize">{l}:</span> {n}</p> : null; })}
//                           {tag.name && <p className="text-xs text-gray-500 mt-1">ID: {tag.name}</p>}
//                           {LANGS.every(l => !getDisplayName(tag, l)) && <p className="text-sm text-gray-400 italic">No name set</p>}
//                         </div>
//                       </>
//                     )}
//                   </div>
//                 );
//               })}
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
//           MODAL — Create / Edit Tag  OR  Edit homeSearchInfo
//       ════════════════════════════════════════════════════════════════════════ */}
//       {showModal && (
//         <div className="modal-overlay" onClick={handleCloseModal}>
//           <div className="modal max-w-2xl" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">
//                 {isHomeSearchInfo ? 'Edit Home Search Info' : editingTag ? 'Edit Tag' : 'Add New Tag'}
//               </h2>
//               <button onClick={handleCloseModal} title="Close"><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="modal-body">

//                 {/* ── homeSearchInfo form — only searchInfo_sor/en/ar ────── */}
//                 {isHomeSearchInfo ? (
//                   <div className="space-y-4">
//                     <p className="text-sm text-gray-500 bg-primary/5 border border-primary/20 rounded p-3">
//                       This is a special fixed document used by the mobile app for home search hints.
//                     </p>
//                     {[
//                       { key: 'searchInfo_sor', label: 'Search Info (SOR)' },
//                       { key: 'searchInfo_en',  label: 'Search Info (EN)'  },
//                       { key: 'searchInfo_ar',  label: 'Search Info (AR)'  },
//                     ].map(({ key, label }) => (
//                       <div key={key}>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//                         <input
//                           type="text"
//                           value={homeSearchForm[key]}
//                           onChange={e => setHomeSearchForm(prev => ({ ...prev, [key]: e.target.value }))}
//                           className="input"
//                           placeholder={`Enter ${label}`}
//                         />
//                       </div>
//                     ))}
//                   </div>

//                 ) : (
//                   /* ── Regular tag form ─────────────────────────────────── */
//                   <div className="space-y-6">

//                     {/* Shared: image + name */}
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
//                         <input type="url" value={tagForm.image} onChange={e => setTagForm(prev => ({ ...prev, image: e.target.value }))} className="input" placeholder="https://example.com/image.png" />
//                         {tagForm.image && <img src={tagForm.image} alt="Preview" className="mt-2 w-16 h-16 object-cover rounded" />}
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Internal Name / ID</label>
//                         <input type="text" value={tagForm.name} onChange={e => setTagForm(prev => ({ ...prev, name: e.target.value }))} className="input" placeholder="tag_identifier (optional)" />
//                       </div>
//                     </div>

//                     {/* Per-language tagsname — plain string per dart model */}
//                     <LanguageTabs>
//                       {lang => (
//                         <div className="space-y-3 pt-2">
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                               Tag Name ({lang.toUpperCase()})
//                             </label>
//                             <input
//                               type="text"
//                               value={tagForm[`tagsname_${lang}`]}
//                               onChange={e => setTagForm(prev => ({ ...prev, [`tagsname_${lang}`]: e.target.value }))}
//                               className="input"
//                               placeholder={`Tag name in ${lang}`}
//                             />
//                           </div>
//                         </div>
//                       )}
//                     </LanguageTabs>
//                   </div>
//                 )}
//               </div>

//               <div className="modal-footer">
//                 <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>
//                   {loading ? 'Saving...' : isHomeSearchInfo ? 'Update' : editingTag ? 'Update' : 'Create'}
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



// COMPLETE REBUILD — correct tagsname map-of-objects structure

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAllTags, createTag, updateTag, deleteTag, duplicateTag, bulkDeleteTags } from '../../lib/firestore';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import LanguageTabs from '../../components/LanguageTabs';
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';

const LANGS = ['sor', 'bad', 'ar', 'en'];

// ── tagsname structure ─────────────────────────────────────────────────────────
// In Firestore, tagsname_<lang> is a MAP of objects:
//   { "0": { "name": "KRG", "image": "https://..." }, "1": { ... } }
// We edit it as a flat array of { name, image } objects in the UI.

function emptyTagsnameEntry() {
  return { name: '', image: '' };
}

function emptyForm() {
  const f = { image: '', name: '' };
  LANGS.forEach(l => { f[`tagsname_${l}`] = []; });
  return f;
}

// Parse Firestore tagsname_<lang> (map or array) into array of { name, image }
function parseTagsnameField(raw) {
  if (!raw) return [];
  const items = Array.isArray(raw) ? raw : Object.values(raw);
  return items.map(item => {
    if (typeof item === 'string') return { name: item, image: '' };
    return { name: item?.name || '', image: item?.image || '' };
  }).filter(item => item.name || item.image);
}

// Convert array of { name, image } back to Firestore map format
function encodeTagsnameField(arr) {
  if (!arr || arr.length === 0) return {};
  const result = {};
  arr.forEach((item, i) => {
    result[String(i)] = { name: item.name || '', image: item.image || '' };
  });
  return result;
}

// Parse existing tag Firestore doc into form state
function tagToForm(tag) {
  const f = emptyForm();
  f.image = tag.image || '';
  f.name  = tag.name  || '';
  LANGS.forEach(l => {
    f[`tagsname_${l}`] = parseTagsnameField(tag[`tagsname_${l}`]);
  });
  return f;
}

// Build Firestore data from form state
function formToTagData(f) {
  const data = {};
  if (f.image) data.image = f.image;
  if (f.name)  data.name  = f.name;
  LANGS.forEach(l => {
    data[`tagsname_${l}`] = encodeTagsnameField(f[`tagsname_${l}`]);
  });
  return data;
}

// Get display name for a tag (first non-empty name across languages)
function getDisplayName(tag) {
  for (const l of LANGS) {
    const raw = tag[`tagsname_${l}`];
    if (!raw) continue;
    const items = Array.isArray(raw) ? raw : Object.values(raw);
    const first = items[0];
    if (!first) continue;
    const name = typeof first === 'string' ? first : first?.name;
    if (name) return name;
  }
  return tag.name || '';
}

// Get display image for a tag
function getDisplayImage(tag) {
  if (tag.image) return tag.image;
  for (const l of LANGS) {
    const raw = tag[`tagsname_${l}`];
    if (!raw) continue;
    const items = Array.isArray(raw) ? raw : Object.values(raw);
    const first = items[0];
    if (first?.image) return first.image;
  }
  return '';
}

// ── Tag Name Entry Editor ──────────────────────────────────────────────────────
function TagsnameEntryEditor({ lang, entries, onChange }) {
  const add = () => onChange([...entries, emptyTagsnameEntry()]);
  const remove = (i) => onChange(entries.filter((_, idx) => idx !== i));
  const update = (i, field, value) => onChange(entries.map((e, idx) => idx === i ? { ...e, [field]: value } : e));

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => (
        <div key={i} className="flex gap-2 items-start p-2 border border-gray-100 rounded-lg bg-gray-50">
          <div className="flex-1 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Tag Name</label>
                <input type="text" value={entry.name} onChange={e => update(i, 'name', e.target.value)} className="input text-sm py-1" placeholder="e.g. KRG" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Image URL</label>
                <input type="url" value={entry.image} onChange={e => update(i, 'image', e.target.value)} className="input text-sm py-1" placeholder="https://..." />
              </div>
            </div>
            {entry.image && <img src={entry.image} alt="Preview" className="w-12 h-12 object-cover rounded" />}
          </div>
          <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600 text-xs mt-1 shrink-0">✕</button>
        </div>
      ))}
      <button type="button" onClick={add} className="btn btn-secondary btn-sm w-full">
        + Add Tag Entry ({lang.toUpperCase()})
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function TagsPage() {
  const { canAccess } = useAuth();
  const [tags, setTags]               = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [searchTerm, setSearchTerm]   = useState('');
  const [showModal, setShowModal]     = useState(false);
  const [editingTag, setEditingTag]   = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [formData, setFormData]       = useState(emptyForm());

  useEffect(() => { if (canAccess('tags_new')) loadTags(); }, []);
  useEffect(() => { filterTags(); }, [searchTerm, tags]);

  const loadTags = async () => {
    try {
      const data = await getAllTags();
      setTags(data);
    } catch (error) {
      toast.error('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const filterTags = () => {
    if (!searchTerm.trim()) { setFilteredTags(tags); return; }
    const term = searchTerm.toLowerCase();
    setFilteredTags(tags.filter(tag => {
      const displayName = getDisplayName(tag).toLowerCase();
      if (displayName.includes(term)) return true;
      if ((tag.name || '').toLowerCase().includes(term)) return true;
      return false;
    }));
  };

  const handleOpenModal = (tag = null) => {
    setEditingTag(tag || null);
    setFormData(tag ? tagToForm(tag) : emptyForm());
    setShowModal(true);
  };

  const handleCloseModal = () => { setShowModal(false); setEditingTag(null); };

  const setField = (key, value) => setFormData(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const tagData = formToTagData(formData);
      if (editingTag) {
        await updateTag(editingTag.id, tagData);
        toast.success('Tag updated!');
      } else {
        await createTag(tagData);
        toast.success('Tag created!');
      }
      await loadTags();
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to save tag');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true, title: 'Delete Tag?', message: 'Are you sure you want to delete this tag?',
      onConfirm: async () => {
        try {
          await deleteTag(id);
          toast.success('Tag deleted!');
          await loadTags();
        } catch { toast.error('Failed to delete'); }
        finally { setConfirmDialog(p => ({ ...p, isOpen: false })); }
      },
    });
  };

  const handleDuplicate = async (id) => {
    setLoading(true);
    try {
      await duplicateTag(id);
      toast.success('Tag duplicated!');
      await loadTags();
    } catch { toast.error('Failed to duplicate'); }
    finally { setLoading(false); }
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      isOpen: true, title: 'Delete Selected Tags?',
      message: `Delete ${selectedTags.length} selected tags?`,
      onConfirm: async () => {
        try {
          await bulkDeleteTags(selectedTags);
          toast.success(`${selectedTags.length} tags deleted!`);
          setSelectedTags([]);
          await loadTags();
        } catch { toast.error('Failed to delete'); }
        finally { setConfirmDialog(p => ({ ...p, isOpen: false })); }
      },
    });
  };

  if (!canAccess('tags_new')) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-xl text-gray-600">You don't have access to this page.</p>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8">

          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tags</h1>
              <p className="text-gray-600 mt-1">Manage all tags</p>
            </div>
            <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
              <FiPlus size={20} /> Add New Tag
            </button>
          </div>

          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search tags..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input pl-10 pr-10 w-full" />
                {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><FiX size={16} /></button>}
              </div>
              {selectedTags.length > 0 && (
                <button onClick={handleBulkDelete} className="btn btn-danger flex items-center gap-2">
                  <FiTrash2 /> Delete {selectedTags.length} selected
                </button>
              )}
            </div>
          </div>

          {!loading && (
            <div className="flex items-center gap-3 mb-4">
              <p className="text-sm text-gray-500 shrink-0">
                {searchTerm
                  ? `${filteredTags.length} of ${tags.length} tag${tags.length !== 1 ? 's' : ''}`
                  : `${tags.length} tag${tags.length !== 1 ? 's' : ''}`}
              </p>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}

          {loading && !tags.length ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredTags.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-600">{tags.length === 0 ? 'No tags found. Create your first tag!' : 'No tags match your search.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTags.map(tag => {
                const displayName  = getDisplayName(tag);
                const displayImage = getDisplayImage(tag);
                return (
                  <div key={tag.id} className="card hover:shadow-lg transition-all">
                    <div className="flex items-start justify-between mb-3">
                      <input type="checkbox" checked={selectedTags.includes(tag.id)}
                        onChange={e => {
                          if (e.target.checked) setSelectedTags(p => [...p, tag.id]);
                          else setSelectedTags(p => p.filter(id => id !== tag.id));
                        }} className="w-4 h-4 text-primary rounded" />
                      <div className="flex gap-1">
                        <button onClick={() => handleOpenModal(tag)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit"><FiEdit2 size={16} className="text-gray-600" /></button>
                        <button onClick={() => handleDuplicate(tag.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate"><FiCopy size={16} className="text-gray-600" /></button>
                        <button onClick={() => handleDelete(tag.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete"><FiTrash2 size={16} className="text-red-600" /></button>
                      </div>
                    </div>
                    {displayImage && (
                      <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                        <img src={displayImage} alt={displayName} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="space-y-1">
                      {displayName
                        ? <p className="text-sm font-semibold">{displayName}</p>
                        : <p className="text-sm text-gray-400 italic">No name set</p>
                      }
                      {tag.name && <p className="text-xs text-gray-500">ID: {tag.name}</p>}
                      {/* Entry counts per language */}
                      <div className="flex flex-wrap gap-1 mt-1">
                        {LANGS.map(l => {
                          const raw = tag[`tagsname_${l}`];
                          const count = raw ? (Array.isArray(raw) ? raw : Object.values(raw)).length : 0;
                          return count > 0 ? (
                            <span key={l} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                              {l.toUpperCase()}: {count}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
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
          <div className="modal max-w-3xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">{editingTag ? 'Edit Tag' : 'Add New Tag'}</h2>
              <button onClick={handleCloseModal} title="Close"><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-5">

                {/* Non-localized fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Global Image URL <span className="text-gray-400 font-normal text-xs">(non-localized fallback)</span>
                    </label>
                    <input type="url" value={formData.image} onChange={e => setField('image', e.target.value)} className="input" placeholder="https://..." />
                    {formData.image && <img src={formData.image} alt="Preview" className="w-16 h-16 object-cover rounded mt-2" />}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Internal Name / ID <span className="text-gray-400 font-normal text-xs">(non-localized identifier)</span>
                    </label>
                    <input type="text" value={formData.name} onChange={e => setField('name', e.target.value)} className="input" placeholder="e.g. tag_identifier" />
                  </div>
                </div>

                {/* Localized tag name entries */}
                <div>
                  <div className="mb-3">
                    <h3 className="text-sm font-semibold text-gray-800">Tag Name Entries per Language</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Each language stores a <strong>list of tag objects</strong>, each with a name and optional image.
                      This matches the Firestore map structure used by the Flutter app.
                    </p>
                  </div>
                  <LanguageTabs>
                    {lang => (
                      <TagsnameEntryEditor
                        lang={lang}
                        entries={formData[`tagsname_${lang}`]}
                        onChange={entries => setField(`tagsname_${lang}`, entries)}
                      />
                    )}
                  </LanguageTabs>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingTag ? 'Update Tag' : 'Create Tag'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}