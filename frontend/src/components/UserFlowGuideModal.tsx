import { useState, useEffect } from 'react';
import { X, Play, Pause, ChevronRight, ChevronLeft, HelpCircle, RotateCcw, Volume2, VolumeX, MousePointer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserFlowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    id: 1,
    title: "1. Pick Category & Find Dish",
    time: "00:05",
    voiceText: "Step 1: Select a category from the dropdown or search for your favorite dish.",
    shortDesc: "Tap the dropdown menu or swipe category pills to jump to any section.",
    visual: (
      <div className="bg-[#0a0a0c] rounded-xl p-3 border border-gray-800 space-y-3 font-sans relative">
        {/* Animated Pointer Arrow Callout */}
        <div className="absolute top-10 right-4 z-20 bg-[#d4af37] text-black font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.8)] flex items-center gap-1 animate-bounce">
          <MousePointer size={12} /> TAP CATEGORY DROPDOWN ⬇️
        </div>

        {/* Web Navbar Mockup */}
        <div className="flex justify-between items-center bg-black/60 p-2 rounded-lg border border-gray-800">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="w-5 h-5 rounded-full" />
            <span className="text-xs font-bold text-[#d4af37]">Best Khmer</span>
          </div>
          <span className="text-[10px] text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">Menu</span>
        </div>

        {/* Category Selector Card */}
        <div className="bg-black p-2.5 rounded-xl border-2 border-[#d4af37] space-y-2 relative shadow-lg">
          <div className="text-[9px] font-bold text-[#d4af37] uppercase">Select Category</div>
          <div className="bg-gray-900 p-2 rounded-lg text-xs text-white font-bold flex justify-between items-center border border-gray-700">
            <span>⭐ Chef's Recommendations (8)</span>
            <span className="text-[#d4af37]">▼</span>
          </div>
          <div className="flex gap-1.5 overflow-x-auto text-[10px] pb-1">
            <span className="bg-[#d4af37] text-black font-bold px-2.5 py-1 rounded-md whitespace-nowrap">Recommendations (8)</span>
            <span className="bg-gray-900 text-gray-400 font-bold px-2.5 py-1 rounded-md border border-gray-800 whitespace-nowrap">Breakfast (12)</span>
            <span className="bg-gray-900 text-gray-400 font-bold px-2.5 py-1 rounded-md border border-gray-800 whitespace-nowrap">Fried Rice (18)</span>
          </div>
        </div>

        {/* Dish Grid Preview */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gray-900 p-2 rounded-lg border border-gray-800 flex flex-col justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-white block truncate">Grilled Pork Rice</span>
              <span className="text-[10px] font-bold text-[#d4af37]">$3.50 <span className="text-[8px] text-gray-400 font-normal">(14,000 ៛)</span></span>
            </div>
            <span className="bg-[#d4af37] text-black text-[9px] font-bold text-center py-1 rounded mt-1.5">+ Add</span>
          </div>

          <div className="bg-gray-900 p-2 rounded-lg border border-gray-800 flex flex-col justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-white block truncate">Strawberry Smoothie</span>
              <span className="text-[10px] font-bold text-[#d4af37]">$2.50 <span className="text-[8px] text-gray-400 font-normal">(10,000 ៛)</span></span>
            </div>
            <span className="bg-[#d4af37] text-black text-[9px] font-bold text-center py-1 rounded mt-1.5">+ Add</span>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "2. Set Sugar Level & Add Drink",
    time: "00:15",
    voiceText: "Step 2: Tap any drink to customize sugar levels 100%, 50% or no sugar, then add to order.",
    shortDesc: "Pick your sweetness (100%, 50%, 0%) & ice preference, then tap Add.",
    visual: (
      <div className="bg-[#0a0a0c] rounded-xl p-3 border border-gray-800 space-y-2.5 font-sans relative">
        {/* Animated Pointer Arrow Callout */}
        <div className="absolute top-16 right-4 z-20 bg-[#d4af37] text-black font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.8)] flex items-center gap-1 animate-pulse">
          <MousePointer size={12} /> SELECT SWEETNESS 👈
        </div>

        {/* Item Modal Mockup */}
        <div className="bg-black/90 p-3 rounded-xl border-2 border-[#d4af37] space-y-2 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <h5 className="text-xs font-bold text-white">Strawberry Smoothie</h5>
              <span className="text-[10px] text-gray-400">Fresh blended fruit smoothie</span>
            </div>
            <span className="text-xs font-bold text-[#d4af37]">$2.50</span>
          </div>

          {/* Sugar Level Selector */}
          <div className="bg-gray-900/90 p-2 rounded-lg border border-[#d4af37]/60 space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-white flex items-center gap-1">🍬 Sugar Level</span>
              <span className="font-bold text-[#d4af37] bg-[#d4af37]/20 px-1.5 py-0.5 rounded">50% (Half)</span>
            </div>
            <div className="flex flex-wrap gap-1 text-[9px]">
              <span className="bg-gray-800 text-gray-400 font-bold px-2 py-0.5 rounded border border-gray-700">100%</span>
              <span className="bg-[#d4af37] text-black font-bold px-2 py-0.5 rounded shadow scale-105">50%</span>
              <span className="bg-gray-800 text-gray-400 font-bold px-2 py-0.5 rounded border border-gray-700">25%</span>
              <span className="bg-gray-800 text-gray-400 font-bold px-2 py-0.5 rounded border border-gray-700">0%</span>
            </div>
          </div>

          {/* Ice Level Selector */}
          <div className="bg-gray-900/90 p-2 rounded-lg border border-gray-800 space-y-1.5">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-white flex items-center gap-1">🧊 Ice Level</span>
              <span className="font-bold text-cyan-400">Normal Ice</span>
            </div>
            <div className="flex gap-1 text-[9px]">
              <span className="bg-cyan-500 text-black font-bold px-2 py-0.5 rounded shadow">Normal Ice</span>
              <span className="bg-gray-800 text-gray-400 font-bold px-2 py-0.5 rounded border border-gray-700">Less Ice</span>
              <span className="bg-gray-800 text-gray-400 font-bold px-2 py-0.5 rounded border border-gray-700">No Ice</span>
            </div>
          </div>

          <button className="w-full bg-[#d4af37] text-black font-extrabold text-xs py-2 rounded-lg shadow-md">
            Add to Order - $2.50 <span className="text-[9px] opacity-90">(10,000 ៛)</span>
          </button>
        </div>
      </div>
    )
  },
  {
    id: 3,
    title: "3. Choose Dine-In / Takeaway & Confirm",
    time: "00:30",
    voiceText: "Step 3: Select Dine-In with your table number or Takeaway, then confirm order.",
    shortDesc: "Tap the floating cart, choose Dine In (Table) or Take Away, then tap Confirm.",
    visual: (
      <div className="bg-[#0a0a0c] rounded-xl p-3 border border-gray-800 space-y-2.5 font-sans relative">
        {/* Animated Pointer Arrow Callout */}
        <div className="absolute top-10 right-4 z-20 bg-[#d4af37] text-black font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(212,175,55,0.8)] flex items-center gap-1 animate-bounce">
          <MousePointer size={12} /> PICK DINE-IN TABLE ⬇️
        </div>

        {/* Cart Drawer Mockup */}
        <div className="bg-gray-950 p-3 rounded-xl border border-gray-800 space-y-2.5">
          <div className="flex justify-between items-center text-xs pb-1.5 border-b border-gray-800">
            <span className="font-bold text-white">Your Cart (2 Items)</span>
            <span className="text-xs font-bold text-[#d4af37]">$6.00</span>
          </div>

          {/* Dining Option Toggle */}
          <div className="grid grid-cols-2 gap-1.5 bg-gray-900 p-1 rounded-lg border-2 border-[#d4af37]">
            <div className="bg-[#d4af37] text-black text-[10px] font-bold py-1.5 text-center rounded shadow">Dine In (Table 5)</div>
            <div className="text-gray-400 text-[10px] font-bold py-1.5 text-center rounded">Take Away</div>
          </div>

          {/* Order Item List */}
          <div className="space-y-1 text-[10px] text-gray-300">
            <div className="flex justify-between">
              <span>1x Grilled Pork Rice</span>
              <span className="text-white font-bold">$3.50</span>
            </div>
            <div className="flex justify-between">
              <span>1x Strawberry Smoothie <span className="text-[#d4af37]">(Sugar 50%)</span></span>
              <span className="text-white font-bold">$2.50</span>
            </div>
          </div>

          {/* Confirm Button */}
          <button className="w-full bg-[#d4af37] text-black font-black text-xs py-2 rounded-lg shadow-md animate-pulse">
            Confirm Order • Total: $6.00 (24,000 ៛)
          </button>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "4. Kitchen Ticket Auto Prints",
    time: "00:45",
    voiceText: "Step 4: Your order is confirmed and printed automatically to our kitchen printer!",
    shortDesc: "Ticket is sent to kitchen printer instantly. View your receipt anytime in 'My Bill'.",
    visual: (
      <div className="bg-[#0a0a0c] rounded-xl p-3 border border-gray-800 space-y-2 font-sans relative">
        {/* Animated Pointer Arrow Callout */}
        <div className="absolute top-2 right-4 z-20 bg-green-500 text-black font-extrabold text-[10px] px-2.5 py-1 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.8)] flex items-center gap-1 animate-pulse">
          ✨ INSTANT KITCHEN PRINT!
        </div>

        {/* Thermal Receipt Mockup */}
        <div className="bg-white text-black p-3 rounded-lg font-mono text-[10px] space-y-1.5 shadow-xl border border-gray-300">
          <div className="text-center font-bold text-xs border-b border-dashed border-gray-400 pb-1">
            BEST KHMER RESTAURANT
            <div className="text-[9px] font-normal text-gray-600">Siem Reap, Cambodia</div>
          </div>
          <div className="flex justify-between text-[9px] font-bold">
            <span>ORDER #1042</span>
            <span>DINE IN (TABLE #5)</span>
          </div>
          <div className="border-t border-b border-dashed border-gray-400 py-1 space-y-0.5">
            <div className="flex justify-between"><span>1x Grilled Pork Rice</span><span>$3.50</span></div>
            <div className="flex justify-between"><span>1x Strawberry Smoothie</span><span>$2.50</span></div>
            <div className="text-[8px] text-gray-600 pl-2">└ Sugar: 50% | Ice: Normal</div>
          </div>
          <div className="flex justify-between font-bold text-xs pt-0.5">
            <span>TOTAL:</span>
            <span>$6.00 (24,000 ៛)</span>
          </div>
        </div>

        <div className="text-center">
          <span className="inline-block bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold px-3 py-1 rounded-full">
            ✓ Sent to Kitchen Printer Automatically
          </span>
        </div>
      </div>
    )
  }
];

export default function UserFlowGuideModal({ isOpen, onClose }: UserFlowGuideModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [hasRealVideo, setHasRealVideo] = useState(false);
  const [progress, setProgress] = useState(0);

  // AI Voice Synthesis Speech Engine
  const speakVoiceOver = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore audio synthesis errors silently if browser restricts autoplay audio
    }
  };

  // Speak step whenever step changes
  useEffect(() => {
    if (isOpen && !hasRealVideo && !isMuted) {
      speakVoiceOver(STEPS[activeStep].voiceText);
    }
  }, [activeStep, isOpen, isMuted, hasRealVideo]);

  // Cancel speech on close
  useEffect(() => {
    if (!isOpen && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isOpen]);

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
    const stepDuration = 5000; // ms per step
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
                <h3 className="text-xl font-bold text-white font-['Playfair_Display']">How to Order (Interactive Video)</h3>
                <p className="text-xs text-gray-400">Step-by-step screen demo with AI Voice Over narration</p>
              </div>
            </div>
            <button 
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                onClose();
              }} 
              className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Real MP4 Video or Authentic Website Showcase Simulation Player */}
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
              {/* Mini-Browser Web Showcase Frame */}
              <div className="relative bg-gradient-to-br from-gray-950 via-black to-gray-900 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
                
                {/* Browser Top Window Bar */}
                <div className="bg-black/90 px-4 py-2.5 border-b border-gray-800 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">https://bestkhmer-restaurant.com/menu</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Voice Over Toggle Button */}
                    <button 
                      onClick={() => {
                        const newMuteState = !isMuted;
                        setIsMuted(newMuteState);
                        if (newMuteState && 'speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                        } else {
                          speakVoiceOver(current.voiceText);
                        }
                      }}
                      className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                        !isMuted 
                          ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.4)]' 
                          : 'bg-gray-800 text-gray-400 border-gray-700 hover:text-white'
                      }`}
                      title="Toggle AI Voice Over Narration"
                    >
                      {!isMuted ? <Volume2 size={13} /> : <VolumeX size={13} />}
                      <span>{!isMuted ? 'Voice On' : 'Voice Muted'}</span>
                    </button>

                    <button 
                      onClick={() => { setActiveStep(0); setProgress(0); setIsPlaying(true); }}
                      className="text-gray-400 hover:text-[#d4af37] transition-colors p-1"
                      title="Replay Showcase"
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

                {/* Animated Showcase Content */}
                <div className="p-4 md:p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                      <span className="bg-[#d4af37] text-black w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center">
                        {current.id}
                      </span>
                      {current.title}
                    </h4>
                    <span className="text-xs font-mono text-[#d4af37]">{current.time}</span>
                  </div>

                  {/* Pixel-Perfect UI Showcase Mockup */}
                  <div className="my-2">
                    {current.visual}
                  </div>

                  <p className="text-xs text-[#d4af37] font-semibold leading-relaxed bg-black/60 p-3 rounded-xl border border-[#d4af37]/30">
                    💡 {current.shortDesc}
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
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                onClose();
              }}
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
