import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { X, Plus, Minus, Trash2 } from 'lucide-react';

export default function CartDrawer() {
  const [diningType, setDiningType] = useState('Dine In');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { id: tableId } = useParams<{ id: string }>();
  const { cart, isCartOpen, toggleCart, removeFromCart, updateQuantity, totalPrice, checkout } = useCart();

  if (!isCartOpen) return null;

  const handleFinalCheckout = () => {
    setShowConfirmDialog(false);
    toggleCart();
    checkout(tableId || 'Takeaway', diningType === 'Take Away' ? 'TAKE_AWAY' : 'DINE_IN');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
        onClick={toggleCart}
      />
      
      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md glass-panel z-[70] flex flex-col transform transition-transform duration-300 ease-out border-l border-t-0 border-b-0 border-r-0 rounded-none rounded-l-3xl shadow-[[-10px_0_30px_rgba(0,0,0,0.5)]]">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold font-['Playfair_Display'] text-[#d4af37]">Your Order</h2>
          <button onClick={toggleCart} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingCartIcon className="w-16 h-16 mb-4 opacity-20" />
              <p>Your cart is empty.</p>
              <p className="text-sm mt-2">Add some delicious dishes!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartItemId || item.id} className="flex gap-4 items-center bg-black/40 p-4 rounded-xl border border-gray-800">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-lg leading-tight mb-1 truncate">{item.name}</h4>
                  {item.addons && item.addons.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1">
                      {item.addons.map((addon, idx) => (
                        <span key={idx} className="text-xs bg-[#d4af37]/20 text-[#d4af37] px-2 py-0.5 rounded">
                          +{addon.name}
                        </span>
                      ))}
                    </div>
                  )}
                  {item.notes && <p className="text-gray-400 text-xs mb-2 italic line-clamp-2">{item.notes}</p>}
                  <p className="text-[#d4af37] font-semibold">
                    ${(item.price + (item.addons?.reduce((s, a) => s + a.price, 0) || 0)).toFixed(2)}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 bg-gray-900 rounded-lg p-1 border border-gray-700 flex-shrink-0">
                  <button onClick={() => updateQuantity(item.cartItemId || item.id, -1)} className="p-1 hover:text-[#d4af37] transition-colors">
                    <Minus size={16} />
                  </button>
                  <span className="font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.cartItemId || item.id, 1)} className="p-1 hover:text-[#d4af37] transition-colors">
                    <Plus size={16} />
                  </button>
                </div>
                
                <button onClick={() => removeFromCart(item.cartItemId || item.id)} className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors ml-2 flex-shrink-0">
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-800 bg-black/40">
            <div className="flex bg-gray-900 rounded-xl p-1 mb-6 border border-gray-800">
              <button 
                onClick={() => setDiningType('Dine In')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${diningType === 'Dine In' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                Dine In
              </button>
              <button 
                onClick={() => setDiningType('Take Away')}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${diningType === 'Take Away' ? 'bg-[#d4af37] text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
              >
                Take Away
              </button>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <span className="text-xl font-bold">Total</span>
              <div className="text-right">
                <span className="text-2xl font-bold text-[#d4af37]">${totalPrice.toFixed(2)}</span>
                <span className="block text-sm font-bold text-gray-400">({(totalPrice * 4000).toLocaleString()} ៛)</span>
              </div>
            </div>
            <button 
              onClick={() => setShowConfirmDialog(true)}
              className="w-full btn-primary py-4 text-lg font-bold shadow-[0_4px_25px_rgba(212,175,55,0.4)]"
            >
              Confirm Order ({cart.length} {cart.length === 1 ? 'Item' : 'Items'})
            </button>
          </div>
        )}
      </div>

      {/* Double-Check Order Review & Confirmation Modal */}
      {showConfirmDialog && (
        <div className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a0a0c] border-2 border-[#d4af37] rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-5 animate-in fade-in zoom-in duration-200">
            
            {/* Header Alert */}
            <div className="border-b border-gray-800 pb-3">
              <h3 className="text-xl font-bold text-white font-['Playfair_Display']">Review Your Order</h3>
              <p className="text-xs text-gray-400">Please verify items before sending to kitchen</p>
            </div>

            {/* Dining Badge */}
            <div className="bg-gray-900/90 p-3 rounded-2xl border border-gray-800 flex justify-between items-center text-xs">
              <span className="text-gray-400 font-bold uppercase tracking-wider">Dining Option:</span>
              <span className="bg-[#d4af37] text-black font-extrabold px-3 py-1 rounded-xl shadow">
                {diningType === 'Take Away' ? 'Take Away' : `Dine In (Table #${tableId || '1'})`}
              </span>
            </div>

            {/* Items Breakdown */}
            <div className="bg-black/60 p-4 rounded-2xl border border-gray-800/80 max-h-48 overflow-y-auto space-y-2.5 hide-scrollbar">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start text-xs border-b border-gray-800/60 pb-2 last:border-0 last:pb-0">
                  <div>
                    <span className="font-bold text-white">{item.quantity}x {item.name}</span>
                    {item.notes && <p className="text-[10px] text-[#d4af37] font-semibold">{item.notes}</p>}
                  </div>
                  <span className="font-bold text-[#d4af37]">${((item.price + (item.addons?.reduce((s, a) => s + a.price, 0) || 0)) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Total Summary */}
            <div className="flex justify-between items-center pt-2">
              <span className="text-base font-bold text-gray-300">Total Amount:</span>
              <div className="text-right">
                <span className="text-2xl font-black text-[#d4af37]">${totalPrice.toFixed(2)}</span>
                <span className="block text-xs font-bold text-gray-400">({(totalPrice * 4000).toLocaleString()} ៛)</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="w-full bg-gray-900 hover:bg-gray-800 text-gray-300 font-bold text-xs md:text-sm py-3.5 px-4 rounded-xl border border-gray-700 transition-all"
              >
                Edit Cart
              </button>
              <button
                onClick={handleFinalCheckout}
                className="w-full bg-[#d4af37] hover:bg-[#b08d29] text-black font-extrabold text-xs md:text-sm py-3.5 px-4 rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.4)] transition-all hover:scale-105"
              >
                Confirm
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}

// Temporary icon just for empty state
function ShoppingCartIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="21" r="1"/>
      <circle cx="19" cy="21" r="1"/>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>
  );
}
