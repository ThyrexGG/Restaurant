import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Cloudinary } from '@cloudinary/url-gen';
import { fill } from '@cloudinary/url-gen/actions/resize';
import { format, quality } from '@cloudinary/url-gen/actions/delivery';
import { AdvancedImage } from '@cloudinary/react';

const cld = new Cloudinary({ cloud: { cloudName: 'dcizelppo' } });

const extractCloudinaryPublicId = (urlOrId: string | undefined | null): string | null => {
  if (!urlOrId) return null;
  if (!urlOrId.startsWith('http')) return urlOrId;
  const match = urlOrId.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
  return match ? match[1] : null;
};

export default function MenuItemPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
    fetch(`${backendUrl}/api/menu/slug/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(data => setItem(data))
      .catch(err => {
        console.error(err);
        navigate('/');
      })
      .finally(() => setIsLoading(false));
  }, [slug, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  if (!item) return null;

  const displayName = item.name || item.Name || 'Unknown Item';
  const displayDesc = item.description || item.Description || 'Delicious authentic Khmer cuisine.';
  const priceValue = item.price || item['Price [Best Khmer (Golden Cafe) Restaurant]'] || '0.00';
  const price = Number(priceValue);
  
  const localImage = item.image?.startsWith('/images/') ? item.image : null;
  const rawCloudinaryId = !localImage ? (item.image || item.Cloudinary_ID) : null;
  const cloudinaryImgId = extractCloudinaryPublicId(rawCloudinaryId);
  const cloudinaryImg = cloudinaryImgId ? cld.image(cloudinaryImgId).resize(fill().width(1200).height(800)).delivery(format('auto')).delivery(quality('auto')) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f5f5f5]">
      <Helmet>
        <title>{displayName} - Menu | Best Khmer Restaurant</title>
        <meta name="description" content={`Try our delicious ${displayName} for just $${price.toFixed(2)}. ${displayDesc} Best Khmer Restaurant is the premier dining destination in Phnom Penh.`} />
        {/* We would dynamically set og:image here if we generated full URLs */}
      </Helmet>
      
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <Link to="/" className="inline-flex items-center text-[#d4af37] hover:underline mb-8 font-bold">
          <ArrowLeft size={16} className="mr-2" /> Back to Menu
        </Link>
        
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
          <div className="w-full md:w-1/2 min-h-[300px] md:min-h-[500px] bg-black relative">
            {localImage ? (
              <img src={localImage} alt={displayName} className="w-full h-full object-cover absolute inset-0" />
            ) : cloudinaryImg ? (
              <AdvancedImage cldImg={cloudinaryImg} className="w-full h-full object-cover absolute inset-0" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-800 absolute inset-0">
                <span className="text-gray-500">No Image Available</span>
              </div>
            )}
          </div>
          
          <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h1 className="text-4xl md:text-5xl font-bold font-['Playfair_Display'] text-transparent bg-clip-text bg-gradient-to-r from-white to-[#d4af37] mb-4">
              {displayName}
            </h1>
            <p className="text-3xl text-[#d4af37] font-bold mb-6">${price.toFixed(2)}</p>
            
            <div className="h-px w-full bg-gray-800 my-6"></div>
            
            <p className="text-gray-300 text-lg leading-relaxed mb-8">
              {displayDesc}
            </p>
            
            <div className="space-y-3 mb-10 text-sm text-gray-400">
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-[#d4af37]" /> Authentic Khmer Recipe</div>
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-[#d4af37]" /> Fresh Local Ingredients</div>
              <div className="flex items-center gap-2"><CheckCircle size={16} className="text-[#d4af37]" /> Prepared by Expert Chefs</div>
            </div>

            <Link 
              to="/order" 
              className="block w-full py-4 bg-[#d4af37] text-black text-center font-bold text-lg rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-105 transition-transform"
            >
              Order for Dine-in or Pickup
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
