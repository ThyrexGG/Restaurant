
import HeroSection from '../components/HeroSection';
import Navbar from '../components/Navbar';
import MenuSection from '../components/MenuSection';
import CartDrawer from '../components/CartDrawer';
import OrderStatusModal from '../components/OrderStatusModal';
import FloatingCheckout from '../components/FloatingCheckout';

export default function CustomerOrdering() {
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
