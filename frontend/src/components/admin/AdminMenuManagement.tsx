import React, { useState, useRef, useCallback } from 'react';
import { Search, Image as ImageIcon, UtensilsCrossed } from 'lucide-react';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '../../utils/cropImage';
import { getOptimizedImage } from '../../utils/image';

const DraggableScrollContainer = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };
  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className={`flex overflow-x-auto hide-scrollbar cursor-grab active:cursor-grabbing px-4 py-4 -mx-4 ${className || ''}`}
    >
      {children}
    </div>
  );
};

interface AdminMenuManagementProps {
  menuItems: any[];
  setMenuItems: React.Dispatch<React.SetStateAction<any[]>>;
  backendUrl: string;
}

export default function AdminMenuManagement({ menuItems, setMenuItems, backendUrl }: AdminMenuManagementProps) {
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [imageFilter, setImageFilter] = useState<'ALL' | 'WITH_IMAGE' | 'NO_IMAGE'>('ALL');
  
  const [removedImageBackup, setRemovedImageBackup] = useState<string | null>(null);

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

  const rawCategories = Array.from(new Set(menuItems.map(item => item.category?.name || item.Category || 'Uncategorized'))).sort((a, b) => {
    const aStr = String(a);
    const bStr = String(b);
    const aIndex = categoryOrder.indexOf(aStr);
    const bIndex = categoryOrder.indexOf(bStr);
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    return aStr.localeCompare(bStr);
  });
  const categories = ['All', ...rawCategories];
  
  const hasValidImage = (item: any) => {
    const img = item.image || item.Cloudinary_ID;
    if (!img) return false;
    const str = String(img).trim().toLowerCase();
    return str !== '' && str !== 'null' && str !== 'undefined' && str !== 'none';
  };

  const displayItems = menuItems.filter(item => {
    const categoryName = item.category?.name || 'Uncategorized';
    const matchesCategory = activeCategory === 'All' || categoryName === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.sku || item.SKU || '').toLowerCase().includes(searchQuery.toLowerCase());
                          
    let matchesImage = true;
    if (imageFilter === 'WITH_IMAGE') matchesImage = hasValidImage(item);
    if (imageFilter === 'NO_IMAGE') matchesImage = !hasValidImage(item);

    return matchesCategory && matchesSearch && matchesImage;
  }).sort((a, b) => {
    const skuA = (a.sku || a.SKU || '').toLowerCase();
    const skuB = (b.sku || b.SKU || '').toLowerCase();
    const nameA = (a.name || a.Name || '').toLowerCase();
    const nameB = (b.name || b.Name || '').toLowerCase();

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();

      // 1. Exact SKU match
      const aExactSku = skuA === lowerQuery;
      const bExactSku = skuB === lowerQuery;
      if (aExactSku && !bExactSku) return -1;
      if (!aExactSku && bExactSku) return 1;

      // 2. SKU starts with query
      const aStartsSku = skuA.startsWith(lowerQuery);
      const bStartsSku = skuB.startsWith(lowerQuery);
      if (aStartsSku && !bStartsSku) return -1;
      if (!aStartsSku && bStartsSku) return 1;

      // 3. Name starts with query
      const aStartsName = nameA.startsWith(lowerQuery);
      const bStartsName = nameB.startsWith(lowerQuery);
      if (aStartsName && !bStartsName) return -1;
      if (!aStartsName && bStartsName) return 1;
    }

    // Default sorting by SKU
    if (skuA && !skuB) return -1;
    if (!skuA && skuB) return 1;
    if (skuA && skuB) {
      return skuA.localeCompare(skuB, undefined, { numeric: true, sensitivity: 'base' });
    }
    
    // Fallback to name if no SKU
    return nameA.localeCompare(nameB);
  });

  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (!editingItem?.image || !croppedAreaPixels) return;
    setIsCropping(true);
    try {
      const croppedBlob = await getCroppedImg(editingItem.image, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Failed to crop image");
      
      const formData = new FormData();
      formData.append('file', croppedBlob);
      formData.append('upload_preset', 'restaurant_menu');

      const res = await fetch('https://api.cloudinary.com/v1_1/dcizelppo/image/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.secure_url) {
        setEditingItem({ ...editingItem, image: data.secure_url });
        setIsCropModalOpen(false);
      } else {
        alert("Upload failed.");
      }
    } catch (e) {
      console.error(e);
      alert("Error cropping image.");
    } finally {
      setIsCropping(false);
    }
  };

  const localFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Use category subfolder: frontend/public/images/<Category>/<filename>
    const filename = file.name;
    const category = editingItem?.Category || 'Uncategorized';
    setEditingItem((prev: any) => ({ ...prev, image: `/images/${category}/${filename}` }));
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const totalItemsCount = menuItems.length;
  const itemsWithImageCount = menuItems.filter(hasValidImage).length;
  const imageCompletionPercentage = totalItemsCount > 0 ? Math.round((itemsWithImageCount / totalItemsCount) * 100) : 0;

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { 'All': menuItems.length };
    menuItems.forEach(item => {
      const cat = item.category?.name || item.Category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [menuItems]);

  const [isImporting, setIsImporting] = useState(false);

  const handleImportMenu = () => {
    setIsImporting(true);
    fetch(`${backendUrl}/api/menu/seed`, { method: 'POST' })
      .then(res => res.json())
      .then(() => {
        fetch(`${backendUrl}/api/menu`)
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setMenuItems(data);
          });
      })
      .catch(err => {
        console.error("Import failed:", err);
        alert("Failed to import menu.");
      })
      .finally(() => setIsImporting(false));
  };

  const handlePriceChange = (item: any, newPriceStr: string) => {
    const newPrice = parseFloat(newPriceStr);
    if (isNaN(newPrice) || newPrice < 0) return;
    if (newPrice === item.price) return;

    fetch(`${backendUrl}/api/menu/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...item, price: newPrice })
    })
    .then(res => res.json())
    .then(updated => {
      setMenuItems(prev => prev.map(m => (
        (m.id && updated.id && String(m.id) === String(updated.id)) ||
        (m.sku && updated.sku && String(m.sku).toLowerCase() === String(updated.sku).toLowerCase())
      ) ? { ...m, ...updated } : m));
    })
    .catch(err => console.error("Failed to update price inline", err));
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* ... (Menu Management header with top dish counter badges) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-bold font-['Playfair_Display'] text-transparent bg-clip-text bg-gradient-to-r from-white to-[#d4af37]">Menu Management</h1>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse"></span>
              {totalItemsCount} Total Dishes
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {displayItems.length} Showing Now
            </span>
            {activeCategory !== 'All' && (
              <span className="bg-gray-800 text-gray-300 border border-gray-700 px-3.5 py-1 rounded-full text-xs font-bold tracking-wide">
                Category: {activeCategory} ({categoryCounts[activeCategory] || 0})
              </span>
            )}
          </div>
        </div>
        
        {totalItemsCount > 0 && (
          <div className="w-full md:w-64 bg-gray-900/60 p-4 rounded-2xl border border-gray-800 shadow-lg">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm text-gray-400 font-bold">Image Completion</span>
              <span className="text-lg font-bold text-[#d4af37]">{imageCompletionPercentage}%</span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#b08d29] to-[#d4af37] transition-all duration-500 ease-out"
                style={{ width: `${imageCompletionPercentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-2 text-right">
              {itemsWithImageCount} of {totalItemsCount} dishes with photos
            </div>
          </div>
        )}
      </div>
      
      {menuItems.length > 0 && (
      <div className="bg-[#0a0a0c]/90 backdrop-blur-md py-4 mb-8 border-b border-gray-800">
        <div className="flex flex-col gap-4">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text"
              placeholder="Search for a dish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#d4af37] transition-colors"
            />
          </div>
          <DraggableScrollContainer className="gap-3 items-center">
            {categories.map((cat, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveCategory(cat as string)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                  activeCategory === cat 
                    ? 'bg-[#d4af37] text-[#000000] shadow-[0_0_15px_rgba(212,175,55,0.4)]' 
                    : 'bg-gray-900 border border-gray-700 text-gray-400 hover:border-[#d4af37] hover:text-[#d4af37]'
                }`}
              >
                <span>{cat as string}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  activeCategory === cat ? 'bg-black/20 text-black' : 'bg-gray-800 text-gray-400'
                }`}>
                  {categoryCounts[cat as string] || 0}
                </span>
              </button>
            ))}
          </DraggableScrollContainer>
          <DraggableScrollContainer className="gap-3 items-center border-t border-gray-800 pt-4 mt-2">
            <span className="text-gray-500 font-bold text-sm mr-2 whitespace-nowrap">Image Filter:</span>
            <button 
              onClick={() => setImageFilter('ALL')}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                imageFilter === 'ALL' 
                  ? 'bg-gray-700 text-white' 
                  : 'bg-transparent text-gray-500 hover:text-white'
              }`}
            >
              Show All
            </button>
            <button 
              onClick={() => setImageFilter('WITH_IMAGE')}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                imageFilter === 'WITH_IMAGE' 
                  ? 'bg-[#d4af37] text-black shadow-[0_0_10px_rgba(212,175,55,0.4)]' 
                  : 'bg-transparent text-[#d4af37]/60 hover:text-[#d4af37]'
              }`}
            >
              With Image
            </button>
            <button 
              onClick={() => setImageFilter('NO_IMAGE')}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                imageFilter === 'NO_IMAGE' 
                  ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]' 
                  : 'bg-transparent text-red-500/60 hover:text-red-500'
              }`}
            >
              Missing Image
            </button>
          </DraggableScrollContainer>
        </div>
      </div>
    )}

    {menuItems.length === 0 ? (
      <div className="flex flex-col items-center justify-center p-12 bg-gray-900/40 rounded-3xl border border-gray-800 shadow-lg text-center">
        <UtensilsCrossed size={48} className="text-gray-500 mb-4 opacity-50" />
        <h3 className="text-2xl font-bold mb-2">No Menu Items in Database</h3>
        <p className="text-gray-400 mb-8 max-w-md">Your cloud database currently has no menu items. You can automatically import your existing JSON menu to get started.</p>
        <button 
          onClick={handleImportMenu}
          disabled={isImporting}
          className={`bg-[#d4af37] text-black font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:scale-105 transition-all ${isImporting ? 'opacity-50 cursor-wait' : ''}`}
        >
          {isImporting ? 'Importing Menu...' : 'Import from menu.json'}
        </button>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayItems.map(item => (
          <div key={item.id} className="bg-gray-900/60 p-6 rounded-2xl border border-gray-800 shadow-lg relative flex flex-col hover:-translate-y-1 transition-transform">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className={`text-xl font-bold ${item.availability === false ? 'text-gray-500' : ''}`}>{item.name}</h3>
                {(item.sku || item.SKU) && <span className="text-sm font-mono text-gray-500 mt-1 block">{item.sku || item.SKU}</span>}
              </div>
              <div className="flex items-center gap-1 bg-gray-950/60 px-3 py-1.5 rounded-xl border border-gray-800 focus-within:border-[#d4af37]/80 focus-within:bg-gray-900/80 transition-all shadow-inner">
                <span className="text-[#d4af37] font-bold text-sm">$</span>
                <input 
                  type="number" 
                  step="0.01"
                  key={item.price}
                  defaultValue={item.price}
                  onBlur={(e) => handlePriceChange(item, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handlePriceChange(item, e.currentTarget.value);
                      e.currentTarget.blur();
                    }
                  }}
                  className="w-16 bg-transparent text-right font-bold text-base text-[#d4af37] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  title="Click to edit price directly"
                />
              </div>

            </div>
            <p className="text-gray-400 text-sm line-clamp-2 mb-6 flex-1">{item.description}</p>
            <div className="flex justify-between items-center mt-auto border-t border-gray-800 pt-4">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.availability !== false ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
                  {item.availability !== false ? 'Available' : 'Sold Out'}
                </span>
                {item.image && (
                  <span className="px-2 py-1 rounded-full text-xs bg-gray-800 text-gray-400 border border-gray-700 flex items-center gap-1" title="Has Image">
                    <ImageIcon size={12} />
                    <span className="hidden sm:inline">Image</span>
                  </span>
                )}
              </div>
              <button 
                onClick={() => {
                  setEditingItem(item);
                  setRemovedImageBackup(null);
                }}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                <label className="block text-gray-400 text-sm mb-2 font-bold">SKU Code</label>
                <input 
                  type="text" 
                  value={editingItem.sku || editingItem.SKU || ''} 
                  onChange={(e) => setEditingItem({...editingItem, sku: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded-xl p-4 text-white focus:border-[#d4af37] outline-none transition-colors"
                />
              </div>
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
              <div className="flex justify-between items-center mb-2">
                <label className="block text-gray-400 text-sm font-bold">Image & Focal Point</label>
                <div className="flex gap-2">
                  {editingItem.image && (
                    <button 
                      onClick={() => setIsCropModalOpen(true)}
                      className="bg-[#d4af37]/20 hover:bg-[#d4af37]/40 text-[#d4af37] border border-[#d4af37]/50 px-3 py-1 rounded text-xs font-bold transition-colors"
                    >
                      Crop Existing
                    </button>
                  )}
                  <label
                    className="bg-[#222] hover:bg-gray-800 text-white border border-gray-700 px-3 py-1 rounded text-xs font-bold transition-colors cursor-pointer"
                  >
                    Upload New
                    <input
                      ref={localFileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLocalImageUpload}
                    />
                  </label>
                  {editingItem.image && (
                    <button 
                      onClick={() => {
                        setRemovedImageBackup(editingItem.image);
                        setEditingItem({...editingItem, image: null});
                      }}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded text-xs font-bold transition-colors"
                    >
                      Remove
                    </button>
                  )}
                  {removedImageBackup && !editingItem.image && (
                    <button 
                      onClick={() => {
                        setEditingItem({...editingItem, image: removedImageBackup});
                        setRemovedImageBackup(null);
                      }}
                      className="bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 px-3 py-1 rounded text-xs font-bold transition-colors"
                    >
                      Undo Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Image Assign Option */}
              <div className="mb-4 bg-[#18181c] p-3 rounded-xl border border-[#d4af37]/30">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#d4af37]">🎯 Image File / Dish Code</label>
                  {editingItem.image && (
                    <button
                      type="button"
                      onClick={() => setEditingItem({ ...editingItem, image: null })}
                      className="text-[11px] text-red-400 hover:underline font-bold"
                    >
                      Clear Image (Leave Empty)
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. F5.jfif or fried spring rolls.png or leave empty"
                    value={editingItem.image || ''}
                    onChange={(e) => {
                      let val = e.target.value.trim();
                      if (!val) {
                        setEditingItem({ ...editingItem, image: null });
                        return;
                      }
                      if (!val.startsWith('/images/') && !val.startsWith('http')) {
                        const cat = editingItem.category?.name || editingItem.Category || 'Uncategorized';
                        val = `/images/${cat}/${val}`;
                      }
                      setEditingItem({ ...editingItem, image: val });
                    }}
                    className="flex-1 bg-black/60 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#d4af37] outline-none"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Type the image filename or SKU code (e.g. <code className="text-[#d4af37]">F5.jfif</code>). Clear the box to leave it empty.</p>
              </div>
              <div className="flex gap-6">
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
                {editingItem.image ? (
                  <div className="flex-1 h-32 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden relative">
                    <img 
                      src={getOptimizedImage(editingItem.image, 600) || editingItem.image} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                      style={{ objectPosition: editingItem.imagePosition || 'center' }}
                    />
                    <div className="absolute inset-0 border-2 border-dashed border-[#d4af37]/50 rounded-xl pointer-events-none"></div>
                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">Live Preview</div>
                  </div>
                ) : (
                  <label className="flex-1 h-32 bg-gray-900/50 border border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-500 cursor-pointer hover:border-gray-500 hover:text-gray-400 transition-colors">
                    <span className="text-2xl mb-1">+</span>
                    <span className="text-xs font-bold">Click to Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLocalImageUpload}
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">Upload a photo, then select the most important part of the dish to prevent it from being cropped out on the menu.</p>
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
              onClick={() => {
                alert("Deletion is locked to prevent accidental data loss.");
              }}
              className="flex-[0.5] py-4 rounded-xl bg-red-900/10 text-red-500/50 font-bold cursor-not-allowed border border-red-900/20"
              title="Deletion is currently locked"
            >
              Delete (Locked)
            </button>
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
                  setMenuItems(prev => prev.map(item => (
                    (item.id && updated.id && String(item.id) === String(updated.id)) ||
                    (item.sku && updated.sku && String(item.sku).toLowerCase() === String(updated.sku).toLowerCase())
                  ) ? { ...item, ...updated } : item));
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

    {/* Crop Modal */}
    {isCropModalOpen && (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[200] flex justify-center items-center p-4">
        <div className="bg-[#0a0a0c] p-6 rounded-3xl w-full max-w-2xl border border-gray-800">
          <h3 className="text-2xl font-bold mb-4 text-white">Crop Image</h3>
          <div className="relative w-full h-[400px] bg-black rounded-xl overflow-hidden mb-6">
            {editingItem?.image && (
              <Cropper
                image={editingItem.image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="flex gap-4">
            <button onClick={() => setIsCropModalOpen(false)} className="flex-1 py-3 rounded-xl bg-gray-800 text-white font-bold hover:bg-gray-700 transition-colors">Cancel</button>
            <button 
              onClick={handleSaveCrop}
              disabled={isCropping}
              className={`flex-1 py-3 rounded-xl bg-[#d4af37] text-black font-bold hover:bg-[#b08d29] transition-colors ${isCropping ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isCropping ? 'Saving...' : 'Apply Crop'}
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
