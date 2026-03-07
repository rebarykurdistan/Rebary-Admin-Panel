// NEW 10


'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { app } from '../../lib/firebase';
import { getAllCategories, getAllServices } from '../../lib/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import {
  FiPlus, FiTrash2, FiX, FiAlertCircle, FiRefreshCw,
  FiToggleLeft, FiToggleRight, FiArrowRight, FiShield, FiEdit2,
  FiChevronDown, FiChevronRight
} from 'react-icons/fi';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import toast from 'react-hot-toast';

const functions = getFunctions(app);
const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
const SUPER_ADMIN_UID   = process.env.NEXT_PUBLIC_SUPER_ADMIN_UID;

// ─── Role Change Dialog ───────────────────────────────────────────────────────
function RoleChangeDialog({ isOpen, onClose, onConfirm, email, oldRole, newRole }) {
  if (!isOpen) return null;
  const labels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };
  const colors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-bold">Confirm Role Change</h2>
          <button onClick={onClose} title="Close"><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
        </div>
        <div className="modal-body space-y-4">
          <p className="text-gray-700">Changing role for:</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm font-medium break-all">{email}</p>
          </div>
          <div className="flex items-center justify-center gap-4 py-2">
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[oldRole]}`}>{labels[oldRole]}</span>
            <FiArrowRight size={20} className="text-gray-400" />
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[newRole]}`}>{labels[newRole]}</span>
          </div>
          <p className="text-sm text-gray-500 text-center">Takes effect on their next login.</p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="btn btn-primary">Confirm Change</button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isSuperAdminRow(u) {
  return u.uid === SUPER_ADMIN_UID || u.email === SUPER_ADMIN_EMAIL;
}

function defaultAccess() {
  return {
    allCategories: false,
    allServices: false,
    categories: [],
    services: [],
    excludedCategories: [],
    excludedServices: [],
  };
}

// Safely extract category ID from string, path, or Firestore DocumentReference
function extractCatId(ref) {
  if (!ref) return null;
  if (typeof ref === 'object' && ref.id) return ref.id;
  if (typeof ref === 'object' && ref.path) return ref.path.split('/').pop();
  if (typeof ref === 'string') return ref.includes('/') ? ref.split('/').pop() : ref;
  return null;
}

// ─── Access Selector ──────────────────────────────────────────────────────────
//
// Access object shape:
//   allServices:        bool    — grants every service; use excludedServices to carve out exceptions
//   allCategories:      bool    — admin only; grants every category; use excludedCategories for exceptions
//   services:           string[] — explicit service IDs allowed (manual selection)
//   categories:         string[] — explicit category IDs allowed (admin, manual selection)
//   excludedServices:   string[] — only used when allServices=true OR allCategories=true
//   excludedCategories: string[] — only used when allCategories=true
//
// The two modes are mutually exclusive per dimension:
//   "bulk" mode:   allServices/allCategories=true  → exclusions apply
//   "manual" mode: allServices/allCategories=false → services[]/categories[] apply
//
// Never mix: a service should not appear in both services[] and excludedServices[].

function AccessSelector({ role, access, onChange, categories, services }) {
  const [expandedCats, setExpandedCats] = useState({});

  if (role === 'super_admin') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
        Super Admin has unrestricted access to everything.
      </div>
    );
  }

  // Group services by category
  const servicesByCat = categories.reduce((acc, cat) => {
    acc[cat.id] = services.filter(s => extractCatId(s.categoryref) === cat.id);
    return acc;
  }, {});

  const toggleExpand = (catId) =>
    setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));

  // ─── Read helpers ────────────────────────────────────────────────────────────

  // Is this service effectively granted access?
  // Order of checks matters:
  //   1. allServices bulk mode — only excludedServices can deny
  //   2. Explicit per-service exclusion always wins (used when allCategories=true and svc unchecked)
  //   3. Explicit service grant (manual selection or synced from category toggle)
  //   4. allCategories bulk mode — category-level grant (only if svc not explicitly excluded above)
  //   5. Manual mode — no category inheritance; service must be in services[]
  const isServiceChecked = (svcId, parentCatId) => {
    const exclSvcs = access.excludedServices || [];
    if (access.allServices) {
      return !exclSvcs.includes(svcId);
    }
    if (exclSvcs.includes(svcId)) return false;
    if ((access.services || []).includes(svcId)) return true;
    if (role === 'admin' && access.allCategories) {
      return !(access.excludedCategories || []).includes(parentCatId);
    }
    return false;
  };

  // Is this category effectively granted access? (admin only)
  const isCategoryChecked = (catId) => {
    if (access.allCategories) {
      return !(access.excludedCategories || []).includes(catId);
    }
    return (access.categories || []).includes(catId);
  };

  // Should the category checkbox show the indeterminate dash?
  // Rules:
  //   - No services checked → no dash (empty)
  //   - allServices=true and all services covered → no dash (fully on via bulk)
  //   - Category explicitly checked and all its services on → no dash (fully on)
  //   - All services on manually (in services[]) but category not checked → dash
  //   - Some services on, some off → dash
  //   - Category checked but some services excluded → dash
  const isCategoryIndeterminate = (catId) => {
    const catSvcs = servicesByCat[catId] || [];
    if (catSvcs.length === 0) return false;
    const checkedCount = catSvcs.filter(s => isServiceChecked(s.id, catId)).length;
    if (checkedCount === 0) return false;
    if (access.allServices && checkedCount === catSvcs.length) return false;
    if (isCategoryChecked(catId) && checkedCount === catSvcs.length) return false;
    return true;
  };

  // ─── Write handlers ──────────────────────────────────────────────────────────

  // Toggle the "All Services" master switch.
  // Turning it ON resets everything to a clean "all granted" state.
  // Turning it OFF resets to a clean "nothing granted" state.
  const handleAllServices = (checked) => {
    onChange({
      ...defaultAccess(),
      allServices: checked,
      // preserve allCategories setting for admin if it was already on
      allCategories: role === 'admin' ? access.allCategories : false,
    });
  };

  // Toggle the "All Categories" master switch (admin only).
  const handleAllCategories = (checked) => {
    onChange({
      ...access,
      allCategories: checked,
      excludedCategories: [],
      categories: [],
      // when turning allCategories ON, also clear manual service selections to avoid confusion
      services: checked ? [] : access.services,
      excludedServices: checked ? [] : access.excludedServices,
    });
  };

  // Toggle a single service checkbox.
  //
  // Three possible states to be in when this fires:
  //   1. allServices=true   → work with excludedServices[]
  //   2. allCategories=true and category not excluded → work with excludedServices[]
  //   3. Everything else (manual mode) → work with services[]
  const handleServiceToggle = (svcId, parentCatId, checked) => {
    const a = { ...access };

    if (a.allServices) {
      // Bulk-services mode: unchecking = add to exclusions, checking = remove from exclusions
      const excl = new Set(a.excludedServices || []);
      checked ? excl.delete(svcId) : excl.add(svcId);
      onChange({ ...a, excludedServices: [...excl] });

    } else if (role === 'admin' && a.allCategories && !(a.excludedCategories || []).includes(parentCatId)) {
      // Bulk-categories mode (category is active): same exclusion approach
      const excl = new Set(a.excludedServices || []);
      checked ? excl.delete(svcId) : excl.add(svcId);
      onChange({ ...a, excludedServices: [...excl] });

    } else {
      // Manual mode: add/remove directly from services[]
      const svcs = new Set(a.services || []);
      checked ? svcs.add(svcId) : svcs.delete(svcId);
      onChange({ ...a, services: [...svcs] });
    }
  };

  // Toggle a whole category checkbox (admin only).
  //
  // Two possible states:
  //   1. allCategories=true → work with excludedCategories[] and excludedServices[]
  //   2. Manual mode → work with categories[] and services[]
  const handleCategoryToggle = (catId, checked) => {
    const a = { ...access };
    const catSvcIds = (servicesByCat[catId] || []).map(s => s.id);

    if (a.allCategories) {
      // Bulk mode: toggle category exclusion and sync service exclusions
      const exclCats = new Set(a.excludedCategories || []);
      const exclSvcs = new Set(a.excludedServices || []);
      if (checked) {
        exclCats.delete(catId);
        catSvcIds.forEach(id => exclSvcs.delete(id));
      } else {
        exclCats.add(catId);
        catSvcIds.forEach(id => exclSvcs.add(id));
      }
      onChange({ ...a, excludedCategories: [...exclCats], excludedServices: [...exclSvcs] });

    } else {
      // Manual mode: toggle category and sync its services into services[]
      const cats = new Set(a.categories || []);
      const svcs = new Set(a.services || []);
      if (checked) {
        cats.add(catId);
        catSvcIds.forEach(id => svcs.add(id));
      } else {
        cats.delete(catId);
        catSvcIds.forEach(id => svcs.delete(id));
      }
      onChange({ ...a, categories: [...cats], services: [...svcs] });
    }
  };

  // Select all / deselect all services within a single category (editor only — admin uses category checkbox).
  const handleCategorySelectAll = (catId, selectAll) => {
    const catSvcIds = (servicesByCat[catId] || []).map(s => s.id);
    if (catSvcIds.length === 0) return;
    const a = { ...access };

    if (a.allServices) {
      // Bulk mode: remove from or add to exclusions
      const excl = new Set(a.excludedServices || []);
      selectAll
        ? catSvcIds.forEach(id => excl.delete(id))
        : catSvcIds.forEach(id => excl.add(id));
      onChange({ ...a, excludedServices: [...excl] });
    } else {
      // Manual mode
      const svcs = new Set(a.services || []);
      selectAll
        ? catSvcIds.forEach(id => svcs.add(id))
        : catSvcIds.forEach(id => svcs.delete(id));
      onChange({ ...a, services: [...svcs] });
    }
  };

  // ─── Summary counts ──────────────────────────────────────────────────────────

  const effectiveServiceCount = (() => {
    if (access.allServices) {
      return services.length - (access.excludedServices?.length || 0);
    }
    // Use Set to deduplicate services that are accessible via multiple paths
    const granted = new Set();
    services.forEach(s => {
      if (isServiceChecked(s.id, extractCatId(s.categoryref))) granted.add(s.id);
    });
    return granted.size;
  })();

  const effectiveCatCount = role === 'admin'
    ? access.allCategories
      ? categories.length - (access.excludedCategories?.length || 0)
      : (access.categories?.length || 0)
    : null;

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">

      {/* All Services toggle */}
      <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
        access.allServices ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:border-blue-200'
      }`}>
        <input
          type="checkbox"
          checked={access.allServices || false}
          onChange={e => handleAllServices(e.target.checked)}
          className="w-4 h-4 text-primary rounded"
        />
        <div>
          <p className="text-sm font-semibold text-gray-800">All Services</p>
          <p className="text-xs text-gray-500">Grant access to every service. Uncheck individual ones below if needed.</p>
        </div>
      </label>

      {/* All Categories toggle — admin only */}
      {role === 'admin' && (
        <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
          access.allCategories ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:border-green-200'
        }`}>
          <input
            type="checkbox"
            checked={access.allCategories || false}
            onChange={e => handleAllCategories(e.target.checked)}
            className="w-4 h-4 text-primary rounded"
          />
          <div>
            <p className="text-sm font-semibold text-gray-800">All Categories</p>
            <p className="text-xs text-gray-500">Grant access to every category. Uncheck individual ones below if needed.</p>
          </div>
        </label>
      )}

      {/* Category / Service tree */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">
            {role === 'admin' ? 'Categories & Services' : 'Services by Category'}
          </p>
          <p className="text-xs text-gray-400">Click category to expand</p>
        </div>

        <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
          {categories.map(cat => {
            const catSvcs        = servicesByCat[cat.id] || [];
            const catChecked     = isCategoryChecked(cat.id);
            const catIndet       = isCategoryIndeterminate(cat.id);
            const isExpanded     = expandedCats[cat.id];
            const checkedCount   = catSvcs.filter(s => isServiceChecked(s.id, cat.id)).length;
            const someChecked    = checkedCount > 0 && checkedCount < catSvcs.length;

            return (
              <div key={cat.id}>
                {/* Category row */}
                <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50">
                  <button
                    type="button"
                    onClick={() => toggleExpand(cat.id)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    title={isExpanded ? 'Collapse' : 'Expand'}
                  >
                    {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
                  </button>

                  {/* Category checkbox — admin only */}
                  {role === 'admin' && (
                    <input
                      type="checkbox"
                      checked={catChecked}
                      ref={el => { if (el) el.indeterminate = catIndet || someChecked; }}
                      onChange={e => handleCategoryToggle(cat.id, e.target.checked)}
                      className="w-4 h-4 text-primary rounded flex-shrink-0"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => toggleExpand(cat.id)}
                    className="flex-1 text-left"
                  >
                    <span className="text-sm font-medium text-gray-800">
                      {cat.name_sor || cat.name_en || cat.id}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">
                      {checkedCount}/{catSvcs.length} services
                    </span>
                  </button>
                </div>

                {/* Expanded service list */}
                {isExpanded && (
                  <div className="bg-gray-50 border-t border-gray-100">
                    {catSvcs.length === 0 ? (
                      <p className="text-xs text-gray-400 italic px-10 py-2">No services in this category</p>
                    ) : (
                      <>
                        {/* Select all / Deselect all — editor only (admin uses category checkbox) */}
                        {role === 'editor' && (
                          <div className="flex items-center justify-between px-10 py-1.5 border-b border-gray-200 bg-gray-100">
                            <span className="text-xs text-gray-500">{checkedCount}/{catSvcs.length} selected</span>
                            <div className="flex gap-2">
                              {checkedCount < catSvcs.length && (
                                <button
                                  type="button"
                                  onClick={() => handleCategorySelectAll(cat.id, true)}
                                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Select all
                                </button>
                              )}
                              {checkedCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => handleCategorySelectAll(cat.id, false)}
                                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                                >
                                  Deselect all
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {catSvcs.map(svc => (
                          <label
                            key={svc.id}
                            className="flex items-center gap-2 px-10 py-2 hover:bg-gray-100 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isServiceChecked(svc.id, cat.id)}
                              onChange={e => handleServiceToggle(svc.id, cat.id, e.target.checked)}
                              className="w-4 h-4 text-primary rounded flex-shrink-0"
                            />
                            <span className="text-sm text-gray-700">
                              {svc.name_sor || svc.name_en || svc.id}
                            </span>
                          </label>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2 text-xs">
        <span className={`px-2 py-1 rounded-full font-medium ${
          effectiveServiceCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
        }`}>
          {access.allServices
            ? `All services${(access.excludedServices?.length || 0) > 0 ? ` (−${access.excludedServices.length} excluded)` : ''}`
            : `${effectiveServiceCount} service(s) selected`}
        </span>
        {role === 'admin' && (
          <span className={`px-2 py-1 rounded-full font-medium ${
            (effectiveCatCount || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
          }`}>
            {access.allCategories
              ? `All categories${(access.excludedCategories?.length || 0) > 0 ? ` (−${access.excludedCategories.length} excluded)` : ''}`
              : `${effectiveCatCount} category(s) selected`}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function UsersPage() {
  const { user } = useAuth();
  const [showModal, setShowModal]           = useState(false);
  const [users, setUsers]                   = useState([]);
  const [categories, setCategories]         = useState([]);
  const [services, setServices]             = useState([]);
  const [loading, setLoading]               = useState(false);
  const [deleteDialog, setDeleteDialog]     = useState({ isOpen: false, uid: null, email: null });
  const [roleDialog, setRoleDialog]         = useState({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null });
  const [editAccessUser, setEditAccessUser] = useState(null);
  const [formData, setFormData]             = useState({ email: '', password: '', role: 'editor', displayName: '' });
  const [accessData, setAccessData]         = useState(defaultAccess());

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => {
    if (isSuperAdmin) { loadUsers(); loadMeta(); }
  }, [isSuperAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const r = await httpsCallable(functions, 'listAdminUsers')();
      if (r.data.success) setUsers(r.data.users);
    } catch (e) {
      toast.error(e.code === 'functions/unauthenticated'
        ? 'Auth error — please log out and back in.'
        : 'Failed to load users: ' + e.message);
    } finally { setLoading(false); }
  };

  const loadMeta = async () => {
    try {
      const [cats, svcs] = await Promise.all([getAllCategories(), getAllServices()]);
      setCategories(cats);
      setServices(svcs);
    } catch (e) { console.error('Failed to load meta:', e); }
  };

  const handleGeneratePassword = () => {
    const ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pw = '';
    for (let i = 0; i < 12; i++) pw += ch[Math.floor(Math.random() * ch.length)];
    setFormData(f => ({ ...f, password: pw }));
    toast.success('Password generated!');
  };

  const handleRoleChange = (newRole) => {
    setFormData(f => ({ ...f, role: newRole }));
    setAccessData(defaultAccess());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await httpsCallable(functions, 'createUserWithRole')({ ...formData, access: accessData });
      if (r.data.success) {
        toast.success('User created!');
        setShowModal(false);
        setFormData({ email: '', password: '', role: 'editor', displayName: '' });
        setAccessData(defaultAccess());
        await loadUsers();
      }
    } catch (e) {
      toast.error(e.message || 'Failed to create user');
    } finally { setLoading(false); }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    try {
      const r = await httpsCallable(functions, 'deleteUser')({ uid: deleteDialog.uid });
      if (r.data.success) { toast.success('User deleted!'); await loadUsers(); }
    } catch (e) { toast.error(e.message || 'Failed to delete user'); }
    finally { setLoading(false); }
  };

  const handleRoleDropdownChange = (uid, email, oldRole, newRole) => {
    if (oldRole === newRole) return;
    setRoleDialog({ isOpen: true, uid, email, oldRole, newRole });
  };

  const handleConfirmRoleChange = async () => {
    setLoading(true);
    try {
      const r = await httpsCallable(functions, 'updateUserRole')({ uid: roleDialog.uid, role: roleDialog.newRole });
      if (r.data.success) { toast.success('Role updated!'); await loadUsers(); }
    } catch (e) { toast.error(e.message || 'Failed to update role'); }
    finally { setLoading(false); }
  };

  const handleToggleDisabled = async (uid, current) => {
    setLoading(true);
    try {
      const r = await httpsCallable(functions, 'toggleUserDisabled')({ uid, disabled: !current });
      if (r.data.success) { toast.success(`User ${!current ? 'disabled' : 'enabled'}!`); await loadUsers(); }
    } catch (e) { toast.error(e.message || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleSaveAccess = async () => {
    if (!editAccessUser) return;
    setLoading(true);
    try {
      const r = await httpsCallable(functions, 'updateUserAccess')({
        uid: editAccessUser.uid,
        access: editAccessUser.access,
      });
      if (r.data.success) {
        toast.success('Access updated!');
        setEditAccessUser(null);
        await loadUsers();
      }
    } catch (e) { toast.error(e.message || 'Failed to update access'); }
    finally { setLoading(false); }
  };

  const roleColors = {
    super_admin: 'bg-red-100 text-red-800',
    admin: 'bg-blue-100 text-blue-800',
    editor: 'bg-green-100 text-green-800',
  };
  const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };

  if (!isSuperAdmin) return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8">
          <div className="card text-center py-12">
            <FiAlertCircle className="mx-auto text-red-600 mb-4" size={48} />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-gray-600">Only the Super Admin can access User Management.</p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <main className="flex-1 lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8">

          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage admin users, roles, and access</p>
            </div>
            <div className="flex gap-2">
              <button onClick={loadUsers} className="btn btn-secondary flex items-center gap-2" disabled={loading}>
                <FiRefreshCw className={loading ? 'animate-spin' : ''} size={20} /> Refresh
              </button>
              <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
                <FiPlus size={20} /> Add New User
              </button>
            </div>
          </div>

          {/* Super Admin Card */}
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">Current Super Admin</h2>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
              <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{user?.email}</p>
                <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
                  Super Admin
                </span>
              </div>
              <div className="flex items-center gap-1 text-gray-400 text-xs">
                <FiShield size={14} /> Protected
              </div>
            </div>
          </div>

          {/* Users List */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Admin Users</h2>
              <span className="text-sm text-gray-500">{users.length} users</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users yet. Use "Add New User" to create one.
              </div>
            ) : (
              <div className="space-y-3">
                {users.map(u => {
                  const protected_ = isSuperAdminRow(u);
                  return (
                    <div
                      key={u.uid}
                      className={`p-4 rounded-lg border ${
                        protected_ ? 'bg-red-50 border-red-200'
                        : u.disabled ? 'bg-gray-100 border-gray-200 opacity-60'
                        : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        {/* User info */}
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                            protected_ ? 'bg-red-600' : u.disabled ? 'bg-gray-400' : 'bg-primary'
                          }`}>
                            {u.email?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-gray-900 text-sm">{u.email}</p>
                              {protected_ && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">
                                  <FiShield size={10} /> Protected
                                </span>
                              )}
                              {u.disabled && (
                                <span className="text-xs font-medium text-red-500">● Disabled</span>
                              )}
                            </div>
                            {u.displayName && <p className="text-xs text-gray-500">{u.displayName}</p>}
                            <p className="text-xs text-gray-400">
                              Created: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <select
                            value={u.role}
                            onChange={e => handleRoleDropdownChange(u.uid, u.email, u.role, e.target.value)}
                            className="select text-sm py-1 w-auto"
                            disabled={loading || protected_}
                            title={protected_ ? 'Super admin role is protected' : ''}
                          >
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                            <option value="super_admin">Super Admin</option>
                          </select>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role]}`}>
                            {roleLabels[u.role]}
                          </span>
                          {!protected_ && (
                            <button
                              onClick={() => setEditAccessUser({ ...u, access: u.access || defaultAccess() })}
                              className="p-2 hover:bg-blue-50 rounded text-blue-600"
                              title="Edit access"
                              disabled={loading}
                            >
                              <FiEdit2 size={15} />
                            </button>
                          )}
                          {!protected_ && (
                            <button
                              onClick={() => handleToggleDisabled(u.uid, u.disabled)}
                              className={`p-2 rounded ${u.disabled ? 'text-green-600 hover:bg-green-50' : 'text-yellow-600 hover:bg-yellow-50'}`}
                              disabled={loading}
                              title={u.disabled ? 'Enable user' : 'Disable user'}
                            >
                              {u.disabled ? <FiToggleLeft size={17} /> : <FiToggleRight size={17} />}
                            </button>
                          )}
                          {!protected_ ? (
                            <button
                              onClick={() => setDeleteDialog({ isOpen: true, uid: u.uid, email: u.email })}
                              className="p-2 hover:bg-red-50 rounded text-red-600"
                              disabled={loading}
                              title="Delete user"
                            >
                              <FiTrash2 size={15} />
                            </button>
                          ) : <div className="w-8" />}
                        </div>
                      </div>

                      {/* Access badges */}
                      {!protected_ && u.access && (
                        <div className="mt-2 flex flex-wrap gap-1.5 pl-12">
                          <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
                            {u.access.allServices
                              ? `All services${u.access.excludedServices?.length ? ` (−${u.access.excludedServices.length})` : ''}`
                              : `${(u.access.services || []).length} services`}
                          </span>
                          {u.role === 'admin' && (
                            <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">
                              {u.access.allCategories
                                ? `All categories${u.access.excludedCategories?.length ? ` (−${u.access.excludedCategories.length})` : ''}`
                                : `${(u.access.categories || []).length} categories`}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">Add New User</h2>
              <button onClick={() => setShowModal(false)} title="Close">
                <FiX size={24} className="text-gray-600 hover:text-gray-900" />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={e => setFormData(f => ({ ...f, displayName: e.target.value }))}
                    className="input"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.password}
                      onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
                      className="input flex-1"
                      required
                      minLength={6}
                    />
                    <button type="button" onClick={handleGeneratePassword} className="btn btn-secondary whitespace-nowrap">
                      Generate
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    value={formData.role}
                    onChange={e => handleRoleChange(e.target.value)}
                    className="select"
                    required
                  >
                    <option value="editor">Editor — Services only</option>
                    <option value="admin">Admin — Services + Categories</option>
                    <option value="super_admin">Super Admin — Full access</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Access Permissions</label>
                  <AccessSelector
                    role={formData.role}
                    access={accessData}
                    onChange={setAccessData}
                    categories={categories}
                    services={services}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Access Modal */}
      {editAccessUser && (
        <div className="modal-overlay" onClick={() => setEditAccessUser(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2 className="text-xl font-bold">Edit Access</h2>
                <p className="text-sm text-gray-500">{editAccessUser.email} · {roleLabels[editAccessUser.role]}</p>
              </div>
              <button onClick={() => setEditAccessUser(null)} title="Close">
                <FiX size={24} className="text-gray-600 hover:text-gray-900" />
              </button>
            </div>
            <div className="modal-body">
              <AccessSelector
                role={editAccessUser.role}
                access={editAccessUser.access}
                onChange={newAccess => setEditAccessUser(u => ({ ...u, access: newAccess }))}
                categories={categories}
                services={services}
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setEditAccessUser(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleSaveAccess} className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Access'}
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, uid: null, email: null })}
        onConfirm={handleDeleteUser}
        title="Delete User"
        message="This will permanently delete this user account."
        mode="email"
        email={deleteDialog.email}
      />
      <RoleChangeDialog
        isOpen={roleDialog.isOpen}
        onClose={() => setRoleDialog({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null })}
        onConfirm={handleConfirmRoleChange}
        email={roleDialog.email}
        oldRole={roleDialog.oldRole}
        newRole={roleDialog.newRole}
      />
    </ProtectedRoute>
  );
}