import { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useSocket } from '../context/SocketContext';
import { CheckCircle, Flame, X, Minimize2, Maximize2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrderStatusModal() {
  const { activeOrderId, setActiveOrderId } = useCart();
  const { socket } = useSocket();
  const [orderStatus, setOrderStatus] = useState<string>('NEW');
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (!socket || !activeOrderId) return;

    // Reset status when opening a new order
    setOrderStatus('NEW');
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

  const steps = [
    { key: 'NEW', label: 'Received', icon: <CheckCircle className="w-8 h-8" /> },
    { key: 'READY', label: 'Ready!', icon: <CheckCircle className="w-8 h-8" /> },
  ];

  const getStepIndex = (status: string) => {
    if (status === 'NEW') return 0;
    if (status === 'COOKING') return 0; // Fallback if old status exists
    if (status === 'READY') return 1;
    return 0; // Default or CANCELLED
  };

  const currentStep = getStepIndex(orderStatus);

  if (isMinimized) {
    return (
      <div 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 bg-[#0a0a0c] border-2 border-[#d4af37] rounded-full px-6 py-3 shadow-[0_10px_30px_rgba(212,175,55,0.3)] z-[50] cursor-pointer hover:scale-105 transition-transform flex items-center gap-3"
      >
        {orderStatus === 'COOKING' ? <Flame className="text-[#d4af37] animate-pulse" /> : <CheckCircle className="text-[#d4af37]" />}
        <span className="font-bold text-white">
          {orderStatus === 'NEW' && 'Order Received'}
          {orderStatus === 'COOKING' && 'Cooking Now'}
          {orderStatus === 'READY' && 'Ready to Serve!'}
        </span>
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
          {orderStatus === 'CANCELLED' ? 'Order Cancelled' : 'Track Your Order'}
        </h2>
        <p className="text-gray-400 text-center mb-10">
          {orderStatus === 'CANCELLED' 
            ? 'We apologize, but your order could not be processed.' 
            : 'We\'re working on your delicious food.'}
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
          <>
            <div className="relative flex justify-between items-center mb-8 px-4">
              {/* Progress Bar Line */}
              <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-gray-800 rounded-full z-0"></div>
              <div 
                className="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-[#d4af37] rounded-full z-0 transition-all duration-700 ease-out"
                style={{ width: `calc(${(currentStep / 1) * 100}% - 32px)` }}
              ></div>

              {/* Steps */}
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStep;
                const isCurrent = idx === currentStep;
                
                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center gap-3">
                    <div 
                      className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 ${
                        isCompleted 
                          ? 'bg-[#d4af37] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]' 
                          : 'bg-gray-800 text-gray-500 border-2 border-gray-700'
                      } ${isCurrent ? 'scale-110' : ''}`}
                    >
                      {step.icon}
                    </div>
                    <span className={`font-bold ${isCurrent ? 'text-white' : (isCompleted ? 'text-gray-300' : 'text-gray-600')}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {orderStatus === 'READY' && (
              <div className="mt-10 text-center animate-bounce">
                <div className="inline-block bg-green-500/20 text-green-400 px-6 py-3 rounded-full font-bold border border-green-500/30">
                  Your food is ready to be served!
                </div>
              </div>
            )}

            <div className="mt-8 text-center">
              <button 
                onClick={() => setIsMinimized(true)}
                className="text-gray-400 hover:text-[#d4af37] transition-colors text-sm font-semibold underline"
              >
                Hide this to order more items
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
