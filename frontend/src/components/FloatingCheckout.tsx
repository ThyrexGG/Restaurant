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
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[90%] max-w-md"
        >
          <button
            onClick={toggleCart}
            className="w-full flex items-center justify-between bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] text-black px-6 py-4 rounded-2xl font-bold shadow-[0_10px_40px_rgba(212,175,55,0.4)] hover:shadow-[0_10px_50px_rgba(212,175,55,0.6)] hover:scale-[1.02] active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-black/20 p-2 rounded-full flex items-center justify-center">
                <span className="w-6 text-center text-lg">{totalItems}</span>
              </div>
              <span className="text-lg uppercase tracking-wide">View Order</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-xl">${totalPrice.toFixed(2)}</span>
              <ShoppingCart size={20} />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
