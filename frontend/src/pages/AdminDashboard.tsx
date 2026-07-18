import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { connectPrinter, printOrderReceipt, autoConnectPrinter } from '../utils/printer';
import { Printer, CheckCircle, History, UtensilsCrossed, Settings2, Grid2X2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function AdminDashboard() {
  const { socket, isConnected } = useSocket();
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [printerStatus, setPrinterStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [analytics, setAnalytics] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [editingItem, setEditingItem] = useState<any | null>(null);
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
      setLiveOrders(orders.reverse());
    });

    socket.on('new_order_received', (order) => {
      if (!order.id) order.id = `mock-${Date.now()}`;
      if (!order.status) order.status = 'COOKING';
      setLiveOrders((prev) => [order, ...prev]);
      printOrderReceipt(order);
    });

    socket.on('order_status_changed', ({ orderId, status }) => {
      setLiveOrders((prev) => {
        if (status === 'PAID') {
          return prev.filter(o => o.id !== orderId);
        }
        return prev.map(o => o.id === orderId ? { ...o, status } : o);
      });
    });

    return () => {
      socket.off('connect', handleConnect);
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
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#d4af37] selection:text-black flex flex-col">
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
      <main className="print:hidden flex-1 p-4 lg:p-8 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900 via-[#050505] to-[#050505]">
        {activeTab === 'Dashboard' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 h-full min-h-[80vh]">
            
            {/* LEFT SIDE: LIVE ORDER FEED */}
            <div className="flex flex-col border border-gray-800 rounded-3xl bg-gray-900/30 backdrop-blur-md overflow-hidden shadow-2xl h-[80vh] xl:h-auto">
              <div className="bg-gray-900/80 p-5 border-b border-gray-800 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-2xl font-bold font-['Playfair_Display'] text-white flex items-center gap-3">
                    <History className="text-blue-400" />
                    Live Order Feed
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">Recent orders sent to the printer. No action required.</p>
                </div>
                <div className="bg-blue-500/20 text-blue-400 px-4 py-1 rounded-full font-bold border border-blue-500/50">
                  {kitchenOrders.length} Recent
                </div>
              </div>

              <div className="p-4 lg:p-6 overflow-y-auto flex-1">
                {kitchenOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500">
                    <CheckCircle size={48} className="mb-4 opacity-30" />
                    <p className="text-xl font-bold">No new orders</p>
                    <p className="text-sm">Waiting for customers to order...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2 gap-4">
                    {kitchenOrders.map((order, idx) => (
                      <div key={order.id || idx} className="p-5 bg-gray-900/80 rounded-2xl border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.15)] flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-[#d4af37] font-bold text-2xl">Table {order.table}</h3>
                            <span className="text-xs px-3 py-1 rounded font-bold border bg-gray-800 text-gray-400 border-gray-700">
                              #{order.dailyOrderNumber || (order.id ? order.id.toString().slice(-4) : 'NEW')}
                            </span>
                          </div>
                          
                          <div className="space-y-3 mb-6 bg-black/40 p-4 rounded-xl">
                            {order.items.map((item: any, i: number) => (
                              <div key={i} className="text-sm border-b border-gray-800/50 last:border-0 pb-2 last:pb-0">
                                <p className="font-bold text-gray-200"><span className="text-blue-400 mr-2">{item.quantity}x</span> {item.name}</p>
                                {item.notes && <p className="text-yellow-500/80 text-xs italic ml-6 mt-1">Note: {item.notes}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-auto pt-2 border-t border-gray-800">
                          <button 
                            onClick={() => printOrderReceipt(order)} 
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-gray-700"
                          >
                            <Printer size={16} /> Reprint Ticket
                          </button>
                          <button 
                            onClick={() => updateStatus(order.id, 'READY')} 
                            className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all border border-blue-500/30"
                            title="Clear from this feed"
                          >
                            <CheckCircle size={16} /> Mark as Done
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: TABLE CHECKOUT HUB */}
            <div className="flex flex-col border border-gray-800 rounded-3xl bg-gray-900/30 backdrop-blur-md overflow-hidden shadow-2xl h-[80vh] xl:h-auto">
              <div className="bg-gray-900/80 p-5 border-b border-gray-800 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="text-2xl font-bold font-['Playfair_Display'] text-white flex items-center gap-3">
                    <Grid2X2 className="text-green-400" />
                    Table Checkout Hub
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">Occupied tables. Mark as Paid when customers checkout.</p>
                </div>
                <div className="bg-green-500/20 text-green-400 px-4 py-1 rounded-full font-bold border border-green-500/50">
                  {Object.keys(activeTables).length} Occupied
                </div>
              </div>

              <div className="p-4 lg:p-6 overflow-y-auto flex-1">
                {Object.keys(activeTables).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gray-500">
                    <Grid2X2 size={48} className="mb-4 opacity-30" />
                    <p className="text-xl font-bold">No Active Tables</p>
                    <p className="text-sm">The restaurant is currently empty.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    {Object.keys(activeTables).map((tableNum) => {
                      const tableData = activeTables[tableNum];
                      return (
                        <div key={tableNum} className="bg-gray-900/80 p-5 lg:p-6 rounded-2xl border border-green-500/40 shadow-[0_0_20px_rgba(34,197,94,0.15)] flex flex-col relative overflow-hidden transition-all duration-300">
                          <div className="absolute top-0 right-0 bg-green-500 text-black text-xs font-bold px-4 py-1 rounded-bl-lg shadow-lg">
                            Active Bill
                          </div>
                          
                          <div className="flex justify-between items-end mb-4">
                            <h3 className="text-3xl font-bold text-white">Table {tableNum}</h3>
                            <span className="font-bold text-green-400 text-2xl">${tableData.total.toFixed(2)}</span>
                          </div>

                          <div className="flex-1 flex flex-col">
                            <p className="text-sm text-gray-400 mb-3 font-bold">{tableData.orders.length} Active Order(s)</p>
                            <div className="space-y-2 mb-6 flex-1">
                              {tableData.orders.map((o: any, i: number) => (
                                <div key={i} className="flex justify-between text-sm bg-black/50 p-3 rounded-lg text-gray-300 border border-gray-800">
                                  <span>Order #{o.id.toString().slice(-4)} <span className={`ml-2 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${o.status === 'READY' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>{o.status}</span></span>
                                  <span className="font-bold">${o.total.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                            
                            <div className="mt-auto flex flex-col gap-2">
                              <button 
                                onClick={() => {
                                  const combinedOrder = {
                                    id: `BILL-${Date.now().toString().slice(-4)}`,
                                    table: tableNum,
                                    type: 'TABLE BILL',
                                    total: tableData.total,
                                    items: tableData.orders.flatMap((o: any) => o.items)
                                  };
                                  printOrderReceipt(combinedOrder);
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl text-sm font-bold transition-all shadow-[0_4px_20px_rgba(59,130,246,0.2)] flex items-center justify-center gap-2"
                              >
                                <Printer size={16} /> Print Bill
                              </button>

                              <button 
                                onClick={() => {
                                  if (window.confirm(`Mark Table ${tableNum} as Paid? Total: $${tableData.total.toFixed(2)}`)) {
                                    // Print combined receipt
                                    const combinedOrder = {
                                      id: `CHECKOUT-${Date.now().toString().slice(-4)}`,
                                      table: tableNum,
                                      type: 'TABLE CHECKOUT',
                                      total: tableData.total,
                                      items: tableData.orders.flatMap((o: any) => o.items)
                                    };
                                    printOrderReceipt(combinedOrder);
                                    
                                    tableData.orders.forEach((o: any) => updateStatus(o.id, 'PAID'));
                                  }
                                }}
                                className="w-full bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl text-lg font-bold transition-all shadow-[0_4px_20px_rgba(22,163,74,0.3)] hover:shadow-[0_4px_25px_rgba(22,163,74,0.5)] hover:scale-[1.02]"
                              >
                                Checkout & Clear Table
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* MENU MANAGEMENT TAB */}
        {activeTab === 'Menu Management' && (
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 font-['Playfair_Display'] text-transparent bg-clip-text bg-gradient-to-r from-white to-[#d4af37]">Menu Management</h1>
            {menuItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 bg-gray-900/40 rounded-3xl border border-gray-800 shadow-lg text-center">
                <UtensilsCrossed size={48} className="text-gray-500 mb-4 opacity-50" />
                <h3 className="text-2xl font-bold mb-2">No Menu Items in Database</h3>
                <p className="text-gray-400 mb-8 max-w-md">Your cloud database currently has no menu items. You can automatically import your existing JSON menu to get started.</p>
                <button 
                  onClick={() => {
                    fetch(`${backendUrl}/api/menu/seed`, { method: 'POST' })
                      .then(res => res.json())
                      .then(() => fetch(`${backendUrl}/api/menu`).then(res => res.json()).then(data => setMenuItems(data)));
                  }}
                  className="bg-[#d4af37] text-black font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-transform"
                >
                  Import from menu.json
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map(item => (
                  <div key={item.id} className="bg-gray-900/60 p-6 rounded-2xl border border-gray-800 shadow-lg relative flex flex-col hover:-translate-y-1 transition-transform">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className={`text-xl font-bold ${item.availability === false ? 'text-gray-500' : ''}`}>{item.name}</h3>
                      <span className="text-[#d4af37] font-bold">${(item.price || 0).toFixed(2)}</span>
                    </div>
                    <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-1">{item.description}</p>
                    <div className="flex justify-between items-center mt-auto border-t border-gray-800 pt-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.availability !== false ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                        {item.availability !== false ? 'Available' : 'Sold Out'}
                      </span>
                      <button 
                        onClick={() => setEditingItem(item)}
                        className="bg-[#222] text-white px-5 py-2 rounded-xl text-sm font-bold border border-gray-700 hover:border-[#d4af37] hover:bg-gray-800 transition-all"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Edit Modal */}
            {editingItem && (
              <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex justify-center items-center p-4 overflow-y-auto">
                <div className="bg-[#0a0a0c] p-8 rounded-3xl border border-gray-800 w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.8)] my-8">
                  <h2 className="text-3xl font-bold mb-6 font-['Playfair_Display'] text-transparent bg-clip-text bg-gradient-to-r from-white to-[#d4af37]">Edit Menu Item</h2>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2 font-bold">Item Name</label>
                      <input 
                        type="text" 
                        value={editingItem.name} 
                        onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2 font-bold">Price ($)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={editingItem.price} 
                        onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value)})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2 font-bold">Description</label>
                      <textarea 
                        value={editingItem.description || ''} 
                        onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none h-32 resize-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-2 font-bold">Image Focal Point</label>
                      <div className="flex gap-6">
                        {/* 9-Grid Selector */}
                        <div className="grid grid-cols-3 gap-1 w-32 h-32 bg-gray-900 border border-gray-700 p-1 rounded-xl flex-shrink-0">
                          {['top left', 'top center', 'top right', 'center left', 'center', 'center right', 'bottom left', 'bottom center', 'bottom right'].map((pos) => (
                            <button
                              key={pos}
                              onClick={() => setEditingItem({...editingItem, imagePosition: pos})}
                              className={`rounded-md transition-colors ${
                                (editingItem.imagePosition || 'center') === pos ? 'bg-[#d4af37]' : 'bg-gray-800 hover:bg-gray-700'
                              }`}
                              title={pos}
                            />
                          ))}
                        </div>
                        {/* Live Preview */}
                        {editingItem.image && (
                          <div className="flex-1 h-32 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden relative">
                            <img 
                              src={editingItem.image} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                              style={{ objectPosition: editingItem.imagePosition || 'center' }}
                            />
                            <div className="absolute inset-0 border-2 border-dashed border-[#d4af37]/50 rounded-xl pointer-events-none"></div>
                            <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">Live Preview</div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Select the most important part of the dish to prevent it from being cropped out on the menu.</p>
                    </div>
                    <div className="flex items-center gap-3 mt-6 p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                      <input 
                        type="checkbox" 
                        id="availability"
                        checked={editingItem.availability !== false} 
                        onChange={(e) => setEditingItem({...editingItem, availability: e.target.checked})}
                        className="w-6 h-6 rounded accent-[#d4af37] cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <label htmlFor="availability" className="text-white font-bold cursor-pointer">Available for Order</label>
                        <span className="text-gray-500 text-xs">Uncheck this to mark the item as Sold Out.</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-8">
                    <button 
                      onClick={() => setEditingItem(null)}
                      className="flex-1 py-4 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors border border-gray-700"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        fetch(`${backendUrl}/api/menu/${editingItem.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(editingItem)
                        })
                        .then(res => res.json())
                        .then(updated => {
                          setMenuItems(prev => prev.map(item => item.id === updated.id ? updated : item));
                          setEditingItem(null);
                        });
                      }}
                      className="flex-1 py-4 rounded-xl bg-[#d4af37] text-black font-bold hover:bg-[#b08d29] transition-colors shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS & SETTINGS TAB */}
        {activeTab === 'Analytics' && (
          <div className="max-w-6xl mx-auto pb-12">
            <h1 className="text-4xl font-bold mb-8 font-['Playfair_Display'] text-transparent bg-clip-text bg-gradient-to-r from-white to-[#d4af37]">Analytics & Settings</h1>
            
            {analytics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900/60 p-8 rounded-3xl border border-gray-800 flex flex-col justify-center items-center shadow-lg">
                    <p className="text-gray-400 mb-2 font-bold tracking-wider uppercase text-sm">Total Revenue</p>
                    <p className="text-5xl font-bold text-[#d4af37]">${(analytics.totalRevenue || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-gray-900/60 p-8 rounded-3xl border border-gray-800 flex flex-col justify-center items-center shadow-lg">
                    <p className="text-gray-400 mb-2 font-bold tracking-wider uppercase text-sm">Total Orders</p>
                    <p className="text-5xl font-bold text-white">{analytics.totalOrders}</p>
                  </div>
                </div>

                <div className="bg-gray-900/60 p-6 rounded-3xl border border-gray-800 shadow-lg">
                  <h3 className="text-xl font-bold mb-6 text-[#d4af37]">Recent Order History</h3>
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
                            <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-300">{new Date(order.createdAt).toLocaleString()}</td>
                            <td className="py-3 px-4 text-xs font-mono text-gray-500">{order.id}</td>
                            <td className="py-3 px-4 font-bold text-[#d4af37] text-right">${order.totalPrice.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="bg-gray-900/60 p-8 rounded-3xl border border-gray-800 shadow-lg mt-8">
                  <h3 className="text-2xl font-bold mb-2 text-white">Print Table QR Codes</h3>
                  <p className="text-gray-400 mb-6">Need new QR codes for your tables? Click below to print a high-quality sheet of codes for all 12 tables.</p>
                  <button 
                    onClick={() => window.print()} 
                    className="bg-white text-black font-bold px-8 py-4 rounded-xl hover:bg-gray-200 transition-colors shadow-lg flex items-center justify-center gap-3 w-full sm:w-auto hover:scale-105"
                  >
                    <Printer size={20} />
                    Print All QR Codes
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* PRINT-ONLY VIEW: QR CODES */}
      <div className="hidden print:block bg-white text-black min-h-screen">
        <h1 className="text-4xl font-bold text-center py-8 border-b-2 border-black mb-8 font-['Playfair_Display']">Scan to Order</h1>
        <div className="grid grid-cols-3 gap-8 px-8">
          {[1,2,3,4,5,6,7,8,9,10,11,12].map(table => {
            const url = `${window.location.origin}/table/${table}`;
            return (
              <div key={table} className="border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center rounded-xl break-inside-avoid">
                <h2 className="text-3xl font-bold mb-6">Table {table}</h2>
                <QRCodeSVG value={url} size={180} level="H" />
                <p className="text-xs text-gray-500 mt-6 font-mono text-center break-all">{url}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
