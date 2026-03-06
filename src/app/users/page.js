// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import { FiPlus, FiEdit2, FiTrash2, FiX, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// export default function UsersPage() {
//   const { user } = useAuth();
//   const [showModal, setShowModal] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     role: 'editor',
//   });

//   const isSuperAdmin = user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

//   useEffect(() => {
//     if (isSuperAdmin) {
//       loadUsers();
//     }
//   }, [isSuperAdmin]);

//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const functions = getFunctions();
//       const listAdminUsers = httpsCallable(functions, 'listAdminUsers');
//       const result = await listAdminUsers();
      
//       if (result.data.success) {
//         setUsers(result.data.users);
//       }
//     } catch (error) {
//       console.error('Error loading users:', error);
//       if (error.code === 'functions/not-found') {
//         toast.error('Cloud Functions not deployed yet. See instructions below.');
//       } else {
//         toast.error('Failed to load users: ' + error.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGeneratePassword = () => {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
//     let password = '';
//     for (let i = 0; i < 12; i++) {
//       password += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     setFormData({ ...formData, password });
//     toast.success('Password generated!');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const functions = getFunctions();
//       const createUserWithRole = httpsCallable(functions, 'createUserWithRole');
      
//       const result = await createUserWithRole({
//         email: formData.email,
//         password: formData.password,
//         role: formData.role,
//       });

//       if (result.data.success) {
//         toast.success('User created successfully!');
//         setShowModal(false);
//         setFormData({ email: '', password: '', role: 'editor' });
//         await loadUsers();
//       }
//     } catch (error) {
//       console.error('Error creating user:', error);
      
//       if (error.code === 'functions/not-found') {
//         toast.error('Cloud Functions not deployed. Run: firebase deploy --only functions');
//       } else if (error.code === 'functions/permission-denied') {
//         toast.error('Only Super Admins can create users');
//       } else {
//         toast.error(error.message || 'Failed to create user');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteUser = async (uid, email) => {
//     if (!confirm(`Delete user ${email}?`)) return;

//     setLoading(true);
//     try {
//       const functions = getFunctions();
//       const deleteUserFunc = httpsCallable(functions, 'deleteUser');
      
//       const result = await deleteUserFunc({ uid });

//       if (result.data.success) {
//         toast.success('User deleted successfully!');
//         await loadUsers();
//       }
//     } catch (error) {
//       console.error('Error deleting user:', error);
//       toast.error(error.message || 'Failed to delete user');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChangeRole = async (uid, currentEmail, newRole) => {
//     setLoading(true);
//     try {
//       const functions = getFunctions();
//       const updateUserRole = httpsCallable(functions, 'updateUserRole');
      
//       const result = await updateUserRole({ uid, role: newRole });

//       if (result.data.success) {
//         toast.success('Role updated successfully!');
//         await loadUsers();
//       }
//     } catch (error) {
//       console.error('Error updating role:', error);
//       toast.error(error.message || 'Failed to update role');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isSuperAdmin) {
//     return (
//       <ProtectedRoute>
//         <div className="flex min-h-screen bg-gray-50">
//           <Sidebar />
//           <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//             <div className="card text-center py-12">
//               <FiAlertCircle className="mx-auto text-red-600 mb-4" size={48} />
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
//               <p className="text-gray-600">Only the Super Admin can access User Management.</p>
//             </div>
//           </main>
//         </div>
//       </ProtectedRoute>
//     );
//   }

//   const roleColors = {
//     super_admin: 'bg-red-100 text-red-800',
//     admin: 'bg-blue-100 text-blue-800',
//     editor: 'bg-green-100 text-green-800',
//   };

//   const roleLabels = {
//     super_admin: 'Super Admin',
//     admin: 'Admin',
//     editor: 'Editor',
//   };

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
        
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//               <p className="text-gray-600 mt-1">Manage admin users and roles</p>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={loadUsers}
//                 className="btn btn-secondary flex items-center gap-2"
//                 disabled={loading}
//               >
//                 <FiRefreshCw className={loading ? 'animate-spin' : ''} size={20} />
//                 Refresh
//               </button>
//               <button
//                 onClick={() => setShowModal(true)}
//                 className="btn btn-primary flex items-center gap-2"
//               >
//                 <FiPlus size={20} />
//                 Add New User
//               </button>
//             </div>
//           </div>

//           {/* Setup Instructions (show if no functions deployed) */}
//           {users.length === 0 && !loading && (
//             <div className="card bg-yellow-50 border-yellow-200 mb-6">
//               <div className="flex gap-3">
//                 <FiAlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
//                 <div>
//                   <h3 className="font-bold text-gray-900 mb-2">Cloud Functions Setup</h3>
//                   <p className="text-sm text-gray-700 mb-3">
//                     To use User Management, deploy the Cloud Functions:
//                   </p>
//                   <div className="bg-gray-900 text-white p-3 rounded text-sm font-mono mb-3">
//                     cd functions<br/>
//                     npm install<br/>
//                     firebase deploy --only functions
//                   </div>
//                   <p className="text-sm text-gray-700">
//                     📚 Complete code is in <code className="bg-gray-200 px-1 rounded">functions/index.js</code>
//                   </p>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Current Super Admin */}
//           <div className="card mb-6">
//             <h2 className="text-xl font-bold mb-4">Current Super Admin</h2>
//             <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
//               <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">
//                 {user?.email?.[0]?.toUpperCase()}
//               </div>
//               <div className="flex-1">
//                 <p className="font-medium text-gray-900">{user?.email}</p>
//                 <p className="text-sm text-gray-600">UID: {process.env.NEXT_PUBLIC_SUPER_ADMIN_UID}</p>
//                 <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
//                   Super Admin
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Admin Users List */}
//           <div className="card">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold">Admin Users</h2>
//               <span className="text-sm text-gray-600">{users.length} users</span>
//             </div>

//             {loading ? (
//               <div className="flex items-center justify-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//               </div>
//             ) : users.length === 0 ? (
//               <p className="text-gray-600 text-center py-8">
//                 No additional users yet. Create users using the "Add New User" button.
//               </p>
//             ) : (
//               <div className="space-y-3">
//                 {users.map((userItem) => (
//                   <div key={userItem.uid} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
//                     <div className="flex items-center gap-4">
//                       <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
//                         {userItem.email?.[0]?.toUpperCase()}
//                       </div>
//                       <div>
//                         <p className="font-medium text-gray-900">{userItem.email}</p>
//                         <p className="text-xs text-gray-500">Created: {new Date(userItem.creationTime).toLocaleDateString()}</p>
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <select
//                         value={userItem.role}
//                         onChange={(e) => handleChangeRole(userItem.uid, userItem.email, e.target.value)}
//                         className="select text-sm py-1"
//                         disabled={loading}
//                       >
//                         <option value="editor">Editor</option>
//                         <option value="admin">Admin</option>
//                         <option value="super_admin">Super Admin</option>
//                       </select>
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[userItem.role]}`}>
//                         {roleLabels[userItem.role]}
//                       </span>
//                       <button
//                         onClick={() => handleDeleteUser(userItem.uid, userItem.email)}
//                         className="p-2 hover:bg-red-50 rounded text-red-600"
//                         disabled={loading}
//                       >
//                         <FiTrash2 size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Create User Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">Add New User</h2>
//               <button onClick={() => setShowModal(false)}>
//                 <FiX size={24} className="text-gray-600 hover:text-gray-900" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="modal-body">
//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Email Address *
//                   </label>
//                   <input
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     className="input"
//                     placeholder="admin@example.com"
//                     required
//                   />
//                 </div>

//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Password *
//                   </label>
//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       value={formData.password}
//                       onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                       className="input flex-1"
//                       placeholder="Enter password"
//                       required
//                       minLength={6}
//                     />
//                     <button
//                       type="button"
//                       onClick={handleGeneratePassword}
//                       className="btn btn-secondary whitespace-nowrap"
//                     >
//                       Generate
//                     </button>
//                   </div>
//                   <p className="text-xs text-gray-500 mt-1">
//                     Minimum 6 characters
//                   </p>
//                 </div>

//                 <div className="mb-4">
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Role *
//                   </label>
//                   <select
//                     value={formData.role}
//                     onChange={(e) => setFormData({ ...formData, role: e.target.value })}
//                     className="select"
//                     required
//                   >
//                     <option value="editor">Editor (Services only)</option>
//                     <option value="admin">Admin (Services + Categories)</option>
//                     <option value="super_admin">Super Admin (Full access)</option>
//                   </select>
//                 </div>

//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
//                   <p className="font-medium text-blue-900 mb-2">Role Permissions:</p>
//                   <ul className="space-y-1 text-blue-800">
//                     <li><strong>Editor:</strong> Services only</li>
//                     <li><strong>Admin:</strong> Services + Categories</li>
//                     <li><strong>Super Admin:</strong> All + User Management</li>
//                   </ul>
//                 </div>
//               </div>

//               <div className="modal-footer">
//                 <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>
//                   {loading ? 'Creating...' : 'Create User'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </ProtectedRoute>
//   );
// }












// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { app } from '../../lib/firebase';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import ConfirmDialog from '../../components/ConfirmDialog';
// import { FiPlus, FiTrash2, FiX, FiAlertCircle, FiRefreshCw, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// // Initialize functions with the Firebase app instance to ensure auth token is attached
// const functions = getFunctions(app);

// export default function UsersPage() {
//   const { user } = useAuth();
//   const [showModal, setShowModal] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, uid: null, email: null });
//   const [formData, setFormData] = useState({
//     email: '',
//     password: '',
//     role: 'editor',
//     displayName: '',
//   });

//   const isSuperAdmin = user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

//   useEffect(() => {
//     if (isSuperAdmin) {
//       loadUsers();
//     }
//   }, [isSuperAdmin]);

//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const listAdminUsers = httpsCallable(functions, 'listAdminUsers');
//       const result = await listAdminUsers();
//       if (result.data.success) {
//         setUsers(result.data.users);
//       }
//     } catch (error) {
//       console.error('Error loading users:', error);
//       if (error.code === 'functions/not-found') {
//         toast.error('Cloud Functions not deployed yet.');
//       } else if (error.code === 'functions/unauthenticated') {
//         toast.error('Authentication error. Please log out and log back in.');
//       } else {
//         toast.error('Failed to load users: ' + error.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGeneratePassword = () => {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
//     let password = '';
//     for (let i = 0; i < 12; i++) {
//       password += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     setFormData({ ...formData, password });
//     toast.success('Password generated!');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const createUserWithRole = httpsCallable(functions, 'createUserWithRole');
//       const result = await createUserWithRole({
//         email: formData.email,
//         password: formData.password,
//         role: formData.role,
//         displayName: formData.displayName,
//       });

//       if (result.data.success) {
//         toast.success('User created successfully!');
//         setShowModal(false);
//         setFormData({ email: '', password: '', role: 'editor', displayName: '' });
//         await loadUsers();
//       }
//     } catch (error) {
//       console.error('Error creating user:', error);
//       if (error.code === 'functions/not-found') {
//         toast.error('Cloud Functions not deployed. Run: firebase deploy --only functions');
//       } else if (error.code === 'functions/permission-denied') {
//         toast.error('Only Super Admins can create users');
//       } else if (error.code === 'functions/already-exists') {
//         toast.error('A user with this email already exists');
//       } else {
//         toast.error(error.message || 'Failed to create user');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteUser = async () => {
//     const { uid } = confirmDialog;
//     setLoading(true);
//     try {
//       const deleteUserFunc = httpsCallable(functions, 'deleteUser');
//       const result = await deleteUserFunc({ uid });
//       if (result.data.success) {
//         toast.success('User deleted successfully!');
//         await loadUsers();
//       }
//     } catch (error) {
//       toast.error(error.message || 'Failed to delete user');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChangeRole = async (uid, newRole) => {
//     setLoading(true);
//     try {
//       const updateUserRole = httpsCallable(functions, 'updateUserRole');
//       const result = await updateUserRole({ uid, role: newRole });
//       if (result.data.success) {
//         toast.success('Role updated successfully!');
//         await loadUsers();
//       }
//     } catch (error) {
//       toast.error(error.message || 'Failed to update role');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggleDisabled = async (uid, currentDisabled) => {
//     setLoading(true);
//     try {
//       const toggleUserDisabled = httpsCallable(functions, 'toggleUserDisabled');
//       const result = await toggleUserDisabled({ uid, disabled: !currentDisabled });
//       if (result.data.success) {
//         toast.success(`User ${!currentDisabled ? 'disabled' : 'enabled'} successfully!`);
//         await loadUsers();
//       }
//     } catch (error) {
//       toast.error(error.message || 'Failed to toggle user status');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isSuperAdmin) {
//     return (
//       <ProtectedRoute>
//         <div className="flex min-h-screen bg-gray-50">
//           <Sidebar />
//           <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//             <div className="card text-center py-12">
//               <FiAlertCircle className="mx-auto text-red-600 mb-4" size={48} />
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
//               <p className="text-gray-600">Only the Super Admin can access User Management.</p>
//             </div>
//           </main>
//         </div>
//       </ProtectedRoute>
//     );
//   }

//   const roleColors = {
//     super_admin: 'bg-red-100 text-red-800',
//     admin: 'bg-blue-100 text-blue-800',
//     editor: 'bg-green-100 text-green-800',
//   };

//   const roleLabels = {
//     super_admin: 'Super Admin',
//     admin: 'Admin',
//     editor: 'Editor',
//   };

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />

//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//               <p className="text-gray-600 mt-1">Manage admin users and roles</p>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={loadUsers}
//                 className="btn btn-secondary flex items-center gap-2"
//                 disabled={loading}
//               >
//                 <FiRefreshCw className={loading ? 'animate-spin' : ''} size={20} />
//                 Refresh
//               </button>
//               <button
//                 onClick={() => setShowModal(true)}
//                 className="btn btn-primary flex items-center gap-2"
//               >
//                 <FiPlus size={20} />
//                 Add New User
//               </button>
//             </div>
//           </div>

//           {/* Current Super Admin */}
//           <div className="card mb-6">
//             <h2 className="text-xl font-bold mb-4">Current Super Admin</h2>
//             <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
//               <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">
//                 {user?.email?.[0]?.toUpperCase()}
//               </div>
//               <div className="flex-1">
//                 <p className="font-medium text-gray-900">{user?.email}</p>
//                 <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
//                   Super Admin
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Admin Users List */}
//           <div className="card">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold">Admin Users</h2>
//               <span className="text-sm text-gray-600">{users.length} users</span>
//             </div>

//             {loading ? (
//               <div className="flex items-center justify-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//               </div>
//             ) : users.length === 0 ? (
//               <div className="text-center py-8">
//                 <p className="text-gray-600 mb-2">No additional users yet.</p>
//                 <p className="text-sm text-gray-400">Create users using the "Add New User" button.</p>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {users.map((userItem) => (
//                   <div
//                     key={userItem.uid}
//                     className={`flex items-center justify-between p-4 rounded-lg border ${
//                       userItem.disabled ? 'bg-gray-100 border-gray-300 opacity-60' : 'bg-gray-50 border-gray-200'
//                     }`}
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${userItem.disabled ? 'bg-gray-400' : 'bg-primary'}`}>
//                         {userItem.email?.[0]?.toUpperCase()}
//                       </div>
//                       <div>
//                         <p className="font-medium text-gray-900">{userItem.email}</p>
//                         {userItem.displayName && (
//                           <p className="text-xs text-gray-500">{userItem.displayName}</p>
//                         )}
//                         <p className="text-xs text-gray-400">
//                           Created: {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'N/A'}
//                         </p>
//                         {userItem.disabled && (
//                           <span className="text-xs font-medium text-red-600">● Disabled</span>
//                         )}
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2 flex-wrap justify-end">
//                       <select
//                         value={userItem.role}
//                         onChange={(e) => handleChangeRole(userItem.uid, e.target.value)}
//                         className="select text-sm py-1 w-auto"
//                         disabled={loading}
//                       >
//                         <option value="editor">Editor</option>
//                         <option value="admin">Admin</option>
//                         <option value="super_admin">Super Admin</option>
//                       </select>

//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[userItem.role]}`}>
//                         {roleLabels[userItem.role]}
//                       </span>

//                       {/* Disable/Enable Toggle */}
//                       <button
//                         onClick={() => handleToggleDisabled(userItem.uid, userItem.disabled)}
//                         className={`p-2 rounded transition-colors ${userItem.disabled ? 'hover:bg-green-50 text-green-600' : 'hover:bg-yellow-50 text-yellow-600'}`}
//                         title={userItem.disabled ? 'Enable user' : 'Disable user'}
//                         disabled={loading}
//                       >
//                         {userItem.disabled ? <FiToggleLeft size={18} /> : <FiToggleRight size={18} />}
//                       </button>

//                       <button
//                         onClick={() => setConfirmDialog({ isOpen: true, uid: userItem.uid, email: userItem.email })}
//                         className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors"
//                         disabled={loading}
//                         title="Delete user"
//                       >
//                         <FiTrash2 size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Create User Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">Add New User</h2>
//               <button onClick={() => setShowModal(false)}>
//                 <FiX size={24} className="text-gray-600 hover:text-gray-900" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit}>
//               <div className="modal-body space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Display Name
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.displayName}
//                     onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
//                     className="input"
//                     placeholder="John Doe"
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Email Address *
//                   </label>
//                   <input
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     className="input"
//                     placeholder="admin@example.com"
//                     required
//                   />
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Password *
//                   </label>
//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       value={formData.password}
//                       onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                       className="input flex-1"
//                       placeholder="Enter password"
//                       required
//                       minLength={6}
//                     />
//                     <button
//                       type="button"
//                       onClick={handleGeneratePassword}
//                       className="btn btn-secondary whitespace-nowrap"
//                     >
//                       Generate
//                     </button>
//                   </div>
//                   <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">
//                     Role *
//                   </label>
//                   <select
//                     value={formData.role}
//                     onChange={(e) => setFormData({ ...formData, role: e.target.value })}
//                     className="select"
//                     required
//                   >
//                     <option value="editor">Editor — Services only</option>
//                     <option value="admin">Admin — Services + Categories</option>
//                     <option value="super_admin">Super Admin — Full access</option>
//                   </select>
//                 </div>

//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
//                   <p className="font-medium text-blue-900 mb-2">Role Permissions:</p>
//                   <ul className="space-y-1 text-blue-800">
//                     <li><strong>Editor:</strong> Services only</li>
//                     <li><strong>Admin:</strong> Services + Categories</li>
//                     <li><strong>Super Admin:</strong> All + User Management</li>
//                   </ul>
//                 </div>
//               </div>

//               <div className="modal-footer">
//                 <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>
//                   {loading ? 'Creating...' : 'Create User'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Confirm Delete Dialog */}
//       <ConfirmDialog
//         isOpen={confirmDialog.isOpen}
//         onClose={() => setConfirmDialog({ isOpen: false, uid: null, email: null })}
//         onConfirm={handleDeleteUser}
//         title="Delete User"
//         message={`Are you sure you want to delete ${confirmDialog.email}? This action cannot be undone.`}
//         confirmText="Delete"
//         type="danger"
//       />
//     </ProtectedRoute>
//   );
// }


















// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { app } from '../../lib/firebase';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import { FiPlus, FiTrash2, FiX, FiAlertCircle, FiRefreshCw, FiToggleLeft, FiToggleRight, FiArrowRight } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);

// // ============================================
// // Type-to-Delete Dialog
// // ============================================
// function DeleteUserDialog({ isOpen, onClose, onConfirm, email }) {
//   const [typed, setTyped] = useState('');

//   if (!isOpen) return null;

//   const handleClose = () => {
//     setTyped('');
//     onClose();
//   };

//   const handleConfirm = () => {
//     setTyped('');
//     onConfirm();
//     onClose();
//   };

//   return (
//     <div className="modal-overlay" onClick={handleClose}>
//       <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
//               <FiTrash2 className="text-red-600" size={20} />
//             </div>
//             <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
//           </div>
//           <button onClick={handleClose}>
//             <FiX size={24} className="text-gray-600 hover:text-gray-900" />
//           </button>
//         </div>

//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">
//             This will permanently delete the user and revoke their access. This action <strong>cannot be undone.</strong>
//           </p>
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//             <p className="text-sm font-medium text-red-800 break-all">{email}</p>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Type the email address to confirm:
//             </label>
//             <input
//               type="text"
//               value={typed}
//               onChange={(e) => setTyped(e.target.value)}
//               className="input"
//               placeholder={email}
//               autoFocus
//             />
//           </div>
//         </div>

//         <div className="modal-footer">
//           <button onClick={handleClose} className="btn btn-secondary">Cancel</button>
//           <button
//             onClick={handleConfirm}
//             disabled={typed !== email}
//             className="btn btn-danger disabled:opacity-40 disabled:cursor-not-allowed"
//           >
//             Delete User
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ============================================
// // Role Change Confirmation Dialog
// // ============================================
// function RoleChangeDialog({ isOpen, onClose, onConfirm, email, oldRole, newRole }) {
//   if (!isOpen) return null;

//   const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };
//   const roleColors = {
//     super_admin: 'bg-red-100 text-red-800',
//     admin: 'bg-blue-100 text-blue-800',
//     editor: 'bg-green-100 text-green-800',
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <h2 className="text-xl font-bold text-gray-900">Confirm Role Change</h2>
//           <button onClick={onClose}>
//             <FiX size={24} className="text-gray-600 hover:text-gray-900" />
//           </button>
//         </div>

//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">You are about to change the role for:</p>
//           <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
//             <p className="text-sm font-medium text-gray-900 break-all">{email}</p>
//           </div>

//           {/* Old → New role visual */}
//           <div className="flex items-center justify-center gap-4 py-2">
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${roleColors[oldRole]}`}>
//               {roleLabels[oldRole]}
//             </span>
//             <FiArrowRight size={20} className="text-gray-400" />
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${roleColors[newRole]}`}>
//               {roleLabels[newRole]}
//             </span>
//           </div>

//           <p className="text-sm text-gray-500 text-center">
//             This will take effect on their next login.
//           </p>
//         </div>

//         <div className="modal-footer">
//           <button onClick={onClose} className="btn btn-secondary">Cancel</button>
//           <button onClick={() => { onConfirm(); onClose(); }} className="btn btn-primary">
//             Confirm Change
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ============================================
// // Main Users Page
// // ============================================
// export default function UsersPage() {
//   const { user } = useAuth();
//   const [showModal, setShowModal] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, uid: null, email: null });
//   const [roleDialog, setRoleDialog] = useState({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null });
//   const [formData, setFormData] = useState({ email: '', password: '', role: 'editor', displayName: '' });

//   const isSuperAdmin = user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;

//   useEffect(() => {
//     if (isSuperAdmin) loadUsers();
//   }, [isSuperAdmin]);

//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const listAdminUsers = httpsCallable(functions, 'listAdminUsers');
//       const result = await listAdminUsers();
//       if (result.data.success) setUsers(result.data.users);
//     } catch (error) {
//       if (error.code === 'functions/unauthenticated') {
//         toast.error('Authentication error. Please log out and log back in.');
//       } else {
//         toast.error('Failed to load users: ' + error.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGeneratePassword = () => {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
//     let password = '';
//     for (let i = 0; i < 12; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
//     setFormData({ ...formData, password });
//     toast.success('Password generated!');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const createUserWithRole = httpsCallable(functions, 'createUserWithRole');
//       const result = await createUserWithRole(formData);
//       if (result.data.success) {
//         toast.success('User created successfully!');
//         setShowModal(false);
//         setFormData({ email: '', password: '', role: 'editor', displayName: '' });
//         await loadUsers();
//       }
//     } catch (error) {
//       if (error.code === 'functions/already-exists') toast.error('A user with this email already exists');
//       else if (error.code === 'functions/permission-denied') toast.error('Only Super Admins can create users');
//       else toast.error(error.message || 'Failed to create user');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteUser = async () => {
//     setLoading(true);
//     try {
//       const deleteUserFunc = httpsCallable(functions, 'deleteUser');
//       const result = await deleteUserFunc({ uid: deleteDialog.uid });
//       if (result.data.success) {
//         toast.success('User deleted successfully!');
//         await loadUsers();
//       }
//     } catch (error) {
//       toast.error(error.message || 'Failed to delete user');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRoleDropdownChange = (uid, email, oldRole, newRole) => {
//     if (oldRole === newRole) return;
//     setRoleDialog({ isOpen: true, uid, email, oldRole, newRole });
//   };

//   const handleConfirmRoleChange = async () => {
//     setLoading(true);
//     try {
//       const updateUserRole = httpsCallable(functions, 'updateUserRole');
//       const result = await updateUserRole({ uid: roleDialog.uid, role: roleDialog.newRole });
//       if (result.data.success) {
//         toast.success('Role updated successfully!');
//         await loadUsers();
//       }
//     } catch (error) {
//       toast.error(error.message || 'Failed to update role');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggleDisabled = async (uid, currentDisabled) => {
//     setLoading(true);
//     try {
//       const toggleUserDisabled = httpsCallable(functions, 'toggleUserDisabled');
//       const result = await toggleUserDisabled({ uid, disabled: !currentDisabled });
//       if (result.data.success) {
//         toast.success(`User ${!currentDisabled ? 'disabled' : 'enabled'} successfully!`);
//         await loadUsers();
//       }
//     } catch (error) {
//       toast.error(error.message || 'Failed to toggle user status');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isSuperAdmin) {
//     return (
//       <ProtectedRoute>
//         <div className="flex min-h-screen bg-gray-50">
//           <Sidebar />
//           <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//             <div className="card text-center py-12">
//               <FiAlertCircle className="mx-auto text-red-600 mb-4" size={48} />
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
//               <p className="text-gray-600">Only the Super Admin can access User Management.</p>
//             </div>
//           </main>
//         </div>
//       </ProtectedRoute>
//     );
//   }

//   const roleColors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />

//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//               <p className="text-gray-600 mt-1">Manage admin users and roles</p>
//             </div>
//             <div className="flex gap-2">
//               <button onClick={loadUsers} className="btn btn-secondary flex items-center gap-2" disabled={loading}>
//                 <FiRefreshCw className={loading ? 'animate-spin' : ''} size={20} />
//                 Refresh
//               </button>
//               <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
//                 <FiPlus size={20} />
//                 Add New User
//               </button>
//             </div>
//           </div>

//           {/* Current Super Admin */}
//           <div className="card mb-6">
//             <h2 className="text-xl font-bold mb-4">Current Super Admin</h2>
//             <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
//               <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">
//                 {user?.email?.[0]?.toUpperCase()}
//               </div>
//               <div className="flex-1">
//                 <p className="font-medium text-gray-900">{user?.email}</p>
//                 <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
//                   Super Admin
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Users List */}
//           <div className="card">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold">Admin Users</h2>
//               <span className="text-sm text-gray-600">{users.length} users</span>
//             </div>

//             {loading ? (
//               <div className="flex items-center justify-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//               </div>
//             ) : users.length === 0 ? (
//               <div className="text-center py-8">
//                 <p className="text-gray-600 mb-2">No additional users yet.</p>
//                 <p className="text-sm text-gray-400">Create users using the "Add New User" button.</p>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {users.map((userItem) => (
//                   <div
//                     key={userItem.uid}
//                     className={`flex items-center justify-between p-4 rounded-lg border ${
//                       userItem.disabled ? 'bg-gray-100 border-gray-300 opacity-60' : 'bg-gray-50 border-gray-200'
//                     }`}
//                   >
//                     <div className="flex items-center gap-4">
//                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${userItem.disabled ? 'bg-gray-400' : 'bg-primary'}`}>
//                         {userItem.email?.[0]?.toUpperCase()}
//                       </div>
//                       <div>
//                         <p className="font-medium text-gray-900">{userItem.email}</p>
//                         {userItem.displayName && <p className="text-xs text-gray-500">{userItem.displayName}</p>}
//                         <p className="text-xs text-gray-400">
//                           Created: {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'N/A'}
//                         </p>
//                         {userItem.disabled && <span className="text-xs font-medium text-red-600">● Disabled</span>}
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2 flex-wrap justify-end">
//                       <select
//                         value={userItem.role}
//                         onChange={(e) => handleRoleDropdownChange(userItem.uid, userItem.email, userItem.role, e.target.value)}
//                         className="select text-sm py-1 w-auto"
//                         disabled={loading}
//                       >
//                         <option value="editor">Editor</option>
//                         <option value="admin">Admin</option>
//                         <option value="super_admin">Super Admin</option>
//                       </select>

//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[userItem.role]}`}>
//                         {roleLabels[userItem.role]}
//                       </span>

//                       <button
//                         onClick={() => handleToggleDisabled(userItem.uid, userItem.disabled)}
//                         className={`p-2 rounded transition-colors ${userItem.disabled ? 'hover:bg-green-50 text-green-600' : 'hover:bg-yellow-50 text-yellow-600'}`}
//                         title={userItem.disabled ? 'Enable user' : 'Disable user'}
//                         disabled={loading}
//                       >
//                         {userItem.disabled ? <FiToggleLeft size={18} /> : <FiToggleRight size={18} />}
//                       </button>

//                       <button
//                         onClick={() => setDeleteDialog({ isOpen: true, uid: userItem.uid, email: userItem.email })}
//                         className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors"
//                         disabled={loading}
//                         title="Delete user"
//                       >
//                         <FiTrash2 size={16} />
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Create User Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">Add New User</h2>
//               <button onClick={() => setShowModal(false)}>
//                 <FiX size={24} className="text-gray-600 hover:text-gray-900" />
//               </button>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div className="modal-body space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
//                   <input type="text" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="input" placeholder="John Doe" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
//                   <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" placeholder="admin@example.com" required />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
//                   <div className="flex gap-2">
//                     <input type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input flex-1" placeholder="Enter password" required minLength={6} />
//                     <button type="button" onClick={handleGeneratePassword} className="btn btn-secondary whitespace-nowrap">Generate</button>
//                   </div>
//                   <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
//                   <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="select" required>
//                     <option value="editor">Editor — Services only</option>
//                     <option value="admin">Admin — Services + Categories</option>
//                     <option value="super_admin">Super Admin — Full access</option>
//                   </select>
//                 </div>
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
//                   <p className="font-medium text-blue-900 mb-2">Role Permissions:</p>
//                   <ul className="space-y-1 text-blue-800">
//                     <li><strong>Editor:</strong> Services only</li>
//                     <li><strong>Admin:</strong> Services + Categories</li>
//                     <li><strong>Super Admin:</strong> All + User Management</li>
//                   </ul>
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Type-to-Delete Dialog */}
//       <DeleteUserDialog
//         isOpen={deleteDialog.isOpen}
//         onClose={() => setDeleteDialog({ isOpen: false, uid: null, email: null })}
//         onConfirm={handleDeleteUser}
//         email={deleteDialog.email}
//       />

//       {/* Role Change Confirmation Dialog */}
//       <RoleChangeDialog
//         isOpen={roleDialog.isOpen}
//         onClose={() => setRoleDialog({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null })}
//         onConfirm={handleConfirmRoleChange}
//         email={roleDialog.email}
//         oldRole={roleDialog.oldRole}
//         newRole={roleDialog.newRole}
//       />
//     </ProtectedRoute>
//   );
// }


























// OLD


// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { app } from '../../lib/firebase';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import { FiPlus, FiTrash2, FiX, FiAlertCircle, FiRefreshCw, FiToggleLeft, FiToggleRight, FiArrowRight, FiShield } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);
// const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
// const SUPER_ADMIN_UID   = process.env.NEXT_PUBLIC_SUPER_ADMIN_UID;

// // ============================================
// // Type-to-Delete Dialog
// // ============================================
// function DeleteUserDialog({ isOpen, onClose, onConfirm, email }) {
//   const [typed, setTyped] = useState('');

//   if (!isOpen) return null;

//   const handleClose = () => { setTyped(''); onClose(); };
//   const handleConfirm = () => { setTyped(''); onConfirm(); onClose(); };

//   return (
//     <div className="modal-overlay" onClick={handleClose}>
//       <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
//               <FiTrash2 className="text-red-600" size={20} />
//             </div>
//             <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
//           </div>
//           <button onClick={handleClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//         </div>
//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">
//             This will permanently delete the user and revoke their access. This action <strong>cannot be undone.</strong>
//           </p>
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3">
//             <p className="text-sm font-medium text-red-800 break-all">{email}</p>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Type the email address to confirm:
//             </label>
//             <input
//               type="text"
//               value={typed}
//               onChange={(e) => setTyped(e.target.value)}
//               className="input"
//               placeholder={email}
//               autoFocus
//             />
//           </div>
//         </div>
//         <div className="modal-footer">
//           <button onClick={handleClose} className="btn btn-secondary">Cancel</button>
//           <button
//             onClick={handleConfirm}
//             disabled={typed !== email}
//             className="btn btn-danger disabled:opacity-40 disabled:cursor-not-allowed"
//           >
//             Delete User
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ============================================
// // Role Change Confirmation Dialog
// // ============================================
// function RoleChangeDialog({ isOpen, onClose, onConfirm, email, oldRole, newRole }) {
//   if (!isOpen) return null;

//   const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };
//   const roleColors  = {
//     super_admin: 'bg-red-100 text-red-800',
//     admin: 'bg-blue-100 text-blue-800',
//     editor: 'bg-green-100 text-green-800',
//   };

//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <h2 className="text-xl font-bold text-gray-900">Confirm Role Change</h2>
//           <button onClick={onClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//         </div>
//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">You are about to change the role for:</p>
//           <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
//             <p className="text-sm font-medium text-gray-900 break-all">{email}</p>
//           </div>
//           <div className="flex items-center justify-center gap-4 py-2">
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${roleColors[oldRole]}`}>
//               {roleLabels[oldRole]}
//             </span>
//             <FiArrowRight size={20} className="text-gray-400" />
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${roleColors[newRole]}`}>
//               {roleLabels[newRole]}
//             </span>
//           </div>
//           <p className="text-sm text-gray-500 text-center">This will take effect on their next login.</p>
//         </div>
//         <div className="modal-footer">
//           <button onClick={onClose} className="btn btn-secondary">Cancel</button>
//           <button onClick={() => { onConfirm(); onClose(); }} className="btn btn-primary">Confirm Change</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ============================================
// // Helper — is this row the super admin?
// // ============================================
// function isSuperAdminRow(userItem) {
//   return (
//     userItem.uid   === SUPER_ADMIN_UID ||
//     userItem.email === SUPER_ADMIN_EMAIL
//   );
// }

// // ============================================
// // Main Users Page
// // ============================================
// export default function UsersPage() {
//   const { user } = useAuth();
//   const [showModal, setShowModal]   = useState(false);
//   const [users, setUsers]           = useState([]);
//   const [loading, setLoading]       = useState(false);
//   const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, uid: null, email: null });
//   const [roleDialog, setRoleDialog]     = useState({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null });
//   const [formData, setFormData]     = useState({ email: '', password: '', role: 'editor', displayName: '' });

//   const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

//   useEffect(() => { if (isSuperAdmin) loadUsers(); }, [isSuperAdmin]);

//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const result = await httpsCallable(functions, 'listAdminUsers')();
//       if (result.data.success) setUsers(result.data.users);
//     } catch (error) {
//       if (error.code === 'functions/unauthenticated') {
//         toast.error('Authentication error. Please log out and log back in.');
//       } else {
//         toast.error('Failed to load users: ' + error.message);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGeneratePassword = () => {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
//     let pw = '';
//     for (let i = 0; i < 12; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
//     setFormData({ ...formData, password: pw });
//     toast.success('Password generated!');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const result = await httpsCallable(functions, 'createUserWithRole')(formData);
//       if (result.data.success) {
//         toast.success('User created successfully!');
//         setShowModal(false);
//         setFormData({ email: '', password: '', role: 'editor', displayName: '' });
//         await loadUsers();
//       }
//     } catch (error) {
//       if (error.code === 'functions/already-exists') toast.error('A user with this email already exists');
//       else if (error.code === 'functions/permission-denied') toast.error('Only Super Admins can create users');
//       else toast.error(error.message || 'Failed to create user');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteUser = async () => {
//     setLoading(true);
//     try {
//       const result = await httpsCallable(functions, 'deleteUser')({ uid: deleteDialog.uid });
//       if (result.data.success) {
//         toast.success('User deleted successfully!');
//         await loadUsers();
//       }
//     } catch (error) {
//       toast.error(error.message || 'Failed to delete user');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRoleDropdownChange = (uid, email, oldRole, newRole) => {
//     if (oldRole === newRole) return;
//     setRoleDialog({ isOpen: true, uid, email, oldRole, newRole });
//   };

//   const handleConfirmRoleChange = async () => {
//     setLoading(true);
//     try {
//       const result = await httpsCallable(functions, 'updateUserRole')({ uid: roleDialog.uid, role: roleDialog.newRole });
//       if (result.data.success) {
//         toast.success('Role updated successfully!');
//         await loadUsers();
//       }
//     } catch (error) {
//       toast.error(error.message || 'Failed to update role');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleToggleDisabled = async (uid, currentDisabled) => {
//     setLoading(true);
//     try {
//       const result = await httpsCallable(functions, 'toggleUserDisabled')({ uid, disabled: !currentDisabled });
//       if (result.data.success) {
//         toast.success(`User ${!currentDisabled ? 'disabled' : 'enabled'} successfully!`);
//         await loadUsers();
//       }
//     } catch (error) {
//       toast.error(error.message || 'Failed to toggle user status');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isSuperAdmin) {
//     return (
//       <ProtectedRoute>
//         <div className="flex min-h-screen bg-gray-50">
//           <Sidebar />
//           <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//             <div className="card text-center py-12">
//               <FiAlertCircle className="mx-auto text-red-600 mb-4" size={48} />
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
//               <p className="text-gray-600">Only the Super Admin can access User Management.</p>
//             </div>
//           </main>
//         </div>
//       </ProtectedRoute>
//     );
//   }

//   const roleColors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />

//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//               <p className="text-gray-600 mt-1">Manage admin users and roles</p>
//             </div>
//             <div className="flex gap-2">
//               <button onClick={loadUsers} className="btn btn-secondary flex items-center gap-2" disabled={loading}>
//                 <FiRefreshCw className={loading ? 'animate-spin' : ''} size={20} />
//                 Refresh
//               </button>
//               <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
//                 <FiPlus size={20} />
//                 Add New User
//               </button>
//             </div>
//           </div>

//           {/* Current Super Admin */}
//           <div className="card mb-6">
//             <h2 className="text-xl font-bold mb-4">Current Super Admin</h2>
//             <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
//               <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">
//                 {user?.email?.[0]?.toUpperCase()}
//               </div>
//               <div className="flex-1">
//                 <p className="font-medium text-gray-900">{user?.email}</p>
//                 <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
//                   Super Admin
//                 </span>
//               </div>
//               {/* Shield icon to indicate protected */}
//               <div className="flex items-center gap-2 text-gray-400">
//                 <FiShield size={18} />
//                 <span className="text-xs">Protected</span>
//               </div>
//             </div>
//           </div>

//           {/* Users List */}
//           <div className="card">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold">Admin Users</h2>
//               <span className="text-sm text-gray-600">{users.length} users</span>
//             </div>

//             {loading ? (
//               <div className="flex items-center justify-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//               </div>
//             ) : users.length === 0 ? (
//               <div className="text-center py-8">
//                 <p className="text-gray-600 mb-2">No additional users yet.</p>
//                 <p className="text-sm text-gray-400">Create users using the "Add New User" button.</p>
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {users.map((userItem) => {
//                   const isProtected = isSuperAdminRow(userItem);

//                   return (
//                     <div
//                       key={userItem.uid}
//                       className={`flex items-center justify-between p-4 rounded-lg border ${
//                         isProtected
//                           ? 'bg-red-50 border-red-200'
//                           : userItem.disabled
//                             ? 'bg-gray-100 border-gray-300 opacity-60'
//                             : 'bg-gray-50 border-gray-200'
//                       }`}
//                     >
//                       <div className="flex items-center gap-4">
//                         <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${isProtected ? 'bg-red-600' : userItem.disabled ? 'bg-gray-400' : 'bg-primary'}`}>
//                           {userItem.email?.[0]?.toUpperCase()}
//                         </div>
//                         <div>
//                           <div className="flex items-center gap-2">
//                             <p className="font-medium text-gray-900">{userItem.email}</p>
//                             {/* LAYER 2: Shield badge on super admin row */}
//                             {isProtected && (
//                               <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
//                                 <FiShield size={10} /> Protected
//                               </span>
//                             )}
//                           </div>
//                           {userItem.displayName && <p className="text-xs text-gray-500">{userItem.displayName}</p>}
//                           <p className="text-xs text-gray-400">
//                             Created: {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'N/A'}
//                           </p>
//                           {userItem.disabled && <span className="text-xs font-medium text-red-600">● Disabled</span>}
//                         </div>
//                       </div>

//                       <div className="flex items-center gap-2 flex-wrap justify-end">
//                         {/* LAYER 3: Role dropdown locked for super admin */}
//                         <select
//                           value={userItem.role}
//                           onChange={(e) => handleRoleDropdownChange(userItem.uid, userItem.email, userItem.role, e.target.value)}
//                           className="select text-sm py-1 w-auto"
//                           disabled={loading || isProtected}
//                           title={isProtected ? 'Super admin role cannot be changed' : ''}
//                         >
//                           <option value="editor">Editor</option>
//                           <option value="admin">Admin</option>
//                           <option value="super_admin">Super Admin</option>
//                         </select>

//                         <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[userItem.role]}`}>
//                           {roleLabels[userItem.role]}
//                         </span>

//                         {/* Disable toggle — hidden for super admin */}
//                         {!isProtected && (
//                           <button
//                             onClick={() => handleToggleDisabled(userItem.uid, userItem.disabled)}
//                             className={`p-2 rounded transition-colors ${userItem.disabled ? 'hover:bg-green-50 text-green-600' : 'hover:bg-yellow-50 text-yellow-600'}`}
//                             title={userItem.disabled ? 'Enable user' : 'Disable user'}
//                             disabled={loading}
//                           >
//                             {userItem.disabled ? <FiToggleLeft size={18} /> : <FiToggleRight size={18} />}
//                           </button>
//                         )}

//                         {/* LAYER 2: Delete button hidden for super admin */}
//                         {!isProtected ? (
//                           <button
//                             onClick={() => setDeleteDialog({ isOpen: true, uid: userItem.uid, email: userItem.email })}
//                             className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors"
//                             disabled={loading}
//                             title="Delete user"
//                           >
//                             <FiTrash2 size={16} />
//                           </button>
//                         ) : (
//                           // Placeholder to keep layout aligned
//                           <div className="w-8" />
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Create User Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">Add New User</h2>
//               <button onClick={() => setShowModal(false)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div className="modal-body space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
//                   <input type="text" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="input" placeholder="John Doe" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
//                   <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" placeholder="admin@example.com" required />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
//                   <div className="flex gap-2">
//                     <input type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input flex-1" placeholder="Enter password" required minLength={6} />
//                     <button type="button" onClick={handleGeneratePassword} className="btn btn-secondary whitespace-nowrap">Generate</button>
//                   </div>
//                   <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
//                   <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="select" required>
//                     <option value="editor">Editor — Services only</option>
//                     <option value="admin">Admin — Services + Categories</option>
//                     <option value="super_admin">Super Admin — Full access</option>
//                   </select>
//                 </div>
//                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
//                   <p className="font-medium text-blue-900 mb-2">Role Permissions:</p>
//                   <ul className="space-y-1 text-blue-800">
//                     <li><strong>Editor:</strong> Services only</li>
//                     <li><strong>Admin:</strong> Services + Categories</li>
//                     <li><strong>Super Admin:</strong> All + User Management</li>
//                   </ul>
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Type-to-Delete Dialog */}
//       <DeleteUserDialog
//         isOpen={deleteDialog.isOpen}
//         onClose={() => setDeleteDialog({ isOpen: false, uid: null, email: null })}
//         onConfirm={handleDeleteUser}
//         email={deleteDialog.email}
//       />

//       {/* Role Change Confirmation Dialog */}
//       <RoleChangeDialog
//         isOpen={roleDialog.isOpen}
//         onClose={() => setRoleDialog({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null })}
//         onConfirm={handleConfirmRoleChange}
//         email={roleDialog.email}
//         oldRole={roleDialog.oldRole}
//         newRole={roleDialog.newRole}
//       />
//     </ProtectedRoute>
//   );
// }


// NEW 1

// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { app } from '../../lib/firebase';
// import { getAllCategories, getAllServices } from '../../lib/firestore';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import {
//   FiPlus, FiTrash2, FiX, FiAlertCircle, FiRefreshCw,
//   FiToggleLeft, FiToggleRight, FiArrowRight, FiShield, FiEdit2
// } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);
// const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
// const SUPER_ADMIN_UID   = process.env.NEXT_PUBLIC_SUPER_ADMIN_UID;

// // ─── Type-to-Delete Dialog ────────────────────────────────────────────────────
// function DeleteUserDialog({ isOpen, onClose, onConfirm, email }) {
//   const [typed, setTyped] = useState('');
//   if (!isOpen) return null;
//   const handleClose   = () => { setTyped(''); onClose(); };
//   const handleConfirm = () => { setTyped(''); onConfirm(); onClose(); };
//   return (
//     <div className="modal-overlay" onClick={handleClose}>
//       <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><FiTrash2 className="text-red-600" size={20} /></div>
//             <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
//           </div>
//           <button onClick={handleClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//         </div>
//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">This will permanently delete the user and revoke their access. This action <strong>cannot be undone.</strong></p>
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm font-medium text-red-800 break-all">{email}</p></div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Type the email address to confirm:</label>
//             <input type="text" value={typed} onChange={(e) => setTyped(e.target.value)} className="input" placeholder={email} autoFocus />
//           </div>
//         </div>
//         <div className="modal-footer">
//           <button onClick={handleClose} className="btn btn-secondary">Cancel</button>
//           <button onClick={handleConfirm} disabled={typed !== email} className="btn btn-danger disabled:opacity-40 disabled:cursor-not-allowed">Delete User</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Role Change Dialog ───────────────────────────────────────────────────────
// function RoleChangeDialog({ isOpen, onClose, onConfirm, email, oldRole, newRole }) {
//   if (!isOpen) return null;
//   const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };
//   const roleColors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-header">
//           <h2 className="text-xl font-bold text-gray-900">Confirm Role Change</h2>
//           <button onClick={onClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//         </div>
//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">You are about to change the role for:</p>
//           <div className="bg-gray-50 border border-gray-200 rounded-lg p-3"><p className="text-sm font-medium text-gray-900 break-all">{email}</p></div>
//           <div className="flex items-center justify-center gap-4 py-2">
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${roleColors[oldRole]}`}>{roleLabels[oldRole]}</span>
//             <FiArrowRight size={20} className="text-gray-400" />
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${roleColors[newRole]}`}>{roleLabels[newRole]}</span>
//           </div>
//           <p className="text-sm text-gray-500 text-center">This will take effect on their next login.</p>
//         </div>
//         <div className="modal-footer">
//           <button onClick={onClose} className="btn btn-secondary">Cancel</button>
//           <button onClick={() => { onConfirm(); onClose(); }} className="btn btn-primary">Confirm Change</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Access Selector Component ────────────────────────────────────────────────
// function AccessSelector({ role, access, onChange, categories, services }) {
//   if (role === 'super_admin') return (
//     <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
//       Super Admin has full access to everything — no restrictions needed.
//     </div>
//   );

//   // Group services by category
//   const servicesByCategory = categories.reduce((acc, cat) => {
//     const catRef = `categories_new/${cat.id}`;
//     acc[cat.id] = {
//       category: cat,
//       services: services.filter(s => s.categoryref === catRef),
//     };
//     return acc;
//   }, {});

//   const toggleAllServices = (checked) => {
//     onChange({ ...access, allServices: checked, services: checked ? [] : access.services });
//   };

//   const toggleAllCategories = (checked) => {
//     onChange({ ...access, allCategories: checked, categories: checked ? [] : access.categories });
//   };

//   const toggleCategory = (catId, checked) => {
//     const cats = checked
//       ? [...(access.categories || []), catId]
//       : (access.categories || []).filter(id => id !== catId);
//     // Also add/remove all services in this category
//     const catServices = servicesByCategory[catId]?.services.map(s => s.id) || [];
//     let svcs = access.services || [];
//     if (checked) {
//       svcs = [...new Set([...svcs, ...catServices])];
//     } else {
//       svcs = svcs.filter(id => !catServices.includes(id));
//     }
//     onChange({ ...access, categories: cats, services: svcs });
//   };

//   const toggleService = (svcId, checked) => {
//     const svcs = checked
//       ? [...(access.services || []), svcId]
//       : (access.services || []).filter(id => id !== svcId);
//     onChange({ ...access, services: svcs });
//   };

//   return (
//     <div className="space-y-4">
//       {/* All Services toggle */}
//       <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//         <input
//           type="checkbox"
//           id="allServices"
//           checked={access.allServices || false}
//           onChange={(e) => toggleAllServices(e.target.checked)}
//           className="w-4 h-4 text-primary rounded"
//         />
//         <label htmlFor="allServices" className="text-sm font-semibold text-blue-900">
//           Grant access to ALL services
//         </label>
//       </div>

//       {/* All Categories toggle (admin only) */}
//       {role === 'admin' && (
//         <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
//           <input
//             type="checkbox"
//             id="allCategories"
//             checked={access.allCategories || false}
//             onChange={(e) => toggleAllCategories(e.target.checked)}
//             className="w-4 h-4 text-primary rounded"
//           />
//           <label htmlFor="allCategories" className="text-sm font-semibold text-green-900">
//             Grant access to ALL categories
//           </label>
//         </div>
//       )}

//       {/* Per-category/service selector — only show if not allServices */}
//       {!access.allServices && (
//         <div className="border border-gray-200 rounded-lg overflow-hidden">
//           <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
//             <p className="text-sm font-semibold text-gray-700">
//               {role === 'admin' ? 'Select specific categories and/or services:' : 'Select specific services:'}
//             </p>
//           </div>
//           <div className="max-h-64 overflow-y-auto divide-y divide-gray-100">
//             {categories.map((cat) => {
//               const catServices = servicesByCategory[cat.id]?.services || [];
//               const catChecked  = (access.categories || []).includes(cat.id);

//               return (
//                 <div key={cat.id} className="p-3">
//                   {/* Category row (admin only) */}
//                   {role === 'admin' && (
//                     <div className="flex items-center gap-2 mb-2">
//                       <input
//                         type="checkbox"
//                         id={`cat_${cat.id}`}
//                         checked={catChecked || access.allCategories || false}
//                         disabled={access.allCategories}
//                         onChange={(e) => toggleCategory(cat.id, e.target.checked)}
//                         className="w-4 h-4 text-primary rounded"
//                       />
//                       <label htmlFor={`cat_${cat.id}`} className="text-sm font-semibold text-gray-800">
//                         📁 {cat.name_sor || cat.name_en || cat.id}
//                         <span className="ml-2 text-xs text-gray-400 font-normal">({catServices.length} services)</span>
//                       </label>
//                     </div>
//                   )}
//                   {/* Services under this category */}
//                   {catServices.length > 0 && (
//                     <div className={`space-y-1 ${role === 'admin' ? 'ml-6' : ''}`}>
//                       {/* Editor: show category name as label */}
//                       {role === 'editor' && (
//                         <p className="text-xs font-semibold text-gray-500 mb-1">
//                           📁 {cat.name_sor || cat.name_en}
//                         </p>
//                       )}
//                       {catServices.map((svc) => {
//                         const svcChecked = (access.services || []).includes(svc.id);
//                         const parentChecked = catChecked || access.allCategories || access.allServices;
//                         return (
//                           <div key={svc.id} className="flex items-center gap-2">
//                             <input
//                               type="checkbox"
//                               id={`svc_${svc.id}`}
//                               checked={svcChecked || parentChecked}
//                               disabled={parentChecked}
//                               onChange={(e) => toggleService(svc.id, e.target.checked)}
//                               className="w-4 h-4 text-primary rounded"
//                             />
//                             <label htmlFor={`svc_${svc.id}`} className="text-sm text-gray-700">
//                               {svc.name_sor || svc.name_en || svc.id}
//                             </label>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                   {catServices.length === 0 && (
//                     <p className={`text-xs text-gray-400 italic ${role === 'admin' ? 'ml-6' : 'ml-2'}`}>No services in this category</p>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {/* Summary */}
//       <div className="text-xs text-gray-500 bg-gray-50 rounded p-2">
//         {access.allServices
//           ? '✅ Full access to all services'
//           : `✅ ${(access.services || []).length} service(s) selected`}
//         {role === 'admin' && (
//           <span className="ml-3">
//             {access.allCategories
//               ? '· Full access to all categories'
//               : `· ${(access.categories || []).length} category(s) selected`}
//           </span>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// function isSuperAdminRow(userItem) {
//   return userItem.uid === SUPER_ADMIN_UID || userItem.email === SUPER_ADMIN_EMAIL;
// }

// function defaultAccess(role) {
//   return {
//     allCategories: role === 'super_admin',
//     allServices:   role === 'super_admin' || role === 'admin',
//     categories: [],
//     services:   [],
//   };
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function UsersPage() {
//   const { user } = useAuth();
//   const [showModal, setShowModal]   = useState(false);
//   const [users, setUsers]           = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [services, setServices]     = useState([]);
//   const [loading, setLoading]       = useState(false);
//   const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, uid: null, email: null });
//   const [roleDialog, setRoleDialog]     = useState({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null });
//   const [editAccessUser, setEditAccessUser] = useState(null); // user whose access we're editing
//   const [formData, setFormData] = useState({ email: '', password: '', role: 'editor', displayName: '' });
//   const [accessData, setAccessData] = useState(defaultAccess('editor'));

//   const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

//   useEffect(() => {
//     if (isSuperAdmin) {
//       loadUsers();
//       loadCategoriesAndServices();
//     }
//   }, [isSuperAdmin]);

//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const result = await httpsCallable(functions, 'listAdminUsers')();
//       if (result.data.success) setUsers(result.data.users);
//     } catch (error) {
//       if (error.code === 'functions/unauthenticated') toast.error('Authentication error. Please log out and log back in.');
//       else toast.error('Failed to load users: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadCategoriesAndServices = async () => {
//     try {
//       const [cats, svcs] = await Promise.all([getAllCategories(), getAllServices()]);
//       setCategories(cats);
//       setServices(svcs);
//     } catch (e) {
//       console.error('Error loading categories/services for access selector:', e);
//     }
//   };

//   const handleGeneratePassword = () => {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
//     let pw = '';
//     for (let i = 0; i < 12; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
//     setFormData({ ...formData, password: pw });
//     toast.success('Password generated!');
//   };

//   const handleRoleChange = (newRole) => {
//     setFormData({ ...formData, role: newRole });
//     setAccessData(defaultAccess(newRole));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const result = await httpsCallable(functions, 'createUserWithRole')({
//         ...formData,
//         access: accessData,
//       });
//       if (result.data.success) {
//         toast.success('User created successfully!');
//         setShowModal(false);
//         setFormData({ email: '', password: '', role: 'editor', displayName: '' });
//         setAccessData(defaultAccess('editor'));
//         await loadUsers();
//       }
//     } catch (error) {
//       if (error.code === 'functions/already-exists') toast.error('A user with this email already exists');
//       else if (error.code === 'functions/permission-denied') toast.error('Only Super Admins can create users');
//       else toast.error(error.message || 'Failed to create user');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDeleteUser = async () => {
//     setLoading(true);
//     try {
//       const result = await httpsCallable(functions, 'deleteUser')({ uid: deleteDialog.uid });
//       if (result.data.success) { toast.success('User deleted successfully!'); await loadUsers(); }
//     } catch (error) { toast.error(error.message || 'Failed to delete user'); }
//     finally { setLoading(false); }
//   };

//   const handleRoleDropdownChange = (uid, email, oldRole, newRole) => {
//     if (oldRole === newRole) return;
//     setRoleDialog({ isOpen: true, uid, email, oldRole, newRole });
//   };

//   const handleConfirmRoleChange = async () => {
//     setLoading(true);
//     try {
//       const result = await httpsCallable(functions, 'updateUserRole')({ uid: roleDialog.uid, role: roleDialog.newRole });
//       if (result.data.success) { toast.success('Role updated successfully!'); await loadUsers(); }
//     } catch (error) { toast.error(error.message || 'Failed to update role'); }
//     finally { setLoading(false); }
//   };

//   const handleToggleDisabled = async (uid, currentDisabled) => {
//     setLoading(true);
//     try {
//       const result = await httpsCallable(functions, 'toggleUserDisabled')({ uid, disabled: !currentDisabled });
//       if (result.data.success) { toast.success(`User ${!currentDisabled ? 'disabled' : 'enabled'} successfully!`); await loadUsers(); }
//     } catch (error) { toast.error(error.message || 'Failed to toggle user status'); }
//     finally { setLoading(false); }
//   };

//   const handleSaveAccess = async () => {
//     if (!editAccessUser) return;
//     setLoading(true);
//     try {
//       const result = await httpsCallable(functions, 'updateUserAccess')({ uid: editAccessUser.uid, access: editAccessUser.access });
//       if (result.data.success) { toast.success('Access updated successfully!'); setEditAccessUser(null); await loadUsers(); }
//     } catch (error) { toast.error(error.message || 'Failed to update access'); }
//     finally { setLoading(false); }
//   };

//   if (!isSuperAdmin) {
//     return (
//       <ProtectedRoute>
//         <div className="flex min-h-screen bg-gray-50"><Sidebar />
//           <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//             <div className="card text-center py-12">
//               <FiAlertCircle className="mx-auto text-red-600 mb-4" size={48} />
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
//               <p className="text-gray-600">Only the Super Admin can access User Management.</p>
//             </div>
//           </main>
//         </div>
//       </ProtectedRoute>
//     );
//   }

//   const roleColors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">

//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//               <p className="text-gray-600 mt-1">Manage admin users, roles, and access</p>
//             </div>
//             <div className="flex gap-2">
//               <button onClick={loadUsers} className="btn btn-secondary flex items-center gap-2" disabled={loading}>
//                 <FiRefreshCw className={loading ? 'animate-spin' : ''} size={20} /> Refresh
//               </button>
//               <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
//                 <FiPlus size={20} /> Add New User
//               </button>
//             </div>
//           </div>

//           {/* Super Admin Card */}
//           <div className="card mb-6">
//             <h2 className="text-xl font-bold mb-4">Current Super Admin</h2>
//             <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
//               <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">{user?.email?.[0]?.toUpperCase()}</div>
//               <div className="flex-1"><p className="font-medium text-gray-900">{user?.email}</p><span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">Super Admin</span></div>
//               <div className="flex items-center gap-2 text-gray-400"><FiShield size={18} /><span className="text-xs">Protected</span></div>
//             </div>
//           </div>

//           {/* Users List */}
//           <div className="card">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold">Admin Users</h2>
//               <span className="text-sm text-gray-600">{users.length} users</span>
//             </div>

//             {loading ? (
//               <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
//             ) : users.length === 0 ? (
//               <div className="text-center py-8"><p className="text-gray-600 mb-2">No additional users yet.</p><p className="text-sm text-gray-400">Create users using the "Add New User" button.</p></div>
//             ) : (
//               <div className="space-y-3">
//                 {users.map((userItem) => {
//                   const isProtected = isSuperAdminRow(userItem);
//                   return (
//                     <div key={userItem.uid} className={`p-4 rounded-lg border ${isProtected ? 'bg-red-50 border-red-200' : userItem.disabled ? 'bg-gray-100 border-gray-300 opacity-60' : 'bg-gray-50 border-gray-200'}`}>
//                       <div className="flex items-center justify-between">
//                         <div className="flex items-center gap-4">
//                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${isProtected ? 'bg-red-600' : userItem.disabled ? 'bg-gray-400' : 'bg-primary'}`}>
//                             {userItem.email?.[0]?.toUpperCase()}
//                           </div>
//                           <div>
//                             <div className="flex items-center gap-2">
//                               <p className="font-medium text-gray-900">{userItem.email}</p>
//                               {isProtected && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"><FiShield size={10} /> Protected</span>}
//                             </div>
//                             {userItem.displayName && <p className="text-xs text-gray-500">{userItem.displayName}</p>}
//                             <p className="text-xs text-gray-400">Created: {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'N/A'}</p>
//                             {userItem.disabled && <span className="text-xs font-medium text-red-600">● Disabled</span>}
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-2 flex-wrap justify-end">
//                           <select value={userItem.role} onChange={(e) => handleRoleDropdownChange(userItem.uid, userItem.email, userItem.role, e.target.value)} className="select text-sm py-1 w-auto" disabled={loading || isProtected} title={isProtected ? 'Super admin role cannot be changed' : ''}>
//                             <option value="editor">Editor</option>
//                             <option value="admin">Admin</option>
//                             <option value="super_admin">Super Admin</option>
//                           </select>
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[userItem.role]}`}>{roleLabels[userItem.role]}</span>

//                           {/* Edit Access button */}
//                           {!isProtected && (
//                             <button
//                               onClick={() => setEditAccessUser({ ...userItem, access: userItem.access || defaultAccess(userItem.role) })}
//                               className="p-2 hover:bg-blue-50 rounded text-blue-600 transition-colors"
//                               title="Edit access"
//                               disabled={loading}
//                             >
//                               <FiEdit2 size={16} />
//                             </button>
//                           )}

//                           {!isProtected && (
//                             <button onClick={() => handleToggleDisabled(userItem.uid, userItem.disabled)} className={`p-2 rounded transition-colors ${userItem.disabled ? 'hover:bg-green-50 text-green-600' : 'hover:bg-yellow-50 text-yellow-600'}`} title={userItem.disabled ? 'Enable user' : 'Disable user'} disabled={loading}>
//                               {userItem.disabled ? <FiToggleLeft size={18} /> : <FiToggleRight size={18} />}
//                             </button>
//                           )}
//                           {!isProtected ? (
//                             <button onClick={() => setDeleteDialog({ isOpen: true, uid: userItem.uid, email: userItem.email })} className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors" disabled={loading} title="Delete user"><FiTrash2 size={16} /></button>
//                           ) : <div className="w-8" />}
//                         </div>
//                       </div>

//                       {/* Access summary badge */}
//                       {!isProtected && userItem.access && (
//                         <div className="mt-2 ml-14 flex flex-wrap gap-2">
//                           <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
//                             {userItem.access.allServices ? 'All services' : `${(userItem.access.services || []).length} services`}
//                           </span>
//                           {userItem.role === 'admin' && (
//                             <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">
//                               {userItem.access.allCategories ? 'All categories' : `${(userItem.access.categories || []).length} categories`}
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* ── Create User Modal ── */}
//       {showModal && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">Add New User</h2>
//               <button onClick={() => setShowModal(false)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div className="modal-body space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
//                   <input type="text" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="input" placeholder="John Doe" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
//                   <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" placeholder="admin@example.com" required />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
//                   <div className="flex gap-2">
//                     <input type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input flex-1" placeholder="Enter password" required minLength={6} />
//                     <button type="button" onClick={handleGeneratePassword} className="btn btn-secondary whitespace-nowrap">Generate</button>
//                   </div>
//                   <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
//                   <select value={formData.role} onChange={(e) => handleRoleChange(e.target.value)} className="select" required>
//                     <option value="editor">Editor — Services only</option>
//                     <option value="admin">Admin — Services + Categories</option>
//                     <option value="super_admin">Super Admin — Full access</option>
//                   </select>
//                 </div>

//                 {/* Access Selector */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Access Permissions</label>
//                   <AccessSelector
//                     role={formData.role}
//                     access={accessData}
//                     onChange={setAccessData}
//                     categories={categories}
//                     services={services}
//                   />
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* ── Edit Access Modal ── */}
//       {editAccessUser && (
//         <div className="modal-overlay" onClick={() => setEditAccessUser(null)}>
//           <div className="modal" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <div>
//                 <h2 className="text-xl font-bold">Edit Access</h2>
//                 <p className="text-sm text-gray-500 mt-0.5">{editAccessUser.email}</p>
//               </div>
//               <button onClick={() => setEditAccessUser(null)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <div className="modal-body">
//               <AccessSelector
//                 role={editAccessUser.role}
//                 access={editAccessUser.access}
//                 onChange={(newAccess) => setEditAccessUser({ ...editAccessUser, access: newAccess })}
//                 categories={categories}
//                 services={services}
//               />
//             </div>
//             <div className="modal-footer">
//               <button onClick={() => setEditAccessUser(null)} className="btn btn-secondary">Cancel</button>
//               <button onClick={handleSaveAccess} className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Access'}</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <DeleteUserDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, uid: null, email: null })} onConfirm={handleDeleteUser} email={deleteDialog.email} />
//       <RoleChangeDialog isOpen={roleDialog.isOpen} onClose={() => setRoleDialog({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null })} onConfirm={handleConfirmRoleChange} email={roleDialog.email} oldRole={roleDialog.oldRole} newRole={roleDialog.newRole} />
//     </ProtectedRoute>
//   );
// }



// NEW 2



// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { app } from '../../lib/firebase';
// import { getAllCategories, getAllServices } from '../../lib/firestore';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import {
//   FiPlus, FiTrash2, FiX, FiAlertCircle, FiRefreshCw,
//   FiToggleLeft, FiToggleRight, FiArrowRight, FiShield, FiEdit2,
//   FiChevronDown, FiChevronRight
// } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);
// const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
// const SUPER_ADMIN_UID   = process.env.NEXT_PUBLIC_SUPER_ADMIN_UID;

// // ─── Delete Dialog ────────────────────────────────────────────────────────────
// function DeleteUserDialog({ isOpen, onClose, onConfirm, email }) {
//   const [typed, setTyped] = useState('');
//   if (!isOpen) return null;
//   const handleClose   = () => { setTyped(''); onClose(); };
//   const handleConfirm = () => { setTyped(''); onConfirm(); onClose(); };
//   return (
//     <div className="modal-overlay" onClick={handleClose}>
//       <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><FiTrash2 className="text-red-600" size={20} /></div>
//             <h2 className="text-xl font-bold">Delete User</h2>
//           </div>
//           <button onClick={handleClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//         </div>
//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">This will permanently delete the user. This action <strong>cannot be undone.</strong></p>
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm font-medium text-red-800 break-all">{email}</p></div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Type the email address to confirm:</label>
//             <input type="text" value={typed} onChange={e => setTyped(e.target.value)} className="input" placeholder={email} autoFocus />
//           </div>
//         </div>
//         <div className="modal-footer">
//           <button onClick={handleClose} className="btn btn-secondary">Cancel</button>
//           <button onClick={handleConfirm} disabled={typed !== email} className="btn btn-danger disabled:opacity-40 disabled:cursor-not-allowed">Delete User</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Role Change Dialog ───────────────────────────────────────────────────────
// function RoleChangeDialog({ isOpen, onClose, onConfirm, email, oldRole, newRole }) {
//   if (!isOpen) return null;
//   const labels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };
//   const colors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <h2 className="text-xl font-bold">Confirm Role Change</h2>
//           <button onClick={onClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//         </div>
//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">Changing role for:</p>
//           <div className="bg-gray-50 border border-gray-200 rounded-lg p-3"><p className="text-sm font-medium break-all">{email}</p></div>
//           <div className="flex items-center justify-center gap-4 py-2">
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[oldRole]}`}>{labels[oldRole]}</span>
//             <FiArrowRight size={20} className="text-gray-400" />
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[newRole]}`}>{labels[newRole]}</span>
//           </div>
//           <p className="text-sm text-gray-500 text-center">Takes effect on their next login.</p>
//         </div>
//         <div className="modal-footer">
//           <button onClick={onClose} className="btn btn-secondary">Cancel</button>
//           <button onClick={() => { onConfirm(); onClose(); }} className="btn btn-primary">Confirm Change</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Access Selector ──────────────────────────────────────────────────────────
// // access shape:
// // {
// //   allCategories: bool,   // admin only
// //   allServices:   bool,
// //   categories:    string[],  // category IDs explicitly allowed (admin)
// //   services:      string[],  // service IDs explicitly allowed
// //   excludedCategories: string[],  // excluded when allCategories=true
// //   excludedServices:   string[],  // excluded when allServices=true
// // }

// function AccessSelector({ role, access, onChange, categories, services }) {
//   const [expandedCats, setExpandedCats] = useState({});

//   if (role === 'super_admin') {
//     return (
//       <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
//         Super Admin has unrestricted access to everything.
//       </div>
//     );
//   }

//   // Group services by category ref
//   const servicesByCat = categories.reduce((acc, cat) => {
//     acc[cat.id] = services.filter(s => {
//       const ref = s.categoryref || '';
//       const catId = ref.includes('/') ? ref.split('/').pop() : ref;
//       return catId === cat.id;
//     });
//     return acc;
//   }, {});

//   const toggleExpand = (catId) => setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));

//   // ── helpers to check effective state ──────────────────────────────────────

//   // Is a service effectively checked?
//   const isServiceChecked = (svcId, parentCatId) => {
//     if (access.allServices) return !(access.excludedServices || []).includes(svcId);
//     if (access.services?.includes(svcId)) return true;
//     // inherited from category (admin role)
//     if (role === 'admin') {
//       if (access.allCategories) return !(access.excludedCategories || []).includes(parentCatId);
//       if (access.categories?.includes(parentCatId)) return true;
//     }
//     return false;
//   };

//   // Is a category effectively checked? (admin only)
//   const isCategoryChecked = (catId) => {
//     if (access.allCategories) return !(access.excludedCategories || []).includes(catId);
//     return access.categories?.includes(catId) || false;
//   };

//   // Is all-services toggle indeterminate? (some but not all)
//   const someServicesChecked = services.some(s => isServiceChecked(s.id, null));
//   const allServicesEffective = access.allServices && !(access.excludedServices?.length);

//   // ── toggle handlers ────────────────────────────────────────────────────────

//   const handleAllServices = (checked) => {
//     onChange({ ...access, allServices: checked, excludedServices: [], services: [], categories: [], excludedCategories: [], allCategories: checked && role === 'admin' ? access.allCategories : access.allCategories });
//   };

//   const handleAllCategories = (checked) => {
//     onChange({ ...access, allCategories: checked, excludedCategories: [], categories: [] });
//   };

//   const handleServiceToggle = (svcId, parentCatId, checked) => {
//     let newAccess = { ...access };

//     if (access.allServices) {
//       // We're in "all selected" mode — toggle exclusions
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else if (role === 'admin' && access.allCategories && !access.excludedCategories?.includes(parentCatId)) {
//       // Category is fully included — toggle service exclusion
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else if (role === 'admin' && access.categories?.includes(parentCatId)) {
//       // Category explicitly included — toggle service exclusion
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else {
//       // Manual selection mode
//       const svcs = [...(access.services || [])];
//       if (checked) {
//         if (!svcs.includes(svcId)) svcs.push(svcId);
//       } else {
//         const idx = svcs.indexOf(svcId);
//         if (idx > -1) svcs.splice(idx, 1);
//       }
//       newAccess.services = svcs;
//     }
//     onChange(newAccess);
//   };

//   const handleCategoryToggle = (catId, checked) => {
//     let newAccess = { ...access };
//     const catServices = servicesByCat[catId]?.map(s => s.id) || [];

//     if (access.allCategories) {
//       // In "all categories" mode — toggle exclusions
//       const excluded = [...(access.excludedCategories || [])];
//       if (!checked) {
//         if (!excluded.includes(catId)) excluded.push(catId);
//         // Also add all its services to excluded
//         const excSvcs = [...(access.excludedServices || [])];
//         catServices.forEach(id => { if (!excSvcs.includes(id)) excSvcs.push(id); });
//         newAccess.excludedServices = excSvcs;
//       } else {
//         const idx = excluded.indexOf(catId);
//         if (idx > -1) excluded.splice(idx, 1);
//         // Remove its services from excluded
//         const excSvcs = (access.excludedServices || []).filter(id => !catServices.includes(id));
//         newAccess.excludedServices = excSvcs;
//       }
//       newAccess.excludedCategories = excluded;
//     } else {
//       // Manual category selection
//       const cats = [...(access.categories || [])];
//       let svcs = [...(access.services || [])];
//       if (checked) {
//         if (!cats.includes(catId)) cats.push(catId);
//         // Auto-add all services of this category
//         catServices.forEach(id => { if (!svcs.includes(id)) svcs.push(id); });
//       } else {
//         const idx = cats.indexOf(catId);
//         if (idx > -1) cats.splice(idx, 1);
//         // Remove all services of this category from explicit services
//         svcs = svcs.filter(id => !catServices.includes(id));
//       }
//       newAccess.categories = cats;
//       newAccess.services   = svcs;
//     }
//     onChange(newAccess);
//   };

//   // ── count summary ──────────────────────────────────────────────────────────
//   const effectiveServiceCount = access.allServices
//     ? services.length - (access.excludedServices?.length || 0)
//     : (access.services?.length || 0) + (
//         role === 'admin'
//           ? (access.categories || []).reduce((sum, catId) => sum + (servicesByCat[catId]?.length || 0), 0)
//           : 0
//       );

//   const effectiveCatCount = role === 'admin'
//     ? access.allCategories
//       ? categories.length - (access.excludedCategories?.length || 0)
//       : (access.categories?.length || 0)
//     : null;

//   return (
//     <div className="space-y-3">

//       {/* ── All Services ── */}
//       <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${access.allServices ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:border-blue-200'}`}>
//         <input
//           type="checkbox"
//           checked={access.allServices || false}
//           onChange={e => handleAllServices(e.target.checked)}
//           className="w-4 h-4 text-primary rounded"
//         />
//         <div>
//           <p className="text-sm font-semibold text-gray-800">All Services</p>
//           <p className="text-xs text-gray-500">Grant access to every service. Uncheck individual ones below if needed.</p>
//         </div>
//       </label>

//       {/* ── All Categories (admin only) ── */}
//       {role === 'admin' && (
//         <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${access.allCategories ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:border-green-200'}`}>
//           <input
//             type="checkbox"
//             checked={access.allCategories || false}
//             onChange={e => handleAllCategories(e.target.checked)}
//             className="w-4 h-4 text-primary rounded"
//           />
//           <div>
//             <p className="text-sm font-semibold text-gray-800">All Categories</p>
//             <p className="text-xs text-gray-500">Grant access to every category. Uncheck individual ones below if needed.</p>
//           </div>
//         </label>
//       )}

//       {/* ── Per-category tree ── */}
//       <div className="border border-gray-200 rounded-lg overflow-hidden">
//         <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
//           <p className="text-sm font-semibold text-gray-700">
//             {role === 'admin' ? 'Categories & Services' : 'Services by Category'}
//           </p>
//           <p className="text-xs text-gray-400">Click category to expand</p>
//         </div>

//         <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
//           {categories.map(cat => {
//             const catServices = servicesByCat[cat.id] || [];
//             const catChecked  = isCategoryChecked(cat.id);
//             const isExpanded  = expandedCats[cat.id];

//             // Count checked services in this category
//             const checkedSvcCount = catServices.filter(s => isServiceChecked(s.id, cat.id)).length;
//             const allCatSvcsChecked = catServices.length > 0 && checkedSvcCount === catServices.length;
//             const someCatSvcsChecked = checkedSvcCount > 0 && !allCatSvcsChecked;

//             return (
//               <div key={cat.id}>
//                 {/* Category row */}
//                 <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50">
//                   {/* Expand toggle */}
//                   <button type="button" onClick={() => toggleExpand(cat.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
//                     {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
//                   </button>

//                   {/* Category checkbox — admin only */}
//                   {role === 'admin' && (
//                     <input
//                       type="checkbox"
//                       checked={catChecked}
//                       ref={el => { if (el) el.indeterminate = someCatSvcsChecked && !catChecked; }}
//                       onChange={e => handleCategoryToggle(cat.id, e.target.checked)}
//                       className="w-4 h-4 text-primary rounded flex-shrink-0"
//                     />
//                   )}

//                   <button type="button" onClick={() => toggleExpand(cat.id)} className="flex-1 text-left">
//                     <span className="text-sm font-medium text-gray-800">
//                       {cat.name_sor || cat.name_en || cat.id}
//                     </span>
//                     <span className="ml-2 text-xs text-gray-400">
//                       {checkedSvcCount}/{catServices.length} services
//                     </span>
//                   </button>
//                 </div>

//                 {/* Services under this category — shown when expanded */}
//                 {isExpanded && (
//                   <div className="bg-gray-50 border-t border-gray-100">
//                     {catServices.length === 0 ? (
//                       <p className="text-xs text-gray-400 italic px-10 py-2">No services in this category</p>
//                     ) : (
//                       catServices.map(svc => {
//                         const svcChecked = isServiceChecked(svc.id, cat.id);
//                         return (
//                           <label key={svc.id} className="flex items-center gap-2 px-10 py-2 hover:bg-gray-100 cursor-pointer">
//                             <input
//                               type="checkbox"
//                               checked={svcChecked}
//                               onChange={e => handleServiceToggle(svc.id, cat.id, e.target.checked)}
//                               className="w-4 h-4 text-primary rounded flex-shrink-0"
//                             />
//                             <span className="text-sm text-gray-700">{svc.name_sor || svc.name_en || svc.id}</span>
//                           </label>
//                         );
//                       })
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* ── Summary ── */}
//       <div className="flex flex-wrap gap-2 text-xs">
//         <span className={`px-2 py-1 rounded-full font-medium ${effectiveServiceCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
//           {access.allServices
//             ? `All services${(access.excludedServices?.length || 0) > 0 ? ` (−${access.excludedServices.length} excluded)` : ''}`
//             : `${effectiveServiceCount} service(s) selected`}
//         </span>
//         {role === 'admin' && (
//           <span className={`px-2 py-1 rounded-full font-medium ${(effectiveCatCount || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
//             {access.allCategories
//               ? `All categories${(access.excludedCategories?.length || 0) > 0 ? ` (−${access.excludedCategories.length} excluded)` : ''}`
//               : `${effectiveCatCount} category(s) selected`}
//           </span>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// function isSuperAdminRow(u) {
//   return u.uid === SUPER_ADMIN_UID || u.email === SUPER_ADMIN_EMAIL;
// }

// function defaultAccess(role) {
//   return { allCategories: false, allServices: false, categories: [], services: [], excludedCategories: [], excludedServices: [] };
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function UsersPage() {
//   const { user } = useAuth();
//   const [showModal, setShowModal]   = useState(false);
//   const [users, setUsers]           = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [services, setServices]     = useState([]);
//   const [loading, setLoading]       = useState(false);
//   const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, uid: null, email: null });
//   const [roleDialog, setRoleDialog]     = useState({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null });
//   const [editAccessUser, setEditAccessUser] = useState(null);
//   const [formData, setFormData]     = useState({ email: '', password: '', role: 'editor', displayName: '' });
//   const [accessData, setAccessData] = useState(defaultAccess('editor'));

//   const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

//   useEffect(() => {
//     if (isSuperAdmin) { loadUsers(); loadMeta(); }
//   }, [isSuperAdmin]);

//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'listAdminUsers')();
//       if (r.data.success) setUsers(r.data.users);
//     } catch (e) {
//       toast.error(e.code === 'functions/unauthenticated' ? 'Auth error — please log out and back in.' : 'Failed to load users: ' + e.message);
//     } finally { setLoading(false); }
//   };

//   const loadMeta = async () => {
//     try {
//       const [cats, svcs] = await Promise.all([getAllCategories(), getAllServices()]);
//       setCategories(cats); setServices(svcs);
//     } catch (e) { console.error('Failed to load meta:', e); }
//   };

//   const handleGeneratePassword = () => {
//     const ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
//     let pw = '';
//     for (let i = 0; i < 12; i++) pw += ch[Math.floor(Math.random() * ch.length)];
//     setFormData(f => ({ ...f, password: pw }));
//     toast.success('Password generated!');
//   };

//   const handleRoleChange = (newRole) => {
//     setFormData(f => ({ ...f, role: newRole }));
//     setAccessData(defaultAccess(newRole));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault(); setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'createUserWithRole')({ ...formData, access: accessData });
//       if (r.data.success) {
//         toast.success('User created!');
//         setShowModal(false);
//         setFormData({ email: '', password: '', role: 'editor', displayName: '' });
//         setAccessData(defaultAccess('editor'));
//         await loadUsers();
//       }
//     } catch (e) {
//       toast.error(e.message || 'Failed to create user');
//     } finally { setLoading(false); }
//   };

//   const handleDeleteUser = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'deleteUser')({ uid: deleteDialog.uid });
//       if (r.data.success) { toast.success('User deleted!'); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to delete user'); }
//     finally { setLoading(false); }
//   };

//   const handleRoleDropdownChange = (uid, email, oldRole, newRole) => {
//     if (oldRole === newRole) return;
//     setRoleDialog({ isOpen: true, uid, email, oldRole, newRole });
//   };

//   const handleConfirmRoleChange = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'updateUserRole')({ uid: roleDialog.uid, role: roleDialog.newRole });
//       if (r.data.success) { toast.success('Role updated!'); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to update role'); }
//     finally { setLoading(false); }
//   };

//   const handleToggleDisabled = async (uid, current) => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'toggleUserDisabled')({ uid, disabled: !current });
//       if (r.data.success) { toast.success(`User ${!current ? 'disabled' : 'enabled'}!`); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed'); }
//     finally { setLoading(false); }
//   };

//   const handleSaveAccess = async () => {
//     if (!editAccessUser) return;
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'updateUserAccess')({ uid: editAccessUser.uid, access: editAccessUser.access });
//       if (r.data.success) { toast.success('Access updated!'); setEditAccessUser(null); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to update access'); }
//     finally { setLoading(false); }
//   };

//   if (!isSuperAdmin) return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50"><Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//           <div className="card text-center py-12">
//             <FiAlertCircle className="mx-auto text-red-600 mb-4" size={48} />
//             <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
//             <p className="text-gray-600">Only the Super Admin can access User Management.</p>
//           </div>
//         </main>
//       </div>
//     </ProtectedRoute>
//   );

//   const roleColors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">

//           {/* Header */}
//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//               <p className="text-gray-600 mt-1">Manage admin users, roles, and access</p>
//             </div>
//             <div className="flex gap-2">
//               <button onClick={loadUsers} className="btn btn-secondary flex items-center gap-2" disabled={loading}>
//                 <FiRefreshCw className={loading ? 'animate-spin' : ''} size={20} /> Refresh
//               </button>
//               <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
//                 <FiPlus size={20} /> Add New User
//               </button>
//             </div>
//           </div>

//           {/* Super Admin Card */}
//           <div className="card mb-6">
//             <h2 className="text-xl font-bold mb-4">Current Super Admin</h2>
//             <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
//               <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">{user?.email?.[0]?.toUpperCase()}</div>
//               <div className="flex-1">
//                 <p className="font-medium text-gray-900">{user?.email}</p>
//                 <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">Super Admin</span>
//               </div>
//               <div className="flex items-center gap-1 text-gray-400 text-xs"><FiShield size={14} /> Protected</div>
//             </div>
//           </div>

//           {/* Users List */}
//           <div className="card">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold">Admin Users</h2>
//               <span className="text-sm text-gray-500">{users.length} users</span>
//             </div>

//             {loading ? (
//               <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
//             ) : users.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">No users yet. Use "Add New User" to create one.</div>
//             ) : (
//               <div className="space-y-3">
//                 {users.map(u => {
//                   const protected_ = isSuperAdminRow(u);
//                   return (
//                     <div key={u.uid} className={`p-4 rounded-lg border ${protected_ ? 'bg-red-50 border-red-200' : u.disabled ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-gray-50 border-gray-200'}`}>
//                       <div className="flex items-center justify-between flex-wrap gap-2">
//                         <div className="flex items-center gap-3">
//                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${protected_ ? 'bg-red-600' : u.disabled ? 'bg-gray-400' : 'bg-primary'}`}>
//                             {u.email?.[0]?.toUpperCase()}
//                           </div>
//                           <div>
//                             <div className="flex items-center gap-2 flex-wrap">
//                               <p className="font-medium text-gray-900 text-sm">{u.email}</p>
//                               {protected_ && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700"><FiShield size={10} /> Protected</span>}
//                               {u.disabled && <span className="text-xs font-medium text-red-500">● Disabled</span>}
//                             </div>
//                             {u.displayName && <p className="text-xs text-gray-500">{u.displayName}</p>}
//                             <p className="text-xs text-gray-400">Created: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</p>
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-2 flex-wrap justify-end">
//                           <select
//                             value={u.role}
//                             onChange={e => handleRoleDropdownChange(u.uid, u.email, u.role, e.target.value)}
//                             className="select text-sm py-1 w-auto"
//                             disabled={loading || protected_}
//                             title={protected_ ? 'Super admin role is protected' : ''}
//                           >
//                             <option value="editor">Editor</option>
//                             <option value="admin">Admin</option>
//                             <option value="super_admin">Super Admin</option>
//                           </select>
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role]}`}>{roleLabels[u.role]}</span>

//                           {!protected_ && (
//                             <button onClick={() => setEditAccessUser({ ...u, access: u.access || defaultAccess(u.role) })} className="p-2 hover:bg-blue-50 rounded text-blue-600" title="Edit access" disabled={loading}>
//                               <FiEdit2 size={15} />
//                             </button>
//                           )}
//                           {!protected_ && (
//                             <button onClick={() => handleToggleDisabled(u.uid, u.disabled)} className={`p-2 rounded ${u.disabled ? 'text-green-600 hover:bg-green-50' : 'text-yellow-600 hover:bg-yellow-50'}`} disabled={loading}>
//                               {u.disabled ? <FiToggleLeft size={17} /> : <FiToggleRight size={17} />}
//                             </button>
//                           )}
//                           {!protected_ ? (
//                             <button onClick={() => setDeleteDialog({ isOpen: true, uid: u.uid, email: u.email })} className="p-2 hover:bg-red-50 rounded text-red-600" disabled={loading}><FiTrash2 size={15} /></button>
//                           ) : <div className="w-8" />}
//                         </div>
//                       </div>

//                       {/* Access badges */}
//                       {!protected_ && u.access && (
//                         <div className="mt-2 ml-13 flex flex-wrap gap-1.5 pl-12">
//                           <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
//                             {u.access.allServices
//                               ? `All services${u.access.excludedServices?.length ? ` (−${u.access.excludedServices.length})` : ''}`
//                               : `${(u.access.services || []).length} services`}
//                           </span>
//                           {u.role === 'admin' && (
//                             <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">
//                               {u.access.allCategories
//                                 ? `All categories${u.access.excludedCategories?.length ? ` (−${u.access.excludedCategories.length})` : ''}`
//                                 : `${(u.access.categories || []).length} categories`}
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Create User Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">Add New User</h2>
//               <button onClick={() => setShowModal(false)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div className="modal-body space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
//                   <input type="text" value={formData.displayName} onChange={e => setFormData(f => ({ ...f, displayName: e.target.value }))} className="input" placeholder="John Doe" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
//                   <input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className="input" required />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
//                   <div className="flex gap-2">
//                     <input type="text" value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} className="input flex-1" required minLength={6} />
//                     <button type="button" onClick={handleGeneratePassword} className="btn btn-secondary whitespace-nowrap">Generate</button>
//                   </div>
//                   <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
//                   <select value={formData.role} onChange={e => handleRoleChange(e.target.value)} className="select" required>
//                     <option value="editor">Editor — Services only</option>
//                     <option value="admin">Admin — Services + Categories</option>
//                     <option value="super_admin">Super Admin — Full access</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Access Permissions</label>
//                   <AccessSelector role={formData.role} access={accessData} onChange={setAccessData} categories={categories} services={services} />
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Edit Access Modal */}
//       {editAccessUser && (
//         <div className="modal-overlay" onClick={() => setEditAccessUser(null)}>
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <div>
//                 <h2 className="text-xl font-bold">Edit Access</h2>
//                 <p className="text-sm text-gray-500">{editAccessUser.email} · {roleLabels[editAccessUser.role]}</p>
//               </div>
//               <button onClick={() => setEditAccessUser(null)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <div className="modal-body">
//               <AccessSelector
//                 role={editAccessUser.role}
//                 access={editAccessUser.access}
//                 onChange={newAccess => setEditAccessUser(u => ({ ...u, access: newAccess }))}
//                 categories={categories}
//                 services={services}
//               />
//             </div>
//             <div className="modal-footer">
//               <button onClick={() => setEditAccessUser(null)} className="btn btn-secondary">Cancel</button>
//               <button onClick={handleSaveAccess} className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Access'}</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <DeleteUserDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, uid: null, email: null })} onConfirm={handleDeleteUser} email={deleteDialog.email} />
//       <RoleChangeDialog isOpen={roleDialog.isOpen} onClose={() => setRoleDialog({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null })} onConfirm={handleConfirmRoleChange} email={roleDialog.email} oldRole={roleDialog.oldRole} newRole={roleDialog.newRole} />
//     </ProtectedRoute>
//   );
// }


// NEW 3


// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { app } from '../../lib/firebase';
// import { getAllCategories, getAllServices } from '../../lib/firestore';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import {
//   FiPlus, FiTrash2, FiX, FiAlertCircle, FiRefreshCw,
//   FiToggleLeft, FiToggleRight, FiArrowRight, FiShield, FiEdit2,
//   FiChevronDown, FiChevronRight
// } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);
// const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
// const SUPER_ADMIN_UID   = process.env.NEXT_PUBLIC_SUPER_ADMIN_UID;

// // ─── Delete Dialog ────────────────────────────────────────────────────────────
// function DeleteUserDialog({ isOpen, onClose, onConfirm, email }) {
//   const [typed, setTyped] = useState('');
//   if (!isOpen) return null;
//   const handleClose   = () => { setTyped(''); onClose(); };
//   const handleConfirm = () => { setTyped(''); onConfirm(); onClose(); };
//   return (
//     <div className="modal-overlay" onClick={handleClose}>
//       <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><FiTrash2 className="text-red-600" size={20} /></div>
//             <h2 className="text-xl font-bold">Delete User</h2>
//           </div>
//           <button onClick={handleClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//         </div>
//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">This will permanently delete the user. This action <strong>cannot be undone.</strong></p>
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm font-medium text-red-800 break-all">{email}</p></div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Type the email address to confirm:</label>
//             <input type="text" value={typed} onChange={e => setTyped(e.target.value)} className="input" placeholder={email} autoFocus />
//           </div>
//         </div>
//         <div className="modal-footer">
//           <button onClick={handleClose} className="btn btn-secondary">Cancel</button>
//           <button onClick={handleConfirm} disabled={typed !== email} className="btn btn-danger disabled:opacity-40 disabled:cursor-not-allowed">Delete User</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Role Change Dialog ───────────────────────────────────────────────────────
// function RoleChangeDialog({ isOpen, onClose, onConfirm, email, oldRole, newRole }) {
//   if (!isOpen) return null;
//   const labels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };
//   const colors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <h2 className="text-xl font-bold">Confirm Role Change</h2>
//           <button onClick={onClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//         </div>
//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">Changing role for:</p>
//           <div className="bg-gray-50 border border-gray-200 rounded-lg p-3"><p className="text-sm font-medium break-all">{email}</p></div>
//           <div className="flex items-center justify-center gap-4 py-2">
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[oldRole]}`}>{labels[oldRole]}</span>
//             <FiArrowRight size={20} className="text-gray-400" />
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[newRole]}`}>{labels[newRole]}</span>
//           </div>
//           <p className="text-sm text-gray-500 text-center">Takes effect on their next login.</p>
//         </div>
//         <div className="modal-footer">
//           <button onClick={onClose} className="btn btn-secondary">Cancel</button>
//           <button onClick={() => { onConfirm(); onClose(); }} className="btn btn-primary">Confirm Change</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Access Selector ──────────────────────────────────────────────────────────
// // access shape:
// // {
// //   allCategories: bool,   // admin only
// //   allServices:   bool,
// //   categories:    string[],  // category IDs explicitly allowed (admin)
// //   services:      string[],  // service IDs explicitly allowed
// //   excludedCategories: string[],  // excluded when allCategories=true
// //   excludedServices:   string[],  // excluded when allServices=true
// // }

// function AccessSelector({ role, access, onChange, categories, services }) {
//   const [expandedCats, setExpandedCats] = useState({});

//   if (role === 'super_admin') {
//     return (
//       <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
//         Super Admin has unrestricted access to everything.
//       </div>
//     );
//   }

//   // Safely extract category ID regardless of whether categoryref is a
//   // string ("categories_new/ID"), a plain ID, or a Firestore DocumentReference object
//   const extractCatId = (categoryRef) => {
//     if (!categoryRef) return null;
//     if (typeof categoryRef === 'object' && categoryRef.id) return categoryRef.id;
//     if (typeof categoryRef === 'object' && categoryRef.path) return categoryRef.path.split('/').pop();
//     if (typeof categoryRef === 'string') return categoryRef.includes('/') ? categoryRef.split('/').pop() : categoryRef;
//     return null;
//   };

//   // Group services by category
//   const servicesByCat = categories.reduce((acc, cat) => {
//     acc[cat.id] = services.filter(s => extractCatId(s.categoryref) === cat.id);
//     return acc;
//   }, {});

//   const toggleExpand = (catId) => setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));

//   // ── helpers to check effective state ──────────────────────────────────────

//   // Is a service effectively checked?
//   const isServiceChecked = (svcId, parentCatId) => {
//     if (access.allServices) return !(access.excludedServices || []).includes(svcId);
//     if (access.services?.includes(svcId)) return true;
//     // inherited from category (admin role)
//     if (role === 'admin') {
//       if (access.allCategories) return !(access.excludedCategories || []).includes(parentCatId);
//       if (access.categories?.includes(parentCatId)) return true;
//     }
//     return false;
//   };

//   // Is a category effectively checked? (admin only)
//   const isCategoryChecked = (catId) => {
//     if (access.allCategories) return !(access.excludedCategories || []).includes(catId);
//     return access.categories?.includes(catId) || false;
//   };

//   // Is all-services toggle indeterminate? (some but not all)
//   const someServicesChecked = services.some(s => isServiceChecked(s.id, null));
//   const allServicesEffective = access.allServices && !(access.excludedServices?.length);

//   // ── toggle handlers ────────────────────────────────────────────────────────

//   const handleAllServices = (checked) => {
//     onChange({ ...access, allServices: checked, excludedServices: [], services: [], categories: [], excludedCategories: [], allCategories: checked && role === 'admin' ? access.allCategories : access.allCategories });
//   };

//   const handleAllCategories = (checked) => {
//     onChange({ ...access, allCategories: checked, excludedCategories: [], categories: [] });
//   };

//   const handleServiceToggle = (svcId, parentCatId, checked) => {
//     let newAccess = { ...access };

//     if (access.allServices) {
//       // We're in "all selected" mode — toggle exclusions
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else if (role === 'admin' && access.allCategories && !access.excludedCategories?.includes(parentCatId)) {
//       // Category is fully included — toggle service exclusion
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else if (role === 'admin' && access.categories?.includes(parentCatId)) {
//       // Category explicitly included — toggle service exclusion
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else {
//       // Manual selection mode
//       const svcs = [...(access.services || [])];
//       if (checked) {
//         if (!svcs.includes(svcId)) svcs.push(svcId);
//       } else {
//         const idx = svcs.indexOf(svcId);
//         if (idx > -1) svcs.splice(idx, 1);
//       }
//       newAccess.services = svcs;
//     }
//     onChange(newAccess);
//   };

//   const handleCategoryToggle = (catId, checked) => {
//     let newAccess = { ...access };
//     const catServices = servicesByCat[catId]?.map(s => s.id) || [];

//     if (access.allCategories) {
//       // In "all categories" mode — toggle exclusions
//       const excluded = [...(access.excludedCategories || [])];
//       if (!checked) {
//         if (!excluded.includes(catId)) excluded.push(catId);
//         // Also add all its services to excluded
//         const excSvcs = [...(access.excludedServices || [])];
//         catServices.forEach(id => { if (!excSvcs.includes(id)) excSvcs.push(id); });
//         newAccess.excludedServices = excSvcs;
//       } else {
//         const idx = excluded.indexOf(catId);
//         if (idx > -1) excluded.splice(idx, 1);
//         // Remove its services from excluded
//         const excSvcs = (access.excludedServices || []).filter(id => !catServices.includes(id));
//         newAccess.excludedServices = excSvcs;
//       }
//       newAccess.excludedCategories = excluded;
//     } else {
//       // Manual category selection
//       const cats = [...(access.categories || [])];
//       let svcs = [...(access.services || [])];
//       if (checked) {
//         if (!cats.includes(catId)) cats.push(catId);
//         // Auto-add all services of this category
//         catServices.forEach(id => { if (!svcs.includes(id)) svcs.push(id); });
//       } else {
//         const idx = cats.indexOf(catId);
//         if (idx > -1) cats.splice(idx, 1);
//         // Remove all services of this category from explicit services
//         svcs = svcs.filter(id => !catServices.includes(id));
//       }
//       newAccess.categories = cats;
//       newAccess.services   = svcs;
//     }
//     onChange(newAccess);
//   };

//   // ── count summary ──────────────────────────────────────────────────────────
//   const effectiveServiceCount = access.allServices
//     ? services.length - (access.excludedServices?.length || 0)
//     : (access.services?.length || 0) + (
//         role === 'admin'
//           ? (access.categories || []).reduce((sum, catId) => sum + (servicesByCat[catId]?.length || 0), 0)
//           : 0
//       );

//   const effectiveCatCount = role === 'admin'
//     ? access.allCategories
//       ? categories.length - (access.excludedCategories?.length || 0)
//       : (access.categories?.length || 0)
//     : null;

//   return (
//     <div className="space-y-3">

//       {/* ── All Services ── */}
//       <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${access.allServices ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:border-blue-200'}`}>
//         <input
//           type="checkbox"
//           checked={access.allServices || false}
//           onChange={e => handleAllServices(e.target.checked)}
//           className="w-4 h-4 text-primary rounded"
//         />
//         <div>
//           <p className="text-sm font-semibold text-gray-800">All Services</p>
//           <p className="text-xs text-gray-500">Grant access to every service. Uncheck individual ones below if needed.</p>
//         </div>
//       </label>

//       {/* ── All Categories (admin only) ── */}
//       {role === 'admin' && (
//         <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${access.allCategories ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:border-green-200'}`}>
//           <input
//             type="checkbox"
//             checked={access.allCategories || false}
//             onChange={e => handleAllCategories(e.target.checked)}
//             className="w-4 h-4 text-primary rounded"
//           />
//           <div>
//             <p className="text-sm font-semibold text-gray-800">All Categories</p>
//             <p className="text-xs text-gray-500">Grant access to every category. Uncheck individual ones below if needed.</p>
//           </div>
//         </label>
//       )}

//       {/* ── Per-category tree ── */}
//       <div className="border border-gray-200 rounded-lg overflow-hidden">
//         <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
//           <p className="text-sm font-semibold text-gray-700">
//             {role === 'admin' ? 'Categories & Services' : 'Services by Category'}
//           </p>
//           <p className="text-xs text-gray-400">Click category to expand</p>
//         </div>

//         <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
//           {categories.map(cat => {
//             const catServices = servicesByCat[cat.id] || [];
//             const catChecked  = isCategoryChecked(cat.id);
//             const isExpanded  = expandedCats[cat.id];

//             // Count checked services in this category
//             const checkedSvcCount = catServices.filter(s => isServiceChecked(s.id, cat.id)).length;
//             const allCatSvcsChecked = catServices.length > 0 && checkedSvcCount === catServices.length;
//             const someCatSvcsChecked = checkedSvcCount > 0 && !allCatSvcsChecked;

//             return (
//               <div key={cat.id}>
//                 {/* Category row */}
//                 <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50">
//                   {/* Expand toggle */}
//                   <button type="button" onClick={() => toggleExpand(cat.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
//                     {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
//                   </button>

//                   {/* Category checkbox — admin only */}
//                   {role === 'admin' && (
//                     <input
//                       type="checkbox"
//                       checked={catChecked}
//                       ref={el => { if (el) el.indeterminate = someCatSvcsChecked && !catChecked; }}
//                       onChange={e => handleCategoryToggle(cat.id, e.target.checked)}
//                       className="w-4 h-4 text-primary rounded flex-shrink-0"
//                     />
//                   )}

//                   <button type="button" onClick={() => toggleExpand(cat.id)} className="flex-1 text-left">
//                     <span className="text-sm font-medium text-gray-800">
//                       {cat.name_sor || cat.name_en || cat.id}
//                     </span>
//                     <span className="ml-2 text-xs text-gray-400">
//                       {checkedSvcCount}/{catServices.length} services
//                     </span>
//                   </button>
//                 </div>

//                 {/* Services under this category — shown when expanded */}
//                 {isExpanded && (
//                   <div className="bg-gray-50 border-t border-gray-100">
//                     {catServices.length === 0 ? (
//                       <p className="text-xs text-gray-400 italic px-10 py-2">No services in this category</p>
//                     ) : (
//                       catServices.map(svc => {
//                         const svcChecked = isServiceChecked(svc.id, cat.id);
//                         return (
//                           <label key={svc.id} className="flex items-center gap-2 px-10 py-2 hover:bg-gray-100 cursor-pointer">
//                             <input
//                               type="checkbox"
//                               checked={svcChecked}
//                               onChange={e => handleServiceToggle(svc.id, cat.id, e.target.checked)}
//                               className="w-4 h-4 text-primary rounded flex-shrink-0"
//                             />
//                             <span className="text-sm text-gray-700">{svc.name_sor || svc.name_en || svc.id}</span>
//                           </label>
//                         );
//                       })
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* ── Summary ── */}
//       <div className="flex flex-wrap gap-2 text-xs">
//         <span className={`px-2 py-1 rounded-full font-medium ${effectiveServiceCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
//           {access.allServices
//             ? `All services${(access.excludedServices?.length || 0) > 0 ? ` (−${access.excludedServices.length} excluded)` : ''}`
//             : `${effectiveServiceCount} service(s) selected`}
//         </span>
//         {role === 'admin' && (
//           <span className={`px-2 py-1 rounded-full font-medium ${(effectiveCatCount || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
//             {access.allCategories
//               ? `All categories${(access.excludedCategories?.length || 0) > 0 ? ` (−${access.excludedCategories.length} excluded)` : ''}`
//               : `${effectiveCatCount} category(s) selected`}
//           </span>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// function isSuperAdminRow(u) {
//   return u.uid === SUPER_ADMIN_UID || u.email === SUPER_ADMIN_EMAIL;
// }

// function defaultAccess(role) {
//   return { allCategories: false, allServices: false, categories: [], services: [], excludedCategories: [], excludedServices: [] };
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function UsersPage() {
//   const { user } = useAuth();
//   const [showModal, setShowModal]   = useState(false);
//   const [users, setUsers]           = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [services, setServices]     = useState([]);
//   const [loading, setLoading]       = useState(false);
//   const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, uid: null, email: null });
//   const [roleDialog, setRoleDialog]     = useState({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null });
//   const [editAccessUser, setEditAccessUser] = useState(null);
//   const [formData, setFormData]     = useState({ email: '', password: '', role: 'editor', displayName: '' });
//   const [accessData, setAccessData] = useState(defaultAccess('editor'));

//   const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

//   useEffect(() => {
//     if (isSuperAdmin) { loadUsers(); loadMeta(); }
//   }, [isSuperAdmin]);

//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'listAdminUsers')();
//       if (r.data.success) setUsers(r.data.users);
//     } catch (e) {
//       toast.error(e.code === 'functions/unauthenticated' ? 'Auth error — please log out and back in.' : 'Failed to load users: ' + e.message);
//     } finally { setLoading(false); }
//   };

//   const loadMeta = async () => {
//     try {
//       const [cats, svcs] = await Promise.all([getAllCategories(), getAllServices()]);
//       setCategories(cats); setServices(svcs);
//     } catch (e) { console.error('Failed to load meta:', e); }
//   };

//   const handleGeneratePassword = () => {
//     const ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
//     let pw = '';
//     for (let i = 0; i < 12; i++) pw += ch[Math.floor(Math.random() * ch.length)];
//     setFormData(f => ({ ...f, password: pw }));
//     toast.success('Password generated!');
//   };

//   const handleRoleChange = (newRole) => {
//     setFormData(f => ({ ...f, role: newRole }));
//     setAccessData(defaultAccess(newRole));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault(); setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'createUserWithRole')({ ...formData, access: accessData });
//       if (r.data.success) {
//         toast.success('User created!');
//         setShowModal(false);
//         setFormData({ email: '', password: '', role: 'editor', displayName: '' });
//         setAccessData(defaultAccess('editor'));
//         await loadUsers();
//       }
//     } catch (e) {
//       toast.error(e.message || 'Failed to create user');
//     } finally { setLoading(false); }
//   };

//   const handleDeleteUser = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'deleteUser')({ uid: deleteDialog.uid });
//       if (r.data.success) { toast.success('User deleted!'); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to delete user'); }
//     finally { setLoading(false); }
//   };

//   const handleRoleDropdownChange = (uid, email, oldRole, newRole) => {
//     if (oldRole === newRole) return;
//     setRoleDialog({ isOpen: true, uid, email, oldRole, newRole });
//   };

//   const handleConfirmRoleChange = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'updateUserRole')({ uid: roleDialog.uid, role: roleDialog.newRole });
//       if (r.data.success) { toast.success('Role updated!'); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to update role'); }
//     finally { setLoading(false); }
//   };

//   const handleToggleDisabled = async (uid, current) => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'toggleUserDisabled')({ uid, disabled: !current });
//       if (r.data.success) { toast.success(`User ${!current ? 'disabled' : 'enabled'}!`); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed'); }
//     finally { setLoading(false); }
//   };

//   const handleSaveAccess = async () => {
//     if (!editAccessUser) return;
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'updateUserAccess')({ uid: editAccessUser.uid, access: editAccessUser.access });
//       if (r.data.success) { toast.success('Access updated!'); setEditAccessUser(null); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to update access'); }
//     finally { setLoading(false); }
//   };

//   if (!isSuperAdmin) return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50"><Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//           <div className="card text-center py-12">
//             <FiAlertCircle className="mx-auto text-red-600 mb-4" size={48} />
//             <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
//             <p className="text-gray-600">Only the Super Admin can access User Management.</p>
//           </div>
//         </main>
//       </div>
//     </ProtectedRoute>
//   );

//   const roleColors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">

//           {/* Header */}
//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//               <p className="text-gray-600 mt-1">Manage admin users, roles, and access</p>
//             </div>
//             <div className="flex gap-2">
//               <button onClick={loadUsers} className="btn btn-secondary flex items-center gap-2" disabled={loading}>
//                 <FiRefreshCw className={loading ? 'animate-spin' : ''} size={20} /> Refresh
//               </button>
//               <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
//                 <FiPlus size={20} /> Add New User
//               </button>
//             </div>
//           </div>

//           {/* Super Admin Card */}
//           <div className="card mb-6">
//             <h2 className="text-xl font-bold mb-4">Current Super Admin</h2>
//             <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
//               <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">{user?.email?.[0]?.toUpperCase()}</div>
//               <div className="flex-1">
//                 <p className="font-medium text-gray-900">{user?.email}</p>
//                 <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">Super Admin</span>
//               </div>
//               <div className="flex items-center gap-1 text-gray-400 text-xs"><FiShield size={14} /> Protected</div>
//             </div>
//           </div>

//           {/* Users List */}
//           <div className="card">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold">Admin Users</h2>
//               <span className="text-sm text-gray-500">{users.length} users</span>
//             </div>

//             {loading ? (
//               <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
//             ) : users.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">No users yet. Use "Add New User" to create one.</div>
//             ) : (
//               <div className="space-y-3">
//                 {users.map(u => {
//                   const protected_ = isSuperAdminRow(u);
//                   return (
//                     <div key={u.uid} className={`p-4 rounded-lg border ${protected_ ? 'bg-red-50 border-red-200' : u.disabled ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-gray-50 border-gray-200'}`}>
//                       <div className="flex items-center justify-between flex-wrap gap-2">
//                         <div className="flex items-center gap-3">
//                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${protected_ ? 'bg-red-600' : u.disabled ? 'bg-gray-400' : 'bg-primary'}`}>
//                             {u.email?.[0]?.toUpperCase()}
//                           </div>
//                           <div>
//                             <div className="flex items-center gap-2 flex-wrap">
//                               <p className="font-medium text-gray-900 text-sm">{u.email}</p>
//                               {protected_ && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700"><FiShield size={10} /> Protected</span>}
//                               {u.disabled && <span className="text-xs font-medium text-red-500">● Disabled</span>}
//                             </div>
//                             {u.displayName && <p className="text-xs text-gray-500">{u.displayName}</p>}
//                             <p className="text-xs text-gray-400">Created: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</p>
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-2 flex-wrap justify-end">
//                           <select
//                             value={u.role}
//                             onChange={e => handleRoleDropdownChange(u.uid, u.email, u.role, e.target.value)}
//                             className="select text-sm py-1 w-auto"
//                             disabled={loading || protected_}
//                             title={protected_ ? 'Super admin role is protected' : ''}
//                           >
//                             <option value="editor">Editor</option>
//                             <option value="admin">Admin</option>
//                             <option value="super_admin">Super Admin</option>
//                           </select>
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role]}`}>{roleLabels[u.role]}</span>

//                           {!protected_ && (
//                             <button onClick={() => setEditAccessUser({ ...u, access: u.access || defaultAccess(u.role) })} className="p-2 hover:bg-blue-50 rounded text-blue-600" title="Edit access" disabled={loading}>
//                               <FiEdit2 size={15} />
//                             </button>
//                           )}
//                           {!protected_ && (
//                             <button onClick={() => handleToggleDisabled(u.uid, u.disabled)} className={`p-2 rounded ${u.disabled ? 'text-green-600 hover:bg-green-50' : 'text-yellow-600 hover:bg-yellow-50'}`} disabled={loading}>
//                               {u.disabled ? <FiToggleLeft size={17} /> : <FiToggleRight size={17} />}
//                             </button>
//                           )}
//                           {!protected_ ? (
//                             <button onClick={() => setDeleteDialog({ isOpen: true, uid: u.uid, email: u.email })} className="p-2 hover:bg-red-50 rounded text-red-600" disabled={loading}><FiTrash2 size={15} /></button>
//                           ) : <div className="w-8" />}
//                         </div>
//                       </div>

//                       {/* Access badges */}
//                       {!protected_ && u.access && (
//                         <div className="mt-2 ml-13 flex flex-wrap gap-1.5 pl-12">
//                           <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
//                             {u.access.allServices
//                               ? `All services${u.access.excludedServices?.length ? ` (−${u.access.excludedServices.length})` : ''}`
//                               : `${(u.access.services || []).length} services`}
//                           </span>
//                           {u.role === 'admin' && (
//                             <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">
//                               {u.access.allCategories
//                                 ? `All categories${u.access.excludedCategories?.length ? ` (−${u.access.excludedCategories.length})` : ''}`
//                                 : `${(u.access.categories || []).length} categories`}
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Create User Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">Add New User</h2>
//               <button onClick={() => setShowModal(false)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div className="modal-body space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
//                   <input type="text" value={formData.displayName} onChange={e => setFormData(f => ({ ...f, displayName: e.target.value }))} className="input" placeholder="John Doe" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
//                   <input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className="input" required />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
//                   <div className="flex gap-2">
//                     <input type="text" value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} className="input flex-1" required minLength={6} />
//                     <button type="button" onClick={handleGeneratePassword} className="btn btn-secondary whitespace-nowrap">Generate</button>
//                   </div>
//                   <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
//                   <select value={formData.role} onChange={e => handleRoleChange(e.target.value)} className="select" required>
//                     <option value="editor">Editor — Services only</option>
//                     <option value="admin">Admin — Services + Categories</option>
//                     <option value="super_admin">Super Admin — Full access</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Access Permissions</label>
//                   <AccessSelector role={formData.role} access={accessData} onChange={setAccessData} categories={categories} services={services} />
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Edit Access Modal */}
//       {editAccessUser && (
//         <div className="modal-overlay" onClick={() => setEditAccessUser(null)}>
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <div>
//                 <h2 className="text-xl font-bold">Edit Access</h2>
//                 <p className="text-sm text-gray-500">{editAccessUser.email} · {roleLabels[editAccessUser.role]}</p>
//               </div>
//               <button onClick={() => setEditAccessUser(null)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <div className="modal-body">
//               <AccessSelector
//                 role={editAccessUser.role}
//                 access={editAccessUser.access}
//                 onChange={newAccess => setEditAccessUser(u => ({ ...u, access: newAccess }))}
//                 categories={categories}
//                 services={services}
//               />
//             </div>
//             <div className="modal-footer">
//               <button onClick={() => setEditAccessUser(null)} className="btn btn-secondary">Cancel</button>
//               <button onClick={handleSaveAccess} className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Access'}</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <DeleteUserDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, uid: null, email: null })} onConfirm={handleDeleteUser} email={deleteDialog.email} />
//       <RoleChangeDialog isOpen={roleDialog.isOpen} onClose={() => setRoleDialog({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null })} onConfirm={handleConfirmRoleChange} email={roleDialog.email} oldRole={roleDialog.oldRole} newRole={roleDialog.newRole} />
//     </ProtectedRoute>
//   );
// }


// NEW 4

// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { app } from '../../lib/firebase';
// import { getAllCategories, getAllServices } from '../../lib/firestore';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import {
//   FiPlus, FiTrash2, FiX, FiAlertCircle, FiRefreshCw,
//   FiToggleLeft, FiToggleRight, FiArrowRight, FiShield, FiEdit2,
//   FiChevronDown, FiChevronRight
// } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);
// const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
// const SUPER_ADMIN_UID   = process.env.NEXT_PUBLIC_SUPER_ADMIN_UID;

// // ─── Delete Dialog ────────────────────────────────────────────────────────────
// function DeleteUserDialog({ isOpen, onClose, onConfirm, email }) {
//   const [typed, setTyped] = useState('');
//   if (!isOpen) return null;
//   const handleClose   = () => { setTyped(''); onClose(); };
//   const handleConfirm = () => { setTyped(''); onConfirm(); onClose(); };
//   return (
//     <div className="modal-overlay" onClick={handleClose}>
//       <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><FiTrash2 className="text-red-600" size={20} /></div>
//             <h2 className="text-xl font-bold">Delete User</h2>
//           </div>
//           <button onClick={handleClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//         </div>
//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">This will permanently delete the user. This action <strong>cannot be undone.</strong></p>
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm font-medium text-red-800 break-all">{email}</p></div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Type the email address to confirm:</label>
//             <input type="text" value={typed} onChange={e => setTyped(e.target.value)} className="input" placeholder={email} autoFocus />
//           </div>
//         </div>
//         <div className="modal-footer">
//           <button onClick={handleClose} className="btn btn-secondary">Cancel</button>
//           <button onClick={handleConfirm} disabled={typed !== email} className="btn btn-danger disabled:opacity-40 disabled:cursor-not-allowed">Delete User</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Role Change Dialog ───────────────────────────────────────────────────────
// function RoleChangeDialog({ isOpen, onClose, onConfirm, email, oldRole, newRole }) {
//   if (!isOpen) return null;
//   const labels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };
//   const colors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <h2 className="text-xl font-bold">Confirm Role Change</h2>
//           <button onClick={onClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//         </div>
//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">Changing role for:</p>
//           <div className="bg-gray-50 border border-gray-200 rounded-lg p-3"><p className="text-sm font-medium break-all">{email}</p></div>
//           <div className="flex items-center justify-center gap-4 py-2">
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[oldRole]}`}>{labels[oldRole]}</span>
//             <FiArrowRight size={20} className="text-gray-400" />
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[newRole]}`}>{labels[newRole]}</span>
//           </div>
//           <p className="text-sm text-gray-500 text-center">Takes effect on their next login.</p>
//         </div>
//         <div className="modal-footer">
//           <button onClick={onClose} className="btn btn-secondary">Cancel</button>
//           <button onClick={() => { onConfirm(); onClose(); }} className="btn btn-primary">Confirm Change</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Access Selector ──────────────────────────────────────────────────────────
// // access shape:
// // {
// //   allCategories: bool,   // admin only
// //   allServices:   bool,
// //   categories:    string[],  // category IDs explicitly allowed (admin)
// //   services:      string[],  // service IDs explicitly allowed
// //   excludedCategories: string[],  // excluded when allCategories=true
// //   excludedServices:   string[],  // excluded when allServices=true
// // }

// function AccessSelector({ role, access, onChange, categories, services }) {
//   const [expandedCats, setExpandedCats] = useState({});

//   if (role === 'super_admin') {
//     return (
//       <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
//         Super Admin has unrestricted access to everything.
//       </div>
//     );
//   }

//   // Safely extract category ID regardless of whether categoryref is a
//   // string ("categories_new/ID"), a plain ID, or a Firestore DocumentReference object
//   const extractCatId = (categoryRef) => {
//     if (!categoryRef) return null;
//     if (typeof categoryRef === 'object' && categoryRef.id) return categoryRef.id;
//     if (typeof categoryRef === 'object' && categoryRef.path) return categoryRef.path.split('/').pop();
//     if (typeof categoryRef === 'string') return categoryRef.includes('/') ? categoryRef.split('/').pop() : categoryRef;
//     return null;
//   };

//   // Group services by category
//   const servicesByCat = categories.reduce((acc, cat) => {
//     acc[cat.id] = services.filter(s => extractCatId(s.categoryref) === cat.id);
//     return acc;
//   }, {});

//   const toggleExpand = (catId) => setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));

//   // ── helpers to check effective state ──────────────────────────────────────

//   // Is a service effectively checked?
//   const isServiceChecked = (svcId, parentCatId) => {
//     if (access.allServices) return !(access.excludedServices || []).includes(svcId);
//     if (access.services?.includes(svcId)) return true;
//     // inherited from category (admin role)
//     if (role === 'admin') {
//       if (access.allCategories) return !(access.excludedCategories || []).includes(parentCatId);
//       if (access.categories?.includes(parentCatId)) return true;
//     }
//     return false;
//   };

//   // Is a category effectively checked? (admin only)
//   const isCategoryChecked = (catId) => {
//     if (access.allCategories) return !(access.excludedCategories || []).includes(catId);
//     return access.categories?.includes(catId) || false;
//   };

//   // Is all-services toggle indeterminate? (some but not all)
//   const someServicesChecked = services.some(s => isServiceChecked(s.id, null));
//   const allServicesEffective = access.allServices && !(access.excludedServices?.length);

//   // ── toggle handlers ────────────────────────────────────────────────────────

//   const handleAllServices = (checked) => {
//     onChange({ ...access, allServices: checked, excludedServices: [], services: [], categories: [], excludedCategories: [], allCategories: checked && role === 'admin' ? access.allCategories : access.allCategories });
//   };

//   const handleAllCategories = (checked) => {
//     onChange({ ...access, allCategories: checked, excludedCategories: [], categories: [] });
//   };

//   const handleServiceToggle = (svcId, parentCatId, checked) => {
//     let newAccess = { ...access };

//     if (access.allServices) {
//       // We're in "all selected" mode — toggle exclusions
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else if (role === 'admin' && access.allCategories && !access.excludedCategories?.includes(parentCatId)) {
//       // Category is fully included — toggle service exclusion
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else if (role === 'admin' && access.categories?.includes(parentCatId)) {
//       // Category explicitly included — toggle service exclusion
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else {
//       // Manual selection mode
//       const svcs = [...(access.services || [])];
//       if (checked) {
//         if (!svcs.includes(svcId)) svcs.push(svcId);
//       } else {
//         const idx = svcs.indexOf(svcId);
//         if (idx > -1) svcs.splice(idx, 1);
//       }
//       newAccess.services = svcs;
//     }
//     onChange(newAccess);
//   };

//   const handleCategoryToggle = (catId, checked) => {
//     let newAccess = { ...access };
//     const catServices = servicesByCat[catId]?.map(s => s.id) || [];

//     if (access.allCategories) {
//       // In "all categories" mode — toggle exclusions
//       const excluded = [...(access.excludedCategories || [])];
//       if (!checked) {
//         if (!excluded.includes(catId)) excluded.push(catId);
//         // Also add all its services to excluded
//         const excSvcs = [...(access.excludedServices || [])];
//         catServices.forEach(id => { if (!excSvcs.includes(id)) excSvcs.push(id); });
//         newAccess.excludedServices = excSvcs;
//       } else {
//         const idx = excluded.indexOf(catId);
//         if (idx > -1) excluded.splice(idx, 1);
//         // Remove its services from excluded
//         const excSvcs = (access.excludedServices || []).filter(id => !catServices.includes(id));
//         newAccess.excludedServices = excSvcs;
//       }
//       newAccess.excludedCategories = excluded;
//     } else {
//       // Manual category selection
//       const cats = [...(access.categories || [])];
//       let svcs = [...(access.services || [])];
//       if (checked) {
//         if (!cats.includes(catId)) cats.push(catId);
//         // Auto-add all services of this category
//         catServices.forEach(id => { if (!svcs.includes(id)) svcs.push(id); });
//       } else {
//         const idx = cats.indexOf(catId);
//         if (idx > -1) cats.splice(idx, 1);
//         // Remove all services of this category from explicit services
//         svcs = svcs.filter(id => !catServices.includes(id));
//       }
//       newAccess.categories = cats;
//       newAccess.services   = svcs;
//     }
//     onChange(newAccess);
//   };

//   // ── count summary — unique effective IDs to avoid double-count ────────────
//   const effectiveServiceCount = (() => {
//     if (access.allServices) return services.length - (access.excludedServices?.length || 0);
//     const checked = new Set();
//     services.forEach(s => { if (isServiceChecked(s.id, extractCatId(s.categoryref))) checked.add(s.id); });
//     return checked.size;
//   })();

//   const effectiveCatCount = role === 'admin'
//     ? access.allCategories
//       ? categories.length - (access.excludedCategories?.length || 0)
//       : (access.categories?.length || 0)
//     : null;

//   // ── per-category select/deselect all ────────────────────────────────────────
//   const handleCategorySelectAll = (catId, selectAll) => {
//     const catServices = servicesByCat[catId]?.map(s => s.id) || [];
//     if (catServices.length === 0) return;
//     let newAccess = { ...access };
//     if (selectAll) {
//       const svcs = new Set(access.services || []);
//       catServices.forEach(id => svcs.add(id));
//       newAccess.services = [...svcs];
//       newAccess.excludedServices = (access.excludedServices || []).filter(id => !catServices.includes(id));
//     } else {
//       newAccess.services = (access.services || []).filter(id => !catServices.includes(id));
//       if (access.allServices) {
//         const excl = new Set(access.excludedServices || []);
//         catServices.forEach(id => excl.add(id));
//         newAccess.excludedServices = [...excl];
//       }
//     }
//     onChange(newAccess);
//   };

//   return (
//     <div className="space-y-3">

//       {/* ── All Services ── */}
//       <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${access.allServices ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:border-blue-200'}`}>
//         <input
//           type="checkbox"
//           checked={access.allServices || false}
//           onChange={e => handleAllServices(e.target.checked)}
//           className="w-4 h-4 text-primary rounded"
//         />
//         <div>
//           <p className="text-sm font-semibold text-gray-800">All Services</p>
//           <p className="text-xs text-gray-500">Grant access to every service. Uncheck individual ones below if needed.</p>
//         </div>
//       </label>

//       {/* ── All Categories (admin only) ── */}
//       {role === 'admin' && (
//         <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${access.allCategories ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:border-green-200'}`}>
//           <input
//             type="checkbox"
//             checked={access.allCategories || false}
//             onChange={e => handleAllCategories(e.target.checked)}
//             className="w-4 h-4 text-primary rounded"
//           />
//           <div>
//             <p className="text-sm font-semibold text-gray-800">All Categories</p>
//             <p className="text-xs text-gray-500">Grant access to every category. Uncheck individual ones below if needed.</p>
//           </div>
//         </label>
//       )}

//       {/* ── Per-category tree ── */}
//       <div className="border border-gray-200 rounded-lg overflow-hidden">
//         <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
//           <p className="text-sm font-semibold text-gray-700">
//             {role === 'admin' ? 'Categories & Services' : 'Services by Category'}
//           </p>
//           <p className="text-xs text-gray-400">Click category to expand</p>
//         </div>

//         <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
//           {categories.map(cat => {
//             const catServices = servicesByCat[cat.id] || [];
//             const catChecked  = isCategoryChecked(cat.id);
//             const isExpanded  = expandedCats[cat.id];

//             // Count checked services in this category
//             const checkedSvcCount = catServices.filter(s => isServiceChecked(s.id, cat.id)).length;
//             const allCatSvcsChecked = catServices.length > 0 && checkedSvcCount === catServices.length;
//             const someCatSvcsChecked = checkedSvcCount > 0 && !allCatSvcsChecked;

//             return (
//               <div key={cat.id}>
//                 {/* Category row */}
//                 <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50">
//                   {/* Expand toggle */}
//                   <button type="button" onClick={() => toggleExpand(cat.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
//                     {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
//                   </button>

//                   {/* Category checkbox — admin only */}
//                   {role === 'admin' && (
//                     <input
//                       type="checkbox"
//                       checked={catChecked}
//                       ref={el => { if (el) el.indeterminate = someCatSvcsChecked && !catChecked; }}
//                       onChange={e => handleCategoryToggle(cat.id, e.target.checked)}
//                       className="w-4 h-4 text-primary rounded flex-shrink-0"
//                     />
//                   )}

//                   <button type="button" onClick={() => toggleExpand(cat.id)} className="flex-1 text-left">
//                     <span className="text-sm font-medium text-gray-800">
//                       {cat.name_sor || cat.name_en || cat.id}
//                     </span>
//                     <span className="ml-2 text-xs text-gray-400">
//                       {checkedSvcCount}/{catServices.length} services
//                     </span>
//                   </button>
//                 </div>

//                 {/* Services under this category — shown when expanded */}
//                 {isExpanded && (
//                   <div className="bg-gray-50 border-t border-gray-100">
//                     {catServices.length === 0 ? (
//                       <p className="text-xs text-gray-400 italic px-10 py-2">No services in this category</p>
//                     ) : (
//                       <>
//                         {/* Select all / Deselect all row for this category */}
//                         <div className="flex items-center justify-between px-10 py-1.5 border-b border-gray-200 bg-gray-100">
//                           <span className="text-xs text-gray-500">{checkedSvcCount}/{catServices.length} selected</span>
//                           <div className="flex gap-2">
//                             {checkedSvcCount < catServices.length && (
//                               <button
//                                 type="button"
//                                 onClick={() => handleCategorySelectAll(cat.id, true)}
//                                 className="text-xs text-blue-600 hover:text-blue-800 font-medium"
//                               >
//                                 Select all
//                               </button>
//                             )}
//                             {checkedSvcCount > 0 && (
//                               <button
//                                 type="button"
//                                 onClick={() => handleCategorySelectAll(cat.id, false)}
//                                 className="text-xs text-red-500 hover:text-red-700 font-medium"
//                               >
//                                 Deselect all
//                               </button>
//                             )}
//                           </div>
//                         </div>
//                         {catServices.map(svc => {
//                           const svcChecked = isServiceChecked(svc.id, cat.id);
//                           return (
//                             <label key={svc.id} className="flex items-center gap-2 px-10 py-2 hover:bg-gray-100 cursor-pointer">
//                               <input
//                                 type="checkbox"
//                                 checked={svcChecked}
//                                 onChange={e => handleServiceToggle(svc.id, cat.id, e.target.checked)}
//                                 className="w-4 h-4 text-primary rounded flex-shrink-0"
//                               />
//                               <span className="text-sm text-gray-700">{svc.name_sor || svc.name_en || svc.id}</span>
//                             </label>
//                           );
//                         })}
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* ── Summary ── */}
//       <div className="flex flex-wrap gap-2 text-xs">
//         <span className={`px-2 py-1 rounded-full font-medium ${effectiveServiceCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
//           {access.allServices
//             ? `All services${(access.excludedServices?.length || 0) > 0 ? ` (−${access.excludedServices.length} excluded)` : ''}`
//             : `${effectiveServiceCount} service(s) selected`}
//         </span>
//         {role === 'admin' && (
//           <span className={`px-2 py-1 rounded-full font-medium ${(effectiveCatCount || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
//             {access.allCategories
//               ? `All categories${(access.excludedCategories?.length || 0) > 0 ? ` (−${access.excludedCategories.length} excluded)` : ''}`
//               : `${effectiveCatCount} category(s) selected`}
//           </span>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// function isSuperAdminRow(u) {
//   return u.uid === SUPER_ADMIN_UID || u.email === SUPER_ADMIN_EMAIL;
// }

// function defaultAccess(role) {
//   return { allCategories: false, allServices: false, categories: [], services: [], excludedCategories: [], excludedServices: [] };
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function UsersPage() {
//   const { user } = useAuth();
//   const [showModal, setShowModal]   = useState(false);
//   const [users, setUsers]           = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [services, setServices]     = useState([]);
//   const [loading, setLoading]       = useState(false);
//   const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, uid: null, email: null });
//   const [roleDialog, setRoleDialog]     = useState({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null });
//   const [editAccessUser, setEditAccessUser] = useState(null);
//   const [formData, setFormData]     = useState({ email: '', password: '', role: 'editor', displayName: '' });
//   const [accessData, setAccessData] = useState(defaultAccess('editor'));

//   const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

//   useEffect(() => {
//     if (isSuperAdmin) { loadUsers(); loadMeta(); }
//   }, [isSuperAdmin]);

//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'listAdminUsers')();
//       if (r.data.success) setUsers(r.data.users);
//     } catch (e) {
//       toast.error(e.code === 'functions/unauthenticated' ? 'Auth error — please log out and back in.' : 'Failed to load users: ' + e.message);
//     } finally { setLoading(false); }
//   };

//   const loadMeta = async () => {
//     try {
//       const [cats, svcs] = await Promise.all([getAllCategories(), getAllServices()]);
//       setCategories(cats); setServices(svcs);
//     } catch (e) { console.error('Failed to load meta:', e); }
//   };

//   const handleGeneratePassword = () => {
//     const ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
//     let pw = '';
//     for (let i = 0; i < 12; i++) pw += ch[Math.floor(Math.random() * ch.length)];
//     setFormData(f => ({ ...f, password: pw }));
//     toast.success('Password generated!');
//   };

//   const handleRoleChange = (newRole) => {
//     setFormData(f => ({ ...f, role: newRole }));
//     setAccessData(defaultAccess(newRole));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault(); setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'createUserWithRole')({ ...formData, access: accessData });
//       if (r.data.success) {
//         toast.success('User created!');
//         setShowModal(false);
//         setFormData({ email: '', password: '', role: 'editor', displayName: '' });
//         setAccessData(defaultAccess('editor'));
//         await loadUsers();
//       }
//     } catch (e) {
//       toast.error(e.message || 'Failed to create user');
//     } finally { setLoading(false); }
//   };

//   const handleDeleteUser = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'deleteUser')({ uid: deleteDialog.uid });
//       if (r.data.success) { toast.success('User deleted!'); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to delete user'); }
//     finally { setLoading(false); }
//   };

//   const handleRoleDropdownChange = (uid, email, oldRole, newRole) => {
//     if (oldRole === newRole) return;
//     setRoleDialog({ isOpen: true, uid, email, oldRole, newRole });
//   };

//   const handleConfirmRoleChange = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'updateUserRole')({ uid: roleDialog.uid, role: roleDialog.newRole });
//       if (r.data.success) { toast.success('Role updated!'); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to update role'); }
//     finally { setLoading(false); }
//   };

//   const handleToggleDisabled = async (uid, current) => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'toggleUserDisabled')({ uid, disabled: !current });
//       if (r.data.success) { toast.success(`User ${!current ? 'disabled' : 'enabled'}!`); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed'); }
//     finally { setLoading(false); }
//   };

//   const handleSaveAccess = async () => {
//     if (!editAccessUser) return;
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'updateUserAccess')({ uid: editAccessUser.uid, access: editAccessUser.access });
//       if (r.data.success) { toast.success('Access updated!'); setEditAccessUser(null); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to update access'); }
//     finally { setLoading(false); }
//   };

//   if (!isSuperAdmin) return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50"><Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//           <div className="card text-center py-12">
//             <FiAlertCircle className="mx-auto text-red-600 mb-4" size={48} />
//             <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
//             <p className="text-gray-600">Only the Super Admin can access User Management.</p>
//           </div>
//         </main>
//       </div>
//     </ProtectedRoute>
//   );

//   const roleColors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">

//           {/* Header */}
//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//               <p className="text-gray-600 mt-1">Manage admin users, roles, and access</p>
//             </div>
//             <div className="flex gap-2">
//               <button onClick={loadUsers} className="btn btn-secondary flex items-center gap-2" disabled={loading}>
//                 <FiRefreshCw className={loading ? 'animate-spin' : ''} size={20} /> Refresh
//               </button>
//               <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
//                 <FiPlus size={20} /> Add New User
//               </button>
//             </div>
//           </div>

//           {/* Super Admin Card */}
//           <div className="card mb-6">
//             <h2 className="text-xl font-bold mb-4">Current Super Admin</h2>
//             <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
//               <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">{user?.email?.[0]?.toUpperCase()}</div>
//               <div className="flex-1">
//                 <p className="font-medium text-gray-900">{user?.email}</p>
//                 <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">Super Admin</span>
//               </div>
//               <div className="flex items-center gap-1 text-gray-400 text-xs"><FiShield size={14} /> Protected</div>
//             </div>
//           </div>

//           {/* Users List */}
//           <div className="card">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold">Admin Users</h2>
//               <span className="text-sm text-gray-500">{users.length} users</span>
//             </div>

//             {loading ? (
//               <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
//             ) : users.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">No users yet. Use "Add New User" to create one.</div>
//             ) : (
//               <div className="space-y-3">
//                 {users.map(u => {
//                   const protected_ = isSuperAdminRow(u);
//                   return (
//                     <div key={u.uid} className={`p-4 rounded-lg border ${protected_ ? 'bg-red-50 border-red-200' : u.disabled ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-gray-50 border-gray-200'}`}>
//                       <div className="flex items-center justify-between flex-wrap gap-2">
//                         <div className="flex items-center gap-3">
//                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${protected_ ? 'bg-red-600' : u.disabled ? 'bg-gray-400' : 'bg-primary'}`}>
//                             {u.email?.[0]?.toUpperCase()}
//                           </div>
//                           <div>
//                             <div className="flex items-center gap-2 flex-wrap">
//                               <p className="font-medium text-gray-900 text-sm">{u.email}</p>
//                               {protected_ && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700"><FiShield size={10} /> Protected</span>}
//                               {u.disabled && <span className="text-xs font-medium text-red-500">● Disabled</span>}
//                             </div>
//                             {u.displayName && <p className="text-xs text-gray-500">{u.displayName}</p>}
//                             <p className="text-xs text-gray-400">Created: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</p>
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-2 flex-wrap justify-end">
//                           <select
//                             value={u.role}
//                             onChange={e => handleRoleDropdownChange(u.uid, u.email, u.role, e.target.value)}
//                             className="select text-sm py-1 w-auto"
//                             disabled={loading || protected_}
//                             title={protected_ ? 'Super admin role is protected' : ''}
//                           >
//                             <option value="editor">Editor</option>
//                             <option value="admin">Admin</option>
//                             <option value="super_admin">Super Admin</option>
//                           </select>
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role]}`}>{roleLabels[u.role]}</span>

//                           {!protected_ && (
//                             <button onClick={() => setEditAccessUser({ ...u, access: u.access || defaultAccess(u.role) })} className="p-2 hover:bg-blue-50 rounded text-blue-600" title="Edit access" disabled={loading}>
//                               <FiEdit2 size={15} />
//                             </button>
//                           )}
//                           {!protected_ && (
//                             <button onClick={() => handleToggleDisabled(u.uid, u.disabled)} className={`p-2 rounded ${u.disabled ? 'text-green-600 hover:bg-green-50' : 'text-yellow-600 hover:bg-yellow-50'}`} disabled={loading}>
//                               {u.disabled ? <FiToggleLeft size={17} /> : <FiToggleRight size={17} />}
//                             </button>
//                           )}
//                           {!protected_ ? (
//                             <button onClick={() => setDeleteDialog({ isOpen: true, uid: u.uid, email: u.email })} className="p-2 hover:bg-red-50 rounded text-red-600" disabled={loading}><FiTrash2 size={15} /></button>
//                           ) : <div className="w-8" />}
//                         </div>
//                       </div>

//                       {/* Access badges */}
//                       {!protected_ && u.access && (
//                         <div className="mt-2 ml-13 flex flex-wrap gap-1.5 pl-12">
//                           <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
//                             {u.access.allServices
//                               ? `All services${u.access.excludedServices?.length ? ` (−${u.access.excludedServices.length})` : ''}`
//                               : `${(u.access.services || []).length} services`}
//                           </span>
//                           {u.role === 'admin' && (
//                             <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">
//                               {u.access.allCategories
//                                 ? `All categories${u.access.excludedCategories?.length ? ` (−${u.access.excludedCategories.length})` : ''}`
//                                 : `${(u.access.categories || []).length} categories`}
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Create User Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">Add New User</h2>
//               <button onClick={() => setShowModal(false)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div className="modal-body space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
//                   <input type="text" value={formData.displayName} onChange={e => setFormData(f => ({ ...f, displayName: e.target.value }))} className="input" placeholder="John Doe" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
//                   <input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className="input" required />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
//                   <div className="flex gap-2">
//                     <input type="text" value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} className="input flex-1" required minLength={6} />
//                     <button type="button" onClick={handleGeneratePassword} className="btn btn-secondary whitespace-nowrap">Generate</button>
//                   </div>
//                   <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
//                   <select value={formData.role} onChange={e => handleRoleChange(e.target.value)} className="select" required>
//                     <option value="editor">Editor — Services only</option>
//                     <option value="admin">Admin — Services + Categories</option>
//                     <option value="super_admin">Super Admin — Full access</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Access Permissions</label>
//                   <AccessSelector role={formData.role} access={accessData} onChange={setAccessData} categories={categories} services={services} />
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Edit Access Modal */}
//       {editAccessUser && (
//         <div className="modal-overlay" onClick={() => setEditAccessUser(null)}>
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <div>
//                 <h2 className="text-xl font-bold">Edit Access</h2>
//                 <p className="text-sm text-gray-500">{editAccessUser.email} · {roleLabels[editAccessUser.role]}</p>
//               </div>
//               <button onClick={() => setEditAccessUser(null)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <div className="modal-body">
//               <AccessSelector
//                 role={editAccessUser.role}
//                 access={editAccessUser.access}
//                 onChange={newAccess => setEditAccessUser(u => ({ ...u, access: newAccess }))}
//                 categories={categories}
//                 services={services}
//               />
//             </div>
//             <div className="modal-footer">
//               <button onClick={() => setEditAccessUser(null)} className="btn btn-secondary">Cancel</button>
//               <button onClick={handleSaveAccess} className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Access'}</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <DeleteUserDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, uid: null, email: null })} onConfirm={handleDeleteUser} email={deleteDialog.email} />
//       <RoleChangeDialog isOpen={roleDialog.isOpen} onClose={() => setRoleDialog({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null })} onConfirm={handleConfirmRoleChange} email={roleDialog.email} oldRole={roleDialog.oldRole} newRole={roleDialog.newRole} />
//     </ProtectedRoute>
//   );
// }



//  NEW 5


// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { app } from '../../lib/firebase';
// import { getAllCategories, getAllServices } from '../../lib/firestore';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import {
//   FiPlus, FiTrash2, FiX, FiAlertCircle, FiRefreshCw,
//   FiToggleLeft, FiToggleRight, FiArrowRight, FiShield, FiEdit2,
//   FiChevronDown, FiChevronRight
// } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);
// const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
// const SUPER_ADMIN_UID   = process.env.NEXT_PUBLIC_SUPER_ADMIN_UID;

// // ─── Delete Dialog ────────────────────────────────────────────────────────────
// function DeleteUserDialog({ isOpen, onClose, onConfirm, email }) {
//   const [typed, setTyped] = useState('');
//   if (!isOpen) return null;
//   const handleClose   = () => { setTyped(''); onClose(); };
//   const handleConfirm = () => { setTyped(''); onConfirm(); onClose(); };
//   return (
//     <div className="modal-overlay" onClick={handleClose}>
//       <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><FiTrash2 className="text-red-600" size={20} /></div>
//             <h2 className="text-xl font-bold">Delete User</h2>
//           </div>
//           <button onClick={handleClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//         </div>
//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">This will permanently delete the user. This action <strong>cannot be undone.</strong></p>
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm font-medium text-red-800 break-all">{email}</p></div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Type the email address to confirm:</label>
//             <input type="text" value={typed} onChange={e => setTyped(e.target.value)} className="input" placeholder={email} autoFocus />
//           </div>
//         </div>
//         <div className="modal-footer">
//           <button onClick={handleClose} className="btn btn-secondary">Cancel</button>
//           <button onClick={handleConfirm} disabled={typed !== email} className="btn btn-danger disabled:opacity-40 disabled:cursor-not-allowed">Delete User</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Role Change Dialog ───────────────────────────────────────────────────────
// function RoleChangeDialog({ isOpen, onClose, onConfirm, email, oldRole, newRole }) {
//   if (!isOpen) return null;
//   const labels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };
//   const colors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <h2 className="text-xl font-bold">Confirm Role Change</h2>
//           <button onClick={onClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//         </div>
//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">Changing role for:</p>
//           <div className="bg-gray-50 border border-gray-200 rounded-lg p-3"><p className="text-sm font-medium break-all">{email}</p></div>
//           <div className="flex items-center justify-center gap-4 py-2">
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[oldRole]}`}>{labels[oldRole]}</span>
//             <FiArrowRight size={20} className="text-gray-400" />
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[newRole]}`}>{labels[newRole]}</span>
//           </div>
//           <p className="text-sm text-gray-500 text-center">Takes effect on their next login.</p>
//         </div>
//         <div className="modal-footer">
//           <button onClick={onClose} className="btn btn-secondary">Cancel</button>
//           <button onClick={() => { onConfirm(); onClose(); }} className="btn btn-primary">Confirm Change</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Access Selector ──────────────────────────────────────────────────────────
// // access shape:
// // {
// //   allCategories: bool,   // admin only
// //   allServices:   bool,
// //   categories:    string[],  // category IDs explicitly allowed (admin)
// //   services:      string[],  // service IDs explicitly allowed
// //   excludedCategories: string[],  // excluded when allCategories=true
// //   excludedServices:   string[],  // excluded when allServices=true
// // }

// function AccessSelector({ role, access, onChange, categories, services }) {
//   const [expandedCats, setExpandedCats] = useState({});

//   if (role === 'super_admin') {
//     return (
//       <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
//         Super Admin has unrestricted access to everything.
//       </div>
//     );
//   }

//   // Safely extract category ID regardless of whether categoryref is a
//   // string ("categories_new/ID"), a plain ID, or a Firestore DocumentReference object
//   const extractCatId = (categoryRef) => {
//     if (!categoryRef) return null;
//     if (typeof categoryRef === 'object' && categoryRef.id) return categoryRef.id;
//     if (typeof categoryRef === 'object' && categoryRef.path) return categoryRef.path.split('/').pop();
//     if (typeof categoryRef === 'string') return categoryRef.includes('/') ? categoryRef.split('/').pop() : categoryRef;
//     return null;
//   };

//   // Group services by category
//   const servicesByCat = categories.reduce((acc, cat) => {
//     acc[cat.id] = services.filter(s => extractCatId(s.categoryref) === cat.id);
//     return acc;
//   }, {});

//   const toggleExpand = (catId) => setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));

//   // ── helpers to check effective state ──────────────────────────────────────

//   // Is a service effectively checked?
//   const isServiceChecked = (svcId, parentCatId) => {
//     if (access.allServices) return !(access.excludedServices || []).includes(svcId);
//     if (access.services?.includes(svcId)) return true;
//     // inherited from category (admin role)
//     if (role === 'admin') {
//       if (access.allCategories) return !(access.excludedCategories || []).includes(parentCatId);
//       if (access.categories?.includes(parentCatId)) return true;
//     }
//     return false;
//   };

//   // Is a category effectively checked? (admin only)
//   const isCategoryChecked = (catId) => {
//     if (access.allCategories) return !(access.excludedCategories || []).includes(catId);
//     return access.categories?.includes(catId) || false;
//   };

//   // Is all-services toggle indeterminate? (some but not all)
//   const someServicesChecked = services.some(s => isServiceChecked(s.id, null));
//   const allServicesEffective = access.allServices && !(access.excludedServices?.length);

//   // ── toggle handlers ────────────────────────────────────────────────────────

//   const handleAllServices = (checked) => {
//     onChange({ ...access, allServices: checked, excludedServices: [], services: [], categories: [], excludedCategories: [], allCategories: checked && role === 'admin' ? access.allCategories : access.allCategories });
//   };

//   const handleAllCategories = (checked) => {
//     onChange({ ...access, allCategories: checked, excludedCategories: [], categories: [] });
//   };

//   const handleServiceToggle = (svcId, parentCatId, checked) => {
//     let newAccess = { ...access };

//     if (access.allServices) {
//       // We're in "all selected" mode — toggle exclusions
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else if (role === 'admin' && access.allCategories && !access.excludedCategories?.includes(parentCatId)) {
//       // Category is fully included — toggle service exclusion
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else if (role === 'admin' && access.categories?.includes(parentCatId)) {
//       // Category explicitly included — toggle service exclusion
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else {
//       // Manual selection mode
//       const svcs = [...(access.services || [])];
//       if (checked) {
//         if (!svcs.includes(svcId)) svcs.push(svcId);
//       } else {
//         const idx = svcs.indexOf(svcId);
//         if (idx > -1) svcs.splice(idx, 1);
//       }
//       newAccess.services = svcs;
//     }
//     onChange(newAccess);
//   };

//   const handleCategoryToggle = (catId, checked) => {
//     let newAccess = { ...access };
//     const catServices = servicesByCat[catId]?.map(s => s.id) || [];

//     if (access.allCategories) {
//       // In "all categories" mode — toggle exclusions
//       const excluded = [...(access.excludedCategories || [])];
//       if (!checked) {
//         if (!excluded.includes(catId)) excluded.push(catId);
//         // Also add all its services to excluded
//         const excSvcs = [...(access.excludedServices || [])];
//         catServices.forEach(id => { if (!excSvcs.includes(id)) excSvcs.push(id); });
//         newAccess.excludedServices = excSvcs;
//       } else {
//         const idx = excluded.indexOf(catId);
//         if (idx > -1) excluded.splice(idx, 1);
//         // Remove its services from excluded
//         const excSvcs = (access.excludedServices || []).filter(id => !catServices.includes(id));
//         newAccess.excludedServices = excSvcs;
//       }
//       newAccess.excludedCategories = excluded;
//     } else {
//       // Manual category selection
//       const cats = [...(access.categories || [])];
//       let svcs = [...(access.services || [])];
//       if (checked) {
//         if (!cats.includes(catId)) cats.push(catId);
//         // Auto-add all services of this category
//         catServices.forEach(id => { if (!svcs.includes(id)) svcs.push(id); });
//       } else {
//         const idx = cats.indexOf(catId);
//         if (idx > -1) cats.splice(idx, 1);
//         // Remove all services of this category from explicit services
//         svcs = svcs.filter(id => !catServices.includes(id));
//       }
//       newAccess.categories = cats;
//       newAccess.services   = svcs;
//     }
//     onChange(newAccess);
//   };

//   // ── count summary — unique effective IDs to avoid double-count ────────────
//   const effectiveServiceCount = (() => {
//     if (access.allServices) return services.length - (access.excludedServices?.length || 0);
//     const checked = new Set();
//     services.forEach(s => { if (isServiceChecked(s.id, extractCatId(s.categoryref))) checked.add(s.id); });
//     return checked.size;
//   })();

//   const effectiveCatCount = role === 'admin'
//     ? access.allCategories
//       ? categories.length - (access.excludedCategories?.length || 0)
//       : (access.categories?.length || 0)
//     : null;

//   // ── per-category select/deselect all ────────────────────────────────────────
//   const handleCategorySelectAll = (catId, selectAll) => {
//     const catServices = servicesByCat[catId]?.map(s => s.id) || [];
//     if (catServices.length === 0) return;
//     let newAccess = { ...access };
//     if (selectAll) {
//       const svcs = new Set(access.services || []);
//       catServices.forEach(id => svcs.add(id));
//       newAccess.services = [...svcs];
//       newAccess.excludedServices = (access.excludedServices || []).filter(id => !catServices.includes(id));
//     } else {
//       newAccess.services = (access.services || []).filter(id => !catServices.includes(id));
//       if (access.allServices) {
//         const excl = new Set(access.excludedServices || []);
//         catServices.forEach(id => excl.add(id));
//         newAccess.excludedServices = [...excl];
//       }
//     }
//     onChange(newAccess);
//   };

//   return (
//     <div className="space-y-3">

//       {/* ── All Services ── */}
//       <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${access.allServices ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:border-blue-200'}`}>
//         <input
//           type="checkbox"
//           checked={access.allServices || false}
//           onChange={e => handleAllServices(e.target.checked)}
//           className="w-4 h-4 text-primary rounded"
//         />
//         <div>
//           <p className="text-sm font-semibold text-gray-800">All Services</p>
//           <p className="text-xs text-gray-500">Grant access to every service. Uncheck individual ones below if needed.</p>
//         </div>
//       </label>

//       {/* ── All Categories (admin only) ── */}
//       {role === 'admin' && (
//         <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${access.allCategories ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:border-green-200'}`}>
//           <input
//             type="checkbox"
//             checked={access.allCategories || false}
//             onChange={e => handleAllCategories(e.target.checked)}
//             className="w-4 h-4 text-primary rounded"
//           />
//           <div>
//             <p className="text-sm font-semibold text-gray-800">All Categories</p>
//             <p className="text-xs text-gray-500">Grant access to every category. Uncheck individual ones below if needed.</p>
//           </div>
//         </label>
//       )}

//       {/* ── Per-category tree ── */}
//       <div className="border border-gray-200 rounded-lg overflow-hidden">
//         <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
//           <p className="text-sm font-semibold text-gray-700">
//             {role === 'admin' ? 'Categories & Services' : 'Services by Category'}
//           </p>
//           <p className="text-xs text-gray-400">Click category to expand</p>
//         </div>

//         <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
//           {categories.map(cat => {
//             const catServices = servicesByCat[cat.id] || [];
//             const catChecked  = isCategoryChecked(cat.id);
//             const isExpanded  = expandedCats[cat.id];

//             // Count checked services in this category
//             const checkedSvcCount = catServices.filter(s => isServiceChecked(s.id, cat.id)).length;
//             const allCatSvcsChecked = catServices.length > 0 && checkedSvcCount === catServices.length;
//             const someCatSvcsChecked = checkedSvcCount > 0 && !allCatSvcsChecked;

//             return (
//               <div key={cat.id}>
//                 {/* Category row */}
//                 <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50">
//                   {/* Expand toggle */}
//                   <button type="button" onClick={() => toggleExpand(cat.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
//                     {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
//                   </button>

//                   {/* Category checkbox — admin only */}
//                   {role === 'admin' && (
//                     <input
//                       type="checkbox"
//                       checked={catChecked}
//                       ref={el => { if (el) el.indeterminate = someCatSvcsChecked && !catChecked; }}
//                       onChange={e => handleCategoryToggle(cat.id, e.target.checked)}
//                       className="w-4 h-4 text-primary rounded flex-shrink-0"
//                     />
//                   )}

//                   <button type="button" onClick={() => toggleExpand(cat.id)} className="flex-1 text-left">
//                     <span className="text-sm font-medium text-gray-800">
//                       {cat.name_sor || cat.name_en || cat.id}
//                     </span>
//                     <span className="ml-2 text-xs text-gray-400">
//                       {checkedSvcCount}/{catServices.length} services
//                     </span>
//                   </button>
//                 </div>

//                 {/* Services under this category — shown when expanded */}
//                 {isExpanded && (
//                   <div className="bg-gray-50 border-t border-gray-100">
//                     {catServices.length === 0 ? (
//                       <p className="text-xs text-gray-400 italic px-10 py-2">No services in this category</p>
//                     ) : (
//                       <>
//                         {/* Select all / Deselect all row — editor only (admin uses category checkbox) */}
//                         {
//                         role === "editor" &&
//                          <div className="flex items-center justify-between px-10 py-1.5 border-b border-gray-200 bg-gray-100">
//                           <span className="text-xs text-gray-500">{checkedSvcCount}/{catServices.length} selected</span>
//                           <div className="flex gap-2">
//                             {checkedSvcCount < catServices.length && (
//                               <button
//                                 type="button"
//                                 onClick={() => handleCategorySelectAll(cat.id, true)}
//                                 className="text-xs text-blue-600 hover:text-blue-800 font-medium"
//                               >
//                                 Select all
//                               </button>
//                             )}
//                             {checkedSvcCount > 0 && (
//                               <button
//                                 type="button"
//                                 onClick={() => handleCategorySelectAll(cat.id, false)}
//                                 className="text-xs text-red-500 hover:text-red-700 font-medium"
//                               >
//                                 Deselect all
//                               </button>
//                             )}
//                           </div>
//                         </div>}
//                         {catServices.map(svc => {
//                           const svcChecked = isServiceChecked(svc.id, cat.id);
//                           return (
//                             <label key={svc.id} className="flex items-center gap-2 px-10 py-2 hover:bg-gray-100 cursor-pointer">
//                               <input
//                                 type="checkbox"
//                                 checked={svcChecked}
//                                 onChange={e => handleServiceToggle(svc.id, cat.id, e.target.checked)}
//                                 className="w-4 h-4 text-primary rounded flex-shrink-0"
//                               />
//                               <span className="text-sm text-gray-700">{svc.name_sor || svc.name_en || svc.id}</span>
//                             </label>
//                           );
//                         })}
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* ── Summary ── */}
//       <div className="flex flex-wrap gap-2 text-xs">
//         <span className={`px-2 py-1 rounded-full font-medium ${effectiveServiceCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
//           {access.allServices
//             ? `All services${(access.excludedServices?.length || 0) > 0 ? ` (−${access.excludedServices.length} excluded)` : ''}`
//             : `${effectiveServiceCount} service(s) selected`}
//         </span>
//         {role === 'admin' && (
//           <span className={`px-2 py-1 rounded-full font-medium ${(effectiveCatCount || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
//             {access.allCategories
//               ? `All categories${(access.excludedCategories?.length || 0) > 0 ? ` (−${access.excludedCategories.length} excluded)` : ''}`
//               : `${effectiveCatCount} category(s) selected`}
//           </span>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// function isSuperAdminRow(u) {
//   return u.uid === SUPER_ADMIN_UID || u.email === SUPER_ADMIN_EMAIL;
// }

// function defaultAccess(role) {
//   return { allCategories: false, allServices: false, categories: [], services: [], excludedCategories: [], excludedServices: [] };
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function UsersPage() {
//   const { user } = useAuth();
//   const [showModal, setShowModal]   = useState(false);
//   const [users, setUsers]           = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [services, setServices]     = useState([]);
//   const [loading, setLoading]       = useState(false);
//   const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, uid: null, email: null });
//   const [roleDialog, setRoleDialog]     = useState({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null });
//   const [editAccessUser, setEditAccessUser] = useState(null);
//   const [formData, setFormData]     = useState({ email: '', password: '', role: 'editor', displayName: '' });
//   const [accessData, setAccessData] = useState(defaultAccess('editor'));

//   const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

//   useEffect(() => {
//     if (isSuperAdmin) { loadUsers(); loadMeta(); }
//   }, [isSuperAdmin]);

//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'listAdminUsers')();
//       if (r.data.success) setUsers(r.data.users);
//     } catch (e) {
//       toast.error(e.code === 'functions/unauthenticated' ? 'Auth error — please log out and back in.' : 'Failed to load users: ' + e.message);
//     } finally { setLoading(false); }
//   };

//   const loadMeta = async () => {
//     try {
//       const [cats, svcs] = await Promise.all([getAllCategories(), getAllServices()]);
//       setCategories(cats); setServices(svcs);
//     } catch (e) { console.error('Failed to load meta:', e); }
//   };

//   const handleGeneratePassword = () => {
//     const ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
//     let pw = '';
//     for (let i = 0; i < 12; i++) pw += ch[Math.floor(Math.random() * ch.length)];
//     setFormData(f => ({ ...f, password: pw }));
//     toast.success('Password generated!');
//   };

//   const handleRoleChange = (newRole) => {
//     setFormData(f => ({ ...f, role: newRole }));
//     setAccessData(defaultAccess(newRole));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault(); setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'createUserWithRole')({ ...formData, access: accessData });
//       if (r.data.success) {
//         toast.success('User created!');
//         setShowModal(false);
//         setFormData({ email: '', password: '', role: 'editor', displayName: '' });
//         setAccessData(defaultAccess('editor'));
//         await loadUsers();
//       }
//     } catch (e) {
//       toast.error(e.message || 'Failed to create user');
//     } finally { setLoading(false); }
//   };

//   const handleDeleteUser = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'deleteUser')({ uid: deleteDialog.uid });
//       if (r.data.success) { toast.success('User deleted!'); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to delete user'); }
//     finally { setLoading(false); }
//   };

//   const handleRoleDropdownChange = (uid, email, oldRole, newRole) => {
//     if (oldRole === newRole) return;
//     setRoleDialog({ isOpen: true, uid, email, oldRole, newRole });
//   };

//   const handleConfirmRoleChange = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'updateUserRole')({ uid: roleDialog.uid, role: roleDialog.newRole });
//       if (r.data.success) { toast.success('Role updated!'); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to update role'); }
//     finally { setLoading(false); }
//   };

//   const handleToggleDisabled = async (uid, current) => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'toggleUserDisabled')({ uid, disabled: !current });
//       if (r.data.success) { toast.success(`User ${!current ? 'disabled' : 'enabled'}!`); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed'); }
//     finally { setLoading(false); }
//   };

//   const handleSaveAccess = async () => {
//     if (!editAccessUser) return;
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'updateUserAccess')({ uid: editAccessUser.uid, access: editAccessUser.access });
//       if (r.data.success) { toast.success('Access updated!'); setEditAccessUser(null); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to update access'); }
//     finally { setLoading(false); }
//   };

//   if (!isSuperAdmin) return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50"><Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//           <div className="card text-center py-12">
//             <FiAlertCircle className="mx-auto text-red-600 mb-4" size={48} />
//             <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
//             <p className="text-gray-600">Only the Super Admin can access User Management.</p>
//           </div>
//         </main>
//       </div>
//     </ProtectedRoute>
//   );

//   const roleColors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">

//           {/* Header */}
//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//               <p className="text-gray-600 mt-1">Manage admin users, roles, and access</p>
//             </div>
//             <div className="flex gap-2">
//               <button onClick={loadUsers} className="btn btn-secondary flex items-center gap-2" disabled={loading}>
//                 <FiRefreshCw className={loading ? 'animate-spin' : ''} size={20} /> Refresh
//               </button>
//               <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
//                 <FiPlus size={20} /> Add New User
//               </button>
//             </div>
//           </div>

//           {/* Super Admin Card */}
//           <div className="card mb-6">
//             <h2 className="text-xl font-bold mb-4">Current Super Admin</h2>
//             <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
//               <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">{user?.email?.[0]?.toUpperCase()}</div>
//               <div className="flex-1">
//                 <p className="font-medium text-gray-900">{user?.email}</p>
//                 <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">Super Admin</span>
//               </div>
//               <div className="flex items-center gap-1 text-gray-400 text-xs"><FiShield size={14} /> Protected</div>
//             </div>
//           </div>

//           {/* Users List */}
//           <div className="card">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold">Admin Users</h2>
//               <span className="text-sm text-gray-500">{users.length} users</span>
//             </div>

//             {loading ? (
//               <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
//             ) : users.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">No users yet. Use "Add New User" to create one.</div>
//             ) : (
//               <div className="space-y-3">
//                 {users.map(u => {
//                   const protected_ = isSuperAdminRow(u);
//                   return (
//                     <div key={u.uid} className={`p-4 rounded-lg border ${protected_ ? 'bg-red-50 border-red-200' : u.disabled ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-gray-50 border-gray-200'}`}>
//                       <div className="flex items-center justify-between flex-wrap gap-2">
//                         <div className="flex items-center gap-3">
//                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${protected_ ? 'bg-red-600' : u.disabled ? 'bg-gray-400' : 'bg-primary'}`}>
//                             {u.email?.[0]?.toUpperCase()}
//                           </div>
//                           <div>
//                             <div className="flex items-center gap-2 flex-wrap">
//                               <p className="font-medium text-gray-900 text-sm">{u.email}</p>
//                               {protected_ && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700"><FiShield size={10} /> Protected</span>}
//                               {u.disabled && <span className="text-xs font-medium text-red-500">● Disabled</span>}
//                             </div>
//                             {u.displayName && <p className="text-xs text-gray-500">{u.displayName}</p>}
//                             <p className="text-xs text-gray-400">Created: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</p>
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-2 flex-wrap justify-end">
//                           <select
//                             value={u.role}
//                             onChange={e => handleRoleDropdownChange(u.uid, u.email, u.role, e.target.value)}
//                             className="select text-sm py-1 w-auto"
//                             disabled={loading || protected_}
//                             title={protected_ ? 'Super admin role is protected' : ''}
//                           >
//                             <option value="editor">Editor</option>
//                             <option value="admin">Admin</option>
//                             <option value="super_admin">Super Admin</option>
//                           </select>
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role]}`}>{roleLabels[u.role]}</span>

//                           {!protected_ && (
//                             <button onClick={() => setEditAccessUser({ ...u, access: u.access || defaultAccess(u.role) })} className="p-2 hover:bg-blue-50 rounded text-blue-600" title="Edit access" disabled={loading}>
//                               <FiEdit2 size={15} />
//                             </button>
//                           )}
//                           {!protected_ && (
//                             <button onClick={() => handleToggleDisabled(u.uid, u.disabled)} className={`p-2 rounded ${u.disabled ? 'text-green-600 hover:bg-green-50' : 'text-yellow-600 hover:bg-yellow-50'}`} disabled={loading}>
//                               {u.disabled ? <FiToggleLeft size={17} /> : <FiToggleRight size={17} />}
//                             </button>
//                           )}
//                           {!protected_ ? (
//                             <button onClick={() => setDeleteDialog({ isOpen: true, uid: u.uid, email: u.email })} className="p-2 hover:bg-red-50 rounded text-red-600" disabled={loading}><FiTrash2 size={15} /></button>
//                           ) : <div className="w-8" />}
//                         </div>
//                       </div>

//                       {/* Access badges */}
//                       {!protected_ && u.access && (
//                         <div className="mt-2 ml-13 flex flex-wrap gap-1.5 pl-12">
//                           <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
//                             {u.access.allServices
//                               ? `All services${u.access.excludedServices?.length ? ` (−${u.access.excludedServices.length})` : ''}`
//                               : `${(u.access.services || []).length} services`}
//                           </span>
//                           {u.role === 'admin' && (
//                             <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">
//                               {u.access.allCategories
//                                 ? `All categories${u.access.excludedCategories?.length ? ` (−${u.access.excludedCategories.length})` : ''}`
//                                 : `${(u.access.categories || []).length} categories`}
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Create User Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">Add New User</h2>
//               <button onClick={() => setShowModal(false)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div className="modal-body space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
//                   <input type="text" value={formData.displayName} onChange={e => setFormData(f => ({ ...f, displayName: e.target.value }))} className="input" placeholder="John Doe" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
//                   <input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className="input" required />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
//                   <div className="flex gap-2">
//                     <input type="text" value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} className="input flex-1" required minLength={6} />
//                     <button type="button" onClick={handleGeneratePassword} className="btn btn-secondary whitespace-nowrap">Generate</button>
//                   </div>
//                   <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
//                   <select value={formData.role} onChange={e => handleRoleChange(e.target.value)} className="select" required>
//                     <option value="editor">Editor — Services only</option>
//                     <option value="admin">Admin — Services + Categories</option>
//                     <option value="super_admin">Super Admin — Full access</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Access Permissions</label>
//                   <AccessSelector role={formData.role} access={accessData} onChange={setAccessData} categories={categories} services={services} />
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Edit Access Modal */}
//       {editAccessUser && (
//         <div className="modal-overlay" onClick={() => setEditAccessUser(null)}>
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <div>
//                 <h2 className="text-xl font-bold">Edit Access</h2>
//                 <p className="text-sm text-gray-500">{editAccessUser.email} · {roleLabels[editAccessUser.role]}</p>
//               </div>
//               <button onClick={() => setEditAccessUser(null)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <div className="modal-body">
//               <AccessSelector
//                 role={editAccessUser.role}
//                 access={editAccessUser.access}
//                 onChange={newAccess => setEditAccessUser(u => ({ ...u, access: newAccess }))}
//                 categories={categories}
//                 services={services}
//               />
//             </div>
//             <div className="modal-footer">
//               <button onClick={() => setEditAccessUser(null)} className="btn btn-secondary">Cancel</button>
//               <button onClick={handleSaveAccess} className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Access'}</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <DeleteUserDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, uid: null, email: null })} onConfirm={handleDeleteUser} email={deleteDialog.email} />
//       <RoleChangeDialog isOpen={roleDialog.isOpen} onClose={() => setRoleDialog({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null })} onConfirm={handleConfirmRoleChange} email={roleDialog.email} oldRole={roleDialog.oldRole} newRole={roleDialog.newRole} />
//     </ProtectedRoute>
//   );
// }




// NEW 6



// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { app } from '../../lib/firebase';
// import { getAllCategories, getAllServices } from '../../lib/firestore';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import {
//   FiPlus, FiTrash2, FiX, FiAlertCircle, FiRefreshCw,
//   FiToggleLeft, FiToggleRight, FiArrowRight, FiShield, FiEdit2,
//   FiChevronDown, FiChevronRight
// } from 'react-icons/fi';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);
// const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
// const SUPER_ADMIN_UID   = process.env.NEXT_PUBLIC_SUPER_ADMIN_UID;

// // ─── Delete Dialog ────────────────────────────────────────────────────────────
// function DeleteUserDialog({ isOpen, onClose, onConfirm, email }) {
//   const [typed, setTyped] = useState('');
//   if (!isOpen) return null;
//   const handleClose   = () => { setTyped(''); onClose(); };
//   const handleConfirm = () => { setTyped(''); onConfirm(); onClose(); };
//   return (
//     <div className="modal-overlay" onClick={handleClose}>
//       <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center"><FiTrash2 className="text-red-600" size={20} /></div>
//             <h2 className="text-xl font-bold">Delete User</h2>
//           </div>
//           <button onClick={handleClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//         </div>
//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">This will permanently delete the user. This action <strong>cannot be undone.</strong></p>
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm font-medium text-red-800 break-all">{email}</p></div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Type the email address to confirm:</label>
//             <input type="text" value={typed} onChange={e => setTyped(e.target.value)} className="input" placeholder={email} autoFocus />
//           </div>
//         </div>
//         <div className="modal-footer">
//           <button onClick={handleClose} className="btn btn-secondary">Cancel</button>
//           <button onClick={handleConfirm} disabled={typed !== email} className="btn btn-danger disabled:opacity-40 disabled:cursor-not-allowed">Delete User</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Role Change Dialog ───────────────────────────────────────────────────────
// function RoleChangeDialog({ isOpen, onClose, onConfirm, email, oldRole, newRole }) {
//   if (!isOpen) return null;
//   const labels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };
//   const colors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <h2 className="text-xl font-bold">Confirm Role Change</h2>
//           <button onClick={onClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//         </div>
//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">Changing role for:</p>
//           <div className="bg-gray-50 border border-gray-200 rounded-lg p-3"><p className="text-sm font-medium break-all">{email}</p></div>
//           <div className="flex items-center justify-center gap-4 py-2">
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[oldRole]}`}>{labels[oldRole]}</span>
//             <FiArrowRight size={20} className="text-gray-400" />
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[newRole]}`}>{labels[newRole]}</span>
//           </div>
//           <p className="text-sm text-gray-500 text-center">Takes effect on their next login.</p>
//         </div>
//         <div className="modal-footer">
//           <button onClick={onClose} className="btn btn-secondary">Cancel</button>
//           <button onClick={() => { onConfirm(); onClose(); }} className="btn btn-primary">Confirm Change</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Access Selector ──────────────────────────────────────────────────────────
// // access shape:
// // {
// //   allCategories: bool,   // admin only
// //   allServices:   bool,
// //   categories:    string[],  // category IDs explicitly allowed (admin)
// //   services:      string[],  // service IDs explicitly allowed
// //   excludedCategories: string[],  // excluded when allCategories=true
// //   excludedServices:   string[],  // excluded when allServices=true
// // }

// function AccessSelector({ role, access, onChange, categories, services }) {
//   const [expandedCats, setExpandedCats] = useState({});

//   if (role === 'super_admin') {
//     return (
//       <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
//         Super Admin has unrestricted access to everything.
//       </div>
//     );
//   }

//   // Safely extract category ID regardless of whether categoryref is a
//   // string ("categories_new/ID"), a plain ID, or a Firestore DocumentReference object
//   const extractCatId = (categoryRef) => {
//     if (!categoryRef) return null;
//     if (typeof categoryRef === 'object' && categoryRef.id) return categoryRef.id;
//     if (typeof categoryRef === 'object' && categoryRef.path) return categoryRef.path.split('/').pop();
//     if (typeof categoryRef === 'string') return categoryRef.includes('/') ? categoryRef.split('/').pop() : categoryRef;
//     return null;
//   };

//   // Group services by category
//   const servicesByCat = categories.reduce((acc, cat) => {
//     acc[cat.id] = services.filter(s => extractCatId(s.categoryref) === cat.id);
//     return acc;
//   }, {});

//   const toggleExpand = (catId) => setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));

//   // ── helpers to check effective state ──────────────────────────────────────

//   // Is a service effectively checked?
//   const isServiceChecked = (svcId, parentCatId) => {
//     if (access.allServices) return !(access.excludedServices || []).includes(svcId);
//     if (access.services?.includes(svcId)) return true;
//     // inherited from category (admin role)
//     if (role === 'admin') {
//       if (access.allCategories) return !(access.excludedCategories || []).includes(parentCatId);
//       if (access.categories?.includes(parentCatId)) return true;
//     }
//     return false;
//   };

//   // Is a category effectively checked? (admin only)
//   const isCategoryChecked = (catId) => {
//     if (access.allCategories) return !(access.excludedCategories || []).includes(catId);
//     return access.categories?.includes(catId) || false;
//   };

//   // Does this category have SOME (but not all) services individually selected?
//   // Used to show indeterminate dash when services are selected without the whole category
//   const isCategoryIndeterminate = (catId) => {
//     if (isCategoryChecked(catId)) return false; // already fully checked, not indeterminate
//     const catServices = servicesByCat[catId] || [];
//     if (catServices.length === 0) return false;
//     const someSelected = catServices.some(s => (access.services || []).includes(s.id));
//     return someSelected;
//   };

//   // Is all-services toggle indeterminate? (some but not all)
//   const someServicesChecked = services.some(s => isServiceChecked(s.id, null));
//   const allServicesEffective = access.allServices && !(access.excludedServices?.length);

//   // ── toggle handlers ────────────────────────────────────────────────────────

//   const handleAllServices = (checked) => {
//     onChange({ ...access, allServices: checked, excludedServices: [], services: [], categories: [], excludedCategories: [], allCategories: checked && role === 'admin' ? access.allCategories : access.allCategories });
//   };

//   const handleAllCategories = (checked) => {
//     onChange({ ...access, allCategories: checked, excludedCategories: [], categories: [] });
//   };

//   const handleServiceToggle = (svcId, parentCatId, checked) => {
//     let newAccess = { ...access };

//     if (access.allServices) {
//       // We're in "all selected" mode — toggle exclusions
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else if (role === 'admin' && access.allCategories && !access.excludedCategories?.includes(parentCatId)) {
//       // Category is fully included — toggle service exclusion
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else if (role === 'admin' && access.categories?.includes(parentCatId)) {
//       // Category explicitly included — toggle service exclusion
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else {
//       // Manual selection mode
//       const svcs = [...(access.services || [])];
//       if (checked) {
//         if (!svcs.includes(svcId)) svcs.push(svcId);
//       } else {
//         const idx = svcs.indexOf(svcId);
//         if (idx > -1) svcs.splice(idx, 1);
//       }
//       newAccess.services = svcs;
//     }
//     onChange(newAccess);
//   };

//   const handleCategoryToggle = (catId, checked) => {
//     let newAccess = { ...access };
//     const catServices = servicesByCat[catId]?.map(s => s.id) || [];

//     if (access.allCategories) {
//       // In "all categories" mode — toggle exclusions
//       const excluded = [...(access.excludedCategories || [])];
//       if (!checked) {
//         if (!excluded.includes(catId)) excluded.push(catId);
//         // Also add all its services to excluded
//         const excSvcs = [...(access.excludedServices || [])];
//         catServices.forEach(id => { if (!excSvcs.includes(id)) excSvcs.push(id); });
//         newAccess.excludedServices = excSvcs;
//       } else {
//         const idx = excluded.indexOf(catId);
//         if (idx > -1) excluded.splice(idx, 1);
//         // Remove its services from excluded
//         const excSvcs = (access.excludedServices || []).filter(id => !catServices.includes(id));
//         newAccess.excludedServices = excSvcs;
//       }
//       newAccess.excludedCategories = excluded;
//     } else {
//       // Manual category selection
//       const cats = [...(access.categories || [])];
//       let svcs = [...(access.services || [])];
//       if (checked) {
//         if (!cats.includes(catId)) cats.push(catId);
//         // Auto-add all services of this category
//         catServices.forEach(id => { if (!svcs.includes(id)) svcs.push(id); });
//       } else {
//         const idx = cats.indexOf(catId);
//         if (idx > -1) cats.splice(idx, 1);
//         // Remove all services of this category from explicit services
//         svcs = svcs.filter(id => !catServices.includes(id));
//       }
//       newAccess.categories = cats;
//       newAccess.services   = svcs;
//     }
//     onChange(newAccess);
//   };

//   // ── count summary — unique effective IDs to avoid double-count ────────────
//   const effectiveServiceCount = (() => {
//     if (access.allServices) return services.length - (access.excludedServices?.length || 0);
//     const checked = new Set();
//     services.forEach(s => { if (isServiceChecked(s.id, extractCatId(s.categoryref))) checked.add(s.id); });
//     return checked.size;
//   })();

//   const effectiveCatCount = role === 'admin'
//     ? access.allCategories
//       ? categories.length - (access.excludedCategories?.length || 0)
//       : (access.categories?.length || 0)
//     : null;

//   // ── per-category select/deselect all ────────────────────────────────────────
//   const handleCategorySelectAll = (catId, selectAll) => {
//     const catServices = servicesByCat[catId]?.map(s => s.id) || [];
//     if (catServices.length === 0) return;
//     let newAccess = { ...access };
//     if (selectAll) {
//       const svcs = new Set(access.services || []);
//       catServices.forEach(id => svcs.add(id));
//       newAccess.services = [...svcs];
//       newAccess.excludedServices = (access.excludedServices || []).filter(id => !catServices.includes(id));
//     } else {
//       newAccess.services = (access.services || []).filter(id => !catServices.includes(id));
//       if (access.allServices) {
//         const excl = new Set(access.excludedServices || []);
//         catServices.forEach(id => excl.add(id));
//         newAccess.excludedServices = [...excl];
//       }
//     }
//     onChange(newAccess);
//   };

//   return (
//     <div className="space-y-3">

//       {/* ── All Services ── */}
//       <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${access.allServices ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:border-blue-200'}`}>
//         <input
//           type="checkbox"
//           checked={access.allServices || false}
//           onChange={e => handleAllServices(e.target.checked)}
//           className="w-4 h-4 text-primary rounded"
//         />
//         <div>
//           <p className="text-sm font-semibold text-gray-800">All Services</p>
//           <p className="text-xs text-gray-500">Grant access to every service. Uncheck individual ones below if needed.</p>
//         </div>
//       </label>

//       {/* ── All Categories (admin only) ── */}
//       {role === 'admin' && (
//         <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${access.allCategories ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:border-green-200'}`}>
//           <input
//             type="checkbox"
//             checked={access.allCategories || false}
//             onChange={e => handleAllCategories(e.target.checked)}
//             className="w-4 h-4 text-primary rounded"
//           />
//           <div>
//             <p className="text-sm font-semibold text-gray-800">All Categories</p>
//             <p className="text-xs text-gray-500">Grant access to every category. Uncheck individual ones below if needed.</p>
//           </div>
//         </label>
//       )}

//       {/* ── Per-category tree ── */}
//       <div className="border border-gray-200 rounded-lg overflow-hidden">
//         <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
//           <p className="text-sm font-semibold text-gray-700">
//             {role === 'admin' ? 'Categories & Services' : 'Services by Category'}
//           </p>
//           <p className="text-xs text-gray-400">Click category to expand</p>
//         </div>

//         <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
//           {categories.map(cat => {
//             const catServices = servicesByCat[cat.id] || [];
//             const catChecked       = isCategoryChecked(cat.id);
//             const catIndeterminate = isCategoryIndeterminate(cat.id);
//             const isExpanded       = expandedCats[cat.id];

//             // Count checked services in this category
//             const checkedSvcCount = catServices.filter(s => isServiceChecked(s.id, cat.id)).length;
//             const allCatSvcsChecked = catServices.length > 0 && checkedSvcCount === catServices.length;
//             const someCatSvcsChecked = checkedSvcCount > 0 && !allCatSvcsChecked;

//             return (
//               <div key={cat.id}>
//                 {/* Category row */}
//                 <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50">
//                   {/* Expand toggle */}
//                   <button type="button" onClick={() => toggleExpand(cat.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
//                     {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
//                   </button>

//                   {/* Category checkbox — admin only */}
//                   {role === 'admin' && (
//                     <input
//                       type="checkbox"
//                       checked={catChecked}
//                       ref={el => { if (el) el.indeterminate = catIndeterminate || (someCatSvcsChecked && !catChecked); }}
//                       onChange={e => handleCategoryToggle(cat.id, e.target.checked)}
//                       className="w-4 h-4 text-primary rounded flex-shrink-0"
//                     />
//                   )}

//                   <button type="button" onClick={() => toggleExpand(cat.id)} className="flex-1 text-left">
//                     <span className="text-sm font-medium text-gray-800">
//                       {cat.name_sor || cat.name_en || cat.id}
//                     </span>
//                     <span className="ml-2 text-xs text-gray-400">
//                       {checkedSvcCount}/{catServices.length} services
//                     </span>
//                   </button>
//                 </div>

//                 {/* Services under this category — shown when expanded */}
//                 {isExpanded && (
//                   <div className="bg-gray-50 border-t border-gray-100">
//                     {catServices.length === 0 ? (
//                       <p className="text-xs text-gray-400 italic px-10 py-2">No services in this category</p>
//                     ) : (
//                       <>
//                         {/* Select all / Deselect all row — editor only (admin uses category checkbox) */}
//                         {role === "editor" && <div className="flex items-center justify-between px-10 py-1.5 border-b border-gray-200 bg-gray-100">
//                           <span className="text-xs text-gray-500">{checkedSvcCount}/{catServices.length} selected</span>
//                           <div className="flex gap-2">
//                             {checkedSvcCount < catServices.length && (
//                               <button
//                                 type="button"
//                                 onClick={() => handleCategorySelectAll(cat.id, true)}
//                                 className="text-xs text-blue-600 hover:text-blue-800 font-medium"
//                               >
//                                 Select all
//                               </button>
//                             )}
//                             {checkedSvcCount > 0 && (
//                               <button
//                                 type="button"
//                                 onClick={() => handleCategorySelectAll(cat.id, false)}
//                                 className="text-xs text-red-500 hover:text-red-700 font-medium"
//                               >
//                                 Deselect all
//                               </button>
//                             )}
//                           </div>
//                         </div>}
//                         {catServices.map(svc => {
//                           const svcChecked = isServiceChecked(svc.id, cat.id);
//                           return (
//                             <label key={svc.id} className="flex items-center gap-2 px-10 py-2 hover:bg-gray-100 cursor-pointer">
//                               <input
//                                 type="checkbox"
//                                 checked={svcChecked}
//                                 onChange={e => handleServiceToggle(svc.id, cat.id, e.target.checked)}
//                                 className="w-4 h-4 text-primary rounded flex-shrink-0"
//                               />
//                               <span className="text-sm text-gray-700">{svc.name_sor || svc.name_en || svc.id}</span>
//                             </label>
//                           );
//                         })}
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* ── Summary ── */}
//       <div className="flex flex-wrap gap-2 text-xs">
//         <span className={`px-2 py-1 rounded-full font-medium ${effectiveServiceCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
//           {access.allServices
//             ? `All services${(access.excludedServices?.length || 0) > 0 ? ` (−${access.excludedServices.length} excluded)` : ''}`
//             : `${effectiveServiceCount} service(s) selected`}
//         </span>
//         {role === 'admin' && (
//           <span className={`px-2 py-1 rounded-full font-medium ${(effectiveCatCount || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
//             {access.allCategories
//               ? `All categories${(access.excludedCategories?.length || 0) > 0 ? ` (−${access.excludedCategories.length} excluded)` : ''}`
//               : `${effectiveCatCount} category(s) selected`}
//           </span>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// function isSuperAdminRow(u) {
//   return u.uid === SUPER_ADMIN_UID || u.email === SUPER_ADMIN_EMAIL;
// }

// function defaultAccess(role) {
//   return { allCategories: false, allServices: false, categories: [], services: [], excludedCategories: [], excludedServices: [] };
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function UsersPage() {
//   const { user } = useAuth();
//   const [showModal, setShowModal]   = useState(false);
//   const [users, setUsers]           = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [services, setServices]     = useState([]);
//   const [loading, setLoading]       = useState(false);
//   const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, uid: null, email: null });
//   const [roleDialog, setRoleDialog]     = useState({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null });
//   const [editAccessUser, setEditAccessUser] = useState(null);
//   const [formData, setFormData]     = useState({ email: '', password: '', role: 'editor', displayName: '' });
//   const [accessData, setAccessData] = useState(defaultAccess('editor'));

//   const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

//   useEffect(() => {
//     if (isSuperAdmin) { loadUsers(); loadMeta(); }
//   }, [isSuperAdmin]);

//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'listAdminUsers')();
//       if (r.data.success) setUsers(r.data.users);
//     } catch (e) {
//       toast.error(e.code === 'functions/unauthenticated' ? 'Auth error — please log out and back in.' : 'Failed to load users: ' + e.message);
//     } finally { setLoading(false); }
//   };

//   const loadMeta = async () => {
//     try {
//       const [cats, svcs] = await Promise.all([getAllCategories(), getAllServices()]);
//       setCategories(cats); setServices(svcs);
//     } catch (e) { console.error('Failed to load meta:', e); }
//   };

//   const handleGeneratePassword = () => {
//     const ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
//     let pw = '';
//     for (let i = 0; i < 12; i++) pw += ch[Math.floor(Math.random() * ch.length)];
//     setFormData(f => ({ ...f, password: pw }));
//     toast.success('Password generated!');
//   };

//   const handleRoleChange = (newRole) => {
//     setFormData(f => ({ ...f, role: newRole }));
//     setAccessData(defaultAccess(newRole));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault(); setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'createUserWithRole')({ ...formData, access: accessData });
//       if (r.data.success) {
//         toast.success('User created!');
//         setShowModal(false);
//         setFormData({ email: '', password: '', role: 'editor', displayName: '' });
//         setAccessData(defaultAccess('editor'));
//         await loadUsers();
//       }
//     } catch (e) {
//       toast.error(e.message || 'Failed to create user');
//     } finally { setLoading(false); }
//   };

//   const handleDeleteUser = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'deleteUser')({ uid: deleteDialog.uid });
//       if (r.data.success) { toast.success('User deleted!'); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to delete user'); }
//     finally { setLoading(false); }
//   };

//   const handleRoleDropdownChange = (uid, email, oldRole, newRole) => {
//     if (oldRole === newRole) return;
//     setRoleDialog({ isOpen: true, uid, email, oldRole, newRole });
//   };

//   const handleConfirmRoleChange = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'updateUserRole')({ uid: roleDialog.uid, role: roleDialog.newRole });
//       if (r.data.success) { toast.success('Role updated!'); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to update role'); }
//     finally { setLoading(false); }
//   };

//   const handleToggleDisabled = async (uid, current) => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'toggleUserDisabled')({ uid, disabled: !current });
//       if (r.data.success) { toast.success(`User ${!current ? 'disabled' : 'enabled'}!`); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed'); }
//     finally { setLoading(false); }
//   };

//   const handleSaveAccess = async () => {
//     if (!editAccessUser) return;
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'updateUserAccess')({ uid: editAccessUser.uid, access: editAccessUser.access });
//       if (r.data.success) { toast.success('Access updated!'); setEditAccessUser(null); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to update access'); }
//     finally { setLoading(false); }
//   };

//   if (!isSuperAdmin) return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50"><Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//           <div className="card text-center py-12">
//             <FiAlertCircle className="mx-auto text-red-600 mb-4" size={48} />
//             <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
//             <p className="text-gray-600">Only the Super Admin can access User Management.</p>
//           </div>
//         </main>
//       </div>
//     </ProtectedRoute>
//   );

//   const roleColors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">

//           {/* Header */}
//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//               <p className="text-gray-600 mt-1">Manage admin users, roles, and access</p>
//             </div>
//             <div className="flex gap-2">
//               <button onClick={loadUsers} className="btn btn-secondary flex items-center gap-2" disabled={loading}>
//                 <FiRefreshCw className={loading ? 'animate-spin' : ''} size={20} /> Refresh
//               </button>
//               <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
//                 <FiPlus size={20} /> Add New User
//               </button>
//             </div>
//           </div>

//           {/* Super Admin Card */}
//           <div className="card mb-6">
//             <h2 className="text-xl font-bold mb-4">Current Super Admin</h2>
//             <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
//               <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">{user?.email?.[0]?.toUpperCase()}</div>
//               <div className="flex-1">
//                 <p className="font-medium text-gray-900">{user?.email}</p>
//                 <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">Super Admin</span>
//               </div>
//               <div className="flex items-center gap-1 text-gray-400 text-xs"><FiShield size={14} /> Protected</div>
//             </div>
//           </div>

//           {/* Users List */}
//           <div className="card">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold">Admin Users</h2>
//               <span className="text-sm text-gray-500">{users.length} users</span>
//             </div>

//             {loading ? (
//               <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
//             ) : users.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">No users yet. Use "Add New User" to create one.</div>
//             ) : (
//               <div className="space-y-3">
//                 {users.map(u => {
//                   const protected_ = isSuperAdminRow(u);
//                   return (
//                     <div key={u.uid} className={`p-4 rounded-lg border ${protected_ ? 'bg-red-50 border-red-200' : u.disabled ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-gray-50 border-gray-200'}`}>
//                       <div className="flex items-center justify-between flex-wrap gap-2">
//                         <div className="flex items-center gap-3">
//                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${protected_ ? 'bg-red-600' : u.disabled ? 'bg-gray-400' : 'bg-primary'}`}>
//                             {u.email?.[0]?.toUpperCase()}
//                           </div>
//                           <div>
//                             <div className="flex items-center gap-2 flex-wrap">
//                               <p className="font-medium text-gray-900 text-sm">{u.email}</p>
//                               {protected_ && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700"><FiShield size={10} /> Protected</span>}
//                               {u.disabled && <span className="text-xs font-medium text-red-500">● Disabled</span>}
//                             </div>
//                             {u.displayName && <p className="text-xs text-gray-500">{u.displayName}</p>}
//                             <p className="text-xs text-gray-400">Created: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</p>
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-2 flex-wrap justify-end">
//                           <select
//                             value={u.role}
//                             onChange={e => handleRoleDropdownChange(u.uid, u.email, u.role, e.target.value)}
//                             className="select text-sm py-1 w-auto"
//                             disabled={loading || protected_}
//                             title={protected_ ? 'Super admin role is protected' : ''}
//                           >
//                             <option value="editor">Editor</option>
//                             <option value="admin">Admin</option>
//                             <option value="super_admin">Super Admin</option>
//                           </select>
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role]}`}>{roleLabels[u.role]}</span>

//                           {!protected_ && (
//                             <button onClick={() => setEditAccessUser({ ...u, access: u.access || defaultAccess(u.role) })} className="p-2 hover:bg-blue-50 rounded text-blue-600" title="Edit access" disabled={loading}>
//                               <FiEdit2 size={15} />
//                             </button>
//                           )}
//                           {!protected_ && (
//                             <button onClick={() => handleToggleDisabled(u.uid, u.disabled)} className={`p-2 rounded ${u.disabled ? 'text-green-600 hover:bg-green-50' : 'text-yellow-600 hover:bg-yellow-50'}`} disabled={loading}>
//                               {u.disabled ? <FiToggleLeft size={17} /> : <FiToggleRight size={17} />}
//                             </button>
//                           )}
//                           {!protected_ ? (
//                             <button onClick={() => setDeleteDialog({ isOpen: true, uid: u.uid, email: u.email })} className="p-2 hover:bg-red-50 rounded text-red-600" disabled={loading}><FiTrash2 size={15} /></button>
//                           ) : <div className="w-8" />}
//                         </div>
//                       </div>

//                       {/* Access badges */}
//                       {!protected_ && u.access && (
//                         <div className="mt-2 ml-13 flex flex-wrap gap-1.5 pl-12">
//                           <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
//                             {u.access.allServices
//                               ? `All services${u.access.excludedServices?.length ? ` (−${u.access.excludedServices.length})` : ''}`
//                               : `${(u.access.services || []).length} services`}
//                           </span>
//                           {u.role === 'admin' && (
//                             <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">
//                               {u.access.allCategories
//                                 ? `All categories${u.access.excludedCategories?.length ? ` (−${u.access.excludedCategories.length})` : ''}`
//                                 : `${(u.access.categories || []).length} categories`}
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Create User Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">Add New User</h2>
//               <button onClick={() => setShowModal(false)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div className="modal-body space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
//                   <input type="text" value={formData.displayName} onChange={e => setFormData(f => ({ ...f, displayName: e.target.value }))} className="input" placeholder="John Doe" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
//                   <input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className="input" required />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
//                   <div className="flex gap-2">
//                     <input type="text" value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} className="input flex-1" required minLength={6} />
//                     <button type="button" onClick={handleGeneratePassword} className="btn btn-secondary whitespace-nowrap">Generate</button>
//                   </div>
//                   <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
//                   <select value={formData.role} onChange={e => handleRoleChange(e.target.value)} className="select" required>
//                     <option value="editor">Editor — Services only</option>
//                     <option value="admin">Admin — Services + Categories</option>
//                     <option value="super_admin">Super Admin — Full access</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Access Permissions</label>
//                   <AccessSelector role={formData.role} access={accessData} onChange={setAccessData} categories={categories} services={services} />
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Edit Access Modal */}
//       {editAccessUser && (
//         <div className="modal-overlay" onClick={() => setEditAccessUser(null)}>
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <div>
//                 <h2 className="text-xl font-bold">Edit Access</h2>
//                 <p className="text-sm text-gray-500">{editAccessUser.email} · {roleLabels[editAccessUser.role]}</p>
//               </div>
//               <button onClick={() => setEditAccessUser(null)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <div className="modal-body">
//               <AccessSelector
//                 role={editAccessUser.role}
//                 access={editAccessUser.access}
//                 onChange={newAccess => setEditAccessUser(u => ({ ...u, access: newAccess }))}
//                 categories={categories}
//                 services={services}
//               />
//             </div>
//             <div className="modal-footer">
//               <button onClick={() => setEditAccessUser(null)} className="btn btn-secondary">Cancel</button>
//               <button onClick={handleSaveAccess} className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Access'}</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <DeleteUserDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, uid: null, email: null })} onConfirm={handleDeleteUser} email={deleteDialog.email} />
//       <RoleChangeDialog isOpen={roleDialog.isOpen} onClose={() => setRoleDialog({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null })} onConfirm={handleConfirmRoleChange} email={roleDialog.email} oldRole={roleDialog.oldRole} newRole={roleDialog.newRole} />
//     </ProtectedRoute>
//   );
// }


// NEW 7


// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { app } from '../../lib/firebase';
// import { getAllCategories, getAllServices } from '../../lib/firestore';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import {
//   FiPlus, FiTrash2, FiX, FiAlertCircle, FiRefreshCw,
//   FiToggleLeft, FiToggleRight, FiArrowRight, FiShield, FiEdit2,
//   FiChevronDown, FiChevronRight
// } from 'react-icons/fi';
// import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);
// const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
// const SUPER_ADMIN_UID   = process.env.NEXT_PUBLIC_SUPER_ADMIN_UID;

// // ─── Role Change Dialog ───────────────────────────────────────────────────────
// function RoleChangeDialog({ isOpen, onClose, onConfirm, email, oldRole, newRole }) {
//   if (!isOpen) return null;
//   const labels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };
//   const colors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <h2 className="text-xl font-bold">Confirm Role Change</h2>
//           <button onClick={onClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//         </div>
//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">Changing role for:</p>
//           <div className="bg-gray-50 border border-gray-200 rounded-lg p-3"><p className="text-sm font-medium break-all">{email}</p></div>
//           <div className="flex items-center justify-center gap-4 py-2">
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[oldRole]}`}>{labels[oldRole]}</span>
//             <FiArrowRight size={20} className="text-gray-400" />
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[newRole]}`}>{labels[newRole]}</span>
//           </div>
//           <p className="text-sm text-gray-500 text-center">Takes effect on their next login.</p>
//         </div>
//         <div className="modal-footer">
//           <button onClick={onClose} className="btn btn-secondary">Cancel</button>
//           <button onClick={() => { onConfirm(); onClose(); }} className="btn btn-primary">Confirm Change</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Access Selector ──────────────────────────────────────────────────────────
// // access shape:
// // {
// //   allCategories: bool,   // admin only
// //   allServices:   bool,
// //   categories:    string[],  // category IDs explicitly allowed (admin)
// //   services:      string[],  // service IDs explicitly allowed
// //   excludedCategories: string[],  // excluded when allCategories=true
// //   excludedServices:   string[],  // excluded when allServices=true
// // }

// function AccessSelector({ role, access, onChange, categories, services }) {
//   const [expandedCats, setExpandedCats] = useState({});

//   if (role === 'super_admin') {
//     return (
//       <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
//         Super Admin has unrestricted access to everything.
//       </div>
//     );
//   }

//   // Safely extract category ID regardless of whether categoryref is a
//   // string ("categories_new/ID"), a plain ID, or a Firestore DocumentReference object
//   const extractCatId = (categoryRef) => {
//     if (!categoryRef) return null;
//     if (typeof categoryRef === 'object' && categoryRef.id) return categoryRef.id;
//     if (typeof categoryRef === 'object' && categoryRef.path) return categoryRef.path.split('/').pop();
//     if (typeof categoryRef === 'string') return categoryRef.includes('/') ? categoryRef.split('/').pop() : categoryRef;
//     return null;
//   };

//   // Group services by category
//   const servicesByCat = categories.reduce((acc, cat) => {
//     acc[cat.id] = services.filter(s => extractCatId(s.categoryref) === cat.id);
//     return acc;
//   }, {});

//   const toggleExpand = (catId) => setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));

//   // ── helpers to check effective state ──────────────────────────────────────

//   // Is a service effectively checked?
//   const isServiceChecked = (svcId, parentCatId) => {
//     if (access.allServices) return !(access.excludedServices || []).includes(svcId);
//     if (access.services?.includes(svcId)) return true;
//     // inherited from category (admin role)
//     if (role === 'admin') {
//       if (access.allCategories) return !(access.excludedCategories || []).includes(parentCatId);
//       if (access.categories?.includes(parentCatId)) return true;
//     }
//     return false;
//   };

//   // Is a category effectively checked? (admin only)
//   const isCategoryChecked = (catId) => {
//     if (access.allCategories) return !(access.excludedCategories || []).includes(catId);
//     return access.categories?.includes(catId) || false;
//   };

//   // Does this category have SOME (but not all) services individually selected?
//   // Used to show indeterminate dash when services are selected without the whole category
//   const isCategoryIndeterminate = (catId) => {
//     if (isCategoryChecked(catId)) return false; // already fully checked, not indeterminate
//     const catServices = servicesByCat[catId] || [];
//     if (catServices.length === 0) return false;
//     const someSelected = catServices.some(s => (access.services || []).includes(s.id));
//     return someSelected;
//   };

//   // Is all-services toggle indeterminate? (some but not all)
//   // const someServicesChecked = services.some(s => isServiceChecked(s.id, null));
//   const allServicesEffective = access.allServices && !(access.excludedServices?.length);

//   // ── toggle handlers ────────────────────────────────────────────────────────

//   const handleAllServices = (checked) => {
//     onChange({ ...access, allServices: checked, excludedServices: [], services: [], categories: [], excludedCategories: [], allCategories: checked && role === 'admin' ? access.allCategories : access.allCategories });
//   };

//   const handleAllCategories = (checked) => {
//     onChange({ ...access, allCategories: checked, excludedCategories: [], categories: [] });
//   };

//   const handleServiceToggle = (svcId, parentCatId, checked) => {
//     let newAccess = { ...access };

//     if (access.allServices) {
//       // We're in "all selected" mode — toggle exclusions
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else if (role === 'admin' && access.allCategories && !access.excludedCategories?.includes(parentCatId)) {
//       // Category is fully included — toggle service exclusion
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else if (role === 'admin' && access.categories?.includes(parentCatId)) {
//       // Category explicitly included — toggle service exclusion
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else {
//       // Manual selection mode
//       const svcs = [...(access.services || [])];
//       if (checked) {
//         if (!svcs.includes(svcId)) svcs.push(svcId);
//       } else {
//         const idx = svcs.indexOf(svcId);
//         if (idx > -1) svcs.splice(idx, 1);
//       }
//       newAccess.services = svcs;
//     }
//     onChange(newAccess);
//   };

//   const handleCategoryToggle = (catId, checked) => {
//     let newAccess = { ...access };
//     const catServices = servicesByCat[catId]?.map(s => s.id) || [];

//     if (access.allCategories) {
//       // In "all categories" mode — toggle exclusions
//       const excluded = [...(access.excludedCategories || [])];
//       if (!checked) {
//         if (!excluded.includes(catId)) excluded.push(catId);
//         // Also add all its services to excluded
//         const excSvcs = [...(access.excludedServices || [])];
//         catServices.forEach(id => { if (!excSvcs.includes(id)) excSvcs.push(id); });
//         newAccess.excludedServices = excSvcs;
//       } else {
//         const idx = excluded.indexOf(catId);
//         if (idx > -1) excluded.splice(idx, 1);
//         // Remove its services from excluded
//         const excSvcs = (access.excludedServices || []).filter(id => !catServices.includes(id));
//         newAccess.excludedServices = excSvcs;
//       }
//       newAccess.excludedCategories = excluded;
//     } else {
//       // Manual category selection
//       const cats = [...(access.categories || [])];
//       let svcs = [...(access.services || [])];
//       if (checked) {
//         if (!cats.includes(catId)) cats.push(catId);
//         // Auto-add all services of this category
//         catServices.forEach(id => { if (!svcs.includes(id)) svcs.push(id); });
//       } else {
//         const idx = cats.indexOf(catId);
//         if (idx > -1) cats.splice(idx, 1);
//         // Remove all services of this category from explicit services
//         svcs = svcs.filter(id => !catServices.includes(id));
//       }
//       newAccess.categories = cats;
//       newAccess.services   = svcs;
//     }
//     onChange(newAccess);
//   };

//   // ── count summary — unique effective IDs to avoid double-count ────────────
//   const effectiveServiceCount = (() => {
//     if (access.allServices) return services.length - (access.excludedServices?.length || 0);
//     const checked = new Set();
//     services.forEach(s => { if (isServiceChecked(s.id, extractCatId(s.categoryref))) checked.add(s.id); });
//     return checked.size;
//   })();

//   const effectiveCatCount = role === 'admin'
//     ? access.allCategories
//       ? categories.length - (access.excludedCategories?.length || 0)
//       : (access.categories?.length || 0)
//     : null;

//   // ── per-category select/deselect all ────────────────────────────────────────
//   const handleCategorySelectAll = (catId, selectAll) => {
//     const catServices = servicesByCat[catId]?.map(s => s.id) || [];
//     if (catServices.length === 0) return;
//     let newAccess = { ...access };
//     if (selectAll) {
//       const svcs = new Set(access.services || []);
//       catServices.forEach(id => svcs.add(id));
//       newAccess.services = [...svcs];
//       newAccess.excludedServices = (access.excludedServices || []).filter(id => !catServices.includes(id));
//     } else {
//       newAccess.services = (access.services || []).filter(id => !catServices.includes(id));
//       if (access.allServices) {
//         const excl = new Set(access.excludedServices || []);
//         catServices.forEach(id => excl.add(id));
//         newAccess.excludedServices = [...excl];
//       }
//     }
//     onChange(newAccess);
//   };

//   return (
//     <div className="space-y-3">

//       {/* ── All Services ── */}
//       <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${access.allServices ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:border-blue-200'}`}>
//         <input
//           type="checkbox"
//           checked={access.allServices || false}
//           onChange={e => handleAllServices(e.target.checked)}
//           className="w-4 h-4 text-primary rounded"
//         />
//         <div>
//           <p className="text-sm font-semibold text-gray-800">All Services</p>
//           <p className="text-xs text-gray-500">Grant access to every service. Uncheck individual ones below if needed.</p>
//         </div>
//       </label>

//       {/* ── All Categories (admin only) ── */}
//       {role === 'admin' && (
//         <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${access.allCategories ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:border-green-200'}`}>
//           <input
//             type="checkbox"
//             checked={access.allCategories || false}
//             onChange={e => handleAllCategories(e.target.checked)}
//             className="w-4 h-4 text-primary rounded"
//           />
//           <div>
//             <p className="text-sm font-semibold text-gray-800">All Categories</p>
//             <p className="text-xs text-gray-500">Grant access to every category. Uncheck individual ones below if needed.</p>
//           </div>
//         </label>
//       )}

//       {/* ── Per-category tree ── */}
//       <div className="border border-gray-200 rounded-lg overflow-hidden">
//         <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
//           <p className="text-sm font-semibold text-gray-700">
//             {role === 'admin' ? 'Categories & Services' : 'Services by Category'}
//           </p>
//           <p className="text-xs text-gray-400">Click category to expand</p>
//         </div>

//         <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
//           {categories.map(cat => {
//             const catServices = servicesByCat[cat.id] || [];
//             const catChecked       = isCategoryChecked(cat.id);
//             const catIndeterminate = isCategoryIndeterminate(cat.id);
//             const isExpanded       = expandedCats[cat.id];

//             // Count checked services in this category
//             const checkedSvcCount = catServices.filter(s => isServiceChecked(s.id, cat.id)).length;
//             const allCatSvcsChecked = catServices.length > 0 && checkedSvcCount === catServices.length;
//             const someCatSvcsChecked = checkedSvcCount > 0 && !allCatSvcsChecked;

//             return (
//               <div key={cat.id}>
//                 {/* Category row */}
//                 <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50">
//                   {/* Expand toggle */}
//                   <button type="button" onClick={() => toggleExpand(cat.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
//                     {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
//                   </button>

//                   {/* Category checkbox — admin only */}
//                   {role === 'admin' && (
//                     <input
//                       type="checkbox"
//                       checked={catChecked}
//                       ref={el => { if (el) el.indeterminate = catIndeterminate || (someCatSvcsChecked && !catChecked); }}
//                       onChange={e => handleCategoryToggle(cat.id, e.target.checked)}
//                       className="w-4 h-4 text-primary rounded flex-shrink-0"
//                     />
//                   )}

//                   <button type="button" onClick={() => toggleExpand(cat.id)} className="flex-1 text-left">
//                     <span className="text-sm font-medium text-gray-800">
//                       {cat.name_sor || cat.name_en || cat.id}
//                     </span>
//                     <span className="ml-2 text-xs text-gray-400">
//                       {checkedSvcCount}/{catServices.length} services
//                     </span>
//                   </button>
//                 </div>

//                 {/* Services under this category — shown when expanded */}
//                 {isExpanded && (
//                   <div className="bg-gray-50 border-t border-gray-100">
//                     {catServices.length === 0 ? (
//                       <p className="text-xs text-gray-400 italic px-10 py-2">No services in this category</p>
//                     ) : (
//                       <>
//                         {/* Select all / Deselect all row — editor only (admin uses category checkbox) */}
//                         {role === "editor" && <div className="flex items-center justify-between px-10 py-1.5 border-b border-gray-200 bg-gray-100">
//                           <span className="text-xs text-gray-500">{checkedSvcCount}/{catServices.length} selected</span>
//                           <div className="flex gap-2">
//                             {checkedSvcCount < catServices.length && (
//                               <button
//                                 type="button"
//                                 onClick={() => handleCategorySelectAll(cat.id, true)}
//                                 className="text-xs text-blue-600 hover:text-blue-800 font-medium"
//                               >
//                                 Select all
//                               </button>
//                             )}
//                             {checkedSvcCount > 0 && (
//                               <button
//                                 type="button"
//                                 onClick={() => handleCategorySelectAll(cat.id, false)}
//                                 className="text-xs text-red-500 hover:text-red-700 font-medium"
//                               >
//                                 Deselect all
//                               </button>
//                             )}
//                           </div>
//                         </div>}
//                         {catServices.map(svc => {
//                           const svcChecked = isServiceChecked(svc.id, cat.id);
//                           return (
//                             <label key={svc.id} className="flex items-center gap-2 px-10 py-2 hover:bg-gray-100 cursor-pointer">
//                               <input
//                                 type="checkbox"
//                                 checked={svcChecked}
//                                 onChange={e => handleServiceToggle(svc.id, cat.id, e.target.checked)}
//                                 className="w-4 h-4 text-primary rounded flex-shrink-0"
//                               />
//                               <span className="text-sm text-gray-700">{svc.name_sor || svc.name_en || svc.id}</span>
//                             </label>
//                           );
//                         })}
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* ── Summary ── */}
//       <div className="flex flex-wrap gap-2 text-xs">
//         <span className={`px-2 py-1 rounded-full font-medium ${effectiveServiceCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
//           {access.allServices
//             ? `All services${(access.excludedServices?.length || 0) > 0 ? ` (−${access.excludedServices.length} excluded)` : ''}`
//             : `${effectiveServiceCount} service(s) selected`}
//         </span>
//         {role === 'admin' && (
//           <span className={`px-2 py-1 rounded-full font-medium ${(effectiveCatCount || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
//             {access.allCategories
//               ? `All categories${(access.excludedCategories?.length || 0) > 0 ? ` (−${access.excludedCategories.length} excluded)` : ''}`
//               : `${effectiveCatCount} category(s) selected`}
//           </span>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// function isSuperAdminRow(u) {
//   return u.uid === SUPER_ADMIN_UID || u.email === SUPER_ADMIN_EMAIL;
// }

// function defaultAccess(role) {
//   return { allCategories: false, allServices: false, categories: [], services: [], excludedCategories: [], excludedServices: [] };
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function UsersPage() {
//   const { user } = useAuth();
//   const [showModal, setShowModal]   = useState(false);
//   const [users, setUsers]           = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [services, setServices]     = useState([]);
//   const [loading, setLoading]       = useState(false);
//   const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, uid: null, email: null });
//   const [roleDialog, setRoleDialog]     = useState({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null });
//   const [editAccessUser, setEditAccessUser] = useState(null);
//   const [formData, setFormData]     = useState({ email: '', password: '', role: 'editor', displayName: '' });
//   const [accessData, setAccessData] = useState(defaultAccess('editor'));

//   const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

//   useEffect(() => {
//     if (isSuperAdmin) { loadUsers(); loadMeta(); }
//   }, [isSuperAdmin]);

//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'listAdminUsers')();
//       if (r.data.success) setUsers(r.data.users);
//     } catch (e) {
//       toast.error(e.code === 'functions/unauthenticated' ? 'Auth error — please log out and back in.' : 'Failed to load users: ' + e.message);
//     } finally { setLoading(false); }
//   };

//   const loadMeta = async () => {
//     try {
//       const [cats, svcs] = await Promise.all([getAllCategories(), getAllServices()]);
//       setCategories(cats); setServices(svcs);
//     } catch (e) { console.error('Failed to load meta:', e); }
//   };

//   const handleGeneratePassword = () => {
//     const ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
//     let pw = '';
//     for (let i = 0; i < 12; i++) pw += ch[Math.floor(Math.random() * ch.length)];
//     setFormData(f => ({ ...f, password: pw }));
//     toast.success('Password generated!');
//   };

//   const handleRoleChange = (newRole) => {
//     setFormData(f => ({ ...f, role: newRole }));
//     setAccessData(defaultAccess(newRole));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault(); setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'createUserWithRole')({ ...formData, access: accessData });
//       if (r.data.success) {
//         toast.success('User created!');
//         setShowModal(false);
//         setFormData({ email: '', password: '', role: 'editor', displayName: '' });
//         setAccessData(defaultAccess('editor'));
//         await loadUsers();
//       }
//     } catch (e) {
//       toast.error(e.message || 'Failed to create user');
//     } finally { setLoading(false); }
//   };

//   const handleDeleteUser = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'deleteUser')({ uid: deleteDialog.uid });
//       if (r.data.success) { toast.success('User deleted!'); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to delete user'); }
//     finally { setLoading(false); }
//   };

//   const handleRoleDropdownChange = (uid, email, oldRole, newRole) => {
//     if (oldRole === newRole) return;
//     setRoleDialog({ isOpen: true, uid, email, oldRole, newRole });
//   };

//   const handleConfirmRoleChange = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'updateUserRole')({ uid: roleDialog.uid, role: roleDialog.newRole });
//       if (r.data.success) { toast.success('Role updated!'); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to update role'); }
//     finally { setLoading(false); }
//   };

//   const handleToggleDisabled = async (uid, current) => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'toggleUserDisabled')({ uid, disabled: !current });
//       if (r.data.success) { toast.success(`User ${!current ? 'disabled' : 'enabled'}!`); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed'); }
//     finally { setLoading(false); }
//   };

//   const handleSaveAccess = async () => {
//     if (!editAccessUser) return;
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'updateUserAccess')({ uid: editAccessUser.uid, access: editAccessUser.access });
//       if (r.data.success) { toast.success('Access updated!'); setEditAccessUser(null); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to update access'); }
//     finally { setLoading(false); }
//   };

//   if (!isSuperAdmin) return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50"><Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//           <div className="card text-center py-12">
//             <FiAlertCircle className="mx-auto text-red-600 mb-4" size={48} />
//             <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
//             <p className="text-gray-600">Only the Super Admin can access User Management.</p>
//           </div>
//         </main>
//       </div>
//     </ProtectedRoute>
//   );

//   const roleColors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">

//           {/* Header */}
//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//               <p className="text-gray-600 mt-1">Manage admin users, roles, and access</p>
//             </div>
//             <div className="flex gap-2">
//               <button onClick={loadUsers} className="btn btn-secondary flex items-center gap-2" disabled={loading}>
//                 <FiRefreshCw className={loading ? 'animate-spin' : ''} size={20} /> Refresh
//               </button>
//               <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
//                 <FiPlus size={20} /> Add New User
//               </button>
//             </div>
//           </div>

//           {/* Super Admin Card */}
//           <div className="card mb-6">
//             <h2 className="text-xl font-bold mb-4">Current Super Admin</h2>
//             <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
//               <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">{user?.email?.[0]?.toUpperCase()}</div>
//               <div className="flex-1">
//                 <p className="font-medium text-gray-900">{user?.email}</p>
//                 <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">Super Admin</span>
//               </div>
//               <div className="flex items-center gap-1 text-gray-400 text-xs"><FiShield size={14} /> Protected</div>
//             </div>
//           </div>

//           {/* Users List */}
//           <div className="card">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold">Admin Users</h2>
//               <span className="text-sm text-gray-500">{users.length} users</span>
//             </div>

//             {loading ? (
//               <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
//             ) : users.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">No users yet. Use "Add New User" to create one.</div>
//             ) : (
//               <div className="space-y-3">
//                 {users.map(u => {
//                   const protected_ = isSuperAdminRow(u);
//                   return (
//                     <div key={u.uid} className={`p-4 rounded-lg border ${protected_ ? 'bg-red-50 border-red-200' : u.disabled ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-gray-50 border-gray-200'}`}>
//                       <div className="flex items-center justify-between flex-wrap gap-2">
//                         <div className="flex items-center gap-3">
//                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${protected_ ? 'bg-red-600' : u.disabled ? 'bg-gray-400' : 'bg-primary'}`}>
//                             {u.email?.[0]?.toUpperCase()}
//                           </div>
//                           <div>
//                             <div className="flex items-center gap-2 flex-wrap">
//                               <p className="font-medium text-gray-900 text-sm">{u.email}</p>
//                               {protected_ && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700"><FiShield size={10} /> Protected</span>}
//                               {u.disabled && <span className="text-xs font-medium text-red-500">● Disabled</span>}
//                             </div>
//                             {u.displayName && <p className="text-xs text-gray-500">{u.displayName}</p>}
//                             <p className="text-xs text-gray-400">Created: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</p>
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-2 flex-wrap justify-end">
//                           <select
//                             value={u.role}
//                             onChange={e => handleRoleDropdownChange(u.uid, u.email, u.role, e.target.value)}
//                             className="select text-sm py-1 w-auto"
//                             disabled={loading || protected_}
//                             title={protected_ ? 'Super admin role is protected' : ''}
//                           >
//                             <option value="editor">Editor</option>
//                             <option value="admin">Admin</option>
//                             <option value="super_admin">Super Admin</option>
//                           </select>
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role]}`}>{roleLabels[u.role]}</span>

//                           {!protected_ && (
//                             <button onClick={() => setEditAccessUser({ ...u, access: u.access || defaultAccess(u.role) })} className="p-2 hover:bg-blue-50 rounded text-blue-600" title="Edit access" disabled={loading}>
//                               <FiEdit2 size={15} />
//                             </button>
//                           )}
//                           {!protected_ && (
//                             <button onClick={() => handleToggleDisabled(u.uid, u.disabled)} className={`p-2 rounded ${u.disabled ? 'text-green-600 hover:bg-green-50' : 'text-yellow-600 hover:bg-yellow-50'}`} disabled={loading}>
//                               {u.disabled ? <FiToggleLeft size={17} /> : <FiToggleRight size={17} />}
//                             </button>
//                           )}
//                           {!protected_ ? (
//                             <button onClick={() => setDeleteDialog({ isOpen: true, uid: u.uid, email: u.email })} className="p-2 hover:bg-red-50 rounded text-red-600" disabled={loading}><FiTrash2 size={15} /></button>
//                           ) : <div className="w-8" />}
//                         </div>
//                       </div>

//                       {/* Access badges */}
//                       {!protected_ && u.access && (
//                         <div className="mt-2 ml-13 flex flex-wrap gap-1.5 pl-12">
//                           <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
//                             {u.access.allServices
//                               ? `All services${u.access.excludedServices?.length ? ` (−${u.access.excludedServices.length})` : ''}`
//                               : `${(u.access.services || []).length} services`}
//                           </span>
//                           {u.role === 'admin' && (
//                             <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">
//                               {u.access.allCategories
//                                 ? `All categories${u.access.excludedCategories?.length ? ` (−${u.access.excludedCategories.length})` : ''}`
//                                 : `${(u.access.categories || []).length} categories`}
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Create User Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">Add New User</h2>
//               <button onClick={() => setShowModal(false)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div className="modal-body space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
//                   <input type="text" value={formData.displayName} onChange={e => setFormData(f => ({ ...f, displayName: e.target.value }))} className="input" placeholder="John Doe" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
//                   <input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className="input" required />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
//                   <div className="flex gap-2">
//                     <input type="text" value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} className="input flex-1" required minLength={6} />
//                     <button type="button" onClick={handleGeneratePassword} className="btn btn-secondary whitespace-nowrap">Generate</button>
//                   </div>
//                   <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
//                   <select value={formData.role} onChange={e => handleRoleChange(e.target.value)} className="select" required>
//                     <option value="editor">Editor — Services only</option>
//                     <option value="admin">Admin — Services + Categories</option>
//                     <option value="super_admin">Super Admin — Full access</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Access Permissions</label>
//                   <AccessSelector role={formData.role} access={accessData} onChange={setAccessData} categories={categories} services={services} />
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Edit Access Modal */}
//       {editAccessUser && (
//         <div className="modal-overlay" onClick={() => setEditAccessUser(null)}>
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <div>
//                 <h2 className="text-xl font-bold">Edit Access</h2>
//                 <p className="text-sm text-gray-500">{editAccessUser.email} · {roleLabels[editAccessUser.role]}</p>
//               </div>
//               <button onClick={() => setEditAccessUser(null)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <div className="modal-body">
//               <AccessSelector
//                 role={editAccessUser.role}
//                 access={editAccessUser.access}
//                 onChange={newAccess => setEditAccessUser(u => ({ ...u, access: newAccess }))}
//                 categories={categories}
//                 services={services}
//               />
//             </div>
//             <div className="modal-footer">
//               <button onClick={() => setEditAccessUser(null)} className="btn btn-secondary">Cancel</button>
//               <button onClick={handleSaveAccess} className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Access'}</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <DeleteConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, uid: null, email: null })} onConfirm={handleDeleteUser} title="Delete User" message="This will permanently delete this user account." mode="email" email={deleteDialog.email} />
//       <RoleChangeDialog isOpen={roleDialog.isOpen} onClose={() => setRoleDialog({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null })} onConfirm={handleConfirmRoleChange} email={roleDialog.email} oldRole={roleDialog.oldRole} newRole={roleDialog.newRole} />
//     </ProtectedRoute>
//   );
// }



// NEW 8


// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { app } from '../../lib/firebase';
// import { getAllCategories, getAllServices } from '../../lib/firestore';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import {
//   FiPlus, FiTrash2, FiX, FiAlertCircle, FiRefreshCw,
//   FiToggleLeft, FiToggleRight, FiArrowRight, FiShield, FiEdit2,
//   FiChevronDown, FiChevronRight
// } from 'react-icons/fi';
// import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);
// const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
// const SUPER_ADMIN_UID   = process.env.NEXT_PUBLIC_SUPER_ADMIN_UID;

// // ─── Role Change Dialog ───────────────────────────────────────────────────────
// function RoleChangeDialog({ isOpen, onClose, onConfirm, email, oldRole, newRole }) {
//   if (!isOpen) return null;
//   const labels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };
//   const colors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <h2 className="text-xl font-bold">Confirm Role Change</h2>
//           <button onClick={onClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//         </div>
//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">Changing role for:</p>
//           <div className="bg-gray-50 border border-gray-200 rounded-lg p-3"><p className="text-sm font-medium break-all">{email}</p></div>
//           <div className="flex items-center justify-center gap-4 py-2">
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[oldRole]}`}>{labels[oldRole]}</span>
//             <FiArrowRight size={20} className="text-gray-400" />
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[newRole]}`}>{labels[newRole]}</span>
//           </div>
//           <p className="text-sm text-gray-500 text-center">Takes effect on their next login.</p>
//         </div>
//         <div className="modal-footer">
//           <button onClick={onClose} className="btn btn-secondary">Cancel</button>
//           <button onClick={() => { onConfirm(); onClose(); }} className="btn btn-primary">Confirm Change</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Access Selector ──────────────────────────────────────────────────────────
// // access shape:
// // {
// //   allCategories: bool,   // admin only
// //   allServices:   bool,
// //   categories:    string[],  // category IDs explicitly allowed (admin)
// //   services:      string[],  // service IDs explicitly allowed
// //   excludedCategories: string[],  // excluded when allCategories=true
// //   excludedServices:   string[],  // excluded when allServices=true
// // }

// function AccessSelector({ role, access, onChange, categories, services }) {
//   const [expandedCats, setExpandedCats] = useState({});

//   if (role === 'super_admin') {
//     return (
//       <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
//         Super Admin has unrestricted access to everything.
//       </div>
//     );
//   }

//   // Safely extract category ID regardless of whether categoryref is a
//   // string ("categories_new/ID"), a plain ID, or a Firestore DocumentReference object
//   const extractCatId = (categoryRef) => {
//     if (!categoryRef) return null;
//     if (typeof categoryRef === 'object' && categoryRef.id) return categoryRef.id;
//     if (typeof categoryRef === 'object' && categoryRef.path) return categoryRef.path.split('/').pop();
//     if (typeof categoryRef === 'string') return categoryRef.includes('/') ? categoryRef.split('/').pop() : categoryRef;
//     return null;
//   };

//   // Group services by category
//   const servicesByCat = categories.reduce((acc, cat) => {
//     acc[cat.id] = services.filter(s => extractCatId(s.categoryref) === cat.id);
//     return acc;
//   }, {});

//   const toggleExpand = (catId) => setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));

//   // ── helpers to check effective state ──────────────────────────────────────

//   // Is a service effectively checked?
//   const isServiceChecked = (svcId, parentCatId) => {
//     if (access.allServices) return !(access.excludedServices || []).includes(svcId);
//     if (access.services?.includes(svcId)) return true;
//     // inherited from category (admin role)
//     if (role === 'admin') {
//       if (access.allCategories) return !(access.excludedCategories || []).includes(parentCatId);
//       if (access.categories?.includes(parentCatId)) return true;
//     }
//     return false;
//   };

//   // Is a category effectively checked? (admin only)
//   const isCategoryChecked = (catId) => {
//     if (access.allCategories) return !(access.excludedCategories || []).includes(catId);
//     return access.categories?.includes(catId) || false;
//   };

//   // Does this category have SOME (but not all) services effectively checked?
//   // Used to show indeterminate dash when services are selected without the whole category being checked
//   const isCategoryIndeterminate = (catId) => {
//     if (isCategoryChecked(catId)) return false; // already fully checked, not indeterminate
//     const catServices = servicesByCat[catId] || [];
//     if (catServices.length === 0) return false;
//     // Check if ANY service in this category is effectively checked (covers allServices, services[], etc.)
//     const someSelected = catServices.some(s => isServiceChecked(s.id, catId));
//     return someSelected;
//   };

//   // Is all-services toggle indeterminate? (some but not all)
//   // const someServicesChecked = services.some(s => isServiceChecked(s.id, null));
//   // const allServicesEffective = access.allServices && !(access.excludedServices?.length);

//   // ── toggle handlers ────────────────────────────────────────────────────────

//   const handleAllServices = (checked) => {
//     onChange({ ...access, allServices: checked, excludedServices: [], services: [], categories: [], excludedCategories: [], allCategories: checked && role === 'admin' ? access.allCategories : access.allCategories });
//   };

//   const handleAllCategories = (checked) => {
//     onChange({ ...access, allCategories: checked, excludedCategories: [], categories: [] });
//   };

//   const handleServiceToggle = (svcId, parentCatId, checked) => {
//     let newAccess = { ...access };

//     if (access.allServices) {
//       // We're in "all selected" mode — toggle exclusions
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else if (role === 'admin' && access.allCategories && !access.excludedCategories?.includes(parentCatId)) {
//       // Category is fully included — toggle service exclusion
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else if (role === 'admin' && access.categories?.includes(parentCatId)) {
//       // Category explicitly included — toggle service exclusion
//       const excluded = [...(access.excludedServices || [])];
//       if (!checked) {
//         if (!excluded.includes(svcId)) excluded.push(svcId);
//       } else {
//         const idx = excluded.indexOf(svcId);
//         if (idx > -1) excluded.splice(idx, 1);
//       }
//       newAccess.excludedServices = excluded;
//     } else {
//       // Manual selection mode
//       const svcs = [...(access.services || [])];
//       if (checked) {
//         if (!svcs.includes(svcId)) svcs.push(svcId);
//       } else {
//         const idx = svcs.indexOf(svcId);
//         if (idx > -1) svcs.splice(idx, 1);
//       }
//       newAccess.services = svcs;
//     }
//     onChange(newAccess);
//   };

//   const handleCategoryToggle = (catId, checked) => {
//     let newAccess = { ...access };
//     const catServices = servicesByCat[catId]?.map(s => s.id) || [];

//     if (access.allCategories) {
//       // In "all categories" mode — toggle exclusions
//       const excluded = [...(access.excludedCategories || [])];
//       if (!checked) {
//         if (!excluded.includes(catId)) excluded.push(catId);
//         // Also add all its services to excluded
//         const excSvcs = [...(access.excludedServices || [])];
//         catServices.forEach(id => { if (!excSvcs.includes(id)) excSvcs.push(id); });
//         newAccess.excludedServices = excSvcs;
//       } else {
//         const idx = excluded.indexOf(catId);
//         if (idx > -1) excluded.splice(idx, 1);
//         // Remove its services from excluded
//         const excSvcs = (access.excludedServices || []).filter(id => !catServices.includes(id));
//         newAccess.excludedServices = excSvcs;
//       }
//       newAccess.excludedCategories = excluded;
//     } else {
//       // Manual category selection
//       const cats = [...(access.categories || [])];
//       let svcs = [...(access.services || [])];
//       if (checked) {
//         if (!cats.includes(catId)) cats.push(catId);
//         // Auto-add all services of this category
//         catServices.forEach(id => { if (!svcs.includes(id)) svcs.push(id); });
//       } else {
//         const idx = cats.indexOf(catId);
//         if (idx > -1) cats.splice(idx, 1);
//         // Remove all services of this category from explicit services
//         svcs = svcs.filter(id => !catServices.includes(id));
//       }
//       newAccess.categories = cats;
//       newAccess.services   = svcs;
//     }
//     onChange(newAccess);
//   };

//   // ── count summary — unique effective IDs to avoid double-count ────────────
//   const effectiveServiceCount = (() => {
//     if (access.allServices) return services.length - (access.excludedServices?.length || 0);
//     const checked = new Set();
//     services.forEach(s => { if (isServiceChecked(s.id, extractCatId(s.categoryref))) checked.add(s.id); });
//     return checked.size;
//   })();

//   const effectiveCatCount = role === 'admin'
//     ? access.allCategories
//       ? categories.length - (access.excludedCategories?.length || 0)
//       : (access.categories?.length || 0)
//     : null;

//   // ── per-category select/deselect all ────────────────────────────────────────
//   const handleCategorySelectAll = (catId, selectAll) => {
//     const catServices = servicesByCat[catId]?.map(s => s.id) || [];
//     if (catServices.length === 0) return;
//     let newAccess = { ...access };
//     if (selectAll) {
//       const svcs = new Set(access.services || []);
//       catServices.forEach(id => svcs.add(id));
//       newAccess.services = [...svcs];
//       newAccess.excludedServices = (access.excludedServices || []).filter(id => !catServices.includes(id));
//     } else {
//       newAccess.services = (access.services || []).filter(id => !catServices.includes(id));
//       if (access.allServices) {
//         const excl = new Set(access.excludedServices || []);
//         catServices.forEach(id => excl.add(id));
//         newAccess.excludedServices = [...excl];
//       }
//     }
//     onChange(newAccess);
//   };

//   return (
//     <div className="space-y-3">

//       {/* ── All Services ── */}
//       <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${access.allServices ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:border-blue-200'}`}>
//         <input
//           type="checkbox"
//           checked={access.allServices || false}
//           onChange={e => handleAllServices(e.target.checked)}
//           className="w-4 h-4 text-primary rounded"
//         />
//         <div>
//           <p className="text-sm font-semibold text-gray-800">All Services</p>
//           <p className="text-xs text-gray-500">Grant access to every service. Uncheck individual ones below if needed.</p>
//         </div>
//       </label>

//       {/* ── All Categories (admin only) ── */}
//       {role === 'admin' && (
//         <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${access.allCategories ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:border-green-200'}`}>
//           <input
//             type="checkbox"
//             checked={access.allCategories || false}
//             onChange={e => handleAllCategories(e.target.checked)}
//             className="w-4 h-4 text-primary rounded"
//           />
//           <div>
//             <p className="text-sm font-semibold text-gray-800">All Categories</p>
//             <p className="text-xs text-gray-500">Grant access to every category. Uncheck individual ones below if needed.</p>
//           </div>
//         </label>
//       )}

//       {/* ── Per-category tree ── */}
//       <div className="border border-gray-200 rounded-lg overflow-hidden">
//         <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
//           <p className="text-sm font-semibold text-gray-700">
//             {role === 'admin' ? 'Categories & Services' : 'Services by Category'}
//           </p>
//           <p className="text-xs text-gray-400">Click category to expand</p>
//         </div>

//         <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
//           {categories.map(cat => {
//             const catServices = servicesByCat[cat.id] || [];
//             const catChecked       = isCategoryChecked(cat.id);
//             const catIndeterminate = isCategoryIndeterminate(cat.id);
//             const isExpanded       = expandedCats[cat.id];

//             // Count checked services in this category
//             const checkedSvcCount = catServices.filter(s => isServiceChecked(s.id, cat.id)).length;
//             const allCatSvcsChecked = catServices.length > 0 && checkedSvcCount === catServices.length;
//             const someCatSvcsChecked = checkedSvcCount > 0 && !allCatSvcsChecked;

//             return (
//               <div key={cat.id}>
//                 {/* Category row */}
//                 <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50">
//                   {/* Expand toggle */}
//                   <button type="button" onClick={() => toggleExpand(cat.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
//                     {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
//                   </button>

//                   {/* Category checkbox — admin only */}
//                   {role === 'admin' && (
//                     <input
//                       type="checkbox"
//                       checked={catChecked}
//                       ref={el => { if (el) el.indeterminate = catIndeterminate || (someCatSvcsChecked && !catChecked); }}
//                       onChange={e => handleCategoryToggle(cat.id, e.target.checked)}
//                       className="w-4 h-4 text-primary rounded flex-shrink-0"
//                     />
//                   )}

//                   <button type="button" onClick={() => toggleExpand(cat.id)} className="flex-1 text-left">
//                     <span className="text-sm font-medium text-gray-800">
//                       {cat.name_sor || cat.name_en || cat.id}
//                     </span>
//                     <span className="ml-2 text-xs text-gray-400">
//                       {checkedSvcCount}/{catServices.length} services
//                     </span>
//                   </button>
//                 </div>

//                 {/* Services under this category — shown when expanded */}
//                 {isExpanded && (
//                   <div className="bg-gray-50 border-t border-gray-100">
//                     {catServices.length === 0 ? (
//                       <p className="text-xs text-gray-400 italic px-10 py-2">No services in this category</p>
//                     ) : (
//                       <>
//                         {/* Select all / Deselect all row — editor only (admin uses category checkbox) */}
//                         {role === "editor" && <div className="flex items-center justify-between px-10 py-1.5 border-b border-gray-200 bg-gray-100">
//                           <span className="text-xs text-gray-500">{checkedSvcCount}/{catServices.length} selected</span>
//                           <div className="flex gap-2">
//                             {checkedSvcCount < catServices.length && (
//                               <button
//                                 type="button"
//                                 onClick={() => handleCategorySelectAll(cat.id, true)}
//                                 className="text-xs text-blue-600 hover:text-blue-800 font-medium"
//                               >
//                                 Select all
//                               </button>
//                             )}
//                             {checkedSvcCount > 0 && (
//                               <button
//                                 type="button"
//                                 onClick={() => handleCategorySelectAll(cat.id, false)}
//                                 className="text-xs text-red-500 hover:text-red-700 font-medium"
//                               >
//                                 Deselect all
//                               </button>
//                             )}
//                           </div>
//                         </div>}
//                         {catServices.map(svc => {
//                           const svcChecked = isServiceChecked(svc.id, cat.id);
//                           return (
//                             <label key={svc.id} className="flex items-center gap-2 px-10 py-2 hover:bg-gray-100 cursor-pointer">
//                               <input
//                                 type="checkbox"
//                                 checked={svcChecked}
//                                 onChange={e => handleServiceToggle(svc.id, cat.id, e.target.checked)}
//                                 className="w-4 h-4 text-primary rounded flex-shrink-0"
//                               />
//                               <span className="text-sm text-gray-700">{svc.name_sor || svc.name_en || svc.id}</span>
//                             </label>
//                           );
//                         })}
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* ── Summary ── */}
//       <div className="flex flex-wrap gap-2 text-xs">
//         <span className={`px-2 py-1 rounded-full font-medium ${effectiveServiceCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'}`}>
//           {access.allServices
//             ? `All services${(access.excludedServices?.length || 0) > 0 ? ` (−${access.excludedServices.length} excluded)` : ''}`
//             : `${effectiveServiceCount} service(s) selected`}
//         </span>
//         {role === 'admin' && (
//           <span className={`px-2 py-1 rounded-full font-medium ${(effectiveCatCount || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'}`}>
//             {access.allCategories
//               ? `All categories${(access.excludedCategories?.length || 0) > 0 ? ` (−${access.excludedCategories.length} excluded)` : ''}`
//               : `${effectiveCatCount} category(s) selected`}
//           </span>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// function isSuperAdminRow(u) {
//   return u.uid === SUPER_ADMIN_UID || u.email === SUPER_ADMIN_EMAIL;
// }

// function defaultAccess(role) {
//   return { allCategories: false, allServices: false, categories: [], services: [], excludedCategories: [], excludedServices: [] };
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function UsersPage() {
//   const { user } = useAuth();
//   const [showModal, setShowModal]   = useState(false);
//   const [users, setUsers]           = useState([]);
//   const [categories, setCategories] = useState([]);
//   const [services, setServices]     = useState([]);
//   const [loading, setLoading]       = useState(false);
//   const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, uid: null, email: null });
//   const [roleDialog, setRoleDialog]     = useState({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null });
//   const [editAccessUser, setEditAccessUser] = useState(null);
//   const [formData, setFormData]     = useState({ email: '', password: '', role: 'editor', displayName: '' });
//   const [accessData, setAccessData] = useState(defaultAccess('editor'));

//   const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

//   useEffect(() => {
//     if (isSuperAdmin) { loadUsers(); loadMeta(); }
//   }, [isSuperAdmin]);

//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'listAdminUsers')();
//       if (r.data.success) setUsers(r.data.users);
//     } catch (e) {
//       toast.error(e.code === 'functions/unauthenticated' ? 'Auth error — please log out and back in.' : 'Failed to load users: ' + e.message);
//     } finally { setLoading(false); }
//   };

//   const loadMeta = async () => {
//     try {
//       const [cats, svcs] = await Promise.all([getAllCategories(), getAllServices()]);
//       setCategories(cats); setServices(svcs);
//     } catch (e) { console.error('Failed to load meta:', e); }
//   };

//   const handleGeneratePassword = () => {
//     const ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
//     let pw = '';
//     for (let i = 0; i < 12; i++) pw += ch[Math.floor(Math.random() * ch.length)];
//     setFormData(f => ({ ...f, password: pw }));
//     toast.success('Password generated!');
//   };

//   const handleRoleChange = (newRole) => {
//     setFormData(f => ({ ...f, role: newRole }));
//     setAccessData(defaultAccess(newRole));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault(); setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'createUserWithRole')({ ...formData, access: accessData });
//       if (r.data.success) {
//         toast.success('User created!');
//         setShowModal(false);
//         setFormData({ email: '', password: '', role: 'editor', displayName: '' });
//         setAccessData(defaultAccess('editor'));
//         await loadUsers();
//       }
//     } catch (e) {
//       toast.error(e.message || 'Failed to create user');
//     } finally { setLoading(false); }
//   };

//   const handleDeleteUser = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'deleteUser')({ uid: deleteDialog.uid });
//       if (r.data.success) { toast.success('User deleted!'); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to delete user'); }
//     finally { setLoading(false); }
//   };

//   const handleRoleDropdownChange = (uid, email, oldRole, newRole) => {
//     if (oldRole === newRole) return;
//     setRoleDialog({ isOpen: true, uid, email, oldRole, newRole });
//   };

//   const handleConfirmRoleChange = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'updateUserRole')({ uid: roleDialog.uid, role: roleDialog.newRole });
//       if (r.data.success) { toast.success('Role updated!'); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to update role'); }
//     finally { setLoading(false); }
//   };

//   const handleToggleDisabled = async (uid, current) => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'toggleUserDisabled')({ uid, disabled: !current });
//       if (r.data.success) { toast.success(`User ${!current ? 'disabled' : 'enabled'}!`); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed'); }
//     finally { setLoading(false); }
//   };

//   const handleSaveAccess = async () => {
//     if (!editAccessUser) return;
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'updateUserAccess')({ uid: editAccessUser.uid, access: editAccessUser.access });
//       if (r.data.success) { toast.success('Access updated!'); setEditAccessUser(null); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to update access'); }
//     finally { setLoading(false); }
//   };

//   if (!isSuperAdmin) return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50"><Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//           <div className="card text-center py-12">
//             <FiAlertCircle className="mx-auto text-red-600 mb-4" size={48} />
//             <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
//             <p className="text-gray-600">Only the Super Admin can access User Management.</p>
//           </div>
//         </main>
//       </div>
//     </ProtectedRoute>
//   );

//   const roleColors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">

//           {/* Header */}
//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//               <p className="text-gray-600 mt-1">Manage admin users, roles, and access</p>
//             </div>
//             <div className="flex gap-2">
//               <button onClick={loadUsers} className="btn btn-secondary flex items-center gap-2" disabled={loading}>
//                 <FiRefreshCw className={loading ? 'animate-spin' : ''} size={20} /> Refresh
//               </button>
//               <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
//                 <FiPlus size={20} /> Add New User
//               </button>
//             </div>
//           </div>

//           {/* Super Admin Card */}
//           <div className="card mb-6">
//             <h2 className="text-xl font-bold mb-4">Current Super Admin</h2>
//             <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
//               <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">{user?.email?.[0]?.toUpperCase()}</div>
//               <div className="flex-1">
//                 <p className="font-medium text-gray-900">{user?.email}</p>
//                 <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">Super Admin</span>
//               </div>
//               <div className="flex items-center gap-1 text-gray-400 text-xs"><FiShield size={14} /> Protected</div>
//             </div>
//           </div>

//           {/* Users List */}
//           <div className="card">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold">Admin Users</h2>
//               <span className="text-sm text-gray-500">{users.length} users</span>
//             </div>

//             {loading ? (
//               <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>
//             ) : users.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">No users yet. Use "Add New User" to create one.</div>
//             ) : (
//               <div className="space-y-3">
//                 {users.map(u => {
//                   const protected_ = isSuperAdminRow(u);
//                   return (
//                     <div key={u.uid} className={`p-4 rounded-lg border ${protected_ ? 'bg-red-50 border-red-200' : u.disabled ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-gray-50 border-gray-200'}`}>
//                       <div className="flex items-center justify-between flex-wrap gap-2">
//                         <div className="flex items-center gap-3">
//                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${protected_ ? 'bg-red-600' : u.disabled ? 'bg-gray-400' : 'bg-primary'}`}>
//                             {u.email?.[0]?.toUpperCase()}
//                           </div>
//                           <div>
//                             <div className="flex items-center gap-2 flex-wrap">
//                               <p className="font-medium text-gray-900 text-sm">{u.email}</p>
//                               {protected_ && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700"><FiShield size={10} /> Protected</span>}
//                               {u.disabled && <span className="text-xs font-medium text-red-500">● Disabled</span>}
//                             </div>
//                             {u.displayName && <p className="text-xs text-gray-500">{u.displayName}</p>}
//                             <p className="text-xs text-gray-400">Created: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</p>
//                           </div>
//                         </div>

//                         <div className="flex items-center gap-2 flex-wrap justify-end">
//                           <select
//                             value={u.role}
//                             onChange={e => handleRoleDropdownChange(u.uid, u.email, u.role, e.target.value)}
//                             className="select text-sm py-1 w-auto"
//                             disabled={loading || protected_}
//                             title={protected_ ? 'Super admin role is protected' : ''}
//                           >
//                             <option value="editor">Editor</option>
//                             <option value="admin">Admin</option>
//                             <option value="super_admin">Super Admin</option>
//                           </select>
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role]}`}>{roleLabels[u.role]}</span>

//                           {!protected_ && (
//                             <button onClick={() => setEditAccessUser({ ...u, access: u.access || defaultAccess(u.role) })} className="p-2 hover:bg-blue-50 rounded text-blue-600" title="Edit access" disabled={loading}>
//                               <FiEdit2 size={15} />
//                             </button>
//                           )}
//                           {!protected_ && (
//                             <button onClick={() => handleToggleDisabled(u.uid, u.disabled)} className={`p-2 rounded ${u.disabled ? 'text-green-600 hover:bg-green-50' : 'text-yellow-600 hover:bg-yellow-50'}`} disabled={loading}>
//                               {u.disabled ? <FiToggleLeft size={17} /> : <FiToggleRight size={17} />}
//                             </button>
//                           )}
//                           {!protected_ ? (
//                             <button onClick={() => setDeleteDialog({ isOpen: true, uid: u.uid, email: u.email })} className="p-2 hover:bg-red-50 rounded text-red-600" disabled={loading}><FiTrash2 size={15} /></button>
//                           ) : <div className="w-8" />}
//                         </div>
//                       </div>

//                       {/* Access badges */}
//                       {!protected_ && u.access && (
//                         <div className="mt-2 ml-13 flex flex-wrap gap-1.5 pl-12">
//                           <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
//                             {u.access.allServices
//                               ? `All services${u.access.excludedServices?.length ? ` (−${u.access.excludedServices.length})` : ''}`
//                               : `${(u.access.services || []).length} services`}
//                           </span>
//                           {u.role === 'admin' && (
//                             <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">
//                               {u.access.allCategories
//                                 ? `All categories${u.access.excludedCategories?.length ? ` (−${u.access.excludedCategories.length})` : ''}`
//                                 : `${(u.access.categories || []).length} categories`}
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Create User Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">Add New User</h2>
//               <button onClick={() => setShowModal(false)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div className="modal-body space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
//                   <input type="text" value={formData.displayName} onChange={e => setFormData(f => ({ ...f, displayName: e.target.value }))} className="input" placeholder="John Doe" />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
//                   <input type="email" value={formData.email} onChange={e => setFormData(f => ({ ...f, email: e.target.value }))} className="input" required />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
//                   <div className="flex gap-2">
//                     <input type="text" value={formData.password} onChange={e => setFormData(f => ({ ...f, password: e.target.value }))} className="input flex-1" required minLength={6} />
//                     <button type="button" onClick={handleGeneratePassword} className="btn btn-secondary whitespace-nowrap">Generate</button>
//                   </div>
//                   <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
//                   <select value={formData.role} onChange={e => handleRoleChange(e.target.value)} className="select" required>
//                     <option value="editor">Editor — Services only</option>
//                     <option value="admin">Admin — Services + Categories</option>
//                     <option value="super_admin">Super Admin — Full access</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Access Permissions</label>
//                   <AccessSelector role={formData.role} access={accessData} onChange={setAccessData} categories={categories} services={services} />
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Edit Access Modal */}
//       {editAccessUser && (
//         <div className="modal-overlay" onClick={() => setEditAccessUser(null)}>
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <div>
//                 <h2 className="text-xl font-bold">Edit Access</h2>
//                 <p className="text-sm text-gray-500">{editAccessUser.email} · {roleLabels[editAccessUser.role]}</p>
//               </div>
//               <button onClick={() => setEditAccessUser(null)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//             </div>
//             <div className="modal-body">
//               <AccessSelector
//                 role={editAccessUser.role}
//                 access={editAccessUser.access}
//                 onChange={newAccess => setEditAccessUser(u => ({ ...u, access: newAccess }))}
//                 categories={categories}
//                 services={services}
//               />
//             </div>
//             <div className="modal-footer">
//               <button onClick={() => setEditAccessUser(null)} className="btn btn-secondary">Cancel</button>
//               <button onClick={handleSaveAccess} className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Access'}</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <DeleteConfirmDialog isOpen={deleteDialog.isOpen} onClose={() => setDeleteDialog({ isOpen: false, uid: null, email: null })} onConfirm={handleDeleteUser} title="Delete User" message="This will permanently delete this user account." mode="email" email={deleteDialog.email} />
//       <RoleChangeDialog isOpen={roleDialog.isOpen} onClose={() => setRoleDialog({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null })} onConfirm={handleConfirmRoleChange} email={roleDialog.email} oldRole={roleDialog.oldRole} newRole={roleDialog.newRole} />
//     </ProtectedRoute>
//   );
// }



// NEW 9



// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { app } from '../../lib/firebase';
// import { getAllCategories, getAllServices } from '../../lib/firestore';
// import { getFunctions, httpsCallable } from 'firebase/functions';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import {
//   FiPlus, FiTrash2, FiX, FiAlertCircle, FiRefreshCw,
//   FiToggleLeft, FiToggleRight, FiArrowRight, FiShield, FiEdit2,
//   FiChevronDown, FiChevronRight
// } from 'react-icons/fi';
// import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
// import toast from 'react-hot-toast';

// const functions = getFunctions(app);
// const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
// const SUPER_ADMIN_UID   = process.env.NEXT_PUBLIC_SUPER_ADMIN_UID;

// // ─── Role Change Dialog ───────────────────────────────────────────────────────
// function RoleChangeDialog({ isOpen, onClose, onConfirm, email, oldRole, newRole }) {
//   if (!isOpen) return null;
//   const labels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };
//   const colors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
//   return (
//     <div className="modal-overlay" onClick={onClose}>
//       <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
//         <div className="modal-header">
//           <h2 className="text-xl font-bold">Confirm Role Change</h2>
//           <button onClick={onClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
//         </div>
//         <div className="modal-body space-y-4">
//           <p className="text-gray-700">Changing role for:</p>
//           <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
//             <p className="text-sm font-medium break-all">{email}</p>
//           </div>
//           <div className="flex items-center justify-center gap-4 py-2">
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[oldRole]}`}>{labels[oldRole]}</span>
//             <FiArrowRight size={20} className="text-gray-400" />
//             <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${colors[newRole]}`}>{labels[newRole]}</span>
//           </div>
//           <p className="text-sm text-gray-500 text-center">Takes effect on their next login.</p>
//         </div>
//         <div className="modal-footer">
//           <button onClick={onClose} className="btn btn-secondary">Cancel</button>
//           <button onClick={() => { onConfirm(); onClose(); }} className="btn btn-primary">Confirm Change</button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// function isSuperAdminRow(u) {
//   return u.uid === SUPER_ADMIN_UID || u.email === SUPER_ADMIN_EMAIL;
// }

// function defaultAccess() {
//   return {
//     allCategories: false,
//     allServices: false,
//     categories: [],
//     services: [],
//     excludedCategories: [],
//     excludedServices: [],
//   };
// }

// // Safely extract category ID from string, path, or Firestore DocumentReference
// function extractCatId(ref) {
//   if (!ref) return null;
//   if (typeof ref === 'object' && ref.id) return ref.id;
//   if (typeof ref === 'object' && ref.path) return ref.path.split('/').pop();
//   if (typeof ref === 'string') return ref.includes('/') ? ref.split('/').pop() : ref;
//   return null;
// }

// // ─── Access Selector ──────────────────────────────────────────────────────────
// //
// // Access object shape:
// //   allServices:        bool    — grants every service; use excludedServices to carve out exceptions
// //   allCategories:      bool    — admin only; grants every category; use excludedCategories for exceptions
// //   services:           string[] — explicit service IDs allowed (manual selection)
// //   categories:         string[] — explicit category IDs allowed (admin, manual selection)
// //   excludedServices:   string[] — only used when allServices=true OR allCategories=true
// //   excludedCategories: string[] — only used when allCategories=true
// //
// // The two modes are mutually exclusive per dimension:
// //   "bulk" mode:   allServices/allCategories=true  → exclusions apply
// //   "manual" mode: allServices/allCategories=false → services[]/categories[] apply
// //
// // Never mix: a service should not appear in both services[] and excludedServices[].

// function AccessSelector({ role, access, onChange, categories, services }) {
//   const [expandedCats, setExpandedCats] = useState({});

//   if (role === 'super_admin') {
//     return (
//       <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
//         Super Admin has unrestricted access to everything.
//       </div>
//     );
//   }

//   // Group services by category
//   const servicesByCat = categories.reduce((acc, cat) => {
//     acc[cat.id] = services.filter(s => extractCatId(s.categoryref) === cat.id);
//     return acc;
//   }, {});

//   const toggleExpand = (catId) =>
//     setExpandedCats(prev => ({ ...prev, [catId]: !prev[catId] }));

//   // ─── Read helpers ────────────────────────────────────────────────────────────

//   // Is this service effectively granted access?
//   // Order of checks matters:
//   //   1. allServices bulk mode — only excludedServices can deny
//   //   2. Explicit per-service exclusion always wins (used when allCategories=true and svc unchecked)
//   //   3. Explicit service grant (manual selection or synced from category toggle)
//   //   4. allCategories bulk mode — category-level grant (only if svc not explicitly excluded above)
//   //   5. Manual mode — no category inheritance; service must be in services[]
//   const isServiceChecked = (svcId, parentCatId) => {
//     const exclSvcs = access.excludedServices || [];
//     if (access.allServices) {
//       return !exclSvcs.includes(svcId);
//     }
//     if (exclSvcs.includes(svcId)) return false;
//     if ((access.services || []).includes(svcId)) return true;
//     if (role === 'admin' && access.allCategories) {
//       return !(access.excludedCategories || []).includes(parentCatId);
//     }
//     return false;
//   };

//   // Is this category effectively granted access? (admin only)
//   const isCategoryChecked = (catId) => {
//     if (access.allCategories) {
//       return !(access.excludedCategories || []).includes(catId);
//     }
//     return (access.categories || []).includes(catId);
//   };

//   // Should the category checkbox show the indeterminate dash?
//   // Rules:
//   //   - No services checked → no dash (empty)
//   //   - allServices=true and all services covered → no dash (fully on via bulk)
//   //   - Category explicitly checked and all its services on → no dash (fully on)
//   //   - All services on manually (in services[]) but category not checked → dash
//   //   - Some services on, some off → dash
//   //   - Category checked but some services excluded → dash
//   const isCategoryIndeterminate = (catId) => {
//     const catSvcs = servicesByCat[catId] || [];
//     if (catSvcs.length === 0) return false;
//     const checkedCount = catSvcs.filter(s => isServiceChecked(s.id, catId)).length;
//     if (checkedCount === 0) return false;
//     if (access.allServices && checkedCount === catSvcs.length) return false;
//     if (isCategoryChecked(catId) && checkedCount === catSvcs.length) return false;
//     return true;
//   };

//   // ─── Write handlers ──────────────────────────────────────────────────────────

//   // Toggle the "All Services" master switch.
//   // Turning it ON resets everything to a clean "all granted" state.
//   // Turning it OFF resets to a clean "nothing granted" state.
//   const handleAllServices = (checked) => {
//     onChange({
//       ...defaultAccess(),
//       allServices: checked,
//       // preserve allCategories setting for admin if it was already on
//       allCategories: role === 'admin' ? access.allCategories : false,
//     });
//   };

//   // Toggle the "All Categories" master switch (admin only).
//   const handleAllCategories = (checked) => {
//     onChange({
//       ...access,
//       allCategories: checked,
//       excludedCategories: [],
//       categories: [],
//       // when turning allCategories ON, also clear manual service selections to avoid confusion
//       services: checked ? [] : access.services,
//       excludedServices: checked ? [] : access.excludedServices,
//     });
//   };

//   // Toggle a single service checkbox.
//   //
//   // Three possible states to be in when this fires:
//   //   1. allServices=true   → work with excludedServices[]
//   //   2. allCategories=true and category not excluded → work with excludedServices[]
//   //   3. Everything else (manual mode) → work with services[]
//   const handleServiceToggle = (svcId, parentCatId, checked) => {
//     const a = { ...access };

//     if (a.allServices) {
//       // Bulk-services mode: unchecking = add to exclusions, checking = remove from exclusions
//       const excl = new Set(a.excludedServices || []);
//       checked ? excl.delete(svcId) : excl.add(svcId);
//       onChange({ ...a, excludedServices: [...excl] });

//     } else if (role === 'admin' && a.allCategories && !(a.excludedCategories || []).includes(parentCatId)) {
//       // Bulk-categories mode (category is active): same exclusion approach
//       const excl = new Set(a.excludedServices || []);
//       checked ? excl.delete(svcId) : excl.add(svcId);
//       onChange({ ...a, excludedServices: [...excl] });

//     } else {
//       // Manual mode: add/remove directly from services[]
//       const svcs = new Set(a.services || []);
//       checked ? svcs.add(svcId) : svcs.delete(svcId);
//       onChange({ ...a, services: [...svcs] });
//     }
//   };

//   // Toggle a whole category checkbox (admin only).
//   //
//   // Two possible states:
//   //   1. allCategories=true → work with excludedCategories[] and excludedServices[]
//   //   2. Manual mode → work with categories[] and services[]
//   const handleCategoryToggle = (catId, checked) => {
//     const a = { ...access };
//     const catSvcIds = (servicesByCat[catId] || []).map(s => s.id);

//     if (a.allCategories) {
//       // Bulk mode: toggle category exclusion and sync service exclusions
//       const exclCats = new Set(a.excludedCategories || []);
//       const exclSvcs = new Set(a.excludedServices || []);
//       if (checked) {
//         exclCats.delete(catId);
//         catSvcIds.forEach(id => exclSvcs.delete(id));
//       } else {
//         exclCats.add(catId);
//         catSvcIds.forEach(id => exclSvcs.add(id));
//       }
//       onChange({ ...a, excludedCategories: [...exclCats], excludedServices: [...exclSvcs] });

//     } else {
//       // Manual mode: toggle category and sync its services into services[]
//       const cats = new Set(a.categories || []);
//       const svcs = new Set(a.services || []);
//       if (checked) {
//         cats.add(catId);
//         catSvcIds.forEach(id => svcs.add(id));
//       } else {
//         cats.delete(catId);
//         catSvcIds.forEach(id => svcs.delete(id));
//       }
//       onChange({ ...a, categories: [...cats], services: [...svcs] });
//     }
//   };

//   // Select all / deselect all services within a single category (editor only — admin uses category checkbox).
//   const handleCategorySelectAll = (catId, selectAll) => {
//     const catSvcIds = (servicesByCat[catId] || []).map(s => s.id);
//     if (catSvcIds.length === 0) return;
//     const a = { ...access };

//     if (a.allServices) {
//       // Bulk mode: remove from or add to exclusions
//       const excl = new Set(a.excludedServices || []);
//       selectAll
//         ? catSvcIds.forEach(id => excl.delete(id))
//         : catSvcIds.forEach(id => excl.add(id));
//       onChange({ ...a, excludedServices: [...excl] });
//     } else {
//       // Manual mode
//       const svcs = new Set(a.services || []);
//       selectAll
//         ? catSvcIds.forEach(id => svcs.add(id))
//         : catSvcIds.forEach(id => svcs.delete(id));
//       onChange({ ...a, services: [...svcs] });
//     }
//   };

//   // ─── Summary counts ──────────────────────────────────────────────────────────

//   const effectiveServiceCount = (() => {
//     if (access.allServices) {
//       return services.length - (access.excludedServices?.length || 0);
//     }
//     // Use Set to deduplicate services that are accessible via multiple paths
//     const granted = new Set();
//     services.forEach(s => {
//       if (isServiceChecked(s.id, extractCatId(s.categoryref))) granted.add(s.id);
//     });
//     return granted.size;
//   })();

//   const effectiveCatCount = role === 'admin'
//     ? access.allCategories
//       ? categories.length - (access.excludedCategories?.length || 0)
//       : (access.categories?.length || 0)
//     : null;

//   // ─── Render ──────────────────────────────────────────────────────────────────

//   return (
//     <div className="space-y-3">

//       {/* All Services toggle */}
//       <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
//         access.allServices ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200 hover:border-blue-200'
//       }`}>
//         <input
//           type="checkbox"
//           checked={access.allServices || false}
//           onChange={e => handleAllServices(e.target.checked)}
//           className="w-4 h-4 text-primary rounded"
//         />
//         <div>
//           <p className="text-sm font-semibold text-gray-800">All Services</p>
//           <p className="text-xs text-gray-500">Grant access to every service. Uncheck individual ones below if needed.</p>
//         </div>
//       </label>

//       {/* All Categories toggle — admin only */}
//       {role === 'admin' && (
//         <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
//           access.allCategories ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200 hover:border-green-200'
//         }`}>
//           <input
//             type="checkbox"
//             checked={access.allCategories || false}
//             onChange={e => handleAllCategories(e.target.checked)}
//             className="w-4 h-4 text-primary rounded"
//           />
//           <div>
//             <p className="text-sm font-semibold text-gray-800">All Categories</p>
//             <p className="text-xs text-gray-500">Grant access to every category. Uncheck individual ones below if needed.</p>
//           </div>
//         </label>
//       )}

//       {/* Category / Service tree */}
//       <div className="border border-gray-200 rounded-lg overflow-hidden">
//         <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex items-center justify-between">
//           <p className="text-sm font-semibold text-gray-700">
//             {role === 'admin' ? 'Categories & Services' : 'Services by Category'}
//           </p>
//           <p className="text-xs text-gray-400">Click category to expand</p>
//         </div>

//         <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
//           {categories.map(cat => {
//             const catSvcs        = servicesByCat[cat.id] || [];
//             const catChecked     = isCategoryChecked(cat.id);
//             const catIndet       = isCategoryIndeterminate(cat.id);
//             const isExpanded     = expandedCats[cat.id];
//             const checkedCount   = catSvcs.filter(s => isServiceChecked(s.id, cat.id)).length;
//             const someChecked    = checkedCount > 0 && checkedCount < catSvcs.length;

//             return (
//               <div key={cat.id}>
//                 {/* Category row */}
//                 <div className="flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50">
//                   <button
//                     type="button"
//                     onClick={() => toggleExpand(cat.id)}
//                     className="text-gray-400 hover:text-gray-600 flex-shrink-0"
//                   >
//                     {isExpanded ? <FiChevronDown size={14} /> : <FiChevronRight size={14} />}
//                   </button>

//                   {/* Category checkbox — admin only */}
//                   {role === 'admin' && (
//                     <input
//                       type="checkbox"
//                       checked={catChecked}
//                       ref={el => { if (el) el.indeterminate = catIndet || someChecked; }}
//                       onChange={e => handleCategoryToggle(cat.id, e.target.checked)}
//                       className="w-4 h-4 text-primary rounded flex-shrink-0"
//                     />
//                   )}

//                   <button
//                     type="button"
//                     onClick={() => toggleExpand(cat.id)}
//                     className="flex-1 text-left"
//                   >
//                     <span className="text-sm font-medium text-gray-800">
//                       {cat.name_sor || cat.name_en || cat.id}
//                     </span>
//                     <span className="ml-2 text-xs text-gray-400">
//                       {checkedCount}/{catSvcs.length} services
//                     </span>
//                   </button>
//                 </div>

//                 {/* Expanded service list */}
//                 {isExpanded && (
//                   <div className="bg-gray-50 border-t border-gray-100">
//                     {catSvcs.length === 0 ? (
//                       <p className="text-xs text-gray-400 italic px-10 py-2">No services in this category</p>
//                     ) : (
//                       <>
//                         {/* Select all / Deselect all — editor only (admin uses category checkbox) */}
//                         {role === 'editor' && (
//                           <div className="flex items-center justify-between px-10 py-1.5 border-b border-gray-200 bg-gray-100">
//                             <span className="text-xs text-gray-500">{checkedCount}/{catSvcs.length} selected</span>
//                             <div className="flex gap-2">
//                               {checkedCount < catSvcs.length && (
//                                 <button
//                                   type="button"
//                                   onClick={() => handleCategorySelectAll(cat.id, true)}
//                                   className="text-xs text-blue-600 hover:text-blue-800 font-medium"
//                                 >
//                                   Select all
//                                 </button>
//                               )}
//                               {checkedCount > 0 && (
//                                 <button
//                                   type="button"
//                                   onClick={() => handleCategorySelectAll(cat.id, false)}
//                                   className="text-xs text-red-500 hover:text-red-700 font-medium"
//                                 >
//                                   Deselect all
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         )}

//                         {catSvcs.map(svc => (
//                           <label
//                             key={svc.id}
//                             className="flex items-center gap-2 px-10 py-2 hover:bg-gray-100 cursor-pointer"
//                           >
//                             <input
//                               type="checkbox"
//                               checked={isServiceChecked(svc.id, cat.id)}
//                               onChange={e => handleServiceToggle(svc.id, cat.id, e.target.checked)}
//                               className="w-4 h-4 text-primary rounded flex-shrink-0"
//                             />
//                             <span className="text-sm text-gray-700">
//                               {svc.name_sor || svc.name_en || svc.id}
//                             </span>
//                           </label>
//                         ))}
//                       </>
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       {/* Summary badges */}
//       <div className="flex flex-wrap gap-2 text-xs">
//         <span className={`px-2 py-1 rounded-full font-medium ${
//           effectiveServiceCount > 0 ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-500'
//         }`}>
//           {access.allServices
//             ? `All services${(access.excludedServices?.length || 0) > 0 ? ` (−${access.excludedServices.length} excluded)` : ''}`
//             : `${effectiveServiceCount} service(s) selected`}
//         </span>
//         {role === 'admin' && (
//           <span className={`px-2 py-1 rounded-full font-medium ${
//             (effectiveCatCount || 0) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'
//           }`}>
//             {access.allCategories
//               ? `All categories${(access.excludedCategories?.length || 0) > 0 ? ` (−${access.excludedCategories.length} excluded)` : ''}`
//               : `${effectiveCatCount} category(s) selected`}
//           </span>
//         )}
//       </div>
//     </div>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function UsersPage() {
//   const { user } = useAuth();
//   const [showModal, setShowModal]           = useState(false);
//   const [users, setUsers]                   = useState([]);
//   const [categories, setCategories]         = useState([]);
//   const [services, setServices]             = useState([]);
//   const [loading, setLoading]               = useState(false);
//   const [deleteDialog, setDeleteDialog]     = useState({ isOpen: false, uid: null, email: null });
//   const [roleDialog, setRoleDialog]         = useState({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null });
//   const [editAccessUser, setEditAccessUser] = useState(null);
//   const [formData, setFormData]             = useState({ email: '', password: '', role: 'editor', displayName: '' });
//   const [accessData, setAccessData]         = useState(defaultAccess());

//   const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

//   useEffect(() => {
//     if (isSuperAdmin) { loadUsers(); loadMeta(); }
//   }, [isSuperAdmin]);

//   const loadUsers = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'listAdminUsers')();
//       if (r.data.success) setUsers(r.data.users);
//     } catch (e) {
//       toast.error(e.code === 'functions/unauthenticated'
//         ? 'Auth error — please log out and back in.'
//         : 'Failed to load users: ' + e.message);
//     } finally { setLoading(false); }
//   };

//   const loadMeta = async () => {
//     try {
//       const [cats, svcs] = await Promise.all([getAllCategories(), getAllServices()]);
//       setCategories(cats);
//       setServices(svcs);
//     } catch (e) { console.error('Failed to load meta:', e); }
//   };

//   const handleGeneratePassword = () => {
//     const ch = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
//     let pw = '';
//     for (let i = 0; i < 12; i++) pw += ch[Math.floor(Math.random() * ch.length)];
//     setFormData(f => ({ ...f, password: pw }));
//     toast.success('Password generated!');
//   };

//   const handleRoleChange = (newRole) => {
//     setFormData(f => ({ ...f, role: newRole }));
//     setAccessData(defaultAccess());
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'createUserWithRole')({ ...formData, access: accessData });
//       if (r.data.success) {
//         toast.success('User created!');
//         setShowModal(false);
//         setFormData({ email: '', password: '', role: 'editor', displayName: '' });
//         setAccessData(defaultAccess());
//         await loadUsers();
//       }
//     } catch (e) {
//       toast.error(e.message || 'Failed to create user');
//     } finally { setLoading(false); }
//   };

//   const handleDeleteUser = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'deleteUser')({ uid: deleteDialog.uid });
//       if (r.data.success) { toast.success('User deleted!'); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to delete user'); }
//     finally { setLoading(false); }
//   };

//   const handleRoleDropdownChange = (uid, email, oldRole, newRole) => {
//     if (oldRole === newRole) return;
//     setRoleDialog({ isOpen: true, uid, email, oldRole, newRole });
//   };

//   const handleConfirmRoleChange = async () => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'updateUserRole')({ uid: roleDialog.uid, role: roleDialog.newRole });
//       if (r.data.success) { toast.success('Role updated!'); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed to update role'); }
//     finally { setLoading(false); }
//   };

//   const handleToggleDisabled = async (uid, current) => {
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'toggleUserDisabled')({ uid, disabled: !current });
//       if (r.data.success) { toast.success(`User ${!current ? 'disabled' : 'enabled'}!`); await loadUsers(); }
//     } catch (e) { toast.error(e.message || 'Failed'); }
//     finally { setLoading(false); }
//   };

//   const handleSaveAccess = async () => {
//     if (!editAccessUser) return;
//     setLoading(true);
//     try {
//       const r = await httpsCallable(functions, 'updateUserAccess')({
//         uid: editAccessUser.uid,
//         access: editAccessUser.access,
//       });
//       if (r.data.success) {
//         toast.success('Access updated!');
//         setEditAccessUser(null);
//         await loadUsers();
//       }
//     } catch (e) { toast.error(e.message || 'Failed to update access'); }
//     finally { setLoading(false); }
//   };

//   const roleColors = {
//     super_admin: 'bg-red-100 text-red-800',
//     admin: 'bg-blue-100 text-blue-800',
//     editor: 'bg-green-100 text-green-800',
//   };
//   const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };

//   if (!isSuperAdmin) return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//           <div className="card text-center py-12">
//             <FiAlertCircle className="mx-auto text-red-600 mb-4" size={48} />
//             <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
//             <p className="text-gray-600">Only the Super Admin can access User Management.</p>
//           </div>
//         </main>
//       </div>
//     </ProtectedRoute>
//   );

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />
//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">

//           {/* Header */}
//           <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
//               <p className="text-gray-600 mt-1">Manage admin users, roles, and access</p>
//             </div>
//             <div className="flex gap-2">
//               <button onClick={loadUsers} className="btn btn-secondary flex items-center gap-2" disabled={loading}>
//                 <FiRefreshCw className={loading ? 'animate-spin' : ''} size={20} /> Refresh
//               </button>
//               <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
//                 <FiPlus size={20} /> Add New User
//               </button>
//             </div>
//           </div>

//           {/* Super Admin Card */}
//           <div className="card mb-6">
//             <h2 className="text-xl font-bold mb-4">Current Super Admin</h2>
//             <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200">
//               <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg">
//                 {user?.email?.[0]?.toUpperCase()}
//               </div>
//               <div className="flex-1">
//                 <p className="font-medium text-gray-900">{user?.email}</p>
//                 <span className="inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
//                   Super Admin
//                 </span>
//               </div>
//               <div className="flex items-center gap-1 text-gray-400 text-xs">
//                 <FiShield size={14} /> Protected
//               </div>
//             </div>
//           </div>

//           {/* Users List */}
//           <div className="card">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold">Admin Users</h2>
//               <span className="text-sm text-gray-500">{users.length} users</span>
//             </div>

//             {loading ? (
//               <div className="flex items-center justify-center py-12">
//                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//               </div>
//             ) : users.length === 0 ? (
//               <div className="text-center py-8 text-gray-500">
//                 No users yet. Use "Add New User" to create one.
//               </div>
//             ) : (
//               <div className="space-y-3">
//                 {users.map(u => {
//                   const protected_ = isSuperAdminRow(u);
//                   return (
//                     <div
//                       key={u.uid}
//                       className={`p-4 rounded-lg border ${
//                         protected_ ? 'bg-red-50 border-red-200'
//                         : u.disabled ? 'bg-gray-100 border-gray-200 opacity-60'
//                         : 'bg-gray-50 border-gray-200'
//                       }`}
//                     >
//                       <div className="flex items-center justify-between flex-wrap gap-2">
//                         {/* User info */}
//                         <div className="flex items-center gap-3">
//                           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${
//                             protected_ ? 'bg-red-600' : u.disabled ? 'bg-gray-400' : 'bg-primary'
//                           }`}>
//                             {u.email?.[0]?.toUpperCase()}
//                           </div>
//                           <div>
//                             <div className="flex items-center gap-2 flex-wrap">
//                               <p className="font-medium text-gray-900 text-sm">{u.email}</p>
//                               {protected_ && (
//                                 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-700">
//                                   <FiShield size={10} /> Protected
//                                 </span>
//                               )}
//                               {u.disabled && (
//                                 <span className="text-xs font-medium text-red-500">● Disabled</span>
//                               )}
//                             </div>
//                             {u.displayName && <p className="text-xs text-gray-500">{u.displayName}</p>}
//                             <p className="text-xs text-gray-400">
//                               Created: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
//                             </p>
//                           </div>
//                         </div>

//                         {/* Actions */}
//                         <div className="flex items-center gap-2 flex-wrap justify-end">
//                           <select
//                             value={u.role}
//                             onChange={e => handleRoleDropdownChange(u.uid, u.email, u.role, e.target.value)}
//                             className="select text-sm py-1 w-auto"
//                             disabled={loading || protected_}
//                             title={protected_ ? 'Super admin role is protected' : ''}
//                           >
//                             <option value="editor">Editor</option>
//                             <option value="admin">Admin</option>
//                             <option value="super_admin">Super Admin</option>
//                           </select>
//                           <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[u.role]}`}>
//                             {roleLabels[u.role]}
//                           </span>
//                           {!protected_ && (
//                             <button
//                               onClick={() => setEditAccessUser({ ...u, access: u.access || defaultAccess() })}
//                               className="p-2 hover:bg-blue-50 rounded text-blue-600"
//                               title="Edit access"
//                               disabled={loading}
//                             >
//                               <FiEdit2 size={15} />
//                             </button>
//                           )}
//                           {!protected_ && (
//                             <button
//                               onClick={() => handleToggleDisabled(u.uid, u.disabled)}
//                               className={`p-2 rounded ${u.disabled ? 'text-green-600 hover:bg-green-50' : 'text-yellow-600 hover:bg-yellow-50'}`}
//                               disabled={loading}
//                             >
//                               {u.disabled ? <FiToggleLeft size={17} /> : <FiToggleRight size={17} />}
//                             </button>
//                           )}
//                           {!protected_ ? (
//                             <button
//                               onClick={() => setDeleteDialog({ isOpen: true, uid: u.uid, email: u.email })}
//                               className="p-2 hover:bg-red-50 rounded text-red-600"
//                               disabled={loading}
//                             >
//                               <FiTrash2 size={15} />
//                             </button>
//                           ) : <div className="w-8" />}
//                         </div>
//                       </div>

//                       {/* Access badges */}
//                       {!protected_ && u.access && (
//                         <div className="mt-2 flex flex-wrap gap-1.5 pl-12">
//                           <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
//                             {u.access.allServices
//                               ? `All services${u.access.excludedServices?.length ? ` (−${u.access.excludedServices.length})` : ''}`
//                               : `${(u.access.services || []).length} services`}
//                           </span>
//                           {u.role === 'admin' && (
//                             <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">
//                               {u.access.allCategories
//                                 ? `All categories${u.access.excludedCategories?.length ? ` (−${u.access.excludedCategories.length})` : ''}`
//                                 : `${(u.access.categories || []).length} categories`}
//                             </span>
//                           )}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Create User Modal */}
//       {showModal && (
//         <div className="modal-overlay" onClick={() => setShowModal(false)}>
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2 className="text-xl font-bold">Add New User</h2>
//               <button onClick={() => setShowModal(false)}>
//                 <FiX size={24} className="text-gray-600 hover:text-gray-900" />
//               </button>
//             </div>
//             <form onSubmit={handleSubmit}>
//               <div className="modal-body space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
//                   <input
//                     type="text"
//                     value={formData.displayName}
//                     onChange={e => setFormData(f => ({ ...f, displayName: e.target.value }))}
//                     className="input"
//                     placeholder="John Doe"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
//                   <input
//                     type="email"
//                     value={formData.email}
//                     onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
//                     className="input"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       value={formData.password}
//                       onChange={e => setFormData(f => ({ ...f, password: e.target.value }))}
//                       className="input flex-1"
//                       required
//                       minLength={6}
//                     />
//                     <button type="button" onClick={handleGeneratePassword} className="btn btn-secondary whitespace-nowrap">
//                       Generate
//                     </button>
//                   </div>
//                   <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
//                   <select
//                     value={formData.role}
//                     onChange={e => handleRoleChange(e.target.value)}
//                     className="select"
//                     required
//                   >
//                     <option value="editor">Editor — Services only</option>
//                     <option value="admin">Admin — Services + Categories</option>
//                     <option value="super_admin">Super Admin — Full access</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Access Permissions</label>
//                   <AccessSelector
//                     role={formData.role}
//                     access={accessData}
//                     onChange={setAccessData}
//                     categories={categories}
//                     services={services}
//                   />
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
//                 <button type="submit" className="btn btn-primary" disabled={loading}>
//                   {loading ? 'Creating...' : 'Create User'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {/* Edit Access Modal */}
//       {editAccessUser && (
//         <div className="modal-overlay" onClick={() => setEditAccessUser(null)}>
//           <div className="modal" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <div>
//                 <h2 className="text-xl font-bold">Edit Access</h2>
//                 <p className="text-sm text-gray-500">{editAccessUser.email} · {roleLabels[editAccessUser.role]}</p>
//               </div>
//               <button onClick={() => setEditAccessUser(null)}>
//                 <FiX size={24} className="text-gray-600 hover:text-gray-900" />
//               </button>
//             </div>
//             <div className="modal-body">
//               <AccessSelector
//                 role={editAccessUser.role}
//                 access={editAccessUser.access}
//                 onChange={newAccess => setEditAccessUser(u => ({ ...u, access: newAccess }))}
//                 categories={categories}
//                 services={services}
//               />
//             </div>
//             <div className="modal-footer">
//               <button onClick={() => setEditAccessUser(null)} className="btn btn-secondary">Cancel</button>
//               <button onClick={handleSaveAccess} className="btn btn-primary" disabled={loading}>
//                 {loading ? 'Saving...' : 'Save Access'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <DeleteConfirmDialog
//         isOpen={deleteDialog.isOpen}
//         onClose={() => setDeleteDialog({ isOpen: false, uid: null, email: null })}
//         onConfirm={handleDeleteUser}
//         title="Delete User"
//         message="This will permanently delete this user account."
//         mode="email"
//         email={deleteDialog.email}
//       />
//       <RoleChangeDialog
//         isOpen={roleDialog.isOpen}
//         onClose={() => setRoleDialog({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null })}
//         onConfirm={handleConfirmRoleChange}
//         email={roleDialog.email}
//         oldRole={roleDialog.oldRole}
//         newRole={roleDialog.newRole}
//       />
//     </ProtectedRoute>
//   );
// }



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