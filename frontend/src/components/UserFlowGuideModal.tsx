import { useState, useEffect } from 'react';
import { X, Play, Pause, ChevronRight, ChevronLeft, HelpCircle, CheckCircle2, ShoppingBag, Utensils, Receipt, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserFlowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    id: 1,
    title: "Step 1: Browse Menu & Select Category",
    time: "00:05",
    desc: "Use the top Category Selector or drag the quick pills horizontally to jump straight to your favorite section (Fried Rice, Soup, Breakfast, Beverages). You can also search by dish name or SKU code (e.g. B16).",
    icon: Utensils,
    visual: (
      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3 shadow-inner">
        <div className="bg-black p-3 rounded-lg border border-[#d4af37] text-xs font-bold text-[#d4af37] flex justify-between items-center shadow-md">
          <span>Select Category</span>
          <span>▼</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          <span className="bg-[#d4af37] text-black text-xs font-bold px-3 py-1 rounded-lg">Chef's Recommendations (8)</span>
          <span className="bg-gray-900 text-gray-400 text-xs font-bold px-3 py-1 rounded-lg border border-gray-800">Breakfast (12)</span>
          <span className="bg-gray-900 text-gray-400 text-xs font-bold px-3 py-1 rounded-lg border border-gray-800">Fried Rice (18)</span>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "Step 2: Customize Drink Sugar & Add to Order",
    time: "00:15",
    desc: "Tap any dish or drink to view ingredients and customize your Sugar Level (100%, 50%, 0%) and Ice Level. Click '+ Add' to put items into your shopping cart.",
    icon: ShoppingBag,
    visual: (
      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3 shadow-inner">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-white">Strawberry Smoothie</span>
          <span className="text-xs font-bold text-[#d4af37]">$2.50 (10,000 ៛)</span>
        </div>
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase">🍬 Sugar Level</span>
          <div className="flex gap-1.5">
            <span className="bg-[#d4af37] text-black text-[10px] font-bold px-2 py-0.5 rounded">100% (Normal)</span>
            <span className="bg-gray-900 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-800">50% (Half)</span>
            <span className="bg-gray-900 text-gray-400 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-800">0% (No Sugar)</span>
          </div>
        </div>
        <button className="w-full bg-[#d4af37] text-black font-bold text-xs py-2 rounded-xl shadow-lg">
          + Add to Order - $2.50
        </button>
      </div>
    )
  },
  {
    id: 3,
    title: "Step 3: Choose Dine-In or Takeaway & Confirm",
    desc: "Open your cart at the bottom, select your Dining Option (Dine In or Take Away), enter your Table Number if seated, and tap 'Confirm Order'.",
    icon: CheckCircle2,
    visual: (
      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 space-y-3 shadow-inner">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#d4af37] text-black text-xs font-bold p-2 text-center rounded-lg shadow-sm">Dine In (Table 5)</div>
          <div className="bg-gray-900 text-gray-400 text-xs font-bold p-2 text-center rounded-lg border border-gray-800">Take Away</div>
        </div>
        <div className="bg-[#d4af37] text-black text-center text-xs font-extrabold p-2.5 rounded-xl shadow-md">
          Confirm Order • $6.00 (24,000 ៛)
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "Step 4: Auto Ticket Printing & View Bill",
    desc: "Your order is immediately sent to the kitchen printer automatically! Tap 'My Bill' at the top anytime to view your order receipt.",
    icon: Receipt,
    visual: (
      <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 text-center space-y-2.5 shadow-inner">
        <div className="inline-block bg-green-500/20 text-green-400 border border-green-500/30 text-xs font-bold px-3 py-1 rounded-full">
          ✓ Kitchen Ticket Printed Automatically
        </div>
        <div className="text-xs text-gray-300">Dual Currency Total: $6.00 USD / 24,000 KHR ៛</div>
      </div>
    )
  }
];

export default function UserFlowGuideModal({ isOpen, onClose }: UserFlowGuideModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasRealVideo, setHasRealVideo] = useState(false);
  const [progress, setProgress] = useState(0);

  // Check if a real MP4 video exists and is actually a video file
  useEffect(() => {
    fetch('/video-guide.mp4', { method: 'HEAD' })
      .then(res => {
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('video')) {
          setHasRealVideo(true);
        } else {
          setHasRealVideo(false);
        }
      })
      .catch(() => setHasRealVideo(false));
  }, []);

  // Video Demo playback timer & progress bar
  useEffect(() => {
    if (!isPlaying || hasRealVideo || !isOpen) return;

    const interval = 50; // ms
    const stepDuration = 4500; // ms per step
    const increment = (interval / stepDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((current) => (current + 1) % STEPS.length);
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, hasRealVideo, isOpen, activeStep]);

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
          <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
                <HelpCircle size={22} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-['Playfair_Display']">How to Order (Video Walkthrough)</h3>
                <p className="text-xs text-gray-400">Watch the 1-minute quick guide to start ordering</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Real MP4 Video or Animated Interactive Demo Player */}
          {hasRealVideo ? (
            <div className="relative rounded-2xl overflow-hidden bg-black border border-gray-800 mb-6 aspect-video">
              <video 
                src="/video-guide.mp4" 
                controls 
                autoPlay 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Simulated Video Player Screen */}
              <div className="relative bg-gradient-to-br from-gray-950 via-black to-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                
                {/* Video Header Bar */}
                <div className="bg-black/80 px-4 py-2.5 border-b border-gray-800 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <span className="font-bold text-red-500 uppercase tracking-wider text-[10px]">VIDEO DEMO</span>
                    <span className="text-gray-500">|</span>
                    <span className="text-gray-300 font-mono">{current.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setActiveStep(0); setProgress(0); setIsPlaying(true); }}
                      className="text-gray-400 hover:text-[#d4af37] transition-colors p-1"
                      title="Replay from start"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button 
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="flex items-center gap-1 text-xs font-bold text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-1 rounded-full border border-[#d4af37]/30 hover:bg-[#d4af37]/20 transition-all"
                    >
                      {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                  </div>
                </div>

                {/* Animated Screen Content */}
                <div className="p-5 md:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <span className="bg-[#d4af37] text-black w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center">
                        {current.id}
                      </span>
                      {current.title}
                    </h4>
                  </div>

                  <div className="my-2">
                    {current.visual}
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed bg-black/60 p-3 rounded-xl border border-gray-800/80">
                    {current.desc}
                  </p>
                </div>

                {/* Video Progress Bar */}
                <div className="w-full bg-gray-900 h-1.5 relative overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#d4af37] to-[#f3e5ab] h-full transition-all duration-75"
                    style={{ width: `${((activeStep + (progress / 100)) / STEPS.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Step Navigation Bar */}
              <div className="flex items-center justify-between px-2 pt-1">
                <button
                  disabled={activeStep === 0}
                  onClick={() => { setActiveStep(prev => Math.max(0, prev - 1)); setProgress(0); }}
                  className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
                >
                  <ChevronLeft size={16} /> Prev Step
                </button>

                <div className="flex items-center gap-2">
                  {STEPS.map((step, idx) => (
                    <button
                      key={step.id}
                      onClick={() => { setActiveStep(idx); setProgress(0); }}
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
                  onClick={() => { setActiveStep(prev => Math.min(STEPS.length - 1, prev + 1)); setProgress(0); }}
                  className="flex items-center gap-1 text-xs font-bold text-[#d4af37] hover:text-[#f3e5ab] disabled:opacity-30 disabled:hover:text-[#d4af37] transition-colors"
                >
                  Next Step <ChevronRight size={16} />
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
