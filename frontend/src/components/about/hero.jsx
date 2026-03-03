import React from 'react';
import { FaHeart, FaPaw } from 'react-icons/fa';

const AboutHero = () => {
  return (
    <section className="relative bg-[#f9fdfc] py-20 lg:py-32 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden flex flex-col items-center text-center">
      
      {/* ----- Floating Decorative Elements ----- */}
      {/* Top Left Paws */}
      <div className="absolute top-12 left-6 md:left-24 text-slate-800 opacity-80 hidden sm:block">
        <FaPaw className="text-2xl -rotate-12 mb-1 ml-5" />
        <FaPaw className="text-4xl -rotate-12" />
      </div>
      
      {/* Bottom Left Heart */}
      <FaHeart className="absolute bottom-24 left-10 md:left-32 text-3xl text-slate-900 hidden sm:block" />
      
      {/* Top Right Cat Emoji */}
      <div className="absolute top-16 right-10 md:right-32 text-4xl sm:text-5xl hidden sm:block animate-[bounce_4s_infinite]">
        🐈
      </div>
      
      {/* Bottom Right Dog Emoji */}
      <div className="absolute bottom-12 right-6 md:right-28 text-5xl sm:text-6xl hidden sm:block animate-[bounce_5s_infinite]">
        🐕
      </div>


      {/* ----- Main Content ----- */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Top Badge */}
        <div className="bg-[#eafff5] text-teal-700 font-bold text-sm px-5 py-2 rounded-full mb-8">
          Our Story
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-[4.5rem] font-medium text-slate-900 leading-[1.15] mb-6 max-w-5xl tracking-tight">
          Building a world where every <br className="hidden md:block" />
          <span className="text-teal-600">paw finds a home</span>
        </h1>

        {/* Sub-headline */}
        <p className="text-slate-500 text-lg md:text-xl max-w-3xl leading-relaxed mb-10 px-4">
          We are a community-driven platform dedicated to connecting animals in need with people who care. From stray rescues to adoption, we're here to make a difference—one paw at a time.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full sm:w-auto">
          <button className="w-full sm:w-auto bg-[#0d9488] hover:bg-teal-700 text-white font-bold py-3.5 px-8 rounded-full transition-colors shadow-md">
            Join Our Community
          </button>
          <button className="w-full sm:w-auto border border-teal-600 text-teal-600 font-bold py-3.5 px-8 rounded-full hover:bg-teal-50 transition-colors">
            View Our Impact
          </button>
        </div>

        {/* Stats Bar */}
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <div className="bg-white border border-gray-100 shadow-sm rounded-full px-6 py-3 flex items-center gap-3">
            <span className="text-teal-600 font-bold text-lg">12k+</span>
            <span className="text-slate-500 text-sm font-medium">animals helped</span>
          </div>
          <div className="bg-white border border-gray-100 shadow-sm rounded-full px-6 py-3 flex items-center gap-3">
            <span className="text-teal-600 font-bold text-lg">850+</span>
            <span className="text-slate-500 text-sm font-medium">shelters</span>
          </div>
          <div className="bg-white border border-gray-100 shadow-sm rounded-full px-6 py-3 flex items-center gap-3">
            <span className="text-teal-600 font-bold text-lg">50k+</span>
            <span className="text-slate-500 text-sm font-medium">members</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default AboutHero;