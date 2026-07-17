import { useEffect, useState } from 'react';
import { Package, AlertTriangle, CheckCircle, Plus, Minus, ShoppingCart, Search } from 'lucide-react';

interface InventoryItem {
  id: string;
  name: string;
  khmerName: string | null;
  category: string;
  quantity: number;
  unit: string;
  lowWarning: number;
  status: string;
}

export default function InventoryDashboard() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/inventory`);
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const updateItemStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`${backendUrl}/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const updateQuantity = async (id: string, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    try {
      const res = await fetch(`${backendUrl}/api/inventory/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: newQty })
      });
      if (res.ok) {
        setItems(items.map(item => item.id === id ? { ...item, quantity: newQty } : item));
      }
    } catch (err) {
      console.error('Failed to update quantity', err);
    }
  };

  const categories = ['All', 'To Buy', ...Array.from(new Set(items.map(i => i.category)))];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          (item.khmerName || '').includes(search);
    
    if (activeTab === 'To Buy') {
      return matchesSearch && (item.status === 'LOW_STOCK' || item.status === 'OUT_OF_STOCK');
    }
    
    const matchesCategory = activeTab === 'All' ? true : item.category === activeTab;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white shadow-lg border-r border-gray-100 flex-shrink-0">
        <div className="p-6 border-b border-gray-100 bg-[#d4af37]/10">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-[#d4af37]" />
            Inventory
          </h1>
          <p className="text-sm text-gray-500 mt-1">Kitchen Stock Tracking</p>
        </div>
        
        <nav className="p-4 space-y-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-between ${
                activeTab === cat 
                  ? 'bg-[#d4af37] text-white shadow-md shadow-[#d4af37]/20' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                {cat === 'To Buy' ? <ShoppingCart className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                {cat === 'All' ? 'ទាំងអស់ (All)' : cat === 'To Buy' ? 'បញ្ជីត្រូវទិញ (To Buy)' : cat}
              </div>
              {cat === 'To Buy' && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === cat ? 'bg-white text-[#d4af37]' : 'bg-red-100 text-red-600'}`}>
                  {items.filter(i => i.status === 'LOW_STOCK' || i.status === 'OUT_OF_STOCK').length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              {activeTab === 'To Buy' ? 'Shopping List' : 'Stock Management'}
            </h2>
            <p className="text-gray-500 mt-1">
              {activeTab === 'To Buy' ? 'Items that are running low or out of stock' : 'Track and update daily ingredient levels'}
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="ស្វែងរក / Search ingredients..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
          </div>
        ) : (
          /* Inventory Grid */
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className={`bg-white rounded-2xl shadow-sm border p-6 transition-all duration-300 hover:shadow-md ${
                  item.status === 'OUT_OF_STOCK' ? 'border-red-200 bg-red-50/30' : 
                  item.status === 'LOW_STOCK' ? 'border-orange-200 bg-orange-50/30' : 'border-gray-100'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{item.khmerName || item.name}</h3>
                    <p className="text-sm text-gray-500 font-medium">{item.name} • {item.category}</p>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.status === 'IN_STOCK' ? 'bg-green-100 text-green-700' :
                    item.status === 'LOW_STOCK' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.status === 'IN_STOCK' ? 'In Stock' :
                     item.status === 'LOW_STOCK' ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity, -0.5)}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-700"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <div className="text-center min-w-[80px]">
                      <span className="text-3xl font-bold text-gray-900">{item.quantity}</span>
                      <span className="text-gray-500 ml-1">{item.unit}</span>
                    </div>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity, 0.5)}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors text-gray-700"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => updateItemStatus(item.id, 'IN_STOCK')}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1 ${
                      item.status === 'IN_STOCK' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" /> គ្រប់គ្រាន់
                  </button>
                  <button 
                    onClick={() => updateItemStatus(item.id, 'LOW_STOCK')}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1 ${
                      item.status === 'LOW_STOCK' ? 'bg-orange-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" /> ជិតអស់
                  </button>
                  <button 
                    onClick={() => updateItemStatus(item.id, 'OUT_OF_STOCK')}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1 ${
                      item.status === 'OUT_OF_STOCK' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <AlertTriangle className="w-4 h-4" /> អស់ស្តុក
                  </button>
                </div>
              </div>
            ))}
            
            {filteredItems.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-1">No items found</h3>
                <p className="text-gray-500">Everything looks good!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
