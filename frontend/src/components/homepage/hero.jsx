import React from 'react';
import { FaHeart, FaPaw } from 'react-icons/fa';

const Hero = () => {
  return (
    <section className="bg-white font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          
          {/* ----- Left Column: Text Content ----- */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left gap-6 z-10">
            
            {/* Top Badge */}
            <div className="flex items-center gap-2 bg-white border border-teal-600 shadow-sm rounded-full px-5 py-2 text-sm font-medium text-teal-700 w-max hover:bg-teal-600 hover:text-white transition-colors">
              <FaHeart className="text-teal-700 text-xs" />
              <span>Join our community of animal lovers</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-[2.75rem] sm:text-5xl lg:text-[3.5rem] leading-[1.15] font-normal text-slate-900 tracking-tight">
              Making the world<br />
              safer for every <span className="text-teal-600">paw</span><br />
              and <span className="text-teal-600">claw</span>.
            </h1>

            {/* Sub-headline */}
            <p className="text-gray-500 text-lg max-w-[28rem] leading-relaxed mt-2">
              Report strays, find shelters, discover pet-friendly events, and connect with a community that cares just as much as you do.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mt-2">
              <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 rounded-full font-semibold transition-colors shadow-md">
                Explore Services
              </button>
              <button className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-3.5 rounded-full font-semibold transition-colors">
                Report a Stray
              </button>
            </div>

            {/* Social Proof / Trust Indicators */}
            <div className="flex items-center gap-4 mt-6">
              <div className="flex -space-x-2">
                {/* Simulated Avatar Circles */}
                <div className="w-9 h-9 rounded-full bg-[#e6fcf5] flex items-center justify-center text-sm border-2 border-white z-[4]">🐱</div>
                <div className="w-9 h-9 rounded-full bg-[#e6fcf5] flex items-center justify-center text-sm border-2 border-white z-[3]">🐶</div>
                <div className="w-9 h-9 rounded-full bg-[#e6fcf5] flex items-center justify-center text-sm border-2 border-white z-[2]">🐹</div>
                <div className="w-9 h-9 rounded-full bg-[#e6fcf5] flex items-center justify-center text-sm border-2 border-white z-[1]">🐰</div>
              </div>
              <p className="text-sm text-gray-500 font-medium">Trusted by 10,000+ animal lovers</p>
            </div>
          </div>

          {/* ----- Right Column: Graphic & Floating Cards ----- */}
          <div className="hidden lg:block relative w-full aspect-square max-w-[500px] mx-auto lg:ml-auto mt-10 lg:mt-0">
            
            {/* Large Background Circle */}
            <div className="absolute inset-0 bg-[#e6fcf5] rounded-full scale-105"></div>

            {/* Center Paw Prints */}
            <div className="absolute inset-0 flex items-center justify-center text-[#4a5568]">
              <div className="relative ml-8 mt-8">
                <FaPaw className="text-7xl absolute -top-16 -left-16 -rotate-12 opacity-90" />
                <FaPaw className="text-6xl absolute top-4 left-6 rotate-12 opacity-90" />
              </div>
            </div>

            {/* Floating Card: Cat Emoji (Top Left) */}
            <div className="absolute top-[28%] -left-8 bg-white p-4 rounded-2xl shadow-xl shadow-teal-900/5 flex items-center justify-center z-10 animate-[bounce_4s_infinite]">
              <span className="text-2xl">🐱</span>
            </div>

            {/* Floating Card: Heart Icon (Top Right) */}
            <div className="absolute top-[12%] right-[5%] bg-white p-5 rounded-2xl shadow-xl shadow-teal-900/5 flex items-center justify-center z-10 animate-[bounce_5s_infinite]">
              <FaHeart className="text-slate-900 text-xl" />
            </div>

            {/* Floating Card: Rescued Stats (Bottom Left) */}
            <div className="absolute bottom-[20%] left-0 bg-white px-5 py-4 rounded-2xl shadow-xl shadow-teal-900/5 flex items-center gap-3 z-10">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="font-bold text-sm text-slate-900">12 Strays Rescued</span>
            </div>

            {/* Floating Card: Dog Emoji (Bottom Right) */}
            <div className="absolute bottom-[10%] right-[8%] bg-white p-4 rounded-2xl shadow-xl shadow-teal-900/5 flex items-center justify-center z-10 animate-[bounce_4.5s_infinite]">
              <span className="text-2xl">🐶</span>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;