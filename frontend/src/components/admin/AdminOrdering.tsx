import { useState, useMemo, useRef } from 'react';
import { Search, ChevronDown, Trash2, Plus, Minus, Utensils, CheckCircle } from 'lucide-react';
import ItemModal, { type MenuItem } from '../ItemModal';
import { useSocket } from '../../context/SocketContext';

interface AdminOrderingProps {
  menuItems: MenuItem[];
}

interface PosCartItem {
  cartItemId?: string;
  id: string;
  name: string;
  price: number;
  notes?: string;
  quantity: number;
  addons?: any[];
}

export default function AdminOrdering({ menuItems }: AdminOrderingProps) {
  const { socket } = useSocket();
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [diningType, setDiningType] = useState<'DINE_IN' | 'TAKE_AWAY'>('DINE_IN');
  const [tableNumber, setTableNumber] = useState<string>('1');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [dragDistance, setDragDistance] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
    setDragDistance(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    setDragDistance(Math.abs(x - startX));
  };

  // 1. Categories logic matching the Admin / Customer sorting
  const categoryOrder = [
    'New Menu',
    'Vegetarian Food',
    'Breakfast',
    'Fried Rice',
    'Fried Noodle',
    'Grilled',
    'Soup',
    'Salad',
    'Stir-fried',
    'Iced Drink',
    'Soda',
    'Frappe',
    'Smoothie',
    'Macchiato',
    'Hot Drink',
    'Beverage',
    'Dessert',
    'Cocktails'
  ];

  const rawCategories = useMemo(() => {
    return Array.from(new Set(menuItems.map(item => item.category?.name || item.Category).filter(Boolean))).sort((a, b) => {
      const aStr = String(a);
      const bStr = String(b);
      const aIndex = categoryOrder.indexOf(aStr);
      const bIndex = categoryOrder.indexOf(bStr);
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      
      return aStr.localeCompare(bStr);
    });
  }, [menuItems]);

  const categories = useMemo(() => ['All', ...rawCategories], [rawCategories]);

  // 2. Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      const cat = item.category?.name || item.Category || 'Uncategorized';
      const matchesCat = activeCategory === 'All' || cat === activeCategory;
      const matchesSearch = !searchQuery || (
        (item.name || item.Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.sku || item.SKU || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (searchQuery.toLowerCase().includes('beer') && ['BV8', 'BV9', 'BV10', 'BV11'].includes((item.sku || item.SKU || '').trim().toUpperCase()))
      );
      return matchesCat && matchesSearch;
    });
  }, [menuItems, activeCategory, searchQuery]);

  // 3. Cart handlers
  const handleAddToCartFromModal = (newItem: Omit<PosCartItem, 'quantity' | 'cartItemId'> & { quantity?: number }) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === newItem.id && item.notes === newItem.notes);
      const qty = newItem.quantity || 1;
      
      if (existing) {
        return prev.map(item => 
          (item.id === newItem.id && item.notes === newItem.notes) 
            ? { ...item, quantity: item.quantity + qty } 
            : item
        );
      }
      
      const cartItemId = `${newItem.id}-${Date.now()}`;
      return [...prev, { ...newItem, quantity: qty, cartItemId }];
    });
  };

  const handleAddDirect = (item: MenuItem) => {
    const displayName = item.name || item.Name || 'Unknown';
    const price = Number(item.price || item['Price [Best Khmer (Golden Cafe) Restaurant]'] || 5);
    
    // Check if the item has choices
    const optionsMatch = displayName.match(/\(([^)]+)\)/);
    const hasOptions = optionsMatch && optionsMatch[1].includes('/');
    
    if (hasOptions) {
      setSelectedItem(item);
      return;
    }

    handleAddToCartFromModal({
      id: item.id || item.SKU || displayName,
      name: displayName,
      price: price
    });
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const totalPrice = useMemo(() => {
    return cart.reduce((sum, item) => {
      const itemTotal = item.price + (item.addons?.reduce((addonSum, addon) => addonSum + addon.price, 0) || 0);
      return sum + (itemTotal * item.quantity);
    }, 0);
  }, [cart]);

  // 4. Submit POS Order
  const handleSubmitOrder = () => {
    if (cart.length === 0 || !socket) return;
    
    const tableLabel = diningType === 'TAKE_AWAY' ? 'Takeaway' : tableNumber;
    
    const orderData = {
      table: tableLabel,
      type: diningType,
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        notes: item.notes
      })),
      total: totalPrice
    };

    socket.emit('new_order', orderData);
    
    // Reset state & show feedback
    setCart([]);
    setSuccessMessage(`Order submitted successfully for ${diningType === 'TAKE_AWAY' ? 'Takeaway' : `Table #${tableNumber}`}!`);
    
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-140px)] min-h-[500px]">
      
      {/* LEFT COLUMN: MENU AND CATEGORIES (2/3 width) */}
      <div className="flex-1 lg:flex-[2.2] bg-gray-900/30 rounded-3xl border border-gray-800 p-6 flex flex-col min-h-0 overflow-hidden">
        
        {/* Search & Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold font-['Playfair_Display'] text-[#d4af37]">Cashier POS Menu</h2>
            <p className="text-xs text-gray-400">Select categories or search dishes to input order directly.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search dishes or SKU (e.g. B16)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-[#d4af37] transition-colors text-sm"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="relative mb-5 flex-shrink-0 border-t border-b border-gray-800/60 py-3">
          <div 
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={() => setIsDragging(false)}
            onMouseUp={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            className={`flex overflow-x-auto hide-scrollbar gap-2 items-center select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            {categories.map((cat, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  if (dragDistance > 10) return;
                  setActiveCategory(cat as string);
                }}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === cat 
                    ? 'bg-[#d4af37] text-black shadow-[0_0_12px_rgba(212,175,55,0.4)] scale-105' 
                    : 'bg-gray-900/80 border border-gray-800 text-gray-400 hover:border-[#d4af37] hover:text-[#d4af37]'
                }`}
              >
                {cat as string}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto pr-1 hide-scrollbar min-h-0">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
              <Utensils size={48} className="opacity-20 mb-3" />
              <p className="text-sm">No matching dishes found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const displayName = item.name || item.Name || 'Unknown';
                const price = Number(item.price || item['Price [Best Khmer (Golden Cafe) Restaurant]'] || 5);
                const isAvailable = item.availability !== false;
                
                return (
                  <div 
                    key={item.id} 
                    onClick={() => isAvailable && handleAddDirect(item)}
                    className={`bg-gray-950/60 border border-gray-800 hover:border-[#d4af37]/60 hover:bg-gray-900/40 p-3 rounded-2xl flex gap-3 cursor-pointer transition-all ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={displayName} 
                        className="w-16 h-16 object-cover rounded-xl border border-gray-800 flex-shrink-0"
                        style={{ objectPosition: item.imagePosition || 'center' }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-[#0a0a0c] border border-gray-800 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Utensils size={20} className="text-gray-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="font-bold text-sm text-white truncate leading-snug">{displayName}</h4>
                        {(item.sku || item.SKU) && <span className="text-[10px] text-gray-500 font-mono">#{item.sku || item.SKU}</span>}
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs font-bold text-[#d4af37]">${price.toFixed(2)}</span>
                        {isAvailable ? (
                          <span className="text-[10px] font-extrabold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 px-2 py-0.5 rounded-lg">
                            + Add
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-lg">
                            Out
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: POS CART AND SETTINGS (1/3 width) */}
      <div className="w-full lg:w-96 bg-gray-900/30 rounded-3xl border border-gray-800 p-6 flex flex-col min-h-0">
        <h3 className="text-lg font-bold text-white mb-4 flex-shrink-0 pb-3 border-b border-gray-800 font-['Playfair_Display']">Current POS Order</h3>

        {/* Dynamic Success Alert */}
        {successMessage && (
          <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 animate-pulse flex-shrink-0">
            <CheckCircle size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Table & Dining Configuration */}
        <div className="bg-gray-950/60 border border-gray-800 p-4 rounded-2xl mb-4 flex-shrink-0 space-y-4 shadow-inner">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Dining Method</label>
            <div className="grid grid-cols-2 gap-2 bg-gray-900 p-1 rounded-xl border border-gray-800">
              <button 
                onClick={() => setDiningType('DINE_IN')}
                className={`py-1.5 text-xs font-extrabold rounded-lg transition-all ${diningType === 'DINE_IN' ? 'bg-[#d4af37] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                Dine In
              </button>
              <button 
                onClick={() => setDiningType('TAKE_AWAY')}
                className={`py-1.5 text-xs font-extrabold rounded-lg transition-all ${diningType === 'TAKE_AWAY' ? 'bg-[#d4af37] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                Take Away
              </button>
            </div>
          </div>

          {diningType === 'DINE_IN' && (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Assign Table Number</label>
              <div className="relative">
                <select
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-sm font-bold text-white focus:border-[#d4af37] outline-none appearance-none cursor-pointer"
                >
                  {Array.from({ length: 20 }, (_, i) => String(i + 1)).map(t => (
                    <option key={t} value={t}>Table #{t}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {/* Cart items list */}
        <div className="flex-grow overflow-y-auto space-y-3 pr-1 hide-scrollbar min-h-0 py-1">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-600 py-12">
              <Trash2 size={32} className="opacity-10 mb-2" />
              <p className="text-xs font-bold">Cart is empty.</p>
              <p className="text-[10px] text-gray-500 mt-1">Tap menu items to add to order.</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.cartItemId} className="bg-gray-950/40 border border-gray-800/80 p-3 rounded-xl flex items-center justify-between gap-3 shadow-sm">
                <div className="min-w-0 flex-1">
                  <h5 className="font-bold text-xs text-white truncate leading-snug">{item.name}</h5>
                  {item.notes && <p className="text-[9px] text-[#d4af37] truncate mt-0.5">{item.notes}</p>}
                  <span className="text-[10px] font-semibold text-gray-400 block mt-1">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-900 rounded-lg p-1 border border-gray-800 flex-shrink-0">
                  <button 
                    onClick={() => updateQuantity(item.cartItemId!, -1)}
                    className="p-0.5 hover:text-[#d4af37] transition-colors text-gray-400"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="font-bold text-xs w-4 text-center text-white">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.cartItemId!, 1)}
                    className="p-0.5 hover:text-[#d4af37] transition-colors text-gray-400"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.cartItemId!)}
                  className="p-1.5 text-red-500/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Pricing Summary & Checkout Button */}
        <div className="border-t border-gray-800 pt-4 mt-4 flex-shrink-0 space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Due:</span>
            <div className="text-right">
              <span className="text-2xl font-black text-[#d4af37]">${totalPrice.toFixed(2)}</span>
              <span className="block text-[10px] font-bold text-gray-500 mt-0.5">({(totalPrice * 4000).toLocaleString()} ៛)</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={handleSubmitOrder}
            className={`w-full py-3.5 rounded-xl text-sm font-extrabold shadow-lg transition-all ${
              cart.length > 0 
                ? 'bg-[#d4af37] text-black hover:bg-[#b08d29] hover:scale-[1.02] active:scale-[0.98]' 
                : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-800'
            }`}
          >
            Submit Cashier Order
          </button>
        </div>

      </div>

      {/* Embedded ItemModal for option selections */}
      {selectedItem && (
        <ItemModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
          addToCart={handleAddToCartFromModal}
        />
      )}

    </div>
  );
}
