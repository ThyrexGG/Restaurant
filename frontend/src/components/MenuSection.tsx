import React from 'react';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../cloudinary';
import { useCart } from '../context/CartContext';
import menuDataFallback from '../assets/menu.json';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type MenuItem = {
  id?: string;
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
  availability?: boolean;
  category?: { name: string };
}

function MenuItemCard({ item, onSelect }: { item: MenuItem, onSelect: () => void }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { addToCart } = useCart();
  
  const displayName = item.name || item.Name || 'Unknown Item';
  const displayDesc = item.description || item.Description || '';
  const priceValue = item.price || item['Price [Best Khmer (Golden Cafe) Restaurant]'] || '5.00';
  const price = Number(priceValue);
  
  const cloudinaryImgId = item.image || item.Cloudinary_ID;
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
      {cloudinaryImg ? (
        <div className="w-28 h-28 md:w-full md:h-48 flex-shrink-0 relative overflow-hidden rounded-xl md:rounded-none">
          <AdvancedImage cldImg={cloudinaryImg} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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
  const [selectedItem, setSelectedItem] = React.useState<MenuItem | null>(null);
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { addToCart } = useCart();
  
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
  const displayItems = menuItems.filter(item => 
    activeCategory === 'All' ? true : (item.category?.name || item.Category) === activeCategory
  );

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

      {/* Category Filter (Sticky) */}
      <div className="sticky top-24 z-40 bg-[#0a0a0c]/90 backdrop-blur-md py-4 -mx-6 px-6 mb-12 border-b border-gray-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
        <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 max-w-7xl mx-auto items-center">
          {categories.map((cat, idx) => (
            <button 
              key={idx}
              onClick={() => setActiveCategory(cat as string)}
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
        {displayItems.map((item, index) => (
          <MenuItemCard key={index} item={item} onSelect={() => setSelectedItem(item)} />
        ))}
      </div>

      {/* Item Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
              onClick={() => setSelectedItem(null)}
            />
            <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="glass-panel w-full max-w-lg overflow-hidden flex flex-col pointer-events-auto rounded-3xl border border-[#d4af37]/30 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative"
              >
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-red-500 text-white p-2 rounded-full z-10 backdrop-blur-sm transition-colors"
                >
                  <X size={20} />
                </button>
                
                {selectedItem.Cloudinary_ID ? (
                  <div className="h-64 w-full relative">
                    <AdvancedImage 
                      cldImg={cld.image(selectedItem.Cloudinary_ID).resize(fill().width(800).height(600))} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="h-48 w-full relative bg-contain bg-center bg-no-repeat bg-[#0a0a0c] border-b border-gray-800" style={{ backgroundImage: "url('/logo.png')" }} />
                )}
                
                <div className="p-8 flex flex-col">
                  <div className="flex justify-between items-start mb-4 gap-4">
                    <h2 className="text-3xl font-bold font-['Playfair_Display'] text-transparent bg-clip-text bg-gradient-to-r from-white to-[#d4af37]">
                      {selectedItem.name || selectedItem.Name}
                    </h2>
                    <span className="text-2xl font-bold text-[#d4af37] whitespace-nowrap">
                      ${Number(selectedItem.price || selectedItem['Price [Best Khmer (Golden Cafe) Restaurant]'] || 5).toFixed(2)}
                    </span>
                  </div>
                  
                  <p className="text-gray-300 mb-8 leading-relaxed text-lg">
                    {selectedItem.description || selectedItem.Description || "Delicious and authentic cuisine, prepared fresh to order."}
                  </p>
                  
                  <button 
                    disabled={selectedItem.availability === false}
                    onClick={() => {
                      addToCart({
                        id: selectedItem.id || selectedItem.SKU || selectedItem.name || selectedItem.Name || 'unknown',
                        name: selectedItem.name || selectedItem.Name || 'Unknown',
                        price: Number(selectedItem.price || selectedItem['Price [Best Khmer (Golden Cafe) Restaurant]'] || 5)
                      });
                      setSelectedItem(null);
                    }} 
                    className={`${selectedItem.availability !== false ? 'btn-primary' : 'bg-gray-800 text-gray-500 cursor-not-allowed'} w-full py-4 text-xl shadow-[0_0_30px_rgba(212,175,55,0.3)]`}
                  >
                    {selectedItem.availability !== false ? 'Add to Order' : 'Sold Out'}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
