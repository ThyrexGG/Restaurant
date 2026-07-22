import { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, X, Check } from 'lucide-react';

const INITIAL_REVIEWS = [
  {
    name: "Sarah Jenkins",
    platform: "Google",
    date: "2 weeks ago",
    text: "Absolutely incredible! The Fish Amok here is the best I've had in Siem Reap. The flavors were perfectly balanced, and the presentation was stunning. Highly recommend!",
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
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('best_khmer_user_reviews');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReviews([...parsed, ...INITIAL_REVIEWS]);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    const newReview = {
      name: name.trim(),
      platform: "Verified Customer",
      date: "Just now",
      text: text.trim(),
      rating: rating,
    };

    const updated = [newReview, ...reviews];
    setReviews(updated);

    // Save user reviews locally
    const userReviewsOnly = updated.filter(r => r.platform === "Verified Customer");
    localStorage.setItem('best_khmer_user_reviews', JSON.stringify(userReviewsOnly));

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsModalOpen(false);
      setName('');
      setText('');
      setRating(5);
    }, 1500);
  };

  const googleReviewUrl = "https://maps.app.goo.gl/qxXp6twPy4PXQPbu5";
  const tripAdvisorUrl = "https://www.tripadvisor.com/Restaurant_Review-g297390-d27098799-Reviews-Best_Khmer_Restaurant_Golden_Cafe-Siem_Reap_Siem_Reap_Province.html";

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
          {reviews.slice(0, 6).map((review, idx) => (
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
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#d4af37] text-black font-bold py-4 px-8 rounded-xl hover:bg-[#b08d29] transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <MessageSquarePlus size={20} />
              Write a Review
            </button>
            <a 
              href={googleReviewUrl}
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white text-black font-bold py-4 px-8 rounded-xl hover:bg-gray-200 transition-transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-5 h-5" />
              Review on Google
            </a>
            <a 
              href={tripAdvisorUrl}
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

      {/* Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex justify-center items-center p-4">
          <div className="bg-[#0a0a0c] border border-gray-800 rounded-3xl p-8 max-w-md w-full relative shadow-2xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-full"
            >
              <X size={20} />
            </button>

            {submitted ? (
              <div className="py-8 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-green-500/20 text-green-400 border border-green-500/50 rounded-full flex items-center justify-center mb-4">
                  <Check size={32} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
                <p className="text-gray-400">Your review has been submitted successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-6">
                <h3 className="text-2xl font-bold text-white font-['Playfair_Display']">Write a Review</h3>

                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-2">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star 
                          size={28} 
                          className={star <= rating ? "fill-[#d4af37] text-[#d4af37]" : "text-gray-600"} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-2">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex M."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3.5 text-white focus:border-[#d4af37] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-400 text-sm font-bold mb-2">Your Review</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us about your dining experience..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3.5 text-white focus:border-[#d4af37] outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#d4af37] text-black font-bold py-4 rounded-xl hover:bg-[#b08d29] transition-transform hover:scale-105 shadow-lg"
                >
                  Submit Review
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
