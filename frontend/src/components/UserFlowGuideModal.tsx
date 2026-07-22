import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Volume2, VolumeX, Info, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserFlowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    id: 1,
    title: "Step 1: Tap Item & Customize Options",
    voiceText: "Step 1: Tap Beef Lok Lak. Select your meat choice like Beef, Pork, or Chicken, add extras like fried egg, then tap Add.",
    shortDesc: "Tap Beef Lok Lak on the menu. Select your meat choice (Beef/Pork/Chicken) and optional extras (Fried Egg), then tap + Add.",
    visual: (
      <div className="bg-[#0a0a0c] p-4 rounded-2xl border border-gray-800 space-y-4 font-sans">
        {/* Real Dish Showcase Card */}
        <div className="flex gap-3 bg-gray-900/90 p-3 rounded-xl border border-gray-800 items-center">
          <img 
            src="/images/beef-lok-lak.webp" 
            alt="Beef Lok Lak with Rice" 
            className="w-16 h-16 object-cover rounded-lg border border-[#d4af37]/40 flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h5 className="text-xs md:text-sm font-bold text-white truncate">Beef Lok Lak with Rice</h5>
              <span className="text-xs font-bold text-[#d4af37]">$4.00</span>
            </div>
            <p className="text-[10px] text-gray-400 truncate">SKU: F1 • Authentic Khmer stir-fry</p>
            <span className="inline-block text-[10px] font-bold text-[#d4af37] mt-1">16,000 ៛</span>
          </div>
        </div>

        {/* Meat Choice Selector */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="font-bold text-[#d4af37]">Select Meat Option:</span>
            <span className="font-bold text-white bg-gray-900 px-2 py-0.5 rounded text-[10px] border border-gray-800">Beef</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 text-xs text-center font-bold">
            <span className="bg-[#d4af37] text-black py-1.5 rounded-lg shadow">Beef</span>
            <span className="bg-gray-900 text-gray-400 py-1.5 rounded-lg border border-gray-800">Pork</span>
            <span className="bg-gray-900 text-gray-400 py-1.5 rounded-lg border border-gray-800">Chicken</span>
            <span className="bg-gray-900 text-gray-400 py-1.5 rounded-lg border border-gray-800">Tofu</span>
          </div>
        </div>

        {/* Add Extra Egg */}
        <div className="flex justify-between items-center bg-gray-900 p-2.5 rounded-xl border border-gray-800 text-xs">
          <span className="text-gray-300 font-semibold">Add Fried Egg</span>
          <span className="font-bold text-[#d4af37]">+$0.50</span>
        </div>

        <button className="w-full bg-[#d4af37] text-black font-extrabold text-xs md:text-sm py-2.5 rounded-xl shadow-lg">
          + Add to Order • $4.50 (18,000 ៛)
        </button>
      </div>
    )
  },
  {
    id: 2,
    title: "Step 2: Open Cart & Confirm Order",
    voiceText: "Step 2: Open your cart at the bottom, select Dine-In with your table number or Takeaway, review items, and tap Confirm Order.",
    shortDesc: "Open your cart at the bottom, pick Dine In (Table #) or Take Away, review items, and tap Confirm Order to send to the kitchen!",
    visual: (
      <div className="bg-[#0a0a0c] p-4 rounded-2xl border border-gray-800 space-y-4 font-sans">
        {/* Dining Type Selector */}
        <div className="grid grid-cols-2 gap-2 bg-gray-900 p-1.5 rounded-xl border border-gray-800">
          <div className="bg-[#d4af37] text-black text-xs font-bold py-2 text-center rounded-lg shadow">
            Dine In (Table #5)
          </div>
          <div className="text-gray-400 text-xs font-bold py-2 text-center rounded-lg">
            Take Away
          </div>
        </div>

        {/* Order Review Box with Real Lok Lak */}
        <div className="bg-gray-900/90 p-3 rounded-xl border border-gray-800 space-y-2 text-xs">
          <div className="flex justify-between items-center text-white font-bold border-b border-gray-800/80 pb-2">
            <div className="flex items-center gap-2">
              <img src="/images/beef-lok-lak.webp" alt="Lok Lak" className="w-8 h-8 rounded object-cover" />
              <div>
                <div className="truncate">1x Beef Lok Lak with Rice</div>
                <div className="text-[10px] text-gray-400 font-normal">Meat: Beef • Add Fried Egg</div>
              </div>
            </div>
            <span className="text-[#d4af37]">$4.50</span>
          </div>

          <div className="flex justify-between items-center text-white font-bold pt-1">
            <span>1x Mango Smoothie (Sugar 50%)</span>
            <span className="text-[#d4af37]">$2.50</span>
          </div>
        </div>

        {/* Confirm Order Button */}
        <button className="w-full bg-[#d4af37] text-black font-extrabold text-xs md:text-sm py-3 rounded-xl shadow-lg">
          Confirm Order • Total $7.00 (28,000 ៛)
        </button>
      </div>
    )
  }
];

export default function UserFlowGuideModal({ isOpen, onClose }: UserFlowGuideModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // Auto-advance step timer & progress bar
  useEffect(() => {
    if (!isPlaying || !isOpen) return;

    const interval = 50; // ms
    const stepDuration = 6000; // ms per step
    const increment = (interval / stepDuration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveStep((currentStep) => (currentStep + 1) % STEPS.length);
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [isPlaying, isOpen, activeStep]);

  // Speech Voice Over
  const speakVoiceOver = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore audio synthesis errors
    }
  };

  useEffect(() => {
    if (isOpen && !isMuted) {
      speakVoiceOver(STEPS[activeStep].voiceText);
    }
  }, [activeStep, isOpen, isMuted]);

  useEffect(() => {
    if (!isOpen && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const current = STEPS[activeStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-[#0a0a0c] border border-[#d4af37]/40 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)] space-y-5"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-800">
            <div>
              <h3 className="text-xl font-bold text-white font-['Playfair_Display']">How to Order</h3>
              <p className="text-xs text-gray-400">Step-by-step Lok Lak ordering guide</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Play / Pause Auto-Advance Toggle */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded-full text-xs font-bold transition-all border ${
                  isPlaying 
                    ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/50' 
                    : 'bg-gray-900 text-gray-400 border-gray-800 hover:text-white'
                }`}
                title={isPlaying ? 'Pause Auto Play' : 'Play Auto Advance'}
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>

              <button 
                onClick={() => {
                  const newMuted = !isMuted;
                  setIsMuted(newMuted);
                  if (newMuted && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  } else {
                    speakVoiceOver(current.voiceText);
                  }
                }}
                className={`p-2 rounded-full text-xs font-bold transition-all border ${
                  !isMuted 
                    ? 'bg-[#d4af37] text-black border-[#d4af37]' 
                    : 'bg-gray-900 text-gray-400 border-gray-800'
                }`}
                title="Toggle Voice Over"
              >
                {!isMuted ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>

              <button 
                onClick={() => {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  onClose();
                }} 
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Clean Step Card */}
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-2">
              <h4 className="text-sm font-bold text-[#d4af37]">
                {current.title}
              </h4>
              <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
                Step {current.id} of 2
              </span>
            </div>

            {/* Visual Example Box with Real Dish Photo */}
            {current.visual}

            {/* Auto Progress Bar */}
            <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden border border-gray-800">
              <div 
                className="bg-[#d4af37] h-full transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Collapsible Info Tip */}
            <div className="pt-1">
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-[#d4af37] transition-colors py-1 px-2.5 rounded-lg bg-gray-900/60 border border-gray-800"
              >
                <Info size={14} />
                <span>{showInfo ? 'Hide Tip' : 'Show Tip Details'}</span>
              </button>

              <AnimatePresence>
                {showInfo && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-gray-300 bg-gray-900/90 p-3.5 rounded-xl border border-gray-800 leading-relaxed mt-2 overflow-hidden"
                  >
                    {current.shortDesc}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-2">
            <button
              disabled={activeStep === 0}
              onClick={() => setActiveStep(0)}
              className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
            >
              <ChevronLeft size={16} /> Step 1
            </button>

            <div className="flex gap-1.5">
              {STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => setActiveStep(idx)}
                  className={`h-2.5 rounded-full transition-all ${
                    activeStep === idx ? 'w-8 bg-[#d4af37]' : 'w-2.5 bg-gray-700'
                  }`}
                />
              ))}
            </div>

            <button
              disabled={activeStep === 1}
              onClick={() => setActiveStep(1)}
              className="flex items-center gap-1 text-xs font-bold text-[#d4af37] hover:text-[#f3e5ab] disabled:opacity-30 transition-colors"
            >
              Step 2 <ChevronRight size={16} />
            </button>
          </div>

          {/* Big Action Button */}
          <button 
            onClick={() => {
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              onClose();
            }}
            className="w-full bg-[#d4af37] text-black font-extrabold text-sm py-3.5 rounded-xl hover:bg-[#b08d29] transition-all shadow-[0_4px_20px_rgba(212,175,55,0.3)] mt-2"
          >
            Got it! Start Ordering
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
