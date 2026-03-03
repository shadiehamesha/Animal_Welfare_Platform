import React from 'react';
import { FiHeart, FiShield } from 'react-icons/fi';

const VisionMission = () => {
  return (
    <section className="bg-white py-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* ----- Left Column: Our Mission ----- */}
          <div className="flex flex-col bg-white rounded-[3rem] p-8 md:p-12">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-[#dcfce7] text-[#0d9488] flex items-center justify-center text-2xl mb-8">
              <FiHeart />
            </div>
            
            {/* Content */}
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              Our Mission
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              To create a seamless, compassionate ecosystem where
              technology bridges the gap between stray animals and
              the help they need. We empower communities to act,
              shelters to operate efficiently, and animals to find the
              love they deserve.
            </p>
          </div>

          {/* ----- Right Column: Our Vision ----- */}
          <div className="flex flex-col bg-white rounded-[3rem] p-8 md:p-12">
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mb-8">
              <FiShield />
            </div>
            
            {/* Content */}
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              Our Vision
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              A world where no animal is left behind. We
              envision cities with zero stray hunger,
              accessible veterinary care for all, and a
              society where compassion for animals is a
              fundamental value.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default VisionMission;