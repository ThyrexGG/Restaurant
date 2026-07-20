import { Star } from 'lucide-react';

const REVIEWS = [
  {
    name: "Sarah Jenkins",
    platform: "Google",
    date: "2 weeks ago",
    text: "Absolutely incredible! The Fish Amok here is the best I've had in Phnom Penh. The flavors were perfectly balanced, and the presentation was stunning. Highly recommend!",
    rating: 5,
  },
  {
    name: "David Chen",
    platform: "TripAdvisor",
    date: "1 month ago",
    text: "A hidden gem! The staff was incredibly welcoming and the Khmer curry blew my mind. We ate here three times during our trip. Don't skip the fresh spring rolls.",
    rating: 5,
  },
  {
    name: "Sokha T.",
    platform: "Google",
    date: "3 months ago",
    text: "Authentic, fresh, and delicious. You can taste the quality of the ingredients in every bite. The atmosphere is very cozy and perfect for a family dinner.",
    rating: 5,
  }
];

export default function CustomerReviews() {
  return (
    <section className="py-24 px-6 bg-[#050505] border-t border-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 font-['Playfair_Display'] text-transparent bg-clip-text bg-gradient-to-r from-white to-[#d4af37]">What Our Guests Say</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Don't just take our word for it. Read why locals and travelers alike consider us the premier destination for authentic Khmer cuisine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {REVIEWS.map((review, idx) => (
            <div key={idx} className="bg-gray-900/40 p-8 rounded-3xl border border-gray-800 hover:border-[#d4af37]/50 transition-colors shadow-lg relative group">
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-[#d4af37] text-black text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(212,175,55,0.5)]">
                {review.platform}
              </div>
              <div className="flex gap-1 mb-4">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={20} className="fill-[#d4af37] text-[#d4af37]" />
                ))}
              </div>
              <p className="text-gray-300 italic mb-6 leading-relaxed">"{review.text}"</p>
              <div className="mt-auto">
                <p className="font-bold text-white">{review.name}</p>
                <p className="text-sm text-gray-500">{review.date}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-gray-900 to-black p-10 rounded-3xl border border-gray-800 text-center max-w-4xl mx-auto shadow-2xl">
          <h3 className="text-2xl font-bold text-white mb-4">Loved your experience?</h3>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Your feedback means the world to us and helps others discover great food. Please consider leaving us a review!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="#" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-black font-bold py-4 px-8 rounded-xl hover:bg-gray-200 transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-5 h-5" />
              Review on Google
            </a>
            <a 
              href="#" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-[#00af87] text-white font-bold py-4 px-8 rounded-xl hover:bg-[#008f6e] transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <span className="text-xl">🦉</span>
              Review on TripAdvisor
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
