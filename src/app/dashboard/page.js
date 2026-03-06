// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { getStats } from '../../lib/firestore';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import { FiPackage, FiGrid, FiTag, FiTrendingUp } from 'react-icons/fi';
// import Link from 'next/link';

// export default function DashboardPage() {
//   const { user, userRole, canAccess } = useAuth();
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadStats();
//   }, []);

//   const loadStats = async () => {
//     try {
//       const data = await getStats();
//       setStats(data);
//     } catch (error) {
//       console.error('Error loading stats:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const roleColors = {
//     super_admin: 'from-accent-red to-accent-darkred',
//     admin: 'from-accent-blue to-accent-lightblue',
//     editor: 'from-accent-green to-accent-lightgreen',
//   };

//   const roleLabels = {
//     super_admin: 'Super Admin',
//     admin: 'Admin',
//     editor: 'Editor',
//   };

//   const statCards = [
//     {
//       title: 'Categories',
//       value: stats?.categoriesCount || 0,
//       icon: FiGrid,
//       color: 'from-accent-green to-accent-lightgreen',
//       show: canAccess('categories_new'),
//       href: '/categories',
//     },
//     {
//       title: 'Services',
//       value: stats?.servicesCount || 0,
//       icon: FiPackage,
//       color: 'from-accent-blue to-accent-lightblue',
//       show: canAccess('services_new'),
//       href: '/services',
//     },
//     {
//       title: 'Tags',
//       value: stats?.tagsCount || 0,
//       icon: FiTag,
//       color: 'from-accent-orange to-accent-yellow',
//       show: canAccess('tags_new'),
//       href: '/tags',
//     },
//   ].filter(card => card.show);

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />

//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//           {/* Header */}
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//               Welcome back, {user?.email?.split('@')[0]}! 👋
//             </h1>
//             <p className="text-gray-600">
//               Here's an overview of your Rebary admin panel.
//             </p>
//           </div>

//           {/* Role Badge */}
//           <div className="mb-8">
//             <div className={`inline-block px-6 py-3 rounded-xl bg-gradient-to-r ${roleColors[userRole]} text-white shadow-lg`}>
//               <div className="flex items-center gap-2">
//                 <FiTrendingUp size={20} />
//                 <span className="font-semibold">Your Role: {roleLabels[userRole]}</span>
//               </div>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//               {statCards.map((card) => {
//                 const Icon = card.icon;
//                 return (
//                   <Link
//                     key={card.title}
//                     href={card.href}
//                     className="card hover:shadow-lg transition-all cursor-pointer group"
//                   >
//                     <div className="flex items-center justify-between mb-4">
//                       <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
//                         <Icon size={28} />
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm text-gray-500 font-medium">{card.title}</p>
//                         <p className="text-3xl font-bold text-gray-900">{card.value}</p>
//                       </div>
//                     </div>
//                     <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
//                       <div className={`h-full bg-gradient-to-r ${card.color}`} style={{ width: '70%' }}></div>
//                     </div>
//                   </Link>
//                 );
//               })}
//             </div>
//           )}

//           {/* Quick Actions */}
//           <div className="card">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

//               {canAccess('categories_new') && (
//                 <Link
//                   href="/categories?action=create"
//                   className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group"
//                 >
//                   <FiGrid className="mx-auto mb-2 text-gray-400 group-hover:text-primary" size={32} />
//                   <p className="font-medium text-gray-700 group-hover:text-primary">Add New Category</p>
//                 </Link>
//               )}

//               {canAccess('services_new') && (
//                 <Link
//                   href="/services?action=create"
//                   className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group"
//                 >
//                   <FiPackage className="mx-auto mb-2 text-gray-400 group-hover:text-primary" size={32} />
//                   <p className="font-medium text-gray-700 group-hover:text-primary">Add New Service</p>
//                 </Link>
//               )}

//               {canAccess('tags_new') && (
//                 <Link
//                   href="/tags?action=create"
//                   className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group"
//                 >
//                   <FiTag className="mx-auto mb-2 text-gray-400 group-hover:text-primary" size={32} />
//                   <p className="font-medium text-gray-700 group-hover:text-primary">Add New Tag</p>
//                 </Link>
//               )}
              
//             </div>
//           </div>

//           {/* Access Information */}
//           <div className="mt-8 card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
//             <h3 className="text-lg font-bold text-gray-900 mb-3">Your Access Level</h3>
//             <ul className="space-y-2">
//               {canAccess('services_new') && (
//                 <li className="flex items-center gap-2 text-gray-700">
//                   <div className="w-2 h-2 rounded-full bg-accent-green"></div>
//                   <span>Full access to <strong>Services</strong></span>
//                 </li>
//               )}
//               {canAccess('categories_new') && (
//                 <li className="flex items-center gap-2 text-gray-700">
//                   <div className="w-2 h-2 rounded-full bg-accent-green"></div>
//                   <span>Full access to <strong>Categories</strong></span>
//                 </li>
//               )}
//               {canAccess('tags_new') && (
//                 <li className="flex items-center gap-2 text-gray-700">
//                   <div className="w-2 h-2 rounded-full bg-accent-green"></div>
//                   <span>Full access to <strong>Tags</strong></span>
//                 </li>
//               )}
//             </ul>
//           </div>
//         </main>
//       </div>
//     </ProtectedRoute>
//   );
// }






// OLD


// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { getAllServices, getAllCategories, getAllTags } from '../../lib/firestore';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import { FiPackage, FiGrid, FiTag, FiTrendingUp } from 'react-icons/fi';
// import Link from 'next/link';

// export default function DashboardPage() {
//   const { user, userRole, canAccess } = useAuth();
//   const [stats, setStats] = useState({ servicesCount: 0, categoriesCount: 0, tagsCount: 0 });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (userRole) loadStats();
//   }, [userRole]);

//   const loadStats = async () => {
//     try {
//       // Only fetch what this user is allowed to access
//       const [services, categories, tags] = await Promise.all([
//         canAccess('services_new')   ? getAllServices()   : Promise.resolve([]),
//         canAccess('categories_new') ? getAllCategories() : Promise.resolve([]),
//         canAccess('tags_new')       ? getAllTags()       : Promise.resolve([]),
//       ]);

//       setStats({
//         servicesCount:   services.length,
//         categoriesCount: categories.length,
//         tagsCount:       tags.length,
//       });
//     } catch (error) {
//       console.error('Error loading stats:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const roleColors = {
//     super_admin: 'from-accent-red to-accent-darkred',
//     admin: 'from-accent-blue to-accent-lightblue',
//     editor: 'from-accent-green to-accent-lightgreen',
//   };

//   const roleLabels = {
//     super_admin: 'Super Admin',
//     admin: 'Admin',
//     editor: 'Editor',
//   };

//   const statCards = [
//     {
//       title: 'Categories',
//       value: stats.categoriesCount,
//       icon: FiGrid,
//       color: 'from-accent-green to-accent-lightgreen',
//       show: canAccess('categories_new'),
//       href: '/categories',
//     },
//     {
//       title: 'Services',
//       value: stats.servicesCount,
//       icon: FiPackage,
//       color: 'from-accent-blue to-accent-lightblue',
//       show: canAccess('services_new'),
//       href: '/services',
//     },
//     {
//       title: 'Tags',
//       value: stats.tagsCount,
//       icon: FiTag,
//       color: 'from-accent-orange to-accent-yellow',
//       show: canAccess('tags_new'),
//       href: '/tags',
//     },
//   ].filter(card => card.show);

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />

//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//           {/* Header */}
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//               Welcome back, {user?.email?.split('@')[0]}! 👋
//             </h1>
//             <p className="text-gray-600">
//               Here's an overview of your Rebary admin panel.
//             </p>
//           </div>

//           {/* Role Badge */}
//           <div className="mb-8">
//             <div className={`inline-block px-6 py-3 rounded-xl bg-gradient-to-r ${roleColors[userRole]} text-white shadow-lg`}>
//               <div className="flex items-center gap-2">
//                 <FiTrendingUp size={20} />
//                 <span className="font-semibold">Your Role: {roleLabels[userRole]}</span>
//               </div>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//               {statCards.map((card) => {
//                 const Icon = card.icon;
//                 return (
//                   <Link
//                     key={card.title}
//                     href={card.href}
//                     className="card hover:shadow-lg transition-all cursor-pointer group"
//                   >
//                     <div className="flex items-center justify-between mb-4">
//                       <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
//                         <Icon size={28} />
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm text-gray-500 font-medium">{card.title}</p>
//                         <p className="text-3xl font-bold text-gray-900">{card.value}</p>
//                       </div>
//                     </div>
//                     <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
//                       <div className={`h-full bg-gradient-to-r ${card.color}`} style={{ width: '70%' }}></div>
//                     </div>
//                   </Link>
//                 );
//               })}
//             </div>
//           )}

//           {/* Quick Actions */}
//           <div className="card">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {canAccess('categories_new') && (
//                 <Link
//                   href="/categories?action=create"
//                   className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group"
//                 >
//                   <FiGrid className="mx-auto mb-2 text-gray-400 group-hover:text-primary" size={32} />
//                   <p className="font-medium text-gray-700 group-hover:text-primary">Add New Category</p>
//                 </Link>
//               )}
//               {canAccess('services_new') && (
//                 <Link
//                   href="/services?action=create"
//                   className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group"
//                 >
//                   <FiPackage className="mx-auto mb-2 text-gray-400 group-hover:text-primary" size={32} />
//                   <p className="font-medium text-gray-700 group-hover:text-primary">Add New Service</p>
//                 </Link>
//               )}
//               {canAccess('tags_new') && (
//                 <Link
//                   href="/tags?action=create"
//                   className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group"
//                 >
//                   <FiTag className="mx-auto mb-2 text-gray-400 group-hover:text-primary" size={32} />
//                   <p className="font-medium text-gray-700 group-hover:text-primary">Add New Tag</p>
//                 </Link>
//               )}
//             </div>
//           </div>

//           {/* Access Information */}
//           <div className="mt-8 card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
//             <h3 className="text-lg font-bold text-gray-900 mb-3">Your Access Level</h3>
//             <ul className="space-y-2">
//               {canAccess('services_new') && (
//                 <li className="flex items-center gap-2 text-gray-700">
//                   <div className="w-2 h-2 rounded-full bg-accent-green"></div>
//                   <span>Full access to <strong>Services</strong></span>
//                 </li>
//               )}
//               {canAccess('categories_new') && (
//                 <li className="flex items-center gap-2 text-gray-700">
//                   <div className="w-2 h-2 rounded-full bg-accent-green"></div>
//                   <span>Full access to <strong>Categories</strong></span>
//                 </li>
//               )}
//               {canAccess('tags_new') && (
//                 <li className="flex items-center gap-2 text-gray-700">
//                   <div className="w-2 h-2 rounded-full bg-accent-green"></div>
//                   <span>Full access to <strong>Tags</strong></span>
//                 </li>
//               )}
//             </ul>
//           </div>
//         </main>
//       </div>
//     </ProtectedRoute>
//   );
// }



// NEW 1


// 'use client';

// import { useEffect, useState } from 'react';
// import { useAuth } from '../../hooks/useAuth';
// import { getAllServices, getAllCategories, getAllTags } from '../../lib/firestore';
// import Sidebar from '../../components/Sidebar';
// import ProtectedRoute from '../../components/ProtectedRoute';
// import { FiPackage, FiGrid, FiTag, FiTrendingUp } from 'react-icons/fi';
// import Link from 'next/link';

// export default function DashboardPage() {
//   const { user, userRole, canAccess, canAccessService, canAccessCategory } = useAuth();
//   const [stats, setStats] = useState({ servicesCount: 0, categoriesCount: 0, tagsCount: 0 });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (userRole) loadStats();
//   }, [userRole]);

//   const loadStats = async () => {
//     try {
//       const [services, categories, tags] = await Promise.all([
//         canAccess('services_new')   ? getAllServices()   : Promise.resolve([]),
//         canAccess('categories_new') ? getAllCategories() : Promise.resolve([]),
//         canAccess('tags_new')       ? getAllTags()       : Promise.resolve([]),
//       ]);

//       // Filter to only what this user can actually access (granular access control)
//       const accessibleServices   = services.filter(s => canAccessService(s.id, s.categoryref));
//       const accessibleCategories = categories.filter(c => canAccessCategory(c.id));

//       setStats({
//         servicesCount:   accessibleServices.length,
//         categoriesCount: accessibleCategories.length,
//         tagsCount:       tags.length,
//       });
//     } catch (error) {
//       console.error('Error loading stats:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const roleColors = {
//     super_admin: 'from-accent-red to-accent-darkred',
//     admin: 'from-accent-blue to-accent-lightblue',
//     editor: 'from-accent-green to-accent-lightgreen',
//   };

//   const roleLabels = {
//     super_admin: 'Super Admin',
//     admin: 'Admin',
//     editor: 'Editor',
//   };

//   const statCards = [
//     {
//       title: 'Categories',
//       value: stats.categoriesCount,
//       icon: FiGrid,
//       color: 'from-accent-green to-accent-lightgreen',
//       show: canAccess('categories_new'),
//       href: '/categories',
//     },
//     {
//       title: 'Services',
//       value: stats.servicesCount,
//       icon: FiPackage,
//       color: 'from-accent-blue to-accent-lightblue',
//       show: canAccess('services_new'),
//       href: '/services',
//     },
//     {
//       title: 'Tags',
//       value: stats.tagsCount,
//       icon: FiTag,
//       color: 'from-accent-orange to-accent-yellow',
//       show: canAccess('tags_new'),
//       href: '/tags',
//     },
//   ].filter(card => card.show);

//   return (
//     <ProtectedRoute>
//       <div className="flex min-h-screen bg-gray-50">
//         <Sidebar />

//         <main className="flex-1 lg:ml-64 p-4 lg:p-8">
//           {/* Header */}
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//               Welcome back, {user?.email?.split('@')[0]}! 👋
//             </h1>
//             <p className="text-gray-600">
//               Here's an overview of your Rebary admin panel.
//             </p>
//           </div>

//           {/* Role Badge */}
//           <div className="mb-8">
//             <div className={`inline-block px-6 py-3 rounded-xl bg-gradient-to-r ${roleColors[userRole]} text-white shadow-lg`}>
//               <div className="flex items-center gap-2">
//                 <FiTrendingUp size={20} />
//                 <span className="font-semibold">Your Role: {roleLabels[userRole]}</span>
//               </div>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           {loading ? (
//             <div className="flex items-center justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//               {statCards.map((card) => {
//                 const Icon = card.icon;
//                 return (
//                   <Link
//                     key={card.title}
//                     href={card.href}
//                     className="card hover:shadow-lg transition-all cursor-pointer group"
//                   >
//                     <div className="flex items-center justify-between mb-4">
//                       <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
//                         <Icon size={28} />
//                       </div>
//                       <div className="text-right">
//                         <p className="text-sm text-gray-500 font-medium">{card.title}</p>
//                         <p className="text-3xl font-bold text-gray-900">{card.value}</p>
//                       </div>
//                     </div>
//                     <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
//                       <div className={`h-full bg-gradient-to-r ${card.color}`} style={{ width: '70%' }}></div>
//                     </div>
//                   </Link>
//                 );
//               })}
//             </div>
//           )}

//           {/* Quick Actions */}
//           <div className="card">
//             <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {canAccess('categories_new') && (
//                 <Link
//                   href="/categories?action=create"
//                   className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group"
//                 >
//                   <FiGrid className="mx-auto mb-2 text-gray-400 group-hover:text-primary" size={32} />
//                   <p className="font-medium text-gray-700 group-hover:text-primary">Add New Category</p>
//                 </Link>
//               )}
//               {canAccess('services_new') && (
//                 <Link
//                   href="/services?action=create"
//                   className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group"
//                 >
//                   <FiPackage className="mx-auto mb-2 text-gray-400 group-hover:text-primary" size={32} />
//                   <p className="font-medium text-gray-700 group-hover:text-primary">Add New Service</p>
//                 </Link>
//               )}
//               {canAccess('tags_new') && (
//                 <Link
//                   href="/tags?action=create"
//                   className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group"
//                 >
//                   <FiTag className="mx-auto mb-2 text-gray-400 group-hover:text-primary" size={32} />
//                   <p className="font-medium text-gray-700 group-hover:text-primary">Add New Tag</p>
//                 </Link>
//               )}
//             </div>
//           </div>

//           {/* Access Information */}
//           <div className="mt-8 card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
//             <h3 className="text-lg font-bold text-gray-900 mb-3">Your Access Level</h3>
//             <ul className="space-y-2">
//               {canAccess('services_new') && (
//                 <li className="flex items-center gap-2 text-gray-700">
//                   <div className="w-2 h-2 rounded-full bg-accent-green"></div>
//                   <span>Full access to <strong>Services</strong></span>
//                 </li>
//               )}
//               {canAccess('categories_new') && (
//                 <li className="flex items-center gap-2 text-gray-700">
//                   <div className="w-2 h-2 rounded-full bg-accent-green"></div>
//                   <span>Full access to <strong>Categories</strong></span>
//                 </li>
//               )}
//               {canAccess('tags_new') && (
//                 <li className="flex items-center gap-2 text-gray-700">
//                   <div className="w-2 h-2 rounded-full bg-accent-green"></div>
//                   <span>Full access to <strong>Tags</strong></span>
//                 </li>
//               )}
//             </ul>
//           </div>
//         </main>
//       </div>
//     </ProtectedRoute>
//   );
// }



// NEW 2


'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getAllServices, getAllCategories, getAllTags } from '../../lib/firestore';
import Sidebar from '../../components/Sidebar';
import ProtectedRoute from '../../components/ProtectedRoute';
import { FiPackage, FiGrid, FiTag, FiTrendingUp } from 'react-icons/fi';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, userRole, canAccess, canAccessService, canAccessCategory } = useAuth();
  const [stats, setStats] = useState({ servicesCount: 0, categoriesCount: 0, tagsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userRole) loadStats();
  }, [userRole]);

  const loadStats = async () => {
    try {
      const [services, categories, tags] = await Promise.all([
        canAccess('services_new')   ? getAllServices()   : Promise.resolve([]),
        canAccess('categories_new') ? getAllCategories() : Promise.resolve([]),
        canAccess('tags_new')       ? getAllTags()       : Promise.resolve([]),
      ]);

      // Filter to only what this user can actually access (granular access control)
      const accessibleServices   = services.filter(s => canAccessService(s.id, s.categoryref));
      const accessibleCategories = categories.filter(c => canAccessCategory(c.id));

      setStats({
        servicesCount:   accessibleServices.length,
        categoriesCount: accessibleCategories.length,
        tagsCount:       tags.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const roleColors = {
    super_admin: 'from-accent-red to-accent-darkred',
    admin: 'from-accent-blue to-accent-lightblue',
    editor: 'from-accent-green to-accent-lightgreen',
  };

  const roleLabels = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    editor: 'Editor',
  };

  const statCards = [
    {
      title: 'Categories',
      value: stats.categoriesCount,
      icon: FiGrid,
      color: 'from-accent-green to-accent-lightgreen',
      show: canAccess('categories_new'),
      href: '/categories',
    },
    {
      title: 'Services',
      value: stats.servicesCount,
      icon: FiPackage,
      color: 'from-accent-blue to-accent-lightblue',
      show: canAccess('services_new'),
      href: '/services',
    },
    {
      title: 'Tags',
      value: stats.tagsCount,
      icon: FiTag,
      color: 'from-accent-orange to-accent-yellow',
      show: canAccess('tags_new'),
      href: '/tags',
    },
  ].filter(card => card.show);

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />

        <main className="flex-1 lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-gray-600">
              Here's an overview of your Rebary admin panel.
            </p>
          </div>

          {/* Role Badge */}
          <div className="mb-8">
            <div className={`inline-block px-6 py-3 rounded-xl bg-gradient-to-r ${roleColors[userRole]} text-white shadow-lg`}>
              <div className="flex items-center gap-2">
                <FiTrendingUp size={20} />
                <span className="font-semibold">Your Role: {roleLabels[userRole]}</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {statCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.title}
                    href={card.href}
                    className="card hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                        <Icon size={28} />
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 font-medium">{card.title}</p>
                        <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                      </div>
                    </div>
                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${card.color}`} style={{ width: '70%' }}></div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {canAccess('categories_new') && (
                <Link
                  href="/categories?action=create"
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group"
                >
                  <FiGrid className="mx-auto mb-2 text-gray-400 group-hover:text-primary" size={32} />
                  <p className="font-medium text-gray-700 group-hover:text-primary">Add New Category</p>
                </Link>
              )}
              {canAccess('services_new') && (
                <Link
                  href="/services?action=create"
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group"
                >
                  <FiPackage className="mx-auto mb-2 text-gray-400 group-hover:text-primary" size={32} />
                  <p className="font-medium text-gray-700 group-hover:text-primary">Add New Service</p>
                </Link>
              )}
              {canAccess('tags_new') && (
                <Link
                  href="/tags?action=create"
                  className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-center group"
                >
                  <FiTag className="mx-auto mb-2 text-gray-400 group-hover:text-primary" size={32} />
                  <p className="font-medium text-gray-700 group-hover:text-primary">Add New Tag</p>
                </Link>
              )}
            </div>
          </div>

          {/* Access Information */}
          <div className="mt-8 card bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Your Access Level</h3>
            <ul className="space-y-2">
              {canAccess('services_new') && (
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-accent-green"></div>
                  <span>Full access to <strong>Services</strong></span>
                </li>
              )}
              {canAccess('categories_new') && (
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-accent-green"></div>
                  <span>Full access to <strong>Categories</strong></span>
                </li>
              )}
              {canAccess('tags_new') && (
                <li className="flex items-center gap-2 text-gray-700">
                  <div className="w-2 h-2 rounded-full bg-accent-green"></div>
                  <span>Full access to <strong>Tags</strong></span>
                </li>
              )}
            </ul>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}