import React, { useState } from 'react'
import { Settings as SettingsIcon, Wifi, Download, Palette, Globe, Info } from 'lucide-react'
import { useAddons } from '../contexts/AddonContext'
import { getRecommendedPlayers } from '../utils/deepLinks'

export default function Settings() {
  const { addons, refreshAddons, loading } = useAddons()
  const [activeTab, setActiveTab] = useState('general')

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'addons', label: 'Addons', icon: Wifi },
    { id: 'players', label: 'External Players', icon: Download },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'about', label: 'About', icon: Info },
  ]

  const recommendedPlayers = getRecommendedPlayers()

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <div className="w-64 bg-dark-800 border-r border-dark-700">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Settings</h2>
          <nav className="space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white'
                    : 'text-dark-300 hover:text-white hover:bg-dark-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">General Settings</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
                  <div>
                    <h4 className="font-medium">Auto-play next episode</h4>
                    <p className="text-sm text-dark-400">Automatically play the next episode in a series</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
                  <div>
                    <h4 className="font-medium">Skip intro</h4>
                    <p className="text-sm text-dark-400">Automatically skip intro sequences when detected</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="p-4 bg-dark-800 rounded-lg">
                  <h4 className="font-medium mb-2">Default video quality</h4>
                  <select className="w-full p-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="auto">Auto (recommended)</option>
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'addons' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Addons</h3>
                <button
                  onClick={refreshAddons}
                  disabled={loading}
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 rounded-lg transition-colors"
                >
                  {loading ? 'Refreshing...' : 'Refresh Addons'}
                </button>
              </div>

              <div className="space-y-4">
                {addons.map(addon => (
                  <div key={addon.id} className="p-4 bg-dark-800 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{addon.name}</h4>
                        <p className="text-sm text-dark-400 mt-1">{addon.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-dark-500">
                          <span>Version {addon.version}</span>
                          <span>Types: {addon.types.join(', ')}</span>
                          <span>Resources: {addon.resources.join(', ')}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Active" />
                      </div>
                    </div>
                  </div>
                ))}

                {addons.length === 0 && !loading && (
                  <div className="text-center py-8 text-dark-400">
                    <Wifi className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No addons loaded</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'players' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">External Players</h3>

              <div className="bg-dark-800 rounded-lg p-4">
                <h4 className="font-medium mb-2">How it works</h4>
                <p className="text-sm text-dark-400 mb-4">
                  CBRL can launch streams in external media players for better performance and codec support. 
                  Click the "Open in External Player" button while watching to try launching in your installed players.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Recommended Players</h4>
                {recommendedPlayers.map(player => (
                  <div key={player.name} className="flex items-center justify-between p-4 bg-dark-800 rounded-lg">
                    <div>
                      <h5 className="font-medium">{player.name}</h5>
                      <p className="text-sm text-dark-400">Professional media player with excellent codec support</p>
                    </div>
                    <a
                      href={player.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors text-sm"
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Appearance</h3>

              <div className="space-y-4">
                <div className="p-4 bg-dark-800 rounded-lg">
                  <h4 className="font-medium mb-2">Theme</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-dark-900 border-2 border-primary-500 rounded-lg cursor-pointer">
                      <div className="w-full h-16 bg-gradient-to-br from-dark-800 to-dark-900 rounded mb-2"></div>
                      <p className="text-sm font-medium">Dark (Current)</p>
                    </div>
                    <div className="p-4 bg-gray-100 border-2 border-transparent rounded-lg cursor-pointer opacity-50">
                      <div className="w-full h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded mb-2"></div>
                      <p className="text-sm font-medium text-gray-800">Light (Coming Soon)</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-dark-800 rounded-lg">
                  <h4 className="font-medium mb-2">Language</h4>
                  <select className="w-full p-2 bg-dark-700 border border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="en">English</option>
                    <option value="es">Español (Coming Soon)</option>
                    <option value="fr">Français (Coming Soon)</option>
                    <option value="de">Deutsch (Coming Soon)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">About CBRL</h3>

              <div className="space-y-4">
                <div className="p-4 bg-dark-800 rounded-lg">
                  <h4 className="font-medium mb-2">Version Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-dark-400">Version:</span>
                      <span>1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Build:</span>
                      <span>2024.01.01</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Platform:</span>
                      <span>Web</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-dark-800 rounded-lg">
                  <h4 className="font-medium mb-2">About</h4>
                  <p className="text-sm text-dark-400 mb-4">
                    CBRL is a complete modular media center inspired by Stremio, Apple TV+, and VIDI. 
                    It provides a modern, extensible platform for streaming content with support for 
                    multiple addons and external players.
                  </p>
                  <div className="space-y-2">
                    <a
                      href="https://github.com/cbrl/cbrl-media-center"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors text-sm"
                    >
                      View on GitHub
                    </a>
                  </div>
                </div>

                <div className="p-4 bg-dark-800 rounded-lg">
                  <h4 className="font-medium mb-2">Technologies</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-dark-400">
                    <span>• React 18</span>
                    <span>• TypeScript</span>
                    <span>• Vite</span>
                    <span>• Tailwind CSS</span>
                    <span>• HLS.js</span>
                    <span>• Shaka Player</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}