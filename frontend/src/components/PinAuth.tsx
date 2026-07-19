import React, { useState } from 'react';
import { Lock, Delete } from 'lucide-react';

interface PinAuthProps {
  children: React.ReactNode;
  correctPin?: string;
}

export default function PinAuth({ children, correctPin = '1234' }: PinAuthProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);

      if (newPin.length === 4) {
        if (newPin === correctPin) {
          setIsAuthenticated(true);
        } else {
          setError(true);
          setTimeout(() => setPin(''), 500); // Clear after a short delay
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumberClick(e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pin]);

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col justify-center items-center p-4 selection:bg-[#d4af37] selection:text-black">
      <div className="max-w-md w-full glass-panel p-8 md:p-12 text-center rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.8)] border border-gray-800">
        <div className="flex justify-center mb-6">
          <div className={`p-4 rounded-full ${error ? 'bg-red-500/20 text-red-500' : 'bg-[#d4af37]/20 text-[#d4af37]'} transition-colors duration-300`}>
            <Lock size={48} />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold font-['Playfair_Display'] mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-[#d4af37]">
          Restricted Access
        </h2>
        <p className="text-gray-400 mb-8">Please enter your 4-digit PIN</p>
        
        <div className="flex justify-center gap-4 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-4 h-4 rounded-full transition-all duration-300 ${
                i < pin.length 
                  ? error ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.5)]' 
                  : 'bg-gray-800 border border-gray-700'
              } ${error ? 'animate-bounce' : ''}`}
            />
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-4 max-w-[280px] mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-gray-900/80 hover:bg-gray-800 border border-gray-800 hover:border-[#d4af37]/50 text-2xl font-bold transition-all hover:scale-105 shadow-lg flex items-center justify-center"
            >
              {num}
            </button>
          ))}
          <div className="w-16 h-16 md:w-20 md:h-20 mx-auto"></div> {/* Empty space */}
          <button
            onClick={() => handleNumberClick('0')}
            className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-gray-900/80 hover:bg-gray-800 border border-gray-800 hover:border-[#d4af37]/50 text-2xl font-bold transition-all hover:scale-105 shadow-lg flex items-center justify-center"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-gray-900/80 hover:bg-gray-800 border border-gray-800 hover:border-red-500/50 text-red-400 transition-all hover:scale-105 shadow-lg flex items-center justify-center"
          >
            <Delete size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
