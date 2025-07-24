import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Library, Settings, Menu } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { clsx } from 'clsx';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Library', href: '/library', icon: Library },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useStore();

  return (
    <div className={clsx(
      'fixed left-0 top-0 z-40 h-screen bg-gray-900 border-r border-gray-800 transition-all duration-300',
      sidebarCollapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        {!sidebarCollapsed && (
          <h1 className="text-xl font-bold text-white">CruMBLE</h1>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <ul className="space-y-2 px-3">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  )
                }
              >
                <item.icon size={20} />
                {!sidebarCollapsed && (
                  <span className="ml-3">{item.name}</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};