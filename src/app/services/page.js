// // NEW 7 


// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { getAllServices, getAllCategories } from '../../lib/firestore';
// import { app } from '../../lib/firebase';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import LanguageTabs from '../../components/LanguageTabs';
// import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
// import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);

// export default function ServicesPage() {
//   const { canAccess, canAccessService } = useAuth();
//   const [services, setServices]         = useState([]);
//   const [categories, setCategories]     = useState([]);
//   const [filteredServices, setFilteredServices] = useState([]);
//   const [loading, setLoading]           = useState(true);
//   const [searchTerm, setSearchTerm]     = useState('');
//   const [categoryFilter, setCategoryFilter] = useState('');

//   // ── Cascading dd1–dd6 filter state ──────────────────────────────────────────
//   const [ddSelections, setDdSelections] = useState({ dd1: '', dd2: '', dd3: '', dd4: '', dd5: '', dd6: '' });

//   const [showModal, setShowModal]       = useState(false);
//   const [editingService, setEditingService] = useState(null);
//   const [selectedServices, setSelectedServices] = useState([]);
//   const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

//   const emptyForm = {
//     name_sor: '', name_bad: '', name_ar: '', name_en: '',
//     job_sor: '', job_bad: '', job_ar: '', job_en: '',
//     jobtitle_sor: '', jobtitle_bad: '', jobtitle_ar: '', jobtitle_en: '',
//     image_sor: '', image_bad: '', image_ar: '', image_en: '',
//     categoryref: '',
//     visibility_sor: true, visibility_bad: true, visibility_ar: true, visibility_en: true,
//     phone: '', phoneText: '',
//     whatsapp: '', whatsappText: '',
//     email: '', emailText: '',
//     facebook: '', instagram: '', website: '',
//   };
//   const [formData, setFormData] = useState(emptyForm);

//   useEffect(() => {
//     if (canAccess('services_new')) loadData();
//   }, []);

//   useEffect(() => { filterServices(); }, [searchTerm, categoryFilter, ddSelections, services]);

//   const loadData = async () => {
//     try {
//       const [servicesData, categoriesData] = await Promise.all([
//         getAllServices(),
//         getAllCategories(),
//       ]);
//       // Filter to only services this user can access
//       const accessible = servicesData.filter(s => canAccessService(s.id, s.categoryref));
//       setServices(accessible);
//       setCategories(categoriesData);
//     } catch (error) {
//       console.error('Error loading data:', error);
//       toast.error('Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Normalize a dd field value (string, map, or null) into string[] ─────────
//   // Mirrors Flutter's _toStringList. dd values in Firestore can be:
//   //   - a plain string: "Erbil"
//   //   - a Firestore map exported as object: { "0": "Erbil", "1": "Sulaymaniyah" }
//   //   - null / undefined
//   const toStringList = (value) => {
//     if (!value) return [];
//     if (typeof value === 'string') return value.trim() ? [value.trim()] : [];
//     if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
//     if (typeof value === 'object') return Object.values(value).map(v => String(v).trim()).filter(Boolean);
//     return [String(value).trim()].filter(Boolean);
//   };

//   const filterServices = () => {
//     let filtered = services;
//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(s =>
//         s.name_sor?.toLowerCase().includes(term) ||
//         s.name_bad?.toLowerCase().includes(term) ||
//         s.name_ar?.toLowerCase().includes(term)  ||
//         s.name_en?.toLowerCase().includes(term)
//       );
//     }
//     if (categoryFilter) {
//       filtered = filtered.filter(s => {
//         const ref = s.categoryref;
//         if (!ref) return false;
//         if (typeof ref === 'object' && ref.id) return ref.id === categoryFilter;
//         if (typeof ref === 'object' && ref.path) return ref.path.split('/').pop() === categoryFilter;
//         if (typeof ref === 'string') return (ref.includes('/') ? ref.split('/').pop() : ref) === categoryFilter;
//         return false;
//       });
//     }
//     // ── Cascading dd filters (using _sor as canonical language) ──────────────
//     if (ddSelections.dd1) filtered = filtered.filter(s => toStringList(s.dd1_sor).includes(ddSelections.dd1));
//     if (ddSelections.dd2) filtered = filtered.filter(s => toStringList(s.dd2_sor).includes(ddSelections.dd2));
//     if (ddSelections.dd3) filtered = filtered.filter(s => toStringList(s.dd3_sor).includes(ddSelections.dd3));
//     if (ddSelections.dd4) filtered = filtered.filter(s => toStringList(s.dd4_sor).includes(ddSelections.dd4));
//     if (ddSelections.dd5) filtered = filtered.filter(s => toStringList(s.dd5_sor).includes(ddSelections.dd5));
//     if (ddSelections.dd6) filtered = filtered.filter(s => toStringList(s.dd6_sor).includes(ddSelections.dd6));
//     setFilteredServices(filtered);
//   };

//   // ── Compute dd options for each level from the services in scope ─────────────
//   // Each level narrows the pool by all selections above it.
//   const getDdOptions = (level) => {
//     // Pool: services matching category filter + all dd levels above `level`
//     let pool = services;
//     if (categoryFilter) {
//       pool = pool.filter(s => {
//         const ref = s.categoryref;
//         if (!ref) return false;
//         if (typeof ref === 'object' && ref.id) return ref.id === categoryFilter;
//         if (typeof ref === 'object' && ref.path) return ref.path.split('/').pop() === categoryFilter;
//         if (typeof ref === 'string') return (ref.includes('/') ? ref.split('/').pop() : ref) === categoryFilter;
//         return false;
//       });
//     }
//     if (level > 1 && ddSelections.dd1) pool = pool.filter(s => toStringList(s.dd1_sor).includes(ddSelections.dd1));
//     if (level > 2 && ddSelections.dd2) pool = pool.filter(s => toStringList(s.dd2_sor).includes(ddSelections.dd2));
//     if (level > 3 && ddSelections.dd3) pool = pool.filter(s => toStringList(s.dd3_sor).includes(ddSelections.dd3));
//     if (level > 4 && ddSelections.dd4) pool = pool.filter(s => toStringList(s.dd4_sor).includes(ddSelections.dd4));
//     if (level > 5 && ddSelections.dd5) pool = pool.filter(s => toStringList(s.dd5_sor).includes(ddSelections.dd5));

//     const key = `dd${level}_sor`;
//     const opts = [...new Set(pool.flatMap(s => toStringList(s[key])))].sort((a, b) => a.localeCompare(b));
//     return opts;
//   };

//   // ── Label for a dd level: taken from first service that has ddNtext_sor ──────
//   const getDdLabel = (level) => {
//     const key = `dd${level}text_sor`;
//     return services.find(s => s[key])?.[ key] || null;
//   };

//   // ── Select a dd value at a given level, clearing all levels below ────────────
//   const handleDdSelect = (level, value) => {
//     setDdSelections(prev => ({
//       ...prev,
//       [`dd${level}`]: value,
//       ...(level < 2 ? { dd2: '' } : {}),
//       ...(level < 3 ? { dd3: '' } : {}),
//       ...(level < 4 ? { dd4: '' } : {}),
//       ...(level < 5 ? { dd5: '' } : {}),
//       ...(level < 6 ? { dd6: '' } : {}),
//     }));
//   };

//   // ── Clear all dd filters ────────────────────────────────────────────────────
//   const clearDdFilters = () => setDdSelections({ dd1: '', dd2: '', dd3: '', dd4: '', dd5: '', dd6: '' });

//   const handleOpenModal = (service = null) => {
//     if (service) {
//       setEditingService(service);
//       const phoneEntry     = service.phonedata?.[0];
//       const whatsappEntry  = service.whatsappdata?.[0];
//       const emailEntry     = service.emaildata?.[0];
//       const facebookEntry  = service.facebookdata?.[0];
//       const instagramEntry = service.instagramdata?.[0];
//       const websiteEntry   = service.websitedata?.[0];

//       setFormData({
//         name_sor: service.name_sor || '', name_bad: service.name_bad || '',
//         name_ar:  service.name_ar  || '', name_en:  service.name_en  || '',
//         job_sor:  service.job_sor  || '', job_bad:  service.job_bad  || '',
//         job_ar:   service.job_ar   || '', job_en:   service.job_en   || '',
//         jobtitle_sor: service.jobtitle_sor || '', jobtitle_bad: service.jobtitle_bad || '',
//         jobtitle_ar:  service.jobtitle_ar  || '', jobtitle_en:  service.jobtitle_en  || '',
//         image_sor: service.image_sor || '', image_bad: service.image_bad || '',
//         image_ar:  service.image_ar  || '', image_en:  service.image_en  || '',
//         categoryref: service.categoryref || '',
//         visibility_sor: service.visibility_sor ?? true,
//         visibility_bad: service.visibility_bad ?? true,
//         visibility_ar:  service.visibility_ar  ?? true,
//         visibility_en:  service.visibility_en  ?? true,
//         phone:        phoneEntry?.phone_sor       || '',
//         phoneText:    phoneEntry?.phonetext_sor   || '',
//         whatsapp:     whatsappEntry?.whatsapp_sor || '',
//         whatsappText: whatsappEntry?.whatsapptext_sor || '',
//         email:        emailEntry?.email_sor       || '',
//         emailText:    emailEntry?.emailtext_sor   || '',
//         facebook:     facebookEntry?.facebook_sor || '',
//         instagram:    instagramEntry?.instagram_sor || '',
//         website:      websiteEntry?.website_sor   || '',
//       });
//     } else {
//       setEditingService(null);
//       setFormData(emptyForm);
//     }
//     setShowModal(true);
//   };

//   const handleCloseModal = () => { setShowModal(false); setEditingService(null); };

//   // Build the full serviceData object (same contact platform format as before)
//   const buildServiceData = (formData) => {
//     const serviceData = { ...formData };

//     if (formData.phone) {
//       serviceData.phonedata = [{ phone_sor: formData.phone, phone_bad: formData.phone, phone_ar: formData.phone, phone_en: formData.phone, phonetext_sor: formData.phoneText, phonetext_bad: formData.phoneText, phonetext_ar: formData.phoneText, phonetext_en: formData.phoneText, phoneclickcount_sor: 0, phoneclickcount_bad: 0, phoneclickcount_ar: 0, phoneclickcount_en: 0 }];
//     }
//     if (formData.whatsapp) {
//       serviceData.whatsappdata = [{ whatsapp_sor: formData.whatsapp, whatsapp_bad: formData.whatsapp, whatsapp_ar: formData.whatsapp, whatsapp_en: formData.whatsapp, whatsapptext_sor: formData.whatsappText, whatsapptext_bad: formData.whatsappText, whatsapptext_ar: formData.whatsappText, whatsapptext_en: formData.whatsappText, whatsappclickcount_sor: 0, whatsappclickcount_bad: 0, whatsappclickcount_ar: 0, whatsappclickcount_en: 0 }];
//     }
//     if (formData.email) {
//       serviceData.emaildata = [{ email_sor: formData.email, email_bad: formData.email, email_ar: formData.email, email_en: formData.email, emailtext_sor: formData.emailText, emailtext_bad: formData.emailText, emailtext_ar: formData.emailText, emailtext_en: formData.emailText, emailclickcount_sor: 0, emailclickcount_bad: 0, emailclickcount_ar: 0, emailclickcount_en: 0 }];
//     }
//     if (formData.facebook) {
//       serviceData.facebookdata = [{ facebook_sor: formData.facebook, facebook_bad: formData.facebook, facebook_ar: formData.facebook, facebook_en: formData.facebook, facebooktext_sor: '', facebooktext_bad: '', facebooktext_ar: '', facebooktext_en: '', facebookclickcount_sor: 0, facebookclickcount_bad: 0, facebookclickcount_ar: 0, facebookclickcount_en: 0 }];
//     }
//     if (formData.instagram) {
//       serviceData.instagramdata = [{ instagram_sor: formData.instagram, instagram_bad: formData.instagram, instagram_ar: formData.instagram, instagram_en: formData.instagram, instagramtext_sor: '', instagramtext_bad: '', instagramtext_ar: '', instagramtext_en: '', instagramclickcount_sor: 0, instagramclickcount_bad: 0, instagramclickcount_ar: 0, instagramclickcount_en: 0 }];
//     }
//     if (formData.website) {
//       serviceData.websitedata = [{ website_sor: formData.website, website_bad: formData.website, website_ar: formData.website, website_en: formData.website, websitetext_sor: '', websitetext_bad: '', websitetext_ar: '', websitetext_en: '', websiteclickcount_sor: 0, websiteclickcount_bad: 0, websiteclickcount_ar: 0, websiteclickcount_en: 0 }];
//     }

//     // Remove temp fields
//     ['phone','phoneText','whatsapp','whatsappText','email','emailText','facebook','instagram','website'].forEach(k => delete serviceData[k]);

//     return serviceData;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const serviceData = buildServiceData(formData);
//       const fn = httpsCallable(functions, 'createOrUpdateService');
//       const result = await fn({
//         id: editingService?.id || null,
//         serviceData,
//       });
//       toast.success(result.data.action === 'updated' ? 'Service updated!' : 'Service created!');
//       await loadData();
//       handleCloseModal();
//     } catch (error) {
//       console.error('Error saving service:', error);
//       toast.error(error.message || 'Failed to save service');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = (id) => {
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Service?',
//       message: 'Are you sure you want to delete this service?',
//       onConfirm: async () => {
//         try {
//           const fn = httpsCallable(functions, 'deleteItems');
//           await fn({ collection: 'services_new', ids: [id] });
//           toast.success('Service deleted successfully!');
//           await loadData();
//         } catch (error) {
//           toast.error(error.message || 'Failed to delete service');
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
//       await fn({ collection: 'services_new', id });
//       toast.success('Service duplicated successfully!');
//       await loadData();
//     } catch (error) {
//       toast.error(error.message || 'Failed to duplicate service');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBulkDelete = () => {
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Selected Services?',
//       message: `Are you sure you want to delete ${selectedServices.length} selected services?`,
//       onConfirm: async () => {
//         try {
//           const fn = httpsCallable(functions, 'deleteItems');
//           await fn({ collection: 'services_new', ids: selectedServices });
//           toast.success(`${selectedServices.length} services deleted successfully!`);
//           setSelectedServices([]);
//           await loadData();
//         } catch (error) {
//           toast.error(error.message || 'Failed to delete services');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };

//   if (!canAccess('services_new')) {
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
//               <h1 className="text-3xl font-bold text-gray-900">Services</h1>
//               <p className="text-gray-600 mt-1">Manage all services</p>
//             </div>
//             <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
//               <FiPlus size={20} /> Add New Service
//             </button>
//           </div>

//           <div className="card mb-6">
//             <div className="flex flex-col lg:flex-row gap-4 items-center">
//               <div className="relative w-full lg:w-72 shrink-0">
//                 <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input type="text" placeholder="Search services..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10 pr-10 w-full" />
//                 {searchTerm && (
//                   <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Clear search"><FiX size={16} /></button>
//                 )}
//               </div>
//               <div className="w-full lg:flex-1">
//                 <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); clearDdFilters(); }} className="select w-full">
//                   <option value="">All Categories</option>
//                   {categories.map(cat => (
//                     <option key={cat.id} value={cat.id}>{cat.name_sor || cat.name_en || cat.id}</option>
//                   ))}
//                 </select>
//               </div>
//               {selectedServices.length > 0 && (
//                 <div className="w-full lg:w-auto">
//                   <button onClick={handleBulkDelete} className="btn btn-danger flex items-center justify-center gap-2 w-full whitespace-nowrap px-6">
//                     <FiTrash2 /><span>Delete {selectedServices.length}</span>
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* ── Cascading dd1–dd6 filters ──────────────────────────────────── */}
//             {[1,2,3,4,5,6].map(level => {
//               const parentSelected = level === 1 ? true : !!ddSelections[`dd${level - 1}`];
//               if (!parentSelected) return null;
//               const opts = getDdOptions(level);
//               if (opts.length === 0) return null;
//               const label = getDdLabel(level);
//               const selected = ddSelections[`dd${level}`];
//               const indent = (level - 1) * 16; // 16px per level
//               return (
//                 <div key={level} className="mt-2 flex items-center gap-2" style={{ paddingLeft: `${indent}px` }}>
//                   {/* Connector arrow for levels > 1 */}
//                   {level > 1 && (
//                     <span className="text-gray-300 text-xs shrink-0 -ml-4">↳</span>
//                   )}
//                   <div className="relative flex-1">
//                     <select
//                       value={selected}
//                       onChange={(e) => handleDdSelect(level, e.target.value)}
//                       className={`select w-full ${selected ? 'pr-8' : ''} ${selected ? 'border-primary text-gray-900 font-medium' : 'text-gray-500'}`}
//                     >
//                       <option value="">{label ? `All ${label}` : `All (level ${level})`}</option>
//                       {opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
//                     </select>
//                     {selected && (
//                       <button
//                         onClick={() => handleDdSelect(level, '')}
//                         className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                         title={`Clear`}
//                       >
//                         <FiX size={14} />
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//             {/* Clear all — shown only when any dd active */}
//             {Object.values(ddSelections).some(Boolean) && (
//               <div className="mt-2 flex justify-end">
//                 <button onClick={clearDdFilters} className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1">
//                   <FiX size={12} /> Clear all filters
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Result count + divider */}
//           {!loading && (
//             <div className="flex items-center gap-3 mb-4">
//               <p className="text-sm text-gray-500 shrink-0">
//                 {searchTerm || categoryFilter || Object.values(ddSelections).some(Boolean)
//                   ? `${filteredServices.length} of ${services.length} service${services.length !== 1 ? 's' : ''}`
//                   : `${services.length} service${services.length !== 1 ? 's' : ''}`}
//               </p>
//               <div className="flex-1 h-px bg-gray-200" />
//             </div>
//           )}

//           {loading && !services.length ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//             </div>
//           ) : filteredServices.length === 0 ? (
//             <div className="card text-center py-12"><p className="text-gray-600">No services found</p></div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {filteredServices.map((service) => (
//                 <div key={service.id} className="card hover:shadow-lg transition-all">
//                   <div className="flex items-start justify-between mb-3">
//                     <input type="checkbox" title="checkbox" checked={selectedServices.includes(service.id)} onChange={(e) => { if (e.target.checked) setSelectedServices([...selectedServices, service.id]); else setSelectedServices(selectedServices.filter(id => id !== service.id)); }} className="w-4 h-4 text-primary rounded" />
//                     <div className="flex gap-1">
//                       <button onClick={() => handleOpenModal(service)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit"><FiEdit2 size={16} className="text-gray-600" /></button>
//                       <button onClick={() => handleDuplicate(service.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate"><FiCopy size={16} className="text-gray-600" /></button>
//                       <button onClick={() => handleDelete(service.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete"><FiTrash2 size={16} className="text-red-600" /></button>
//                     </div>
//                   </div>
//                   {service.image_sor && (
//                     <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 overflow-hidden">
//                       <img src={service.image_sor} alt={service.name_sor} className="w-full h-full object-cover" />
//                     </div>
//                   )}
//                   <div className="space-y-1">
//                     <h3 className="font-semibold text-gray-900">{service.name_sor || service.name_en}</h3>
//                     {service.jobtitle_sor && <p className="text-sm text-gray-600">{service.jobtitle_sor}</p>}
//                     {service.job_sor && <p className="text-xs text-gray-500 line-clamp-2">{service.job_sor}</p>}
//                     <div className="flex items-center gap-2 mt-2">
//                       {service.visibility_sor ? <FiEye className="text-green-600" size={16} /> : <FiEyeOff className="text-gray-400" size={16} />}
//                       <span className="text-xs text-gray-500">Views: {service.pageview_sor || 0}</span>
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
//           <div className="modal max-w-6xl" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
//               <button onClick={handleCloseModal} title="Close"><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div className="modal-body">
//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
//                   <select value={formData.categoryref} onChange={(e) => setFormData({ ...formData, categoryref: e.target.value })} className="select" required>
//                     <option value="">Select a category</option>
//                     {categories.map(cat => (
//                       <option key={cat.id} value={cat.id}>{cat.name_sor || cat.name_en || cat.id}</option>
//                     ))}
//                   </select>
//                 </div>

//                 <LanguageTabs>
//                   {(lang) => (
//                     <div className="space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Service Name ({lang.toUpperCase()}) *</label>
//                         <input type="text" value={formData[`name_${lang}`]} onChange={(e) => setFormData({ ...formData, [`name_${lang}`]: e.target.value })} className="input" placeholder="Service name" required />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Job Title ({lang.toUpperCase()})</label>
//                         <input type="text" value={formData[`jobtitle_${lang}`]} onChange={(e) => setFormData({ ...formData, [`jobtitle_${lang}`]: e.target.value })} className="input" placeholder="Job title" />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Description ({lang.toUpperCase()})</label>
//                         <textarea value={formData[`job_${lang}`]} onChange={(e) => setFormData({ ...formData, [`job_${lang}`]: e.target.value })} className="textarea" rows="3" placeholder="Service description" />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Image URL ({lang.toUpperCase()})</label>
//                         <input type="url" value={formData[`image_${lang}`]} onChange={(e) => setFormData({ ...formData, [`image_${lang}`]: e.target.value })} className="input" placeholder="https://example.com/image.png" />
//                         {formData[`image_${lang}`] && <div className="mt-2"><img src={formData[`image_${lang}`]} alt="Preview" className="w-32 h-32 object-cover rounded" /></div>}
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <input type="checkbox" id={`vis_${lang}`} checked={formData[`visibility_${lang}`]} onChange={(e) => setFormData({ ...formData, [`visibility_${lang}`]: e.target.checked })} className="w-4 h-4 text-primary rounded" />
//                         <label htmlFor={`vis_${lang}`} className="text-sm font-medium text-gray-700">Visible in {lang.toUpperCase()}</label>
//                       </div>
//                     </div>
//                   )}
//                 </LanguageTabs>

//                 <div className="mt-8 border-t pt-6">
//                   <h3 className="text-lg font-bold mb-4">Contact Information</h3>
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input" placeholder="07501234567" /></div>
//                     <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Label</label><input type="text" value={formData.phoneText} onChange={(e) => setFormData({ ...formData, phoneText: e.target.value })} className="input" placeholder="Main Office" /></div>
//                     <div><label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label><input type="url" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} className="input" placeholder="http://wa.me/9647501234567" /></div>
//                     <div><label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Label</label><input type="text" value={formData.whatsappText} onChange={(e) => setFormData({ ...formData, whatsappText: e.target.value })} className="input" placeholder="Customer Service" /></div>
//                     <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" placeholder="info@example.com" /></div>
//                     <div><label className="block text-sm font-medium text-gray-700 mb-2">Email Label</label><input type="text" value={formData.emailText} onChange={(e) => setFormData({ ...formData, emailText: e.target.value })} className="input" placeholder="Info" /></div>
//                     <div><label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label><input type="url" value={formData.facebook} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} className="input" placeholder="https://facebook.com/..." /></div>
//                     <div><label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label><input type="url" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} className="input" placeholder="https://instagram.com/..." /></div>
//                     <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label><input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="input" placeholder="https://example.com" /></div>
//                   </div>
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editingService ? 'Update' : 'Create'}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </ProtectedRoute>
//   );
// }


// NEW 8


// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { getAllServices, getAllCategories } from '../../lib/firestore';
// import { app } from '../../lib/firebase';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import LanguageTabs from '../../components/LanguageTabs';
// import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
// import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX, FiEye, FiEyeOff, FiChevronDown, FiChevronUp } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);

// // ── All 18 contact platforms ────────────────────────────────────────────────
// // key: Firestore field prefix (e.g. "phone" → phonedata, phone_sor, phonetext_sor, phoneclickcount_sor)
// // label: display name in form
// // inputType: url | tel | email | text
// const PLATFORMS = [
//   { key: 'phone',       label: 'Phone',        inputType: 'tel'   },
//   { key: 'whatsapp',    label: 'WhatsApp',      inputType: 'url'   },
//   { key: 'telegram',    label: 'Telegram',      inputType: 'url'   },
//   { key: 'viber',       label: 'Viber',         inputType: 'url'   },
//   { key: 'email',       label: 'Email',         inputType: 'email' },
//   { key: 'facebook',    label: 'Facebook',      inputType: 'url'   },
//   { key: 'instagram',   label: 'Instagram',     inputType: 'url'   },
//   { key: 'tiktok',      label: 'TikTok',        inputType: 'url'   },
//   { key: 'linkedin',    label: 'LinkedIn',      inputType: 'url'   },
//   { key: 'x',           label: 'X (Twitter)',   inputType: 'url'   },
//   { key: 'snapchat',    label: 'Snapchat',      inputType: 'url'   },
//   { key: 'youtube',     label: 'YouTube',       inputType: 'url'   },
//   { key: 'website',     label: 'Website',       inputType: 'url'   },
//   { key: 'applestore',  label: 'App Store',     inputType: 'url'   },
//   { key: 'googleplay',  label: 'Google Play',   inputType: 'url'   },
//   { key: 'googlemap',   label: 'Google Maps',   inputType: 'url'   },
//   { key: 'waze',        label: 'Waze',          inputType: 'url'   },
//   { key: 'mapsme',      label: 'Maps.me',       inputType: 'url'   },
// ];

// const LANGS = ['sor', 'bad', 'ar', 'en'];

// // ── Empty entry for a single platform ──────────────────────────────────────
// const emptyPlatformEntry = (key) => ({ value: '', label: '' });

// // ── Parse Firestore platform map {"0":{...},"1":{...}} into array of {value, label} ──
// const parsePlatformData = (data, key) => {
//   if (!data) return [];
//   // data can be array or map-as-object
//   const entries = Array.isArray(data) ? data : Object.values(data);
//   return entries.map(entry => ({
//     value: entry[`${key}_sor`] || '',
//     label: entry[`${key}text_sor`] || '',
//     // preserve clickcounts from existing data
//     _counts: {
//       sor: entry[`${key}clickcount_sor`] || 0,
//       bad: entry[`${key}clickcount_bad`] || 0,
//       ar:  entry[`${key}clickcount_ar`]  || 0,
//       en:  entry[`${key}clickcount_en`]  || 0,
//     },
//   })).filter(e => e.value); // skip blank entries
// };

// // ── Parse Firestore map-or-array into string[] for info/gallery/tags ────────
// const parseStringArray = (data) => {
//   if (!data) return [];
//   if (Array.isArray(data)) return data.filter(Boolean);
//   if (typeof data === 'string') return data ? [data] : [];
//   if (typeof data === 'object') return Object.values(data).map(String).filter(Boolean);
//   return [];
// };

// // ── Serialize string[] → Firestore map {"0":"v0","1":"v1"} ──────────────────
// const toFirestoreMap = (arr) => {
//   const out = {};
//   arr.filter(Boolean).forEach((v, i) => { out[String(i)] = v; });
//   return out;
// };

// // ── Serialize platform entries → Firestore map {"0":{...},"1":{...}} ────────
// const buildPlatformData = (entries, key) => {
//   const out = {};
//   entries.filter(e => e.value.trim()).forEach((e, i) => {
//     out[String(i)] = {
//       [`${key}_sor`]:            e.value,
//       [`${key}_bad`]:            e.value,
//       [`${key}_ar`]:             e.value,
//       [`${key}_en`]:             e.value,
//       [`${key}text_sor`]:        e.label,
//       [`${key}text_bad`]:        e.label,
//       [`${key}text_ar`]:         e.label,
//       [`${key}text_en`]:         e.label,
//       [`${key}clickcount_sor`]:  e._counts?.sor ?? 0,
//       [`${key}clickcount_bad`]:  e._counts?.bad ?? 0,
//       [`${key}clickcount_ar`]:   e._counts?.ar  ?? 0,
//       [`${key}clickcount_en`]:   e._counts?.en  ?? 0,
//     };
//   });
//   return Object.keys(out).length > 0 ? out : null;
// };

// // ── Build initial empty form ─────────────────────────────────────────────────
// const makeEmptyForm = () => {
//   const f = { categoryref: '' };
//   LANGS.forEach(l => {
//     f[`name_${l}`]        = '';
//     f[`jobtitle_${l}`]    = '';
//     f[`jobtitle1_${l}`]   = '';
//     f[`job_${l}`]         = '';
//     f[`image_${l}`]       = '';
//     f[`providedby_${l}`]  = '';
//     f[`search_${l}`]      = '';
//     f[`visibility_${l}`]  = true;
//     f[`sortingorder_${l}`]= '';
//     f[`latlng_${l}`]      = { lat: '', lng: '' };
//     f[`createddate_${l}`] = '';
//     f[`expiredate_${l}`]  = '';
//     f[`tags_${l}`]        = [];       // string[]
//     f[`info_${l}`]        = [];       // string[]
//     f[`gallery_${l}`]     = [];       // string[]
//     for (let n = 1; n <= 6; n++) {
//       f[`dd${n}_${l}`]     = '';
//       f[`dd${n}text_${l}`] = '';
//     }
//   });
//   // platforms: each is array of {value, label}
//   PLATFORMS.forEach(p => { f[`_platform_${p.key}`] = []; });
//   return f;
// };

// // ── Parse existing service into form shape ───────────────────────────────────
// const serviceToForm = (s) => {
//   const f = { categoryref: s.categoryref || '' };
//   LANGS.forEach(l => {
//     f[`name_${l}`]        = s[`name_${l}`]        || '';
//     f[`jobtitle_${l}`]    = s[`jobtitle_${l}`]    || '';
//     f[`jobtitle1_${l}`]   = s[`jobtitle1_${l}`]   || '';
//     f[`job_${l}`]         = s[`job_${l}`]          || '';
//     f[`image_${l}`]       = s[`image_${l}`]        || '';
//     f[`providedby_${l}`]  = s[`providedby_${l}`]  || '';
//     f[`search_${l}`]      = s[`search_${l}`]       || '';
//     f[`visibility_${l}`]  = s[`visibility_${l}`]   ?? true;
//     f[`sortingorder_${l}`]= s[`sortingorder_${l}`] != null ? String(s[`sortingorder_${l}`]) : '';
//     // latlng: stored as {lat, lng} object
//     const ll = s[`latlng_${l}`];
//     f[`latlng_${l}`] = { lat: ll?.lat != null ? String(ll.lat) : '', lng: ll?.lng != null ? String(ll.lng) : '' };
//     // dates: Firestore Timestamp {seconds,nanoseconds}, plain ms int, or null
//     const toDateStr = (v) => {
//       if (!v) return '';
//       const ms = (typeof v === 'object' && v.seconds != null) ? v.seconds * 1000 : Number(v);
//       if (isNaN(ms) || ms <= 0) return '';
//       try { return new Date(ms).toISOString().split('T')[0]; } catch (e) { return ''; }
//     };
//     f[`createddate_${l}`] = toDateStr(s[`createddate_${l}`]);
//     f[`expiredate_${l}`]  = toDateStr(s[`expiredate_${l}`]);
//     f[`tags_${l}`]    = parseStringArray(s[`tags_${l}`]);
//     f[`info_${l}`]    = parseStringArray(s[`info_${l}`]);
//     f[`gallery_${l}`] = parseStringArray(s[`gallery_${l}`]);
//     for (let n = 1; n <= 6; n++) {
//       // dd values can be string or map — store as plain string in form (admin edits as text)
//       const ddVal = s[`dd${n}_${l}`];
//       f[`dd${n}_${l}`] = ddVal != null
//         ? (typeof ddVal === 'object' ? Object.values(ddVal).join(', ') : String(ddVal))
//         : '';
//       f[`dd${n}text_${l}`] = s[`dd${n}text_${l}`] || '';
//     }
//   });
//   PLATFORMS.forEach(p => {
//     f[`_platform_${p.key}`] = parsePlatformData(s[`${p.key}data`], p.key);
//   });
//   return f;
// };

// // ── Convert form → Firestore serviceData object ──────────────────────────────
// const formToServiceData = (f) => {
//   const out = { categoryref: f.categoryref };
//   LANGS.forEach(l => {
//     out[`name_${l}`]       = f[`name_${l}`];
//     out[`jobtitle_${l}`]   = f[`jobtitle_${l}`];
//     out[`jobtitle1_${l}`]  = f[`jobtitle1_${l}`];
//     out[`job_${l}`]        = f[`job_${l}`];
//     out[`image_${l}`]      = f[`image_${l}`];
//     out[`providedby_${l}`] = f[`providedby_${l}`];
//     out[`search_${l}`]     = f[`search_${l}`];
//     out[`visibility_${l}`] = f[`visibility_${l}`];
//     const so = f[`sortingorder_${l}`];
//     out[`sortingorder_${l}`] = so !== '' && so != null ? parseInt(so, 10) : null;
//     // latlng
//     const ll = f[`latlng_${l}`];
//     const lat = parseFloat(ll.lat), lng = parseFloat(ll.lng);
//     out[`latlng_${l}`] = (!isNaN(lat) && !isNaN(lng)) ? { lat, lng } : null;
//     // dates → ms timestamp
//     out[`createddate_${l}`] = f[`createddate_${l}`] ? new Date(f[`createddate_${l}`]).getTime() : null;
//     out[`expiredate_${l}`]  = f[`expiredate_${l}`]  ? new Date(f[`expiredate_${l}`]).getTime()  : null;
//     // arrays → Firestore maps
//     out[`tags_${l}`]    = toFirestoreMap(f[`tags_${l}`]);
//     out[`info_${l}`]    = toFirestoreMap(f[`info_${l}`]);
//     out[`gallery_${l}`] = toFirestoreMap(f[`gallery_${l}`]);
//     for (let n = 1; n <= 6; n++) {
//       out[`dd${n}_${l}`]     = f[`dd${n}_${l}`]     || null;
//       out[`dd${n}text_${l}`] = f[`dd${n}text_${l}`] || null;
//     }
//   });
//   PLATFORMS.forEach(p => {
//     const entries = f[`_platform_${p.key}`] || [];
//     const built = buildPlatformData(entries, p.key);
//     if (built) out[`${p.key}data`] = built;
//   });
//   return out;
// };

// // ── Small reusable: add/remove item in a per-lang array field ────────────────
// const updateLangArray = (formData, setFormData, lang, field, idx, value) => {
//   const key = `${field}_${lang}`;
//   const arr = [...(formData[key] || [])];
//   if (value === null) arr.splice(idx, 1);
//   else arr[idx] = value;
//   setFormData(prev => ({ ...prev, [key]: arr }));
// };
// const addLangArrayItem = (formData, setFormData, lang, field) => {
//   const key = `${field}_${lang}`;
//   setFormData(prev => ({ ...prev, [key]: [...(prev[key] || []), ''] }));
// };

// export default function ServicesPage() {
//   const { canAccess, canAccessService } = useAuth();
//   const [services, setServices]         = useState([]);
//   const [categories, setCategories]     = useState([]);
//   const [filteredServices, setFilteredServices] = useState([]);
//   const [loading, setLoading]           = useState(true);
//   const [searchTerm, setSearchTerm]     = useState('');
//   const [categoryFilter, setCategoryFilter] = useState('');

//   // ── Cascading dd1–dd6 filter state ──────────────────────────────────────────
//   const [ddSelections, setDdSelections] = useState({ dd1: '', dd2: '', dd3: '', dd4: '', dd5: '', dd6: '' });

//   const [showModal, setShowModal]       = useState(false);
//   const [editingService, setEditingService] = useState(null);
//   const [selectedServices, setSelectedServices] = useState([]);
//   const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
//   const [formData, setFormData] = useState(makeEmptyForm());

//   // Which platform sections are expanded in the form
//   const [expandedPlatforms, setExpandedPlatforms] = useState({});

//   useEffect(() => {
//     if (canAccess('services_new')) loadData();
//   }, []);

//   useEffect(() => { filterServices(); }, [searchTerm, categoryFilter, ddSelections, services]);

//   const loadData = async () => {
//     try {
//       const [servicesData, categoriesData] = await Promise.all([
//         getAllServices(),
//         getAllCategories(),
//       ]);
//       const accessible = servicesData.filter(s => canAccessService(s.id, s.categoryref));
//       setServices(accessible);
//       setCategories(categoriesData);
//     } catch (error) {
//       console.error('Error loading data:', error);
//       toast.error('Failed to load data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Normalize a dd field value into string[] (for filter logic) ─────────────
//   const toStringList = (value) => {
//     if (!value) return [];
//     if (typeof value === 'string') return value.trim() ? [value.trim()] : [];
//     if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
//     if (typeof value === 'object') return Object.values(value).map(v => String(v).trim()).filter(Boolean);
//     return [String(value).trim()].filter(Boolean);
//   };

//   const filterServices = () => {
//     let filtered = services;
//     if (searchTerm.trim()) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(s =>
//         s.name_sor?.toLowerCase().includes(term) ||
//         s.name_bad?.toLowerCase().includes(term) ||
//         s.name_ar?.toLowerCase().includes(term)  ||
//         s.name_en?.toLowerCase().includes(term)
//       );
//     }
//     if (categoryFilter) {
//       filtered = filtered.filter(s => {
//         const ref = s.categoryref;
//         if (!ref) return false;
//         if (typeof ref === 'object' && ref.id) return ref.id === categoryFilter;
//         if (typeof ref === 'object' && ref.path) return ref.path.split('/').pop() === categoryFilter;
//         if (typeof ref === 'string') return (ref.includes('/') ? ref.split('/').pop() : ref) === categoryFilter;
//         return false;
//       });
//     }
//     if (ddSelections.dd1) filtered = filtered.filter(s => toStringList(s.dd1_sor).includes(ddSelections.dd1));
//     if (ddSelections.dd2) filtered = filtered.filter(s => toStringList(s.dd2_sor).includes(ddSelections.dd2));
//     if (ddSelections.dd3) filtered = filtered.filter(s => toStringList(s.dd3_sor).includes(ddSelections.dd3));
//     if (ddSelections.dd4) filtered = filtered.filter(s => toStringList(s.dd4_sor).includes(ddSelections.dd4));
//     if (ddSelections.dd5) filtered = filtered.filter(s => toStringList(s.dd5_sor).includes(ddSelections.dd5));
//     if (ddSelections.dd6) filtered = filtered.filter(s => toStringList(s.dd6_sor).includes(ddSelections.dd6));
//     setFilteredServices(filtered);
//   };

//   const getDdOptions = (level) => {
//     let pool = services;
//     if (categoryFilter) {
//       pool = pool.filter(s => {
//         const ref = s.categoryref;
//         if (!ref) return false;
//         if (typeof ref === 'object' && ref.id) return ref.id === categoryFilter;
//         if (typeof ref === 'object' && ref.path) return ref.path.split('/').pop() === categoryFilter;
//         if (typeof ref === 'string') return (ref.includes('/') ? ref.split('/').pop() : ref) === categoryFilter;
//         return false;
//       });
//     }
//     if (level > 1 && ddSelections.dd1) pool = pool.filter(s => toStringList(s.dd1_sor).includes(ddSelections.dd1));
//     if (level > 2 && ddSelections.dd2) pool = pool.filter(s => toStringList(s.dd2_sor).includes(ddSelections.dd2));
//     if (level > 3 && ddSelections.dd3) pool = pool.filter(s => toStringList(s.dd3_sor).includes(ddSelections.dd3));
//     if (level > 4 && ddSelections.dd4) pool = pool.filter(s => toStringList(s.dd4_sor).includes(ddSelections.dd4));
//     if (level > 5 && ddSelections.dd5) pool = pool.filter(s => toStringList(s.dd5_sor).includes(ddSelections.dd5));
//     const key = `dd${level}_sor`;
//     return [...new Set(pool.flatMap(s => toStringList(s[key])))].sort((a, b) => a.localeCompare(b));
//   };

//   const getDdLabel = (level) => {
//     const key = `dd${level}text_sor`;
//     return services.find(s => s[key])?.[key] || null;
//   };

//   const handleDdSelect = (level, value) => {
//     setDdSelections(prev => ({
//       ...prev,
//       [`dd${level}`]: value,
//       ...(level < 2 ? { dd2: '' } : {}),
//       ...(level < 3 ? { dd3: '' } : {}),
//       ...(level < 4 ? { dd4: '' } : {}),
//       ...(level < 5 ? { dd5: '' } : {}),
//       ...(level < 6 ? { dd6: '' } : {}),
//     }));
//   };

//   const clearDdFilters = () => setDdSelections({ dd1: '', dd2: '', dd3: '', dd4: '', dd5: '', dd6: '' });

//   // ── Modal open/close ─────────────────────────────────────────────────────────
//   const handleOpenModal = (service = null) => {
//     if (service) {
//       setEditingService(service);
//       setFormData(serviceToForm(service));
//       // Auto-expand platforms that have entries
//       const expanded = {};
//       PLATFORMS.forEach(p => {
//         const entries = parsePlatformData(service[`${p.key}data`], p.key);
//         if (entries.length > 0) expanded[p.key] = true;
//       });
//       setExpandedPlatforms(expanded);
//     } else {
//       setEditingService(null);
//       setFormData(makeEmptyForm());
//       setExpandedPlatforms({});
//     }
//     setShowModal(true);
//   };

//   const handleCloseModal = () => { setShowModal(false); setEditingService(null); };

//   // ── Form submit ──────────────────────────────────────────────────────────────
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const serviceData = formToServiceData(formData);
//       const fn = httpsCallable(functions, 'createOrUpdateService');
//       const result = await fn({ id: editingService?.id || null, serviceData });
//       toast.success(result.data.action === 'updated' ? 'Service updated!' : 'Service created!');
//       await loadData();
//       handleCloseModal();
//     } catch (error) {
//       console.error('Error saving service:', error);
//       toast.error(error.message || 'Failed to save service');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ── Platform entry helpers ───────────────────────────────────────────────────
//   const getPlatformEntries = (key) => formData[`_platform_${key}`] || [];
//   const setPlatformEntries = (key, entries) =>
//     setFormData(prev => ({ ...prev, [`_platform_${key}`]: entries }));
//   const addPlatformEntry = (key) =>
//     setPlatformEntries(key, [...getPlatformEntries(key), emptyPlatformEntry(key)]);
//   const updatePlatformEntry = (key, idx, field, value) => {
//     const entries = [...getPlatformEntries(key)];
//     entries[idx] = { ...entries[idx], [field]: value };
//     setPlatformEntries(key, entries);
//   };
//   const removePlatformEntry = (key, idx) => {
//     setPlatformEntries(key, getPlatformEntries(key).filter((_, i) => i !== idx));
//   };

//   // ── CRUD handlers (unchanged) ────────────────────────────────────────────────
//   const handleDelete = (id) => {
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Service?',
//       message: 'Are you sure you want to delete this service?',
//       onConfirm: async () => {
//         try {
//           const fn = httpsCallable(functions, 'deleteItems');
//           await fn({ collection: 'services_new', ids: [id] });
//           toast.success('Service deleted successfully!');
//           await loadData();
//         } catch (error) {
//           toast.error(error.message || 'Failed to delete service');
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
//       await fn({ collection: 'services_new', id });
//       toast.success('Service duplicated successfully!');
//       await loadData();
//     } catch (error) {
//       toast.error(error.message || 'Failed to duplicate service');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleBulkDelete = () => {
//     setConfirmDialog({
//       isOpen: true,
//       title: 'Delete Selected Services?',
//       message: `Are you sure you want to delete ${selectedServices.length} selected services?`,
//       onConfirm: async () => {
//         try {
//           const fn = httpsCallable(functions, 'deleteItems');
//           await fn({ collection: 'services_new', ids: selectedServices });
//           toast.success(`${selectedServices.length} services deleted successfully!`);
//           setSelectedServices([]);
//           await loadData();
//         } catch (error) {
//           toast.error(error.message || 'Failed to delete services');
//         } finally {
//           setConfirmDialog(prev => ({ ...prev, isOpen: false }));
//         }
//       },
//     });
//   };

//   if (!canAccess('services_new')) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <p className="text-xl text-gray-600">You don't have access to this page.</p>
//       </div>
//     );
//   }

//   // ── Form section header helper ───────────────────────────────────────────────
//   const SectionHeader = ({ title }) => (
//     <h3 className="text-base font-semibold text-gray-800 border-b pb-2 mb-4 mt-8">{title}</h3>
//   );

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8">

//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Services</h1>
//               <p className="text-gray-600 mt-1">Manage all services</p>
//             </div>
//             <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
//               <FiPlus size={20} /> Add New Service
//             </button>
//           </div>

//           <div className="card mb-6">
//             <div className="flex flex-col lg:flex-row gap-4 items-center">
//               <div className="relative w-full lg:w-72 shrink-0">
//                 <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input type="text" placeholder="Search services..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10 pr-10 w-full" />
//                 {searchTerm && (
//                   <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Clear search"><FiX size={16} /></button>
//                 )}
//               </div>
//               <div className="w-full lg:flex-1">
//                 <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); clearDdFilters(); }} className="select w-full">
//                   <option value="">All Categories</option>
//                   {categories.map(cat => (
//                     <option key={cat.id} value={cat.id}>{cat.name_sor || cat.name_en || cat.id}</option>
//                   ))}
//                 </select>
//               </div>
//               {selectedServices.length > 0 && (
//                 <div className="w-full lg:w-auto">
//                   <button onClick={handleBulkDelete} className="btn btn-danger flex items-center justify-center gap-2 w-full whitespace-nowrap px-6">
//                     <FiTrash2 /><span>Delete {selectedServices.length}</span>
//                   </button>
//                 </div>
//               )}
//             </div>

//             {/* ── Cascading dd1–dd6 filters ──────────────────────────────────── */}
//             {[1,2,3,4,5,6].map(level => {
//               const parentSelected = level === 1 ? true : !!ddSelections[`dd${level - 1}`];
//               if (!parentSelected) return null;
//               const opts = getDdOptions(level);
//               if (opts.length === 0) return null;
//               const label = getDdLabel(level);
//               const selected = ddSelections[`dd${level}`];
//               const indent = (level - 1) * 16;
//               return (
//                 <div key={level} className="mt-2 flex items-center gap-2" style={{ paddingLeft: `${indent}px` }}>
//                   {level > 1 && <span className="text-gray-300 text-xs shrink-0 -ml-4">↳</span>}
//                   <div className="relative flex-1">
//                     <select
//                       value={selected}
//                       onChange={(e) => handleDdSelect(level, e.target.value)}
//                       className={`select w-full ${selected ? 'pr-8' : ''} ${selected ? 'border-primary text-gray-900 font-medium' : 'text-gray-500'}`}
//                     >
//                       <option value="">{label ? `All ${label}` : `All (level ${level})`}</option>
//                       {opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
//                     </select>
//                     {selected && (
//                       <button onClick={() => handleDdSelect(level, '')} className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Clear">
//                         <FiX size={14} />
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//             {Object.values(ddSelections).some(Boolean) && (
//               <div className="mt-2 flex justify-end">
//                 <button onClick={clearDdFilters} className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1">
//                   <FiX size={12} /> Clear all filters
//                 </button>
//               </div>
//             )}
//           </div>

//           {/* Result count */}
//           {!loading && (
//             <div className="flex items-center gap-3 mb-4">
//               <p className="text-sm text-gray-500 shrink-0">
//                 {searchTerm || categoryFilter || Object.values(ddSelections).some(Boolean)
//                   ? `${filteredServices.length} of ${services.length} service${services.length !== 1 ? 's' : ''}`
//                   : `${services.length} service${services.length !== 1 ? 's' : ''}`}
//               </p>
//               <div className="flex-1 h-px bg-gray-200" />
//             </div>
//           )}

//           {loading && !services.length ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//             </div>
//           ) : filteredServices.length === 0 ? (
//             <div className="card text-center py-12"><p className="text-gray-600">No services found</p></div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {filteredServices.map((service) => (
//                 <div key={service.id} className="card hover:shadow-lg transition-all">
//                   <div className="flex items-start justify-between mb-3">
//                     <input type="checkbox" title="checkbox" checked={selectedServices.includes(service.id)} onChange={(e) => { if (e.target.checked) setSelectedServices([...selectedServices, service.id]); else setSelectedServices(selectedServices.filter(id => id !== service.id)); }} className="w-4 h-4 text-primary rounded" />
//                     <div className="flex gap-1">
//                       <button onClick={() => handleOpenModal(service)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit"><FiEdit2 size={16} className="text-gray-600" /></button>
//                       <button onClick={() => handleDuplicate(service.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate"><FiCopy size={16} className="text-gray-600" /></button>
//                       <button onClick={() => handleDelete(service.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete"><FiTrash2 size={16} className="text-red-600" /></button>
//                     </div>
//                   </div>
//                   {service.image_sor && (
//                     <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 overflow-hidden">
//                       <img src={service.image_sor} alt={service.name_sor} className="w-full h-full object-cover" />
//                     </div>
//                   )}
//                   <div className="space-y-1">
//                     <h3 className="font-semibold text-gray-900">{service.name_sor || service.name_en}</h3>
//                     {service.jobtitle_sor && <p className="text-sm text-gray-600">{service.jobtitle_sor}</p>}
//                     {service.job_sor && <p className="text-xs text-gray-500 line-clamp-2">{service.job_sor}</p>}
//                     <div className="flex items-center gap-2 mt-2">
//                       {service.visibility_sor ? <FiEye className="text-green-600" size={16} /> : <FiEyeOff className="text-gray-400" size={16} />}
//                       <span className="text-xs text-gray-500">Views: {service.pageview_sor || 0}</span>
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
//           MODAL — Create / Edit Service
//       ════════════════════════════════════════════════════════════════════════ */}
//       {showModal && (
//         <div className="modal-overlay" onClick={handleCloseModal}>
//           <div className="modal max-w-6xl" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
//               <button onClick={handleCloseModal} title="Close"><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="modal-body space-y-0">

//                 {/* ── Category ─────────────────────────────────────────────── */}
//                 <div className="mb-6">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
//                   <select
//                     value={formData.categoryref}
//                     onChange={(e) => setFormData(prev => ({ ...prev, categoryref: e.target.value }))}
//                     className="select" required
//                   >
//                     <option value="">Select a category</option>
//                     {categories.map(cat => (
//                       <option key={cat.id} value={cat.id}>{cat.name_sor || cat.name_en || cat.id}</option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* ── Per-language fields ───────────────────────────────────── */}
//                 <LanguageTabs>
//                   {(lang) => (
//                     <div className="space-y-4 pt-2">

//                       {/* Basic fields */}
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Name ({lang.toUpperCase()}) *</label>
//                           <input type="text" value={formData[`name_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`name_${lang}`]: e.target.value }))} className="input" placeholder="Service name" required={lang === 'sor'} />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Provided By ({lang.toUpperCase()})</label>
//                           <input type="text" value={formData[`providedby_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`providedby_${lang}`]: e.target.value }))} className="input" placeholder="Provider name" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Job Title 1 ({lang.toUpperCase()})</label>
//                           <input type="text" value={formData[`jobtitle_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`jobtitle_${lang}`]: e.target.value }))} className="input" placeholder="Primary job title" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Job Title 2 ({lang.toUpperCase()})</label>
//                           <input type="text" value={formData[`jobtitle1_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`jobtitle1_${lang}`]: e.target.value }))} className="input" placeholder="Secondary job title" />
//                         </div>
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Description ({lang.toUpperCase()})</label>
//                         <textarea value={formData[`job_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`job_${lang}`]: e.target.value }))} className="textarea" rows="3" placeholder="Service description" />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Search Text ({lang.toUpperCase()})</label>
//                         <textarea value={formData[`search_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`search_${lang}`]: e.target.value }))} className="textarea" rows="2" placeholder="Searchable keywords blob" />
//                       </div>

//                       {/* Image */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Image URL ({lang.toUpperCase()})</label>
//                         <input type="url" value={formData[`image_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`image_${lang}`]: e.target.value }))} className="input" placeholder="https://example.com/image.png" />
//                         {formData[`image_${lang}`] && <img src={formData[`image_${lang}`]} alt="Preview" className="mt-2 w-28 h-28 object-cover rounded" />}
//                       </div>

//                       {/* Visibility + Sorting */}
//                       <div className="flex flex-wrap items-center gap-6">
//                         <div className="flex items-center gap-2">
//                           <input type="checkbox" id={`vis_${lang}`} checked={formData[`visibility_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`visibility_${lang}`]: e.target.checked }))} className="w-4 h-4 text-primary rounded" />
//                           <label htmlFor={`vis_${lang}`} className="text-sm font-medium text-gray-700">Visible ({lang.toUpperCase()})</label>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <label className="text-sm font-medium text-gray-700">Sort Order</label>
//                           <input type="number" value={formData[`sortingorder_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`sortingorder_${lang}`]: e.target.value }))} className="input w-24" placeholder="0" />
//                         </div>
//                       </div>

//                       {/* Dates */}
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Created Date ({lang.toUpperCase()})</label>
//                           <input type="date" value={formData[`createddate_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`createddate_${lang}`]: e.target.value }))} className="input" />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Expire Date ({lang.toUpperCase()})</label>
//                           <input type="date" value={formData[`expiredate_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`expiredate_${lang}`]: e.target.value }))} className="input" />
//                         </div>
//                       </div>

//                       {/* Location */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Location ({lang.toUpperCase()})</label>
//                         <div className="flex gap-3">
//                           <input type="number" step="any" value={formData[`latlng_${lang}`].lat} onChange={(e) => setFormData(prev => ({ ...prev, [`latlng_${lang}`]: { ...prev[`latlng_${lang}`], lat: e.target.value } }))} className="input flex-1" placeholder="Latitude (e.g. 36.1901)" />
//                           <input type="number" step="any" value={formData[`latlng_${lang}`].lng} onChange={(e) => setFormData(prev => ({ ...prev, [`latlng_${lang}`]: { ...prev[`latlng_${lang}`], lng: e.target.value } }))} className="input flex-1" placeholder="Longitude (e.g. 44.0091)" />
//                         </div>
//                       </div>

//                       {/* DD Filters 1–6 */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Dropdown Filters ({lang.toUpperCase()})</label>
//                         <div className="space-y-2">
//                           {[1,2,3,4,5,6].map(n => (
//                             <div key={n} className="flex gap-2 items-center">
//                               <span className="text-xs text-gray-400 w-6 shrink-0">#{n}</span>
//                               <input type="text" value={formData[`dd${n}text_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`dd${n}text_${lang}`]: e.target.value }))} className="input w-32 shrink-0 text-sm" placeholder="Label" />
//                               <input type="text" value={formData[`dd${n}_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`dd${n}_${lang}`]: e.target.value }))} className="input flex-1 text-sm" placeholder="Value" />
//                             </div>
//                           ))}
//                         </div>
//                       </div>

//                       {/* Tags */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Tags ({lang.toUpperCase()})</label>
//                         <div className="space-y-2">
//                           {(formData[`tags_${lang}`] || []).map((tag, idx) => (
//                             <div key={idx} className="flex gap-2">
//                               <input type="text" value={tag} onChange={(e) => updateLangArray(formData, setFormData, lang, 'tags', idx, e.target.value)} className="input flex-1 text-sm" placeholder="Tag name" />
//                               <button type="button" onClick={() => updateLangArray(formData, setFormData, lang, 'tags', idx, null)} className="text-red-400 hover:text-red-600 px-2"><FiX size={14} /></button>
//                             </div>
//                           ))}
//                           <button type="button" onClick={() => addLangArrayItem(formData, setFormData, lang, 'tags')} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"><FiPlus size={12} /> Add Tag</button>
//                         </div>
//                       </div>

//                       {/* Info bullets */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Info Bullets ({lang.toUpperCase()})</label>
//                         <div className="space-y-2">
//                           {(formData[`info_${lang}`] || []).map((item, idx) => (
//                             <div key={idx} className="flex gap-2">
//                               <input type="text" value={item} onChange={(e) => updateLangArray(formData, setFormData, lang, 'info', idx, e.target.value)} className="input flex-1 text-sm" placeholder="Info item" />
//                               <button type="button" onClick={() => updateLangArray(formData, setFormData, lang, 'info', idx, null)} className="text-red-400 hover:text-red-600 px-2"><FiX size={14} /></button>
//                             </div>
//                           ))}
//                           <button type="button" onClick={() => addLangArrayItem(formData, setFormData, lang, 'info')} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"><FiPlus size={12} /> Add Info Item</button>
//                         </div>
//                       </div>

//                       {/* Gallery */}
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">Gallery ({lang.toUpperCase()})</label>
//                         <div className="space-y-2">
//                           {(formData[`gallery_${lang}`] || []).map((url, idx) => (
//                             <div key={idx} className="flex gap-2 items-center">
//                               <input type="url" value={url} onChange={(e) => updateLangArray(formData, setFormData, lang, 'gallery', idx, e.target.value)} className="input flex-1 text-sm" placeholder="https://example.com/image.jpg" />
//                               {url && <img src={url} alt="" className="w-10 h-10 object-cover rounded shrink-0" onError={(e) => e.target.style.display='none'} />}
//                               <button type="button" onClick={() => updateLangArray(formData, setFormData, lang, 'gallery', idx, null)} className="text-red-400 hover:text-red-600 px-2 shrink-0"><FiX size={14} /></button>
//                             </div>
//                           ))}
//                           <button type="button" onClick={() => addLangArrayItem(formData, setFormData, lang, 'gallery')} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"><FiPlus size={12} /> Add Gallery Item</button>
//                         </div>
//                       </div>

//                     </div>
//                   )}
//                 </LanguageTabs>

//                 {/* ── Contact Platforms ─────────────────────────────────────── */}
//                 <SectionHeader title="Contact Platforms" />
//                 <p className="text-xs text-gray-500 mb-4 -mt-2">Values are shared across all languages. Click a platform to expand.</p>
//                 <div className="space-y-2">
//                   {PLATFORMS.map(({ key, label, inputType }) => {
//                     const entries = getPlatformEntries(key);
//                     const isExpanded = !!expandedPlatforms[key];
//                     const hasEntries = entries.length > 0;
//                     return (
//                       <div key={key} className="border rounded-lg overflow-hidden">
//                         {/* Platform header — click to expand */}
//                         <button
//                           type="button"
//                           onClick={() => setExpandedPlatforms(prev => ({ ...prev, [key]: !prev[key] }))}
//                           className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-left"
//                         >
//                           <div className="flex items-center gap-2">
//                             <span className="text-sm font-medium text-gray-700">{label}</span>
//                             {hasEntries && (
//                               <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{entries.length}</span>
//                             )}
//                           </div>
//                           {isExpanded ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
//                         </button>

//                         {isExpanded && (
//                           <div className="px-4 py-3 space-y-3 bg-white">
//                             {entries.length === 0 && (
//                               <p className="text-xs text-gray-400">No entries yet.</p>
//                             )}
//                             {entries.map((entry, idx) => (
//                               <div key={idx} className="flex gap-2 items-center">
//                                 <span className="text-xs text-gray-400 w-5 shrink-0">{idx + 1}</span>
//                                 <input
//                                   type={inputType}
//                                   value={entry.value}
//                                   onChange={(e) => updatePlatformEntry(key, idx, 'value', e.target.value)}
//                                   className="input flex-1 text-sm"
//                                   placeholder={`${label} value`}
//                                 />
//                                 <input
//                                   type="text"
//                                   value={entry.label}
//                                   onChange={(e) => updatePlatformEntry(key, idx, 'label', e.target.value)}
//                                   className="input w-36 shrink-0 text-sm"
//                                   placeholder="Label (optional)"
//                                 />
//                                 <button type="button" onClick={() => removePlatformEntry(key, idx)} className="text-red-400 hover:text-red-600 px-1 shrink-0"><FiX size={14} /></button>
//                               </div>
//                             ))}
//                             <button
//                               type="button"
//                               onClick={() => addPlatformEntry(key)}
//                               className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 mt-1"
//                             >
//                               <FiPlus size={12} /> Add {label}
//                             </button>
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>

//               </div>{/* end modal-body */}

//               <div className="modal-footer">
//                 <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>
//                   {loading ? 'Saving...' : editingService ? 'Update' : 'Create'}
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


'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAllServices, getAllCategories } from '../../lib/firestore';
import { app } from '../../lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import LanguageTabs from '../../components/LanguageTabs';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX, FiEye, FiEyeOff, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import toast from 'react-hot-toast';

const functions = getFunctions(app);

// ── All 18 contact platforms ────────────────────────────────────────────────
// key: Firestore field prefix (e.g. "phone" → phonedata, phone_sor, phonetext_sor, phoneclickcount_sor)
// label: display name in form
// inputType: url | tel | email | text
const PLATFORMS = [
  { key: 'phone',       label: 'Phone',        inputType: 'tel'   },
  { key: 'whatsapp',    label: 'WhatsApp',      inputType: 'url'   },
  { key: 'telegram',    label: 'Telegram',      inputType: 'url'   },
  { key: 'viber',       label: 'Viber',         inputType: 'url'   },
  { key: 'email',       label: 'Email',         inputType: 'email' },
  { key: 'facebook',    label: 'Facebook',      inputType: 'url'   },
  { key: 'instagram',   label: 'Instagram',     inputType: 'url'   },
  { key: 'tiktok',      label: 'TikTok',        inputType: 'url'   },
  { key: 'linkedin',    label: 'LinkedIn',      inputType: 'url'   },
  { key: 'x',           label: 'X (Twitter)',   inputType: 'url'   },
  { key: 'snapchat',    label: 'Snapchat',      inputType: 'url'   },
  { key: 'youtube',     label: 'YouTube',       inputType: 'url'   },
  { key: 'website',     label: 'Website',       inputType: 'url'   },
  { key: 'applestore',  label: 'App Store',     inputType: 'url'   },
  { key: 'googleplay',  label: 'Google Play',   inputType: 'url'   },
  { key: 'googlemap',   label: 'Google Maps',   inputType: 'url'   },
  { key: 'waze',        label: 'Waze',          inputType: 'url'   },
  { key: 'mapsme',      label: 'Maps.me',       inputType: 'url'   },
];

const LANGS = ['sor', 'bad', 'ar', 'en'];

// ── Empty entry for a single platform ──────────────────────────────────────
const emptyPlatformEntry = (key) => ({ value: '', label: '' });

// ── Parse Firestore platform map {"0":{...},"1":{...}} into array of {value, label} ──
const parsePlatformData = (data, key) => {
  if (!data) return [];
  // data can be array or map-as-object
  const entries = Array.isArray(data) ? data : Object.values(data);
  return entries.map(entry => ({
    value: entry[`${key}_sor`] || '',
    label: entry[`${key}text_sor`] || '',
    // preserve clickcounts from existing data
    _counts: {
      sor: entry[`${key}clickcount_sor`] || 0,
      bad: entry[`${key}clickcount_bad`] || 0,
      ar:  entry[`${key}clickcount_ar`]  || 0,
      en:  entry[`${key}clickcount_en`]  || 0,
    },
  })).filter(e => e.value); // skip blank entries
};

// ── Parse Firestore map-or-array into string[] for info/gallery/tags ────────
const parseStringArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) return data.filter(Boolean);
  if (typeof data === 'string') return data ? [data] : [];
  if (typeof data === 'object') return Object.values(data).map(String).filter(Boolean);
  return [];
};

// ── Serialize string[] → Firestore map {"0":"v0","1":"v1"} ──────────────────
const toFirestoreMap = (arr) => {
  const out = {};
  arr.filter(Boolean).forEach((v, i) => { out[String(i)] = v; });
  return out;
};

// ── Serialize platform entries → Firestore map {"0":{...},"1":{...}} ────────
const buildPlatformData = (entries, key) => {
  const out = {};
  entries.filter(e => e.value.trim()).forEach((e, i) => {
    out[String(i)] = {
      [`${key}_sor`]:            e.value,
      [`${key}_bad`]:            e.value,
      [`${key}_ar`]:             e.value,
      [`${key}_en`]:             e.value,
      [`${key}text_sor`]:        e.label,
      [`${key}text_bad`]:        e.label,
      [`${key}text_ar`]:         e.label,
      [`${key}text_en`]:         e.label,
      [`${key}clickcount_sor`]:  e._counts?.sor ?? 0,
      [`${key}clickcount_bad`]:  e._counts?.bad ?? 0,
      [`${key}clickcount_ar`]:   e._counts?.ar  ?? 0,
      [`${key}clickcount_en`]:   e._counts?.en  ?? 0,
    };
  });
  return Object.keys(out).length > 0 ? out : null;
};

// ── Build initial empty form ─────────────────────────────────────────────────
const makeEmptyForm = () => {
  const f = { categoryref: '' };
  LANGS.forEach(l => {
    f[`name_${l}`]        = '';
    f[`jobtitle_${l}`]    = '';
    f[`jobtitle1_${l}`]   = '';
    f[`job_${l}`]         = '';
    f[`image_${l}`]       = '';
    f[`providedby_${l}`]  = '';
    f[`search_${l}`]      = '';
    f[`visibility_${l}`]  = true;
    f[`sortingorder_${l}`]= '';
    f[`latlng_${l}`]      = { lat: '', lng: '' };
    f[`createddate_${l}`] = '';
    f[`expiredate_${l}`]  = '';
    f[`tags_${l}`]        = [];       // string[]
    f[`info_${l}`]        = [];       // string[]
    f[`gallery_${l}`]     = [];       // string[]
    for (let n = 1; n <= 6; n++) {
      f[`dd${n}_${l}`]     = '';
      f[`dd${n}text_${l}`] = '';
    }
  });
  // platforms: each is array of {value, label}
  PLATFORMS.forEach(p => { f[`_platform_${p.key}`] = []; });
  return f;
};

// ── Parse existing service into form shape ───────────────────────────────────
const serviceToForm = (s) => {
  const f = { categoryref: s.categoryref || '' };
  LANGS.forEach(l => {
    f[`name_${l}`]        = s[`name_${l}`]        || '';
    f[`jobtitle_${l}`]    = s[`jobtitle_${l}`]    || '';
    f[`jobtitle1_${l}`]   = s[`jobtitle1_${l}`]   || '';
    f[`job_${l}`]         = s[`job_${l}`]          || '';
    f[`image_${l}`]       = s[`image_${l}`]        || '';
    f[`providedby_${l}`]  = s[`providedby_${l}`]  || '';
    f[`search_${l}`]      = s[`search_${l}`]       || '';
    f[`visibility_${l}`]  = s[`visibility_${l}`]   ?? true;
    f[`sortingorder_${l}`]= s[`sortingorder_${l}`] != null ? String(s[`sortingorder_${l}`]) : '';
    // latlng: stored as {lat, lng} object
    const ll = s[`latlng_${l}`];
    f[`latlng_${l}`] = { lat: ll?.lat != null ? String(ll.lat) : '', lng: ll?.lng != null ? String(ll.lng) : '' };
    // dates: Firestore Timestamp {seconds,nanoseconds}, plain ms int, or null
    const toDateStr = (v) => {
      if (!v) return '';
      const ms = (typeof v === 'object' && v.seconds != null) ? v.seconds * 1000 : Number(v);
      if (isNaN(ms) || ms <= 0) return '';
      try { return new Date(ms).toISOString().split('T')[0]; } catch (e) { return ''; }
    };
    f[`createddate_${l}`] = toDateStr(s[`createddate_${l}`]);
    f[`expiredate_${l}`]  = toDateStr(s[`expiredate_${l}`]);
    f[`tags_${l}`]    = parseStringArray(s[`tags_${l}`]);
    f[`info_${l}`]    = parseStringArray(s[`info_${l}`]);
    f[`gallery_${l}`] = parseStringArray(s[`gallery_${l}`]);
    for (let n = 1; n <= 6; n++) {
      // dd values can be string or map — store as plain string in form (admin edits as text)
      const ddVal = s[`dd${n}_${l}`];
      // dd values can be a plain string (single) or array (multi-value).
      // Store as newline-separated string so textarea shows one value per line.
      // On save we split back to array — dart _toStringList handles List correctly.
      if (ddVal == null) {
        f[`dd${n}_${l}`] = '';
      } else if (Array.isArray(ddVal)) {
        f[`dd${n}_${l}`] = ddVal.join('\n');
      } else if (typeof ddVal === 'object') {
        f[`dd${n}_${l}`] = Object.values(ddVal).join('\n');
      } else {
        f[`dd${n}_${l}`] = String(ddVal);
      }
      f[`dd${n}text_${l}`] = s[`dd${n}text_${l}`] || '';
    }
  });
  PLATFORMS.forEach(p => {
    f[`_platform_${p.key}`] = parsePlatformData(s[`${p.key}data`], p.key);
  });
  return f;
};

// ── Convert form → Firestore serviceData object ──────────────────────────────
const formToServiceData = (f) => {
  const out = { categoryref: f.categoryref };
  LANGS.forEach(l => {
    out[`name_${l}`]       = f[`name_${l}`];
    out[`jobtitle_${l}`]   = f[`jobtitle_${l}`];
    out[`jobtitle1_${l}`]  = f[`jobtitle1_${l}`];
    out[`job_${l}`]        = f[`job_${l}`];
    out[`image_${l}`]      = f[`image_${l}`];
    out[`providedby_${l}`] = f[`providedby_${l}`];
    out[`search_${l}`]     = f[`search_${l}`];
    out[`visibility_${l}`] = f[`visibility_${l}`];
    const so = f[`sortingorder_${l}`];
    out[`sortingorder_${l}`] = so !== '' && so != null ? parseInt(so, 10) : null;
    // latlng
    const ll = f[`latlng_${l}`];
    const lat = parseFloat(ll.lat), lng = parseFloat(ll.lng);
    out[`latlng_${l}`] = (!isNaN(lat) && !isNaN(lng)) ? { lat, lng } : null;
    // dates → ms timestamp
    out[`createddate_${l}`] = f[`createddate_${l}`] ? new Date(f[`createddate_${l}`]).getTime() : null;
    out[`expiredate_${l}`]  = f[`expiredate_${l}`]  ? new Date(f[`expiredate_${l}`]).getTime()  : null;
    // arrays → Firestore maps
    out[`tags_${l}`]    = toFirestoreMap(f[`tags_${l}`]);
    out[`info_${l}`]    = toFirestoreMap(f[`info_${l}`]);
    out[`gallery_${l}`] = toFirestoreMap(f[`gallery_${l}`]);
    for (let n = 1; n <= 6; n++) {
      // Split newline-separated string back to array for dart _toStringList compatibility.
      // Single-value (no newline) → write as plain string. Multi → write as array.
      const ddRaw = f[`dd${n}_${l}`];
      if (ddRaw) {
        const parts = ddRaw.split('\n').map(s => s.trim()).filter(Boolean);
        out[`dd${n}_${l}`] = parts.length === 1 ? parts[0] : parts;
      } else {
        out[`dd${n}_${l}`] = null;
      }
      out[`dd${n}text_${l}`] = f[`dd${n}text_${l}`] || null;
    }
  });
  PLATFORMS.forEach(p => {
    const entries = f[`_platform_${p.key}`] || [];
    const built = buildPlatformData(entries, p.key);
    if (built) out[`${p.key}data`] = built;
  });
  return out;
};

// ── Small reusable: add/remove item in a per-lang array field ────────────────
const updateLangArray = (formData, setFormData, lang, field, idx, value) => {
  const key = `${field}_${lang}`;
  const arr = [...(formData[key] || [])];
  if (value === null) arr.splice(idx, 1);
  else arr[idx] = value;
  setFormData(prev => ({ ...prev, [key]: arr }));
};
const addLangArrayItem = (formData, setFormData, lang, field) => {
  const key = `${field}_${lang}`;
  setFormData(prev => ({ ...prev, [key]: [...(prev[key] || []), ''] }));
};

export default function ServicesPage() {
  const { canAccess, canAccessService } = useAuth();
  const [services, setServices]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // ── Cascading dd1–dd6 filter state ──────────────────────────────────────────
  const [ddSelections, setDdSelections] = useState({ dd1: '', dd2: '', dd3: '', dd4: '', dd5: '', dd6: '' });

  const [showModal, setShowModal]       = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [formData, setFormData] = useState(makeEmptyForm());

  // Which platform sections are expanded in the form
  const [expandedPlatforms, setExpandedPlatforms] = useState({});

  useEffect(() => {
    if (canAccess('services_new')) loadData();
  }, []);

  useEffect(() => { filterServices(); }, [searchTerm, categoryFilter, ddSelections, services]);

  const loadData = async () => {
    try {
      const [servicesData, categoriesData] = await Promise.all([
        getAllServices(),
        getAllCategories(),
      ]);
      const accessible = servicesData.filter(s => canAccessService(s.id, s.categoryref));
      setServices(accessible);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // ── Normalize a dd field value into string[] (for filter logic) ─────────────
  const toStringList = (value) => {
    if (!value) return [];
    if (typeof value === 'string') return value.trim() ? [value.trim()] : [];
    if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean);
    if (typeof value === 'object') return Object.values(value).map(v => String(v).trim()).filter(Boolean);
    return [String(value).trim()].filter(Boolean);
  };

  const filterServices = () => {
    let filtered = services;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.name_sor?.toLowerCase().includes(term) ||
        s.name_bad?.toLowerCase().includes(term) ||
        s.name_ar?.toLowerCase().includes(term)  ||
        s.name_en?.toLowerCase().includes(term)
      );
    }
    if (categoryFilter) {
      filtered = filtered.filter(s => {
        const ref = s.categoryref;
        if (!ref) return false;
        if (typeof ref === 'object' && ref.id) return ref.id === categoryFilter;
        if (typeof ref === 'object' && ref.path) return ref.path.split('/').pop() === categoryFilter;
        if (typeof ref === 'string') return (ref.includes('/') ? ref.split('/').pop() : ref) === categoryFilter;
        return false;
      });
    }
    if (ddSelections.dd1) filtered = filtered.filter(s => toStringList(s.dd1_sor).includes(ddSelections.dd1));
    if (ddSelections.dd2) filtered = filtered.filter(s => toStringList(s.dd2_sor).includes(ddSelections.dd2));
    if (ddSelections.dd3) filtered = filtered.filter(s => toStringList(s.dd3_sor).includes(ddSelections.dd3));
    if (ddSelections.dd4) filtered = filtered.filter(s => toStringList(s.dd4_sor).includes(ddSelections.dd4));
    if (ddSelections.dd5) filtered = filtered.filter(s => toStringList(s.dd5_sor).includes(ddSelections.dd5));
    if (ddSelections.dd6) filtered = filtered.filter(s => toStringList(s.dd6_sor).includes(ddSelections.dd6));
    setFilteredServices(filtered);
  };

  const getDdOptions = (level) => {
    let pool = services;
    if (categoryFilter) {
      pool = pool.filter(s => {
        const ref = s.categoryref;
        if (!ref) return false;
        if (typeof ref === 'object' && ref.id) return ref.id === categoryFilter;
        if (typeof ref === 'object' && ref.path) return ref.path.split('/').pop() === categoryFilter;
        if (typeof ref === 'string') return (ref.includes('/') ? ref.split('/').pop() : ref) === categoryFilter;
        return false;
      });
    }
    if (level > 1 && ddSelections.dd1) pool = pool.filter(s => toStringList(s.dd1_sor).includes(ddSelections.dd1));
    if (level > 2 && ddSelections.dd2) pool = pool.filter(s => toStringList(s.dd2_sor).includes(ddSelections.dd2));
    if (level > 3 && ddSelections.dd3) pool = pool.filter(s => toStringList(s.dd3_sor).includes(ddSelections.dd3));
    if (level > 4 && ddSelections.dd4) pool = pool.filter(s => toStringList(s.dd4_sor).includes(ddSelections.dd4));
    if (level > 5 && ddSelections.dd5) pool = pool.filter(s => toStringList(s.dd5_sor).includes(ddSelections.dd5));
    const key = `dd${level}_sor`;
    return [...new Set(pool.flatMap(s => toStringList(s[key])))].sort((a, b) => a.localeCompare(b));
  };

  const getDdLabel = (level) => {
    const key = `dd${level}text_sor`;
    return services.find(s => s[key])?.[key] || null;
  };

  const handleDdSelect = (level, value) => {
    setDdSelections(prev => ({
      ...prev,
      [`dd${level}`]: value,
      ...(level < 2 ? { dd2: '' } : {}),
      ...(level < 3 ? { dd3: '' } : {}),
      ...(level < 4 ? { dd4: '' } : {}),
      ...(level < 5 ? { dd5: '' } : {}),
      ...(level < 6 ? { dd6: '' } : {}),
    }));
  };

  const clearDdFilters = () => setDdSelections({ dd1: '', dd2: '', dd3: '', dd4: '', dd5: '', dd6: '' });

  // ── Modal open/close ─────────────────────────────────────────────────────────
  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData(serviceToForm(service));
      // Auto-expand platforms that have entries
      const expanded = {};
      PLATFORMS.forEach(p => {
        const entries = parsePlatformData(service[`${p.key}data`], p.key);
        if (entries.length > 0) expanded[p.key] = true;
      });
      setExpandedPlatforms(expanded);
    } else {
      setEditingService(null);
      setFormData(makeEmptyForm());
      setExpandedPlatforms({});
    }
    setShowModal(true);
  };

  const handleCloseModal = () => { setShowModal(false); setEditingService(null); };

  // ── Form submit ──────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const serviceData = formToServiceData(formData);
      const fn = httpsCallable(functions, 'createOrUpdateService');
      const result = await fn({ id: editingService?.id || null, serviceData });
      toast.success(result.data.action === 'updated' ? 'Service updated!' : 'Service created!');
      await loadData();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving service:', error);
      toast.error(error.message || 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  // ── Platform entry helpers ───────────────────────────────────────────────────
  const getPlatformEntries = (key) => formData[`_platform_${key}`] || [];
  const setPlatformEntries = (key, entries) =>
    setFormData(prev => ({ ...prev, [`_platform_${key}`]: entries }));
  const addPlatformEntry = (key) =>
    setPlatformEntries(key, [...getPlatformEntries(key), emptyPlatformEntry(key)]);
  const updatePlatformEntry = (key, idx, field, value) => {
    const entries = [...getPlatformEntries(key)];
    entries[idx] = { ...entries[idx], [field]: value };
    setPlatformEntries(key, entries);
  };
  const removePlatformEntry = (key, idx) => {
    setPlatformEntries(key, getPlatformEntries(key).filter((_, i) => i !== idx));
  };

  // ── CRUD handlers (unchanged) ────────────────────────────────────────────────
  const handleDelete = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Service?',
      message: 'Are you sure you want to delete this service?',
      onConfirm: async () => {
        try {
          const fn = httpsCallable(functions, 'deleteItems');
          await fn({ collection: 'services_new', ids: [id] });
          toast.success('Service deleted successfully!');
          await loadData();
        } catch (error) {
          toast.error(error.message || 'Failed to delete service');
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
      await fn({ collection: 'services_new', id });
      toast.success('Service duplicated successfully!');
      await loadData();
    } catch (error) {
      toast.error(error.message || 'Failed to duplicate service');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkDelete = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Selected Services?',
      message: `Are you sure you want to delete ${selectedServices.length} selected services?`,
      onConfirm: async () => {
        try {
          const fn = httpsCallable(functions, 'deleteItems');
          await fn({ collection: 'services_new', ids: selectedServices });
          toast.success(`${selectedServices.length} services deleted successfully!`);
          setSelectedServices([]);
          await loadData();
        } catch (error) {
          toast.error(error.message || 'Failed to delete services');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  if (!canAccess('services_new')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-600">You don't have access to this page.</p>
      </div>
    );
  }

  // ── Form section header helper ───────────────────────────────────────────────
  const SectionHeader = ({ title }) => (
    <h3 className="text-base font-semibold text-gray-800 border-b pb-2 mb-4 mt-8">{title}</h3>
  );

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8">

          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Services</h1>
              <p className="text-gray-600 mt-1">Manage all services</p>
            </div>
            <button onClick={() => handleOpenModal()} className="btn btn-primary flex items-center gap-2">
              <FiPlus size={20} /> Add New Service
            </button>
          </div>

          <div className="card mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative w-full lg:w-72 shrink-0">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search services..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10 pr-10 w-full" />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Clear search"><FiX size={16} /></button>
                )}
              </div>
              <div className="w-full lg:flex-1">
                <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); clearDdFilters(); }} className="select w-full">
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name_sor || cat.name_en || cat.id}</option>
                  ))}
                </select>
              </div>
              {selectedServices.length > 0 && (
                <div className="w-full lg:w-auto">
                  <button onClick={handleBulkDelete} className="btn btn-danger flex items-center justify-center gap-2 w-full whitespace-nowrap px-6">
                    <FiTrash2 /><span>Delete {selectedServices.length}</span>
                  </button>
                </div>
              )}
            </div>

            {/* ── Cascading dd1–dd6 filters ──────────────────────────────────── */}
            {[1,2,3,4,5,6].map(level => {
              const parentSelected = level === 1 ? true : !!ddSelections[`dd${level - 1}`];
              if (!parentSelected) return null;
              const opts = getDdOptions(level);
              if (opts.length === 0) return null;
              const label = getDdLabel(level);
              const selected = ddSelections[`dd${level}`];
              const indent = (level - 1) * 16;
              return (
                <div key={level} className="mt-2 flex items-center gap-2" style={{ paddingLeft: `${indent}px` }}>
                  {level > 1 && <span className="text-gray-300 text-xs shrink-0 -ml-4">↳</span>}
                  <div className="relative flex-1">
                    <select
                      value={selected}
                      onChange={(e) => handleDdSelect(level, e.target.value)}
                      className={`select w-full ${selected ? 'pr-8' : ''} ${selected ? 'border-primary text-gray-900 font-medium' : 'text-gray-500'}`}
                    >
                      <option value="">{label ? `All ${label}` : `All (level ${level})`}</option>
                      {opts.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {selected && (
                      <button onClick={() => handleDdSelect(level, '')} className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" title="Clear">
                        <FiX size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {Object.values(ddSelections).some(Boolean) && (
              <div className="mt-2 flex justify-end">
                <button onClick={clearDdFilters} className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1">
                  <FiX size={12} /> Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Result count */}
          {!loading && (
            <div className="flex items-center gap-3 mb-4">
              <p className="text-sm text-gray-500 shrink-0">
                {searchTerm || categoryFilter || Object.values(ddSelections).some(Boolean)
                  ? `${filteredServices.length} of ${services.length} service${services.length !== 1 ? 's' : ''}`
                  : `${services.length} service${services.length !== 1 ? 's' : ''}`}
              </p>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
          )}

          {loading && !services.length ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="card text-center py-12"><p className="text-gray-600">No services found</p></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredServices.map((service) => (
                <div key={service.id} className="card hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <input type="checkbox" title="checkbox" checked={selectedServices.includes(service.id)} onChange={(e) => { if (e.target.checked) setSelectedServices([...selectedServices, service.id]); else setSelectedServices(selectedServices.filter(id => id !== service.id)); }} className="w-4 h-4 text-primary rounded" />
                    <div className="flex gap-1">
                      <button onClick={() => handleOpenModal(service)} className="p-1.5 hover:bg-gray-100 rounded" title="Edit"><FiEdit2 size={16} className="text-gray-600" /></button>
                      <button onClick={() => handleDuplicate(service.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Duplicate"><FiCopy size={16} className="text-gray-600" /></button>
                      <button onClick={() => handleDelete(service.id)} className="p-1.5 hover:bg-gray-100 rounded" title="Delete"><FiTrash2 size={16} className="text-red-600" /></button>
                    </div>
                  </div>
                  {service.image_sor && (
                    <div className="w-full h-40 bg-gray-100 rounded-lg mb-3 overflow-hidden">
                      <img src={service.image_sor} alt={service.name_sor} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900">{service.name_sor || service.name_en}</h3>
                    {service.jobtitle_sor && <p className="text-sm text-gray-600">{service.jobtitle_sor}</p>}
                    {service.job_sor && <p className="text-xs text-gray-500 line-clamp-2">{service.job_sor}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      {service.visibility_sor ? <FiEye className="text-green-600" size={16} /> : <FiEyeOff className="text-gray-400" size={16} />}
                      <span className="text-xs text-gray-500">Views: {service.pageview_sor || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <DeleteConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL — Create / Edit Service
      ════════════════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={handleCloseModal} title="Close"><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-0">

                {/* ── Category ─────────────────────────────────────────────── */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.categoryref}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryref: e.target.value }))}
                    className="select" required
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name_sor || cat.name_en || cat.id}</option>
                    ))}
                  </select>
                </div>

                {/* ── Per-language fields ───────────────────────────────────── */}
                <LanguageTabs>
                  {(lang) => (
                    <div className="space-y-4 pt-2">

                      {/* Basic fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name ({lang.toUpperCase()}) *</label>
                          <input type="text" value={formData[`name_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`name_${lang}`]: e.target.value }))} className="input" placeholder="Service name" required={lang === 'sor'} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Provided By ({lang.toUpperCase()})</label>
                          <input type="text" value={formData[`providedby_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`providedby_${lang}`]: e.target.value }))} className="input" placeholder="Provider name" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title 1 ({lang.toUpperCase()})</label>
                          <input type="text" value={formData[`jobtitle_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`jobtitle_${lang}`]: e.target.value }))} className="input" placeholder="Primary job title" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title 2 ({lang.toUpperCase()})</label>
                          <input type="text" value={formData[`jobtitle1_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`jobtitle1_${lang}`]: e.target.value }))} className="input" placeholder="Secondary job title" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description ({lang.toUpperCase()})</label>
                        <textarea value={formData[`job_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`job_${lang}`]: e.target.value }))} className="textarea" rows="3" placeholder="Service description" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search Text ({lang.toUpperCase()})</label>
                        <textarea value={formData[`search_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`search_${lang}`]: e.target.value }))} className="textarea" rows="2" placeholder="Searchable keywords blob" />
                      </div>

                      {/* Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Image URL ({lang.toUpperCase()})</label>
                        <input type="url" value={formData[`image_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`image_${lang}`]: e.target.value }))} className="input" placeholder="https://example.com/image.png" />
                        {formData[`image_${lang}`] && <img src={formData[`image_${lang}`]} alt="Preview" className="mt-2 w-28 h-28 object-cover rounded" />}
                      </div>

                      {/* Visibility + Sorting */}
                      <div className="flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id={`vis_${lang}`} checked={formData[`visibility_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`visibility_${lang}`]: e.target.checked }))} className="w-4 h-4 text-primary rounded" />
                          <label htmlFor={`vis_${lang}`} className="text-sm font-medium text-gray-700">Visible ({lang.toUpperCase()})</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">Sort Order</label>
                          <input type="number" value={formData[`sortingorder_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`sortingorder_${lang}`]: e.target.value }))} className="input w-24" placeholder="0" />
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Created Date ({lang.toUpperCase()})</label>
                          <input type="date" value={formData[`createddate_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`createddate_${lang}`]: e.target.value }))} className="input" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expire Date ({lang.toUpperCase()})</label>
                          <input type="date" value={formData[`expiredate_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`expiredate_${lang}`]: e.target.value }))} className="input" />
                        </div>
                      </div>

                      {/* Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location ({lang.toUpperCase()})</label>
                        <div className="flex gap-3">
                          <input type="number" step="any" value={formData[`latlng_${lang}`].lat} onChange={(e) => setFormData(prev => ({ ...prev, [`latlng_${lang}`]: { ...prev[`latlng_${lang}`], lat: e.target.value } }))} className="input flex-1" placeholder="Latitude (e.g. 36.1901)" />
                          <input type="number" step="any" value={formData[`latlng_${lang}`].lng} onChange={(e) => setFormData(prev => ({ ...prev, [`latlng_${lang}`]: { ...prev[`latlng_${lang}`], lng: e.target.value } }))} className="input flex-1" placeholder="Longitude (e.g. 44.0091)" />
                        </div>
                      </div>

                      {/* DD Filters 1–6 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Dropdown Filters ({lang.toUpperCase()})</label>
                        <div className="space-y-2">
                          {[1,2,3,4,5,6].map(n => (
                            <div key={n} className="flex gap-2 items-center">
                              <span className="text-xs text-gray-400 w-6 shrink-0">#{n}</span>
                              <input type="text" value={formData[`dd${n}text_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`dd${n}text_${lang}`]: e.target.value }))} className="input w-32 shrink-0 text-sm" placeholder="Label" />
                              <textarea value={formData[`dd${n}_${lang}`]} onChange={(e) => setFormData(prev => ({ ...prev, [`dd${n}_${lang}`]: e.target.value }))} className="input flex-1 text-sm resize-none" rows={2} placeholder={"Value (one per line for multi-value)"} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags ({lang.toUpperCase()})</label>
                        <div className="space-y-2">
                          {(formData[`tags_${lang}`] || []).map((tag, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input type="text" value={tag} onChange={(e) => updateLangArray(formData, setFormData, lang, 'tags', idx, e.target.value)} className="input flex-1 text-sm" placeholder="Tag name" />
                              <button type="button" onClick={() => updateLangArray(formData, setFormData, lang, 'tags', idx, null)} className="text-red-400 hover:text-red-600 px-2"><FiX size={14} /></button>
                            </div>
                          ))}
                          <button type="button" onClick={() => addLangArrayItem(formData, setFormData, lang, 'tags')} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"><FiPlus size={12} /> Add Tag</button>
                        </div>
                      </div>

                      {/* Info bullets */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Info Bullets ({lang.toUpperCase()})</label>
                        <div className="space-y-2">
                          {(formData[`info_${lang}`] || []).map((item, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input type="text" value={item} onChange={(e) => updateLangArray(formData, setFormData, lang, 'info', idx, e.target.value)} className="input flex-1 text-sm" placeholder="Info item" />
                              <button type="button" onClick={() => updateLangArray(formData, setFormData, lang, 'info', idx, null)} className="text-red-400 hover:text-red-600 px-2"><FiX size={14} /></button>
                            </div>
                          ))}
                          <button type="button" onClick={() => addLangArrayItem(formData, setFormData, lang, 'info')} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"><FiPlus size={12} /> Add Info Item</button>
                        </div>
                      </div>

                      {/* Gallery */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gallery ({lang.toUpperCase()})</label>
                        <div className="space-y-2">
                          {(formData[`gallery_${lang}`] || []).map((url, idx) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <input type="url" value={url} onChange={(e) => updateLangArray(formData, setFormData, lang, 'gallery', idx, e.target.value)} className="input flex-1 text-sm" placeholder="https://example.com/image.jpg" />
                              {url && <img src={url} alt="" className="w-10 h-10 object-cover rounded shrink-0" onError={(e) => e.target.style.display='none'} />}
                              <button type="button" onClick={() => updateLangArray(formData, setFormData, lang, 'gallery', idx, null)} className="text-red-400 hover:text-red-600 px-2 shrink-0"><FiX size={14} /></button>
                            </div>
                          ))}
                          <button type="button" onClick={() => addLangArrayItem(formData, setFormData, lang, 'gallery')} className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"><FiPlus size={12} /> Add Gallery Item</button>
                        </div>
                      </div>

                    </div>
                  )}
                </LanguageTabs>

                {/* ── Contact Platforms ─────────────────────────────────────── */}
                <SectionHeader title="Contact Platforms" />
                <p className="text-xs text-gray-500 mb-4 -mt-2">Values are shared across all languages. Click a platform to expand.</p>
                <div className="space-y-2">
                  {PLATFORMS.map(({ key, label, inputType }) => {
                    const entries = getPlatformEntries(key);
                    const isExpanded = !!expandedPlatforms[key];
                    const hasEntries = entries.length > 0;
                    return (
                      <div key={key} className="border rounded-lg overflow-hidden">
                        {/* Platform header — click to expand */}
                        <button
                          type="button"
                          onClick={() => setExpandedPlatforms(prev => ({ ...prev, [key]: !prev[key] }))}
                          className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-left"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                            {hasEntries && (
                              <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{entries.length}</span>
                            )}
                          </div>
                          {isExpanded ? <FiChevronUp size={16} className="text-gray-400" /> : <FiChevronDown size={16} className="text-gray-400" />}
                        </button>

                        {isExpanded && (
                          <div className="px-4 py-3 space-y-3 bg-white">
                            {entries.length === 0 && (
                              <p className="text-xs text-gray-400">No entries yet.</p>
                            )}
                            {entries.map((entry, idx) => (
                              <div key={idx} className="flex gap-2 items-center">
                                <span className="text-xs text-gray-400 w-5 shrink-0">{idx + 1}</span>
                                <input
                                  type={inputType}
                                  value={entry.value}
                                  onChange={(e) => updatePlatformEntry(key, idx, 'value', e.target.value)}
                                  className="input flex-1 text-sm"
                                  placeholder={`${label} value`}
                                />
                                <input
                                  type="text"
                                  value={entry.label}
                                  onChange={(e) => updatePlatformEntry(key, idx, 'label', e.target.value)}
                                  className="input w-36 shrink-0 text-sm"
                                  placeholder="Label (optional)"
                                />
                                <button type="button" onClick={() => removePlatformEntry(key, idx)} className="text-red-400 hover:text-red-600 px-1 shrink-0"><FiX size={14} /></button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addPlatformEntry(key)}
                              className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 mt-1"
                            >
                              <FiPlus size={12} /> Add {label}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>{/* end modal-body */}

              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : editingService ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}