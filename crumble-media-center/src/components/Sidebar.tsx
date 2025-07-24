import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Search, Library, Settings, Play } from 'lucide-react'
import clsx from 'clsx'

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Library', href: '/library', icon: Library },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <div className="w-16 bg-dark-800 border-r border-dark-700 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-dark-700">
        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
          <Play className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center justify-center w-12 h-12 mx-2 rounded-lg transition-colors duration-200',
                    isActive
                      ? 'bg-primary-500 text-white'
                      : 'text-dark-400 hover:text-white hover:bg-dark-700'
                  )
                }
                title={item.name}
              >
                <item.icon className="w-5 h-5" />
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}