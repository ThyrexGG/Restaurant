import React from 'react';
import { Search, ChevronDown, ArrowLeftRight } from 'lucide-react';
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

  const sortedRawCategories = React.useMemo(() => {
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

  const categories = React.useMemo(() => {
    return ['Recommendations', 'All', ...sortedRawCategories];
  }, [sortedRawCategories]);


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

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleCategoryChange = (categoryName: string) => {
    setActiveCategory(categoryName);
    if (categoryName === 'All' || categoryName === 'Recommendations') {
      const el = document.getElementById('explore-menu');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const slug = generateSlug(categoryName);
      const el = document.getElementById(`seo-category-section-${slug}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  if (isLoading) {
    return (
      <section id="explore-menu" className="py-20 flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
      </section>
    );
  }

  const rawCategories = sortedRawCategories;
  const categorySectionsToRender = rawCategories.filter(cat => {
    if (activeCategory !== 'All' && activeCategory !== 'Recommendations' && activeCategory !== cat) {
      return false;
    }
    return true;
  });

  return (
    <section id="explore-menu" className="py-12 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-3 font-['Playfair_Display']">Explore Our Menu</h2>
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
              Search Dishes
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="Search by dish name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-[#d4af37] transition-colors text-sm md:text-base"
              />
            </div>
          </div>

        </div>

        {/* Quick Jump Category Pills with Drag/Swipe Indicator */}
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-gray-800/60">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Quick Categories</span>
            <span className="text-[10px] font-bold text-[#d4af37] flex items-center gap-1.5 bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full border border-[#d4af37]/30 shadow-sm animate-pulse">
              <ArrowLeftRight size={11} /> Drag / Swipe →
            </span>
          </div>

          <div className="relative">
            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1 items-center">
              {categories.map((cat, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleCategoryChange(cat as string)}
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
            {/* Gradient right fade hint indicator */}
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a0a0c] to-transparent pointer-events-none rounded-r-xl" />
          </div>
        </div>
      </div>
      
      {/* CONTINUOUS SINGLE-SCROLL LAYOUT - ALL CATEGORIES STACKED */}
      <div className="space-y-16">
        {/* Recommendations Section */}
        {(activeCategory === 'All' || activeCategory === 'Recommendations') && (
          <div id="seo-category-section-recommendations" className="scroll-mt-36">
            <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b-2 border-[#d4af37]">
              <div className="min-w-0">
                <span className="text-[10px] md:text-xs font-bold text-[#d4af37] uppercase tracking-widest block mb-0.5 whitespace-nowrap">Special Highlights</span>
                <h3 className="text-lg sm:text-2xl md:text-3xl font-black font-['Playfair_Display'] text-white whitespace-nowrap truncate">
                  Chef's Recommendations
                </h3>
              </div>
              <span className="bg-[#d4af37]/20 border border-[#d4af37]/50 text-[#d4af37] text-xs font-extrabold px-3 py-1.5 rounded-full shadow whitespace-nowrap flex-shrink-0">
                {recommendedItemIds.size} Dishes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
              {menuItems
                .filter(i => recommendedItemIds.has(i.id))
                .filter(i => !searchQuery || (i.name || i.Name || '').toLowerCase().includes(searchQuery.toLowerCase()))
                .map((item, index) => (
                  <SeoMenuItemCard 
                    key={item.id || index} 
                    item={item} 
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
            const matchesSearch = !searchQuery || (item.name || item.Name || '').toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCat && matchesSearch;
          }).sort((a, b) => (a.name || a.Name || '').localeCompare(b.name || b.Name || ''));

          if (sectionItems.length === 0) return null;

          return (
            <div key={catName} id={`seo-category-section-${sectionSlug}`} className="scroll-mt-36">
              <div className="flex items-center justify-between gap-3 mb-6 pb-3 border-b border-gray-800">
                <div className="min-w-0">
                  <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest block mb-0.5 whitespace-nowrap">Category</span>
                  <h3 className="text-lg sm:text-2xl md:text-3xl font-black font-['Playfair_Display'] text-white whitespace-nowrap truncate">
                    {catName}
                  </h3>
                </div>
                <span className="bg-gray-900 border border-gray-700 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0">
                  {sectionItems.length} {sectionItems.length === 1 ? 'Dish' : 'Dishes'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                {sectionItems.map((item, index) => (
                  <SeoMenuItemCard 
                    key={item.id || index} 
                    item={item} 
                    isPopular={recommendedItemIds.has(item.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
