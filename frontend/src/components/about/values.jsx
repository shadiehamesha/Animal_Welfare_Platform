import React from 'react';
import { FaHeart } from 'react-icons/fa';

const valuesData = [
  {
    icon: <FaHeart className="text-slate-900" />,
    iconBg: 'bg-red-50',
    title: 'Compassion First',
    description: 'We believe every animal deserves love, care, and a safe environment. Our actions are driven by deep empathy for all living beings.'
  },
  {
    icon: '🤝', 
    iconBg: 'bg-blue-50',
    title: 'Community Power',
    description: 'Real change happens when we work together. We connect volunteers, shelters, vets, and animal lovers to create a powerful network of care.'
  },
  {
    icon: '🛡️',
    iconBg: 'bg-green-50',
    title: 'Trusted Care',
    description: 'We verify shelters and hospitals to ensure the highest standards of safety, transparency, and medical care for every animal we help.'
  }
];

const AboutValues = () => {
  return (
    <section className="bg-white py-24 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Content */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
            What We Stand For
          </h2>
          <p className="text-slate-500 text-lg">
            Our core values guide every decision we make and every feature we build.
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {valuesData.map((value, index) => (
            <div 
              key={index}
              className="bg-white border border-gray-100 rounded-[2rem] p-8 md:p-10 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Icon Circle */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl mb-8 ${value.iconBg}`}>
                {value.icon}
              </div>

              {/* Text Content */}
              <h3 className="text-xl font-bold text-slate-900 mb-4">
                {value.title}
              </h3>
              <p className="text-slate-500 leading-relaxed text-[15px]">
                {value.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default AboutValues;