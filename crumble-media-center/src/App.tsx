import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { AddonProvider } from './contexts/AddonContext'
import { ProgressProvider } from './contexts/ProgressContext'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import Home from './pages/Home'
import Search from './pages/Search'
import Library from './pages/Library'
import Settings from './pages/Settings'
import KSplayer from './pages/Player'
import Details from './pages/Details'

function App() {
  return (
    <ErrorBoundary>
      <AddonProvider>
        <ProgressProvider>
          <div className="min-h-screen bg-dark-900 text-white">
            <Routes>
              <Route path="/player/:type/:id" element={<KSplayer />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="search" element={<Search />} />
                <Route path="library" element={<Library />} />
                <Route path="settings" element={<Settings />} />
                <Route path="details/:type/:id" element={<Details />} />
              </Route>
            </Routes>
          </div>
        </ProgressProvider>
      </AddonProvider>
    </ErrorBoundary>
  )
}

export default App