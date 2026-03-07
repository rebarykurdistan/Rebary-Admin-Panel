// NEW 7 


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
import { FiPlus, FiEdit2, FiTrash2, FiCopy, FiSearch, FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

const functions = getFunctions(app);

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

  const emptyForm = {
    name_sor: '', name_bad: '', name_ar: '', name_en: '',
    job_sor: '', job_bad: '', job_ar: '', job_en: '',
    jobtitle_sor: '', jobtitle_bad: '', jobtitle_ar: '', jobtitle_en: '',
    image_sor: '', image_bad: '', image_ar: '', image_en: '',
    categoryref: '',
    visibility_sor: true, visibility_bad: true, visibility_ar: true, visibility_en: true,
    phone: '', phoneText: '',
    whatsapp: '', whatsappText: '',
    email: '', emailText: '',
    facebook: '', instagram: '', website: '',
  };
  const [formData, setFormData] = useState(emptyForm);

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
      // Filter to only services this user can access
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

  // ── Normalize a dd field value (string, map, or null) into string[] ─────────
  // Mirrors Flutter's _toStringList. dd values in Firestore can be:
  //   - a plain string: "Erbil"
  //   - a Firestore map exported as object: { "0": "Erbil", "1": "Sulaymaniyah" }
  //   - null / undefined
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
    // ── Cascading dd filters (using _sor as canonical language) ──────────────
    if (ddSelections.dd1) filtered = filtered.filter(s => toStringList(s.dd1_sor).includes(ddSelections.dd1));
    if (ddSelections.dd2) filtered = filtered.filter(s => toStringList(s.dd2_sor).includes(ddSelections.dd2));
    if (ddSelections.dd3) filtered = filtered.filter(s => toStringList(s.dd3_sor).includes(ddSelections.dd3));
    if (ddSelections.dd4) filtered = filtered.filter(s => toStringList(s.dd4_sor).includes(ddSelections.dd4));
    if (ddSelections.dd5) filtered = filtered.filter(s => toStringList(s.dd5_sor).includes(ddSelections.dd5));
    if (ddSelections.dd6) filtered = filtered.filter(s => toStringList(s.dd6_sor).includes(ddSelections.dd6));
    setFilteredServices(filtered);
  };

  // ── Compute dd options for each level from the services in scope ─────────────
  // Each level narrows the pool by all selections above it.
  const getDdOptions = (level) => {
    // Pool: services matching category filter + all dd levels above `level`
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
    const opts = [...new Set(pool.flatMap(s => toStringList(s[key])))].sort((a, b) => a.localeCompare(b));
    return opts;
  };

  // ── Label for a dd level: taken from first service that has ddNtext_sor ──────
  const getDdLabel = (level) => {
    const key = `dd${level}text_sor`;
    return services.find(s => s[key])?.[ key] || null;
  };

  // ── Select a dd value at a given level, clearing all levels below ────────────
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

  // ── Clear all dd filters ────────────────────────────────────────────────────
  const clearDdFilters = () => setDdSelections({ dd1: '', dd2: '', dd3: '', dd4: '', dd5: '', dd6: '' });

  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingService(service);
      const phoneEntry     = service.phonedata?.[0];
      const whatsappEntry  = service.whatsappdata?.[0];
      const emailEntry     = service.emaildata?.[0];
      const facebookEntry  = service.facebookdata?.[0];
      const instagramEntry = service.instagramdata?.[0];
      const websiteEntry   = service.websitedata?.[0];

      setFormData({
        name_sor: service.name_sor || '', name_bad: service.name_bad || '',
        name_ar:  service.name_ar  || '', name_en:  service.name_en  || '',
        job_sor:  service.job_sor  || '', job_bad:  service.job_bad  || '',
        job_ar:   service.job_ar   || '', job_en:   service.job_en   || '',
        jobtitle_sor: service.jobtitle_sor || '', jobtitle_bad: service.jobtitle_bad || '',
        jobtitle_ar:  service.jobtitle_ar  || '', jobtitle_en:  service.jobtitle_en  || '',
        image_sor: service.image_sor || '', image_bad: service.image_bad || '',
        image_ar:  service.image_ar  || '', image_en:  service.image_en  || '',
        categoryref: service.categoryref || '',
        visibility_sor: service.visibility_sor ?? true,
        visibility_bad: service.visibility_bad ?? true,
        visibility_ar:  service.visibility_ar  ?? true,
        visibility_en:  service.visibility_en  ?? true,
        phone:        phoneEntry?.phone_sor       || '',
        phoneText:    phoneEntry?.phonetext_sor   || '',
        whatsapp:     whatsappEntry?.whatsapp_sor || '',
        whatsappText: whatsappEntry?.whatsapptext_sor || '',
        email:        emailEntry?.email_sor       || '',
        emailText:    emailEntry?.emailtext_sor   || '',
        facebook:     facebookEntry?.facebook_sor || '',
        instagram:    instagramEntry?.instagram_sor || '',
        website:      websiteEntry?.website_sor   || '',
      });
    } else {
      setEditingService(null);
      setFormData(emptyForm);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => { setShowModal(false); setEditingService(null); };

  // Build the full serviceData object (same contact platform format as before)
  const buildServiceData = (formData) => {
    const serviceData = { ...formData };

    if (formData.phone) {
      serviceData.phonedata = [{ phone_sor: formData.phone, phone_bad: formData.phone, phone_ar: formData.phone, phone_en: formData.phone, phonetext_sor: formData.phoneText, phonetext_bad: formData.phoneText, phonetext_ar: formData.phoneText, phonetext_en: formData.phoneText, phoneclickcount_sor: 0, phoneclickcount_bad: 0, phoneclickcount_ar: 0, phoneclickcount_en: 0 }];
    }
    if (formData.whatsapp) {
      serviceData.whatsappdata = [{ whatsapp_sor: formData.whatsapp, whatsapp_bad: formData.whatsapp, whatsapp_ar: formData.whatsapp, whatsapp_en: formData.whatsapp, whatsapptext_sor: formData.whatsappText, whatsapptext_bad: formData.whatsappText, whatsapptext_ar: formData.whatsappText, whatsapptext_en: formData.whatsappText, whatsappclickcount_sor: 0, whatsappclickcount_bad: 0, whatsappclickcount_ar: 0, whatsappclickcount_en: 0 }];
    }
    if (formData.email) {
      serviceData.emaildata = [{ email_sor: formData.email, email_bad: formData.email, email_ar: formData.email, email_en: formData.email, emailtext_sor: formData.emailText, emailtext_bad: formData.emailText, emailtext_ar: formData.emailText, emailtext_en: formData.emailText, emailclickcount_sor: 0, emailclickcount_bad: 0, emailclickcount_ar: 0, emailclickcount_en: 0 }];
    }
    if (formData.facebook) {
      serviceData.facebookdata = [{ facebook_sor: formData.facebook, facebook_bad: formData.facebook, facebook_ar: formData.facebook, facebook_en: formData.facebook, facebooktext_sor: '', facebooktext_bad: '', facebooktext_ar: '', facebooktext_en: '', facebookclickcount_sor: 0, facebookclickcount_bad: 0, facebookclickcount_ar: 0, facebookclickcount_en: 0 }];
    }
    if (formData.instagram) {
      serviceData.instagramdata = [{ instagram_sor: formData.instagram, instagram_bad: formData.instagram, instagram_ar: formData.instagram, instagram_en: formData.instagram, instagramtext_sor: '', instagramtext_bad: '', instagramtext_ar: '', instagramtext_en: '', instagramclickcount_sor: 0, instagramclickcount_bad: 0, instagramclickcount_ar: 0, instagramclickcount_en: 0 }];
    }
    if (formData.website) {
      serviceData.websitedata = [{ website_sor: formData.website, website_bad: formData.website, website_ar: formData.website, website_en: formData.website, websitetext_sor: '', websitetext_bad: '', websitetext_ar: '', websitetext_en: '', websiteclickcount_sor: 0, websiteclickcount_bad: 0, websiteclickcount_ar: 0, websiteclickcount_en: 0 }];
    }

    // Remove temp fields
    ['phone','phoneText','whatsapp','whatsappText','email','emailText','facebook','instagram','website'].forEach(k => delete serviceData[k]);

    return serviceData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const serviceData = buildServiceData(formData);
      const fn = httpsCallable(functions, 'createOrUpdateService');
      const result = await fn({
        id: editingService?.id || null,
        serviceData,
      });
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
              const indent = (level - 1) * 16; // 16px per level
              return (
                <div key={level} className="mt-2 flex items-center gap-2" style={{ paddingLeft: `${indent}px` }}>
                  {/* Connector arrow for levels > 1 */}
                  {level > 1 && (
                    <span className="text-gray-300 text-xs shrink-0 -ml-4">↳</span>
                  )}
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
                      <button
                        onClick={() => handleDdSelect(level, '')}
                        className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        title={`Clear`}
                      >
                        <FiX size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {/* Clear all — shown only when any dd active */}
            {Object.values(ddSelections).some(Boolean) && (
              <div className="mt-2 flex justify-end">
                <button onClick={clearDdFilters} className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1">
                  <FiX size={12} /> Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Result count + divider */}
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

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
              <button onClick={handleCloseModal} title="Close"><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select value={formData.categoryref} onChange={(e) => setFormData({ ...formData, categoryref: e.target.value })} className="select" required>
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name_sor || cat.name_en || cat.id}</option>
                    ))}
                  </select>
                </div>

                <LanguageTabs>
                  {(lang) => (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Service Name ({lang.toUpperCase()}) *</label>
                        <input type="text" value={formData[`name_${lang}`]} onChange={(e) => setFormData({ ...formData, [`name_${lang}`]: e.target.value })} className="input" placeholder="Service name" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Job Title ({lang.toUpperCase()})</label>
                        <input type="text" value={formData[`jobtitle_${lang}`]} onChange={(e) => setFormData({ ...formData, [`jobtitle_${lang}`]: e.target.value })} className="input" placeholder="Job title" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description ({lang.toUpperCase()})</label>
                        <textarea value={formData[`job_${lang}`]} onChange={(e) => setFormData({ ...formData, [`job_${lang}`]: e.target.value })} className="textarea" rows="3" placeholder="Service description" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image URL ({lang.toUpperCase()})</label>
                        <input type="url" value={formData[`image_${lang}`]} onChange={(e) => setFormData({ ...formData, [`image_${lang}`]: e.target.value })} className="input" placeholder="https://example.com/image.png" />
                        {formData[`image_${lang}`] && <div className="mt-2"><img src={formData[`image_${lang}`]} alt="Preview" className="w-32 h-32 object-cover rounded" /></div>}
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" id={`vis_${lang}`} checked={formData[`visibility_${lang}`]} onChange={(e) => setFormData({ ...formData, [`visibility_${lang}`]: e.target.checked })} className="w-4 h-4 text-primary rounded" />
                        <label htmlFor={`vis_${lang}`} className="text-sm font-medium text-gray-700">Visible in {lang.toUpperCase()}</label>
                      </div>
                    </div>
                  )}
                </LanguageTabs>

                <div className="mt-8 border-t pt-6">
                  <h3 className="text-lg font-bold mb-4">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label><input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input" placeholder="07501234567" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Phone Label</label><input type="text" value={formData.phoneText} onChange={(e) => setFormData({ ...formData, phoneText: e.target.value })} className="input" placeholder="Main Office" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label><input type="url" value={formData.whatsapp} onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })} className="input" placeholder="http://wa.me/9647501234567" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Label</label><input type="text" value={formData.whatsappText} onChange={(e) => setFormData({ ...formData, whatsappText: e.target.value })} className="input" placeholder="Customer Service" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" placeholder="info@example.com" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Email Label</label><input type="text" value={formData.emailText} onChange={(e) => setFormData({ ...formData, emailText: e.target.value })} className="input" placeholder="Info" /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Facebook URL</label><input type="url" value={formData.facebook} onChange={(e) => setFormData({ ...formData, facebook: e.target.value })} className="input" placeholder="https://facebook.com/..." /></div>
                    <div><label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label><input type="url" value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} className="input" placeholder="https://instagram.com/..." /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label><input type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} className="input" placeholder="https://example.com" /></div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={handleCloseModal} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editingService ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}