import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import CustomerOrdering from './pages/CustomerOrdering';
import LandingPage from './pages/LandingPage';
import AdminGate from './components/AdminGate';

// Staff and item pages are loaded on demand so customers don't download charts and admin code
// After a deploy, an open tab may point at chunks that no longer exist: reload once to pick up the new build
const lazyPage = <T extends React.ComponentType<any>>(load: () => Promise<{ default: T }>) =>
  lazy(() =>
    load().then(mod => {
      sessionStorage.removeItem('chunk_reload');
      return mod;
    }).catch(err => {
      if (sessionStorage.getItem('chunk_reload') !== '1') {
        sessionStorage.setItem('chunk_reload', '1');
        window.location.reload();
      }
      throw err;
    })
  );

const MenuItemPage = lazyPage(() => import('./pages/MenuItemPage'));
const AdminDashboard = lazyPage(() => import('./pages/AdminDashboard'));
const InventoryDashboard = lazyPage(() => import('./pages/InventoryDashboard'));

const PageFallback = () => (
  <div className="min-h-screen bg-[#05080f] flex items-center justify-center text-gray-400">Loading…</div>
);


function App() {
  return (
    <HelmetProvider>
      <SocketProvider>
        <CartProvider>
          <Router>
            <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/order" element={<CustomerOrdering />} />
              <Route path="/table/:id" element={<CustomerOrdering />} />
              <Route path="/menu/:slug" element={<MenuItemPage />} />
              
              <Route path="/admin/*" element={<AdminGate><AdminDashboard /></AdminGate>} />
              <Route path="/inventory" element={<AdminGate><InventoryDashboard /></AdminGate>} />
            </Routes>
            </Suspense>
          </Router>
        </CartProvider>
      </SocketProvider>
    </HelmetProvider>
  );
}

export default App;
