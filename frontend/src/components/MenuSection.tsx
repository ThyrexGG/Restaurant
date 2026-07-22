import React from 'react';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { cld } from '../cloudinary';
import { useCart } from '../context/CartContext';
import menuDataFallback from '../assets/menu.json';
import { Search, ChevronDown } from 'lucide-react';
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
  const cloudinaryImg = cloudinaryImgId ? cld.image(cloudinaryImgId).resize(fill().width(600).height(400)).delivery(format('auto')).delivery(quality('auto')) : null;
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
        <div className="w-28 h-28 md:w-full md:h-48 flex-shrink-0 relative overflow-hidden rounded-xl md:rounded-none bg-black">
          <img 
            src={localImage} 
            alt={displayName} 
            loading="lazy"
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
        <div className="w-28 h-28 md:w-full md:h-48 flex-shrink-0 relative overflow-hidden rounded-xl md:rounded-none bg-black">
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

          <div className="mb-2 md:hidden">
            <p className={`text-gray-400 text-xs transition-all duration-300 ${isExpanded ? '' : 'line-clamp-1'}`}>
              {displayDesc || "Delicious and authentic cuisine."}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-auto">
          {item.sku || item.SKU ? (
            <span className="text-xs text-gray-500 font-mono font-bold bg-black/40 px-2 py-0.5 rounded border border-gray-800">
              #{item.sku || item.SKU}
            </span>
          ) : <span></span>}

          {isAvailable ? (
            <button
              onClick={handleAdd}
              className="bg-[#d4af37] text-black font-bold text-xs md:text-sm px-4 py-2 rounded-xl hover:bg-[#b08d29] hover:scale-105 active:scale-95 transition-all shadow-[0_4px_15px_rgba(212,175,55,0.3)]"
            >
              + Add
            </button>
          ) : (
            <span className="text-xs text-red-500 font-bold bg-red-500/10 px-3 py-1.5 rounded-xl border border-red-500/20">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MenuSection() {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = React.useState<string>('Recommendations');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [menuItems, setMenuItems] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [startX, setStartX] = React.useState(0);
  const [scrollLeft, setScrollLeft] = React.useState(0);
  const [dragDistance, setDragDistance] = React.useState(0);

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

  React.useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    fetch(`${backendUrl}/api/menu`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setMenuItems(data);
        else setMenuItems(menuDataFallback as any[]);
      })
      .catch(err => {
        console.error("Failed to fetch menu from API, falling back to local menu.json", err);
        setMenuItems(menuDataFallback as any[]);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const categoryOrder = [
    'Recommendations',
    'Special Dishes',
    'Local Special Dish',
    'Special Khmer Noodle Soup',
    'Special Pad Thai',
    'English Fried Rice',
    'English Lok Lak',
    'English Noodle',
    'Appetizer',
    'Pork Ribs',
    'Fried Rice',
    'Fried Noodle',
    'Grilled',
    'Soup',
    'Salad',
    'Traditional Khmer Food',
    'Vegetarian Food',
    'Breakfast',
    'Sandwich / Burger',
    'Extra',
    'Special Drink',
    'Fresh Juice',
    'Smoothie',
    'Macchiato',
    'Hot Drink',
    'Beverage',
    'Dessert'
  ];

  const rawCategories = Array.from(new Set(menuItems.map(item => item.category?.name || item.Category).filter(Boolean))).sort((a, b) => {
    const aStr = String(a);
    const bStr = String(b);
    const aIndex = categoryOrder.indexOf(aStr);
    const bIndex = categoryOrder.indexOf(bStr);
    
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    return aStr.localeCompare(bStr);
  });
  const categories = React.useMemo(() => ['Recommendations', 'All', ...rawCategories], [rawCategories]);

  // Pre-calculate recommended items
  const recommendedItemIds = React.useMemo(() => {
    return new Set(
      menuItems
        .filter(i => (i.image || i.Cloudinary_ID) && i.availability !== false)
        .slice(0, 8)
        .map(i => i.id)
    );
  }, [menuItems]);

  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {
      'Recommendations': recommendedItemIds.size,
      'All': menuItems.length
    };
    menuItems.forEach(item => {
      const cat = item.category?.name || item.Category || 'Uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [menuItems, recommendedItemIds]);

  // Slug generator for scroll IDs
  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleCategoryChange = (categoryName: string) => {
    setActiveCategory(categoryName);
    if (categoryName === 'All' || categoryName === 'Recommendations') {
      const el = document.getElementById('menu');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const slug = generateSlug(categoryName);
      const el = document.getElementById(`category-section-${slug}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  if (isLoading) {
    return (
      <section id="menu" className="py-20 px-6 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
      </section>
    );
  }

  // Group items by category for the continuous single-scroll layout
  const categorySectionsToRender = rawCategories.filter(cat => {
    if (activeCategory !== 'All' && activeCategory !== 'Recommendations' && activeCategory !== cat) {
      return false;
    }
    return true;
  });

  return (
    <section id="menu" className="py-12 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-3 font-['Playfair_Display']">Our Menu</h2>
        <p className="text-[#aaaaaa]">All items in one continuous scroll. Use the dropdown or pills to jump to any category.</p>
      </div>

      {/* Quick-Jump Category Dropdown & Search Filter */}
      <div className="bg-[#0a0a0c] py-5 px-6 mb-10 border border-gray-800/80 rounded-3xl shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          
          {/* Category Dropdown Selector (Scroll Jump) */}
          <div className="flex-1 relative">
            <label className="text-[11px] font-bold text-[#d4af37] uppercase tracking-wider block mb-1">
              Select Category
            </label>
            <div className="relative">
              <select
                value={activeCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-black border-2 border-[#d4af37] text-white font-bold py-3 px-4 pr-10 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#d4af37] shadow-lg cursor-pointer text-sm md:text-base"
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat as string} className="bg-gray-900 text-white font-semibold py-2">
                    {cat === 'Recommendations' ? 'Chef\'s Recommendations' : cat === 'All' ? 'All Dishes (Full Menu)' : cat} ({categoryCounts[cat as string] || 0})
                  </option>
                ))}
              </select>
              <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d4af37] pointer-events-none" />
            </div>
          </div>

          {/* Search Input */}
          <div className="flex-1 relative">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Search Dishes & SKU
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search by dish name or SKU (e.g. B16)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-[#d4af37] transition-colors text-sm md:text-base"
              />
            </div>
          </div>

        </div>

        {/* Quick Jump Category Pills */}
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-gray-800/60">
          <div 
            ref={scrollContainerRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={() => setIsDragging(false)}
            onMouseUp={() => setIsDragging(false)}
            onMouseMove={handleMouseMove}
            className={`flex overflow-x-auto hide-scrollbar gap-2 pb-1 items-center select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          >
            {categories.map((cat, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  if (dragDistance > 10) return;
                  handleCategoryChange(cat as string);
                }}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === cat 
                    ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105' 
                    : 'bg-gray-900/80 border border-gray-800 text-gray-400 hover:border-[#d4af37] hover:text-[#d4af37]'
                }`}
              >
                {cat as string} <span className="opacity-70 text-[10px]">({categoryCounts[cat as string] || 0})</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* CONTINUOUS SINGLE-SCROLL LAYOUT - ALL CATEGORIES STACKED */}
      <div className="space-y-16">
        {/* Recommendations Section */}
        {(activeCategory === 'All' || activeCategory === 'Recommendations') && (
          <div id="category-section-recommendations" className="scroll-mt-36">
            <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-[#d4af37]">
              <div>
                <span className="text-xs font-bold text-[#d4af37] uppercase tracking-widest block mb-0.5">Special Highlights</span>
                <h3 className="text-2xl md:text-3xl font-black font-['Playfair_Display'] text-white">
                  ⭐ Chef's Recommendations
                </h3>
              </div>
              <span className="bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow">
                {recommendedItemIds.size} Dishes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
              {menuItems
                .filter(i => recommendedItemIds.has(i.id))
                .filter(i => !searchQuery || (i.name || i.Name || '').toLowerCase().includes(searchQuery.toLowerCase()) || (i.sku || i.SKU || '').toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item, index) => (
                  <MenuItemCard 
                    key={item.id || index} 
                    item={item} 
                    onSelect={() => setSelectedItem(item)} 
                    isPopular={true}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Category Sections Stacked One After Another */}
        {categorySectionsToRender.map((catName) => {
          const sectionSlug = generateSlug(catName);
          const sectionItems = menuItems.filter(item => {
            const cat = item.category?.name || item.Category || 'Uncategorized';
            const matchesCat = cat === catName;
            const matchesSearch = !searchQuery || (
              (item.name || item.Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
              (item.sku || item.SKU || '').toLowerCase().includes(searchQuery.toLowerCase())
            );
            return matchesCat && matchesSearch;
          }).sort((a, b) => {
            const skuA = (a.sku || a.SKU || '').toLowerCase();
            const skuB = (b.sku || b.SKU || '').toLowerCase();
            if (skuA && skuB) return skuA.localeCompare(skuB, undefined, { numeric: true, sensitivity: 'base' });
            return (a.name || a.Name || '').localeCompare(b.name || b.Name || '');
          });

          if (sectionItems.length === 0) return null;

          return (
            <div key={catName} id={`category-section-${sectionSlug}`} className="scroll-mt-36">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-800">
                <div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-0.5">Category</span>
                  <h3 className="text-2xl md:text-3xl font-black font-['Playfair_Display'] text-white">
                    {catName}
                  </h3>
                </div>
                <span className="bg-gray-900 border border-gray-700 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-full">
                  {sectionItems.length} {sectionItems.length === 1 ? 'Dish' : 'Dishes'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                {sectionItems.map((item, index) => (
                  <MenuItemCard 
                    key={item.id || index} 
                    item={item} 
                    onSelect={() => setSelectedItem(item)} 
                    isPopular={recommendedItemIds.has(item.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
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
