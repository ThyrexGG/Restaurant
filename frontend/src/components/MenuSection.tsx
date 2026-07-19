import React from 'react';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../cloudinary';
import { useCart } from '../context/CartContext';
import menuDataFallback from '../assets/menu.json';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type MenuItem = {
  id?: string;
  sku?: string;
  SKU?: string;
  Name?: string;
  Description?: string;
  Cloudinary_ID?: string;
  'Price [Best Khmer (Golden Cafe) Restaurant]'?: string;
  Category?: string;
  
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  imagePosition?: string;
  availability?: boolean;
  category?: { name: string };
}

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

function MenuItemCard({ item, onSelect }: { item: MenuItem, onSelect: () => void }) {
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
          <div className="hidden md:block absolute top-4 right-4 bg-[#d4af37] text-black text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]">
            Popular
          </div>
        </div>
      ) : cloudinaryImg ? (
        <div className="w-28 h-28 md:w-full md:h-48 flex-shrink-0 relative overflow-hidden rounded-xl md:rounded-none">
          <AdvancedImage 
            cldImg={cloudinaryImg} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            style={{ objectPosition: item.imagePosition || 'center' }}
          />
          <div className="hidden md:block absolute top-4 right-4 bg-[#d4af37] text-black text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]">
            Popular
          </div>
        </div>
      ) : (
        <div className="w-28 h-28 md:w-full md:h-48 flex-shrink-0 relative bg-contain bg-center bg-no-repeat bg-[#0a0a0c] rounded-xl md:rounded-none border border-gray-800 md:border-none" style={{ backgroundImage: "url('/logo.png')" }}>
          <div className="hidden md:block absolute top-4 right-4 bg-[#d4af37] text-black text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]">
            Popular
          </div>
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
  const [activeCategory, setActiveCategory] = React.useState<string>('All');
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
  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category?.name || item.Category).filter(Boolean)))];

  // Filter items
  const displayItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'All' ? true : (item.category?.name || item.Category) === activeCategory;
    const matchesSearch = searchQuery === '' ? true : (
      (item.name || item.Name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.sku || item.SKU || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    return matchesCategory && matchesSearch;
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
            className={`flex overflow-x-auto hide-scrollbar gap-3 pb-2 items-center select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
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
          <MenuItemCard key={index} item={item} onSelect={() => setSelectedItem(item)} />
        ))}
      </div>

      {/* Item Modal */}
      <AnimatePresence>
        {selectedItem && (
          <ItemModalContent 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
            addToCart={addToCart} 
          />
        )}
      </AnimatePresence>
    </section>
  );
}

function ItemModalContent({ item, onClose, addToCart }: { item: MenuItem, onClose: () => void, addToCart: any }) {
  const [specialInstructions, setSpecialInstructions] = React.useState('');
  const [selectedOption, setSelectedOption] = React.useState<string>('');
  
  const displayName = item.name || item.Name || 'Unknown';
  const priceValue = Number(item.price || item['Price [Best Khmer (Golden Cafe) Restaurant]'] || 5).toFixed(2);
  const localImage = item.image?.startsWith('/images/') ? item.image : null;
  const rawCloudinaryId = !localImage ? (item.image || item.Cloudinary_ID) : null;
  const cloudinaryImgId = extractCloudinaryPublicId(rawCloudinaryId);
  
  // Extract options from parentheses e.g. "Amok (Chicken/Fish/Tofu)"
  const optionsMatch = displayName.match(/\(([^)]+)\)/);
  let baseName = displayName;
  let options: string[] = [];
  
  if (optionsMatch) {
    options = optionsMatch[1].split('/').map(s => s.trim());
    baseName = displayName.replace(/\([^)]+\)/, '').trim();
  }

  // Auto-select first option if available
  React.useEffect(() => {
    if (options.length > 0 && !selectedOption) {
      setSelectedOption(options[0]);
    }
  }, [options]);

  const handleAddToCart = (e: React.MouseEvent) => {
    let finalNotes = specialInstructions.trim();
    if (options.length > 0) {
      const optionText = `Choice: ${selectedOption}`;
      finalNotes = finalNotes ? `${optionText} | ${finalNotes}` : optionText;
    }

    // Fly-to-cart animation
    const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const cartIcon = document.getElementById('cart-icon');
    
    if (cartIcon) {
      const cartRect = cartIcon.getBoundingClientRect();
      const particle = document.createElement('div');
      particle.className = 'fly-to-cart-particle';
      
      // Start position (center of the Add to Order button)
      particle.style.left = `${buttonRect.left + buttonRect.width / 2 - 10}px`;
      particle.style.top = `${buttonRect.top + buttonRect.height / 2 - 10}px`;
      document.body.appendChild(particle);
      
      // Force reflow
      particle.getBoundingClientRect();
      
      // End position (center of cart icon)
      particle.style.left = `${cartRect.left + cartRect.width / 2 - 10}px`;
      particle.style.top = `${cartRect.top + cartRect.height / 2 - 10}px`;
      particle.style.transform = 'scale(0.2)';
      particle.style.opacity = '0.5';
      
      // Cleanup
      setTimeout(() => {
        if (particle.parentNode) particle.parentNode.removeChild(particle);
      }, 600);
    }

    addToCart({
      id: item.id || item.SKU || displayName,
      name: baseName, // Use the base name without the (Chicken/Fish) part
      price: Number(priceValue),
      notes: finalNotes || undefined
    });
    onClose();
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto hide-scrollbar flex flex-col pointer-events-auto rounded-3xl border border-[#d4af37]/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative"
        >
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full z-10 backdrop-blur-sm transition-colors"
          >
            <X size={20} />
          </button>
          
          {localImage ? (
            <div className="h-48 md:h-64 w-full flex-shrink-0 relative">
              <img 
                src={localImage} 
                alt={displayName}
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
            </div>
          ) : cloudinaryImgId ? (
            <div className="h-48 md:h-64 w-full flex-shrink-0 relative">
              <AdvancedImage 
                cldImg={cld.image(cloudinaryImgId).resize(fill().width(800).height(600))} 
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
            </div>
          ) : (
            <div className="h-40 md:h-48 w-full flex-shrink-0 relative bg-contain bg-center bg-no-repeat bg-[#0a0a0c] border-b border-gray-800" style={{ backgroundImage: "url('/logo.png')" }} />
          )}
          
          <div className="p-6 md:p-8 flex flex-col flex-1">
            <div className="flex justify-between items-start mb-2 gap-4">
              <h2 className="text-2xl md:text-3xl font-bold font-['Playfair_Display'] text-transparent bg-clip-text bg-gradient-to-r from-white to-[#d4af37]">
                {baseName}
              </h2>
              <span className="text-xl md:text-2xl font-bold text-[#d4af37] whitespace-nowrap">
                ${priceValue}
              </span>
            </div>
            
            <p className="text-gray-400 mb-6 leading-relaxed text-sm md:text-base">
              {item.description || item.Description || "Delicious and authentic cuisine, prepared fresh to order."}
            </p>

            {options.length > 0 && (
              <div className="mb-6">
                <h4 className="font-bold mb-3 text-white">Choose Option:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {options.map((opt, idx) => (
                    <label 
                      key={idx} 
                      className={`cursor-pointer border rounded-xl p-3 text-center transition-all ${
                        selectedOption === opt 
                          ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37] font-bold' 
                          : 'border-gray-700 hover:border-gray-500 text-gray-300'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="itemOption" 
                        value={opt} 
                        checked={selectedOption === opt}
                        onChange={(e) => setSelectedOption(e.target.value)}
                        className="hidden"
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-8">
              <h4 className="font-bold mb-2 text-white">Special Instructions</h4>
              <textarea 
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="E.g., No spicy, extra sauce, allergy info..."
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all resize-none h-24"
              />
            </div>
            
            <button 
              disabled={item.availability === false}
              onClick={handleAddToCart} 
              className={`${item.availability !== false ? 'btn-primary' : 'bg-gray-800 text-gray-500 cursor-not-allowed'} w-full py-4 text-lg font-bold shadow-[0_0_30px_rgba(212,175,55,0.3)] mt-auto`}
            >
              {item.availability !== false ? `Add to Order - $${priceValue}` : 'Sold Out'}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
