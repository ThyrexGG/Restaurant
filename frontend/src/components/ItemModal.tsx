import React from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { AdvancedImage } from '@cloudinary/react';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { cld } from '../cloudinary';

export type MenuItem = {
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
};

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

export default function ItemModal({ item, onClose, addToCart }: { item: MenuItem, onClose: () => void, addToCart: any }) {
  const [specialInstructions, setSpecialInstructions] = React.useState('');
  const [selectedOption, setSelectedOption] = React.useState<string>('');
  const [addEgg, setAddEgg] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);
  
  const displayName = item.name || item.Name || 'Unknown';
  const nameLower = displayName.toLowerCase();
  const catLower = (item.category?.name || item.Category || '').toLowerCase();
  
  const isEligibleForEgg = 
    (nameLower.includes('fried rice') || nameLower.includes('fried noodle') || nameLower.includes('stir fried') || 
     catLower.includes('fried rice') || catLower.includes('fried noodle')) &&
    !nameLower.includes('burger') && !nameLower.includes('soup') &&
    !catLower.includes('burger') && !catLower.includes('soup');

  const eggPrice = addEgg ? 0.50 : 0;
  const basePriceValue = Number(item.price || item['Price [Best Khmer (Golden Cafe) Restaurant]'] || 5) + eggPrice;
  const totalPrice = basePriceValue * quantity;
  const priceValue = totalPrice.toFixed(2);
  const localImage = item.image?.startsWith('/images/') ? item.image : null;
  const rawCloudinaryId = !localImage ? (item.image || item.Cloudinary_ID) : null;
  const cloudinaryImgId = extractCloudinaryPublicId(rawCloudinaryId);
  
  // Extract options from parentheses e.g. "Amok (Chicken/Fish/Tofu)"
  const optionsMatch = displayName.match(/\(([^)]+)\)/);
  let baseName = displayName;
  let options: string[] = [];
  
  if (optionsMatch && optionsMatch[1].includes('/')) {
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
    if (addEgg) {
      finalNotes = finalNotes ? `Add Fried Egg (+$0.50) | ${finalNotes}` : `Add Fried Egg (+$0.50)`;
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
      price: basePriceValue,
      notes: finalNotes || undefined,
      quantity: quantity
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
                cldImg={cld.image(cloudinaryImgId).resize(fill().width(800).height(600)).delivery(format('auto')).delivery(quality('auto'))} 
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

            {isEligibleForEgg && (
              <div className="mb-6">
                <h4 className="font-bold mb-3 text-white">Extras:</h4>
                <label className={`cursor-pointer border rounded-xl p-3 flex justify-between items-center transition-all ${
                    addEgg 
                      ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37] font-bold' 
                      : 'border-gray-700 hover:border-gray-500 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={addEgg}
                      onChange={(e) => setAddEgg(e.target.checked)}
                      className="w-5 h-5 rounded border-gray-600 text-[#d4af37] focus:ring-[#d4af37] focus:ring-offset-gray-900 bg-gray-800"
                    />
                    <span>Add Fried Egg</span>
                  </div>
                  <span>+$0.50</span>
                </label>
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
            
            <div className="flex items-center justify-between mb-4 border-t border-gray-800 pt-4 mt-auto">
              <span className="text-gray-400 font-bold">Quantity</span>
              <div className="flex items-center gap-4 bg-gray-900 rounded-full px-4 py-2 border border-gray-800">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <Minus size={20} />
                </button>
                <span className="font-bold w-6 text-center text-lg">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
            
            <button 
              disabled={item.availability === false}
              onClick={handleAddToCart} 
              className={`${item.availability !== false ? 'btn-primary' : 'bg-gray-800 text-gray-500 cursor-not-allowed'} w-full py-4 text-lg font-bold shadow-[0_0_30px_rgba(212,175,55,0.3)] mt-auto flex items-center justify-center gap-2`}
            >
              {item.availability !== false ? (
                <>
                  <span>Add to Order - ${priceValue}</span>
                  <span className="text-xs opacity-90">({(totalPrice * 4000).toLocaleString()} ៛)</span>
                </>
              ) : 'Sold Out'}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
