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





























'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { app } from '../../lib/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { FiPlus, FiTrash2, FiX, FiAlertCircle, FiRefreshCw, FiToggleLeft, FiToggleRight, FiArrowRight, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';

const functions = getFunctions(app);
const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
const SUPER_ADMIN_UID   = process.env.NEXT_PUBLIC_SUPER_ADMIN_UID;

// ============================================
// Type-to-Delete Dialog
// ============================================
function DeleteUserDialog({ isOpen, onClose, onConfirm, email }) {
  const [typed, setTyped] = useState('');

  if (!isOpen) return null;

  const handleClose = () => { setTyped(''); onClose(); };
  const handleConfirm = () => { setTyped(''); onConfirm(); onClose(); };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <FiTrash2 className="text-red-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Delete User</h2>
          </div>
          <button onClick={handleClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
        </div>
        <div className="modal-body space-y-4">
          <p className="text-gray-700">
            This will permanently delete the user and revoke their access. This action <strong>cannot be undone.</strong>
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm font-medium text-red-800 break-all">{email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type the email address to confirm:
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="input"
              placeholder={email}
              autoFocus
            />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={handleClose} className="btn btn-secondary">Cancel</button>
          <button
            onClick={handleConfirm}
            disabled={typed !== email}
            className="btn btn-danger disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Delete User
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Role Change Confirmation Dialog
// ============================================
function RoleChangeDialog({ isOpen, onClose, onConfirm, email, oldRole, newRole }) {
  if (!isOpen) return null;

  const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };
  const roleColors  = {
    super_admin: 'bg-red-100 text-red-800',
    admin: 'bg-blue-100 text-blue-800',
    editor: 'bg-green-100 text-green-800',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-bold text-gray-900">Confirm Role Change</h2>
          <button onClick={onClose}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
        </div>
        <div className="modal-body space-y-4">
          <p className="text-gray-700">You are about to change the role for:</p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-900 break-all">{email}</p>
          </div>
          <div className="flex items-center justify-center gap-4 py-2">
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${roleColors[oldRole]}`}>
              {roleLabels[oldRole]}
            </span>
            <FiArrowRight size={20} className="text-gray-400" />
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${roleColors[newRole]}`}>
              {roleLabels[newRole]}
            </span>
          </div>
          <p className="text-sm text-gray-500 text-center">This will take effect on their next login.</p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={() => { onConfirm(); onClose(); }} className="btn btn-primary">Confirm Change</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Helper — is this row the super admin?
// ============================================
function isSuperAdminRow(userItem) {
  return (
    userItem.uid   === SUPER_ADMIN_UID ||
    userItem.email === SUPER_ADMIN_EMAIL
  );
}

// ============================================
// Main Users Page
// ============================================
export default function UsersPage() {
  const { user } = useAuth();
  const [showModal, setShowModal]   = useState(false);
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, uid: null, email: null });
  const [roleDialog, setRoleDialog]     = useState({ isOpen: false, uid: null, email: null, oldRole: null, newRole: null });
  const [formData, setFormData]     = useState({ email: '', password: '', role: 'editor', displayName: '' });

  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  useEffect(() => { if (isSuperAdmin) loadUsers(); }, [isSuperAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await httpsCallable(functions, 'listAdminUsers')();
      if (result.data.success) setUsers(result.data.users);
    } catch (error) {
      if (error.code === 'functions/unauthenticated') {
        toast.error('Authentication error. Please log out and log back in.');
      } else {
        toast.error('Failed to load users: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let pw = '';
    for (let i = 0; i < 12; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData({ ...formData, password: pw });
    toast.success('Password generated!');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await httpsCallable(functions, 'createUserWithRole')(formData);
      if (result.data.success) {
        toast.success('User created successfully!');
        setShowModal(false);
        setFormData({ email: '', password: '', role: 'editor', displayName: '' });
        await loadUsers();
      }
    } catch (error) {
      if (error.code === 'functions/already-exists') toast.error('A user with this email already exists');
      else if (error.code === 'functions/permission-denied') toast.error('Only Super Admins can create users');
      else toast.error(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    try {
      const result = await httpsCallable(functions, 'deleteUser')({ uid: deleteDialog.uid });
      if (result.data.success) {
        toast.success('User deleted successfully!');
        await loadUsers();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleDropdownChange = (uid, email, oldRole, newRole) => {
    if (oldRole === newRole) return;
    setRoleDialog({ isOpen: true, uid, email, oldRole, newRole });
  };

  const handleConfirmRoleChange = async () => {
    setLoading(true);
    try {
      const result = await httpsCallable(functions, 'updateUserRole')({ uid: roleDialog.uid, role: roleDialog.newRole });
      if (result.data.success) {
        toast.success('Role updated successfully!');
        await loadUsers();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDisabled = async (uid, currentDisabled) => {
    setLoading(true);
    try {
      const result = await httpsCallable(functions, 'toggleUserDisabled')({ uid, disabled: !currentDisabled });
      if (result.data.success) {
        toast.success(`User ${!currentDisabled ? 'disabled' : 'enabled'} successfully!`);
        await loadUsers();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to toggle user status');
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

  const roleColors = { super_admin: 'bg-red-100 text-red-800', admin: 'bg-blue-100 text-blue-800', editor: 'bg-green-100 text-green-800' };
  const roleLabels = { super_admin: 'Super Admin', admin: 'Admin', editor: 'Editor' };

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
              <button onClick={loadUsers} className="btn btn-secondary flex items-center gap-2" disabled={loading}>
                <FiRefreshCw className={loading ? 'animate-spin' : ''} size={20} />
                Refresh
              </button>
              <button onClick={() => setShowModal(true)} className="btn btn-primary flex items-center gap-2">
                <FiPlus size={20} />
                Add New User
              </button>
            </div>
          </div>

          {/* Current Super Admin */}
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
              {/* Shield icon to indicate protected */}
              <div className="flex items-center gap-2 text-gray-400">
                <FiShield size={18} />
                <span className="text-xs">Protected</span>
              </div>
            </div>
          </div>

          {/* Users List */}
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
              <div className="text-center py-8">
                <p className="text-gray-600 mb-2">No additional users yet.</p>
                <p className="text-sm text-gray-400">Create users using the "Add New User" button.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((userItem) => {
                  const isProtected = isSuperAdminRow(userItem);

                  return (
                    <div
                      key={userItem.uid}
                      className={`flex items-center justify-between p-4 rounded-lg border ${
                        isProtected
                          ? 'bg-red-50 border-red-200'
                          : userItem.disabled
                            ? 'bg-gray-100 border-gray-300 opacity-60'
                            : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${isProtected ? 'bg-red-600' : userItem.disabled ? 'bg-gray-400' : 'bg-primary'}`}>
                          {userItem.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{userItem.email}</p>
                            {/* LAYER 2: Shield badge on super admin row */}
                            {isProtected && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                <FiShield size={10} /> Protected
                              </span>
                            )}
                          </div>
                          {userItem.displayName && <p className="text-xs text-gray-500">{userItem.displayName}</p>}
                          <p className="text-xs text-gray-400">
                            Created: {userItem.createdAt ? new Date(userItem.createdAt).toLocaleDateString() : 'N/A'}
                          </p>
                          {userItem.disabled && <span className="text-xs font-medium text-red-600">● Disabled</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {/* LAYER 3: Role dropdown locked for super admin */}
                        <select
                          value={userItem.role}
                          onChange={(e) => handleRoleDropdownChange(userItem.uid, userItem.email, userItem.role, e.target.value)}
                          className="select text-sm py-1 w-auto"
                          disabled={loading || isProtected}
                          title={isProtected ? 'Super admin role cannot be changed' : ''}
                        >
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>

                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[userItem.role]}`}>
                          {roleLabels[userItem.role]}
                        </span>

                        {/* Disable toggle — hidden for super admin */}
                        {!isProtected && (
                          <button
                            onClick={() => handleToggleDisabled(userItem.uid, userItem.disabled)}
                            className={`p-2 rounded transition-colors ${userItem.disabled ? 'hover:bg-green-50 text-green-600' : 'hover:bg-yellow-50 text-yellow-600'}`}
                            title={userItem.disabled ? 'Enable user' : 'Disable user'}
                            disabled={loading}
                          >
                            {userItem.disabled ? <FiToggleLeft size={18} /> : <FiToggleRight size={18} />}
                          </button>
                        )}

                        {/* LAYER 2: Delete button hidden for super admin */}
                        {!isProtected ? (
                          <button
                            onClick={() => setDeleteDialog({ isOpen: true, uid: userItem.uid, email: userItem.email })}
                            className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors"
                            disabled={loading}
                            title="Delete user"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        ) : (
                          // Placeholder to keep layout aligned
                          <div className="w-8" />
                        )}
                      </div>
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold">Add New User</h2>
              <button onClick={() => setShowModal(false)}><FiX size={24} className="text-gray-600 hover:text-gray-900" /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input type="text" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="input" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input" placeholder="admin@example.com" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                  <div className="flex gap-2">
                    <input type="text" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input flex-1" placeholder="Enter password" required minLength={6} />
                    <button type="button" onClick={handleGeneratePassword} className="btn btn-secondary whitespace-nowrap">Generate</button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role *</label>
                  <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="select" required>
                    <option value="editor">Editor — Services only</option>
                    <option value="admin">Admin — Services + Categories</option>
                    <option value="super_admin">Super Admin — Full access</option>
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
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Creating...' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Type-to-Delete Dialog */}
      <DeleteUserDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, uid: null, email: null })}
        onConfirm={handleDeleteUser}
        email={deleteDialog.email}
      />

      {/* Role Change Confirmation Dialog */}
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