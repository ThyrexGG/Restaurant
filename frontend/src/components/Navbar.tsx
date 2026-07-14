import React, { useState } from 'react';
import { ShoppingCart, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { totalItems, toggleCart } = useCart();
  const [showToast, setShowToast] = useState(false);

  const handleBookTable = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-6xl z-50 bg-[#0a0a0c]/80 backdrop-blur-xl border border-gray-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl px-8 py-4 flex justify-between items-center transition-all duration-300 hover:border-[#d4af37]/30">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={scrollToTop}>
          <img src="/logo.png" alt="Best Khmer Restaurant Logo" className="h-12 w-auto rounded-full group-hover:scale-105 transition-transform duration-500 shadow-[0_0_15px_rgba(212,175,55,0.2)]" />
          <div className="font-['Playfair_Display'] text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#d4af37] tracking-wider group-hover:to-[#f3e5ab] transition-all">
            Best Khmer
          </div>
        </div>
        
        <ul className="hidden md:flex gap-10 font-medium">
          <li><a href="#" onClick={scrollToTop} className="hover:text-[#d4af37] transition-colors relative group text-gray-300">Home<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#d4af37] transition-all group-hover:w-full"></span></a></li>
          <li><a href="#menu" onClick={scrollToMenu} className="hover:text-[#d4af37] transition-colors relative group text-gray-300">Menu<span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#d4af37] transition-all group-hover:w-full"></span></a></li>
        </ul>

        <div className="flex items-center gap-6">
          <button 
            onClick={toggleCart} 
            className="relative text-gray-300 hover:text-[#d4af37] hover:scale-110 transition-all duration-300"
            title="View Cart"
          >
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-[0_0_15px_rgba(212,175,55,0.6)] animate-bounce">
                {totalItems}
              </span>
            )}
          </button>
          <button onClick={handleBookTable} className="btn-primary hidden sm:block shadow-[0_4px_20px_rgba(212,175,55,0.2)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.4)] transform hover:-translate-y-0.5 transition-all">
            Book a Table
          </button>
        </div>
      </nav>

      {/* Toast Notification */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="bg-gray-900/90 backdrop-blur-md border border-[#d4af37]/50 shadow-[0_10px_40px_rgba(0,0,0,0.8)] text-white px-6 py-4 rounded-xl flex items-center gap-3">
          <CheckCircle className="text-[#d4af37]" size={24} />
          <div>
            <h4 className="font-bold text-[#d4af37] font-['Playfair_Display'] text-lg">Table Reservations</h4>
            <p className="text-gray-300 text-sm">Online reservations coming soon!</p>
          </div>
        </div>
      </div>
    </>
  );
}
