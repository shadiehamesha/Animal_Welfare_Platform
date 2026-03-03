import React from 'react';

const AboutHistory = () => {
  return (
    <section className="bg-white py-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Content */}
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            How We Started
          </h2>
          <p className="text-slate-500 text-lg">
            From a small idea to a nationwide movement.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="relative border-l-2 border-teal-400 ml-4 md:ml-12 pl-8 md:pl-16 space-y-16">
          
          {/* Timeline Item 1 */}
          <div className="relative">
            {/* Timeline Dot */}
            <div className="absolute -left-[44px] md:-left-[76px] top-1 w-3.5 h-3.5 bg-teal-500 rounded-full border-4 border-white box-content"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4">
              <span className="bg-[#eafff5] text-teal-700 text-sm font-bold px-4 py-1.5 rounded-full w-max">
                2020
              </span>
              <h3 className="text-xl font-bold text-slate-900">The Idea</h3>
            </div>
            <p className="text-slate-500 leading-relaxed text-[15px] md:text-base max-w-2xl">
              Founded by a group of veterinarians and animal lovers who saw a gap in how communities connect to care for strays.
            </p>
          </div>

          {/* Timeline Item 2 */}
          <div className="relative">
             {/* Timeline Dot */}
             <div className="absolute -left-[44px] md:-left-[76px] top-1 w-3.5 h-3.5 bg-teal-500 rounded-full border-4 border-white box-content"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4">
              <span className="bg-[#eafff5] text-teal-700 text-sm font-bold px-4 py-1.5 rounded-full w-max">
                2021
              </span>
              <h3 className="text-xl font-bold text-slate-900">First Rescue</h3>
            </div>
            <p className="text-slate-500 leading-relaxed text-[15px] md:text-base max-w-2xl">
              Launched our beta platform and helped rescue over 500 strays in our first year of operation.
            </p>
          </div>

          {/* Timeline Item 3 */}
          <div className="relative">
             {/* Timeline Dot */}
             <div className="absolute -left-[44px] md:-left-[76px] top-1 w-3.5 h-3.5 bg-teal-500 rounded-full border-4 border-white box-content"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4">
              <span className="bg-[#eafff5] text-teal-700 text-sm font-bold px-4 py-1.5 rounded-full w-max">
                2022
              </span>
              <h3 className="text-xl font-bold text-slate-900">Going National</h3>
            </div>
            <p className="text-slate-500 leading-relaxed text-[15px] md:text-base max-w-2xl">
              Expanded our network to 20 major cities, partnering with local shelters and emergency clinics.
            </p>
          </div>

          {/* Timeline Item 4 */}
          <div className="relative">
             {/* Timeline Dot */}
             <div className="absolute -left-[44px] md:-left-[76px] top-1 w-3.5 h-3.5 bg-teal-500 rounded-full border-4 border-white box-content"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 mb-4">
              <span className="bg-[#eafff5] text-teal-700 text-sm font-bold px-4 py-1.5 rounded-full w-max">
                2023
              </span>
              <h3 className="text-xl font-bold text-slate-900">Community Milestone</h3>
            </div>
            <p className="text-slate-500 leading-relaxed text-[15px] md:text-base max-w-2xl">
              Reached 50,000 active community members and launched our mobile app for faster reporting.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

export default AboutHistory;