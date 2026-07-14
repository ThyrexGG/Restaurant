import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import CustomerOrdering from './pages/CustomerOrdering';
import AdminDashboard from './pages/AdminDashboard';
import KitchenDisplaySystem from './pages/KitchenDisplaySystem';

function App() {
  return (
    <SocketProvider>
      <CartProvider>
        <Router>
          <Routes>
            <Route path="/table/:id" element={<CustomerOrdering />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/kitchen" element={<KitchenDisplaySystem />} />
            <Route path="/" element={<CustomerOrdering />} />
          </Routes>
        </Router>
      </CartProvider>
    </SocketProvider>
  );
}

export default App;
