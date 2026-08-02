import { useParams } from 'react-router-dom';
import { useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import Navbar from '../components/Navbar';
import MenuSection from '../components/MenuSection';
import CartDrawer from '../components/CartDrawer';
import OrderStatusModal from '../components/OrderStatusModal';
import FloatingCheckout from '../components/FloatingCheckout';

export default function CustomerOrdering() {
  const { id: tableId } = useParams<{ id: string }>();

  useEffect(() => {
    if (tableId) {
      const sessionKey = `qr_scanned_table_${tableId}`;
      if (!sessionStorage.getItem(sessionKey)) {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
        fetch(`${backendUrl}/api/analytics/log-scan`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tableNum: tableId })
        })
        .then(res => {
          if (res.ok) {
            sessionStorage.setItem(sessionKey, 'true');
          }
        })
        .catch(err => console.error('Failed to log QR scan:', err));
      }
    }
  }, [tableId]);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f5f5f5]">
      <Navbar />
      <HeroSection />
      <MenuSection />
      <CartDrawer />
      <OrderStatusModal />
      <FloatingCheckout />
    </div>
  );
}
