import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useSocket } from '../context/SocketContext';
import { Flame, X, Minimize2, Maximize2, AlertCircle, ChefHat } from 'lucide-react';

export default function OrderStatusModal() {
  const { activeOrderId, setActiveOrderId } = useCart();
  const { socket } = useSocket();
  const [orderStatus, setOrderStatus] = useState<string>('COOKING');
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!socket || !activeOrderId) return;

    // Reset status when opening a new order
    setOrderStatus('COOKING');
    setIsMinimized(false);

    const handleStatusChange = (data: any) => {
      // Handle both orderId and id (different emit formats possible)
      const incomingId = data.orderId || data.id;
      if (incomingId === activeOrderId) {
        setOrderStatus(data.status);
        if (data.status === 'CANCELLED') {
          setIsMinimized(false); // Force open if cancelled
        }
      }
    };

    socket.on('order_status_changed', handleStatusChange);
    return () => {
      socket.off('order_status_changed', handleStatusChange);
    };
  }, [socket, activeOrderId]);

  if (!activeOrderId) return null;

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 bg-[#0a0a0c] border-2 border-[#d4af37] rounded-full px-6 py-3 shadow-[0_10px_30px_rgba(212,175,55,0.3)] z-[50] cursor-pointer hover:scale-105 transition-transform flex items-center gap-3"
      >
        <Flame className="text-[#d4af37] animate-pulse" />
        <span className="font-bold text-white">Food in Progress</span>
        <Maximize2 size={16} className="text-gray-400 ml-2" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
        <div className="absolute top-6 right-6 flex gap-4">
          {orderStatus !== 'CANCELLED' && (
            <button 
              onClick={() => setIsMinimized(true)}
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
              title="Minimize to order more"
            >
              <Minimize2 size={24} />
            </button>
          )}
          <button 
            onClick={() => setActiveOrderId(null)}
            className="text-gray-500 hover:text-white transition-colors"
            title="Close tracking"
          >
            <X size={24} />
          </button>
        </div>

        <h2 className="text-3xl font-bold font-['Playfair_Display'] text-[#d4af37] mb-2 text-center">
          {orderStatus === 'CANCELLED' ? 'Order Cancelled' : 'Order Sent to Kitchen!'}
        </h2>
        <p className="text-gray-400 text-center mb-10">
          {orderStatus === 'CANCELLED' 
            ? 'We apologize, but your order could not be processed.' 
            : 'We\'ve received your order and are currently preparing it.'}
        </p>

        {orderStatus === 'CANCELLED' ? (
          <div className="flex flex-col items-center justify-center mb-8">
            <AlertCircle className="w-24 h-24 text-red-500 mb-6" />
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-xl text-center font-semibold">
              There was an issue with your order and it has been cancelled by the kitchen. 
              Please speak to a staff member or place a new order.
            </div>
            <button 
              onClick={() => setActiveOrderId(null)}
              className="mt-8 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
            >
              Start New Order
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#d4af37] rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="w-32 h-32 rounded-full bg-[#1a1a1c] border-4 border-[#d4af37] shadow-[0_0_40px_rgba(212,175,55,0.3)] flex items-center justify-center relative z-10">
                <ChefHat className="w-16 h-16 text-[#d4af37] animate-bounce" />
              </div>
            </div>
            
            <div className="bg-[#1a1a1c] border border-gray-800 px-8 py-4 rounded-2xl text-center max-w-sm shadow-lg">
              <p className="text-white font-semibold text-xl flex items-center justify-center gap-3">
                <Flame className="text-[#d4af37]" size={24} />
                Food is in progress
                <Flame className="text-[#d4af37]" size={24} />
              </p>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                Your food will be brought directly to your table as soon as it's ready. Hang tight!
              </p>
            </div>
            
            <div className="mt-12 text-center">
              <button 
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm font-semibold underline"
              >
                Hide this to order more items
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
