import React, { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Wifi, Download, Palette, Globe, Info, Trash2, RefreshCw } from 'lucide-react'
import { useAddons } from '../contexts/AddonContext'
import { getRecommendedPlayers } from '../utils/deepLinks'
import { useLocation } from 'react-router-dom'

export default function Settings() {
  const { addons, refreshAddons, loading, removeAddon } = useAddons()
  const [activeTab, setActiveTab] = useState('general')
  const [newAddonUrl, setNewAddonUrl] = useState('')
  const [addonError, setAddonError] = useState('')
  const [addonSuccess, setAddonSuccess] = useState(false)
  const [tmdbApiKey, setTmdbApiKey] = useState(() => localStorage.getItem('tmdb_api_key') || '')
  const [tmdbKeySuccess, setTmdbKeySuccess] = useState(false)
  const [tmdbKeyError, setTmdbKeyError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  
  // Get the location to check for URL parameters
  const location = useLocation()
  
  // Set active tab based on URL parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab')
    if (tabParam && ['general', 'addons', 'api', 'players', 'appearance', 'about'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [location])
  
  // TMDB example addon URL
  const exampleTmdbUrl = 'https://v3-cinemeta.strem.io/manifest.json'

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'addons', label: 'Addons', icon: Wifi },
    { id: 'api', label: 'API Keys', icon: Globe },
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
                    : 'text-white hover:bg-dark-700'
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
                onClick={() => refreshAddons()}
                disabled={loading}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 rounded-lg transition-colors"
              >
                {loading ? 'Refreshing...' : 'Refresh Addons'}
              </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-dark-800 rounded-lg">
                  <h4 className="font-medium mb-2">Add New Addon</h4>
                  <div className="mb-4 p-3 bg-dark-700 rounded-lg text-sm">
                    <p className="text-dark-400 mb-2">Addon example:</p>
                    <code className="block p-2 bg-dark-800 rounded text-primary-400 break-all">
                      {exampleTmdbUrl}
                    </code>
                  </div>
                  <form 
                    className="flex space-x-2"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      if (!newAddonUrl) return
                      
                      setAddonError('')
                      setAddonSuccess(false)
                      
                      try {
                        // First validate the URL format
                        if (!newAddonUrl.startsWith('http')) {
                          throw new Error('Please enter a valid URL starting with http:// or https://')
                        }
                        
                        // Check if manifest exists
                        const manifestCheck = await fetch(newAddonUrl)
                        if (!manifestCheck.ok) {
                          throw new Error('Could not load addon manifest from this URL')
                        }
                        
                        // Get manifest to extract name
                        const manifest = await manifestCheck.json()
                        
                        const response = await fetch('/addons.json')
                        const currentAddons = await response.json()
                        
                        // Check if addon already exists
                        if (currentAddons.addons.some((a: { manifestUrl: string }) => a.manifestUrl === newAddonUrl)) {
                          throw new Error('This addon is already installed')
                        }
                        
                        const updatedAddons = {
                          addons: [
                            ...currentAddons.addons,
                            {
                              name: manifest.name || 'Custom Addon',
                              manifestUrl: newAddonUrl,
                              description: manifest.description || 'User-added addon'
                            }
                          ]
                        }
                        
                        await fetch('/addons.json', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(updatedAddons)
                        })
                        
                        setNewAddonUrl('')
                        setAddonSuccess(true)
                        refreshAddons()
                      } catch (err) {
                        setAddonError(err instanceof Error ? err.message : 'Failed to add addon')
                      }
                    }}
                  >
                    <input
                      type="text"
                      value={newAddonUrl}
                      onChange={(e) => setNewAddonUrl(e.target.value)}
                      placeholder="Enter addon manifest URL"
                      className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors"
                      disabled={!newAddonUrl}
                    >
                      Add
                    </button>
                  </form>
                  {addonError && (
                    <p className="mt-2 text-sm text-red-500">{addonError}</p>
                  )}
                  {addonSuccess && (
                    <p className="mt-2 text-sm text-green-500">Addon added successfully!</p>
                  )}
                </div>

                {addons.map(addon => (
                  <div key={addon.id} className="p-4 bg-dark-800 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{addon.name}</h4>
                          {addon.id.startsWith('tmdb') && (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                              TMDB
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-dark-400 mt-1">{addon.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-dark-500">
                          <span>Version {addon.version}</span>
                          <span>Types: {addon.types.join(', ')}</span>
                          <span>Resources: {addon.resources.join(', ')}</span>
                        </div>
                        <div className="mt-2">
                          <code className="text-xs text-dark-400 break-all">{addon.manifestUrl || addon.id}</code>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Active" />
                        <button 
                          onClick={() => removeAddon(addon)}
                          className="p-1 text-dark-400 hover:text-red-400 transition-colors"
                          title="Remove addon"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (addon) {
                              refreshAddons([addon])
                            }
                          }}
                          className="p-1 text-dark-400 hover:text-primary-400 transition-colors"
                          title="Refresh addon"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
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

            {addons.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Manage Addons</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => refreshAddons()}
                    className="p-3 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Refresh All Addons</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Are you sure you want to remove all addons?')) {
                        addons.forEach(addon => removeAddon(addon))
                      }
                    }}
                    className="p-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors flex items-center justify-center space-x-2 text-red-400"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>Remove All Addons</span>
                  </button>
                </div>
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

          {activeTab === 'api' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">API Keys</h3>

              <div className="space-y-4">
                <div className="p-4 bg-dark-800 rounded-lg">
                  <h4 className="font-medium mb-2">TMDB API Key</h4>
                  <p className="text-sm text-dark-400 mb-4">
                    Enter your TMDB API key to fetch metadata and populate the home screen with catalogs.
                    You can get a free API key by creating an account at <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">themoviedb.org</a>.
                  </p>
                  <form 
                    className="flex space-x-2"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      if (!tmdbApiKey) return
                      
                      setIsValidating(true)
                      
                      try {
                        // Get the TMDB addon URL from the addons context
                        const tmdbAddon = addons.find(addon => 
                          addon.id.startsWith('tmdb') || addon.id.startsWith('org.crumble.tmdb')
                        )
                        
                        if (tmdbAddon && tmdbAddon.manifestUrl) {
                          const baseUrl = tmdbAddon.manifestUrl.replace('/manifest.json', '')
                          const response = await fetch(`${baseUrl}/validate-key?apikey=${tmdbApiKey}`)
                          const data = await response.json()
                          
                          if (response.ok && data.valid) {
                            // API key is valid, save to localStorage
                            localStorage.setItem('tmdb_api_key', tmdbApiKey)
                            setTmdbKeySuccess(true)
                            setTmdbKeyError(null)
                            
                            // Clear success message after 3 seconds
                            setTimeout(() => setTmdbKeySuccess(false), 3000)
                            
                            // Refresh addons to use the new API key
                            refreshAddons()
                          } else {
                            // API key is invalid
                            setTmdbKeyError(data.detail || 'Invalid API key')
                            setTmdbKeySuccess(false)
                          }
                        } else {
                          // No TMDB addon found, just save the key
                          localStorage.setItem('tmdb_api_key', tmdbApiKey)
                          setTmdbKeySuccess(true)
                          setTmdbKeyError(null)
                          setTimeout(() => setTmdbKeySuccess(false), 3000)
                          refreshAddons()
                        }
                      } catch (error) {
                        console.error('Error validating API key:', error)
                        setTmdbKeyError('Error validating API key. Please try again.')
                        setTmdbKeySuccess(false)
                      } finally {
                        setIsValidating(false)
                      }
                    }}
                  >
                    <input
                      type="text"
                      value={tmdbApiKey}
                      onChange={(e) => setTmdbApiKey(e.target.value)}
                      placeholder="Enter your TMDB API key"
                      className="flex-1 px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors flex items-center"
                      disabled={!tmdbApiKey || isValidating}
                    >
                      {isValidating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Validating
                        </>
                      ) : 'Save'}
                    </button>
                  </form>
                  {tmdbKeySuccess && (
                    <p className="mt-2 text-sm text-green-500">API key saved successfully!</p>
                  )}
                  {tmdbKeyError && (
                    <p className="mt-2 text-sm text-red-500">{tmdbKeyError}</p>
                  )}
                </div>
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