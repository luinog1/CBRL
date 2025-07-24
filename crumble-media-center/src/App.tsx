import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Home } from '@/pages/Home';
import { Search } from '@/pages/Search';
import { Library } from '@/pages/Library';
import { Settings } from '@/pages/Settings';
import { Player } from '@/pages/Player';
import { useStore } from '@/store/useStore';
import { clsx } from 'clsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { sidebarCollapsed, theme } = useStore();

  return (
    <QueryClientProvider client={queryClient}>
      <div className={clsx('min-h-screen bg-gray-950', theme)}>
        <Router>
          <Sidebar />

          <main className={clsx(
            'transition-all duration-300',
            sidebarCollapsed ? 'ml-16' : 'ml-64'
          )}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/library" element={<Library />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/player/:mediaId" element={<Player />} />
            </Routes>
          </main>
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App;