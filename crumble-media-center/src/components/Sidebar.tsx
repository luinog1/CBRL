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
    <div className="w-16 bg-dark-900/50 backdrop-blur-lg flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center justify-center">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
          <Play className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-4">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                className={({ isActive }: { isActive: boolean }) =>
                  clsx(
                    'group relative flex items-center justify-center h-12 transition-colors duration-200',
                    isActive
                      ? 'text-primary'
                      : 'text-white hover:text-primary/90'
                  )
                }
                title={item.name}
              >
                {({ isActive }: { isActive: boolean }) => (
                  <>
                    <div
                      className={clsx(
                        'absolute left-0 w-1 h-6 rounded-r-full transition-all',
                        { 'bg-primary': isActive, 'bg-transparent group-hover:bg-primary/50': !isActive }
                      )}
                    />
                    <item.icon className="w-5 h-5" />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}