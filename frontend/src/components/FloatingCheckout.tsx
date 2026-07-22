import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FloatingCheckout() {
  const { totalItems, totalPrice, toggleCart, isCartOpen } = useCart();

  return (
    <AnimatePresence>
      {totalItems > 0 && !isCartOpen && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[90] w-[92%] max-w-md"
        >
          <button
            onClick={toggleCart}
            className="w-full flex items-center justify-between bg-[#d4af37] text-black px-4 py-3.5 sm:px-6 sm:py-4 rounded-2xl font-bold shadow-[0_10px_35px_rgba(212,175,55,0.4)] hover:scale-[1.02] active:scale-95 transition-all whitespace-nowrap border border-[#f3e5ab]/50"
          >
            <div className="flex items-center gap-2.5">
              <div className="bg-black text-[#d4af37] w-7 h-7 rounded-full flex items-center justify-center font-black text-xs sm:text-sm shadow">
                {totalItems}
              </div>
              <span className="font-extrabold text-xs sm:text-sm uppercase tracking-wider">View Order</span>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-black text-xs sm:text-sm tracking-tight text-black">
                ${totalPrice.toFixed(2)} <span className="text-[11px] sm:text-xs font-bold opacity-80">({(totalPrice * 4000).toLocaleString()} ៛)</span>
              </span>
              <ShoppingCart size={18} className="shrink-0" />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
