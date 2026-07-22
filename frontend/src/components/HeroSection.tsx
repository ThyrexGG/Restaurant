

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center text-center pt-[80px] pb-10 overflow-hidden">
      {/* Background Logo */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-no-repeat bg-center opacity-[0.02] pointer-events-none z-0"
        style={{ 
          backgroundImage: "url('/logo.png')",
          backgroundSize: "min(90vw, 500px)"
        }}
      />
      
      <div className="relative z-10 max-w-3xl px-4 md:px-6">
        <h4 className="text-[#d4af37] font-['Outfit'] text-xs md:text-base uppercase tracking-[3px] md:tracking-[4px] mb-6 md:mb-6 leading-relaxed">
          Experience Culinary Excellence
        </h4>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-6 leading-tight md:leading-tight">
          Welcome to <br />
          <span className="text-[#d4af37] italic">Best Khmer</span> Restaurant
        </h1>
        <p className="text-base md:text-xl text-[#aaaaaa] mb-10 md:mb-12 max-w-2xl mx-auto leading-relaxed md:leading-relaxed">
          Where every dish is a masterpiece, crafted with passion and the finest ingredients. 
          Join us for an unforgettable dining experience.
        </p>
        <div className="flex justify-center gap-6">
          <a href="#menu" className="bg-transparent border-2 border-[#d4af37] text-[#d4af37] hover:bg-[#d4af37] hover:text-black font-semibold px-8 py-3.5 rounded-full transition-all text-sm md:text-base">
            View Our Menu
          </a>
        </div>
      </div>
    </section>
  );
}
