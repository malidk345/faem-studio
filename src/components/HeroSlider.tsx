import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface HeroItem {
  id: number;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
}

interface HeroSliderProps {
  items: HeroItem[];
}

const HeroSlider: React.FC<HeroSliderProps> = ({ items }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const index = Math.round(scrollLeft / width);
    setActiveIndex(index);
  };

  const scrollTo = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        left: index * scrollRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="relative group w-full overflow-hidden">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-0 scroll-smooth h-[85vh] md:h-[90vh]"
      >
        {items.map((item, idx) => (
          <div 
            key={item.id} 
            className="flex-shrink-0 w-full h-full snap-center relative overflow-hidden"
          >
            {/* Background Image with Cinematic Scale */}
            <motion.img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              initial={{ scale: 1.15 }}
              animate={{ scale: activeIndex === idx ? 1 : 1.15 }}
              transition={{ duration: 3, ease: [0.16, 1, 0.3, 1] }}
            />
            
            {/* Dynamic Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10"></div>
            <div className="absolute inset-0 bg-black/5 opacity-50 group-hover:opacity-0 transition-opacity duration-1000"></div>
            
            {/* Content Container */}
            <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-24 max-w-7xl mx-auto w-full">
              <div className="max-w-3xl flex flex-col items-start gap-4">
                 <motion.span 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: activeIndex === idx ? 1 : 0, y: activeIndex === idx ? 0 : 20 }}
                   transition={{ delay: 0.2, duration: 0.8 }}
                   className="bg-white/10 backdrop-blur-md text-white text-[10px] md:text-[11px] uppercase tracking-[0.5em] font-extrabold px-6 py-2.5 rounded-lg border border-white/20 shadow-lg"
                 >
                    {item.tag}
                 </motion.span>
                 
                 <motion.h2 
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: activeIndex === idx ? 1 : 0, y: activeIndex === idx ? 0 : 30 }}
                   transition={{ delay: 0.3, duration: 0.8 }}
                   className="text-white text-6xl md:text-8xl font-extrabold tracking-tighter leading-[0.9] md:leading-[0.85] mb-4"
                 >
                   {item.title.split(' / ').map((word, i) => (
                     <React.Fragment key={i}>
                       {word} {i === 0 && <br />}
                     </React.Fragment>
                   ))}
                 </motion.h2>
                 
                 <motion.p 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: activeIndex === idx ? 0.7 : 0, y: activeIndex === idx ? 0 : 20 }}
                   transition={{ delay: 0.4, duration: 0.8 }}
                   className="text-white/70 text-lg md:text-2xl font-light mb-10 max-w-lg leading-relaxed"
                 >
                   {item.subtitle}
                 </motion.p>
                 
                 <motion.div
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: activeIndex === idx ? 1 : 0, scale: activeIndex === idx ? 1 : 0.95 }}
                   transition={{ delay: 0.5, duration: 0.8 }}
                 >
                   <button className="bg-white/90 backdrop-blur-md text-black px-8 py-3.5 rounded-xl text-[13px] font-bold hover:bg-white transition-all shadow-lg active:scale-95 group/btn flex items-center gap-2.5">
                     Discover <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                   </button>
                 </motion.div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modern Index Indicators */}
      <div className="absolute bottom-12 right-8 md:right-16 flex items-center gap-4 z-20">
         {items.map((_, i) => (
           <button 
             key={i} 
             onClick={() => scrollTo(i)}
             className={`h-1.5 transition-all duration-700 ease-in-out rounded-full ${activeIndex === i ? 'w-12 bg-white' : 'w-4 bg-white/20 hover:bg-white/40'}`}
           />
         ))}
      </div>

      {/* Side Navigation Buttons (Hidden on mobile) */}
      <div className="absolute top-1/2 -translate-y-1/2 left-8 right-8 justify-between pointer-events-none hidden md:flex z-10">
         <button 
           onClick={() => scrollTo(activeIndex - 1)}
           disabled={activeIndex === 0}
           className={`w-14 h-14 rounded-xl glass-apple flex items-center justify-center text-white pointer-events-auto transition-all ${activeIndex === 0 ? 'opacity-0 scale-90' : 'opacity-100 hover:scale-110 active:scale-95 hover:bg-white hover:text-black'}`}
         >
            <ChevronLeft size={24} />
         </button>
         <button 
           onClick={() => scrollTo(activeIndex + 1)}
           disabled={activeIndex === items.length - 1}
           className={`w-14 h-14 rounded-xl glass-apple flex items-center justify-center text-white pointer-events-auto transition-all ${activeIndex === items.length - 1 ? 'opacity-0 scale-90' : 'opacity-100 hover:scale-110 active:scale-95 hover:bg-white hover:text-black'}`}
         >
            <ChevronRight size={24} />
         </button>
      </div>

      {/* Decorative Branding / Scroll hint */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 hidden md:flex">
         <span className="text-white/30 text-[9px] uppercase tracking-[0.5em] font-bold">Scroll to Explore</span>
         <div className="w-[1px] h-12 bg-gradient-to-b from-white/40 to-transparent"></div>
      </div>
    </section>
  );
};

export default HeroSlider;
