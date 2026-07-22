import React from 'react';
import { Search, Layers, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { AdvancedImage } from '@cloudinary/react';

// Setup Cloudinary
const cld = new Cloudinary({
  cloud: { cloudName: 'dcizelppo' }
});

const extractCloudinaryPublicId = (urlOrId: string | undefined | null): string | null => {
  if (!urlOrId) return null;
  if (!urlOrId.startsWith('http')) return urlOrId;
  const match = urlOrId.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
  return match ? match[1] : null;
};

// Simple Slug Generator
const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
};

function SeoMenuItemCard({ item, isPopular = false }: { item: any, isPopular?: boolean }) {
  const displayName = item.name || item.Name || 'Unknown Item';
  const displayDesc = item.description || item.Description || '';
  const priceValue = item.price || item['Price [Best Khmer (Golden Cafe) Restaurant]'] || '5.00';
  const price = Number(priceValue);
  const slug = generateSlug(displayName);
  
  const localImage = item.image?.startsWith('/images/') ? item.image : null;
  const rawCloudinaryId = !localImage ? (item.image || item.Cloudinary_ID) : null;
  const cloudinaryImgId = extractCloudinaryPublicId(rawCloudinaryId);
  const cloudinaryImg = cloudinaryImgId ? cld.image(cloudinaryImgId).resize(fill().width(600).height(400)).delivery(format('auto')).delivery(quality('auto')) : null;

  return (
    <Link 
      to={`/menu/${slug}`}
      className="glass-panel overflow-hidden group flex flex-row md:flex-col items-center md:items-stretch hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(212,175,55,0.15)] transition-all p-3 md:p-0 gap-3 md:gap-0 cursor-pointer block"
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
        </div>
      )}
      <div className="md:p-6 flex flex-col flex-1 min-w-0 h-full justify-between w-full">
        <div>
          <div className="flex justify-between items-start mb-1 md:mb-2 w-full gap-2">
            <h3 className="text-sm md:text-xl font-bold font-['Playfair_Display'] flex-1 truncate">{displayName}</h3>
            <span className="text-[#d4af37] font-bold text-sm md:text-xl">${price.toFixed(2)}</span>
          </div>
          <div className="hidden md:block">
            <p className="text-gray-400 text-sm line-clamp-2">{displayDesc}</p>
          </div>
          <div className="md:hidden mb-2">
             <p className="text-gray-400 text-xs line-clamp-2">{displayDesc}</p>
          </div>
        </div>
        <div className="mt-2 text-[#d4af37] font-bold text-sm hover:underline">
          View Details &rarr;
        </div>
      </div>
    </Link>
  );
}

export default function SeoMenuSection() {
  const [activeCategory, setActiveCategory] = React.useState<string>('Recommendations');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [menuItems, setMenuItems] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    fetch(`${backendUrl}/api/menu`)
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setMenuItems(data);
      })
      .catch(err => console.error("Failed to fetch menu", err))
      .finally(() => setIsLoading(false));
  }, []);

  const categories = React.useMemo(() => {
    return ['Recommendations', 'All', ...Array.from(new Set(menuItems.map(item => item.category?.name || item.Category).filter(Boolean)))];
  }, [menuItems]);

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
      (item.name || item.Name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesCategory && matchesSearch;
  });

  if (isLoading) {
    return (
      <section className="py-20 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold mb-4 font-['Playfair_Display']">Explore Our Menu</h2>
        <p className="text-[#aaaaaa]">Select a category below or search for your favorite dish.</p>
      </div>

      <div className="bg-[#0a0a0c]/90 backdrop-blur-md py-6 -mx-6 px-6 mb-12 border-y border-gray-800 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4 items-stretch md:items-center">
          
          {/* Prominent Category Dropdown for Easy Browsing */}
          <div className="flex-1 relative">
            <label className="text-xs font-bold text-[#d4af37] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Layers size={14} /> Select Category (Dropdown)
            </label>
            <div className="relative">
              <select
                value={activeCategory}
                onChange={(e) => setActiveCategory(e.target.value)}
                className="w-full bg-black border-2 border-[#d4af37] text-white font-bold py-3.5 px-4 pr-10 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-[#d4af37] shadow-lg cursor-pointer text-base"
              >
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat as string} className="bg-gray-900 text-white font-semibold py-2">
                    {cat === 'Recommendations' ? '⭐ Chef\'s Recommendations' : cat === 'All' ? '🍽️ All Dishes' : `📁 ${cat}`} ({categoryCounts[cat as string] || 0})
                  </option>
                ))}
              </select>
              <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#d4af37] pointer-events-none" />
            </div>
          </div>

          {/* Search Box */}
          <div className="flex-1 relative">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
              Search Dishes
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search by dish name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-[#d4af37] transition-colors text-base"
              />
            </div>
          </div>

        </div>

        {/* Quick-Scroll Category Pills */}
        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-gray-800/60">
          <div className="flex overflow-x-auto hide-scrollbar gap-2.5 pb-2 items-center">
            {categories.map((cat, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveCategory(cat as string)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
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
      
      {/* Clear Category Header */}
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-800">
        <div>
          <span className="text-xs font-bold text-[#d4af37] uppercase tracking-widest block mb-1">Current Section</span>
          <h3 className="text-2xl md:text-3xl font-black font-['Playfair_Display'] text-white">
            {activeCategory === 'Recommendations' ? '⭐ Chef\'s Recommendations' : activeCategory === 'All' ? '🍽️ All Dishes' : `📁 ${activeCategory}`}
          </h3>
        </div>
        <span className="bg-gray-900 border border-gray-700 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-full">
          {displayItems.length} {displayItems.length === 1 ? 'Dish' : 'Dishes'} Available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
        {displayItems.map((item, index) => (
          <SeoMenuItemCard 
            key={item.id || index} 
            item={item} 
            isPopular={recommendedItemIds.has(item.id)}
          />
        ))}
      </div>
    </section>
  );
}
