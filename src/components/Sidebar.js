'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import { 
  FiHome, 
  FiPackage, 
  FiGrid, 
  FiTag, 
  FiUsers, 
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useState } from 'react';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, userRole, canAccess, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: FiHome,
      show: true,
    },
    {
      name: 'Categories',
      href: '/categories',
      icon: FiGrid,
      show: canAccess('categories_new'),
    },
    {
      name: 'Services',
      href: '/services',
      icon: FiPackage,
      show: canAccess('services_new'),
    },
    {
      name: 'Tags',
      href: '/tags',
      icon: FiTag,
      show: canAccess('tags_new'),
    },
    {
      name: 'User Management',
      href: '/users',
      icon: FiUsers,
      show: user?.email === process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL,
    },
  ].filter(item => item.show);

  const roleColors = {
    super_admin: 'bg-accent-red',
    admin: 'bg-accent-blue',
    editor: 'bg-accent-green',
  };

  const roleLabels = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    editor: 'Editor',
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg"
      >
        {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-40
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent-orange to-accent-yellow rounded-lg flex items-center justify-center">
                <span className="text-lg font-bold text-white">R</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Rebary</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-200 space-y-3">
            {/* User Info */}
            <div className="px-4 py-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {user?.email?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.email}
                  </p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium text-white ${roleColors[userRole]}`}>
                    {roleLabels[userRole]}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all font-medium"
            >
              <FiLogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
