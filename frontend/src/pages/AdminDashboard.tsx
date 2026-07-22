import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { connectPrinter, autoConnectPrinter } from '../utils/printer';
import { Printer, UtensilsCrossed, Settings2 } from 'lucide-react';

import AdminLiveOrders from '../components/admin/AdminLiveOrders';
import AdminMenuManagement from '../components/admin/AdminMenuManagement';
import AdminAnalytics from '../components/admin/AdminAnalytics';

export default function AdminDashboard() {
  const { socket, isConnected } = useSocket();
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [printerStatus, setPrinterStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [analytics, setAnalytics] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    autoConnectPrinter().then(success => {
      if (success) setPrinterStatus('CONNECTED');
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'Menu Management' && menuItems.length === 0) {
      fetch(`${backendUrl}/api/menu`)
        .then(res => res.json())
        .then(data => setMenuItems(data))
        .catch(err => console.error("Failed to fetch menu", err));
    }
  }, [activeTab, backendUrl, menuItems.length]);

  useEffect(() => {
    if (activeTab === 'Analytics' && !analytics) {
      fetch(`${backendUrl}/api/analytics`)
        .then(res => res.json())
        .then(data => setAnalytics(data))
        .catch(err => console.error("Failed to fetch analytics", err));
    }
  }, [activeTab, backendUrl, analytics]);

  useEffect(() => {
    if (!socket) return;
    
    // Ensure we join admin room on initial connect AND reconnects
    const handleConnect = () => {
      socket.emit('join_admin');
    };
    
    // If already connected when component mounts, join immediately
    if (socket.connected) {
      handleConnect();
    }
    
    socket.on('connect', handleConnect);
    
    socket.on('initial_orders', (orders: any[]) => {
      setLiveOrders(orders);
    });

    socket.on('new_order_received', (orderData: any) => {
      setLiveOrders((prev) => [...prev, orderData]);
    });

    socket.on('order_status_changed', ({ orderId, status }) => {
      setLiveOrders((prev) => {
        if (status === 'PAID') {
          return prev.filter(o => o.id !== orderId);
        }
        return prev.map(o => o.id === orderId ? { ...o, status } : o);
      });
    });
    
    socket.on('menu_updated', (updatedItem: any) => {
      setMenuItems((prev) => {
        const exists = prev.find(i => i.id === updatedItem.id);
        if (exists) {
          return prev.map(i => i.id === updatedItem.id ? updatedItem : i);
        }
        return [...prev, updatedItem];
      });
    });

    return () => {
      socket.off('connect', handleConnect);
      socket.off('initial_orders');
      socket.off('new_order_received');
      socket.off('order_status_changed');
      socket.off('menu_updated');
    };
  }, [socket]);

  const handleConnectPrinter = async () => {
    setPrinterStatus('CONNECTING');
    const success = await connectPrinter();
    setPrinterStatus(success ? 'CONNECTED' : 'DISCONNECTED');
  };

  const updateStatus = (orderId: string, status: string) => {
    if (!socket) return;
    socket.emit('update_order_status', { orderId, status });
  };

  // derived data for the hubs
  const kitchenOrders = liveOrders.filter(o => o.status === 'NEW' || o.status === 'COOKING');
  
  const activeTables = liveOrders.reduce((acc, order) => {
    const table = order.table;
    if (!acc[table]) acc[table] = { orders: [], total: 0 };
    acc[table].orders.push(order);
    acc[table].total += order.total;
    return acc;
  }, {} as Record<string, { orders: any[], total: number }>);


  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#d4af37] selection:text-black flex flex-col print:bg-white print:text-black print:min-h-0">
      {/* Top Navbar */}
      <nav className="print:hidden bg-[#0a0a0c]/95 backdrop-blur-xl border-b border-gray-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center shadow-[0_4px_24px_rgba(0,0,0,0.8)] sticky top-0 z-50 gap-4">
        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
          <h2 
            onClick={() => setActiveTab('Dashboard')}
            className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] font-['Playfair_Display'] cursor-pointer tracking-wide hover:scale-105 transition-transform"
          >
            Cashier Dashboard
          </h2>
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-900 rounded-full border border-gray-800">
            <span className="relative flex h-2.5 w-2.5">
              {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-xs text-gray-400 font-bold">{isConnected ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <button 
            onClick={handleConnectPrinter}
            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              printerStatus === 'CONNECTED' 
                ? 'bg-green-500/10 text-green-400 border border-green-500/30' 
                : printerStatus === 'CONNECTING'
                  ? 'bg-gray-800 text-gray-400 animate-pulse'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
            }`}
          >
            <Printer size={16} />
            <span>
              {printerStatus === 'CONNECTED' ? 'Printer Ready' : printerStatus === 'CONNECTING' ? 'Connecting...' : 'Connect Printer'}
            </span>
          </button>
          <div className="h-6 w-px bg-gray-800 hidden sm:block"></div>
          <button 
            onClick={() => setActiveTab('Menu Management')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'Menu Management' ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-[#222] text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500'}`}
          >
            <UtensilsCrossed size={16} /> Menu Setup
          </button>
          <button 
            onClick={() => setActiveTab('Analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === 'Analytics' ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-[#222] text-gray-400 border border-gray-700 hover:text-white hover:border-gray-500'}`}
          >
            <Settings2 size={16} /> Settings
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 lg:p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-[#050505] to-[#050505] print:bg-white print:p-0 print:m-0">
        {activeTab === 'Dashboard' && (
          <div className="print:hidden">
            <AdminLiveOrders 
              kitchenOrders={kitchenOrders} 
              activeTables={activeTables} 
              updateStatus={updateStatus} 
            />
          </div>
        )}
        
        {activeTab === 'Menu Management' && (
          <div className="print:hidden">
            <AdminMenuManagement 
              menuItems={menuItems} 
              setMenuItems={setMenuItems} 
              backendUrl={backendUrl} 
            />
          </div>
        )}

        {activeTab === 'Analytics' && (
          <AdminAnalytics analytics={analytics} />
        )}
      </main>
    </div>
  );
}
