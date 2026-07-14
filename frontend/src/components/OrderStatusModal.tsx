import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useSocket } from '../context/SocketContext';
import { CheckCircle, Clock, Flame, X } from 'lucide-react';

export default function OrderStatusModal() {
  const { activeOrderId, setActiveOrderId } = useCart();
  const { socket } = useSocket();
  const [orderStatus, setOrderStatus] = useState<string>('NEW');

  useEffect(() => {
    if (!socket || !activeOrderId) return;

    // Reset status when opening a new order
    setOrderStatus('NEW');

    const handleStatusChange = ({ orderId, status }: { orderId: string, status: string }) => {
      if (orderId === activeOrderId) {
        setOrderStatus(status);
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
    { key: 'COOKING', label: 'Cooking', icon: <Flame className="w-8 h-8" /> },
    { key: 'READY', label: 'Ready!', icon: <CheckCircle className="w-8 h-8" /> },
  ];

  const getStepIndex = (status: string) => {
    if (status === 'NEW') return 0;
    if (status === 'COOKING') return 1;
    if (status === 'READY') return 2;
    return 0; // Default or CANCELLED
  };

  const currentStep = getStepIndex(orderStatus);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative">
        <button 
          onClick={() => setActiveOrderId(null)}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <h2 className="text-3xl font-bold font-['Playfair_Display'] text-[#d4af37] mb-2 text-center">Track Your Order</h2>
        <p className="text-gray-400 text-center mb-10">We're working on your delicious food.</p>

        <div className="relative flex justify-between items-center mb-8 px-4">
          {/* Progress Bar Line */}
          <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-gray-800 rounded-full z-0"></div>
          <div 
            className="absolute left-8 top-1/2 -translate-y-1/2 h-1 bg-[#d4af37] rounded-full z-0 transition-all duration-700 ease-out"
            style={{ width: `calc(${(currentStep / 2) * 100}% - 32px)` }}
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
        
        {orderStatus === 'CANCELLED' && (
          <div className="mt-10 text-center">
            <div className="inline-block bg-red-500/20 text-red-400 px-6 py-3 rounded-full font-bold border border-red-500/30">
              Order was cancelled. Please see staff.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
