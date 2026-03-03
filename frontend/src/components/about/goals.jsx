import React from 'react';
import { FiAward, FiSmile } from 'react-icons/fi';
import { FaHandHoldingHeart } from 'react-icons/fa';

const goalsData = [
  {
    icon: <FiAward />,
    title: 'Zero Stray Hunger',
    description: 'Establishing feeding points in 50 new cities.'
  },
  {
    icon: <FiSmile />,
    title: '10,000 Adoptions',
    description: 'Finding forever homes for rescued pets.'
  },
  {
    icon: <FaHandHoldingHeart />,
    title: 'Volunteer Network',
    description: 'Training 5,000 new volunteers for rescue ops.'
  }
];

const AboutGoals = () => {
  return (
    <section className="bg-white py-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Content */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
            Our Goals for 2026
          </h2>
          <p className="text-slate-500 text-lg">
            We're setting ambitious targets to expand our impact and reach more animals in need.
          </p>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {goalsData.map((goal, index) => (
            <div 
              key={index}
              className="bg-[#f9fdfc] rounded-[2rem] p-10 flex flex-col items-center text-center hover:shadow-md transition-shadow duration-300"
            >
              {/* Icon Circle */}
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl text-[#0d9488] shadow-sm mb-6">
                {goal.icon}
              </div>

              {/* Text Content */}
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {goal.title}
              </h3>
              <p className="text-slate-500 leading-relaxed text-[15px]">
                {goal.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default AboutGoals;