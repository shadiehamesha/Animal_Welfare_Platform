import React from 'react';

const AboutStats = () => {
  return (
    <section className="bg-slate-900 py-24 px-4 sm:px-6 lg:px-8 font-sans mt-24">
      <div className="max-w-6xl mx-auto text-center">
        
        {/* Header Content */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
            Our Impact in Numbers
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Together, we've achieved incredible milestones in animal welfare.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Stat 1 */}
          <div className="flex flex-col items-center">
            <h3 className="text-5xl md:text-6xl font-bold text-teal-400 mb-4">
              12k+
            </h3>
            <p className="text-white font-bold text-lg mb-2">Animals Helped</p>
            <p className="text-slate-400 text-sm">Rescued & rehomed</p>
          </div>

          {/* Stat 2 */}
          <div className="flex flex-col items-center">
            <h3 className="text-5xl md:text-6xl font-bold text-teal-400 mb-4">
              850+
            </h3>
            <p className="text-white font-bold text-lg mb-2">Shelter Partners</p>
            <p className="text-slate-400 text-sm">Across the country</p>
          </div>

          {/* Stat 3 */}
          <div className="flex flex-col items-center">
            <h3 className="text-5xl md:text-6xl font-bold text-teal-400 mb-4">
              50k+
            </h3>
            <p className="text-white font-bold text-lg mb-2">Members</p>
            <p className="text-slate-400 text-sm">Active community</p>
          </div>

          {/* Stat 4 */}
          <div className="flex flex-col items-center">
            <h3 className="text-5xl md:text-6xl font-bold text-teal-400 mb-4">
              24/7
            </h3>
            <p className="text-white font-bold text-lg mb-2">Support</p>
            <p className="text-slate-400 text-sm">Always here to help</p>
          </div>

        </div>

      </div>
    </section>
  );
};

export default AboutStats;