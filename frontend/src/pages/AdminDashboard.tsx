import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { connectPrinter, printOrderReceipt } from '../utils/printer';
import { Printer, LayoutDashboard, UtensilsCrossed, Grid2X2, Settings, History } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminDashboard() {
  const { socket, isConnected } = useSocket();
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [printerStatus, setPrinterStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
  const [activeTab, setActiveTab] = useState('Live Orders');
  const [analytics, setAnalytics] = useState<any>(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    if (activeTab === 'Settings' && !analytics) {
      fetch(`${backendUrl}/api/analytics`)
        .then(res => res.json())
        .then(data => setAnalytics(data))
        .catch(err => console.error("Failed to fetch analytics", err));
    }
  }, [activeTab, backendUrl, analytics]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('join_admin');

    socket.on('initial_orders', (orders) => {
      setLiveOrders(orders.reverse()); // Latest first
    });

    socket.on('new_order_received', (order) => {
      if (!order.id) order.id = `mock-${Date.now()}`;
      if (!order.status) order.status = 'NEW';
      setLiveOrders((prev) => [order, ...prev]);
      printOrderReceipt(order);
    });

    socket.on('order_status_changed', ({ orderId, status }) => {
      setLiveOrders((prev) => 
        prev.map(o => o.id === orderId ? { ...o, status } : o)
      );
    });

    return () => {
      socket.off('new_order_received');
      socket.off('order_status_changed');
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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'NEW': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'COOKING': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'READY': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const renderContent = () => {
    if (activeTab === 'Live Orders') {
      return (
        <>
          <h1 className="text-4xl font-bold mb-8 font-['Playfair_Display'] text-transparent bg-clip-text bg-gradient-to-r from-white to-[#d4af37]">Live Incoming Orders</h1>
          
          {liveOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 border border-dashed border-gray-700/50 rounded-2xl bg-gray-900/30 backdrop-blur-sm text-gray-500">
              <History size={48} className="mb-4 opacity-50" />
              <p className="text-xl">Waiting for new orders...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveOrders.map((order, idx) => (
                <div key={order.id || idx} className="p-6 bg-gray-900/60 backdrop-blur-md rounded-2xl border border-gray-700/50 hover:border-[#d4af37]/50 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(212,175,55,0.1)] flex flex-col justify-between group">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-[#d4af37] font-bold text-xl">Table {order.table}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold border ${getStatusColor(order.status)}`}>{order.status}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4 flex justify-between">
                      <span>Order #{Math.floor(Math.random() * 1000) + 1000}</span>
                      <span>{order.type}</span>
                    </p>
                    
                    <div className="space-y-3 mb-6 border-t border-gray-800 pt-4">
                      {order.items.map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center group-hover:translate-x-1 transition-transform duration-300">
                          <p><span className="text-[#d4af37] font-bold mr-2">{item.quantity}x</span> {item.name}</p>
                          <p className="text-gray-400">${item.price}</p>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center mb-6 text-xl font-bold bg-black/20 p-4 rounded-xl">
                      <span>Total:</span>
                      <span className="text-[#d4af37]">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-auto">
                    {order.status === 'NEW' && (
                      <>
                        <div className="flex-1 bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                          </span>
                          Waiting for Kitchen
                        </div>
                        <button onClick={() => updateStatus(order.id, 'CANCELLED')} className="w-1/3 bg-[#222] text-gray-400 hover:bg-red-900/30 hover:text-red-400 py-3 rounded-xl text-sm font-bold border border-gray-700 hover:border-red-500/50 transition-all">Reject</button>
                      </>
                    )}
                    {order.status === 'COOKING' && (
                      <div className="w-full text-center text-blue-400 font-bold py-3 border border-blue-500/30 bg-blue-500/10 rounded-xl flex items-center justify-center gap-2">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        Cooking in Kitchen
                      </div>
                    )}
                    {order.status === 'READY' && (
                      <div className="w-full text-center text-green-400 font-bold py-3 border border-green-500/30 bg-green-500/10 rounded-xl">Ready to Serve!</div>
                    )}
                    {order.status === 'CANCELLED' && (
                      <div className="w-full text-center text-red-400 font-bold py-3 border border-red-500/30 bg-red-500/10 rounded-xl">Cancelled</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      );
    }

    if (activeTab === 'Tables') {
      return (
        <>
          <h1 className="text-4xl font-bold mb-8 font-['Playfair_Display'] text-transparent bg-clip-text bg-gradient-to-r from-white to-[#d4af37]">Table QR Codes</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((table) => {
              const url = `${window.location.origin}/table/${table}`;
              return (
                <div key={table} className="bg-gray-900/60 p-6 rounded-2xl border border-gray-800 flex flex-col items-center shadow-lg">
                  <h3 className="text-xl font-bold text-[#d4af37] mb-4">Table {table}</h3>
                  <div className="bg-white p-4 rounded-xl mb-4">
                    <QRCodeSVG value={url} size={150} level="H" />
                  </div>
                  <p className="text-xs text-gray-500 text-center break-all">{url}</p>
                </div>
              );
            })}
          </div>
        </>
      );
    }

    if (activeTab === 'Settings') {
      return (
        <>
          <h1 className="text-4xl font-bold mb-8 font-['Playfair_Display'] text-transparent bg-clip-text bg-gradient-to-r from-white to-[#d4af37]">Analytics & History</h1>
          
          {analytics ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-900/60 p-8 rounded-3xl border border-gray-800 flex flex-col justify-center items-center shadow-lg">
                  <p className="text-gray-400 mb-2">Total Revenue</p>
                  <p className="text-5xl font-bold text-[#d4af37]">${(analytics.totalRevenue || 0).toFixed(2)}</p>
                </div>
                <div className="bg-gray-900/60 p-8 rounded-3xl border border-gray-800 flex flex-col justify-center items-center shadow-lg">
                  <p className="text-gray-400 mb-2">Total Orders</p>
                  <p className="text-5xl font-bold text-white">{analytics.totalOrders}</p>
                </div>
              </div>

              <div className="bg-gray-900/60 p-6 rounded-3xl border border-gray-800 shadow-lg">
                <h3 className="text-xl font-bold mb-4 text-[#d4af37]">Recent Order History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-400">
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Order ID</th>
                        <th className="py-3 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.recentOrders?.map((order: any) => (
                        <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                          <td className="py-3 px-4 whitespace-nowrap text-sm">{new Date(order.createdAt).toLocaleString()}</td>
                          <td className="py-3 px-4 text-xs font-mono text-gray-500">{order.id}</td>
                          <td className="py-3 px-4 font-bold text-[#d4af37] text-right">${order.totalPrice.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
            </div>
          )}
        </>
      );
    }
    
    // Placeholder for other tabs
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <div className="bg-gray-900/50 backdrop-blur-md p-12 rounded-3xl border border-gray-800 shadow-2xl flex flex-col items-center text-center max-w-lg">
          <Settings size={64} className="text-[#d4af37] mb-6 opacity-80" />
          <h2 className="text-3xl font-bold mb-4 font-['Playfair_Display']">{activeTab}</h2>
          <p className="text-gray-400 text-lg">This module is currently under construction and will be available in a future update.</p>
        </div>
      </div>
    );
  };

  const navItems = [
    { name: 'Live Orders', icon: <LayoutDashboard size={20} /> },
    { name: 'Menu Management', icon: <UtensilsCrossed size={20} /> },
    { name: 'Tables', icon: <Grid2X2 size={20} /> },
    { name: 'Settings', icon: <Settings size={20} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#050505] text-white selection:bg-[#d4af37] selection:text-black">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-[#0a0a0c]/95 backdrop-blur-xl p-6 border-b md:border-b-0 md:border-r border-gray-800 shadow-[4px_0_24px_rgba(0,0,0,0.8)] flex flex-col z-10 relative">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] mb-6 md:mb-10 font-['Playfair_Display'] tracking-wide">
          Admin Console
        </h2>
        
        <ul className="flex overflow-x-auto md:flex-col space-x-2 md:space-x-0 md:space-y-2 font-semibold flex-none md:flex-1 pb-4 md:pb-0 hide-scrollbar">
          {navItems.map((item) => (
            <li 
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 whitespace-nowrap ${
                activeTab === item.name 
                  ? 'bg-gradient-to-r from-[#d4af37]/20 to-transparent text-[#d4af37] border-b-2 md:border-b-0 md:border-l-2 border-[#d4af37]' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-900/50 border-b-2 md:border-b-0 md:border-l-2 border-transparent'
              }`}
            >
              {item.icon}
              {item.name}
            </li>
          ))}
        </ul>
        
        <div className="hidden md:block space-y-4 mb-4">
          <button 
            onClick={handleConnectPrinter}
            disabled={printerStatus === 'CONNECTING'}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
              printerStatus === 'CONNECTED' 
                ? 'bg-green-500/10 text-green-400 border border-green-500/30 cursor-default' 
                : printerStatus === 'CONNECTING'
                  ? 'bg-gray-800 text-gray-400 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_4px_20px_rgba(59,130,246,0.2)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.4)]'
            }`}
          >
            <Printer size={18} className={printerStatus === 'CONNECTING' ? 'animate-pulse' : ''} />
            {printerStatus === 'CONNECTED' ? 'Printer Ready' : printerStatus === 'CONNECTING' ? 'Connecting...' : 'Pair Printer'}
          </button>
        </div>

        <div className="flex flex-col gap-2 text-sm border-t border-gray-800/50 pt-6 mt-2">
          <div className="flex items-center gap-3 px-2">
            <span className="relative flex h-3 w-3">
              {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-gray-400 font-medium">{isConnected ? 'System Online' : 'Disconnected'}</span>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-4 md:p-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-[#050505] to-[#050505] overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
}
