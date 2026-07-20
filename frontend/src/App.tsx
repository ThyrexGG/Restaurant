import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import CustomerOrdering from './pages/CustomerOrdering';
import LandingPage from './pages/LandingPage';
import MenuItemPage from './pages/MenuItemPage';
import AdminDashboard from './pages/AdminDashboard';
import InventoryDashboard from './pages/InventoryDashboard';

import PinAuth from './components/PinAuth';

function App() {
  return (
    <HelmetProvider>
      <SocketProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/order" element={<CustomerOrdering />} />
              <Route path="/table/:id" element={<CustomerOrdering />} />
              <Route path="/menu/:slug" element={<MenuItemPage />} />
              
              <Route path="/admin/*" element={<PinAuth><AdminDashboard /></PinAuth>} />
              <Route path="/inventory" element={<PinAuth><InventoryDashboard /></PinAuth>} />
            </Routes>
          </Router>
        </CartProvider>
      </SocketProvider>
    </HelmetProvider>
  );
}

export default App;
