// NEW 9 — with infinite scroll, linkedJsonFiles, showcreatedate_*, categorytutorials

'use client';

import { useEffect, useRef, useState } from 'react';
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
  const f = {
    json_export_name: '',
    linkedJsonFiles: [],       // NEW — array of strings
    documenttagsdata: [],
    notifications: [],
    categorytutorials: [],     // NEW — array of maps
  };
  LANGS.forEach(l => {
    f[`name_${l}`]                  = '';
    f[`icon_${l}`]                  = '';
    f[`sortingorder_${l}`]          = '';
    f[`visibility_${l}`]            = true;
    f[`showcreatedate_${l}`]        = false;  // NEW
    f[`categorytags_${l}`]          = '';
    f[`reportingoptions_${l}`]      = '';
    f[`senderreportemail_${l}`]     = '';
    f[`receiverreportemail_${l}`]   = '';
    f[`sendingpass_${l}`]           = '';
    f[`searchwords_${l}`]           = '';
    f[`enablemapview_${l}`]         = false;
    f[`categoryinfo1_${l}`]         = '';
    f[`categoryinfo2_${l}`]         = '';
    f[`advertaisingdata_${l}`]      = '';
    f[`searchinfodocument_${l}`]    = '';
    f[`searchinfohome_${l}`]        = '';
    f[`sortingbynumber_${l}`]       = false;
    f[`shuffle_${l}`]               = false;
    f[`sortingbydate_${l}`]         = false;
  });
  return f;
}

// ── Timestamp helpers ──────────────────────────────────────────────────────────
function timestampToDateString(ts) {
  if (!ts) return '';
  try {
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toISOString().split('T')[0];
  } catch { return ''; }
}

function dateStringToTimestamp(str) {
  if (!str) return null;
  const d = new Date(str);
  if (isNaN(d.getTime())) return null;
  return Timestamp.fromDate(d);
}

// ── Safely read a Firestore array/map/string as comma-separated string ─────────
function toCSV(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return Object.values(value).join(', ');
  return String(value);
}

// ── Parse Firestore array field → string[] ─────────────────────────────────────
function parseStringArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'object') return Object.values(value).map(String).filter(Boolean);
  return [];
}

// ── Parse existing category into form state ────────────────────────────────────
function categoryToForm(cat) {
  const f = emptyForm();
  f.json_export_name = cat.json_export_name || '';

  // NEW: linkedJsonFiles
  f.linkedJsonFiles = parseStringArray(cat.linkedJsonFiles);

  LANGS.forEach(l => {
    f[`name_${l}`]               = cat[`name_${l}`]               || '';
    f[`icon_${l}`]               = cat[`icon_${l}`]               || '';
    f[`sortingorder_${l}`]       = cat[`sortingorder_${l}`]       ?? '';
    f[`visibility_${l}`]         = cat[`visibility_${l}`]         ?? true;
    f[`showcreatedate_${l}`]     = cat[`showcreatedate_${l}`]     ?? false;  // NEW
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
  if (Array.isArray(cat.documenttagsdata)) {
    f.documenttagsdata = cat.documenttagsdata.map(item => {
      const entry = {};
      LANGS.forEach(l => {
        entry[`documenttags_${l}`]    = item[`documenttags_${l}`]    || '';
        entry[`documenttagspic_${l}`] = item[`documenttagspic_${l}`] || '';
      });
      return entry;
    });
  }

  // notifications
  if (Array.isArray(cat.notifications)) {
    f.notifications = cat.notifications.map(n => {
      const entry = {};
      LANGS.forEach(l => {
        entry[`title_${l}`] = n[`title_${l}`] || '';
        entry[`body_${l}`]  = n[`body_${l}`]  || '';
        entry[`date_${l}`]  = timestampToDateString(n[`date_${l}`]);
      });
      return entry;
    });
  }

  // NEW: categorytutorials
  if (Array.isArray(cat.categorytutorials)) {
    f.categorytutorials = cat.categorytutorials.map(t => {
      const entry = {};
      LANGS.forEach(l => {
        entry[`gallery_${l}`] = t[`gallery_${l}`] || '';
        entry[`title_${l}`]   = t[`title_${l}`]   || '';
      });
      return entry;
    });
  }

  return f;
}

// ── Build Firestore categoryData from form state ───────────────────────────────
function formToCategoryData(f) {
  const data = { json_export_name: f.json_export_name };

  // NEW: linkedJsonFiles
  data.linkedJsonFiles = f.linkedJsonFiles || [];

  LANGS.forEach(l => {
    data[`name_${l}`]               = f[`name_${l}`];
    data[`icon_${l}`]               = f[`icon_${l}`];
    data[`sortingorder_${l}`]       = f[`sortingorder_${l}`] !== '' ? Number(f[`sortingorder_${l}`]) : 0;
    data[`visibility_${l}`]         = f[`visibility_${l}`];
    data[`showcreatedate_${l}`]     = f[`showcreatedate_${l}`];  // NEW
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
    data[`categorytags_${l}`]       = f[`categorytags_${l}`].split(',').map(s => s.trim()).filter(Boolean);
    data[`reportingoptions_${l}`]   = f[`reportingoptions_${l}`].split(',').map(s => s.trim()).filter(Boolean);
    data[`searchwords_${l}`]        = f[`searchwords_${l}`].split(',').map(s => s.trim()).filter(Boolean);
    data[`advertaisingdata_${l}`]   = f[`advertaisingdata_${l}`].split(',').map(s => s.trim()).filter(Boolean);
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

  // NEW: categorytutorials
  data.categorytutorials = (f.categorytutorials || []).map(t => {
    const item = {};
    LANGS.forEach(l => {
      item[`gallery_${l}`] = t[`gallery_${l}`] || '';
      item[`title_${l}`]   = t[`title_${l}`]   || '';
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
    LANGS.forEach(l => { entry[`title_${l}`] = ''; entry[`body_${l}`] = ''; entry[`date_${l}`] = ''; });
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
      <button type="button" onClick={addNotif} className="btn btn-secondary btn-sm w-full">+ Add Notification</button>
    </div>
  );
}

// ── NEW: Linked JSON Files Editor ──────────────────────────────────────────────
function LinkedJsonFilesEditor({ files, onChange }) {
  const addFile = () => onChange([...files, '']);
  const removeFile = (i) => onChange(files.filter((_, idx) => idx !== i));
  const updateFile = (i, value) => onChange(files.map((f, idx) => idx === i ? value : f));

  return (
    <div className="space-y-2">
      {files.map((file, i) => (
        <div key={i} className="flex gap-2 items-center">
          <input
            type="text"
            value={file}
            onChange={e => updateFile(i, e.target.value)}
            className="input flex-1 text-sm"
            placeholder="e.g. hospitals or ATM"
          />
          <button
            type="button"
            onClick={() => removeFile(i)}
            className="text-red-400 hover:text-red-600 px-2 shrink-0"
            title="Remove"
          >
            <FiX size={14} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addFile}
        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
      >
        <FiPlus size={12} /> Add JSON File
      </button>
    </div>
  );
}

// ── NEW: Category Tutorials Editor ─────────────────────────────────────────────
function CategoryTutorialsEditor({ tutorials, onChange }) {
  const emptyTutorial = () => {
    const entry = {};
    LANGS.forEach(l => { entry[`gallery_${l}`] = ''; entry[`title_${l}`] = ''; });
    return entry;
  };

  const addTutorial = () => onChange([...tutorials, emptyTutorial()]);
  const removeTutorial = (i) => onChange(tutorials.filter((_, idx) => idx !== i));
  const updateTutorial = (i, field, value) =>
    onChange(tutorials.map((t, idx) => idx === i ? { ...t, [field]: value } : t));

  return (
    <div className="space-y-3">
      {tutorials.map((tut, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500">Tutorial {i + 1}</span>
            <button type="button" onClick={() => removeTutorial(i)} className="text-red-500 hover:text-red-700 text-xs">Remove</button>
          </div>
          {LANGS.map(l => (
            <div key={l} className="border border-gray-100 rounded-lg p-3 bg-white space-y-2">
              <p className="text-xs font-semibold text-primary">{l.toUpperCase()}</p>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Title ({l.toUpperCase()})</label>
                <input
                  type="text"
                  value={tut[`title_${l}`] || ''}
                  onChange={e => updateTutorial(i, `title_${l}`, e.target.value)}
                  className="input text-sm py-1"
                  placeholder="Tutorial title"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Gallery URL ({l.toUpperCase()}) — image or video link</label>
                <input
                  type="text"
                  value={tut[`gallery_${l}`] || ''}
                  onChange={e => updateTutorial(i, `gallery_${l}`, e.target.value)}
                  className="input text-sm py-1"
                  placeholder="https://..."
                />
              </div>
            </div>
          ))}
        </div>
      ))}
      <button type="button" onClick={addTutorial} className="btn btn-secondary btn-sm w-full">
        + Add Tutorial
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
const PAGE_SIZE = 25;

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

  // ── NEW: Infinite scroll state ─────────────────────────────────────────────
  const [visibleCount, setVisibleCount]   = useState(PAGE_SIZE);
  const sentinelRef                       = useRef(null);

  useEffect(() => { if (canAccess('categories_new')) loadCategories(); }, []);
  useEffect(() => { filterCategories(); }, [searchTerm, categories]);

  // Reset visible count when search changes
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchTerm]);

  // IntersectionObserver — load next page when sentinel scrolls into view
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount(c => c + PAGE_SIZE);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [filteredCategories.length]);

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

  // ── Sliced list for infinite scroll display ──────────────────────────────────
  const displayedCategories = filteredCategories.slice(0, visibleCount);
  const hasMore = filteredCategories.length > visibleCount;

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
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
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

          {/* Count */}
          {!loading && (
            <div className="flex items-center gap-3 mb-4">
              <p className="text-sm text-gray-500 shrink-0">
                {searchTerm
                  ? `${filteredCategories.length} of ${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`
                  : `${categories.length} categor${categories.length !== 1 ? 'ies' : 'y'}`}
                {hasMore && (
                  <span className="text-gray-400"> — showing {visibleCount}</span>
                )}
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {displayedCategories.map(category => (
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
                      {category.documenttagsdata?.length > 0 && (
                        <p className="text-xs text-blue-600">{category.documenttagsdata.length} document tag{category.documenttagsdata.length !== 1 ? 's' : ''}</p>
                      )}
                      {category.categorytutorials?.length > 0 && (
                        <p className="text-xs text-purple-600">{category.categorytutorials.length} tutorial{category.categorytutorials.length !== 1 ? 's' : ''}</p>
                      )}
                      {category.linkedJsonFiles?.length > 0 && (
                        <p className="text-xs text-orange-500">{category.linkedJsonFiles.length} linked file{category.linkedJsonFiles.length !== 1 ? 's' : ''}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Invisible sentinel triggers next page on scroll ── */}
              {hasMore && (
                <div ref={sentinelRef} className="h-10 flex items-center justify-center mt-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary opacity-50" />
                </div>
              )}
            </>
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

                {/* NEW: Linked JSON Files */}
                <Section title="🔗 Linked JSON Files">
                  <p className="text-xs text-gray-500 -mt-2">
                    Additional JSON export names linked to this category (same format as JSON Export Name above).
                  </p>
                  <LinkedJsonFilesEditor
                    files={formData.linkedJsonFiles}
                    onChange={files => setField('linkedJsonFiles', files)}
                  />
                </Section>

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

                {/* Visibility & Sorting — showcreatedate_* added here */}
                <Section title="👁️ Visibility & Sorting">
                  <LanguageTabs>
                    {lang => (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Sorting Order ({lang.toUpperCase()})</label>
                          <input type="number" value={formData[`sortingorder_${lang}`]} onChange={e => setField(`sortingorder_${lang}`, e.target.value)} className="input" placeholder="0" />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { key: `visibility_${lang}`,         label: 'Visible'           },
                            { key: `enablemapview_${lang}`,      label: 'Enable Map View'   },
                            { key: `sortingbynumber_${lang}`,    label: 'Sort by Number'    },
                            { key: `sortingbydate_${lang}`,      label: 'Sort by Date'      },
                            { key: `shuffle_${lang}`,            label: 'Shuffle'           },
                            { key: `showcreatedate_${lang}`,     label: 'Show Create Date'  }, // NEW
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
                  <p className="text-xs text-gray-500 -mt-2 mb-2">
                    Scrollable tag chips shown at the top of the services list. Each tag has a name and optional image per language.
                  </p>
                  <DocumentTagsEditor
                    tags={formData.documenttagsdata}
                    onChange={tags => setField('documenttagsdata', tags)}
                  />
                </Section>

                {/* NEW: Category Tutorials */}
                <Section title="🎓 Category Tutorials">
                  <p className="text-xs text-gray-500 -mt-2 mb-2">
                    Tutorial entries shown in the app. Each has a title and a gallery URL (image or video) per language.
                  </p>
                  <CategoryTutorialsEditor
                    tutorials={formData.categorytutorials}
                    onChange={tutorials => setField('categorytutorials', tutorials)}
                  />
                </Section>

                {/* Notifications */}
                <Section title="🔔 Notifications">
                  <p className="text-xs text-gray-500 -mt-2 mb-2">
                    Push notifications associated with this category. Each has a title, body, and date per language.
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
