import { useRef, useState, useEffect } from 'react';
import { X, Play, Pause, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserFlowGuideModalProps {
  isOpen: boolean;
  onClose: void | (() => void);
}

export default function UserFlowGuideModal({ isOpen, onClose }: UserFlowGuideModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsPlaying(true);
      setHasError(false);
      // Attempt autoplay when open
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(() => {
              // Browser block autoplay without mute, mute and try again
              if (videoRef.current) {
                videoRef.current.muted = true;
                setIsMuted(true);
                videoRef.current.play()
                  .then(() => setIsPlaying(true))
                  .catch(() => setIsPlaying(false));
              }
            });
        }
      }, 300);
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isOpen]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVideoError = () => {
    setHasError(true);
    setIsPlaying(false);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0a0a0c] border-2 border-[#d4af37] rounded-3xl p-5 md:p-6 shadow-[0_25px_60px_rgba(212,175,55,0.15)] space-y-4 max-h-[92vh] overflow-y-auto flex flex-col justify-between hide-scrollbar"
        >
          {/* Header */}
          <div className="flex justify-between items-center pb-3 border-b border-gray-800">
            <div>
              <h3 className="text-xl font-bold text-white font-['Playfair_Display']">Video Ordering Guide</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Watch this quick tutorial to see the exact steps to order</p>
            </div>
            <button
              onClick={() => {
                if (videoRef.current) videoRef.current.pause();
                if (onClose) onClose();
              }}
              className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Video Player Container - Tailored for Portrait/Mobile Screen Walkthroughs */}
          <div className="relative aspect-[9/16] h-[38vh] max-h-[300px] min-h-[220px] mx-auto bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-[0_0_25px_rgba(0,0,0,0.6)] group">
            {hasError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-[#111115]">
                <AlertCircle className="text-[#d4af37]" size={40} />
                <h4 className="text-base font-bold text-white">Tutorial Video Container Ready</h4>
                <p className="text-xs text-gray-400 max-w-md leading-relaxed">
                  To display your video walkthrough, simply record your screen and place the recorded file inside the <code className="text-[#d4af37] bg-black/40 px-1.5 py-0.5 rounded font-mono">frontend/public/</code> directory named <code className="text-[#d4af37] bg-black/40 px-1.5 py-0.5 rounded font-mono">guide.mp4</code>.
                </p>
              </div>
            ) : (
              <>
                <video
                  ref={videoRef}
                  src="/guide.mp4"
                  loop
                  playsInline
                  onError={handleVideoError}
                  className="w-full h-full object-contain"
                />

                {/* Custom Overlay Controls */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="bg-[#d4af37] hover:bg-[#b08d29] text-black p-2.5 rounded-full transition-colors shadow-md"
                      >
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      </button>
                      <button
                        onClick={toggleMute}
                        className="bg-gray-900/80 hover:bg-gray-800 text-white p-2.5 rounded-full transition-colors border border-gray-700 shadow-md"
                      >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                      </button>
                    </div>
                    <span className="text-xs text-gray-300 font-bold bg-black/40 px-2.5 py-1 rounded-full border border-gray-800">
                      Live Walkthrough
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Tips / Instructions */}
          <div className="bg-gray-900/40 border border-gray-800/80 p-4 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-[#d4af37] flex-shrink-0 mt-0.5" size={18} />
            <div className="text-xs text-gray-300 leading-relaxed">
              <span className="font-bold text-white block mb-1">Quick Ordering Checklist:</span>
              1. Choose a dish and select options (e.g., choice of meat or extra toppings).<br />
              2. Add item to order cart. Pick your Table number (Dine In) or select Take Away.<br />
              3. Tap <span className="text-[#d4af37] font-bold">Confirm</span> to submit your order to the cashier!
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => {
              if (videoRef.current) videoRef.current.pause();
              if (onClose) onClose();
            }}
            className="w-full bg-[#d4af37] text-black font-extrabold text-sm py-4 rounded-xl hover:bg-[#b08d29] active:scale-95 transition-all shadow-[0_4px_25px_rgba(212,175,55,0.3)]"
          >
            Got it! Start Ordering
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
