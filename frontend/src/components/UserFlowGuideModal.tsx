import { useState, useEffect } from 'react';
import { X, Play, Pause, ChevronRight, ChevronLeft, HelpCircle, CheckCircle2, ShoppingBag, Utensils, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserFlowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    id: 1,
    title: "1. Select Category & Search Dishes",
    desc: "Use the top Category Selector or drag the quick pills horizontally to jump straight to your favorite section (Fried Rice, Soup, Breakfast, Beverages). You can also search by dish name or SKU code (e.g. B16).",
    icon: Utensils,
    color: "from-amber-500 to-yellow-600",
    visual: (
      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3">
        <div className="bg-black p-3 rounded-lg border border-[#d4af37] text-xs font-bold text-[#d4af37] flex justify-between items-center shadow-md">
          <span>📂 Select Category</span>
          <span>▼</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <span className="bg-[#d4af37] text-black text-xs font-bold px-3 py-1 rounded-lg">Recommendations (8)</span>
          <span className="bg-gray-900 text-gray-400 text-xs font-bold px-3 py-1 rounded-lg border border-gray-800">Breakfast (12)</span>
          <span className="bg-gray-900 text-gray-400 text-xs font-bold px-3 py-1 rounded-lg border border-gray-800">Fried Rice (18)</span>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "2. Choose Options & Add to Order",
    desc: "Tap any dish to view ingredients, special instructions, and price in $ USD and ៛ KHR. Click '+ Add' to put items into your shopping cart.",
    icon: ShoppingBag,
    color: "from-yellow-500 to-amber-600",
    visual: (
      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-sm font-bold text-white">Grilled Pork with Rice</div>
          <div className="text-xs text-[#d4af37] font-bold">$3.50 <span className="text-gray-400 font-normal">(14,000 ៛)</span></div>
        </div>
        <button className="bg-[#d4af37] text-black font-bold text-xs px-4 py-2 rounded-xl shadow-lg">
          + Add to Order
        </button>
      </div>
    )
  },
  {
    id: 3,
    title: "3. Choose Dine-In or Takeaway & Confirm",
    desc: "Open your cart at the bottom, select your Dining Option (Dine In or Take Away), enter your Table Number if seated, and tap 'Confirm Order'.",
    icon: CheckCircle2,
    color: "from-amber-400 to-yellow-500",
    visual: (
      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#d4af37] text-black text-xs font-bold p-2 text-center rounded-lg">Dine In (Table)</div>
          <div className="bg-gray-900 text-gray-400 text-xs font-bold p-2 text-center rounded-lg border border-gray-800">Take Away</div>
        </div>
        <div className="bg-[#d4af37] text-black text-center text-xs font-extrabold p-2.5 rounded-xl shadow-md">
          Confirm Order • $7.50 (30,000 ៛)
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "4. Auto Ticket Printing & View Bill",
    desc: "Your order is immediately sent to the kitchen printer automatically! Tap 'My Bill' at the top anytime to view your order receipt.",
    icon: Receipt,
    color: "from-yellow-400 to-amber-500",
    visual: (
      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-center space-y-2">
        <div className="inline-block bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold px-3 py-1 rounded-full">
          ✓ Ticket Printed Automatically
        </div>
        <div className="text-xs text-gray-300">Receipt total calculated in $ USD and ៛ KHR (4,000 ៛ / $1)</div>
      </div>
    )
  }
];

export default function UserFlowGuideModal({ isOpen, onClose }: UserFlowGuideModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasCustomVideo, setHasCustomVideo] = useState(false);

  useEffect(() => {
    fetch('/video-guide.mp4', { method: 'HEAD' })
      .then(res => {
        if (res.ok) setHasCustomVideo(true);
      })
      .catch(() => setHasCustomVideo(false));
  }, []);

  useEffect(() => {
    if (!isPlaying || hasCustomVideo) return;
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPlaying, hasCustomVideo]);

  if (!isOpen) return null;

  const current = STEPS[activeStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-[#0a0a0c] border border-[#d4af37]/40 rounded-3xl p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-4 mb-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                <HelpCircle size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-['Playfair_Display']">How to Order (Quick Guide)</h3>
                <p className="text-xs text-gray-400">Easy 4-step walkthrough for new customers</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Video Player or Interactive Animated Flow */}
          {hasCustomVideo ? (
            <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-800 mb-6 aspect-video">
              <video 
                src="/video-guide.mp4" 
                controls 
                autoPlay 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Visual Demo Card */}
              <div className="relative bg-gradient-to-br from-gray-900 to-black p-6 rounded-2xl border border-gray-800 shadow-inner">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-[#d4af37] text-black font-extrabold text-sm flex items-center justify-center">
                      {current.id}
                    </div>
                    <h4 className="text-base font-bold text-white">{current.title}</h4>
                  </div>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#d4af37] bg-[#d4af37]/10 px-3 py-1.5 rounded-full border border-[#d4af37]/20 hover:bg-[#d4af37]/20 transition-all"
                  >
                    {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    <span>{isPlaying ? 'Pause Demo' : 'Play Demo'}</span>
                  </button>
                </div>

                {/* Animated Step Mockup */}
                <div className="my-4">
                  {current.visual}
                </div>

                <p className="text-xs md:text-sm text-gray-300 leading-relaxed bg-black/40 p-3 rounded-xl border border-gray-800/60">
                  {current.desc}
                </p>
              </div>

              {/* Step Navigation Dots */}
              <div className="flex items-center justify-between px-2">
                <button
                  disabled={activeStep === 0}
                  onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                  className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                >
                  <ChevronLeft size={16} /> Previous
                </button>

                <div className="flex items-center gap-2">
                  {STEPS.map((step, idx) => (
                    <button
                      key={step.id}
                      onClick={() => setActiveStep(idx)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        activeStep === idx 
                          ? 'w-8 bg-[#d4af37]' 
                          : 'w-2.5 bg-gray-700 hover:bg-gray-500'
                      }`}
                      title={`Step ${step.id}`}
                    />
                  ))}
                </div>

                <button
                  disabled={activeStep === STEPS.length - 1}
                  onClick={() => setActiveStep(prev => Math.min(STEPS.length - 1, prev + 1))}
                  className="flex items-center gap-1 text-xs font-bold text-[#d4af37] hover:text-[#f3e5ab] disabled:opacity-30 disabled:hover:text-[#d4af37] transition-colors"
                >
                  Next <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Footer Action */}
          <div className="mt-6 pt-4 border-t border-gray-800/80 flex justify-end">
            <button 
              onClick={onClose}
              className="bg-[#d4af37] text-black font-bold text-sm px-6 py-2.5 rounded-xl hover:bg-[#b08d29] transition-all shadow-[0_4px_15px_rgba(212,175,55,0.3)]"
            >
              Got it, let's order!
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
