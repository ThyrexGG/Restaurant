import React from 'react';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../cloudinary';
import { useCart } from '../context/CartContext';
import menuDataFallback from '../assets/menu.json';
import { Search } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import ItemModal, { type MenuItem } from './ItemModal';

const extractCloudinaryPublicId = (urlOrId: string | undefined | null): string | null => {
  if (!urlOrId) return null;
  if (!urlOrId.startsWith('http')) return urlOrId;
  
  const parts = urlOrId.split('/upload/');
  if (parts.length > 1) {
    let path = parts[1];
    if (path.match(/^v\d+\//)) {
      path = path.replace(/^v\d+\//, '');
    }
    path = path.replace(/\.[^/.]+$/, '');
    return path;
  }
  return urlOrId;
};

function MenuItemCard({ item, onSelect, isPopular = false }: { item: MenuItem, onSelect: () => void, isPopular?: boolean }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { addToCart } = useCart();
  
  const displayName = item.name || item.Name || 'Unknown Item';
  const displayDesc = item.description || item.Description || '';
  const priceValue = item.price || item['Price [Best Khmer (Golden Cafe) Restaurant]'] || '5.00';
  const price = Number(priceValue);
  
  const localImage = item.image?.startsWith('/images/') ? item.image : null;
  const rawCloudinaryId = !localImage ? (item.image || item.Cloudinary_ID) : null;
  const cloudinaryImgId = extractCloudinaryPublicId(rawCloudinaryId);
  const cloudinaryImg = cloudinaryImgId ? cld.image(cloudinaryImgId).resize(fill().width(600).height(400)) : null;
  const hasLongDescription = displayDesc && displayDesc.length > 80;
  const isAvailable = item.availability !== false;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAvailable) return;
    addToCart({
      id: item.id || item.SKU || displayName,
      name: displayName,
      price: price
    });
  };

  return (
    <div 
      onClick={onSelect}
      className="glass-panel overflow-hidden group flex flex-row md:flex-col items-center md:items-stretch hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(212,175,55,0.15)] transition-all p-3 md:p-0 gap-3 md:gap-0 cursor-pointer"
    >
      {localImage ? (
        <div className="w-28 h-28 md:w-full md:h-48 flex-shrink-0 relative overflow-hidden rounded-xl md:rounded-none">
          <img 
            src={localImage} 
            alt={displayName} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            style={{ objectPosition: item.imagePosition || 'center' }}
          />
          {isPopular && (
            <div className="hidden md:block absolute top-4 right-4 bg-[#d4af37] text-black text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]">
              Popular
            </div>
          )}
        </div>
      ) : cloudinaryImg ? (
        <div className="w-28 h-28 md:w-full md:h-48 flex-shrink-0 relative overflow-hidden rounded-xl md:rounded-none">
          <AdvancedImage 
            cldImg={cloudinaryImg} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            style={{ objectPosition: item.imagePosition || 'center' }}
          />
          {isPopular && (
            <div className="hidden md:block absolute top-4 right-4 bg-[#d4af37] text-black text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]">
              Popular
            </div>
          )}
        </div>
      ) : (
        <div className="w-28 h-28 md:w-full md:h-48 flex-shrink-0 relative bg-contain bg-center bg-no-repeat bg-[#0a0a0c] rounded-xl md:rounded-none border border-gray-800 md:border-none" style={{ backgroundImage: "url('/logo.png')" }}>
          {isPopular && (
            <div className="hidden md:block absolute top-4 right-4 bg-[#d4af37] text-black text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]">
              Popular
            </div>
          )}
        </div>
      )}
      <div className="md:p-6 flex flex-col flex-1 min-w-0 h-full justify-between">
        <div>
          <div className="flex justify-between items-start mb-1 md:mb-2 gap-2">
            <h3 className={`text-base md:text-xl font-bold truncate md:whitespace-normal ${!isAvailable ? 'text-gray-500' : ''}`}>{displayName}</h3>
            <span className="text-[#d4af37] font-bold text-sm md:text-lg whitespace-nowrap">${price.toFixed(2)}</span>
          </div>
          
          <div className="mb-3 md:mb-6 hidden md:block">
            <p className={`text-gray-400 text-sm transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
              {displayDesc || "Delicious and authentic cuisine."}
            </p>
            {hasLongDescription && (
              <button 
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className="text-[#d4af37] text-xs font-semibold mt-1 hover:underline focus:outline-none"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>

          <div className="md:hidden mb-2">
             <p className="text-gray-400 text-xs line-clamp-2">
               {displayDesc || "Delicious and authentic cuisine."}
             </p>
          </div>
        </div>

        <button 
          onClick={handleAdd} 
          disabled={!isAvailable}
          className={`${isAvailable ? 'bg-[#d4af37] text-black hover:bg-[#b08d29]' : 'bg-gray-800 text-gray-500 cursor-not-allowed'} font-bold rounded-lg py-1.5 px-3 md:py-3 text-sm md:text-base self-start md:w-full transition-colors shadow-lg`}
        >
          <span className="hidden md:inline">{isAvailable ? 'Add to Order' : 'Sold Out'}</span>
          <span className="md:hidden">{isAvailable ? '+ Add' : 'Sold Out'}</span>
        </button>
      </div>
    </div>
  );
}

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = React.useState<string>('Recommendations');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null);
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { addToCart } = useCart();

  // Drag to scroll logic
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeftPos, setScrollLeftPos] = React.useState(0);
  const [dragDistance, setDragDistance] = React.useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setDragDistance(0);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeftPos(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    setDragDistance(prev => prev + Math.abs(x - startX));
    scrollContainerRef.current.scrollLeft = scrollLeftPos - walk;
  };
  
  React.useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    fetch(`${backendUrl}/api/menu`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setMenuItems(data);
        } else {
          setMenuItems(menuDataFallback as MenuItem[]);
        }
      })
      .catch(err => {
        console.error("Failed to fetch menu from DB", err);
        setMenuItems(menuDataFallback as MenuItem[]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  // Extract unique categories
  const categoryOrder = [
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
    'Cocktails'
  ];

  const rawCategories = Array.from(new Set(menuItems.map(item => item.category?.name || item.Category).filter(Boolean))).sort((a, b) => {
    const aStr = String(a);
    const bStr = String(b);
    const aIndex = categoryOrder.indexOf(aStr);
    const bIndex = categoryOrder.indexOf(bStr);
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1; // a comes first
    if (bIndex !== -1) return 1;  // b comes first
    
    return aStr.localeCompare(bStr);
  });
  const categories = ['Recommendations', 'All', ...rawCategories];

  // Pre-calculate recommended items
  const recommendedItemIds = React.useMemo(() => {
    return new Set(
      menuItems
        .filter(i => (i.image || i.Cloudinary_ID) && i.availability !== false)
        .slice(0, 8)
        .map(i => i.id)
    );
  }, [menuItems]);

  // Filter and sort items
  const displayItems = menuItems.filter(item => {
    const categoryName = item.category?.name || item.Category || 'Uncategorized';
    
    let matchesCategory = false;
    if (activeCategory === 'All') matchesCategory = true;
    else if (activeCategory === 'Recommendations') {
      matchesCategory = recommendedItemIds.has(item.id);
    } else {
      matchesCategory = categoryName === activeCategory;
    }

    const matchesSearch = searchQuery === '' ? true : (
      (item.name || item.Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku || item.SKU || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesCategory && matchesSearch;
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

  if (isLoading) {
    return (
      <section id="menu" className="py-20 px-6 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
      </section>
    );
  }

  return (
    <section id="menu" className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold mb-4">Our Menu</h2>
        <p className="text-[#aaaaaa]">Discover our authentic and delicious dishes.</p>
      </div>

      {/* Search and Category Filter */}
      <div className="bg-[#0a0a0c]/90 backdrop-blur-md py-4 -mx-6 px-6 mb-12 border-b border-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text"
              placeholder="Search for a dish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-[#d4af37] transition-colors"
            />
          </div>
          <div 
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={() => setIsDragging(false)}
            onMouseUp={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            className={`flex overflow-x-auto hide-scrollbar gap-3 px-4 py-4 -mx-4 items-center select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
          {categories.map((cat, idx) => (
            <button 
              key={idx}
              onClick={() => {
                if (dragDistance > 10) return;
                setActiveCategory(cat as string);
              }}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all ${
                activeCategory === cat 
                  ? 'bg-[#d4af37] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-105' 
                  : 'bg-gray-900 border border-gray-700 text-gray-400 hover:border-[#d4af37] hover:text-[#d4af37]'
              }`}
            >
              {cat as string}
            </button>
          ))}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
        {displayItems.map((item, index) => (
          <MenuItemCard 
            key={index} 
            item={item} 
            onSelect={() => setSelectedItem(item)} 
            isPopular={recommendedItemIds.has(item.id)}
          />
        ))}
      </div>

      {/* Item Modal */}
      <AnimatePresence>
        {selectedItem && (
          <ItemModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
            addToCart={addToCart} 
          />
        )}
      </AnimatePresence>
    </section>
  );
}
