import { X, Receipt } from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { OrderHistoryItem } from '../context/CartContext';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BillModal({ isOpen, onClose }: BillModalProps) {
  const { orderHistory } = useCart();

  if (!isOpen) return null;

  const grandTotal = orderHistory.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold font-['Playfair_Display'] text-[#d4af37] flex items-center gap-2">
            <Receipt size={24} />
            My Bill
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors p-2"
          >
            <X size={24} />
          </button>
        </div>

        {orderHistory.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-gray-500">
            <Receipt className="w-16 h-16 mb-4 opacity-20" />
            <p>You haven't ordered anything yet.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {orderHistory.map((order: OrderHistoryItem, index: number) => (
              <div key={order.id} className="bg-black/40 rounded-xl p-4 border border-gray-800">
                <div className="flex justify-between items-center mb-3 border-b border-gray-800 pb-2">
                  <span className="font-bold text-gray-300">Order #{index + 1}</span>
                  <span className="text-xs text-gray-500">{new Date(order.date).toLocaleTimeString()}</span>
                </div>
                <div className="space-y-2">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-start text-sm">
                      <div className="flex-1 pr-4">
                        <span className="text-[#d4af37] font-bold mr-2">{item.quantity}x</span>
                        <span className="text-gray-200">{item.name}</span>
                        {item.notes && <div className="text-gray-500 text-xs italic ml-6 mt-0.5">{item.notes}</div>}
                      </div>
                      <span className="text-gray-400 font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-800/50">
                  <span className="text-sm text-gray-400">Order Total:</span>
                  <span className="font-bold text-[#d4af37]">${order.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {orderHistory.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex justify-between items-end mb-2">
              <span className="text-xl font-bold text-white">Grand Total</span>
              <span className="text-3xl font-bold text-[#d4af37]">${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
