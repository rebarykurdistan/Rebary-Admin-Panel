'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function UsersPage() {
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'editor',
  });

  const isSuperAdmin = user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

  useEffect(() => {
    if (isSuperAdmin) {
      loadUsers();
    }
  }, [isSuperAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const functions = getFunctions();
      const listAdminUsers = httpsCallable(functions, 'listAdminUsers');
      const result = await listAdminUsers();
      
      if (result.data.success) {
        setUsers(result.data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      if (error.code === 'functions/not-found') {
        toast.error('Cloud Functions not deployed yet. See instructions below.');
      } else {
        toast.error('Failed to load users: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
    toast.success('Password generated!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const functions = getFunctions();
      const createUserWithRole = httpsCallable(functions, 'createUserWithRole');
      
      const result = await createUserWithRole({
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      if (result.data.success) {
        toast.success('User created successfully!');
        setShowModal(false);
        setFormData({ email: '', password: '', role: 'editor' });
        await loadUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      
      if (error.code === 'functions/not-found') {
        toast.error('Cloud Functions not deployed. Run: firebase deploy --only functions');
      } else if (error.code === 'functions/permission-denied') {
        toast.error('Only Super Admins can create users');
      } else {
        toast.error(error.message || 'Failed to create user');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (uid, email) => {
    if (!confirm(`Delete user ${email}?`)) return;

    setLoading(true);
    try {
      const functions = getFunctions();
      const deleteUserFunc = httpsCallable(functions, 'deleteUser');
      
      const result = await deleteUserFunc({ uid });

      if (result.data.success) {
        toast.success('User deleted successfully!');
        await loadUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (uid, currentEmail, newRole) => {
    setLoading(true);
    try {
      const functions = getFunctions();
      const updateUserRole = httpsCallable(functions, 'updateUserRole');
      
      const result = await updateUserRole({ uid, role: newRole });

      if (result.data.success) {
        toast.success('Role updated successfully!');
        await loadUsers();
      }
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error(error.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-gray-50">
          <Sidebar />
          <main className="flex-1 lg:ml-64 p-4 lg:p-8">
            <div className="card text-center py-12">
              <FiAlertCircle className="mx-auto text-red-600 mb-4" size={48} />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">Only the Super Admin can access User Management.</p>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const roleColors = {
    super_admin: 'bg-red-100 text-red-800',
    admin: 'bg-blue-100 text-blue-800',
    editor: 'bg-green-100 text-green-800',
  };

  const roleLabels = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    editor: 'Editor',
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        
        <main className="flex-1 lg:ml-64 p-4 lg:p-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage admin users and roles</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadUsers}
                className="btn btn-secondary flex items-center gap-2"
                disabled={loading}
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} size={20} />
                Refresh
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <FiPlus size={20} />
                Add New User
              </button>
            </div>
          </div>

          {/* Setup Instructions (show if no functions deployed) */}
          {users.length === 0 && !loading && (
            <div className="card bg-yellow-50 border-yellow-200 mb-6">
              <div className="flex gap-3">
                <FiAlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Cloud Functions Setup</h3>
                  <p className="text-sm text-gray-700 mb-3">
                    To use User Management, deploy the Cloud Functions:
                  </p>
                  <div className="bg-gray-900 text-white p-3 rounded text-sm font-mono mb-3">
                    cd functions<br/>
                    npm install<br/>
                    firebase deploy --only functions
                  </div>
                  <p className="text-sm text-gray-700">
                    📚 Complete code is in <code className="bg-gray-200 px-1 rounded">functions/index.js</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Current Super Admin */}
          <div className="card mb-6">
            <h2 className="text-xl font-bold mb-4">Current Super Admin</h2>
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
              <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">
                {user?.email?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{user?.email}</p>
                <p className="text-sm text-gray-600">UID: {process.env.NEXT_PUBLIC_SUPER_ADMIN_UID}</p>
                <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
                  Super Admin
                </span>
              </div>
            </div>
          </div>

          {/* Admin Users List */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Admin Users</h2>
              <span className="text-sm text-gray-600">{users.length} users</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : users.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No additional users yet. Create users using the "Add New User" button.
              </p>
            ) : (
              <div className="space-y-3">
                {users.map((userItem) => (
                  <div key={userItem.uid} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                        {userItem.email?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{userItem.email}</p>
                        <p className="text-xs text-gray-500">Created: {new Date(userItem.creationTime).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={userItem.role}
                        onChange={(e) => handleChangeRole(userItem.uid, userItem.email, e.target.value)}
                        className="select text-sm py-1"
                        disabled={loading}
                      >
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[userItem.role]}`}>
                        {roleLabels[userItem.role]}
                      </span>
                      <button
                        onClick={() => handleDeleteUser(userItem.uid, userItem.email)}
                        className="p-2 hover:bg-red-50 rounded text-red-600"
                        disabled={loading}
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">Add New User</h2>
              <button onClick={() => setShowModal(false)}>
                <FiX size={24} className="text-gray-600 hover:text-gray-900" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="input flex-1"
                      placeholder="Enter password"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="btn btn-secondary whitespace-nowrap"
                    >
                      Generate
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 6 characters
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="select"
                    required
                  >
                    <option value="editor">Editor (Services only)</option>
                    <option value="admin">Admin (Services + Categories)</option>
                    <option value="super_admin">Super Admin (Full access)</option>
                  </select>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                  <p className="font-medium text-blue-900 mb-2">Role Permissions:</p>
                  <ul className="space-y-1 text-blue-800">
                    <li><strong>Editor:</strong> Services only</li>
                    <li><strong>Admin:</strong> Services + Categories</li>
                    <li><strong>Super Admin:</strong> All + User Management</li>
                  </ul>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
