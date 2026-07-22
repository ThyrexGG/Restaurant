import { Helmet } from 'react-helmet-async';
import HeroSection from '../components/HeroSection';
import Navbar from '../components/Navbar';
import SeoMenuSection from '../components/SeoMenuSection';
import CustomerReviews from '../components/CustomerReviews';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-[#f5f5f5]">
      <Helmet>
        <title>Best Khmer Restaurant | Authentic Khmer Cuisine in Siem Reap</title>
        <meta name="description" content="Discover authentic Khmer cuisine at Best Khmer Restaurant in Siem Reap, Cambodia. Browse our menu of traditional dishes and visit us today." />
      </Helmet>
      
      <Navbar />
      <HeroSection />
      
      {/* Short About Section for SEO */}
      <section className="py-16 px-6 max-w-7xl mx-auto text-center border-b border-gray-800">
        <h2 className="text-3xl font-bold mb-4 font-['Playfair_Display'] text-[#d4af37]">Our Story</h2>
        <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">
          Welcome to Best Khmer Restaurant, where we bring the rich, authentic flavors of Khmer cuisine to life. 
          Our passionate chefs use only the freshest local ingredients to craft traditional dishes like Fish Amok, Lok Lak, 
          and perfectly spiced curries. Whether you're a local or a traveler, experience the true taste of Siem Reap in a cozy, welcoming atmosphere.
        </p>
      </section>

      <SeoMenuSection />
      
      <CustomerReviews />
      
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-gray-800 mt-0">
        <p>&copy; {new Date().getFullYear()} Best Khmer Restaurant. All rights reserved.</p>
        <a 
          href="https://maps.app.goo.gl/qxXp6twPy4PXQPbu5" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="mt-2 inline-flex items-center gap-1.5 text-gray-400 hover:text-[#d4af37] transition-colors font-bold underline"
        >
          📍 Siem Reap, Cambodia (Click for Google Maps)
        </a>
      </footer>
    </div>
  );
}
