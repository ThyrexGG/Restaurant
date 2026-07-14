import React from 'react';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { cld } from '../cloudinary';
import { useCart } from '../context/CartContext';
import menuData from '../assets/menu.json';

type MenuItem = {
  SKU?: string;
  Name: string;
  Description: string;
  Cloudinary_ID?: string;
  'Price [Best Khmer (Golden Cafe) Restaurant]'?: string;
}

function MenuItemCard({ item }: { item: MenuItem }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const { addToCart } = useCart();
  
  const priceValue = item['Price [Best Khmer (Golden Cafe) Restaurant]'] || '5.00';
  const price = Number(priceValue);
  
  const cloudinaryImg = item.Cloudinary_ID ? cld.image(item.Cloudinary_ID).resize(fill().width(600).height(400)) : null;
  const hasLongDescription = item.Description && item.Description.length > 80;

  const handleAdd = () => {
    addToCart({
      id: item.SKU || item.Name,
      name: item.Name,
      price: price
    });
  };

  return (
    <div className="glass-panel overflow-hidden group flex flex-col hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(212,175,55,0.15)]">
      {cloudinaryImg ? (
        <div className="h-48 relative overflow-hidden">
          <AdvancedImage cldImg={cloudinaryImg} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute top-4 right-4 bg-[#d4af37] text-black text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]">
            Popular
          </div>
        </div>
      ) : (
        <div className="h-48 relative bg-contain bg-center bg-no-repeat bg-[#0a0a0c]" style={{ backgroundImage: "url('/logo.png')" }}>
          <div className="absolute top-4 right-4 bg-[#d4af37] text-black text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]">
            Popular
          </div>
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold">{item.Name}</h3>
          <span className="text-[#d4af37] font-bold text-lg">${price.toFixed(2)}</span>
        </div>
        
        <div className="mb-6 flex-1">
          <p className={`text-gray-400 text-sm transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
            {item.Description || "Delicious and authentic cuisine."}
          </p>
          {hasLongDescription && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[#d4af37] text-xs font-semibold mt-1 hover:underline focus:outline-none"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        <button onClick={handleAdd} className="btn-primary mt-auto w-full">
          Add to Order
        </button>
      </div>
    </div>
  );
}

export default function MenuSection() {
  const [activeCategory, setActiveCategory] = React.useState<string>('All');
  
  // Extract unique categories
  const categories = ['All', ...Array.from(new Set(menuData.map(item => item.Category).filter(Boolean)))];

  // Filter items
  const displayItems = menuData.filter(item => 
    activeCategory === 'All' ? true : item.Category === activeCategory
  );

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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayItems.map((item, index) => (
          <MenuItemCard key={index} item={item} />
        ))}
      </div>
    </section>
  );
}
