import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Clock, CheckCircle, ChefHat, Timer } from 'lucide-react';

export default function KitchenDisplaySystem() {
  const { socket } = useSocket();
  const [kitchenOrders, setKitchenOrders] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    // Timer to update order durations
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join_kitchen');

    socket.on('new_order_received', (order) => {
      if (!order.id) order.id = `mock-${Date.now()}`;
      if (!order.status) order.status = 'NEW';
      // Store arrival time for the timer
      order.arrivalTime = Date.now();
      setKitchenOrders((prev) => [...prev, order]);
    });

    socket.on('order_status_changed', ({ orderId, status }) => {
      setKitchenOrders((prev) => 
        prev.map(o => o.id === orderId ? { ...o, status } : o)
      );
    });

    return () => {
      socket.off('new_order_received');
      socket.off('order_status_changed');
    };
  }, [socket]);

  const updateStatus = (orderId: string, status: string) => {
    if (!socket) return;
    socket.emit('update_order_status', { orderId, status });
  };

  // Only show active kitchen orders (NEW or COOKING)
  const activeOrders = kitchenOrders.filter(o => ['NEW', 'COOKING'].includes(o.status));

  const formatDuration = (arrivalTime: number) => {
    if (!arrivalTime) return '00:00';
    const diff = Math.floor((currentTime - arrivalTime) / 1000);
    const m = Math.floor(diff / 60).toString().padStart(2, '0');
    const s = (diff % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#050505] to-[#050505]">
      <header className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0 mb-6 md:mb-10 bg-gray-900/60 backdrop-blur-md p-4 md:p-6 rounded-2xl border border-gray-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent"></div>
        <div className="flex items-center gap-3 md:gap-4">
          <ChefHat size={32} className="text-[#d4af37] md:w-10 md:h-10" />
          <h1 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#d4af37] font-['Playfair_Display'] tracking-wide">
            Kitchen Display System
          </h1>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="bg-blue-500/20 text-blue-400 px-4 md:px-6 py-2 md:py-3 rounded-xl font-bold flex items-center justify-center gap-2 md:gap-3 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)] w-full md:w-auto">
            <Clock size={20} className="md:w-[22px] md:h-[22px]" />
            <span className="text-lg md:text-xl">{activeOrders.length} Active Orders</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {activeOrders.map((order, idx) => (
          <div 
            key={order.id || idx} 
            className={`flex flex-col bg-gray-900/60 backdrop-blur-md rounded-2xl overflow-hidden border-t-4 transition-all duration-500 shadow-2xl relative ${
              order.status === 'COOKING' 
                ? 'border-blue-500 shadow-[0_8px_30px_rgba(59,130,246,0.15)]' 
                : 'border-[#d4af37] shadow-[0_8px_30px_rgba(212,175,55,0.15)]'
            }`}
          >
            {/* Pulsing indicator for NEW orders */}
            {order.status === 'NEW' && (
              <span className="absolute top-4 right-4 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#d4af37]"></span>
              </span>
            )}

            <div className={`p-5 ${order.status === 'COOKING' ? 'bg-blue-500/10' : 'bg-orange-500/10'} flex justify-between items-start border-b border-gray-800`}>
              <div>
                <h2 className="text-2xl font-bold mb-1">Table {order.table}</h2>
                <p className={`text-sm font-bold tracking-wider uppercase ${order.status === 'COOKING' ? 'text-blue-400' : 'text-[#d4af37]'}`}>
                  {order.type} • {order.status}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 mt-1 mr-4">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Timer size={16} />
                  <span className={`font-mono text-xl font-bold ${
                    order.arrivalTime && (Date.now() - order.arrivalTime) > 600000 ? 'text-red-400 animate-pulse' : 'text-gray-300'
                  }`}>
                    {formatDuration(order.arrivalTime)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 p-6">
              <ul className="space-y-5 text-lg">
                {order.items.map((item: any, i: number) => (
                  <li key={i} className="flex gap-4 pb-5 border-b border-gray-800/50 last:border-0 last:pb-0">
                    <span className="font-bold text-[#d4af37] text-2xl bg-[#d4af37]/10 w-10 h-10 flex items-center justify-center rounded-lg">{item.quantity}</span>
                    <div className="pt-1">
                      <p className="font-semibold text-xl tracking-wide">{item.name}</p>
                      {item.notes && (
                        <div className="bg-red-900/20 border border-red-500/20 text-red-400 text-sm mt-2 p-2 rounded-lg font-bold tracking-wide flex gap-2">
                          <span className="uppercase text-xs opacity-70 mt-0.5">Note:</span> 
                          {item.notes}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="p-5 bg-black/40 border-t border-gray-800">
              {order.status === 'NEW' ? (
                <button 
                  onClick={() => updateStatus(order.id, 'COOKING')}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 py-4 rounded-xl text-lg font-bold shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.5)] transition-all transform hover:-translate-y-1 flex justify-center items-center gap-3"
                >
                  <ChefHat size={22} />
                  Start Cooking
                </button>
              ) : (
                <button 
                  onClick={() => updateStatus(order.id, 'READY')}
                  className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 py-4 rounded-xl text-lg font-bold shadow-[0_4px_20px_rgba(34,197,94,0.3)] hover:shadow-[0_4px_25px_rgba(34,197,94,0.5)] transition-all transform hover:-translate-y-1 flex justify-center items-center gap-3"
                >
                  <CheckCircle size={22} />
                  Mark as Ready
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
