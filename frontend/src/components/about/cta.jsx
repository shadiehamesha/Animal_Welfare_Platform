// frontend/src/components/about/cta.jsx
import React from 'react';
import { FaPaw } from 'react-icons/fa';

const AboutCTA = () => {
  return (
    <section className="relative bg-[#0d9488] py-24 px-4 sm:px-6 lg:px-8 font-sans overflow-hidden mt-24">
      
      {/* ----- Floating Decorative Paws ----- */}
      {/* Top Left */}
      <div className="absolute top-8 left-8 md:top-12 md:left-20 text-slate-900 opacity-20">
        <FaPaw className="text-4xl -rotate-12 mb-2 ml-4" />
        <FaPaw className="text-6xl -rotate-12" />
      </div>
      
      {/* Bottom Left */}
      <div className="absolute bottom-16 left-1/4 md:left-48 text-slate-900 opacity-20 hidden sm:block">
        <FaPaw className="text-3xl rotate-12 mb-1" />
        <FaPaw className="text-5xl rotate-12 ml-6" />
      </div>

      {/* Center Right */}
      <div className="absolute top-1/3 right-1/4 md:right-1/3 text-slate-900 opacity-20 hidden md:block">
        <FaPaw className="text-4xl rotate-45" />
      </div>

      {/* Bottom Right */}
      <div className="absolute bottom-10 right-10 md:bottom-20 md:right-32 text-slate-900 opacity-20">
        <FaPaw className="text-5xl -rotate-12 mb-2 ml-6" />
        <FaPaw className="text-7xl -rotate-12" />
      </div>


      {/* ----- Main Content ----- */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
          Ready to make a difference?
        </h2>
        
        <p className="text-teal-50 text-lg md:text-xl max-w-2xl leading-relaxed mb-10">
          Join thousands of animal lovers making the world a better place for our furry friends.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <button className="w-full sm:w-auto bg-[#1e293b] hover:bg-slate-900 text-white font-semibold py-3.5 px-8 rounded-full transition-colors shadow-lg">
            Get Started
          </button>
          <button className="w-full sm:w-auto border border-white text-white font-semibold py-3.5 px-8 rounded-full hover:bg-white/10 transition-colors">
            Learn More
          </button>
        </div>

      </div>
    </section>
  );
};

export default AboutCTA;