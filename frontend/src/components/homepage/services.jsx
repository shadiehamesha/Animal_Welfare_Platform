import React from 'react';

// Data array for easy link and content management
const serviceLinks = [
  {
    title: 'Hospitals',
    description: 'Find 24/7 emergency care and vet clinics near you.',
    icon: '🏥',
    iconBg: 'bg-slate-100',
    link: '/hospitals',
  },
  {
    title: 'Stray Report',
    description: 'Quickly report a stray animal in need of help.',
    icon: '📋',
    iconBg: 'bg-orange-50',
    link: '/report',
  },
  {
    title: 'Shelters',
    description: 'Connect with local shelters and rescue organizations.',
    icon: '🏡',
    iconBg: 'bg-green-50',
    link: '/shelters',
  },
  {
    title: 'Stray Map',
    description: 'View reported strays and safe zones in your area.',
    icon: '📍',
    iconBg: 'bg-red-50',
    link: '/map',
  },
  {
    title: 'Events',
    description: 'Join adoption drives, fundraisers, and meetups.',
    icon: '📅',
    iconBg: 'bg-pink-50',
    link: '/events',
  },
  {
    title: 'Find Medicines',
    description: 'Search for pet medications and availability.',
    icon: '💊',
    iconBg: 'bg-teal-50',
    link: '/medicines',
  },
  {
    title: 'Alerts',
    description: 'Get notified about lost pets and emergencies.',
    icon: '🔔',
    iconBg: 'bg-orange-50',
    link: '/alerts',
  },
  {
    title: 'Community',
    description: 'Discuss, share tips, and meet other pet lovers.',
    icon: '👥',
    iconBg: 'bg-blue-50',
    link: '/community',
  },
  {
    title: 'Pharmacies',
    description: 'Locate specialized veterinary pharmacies.',
    icon: '💉',
    iconBg: 'bg-cyan-50',
    link: '/pharmacies',
  },
  {
    title: 'Animals',
    description: 'Browse profiles of animals looking for homes.',
    icon: '🐱',
    iconBg: 'bg-yellow-50',
    link: '/animals',
  },
];

const Services = () => {
  return (
    <section id="services" className="bg-[#f9fdfc] pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Mapping through the data array to create repeating cards */}
          {serviceLinks.map((service, index) => (
            <div 
              key={index} 
              className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col h-full"
            >
              {/* Icon Container */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-6 ${service.iconBg}`}>
                {service.icon}
              </div>

              {/* Text Content */}
              <h3 className="text-[1.15rem] font-bold text-slate-900 mb-3">
                {service.title}
              </h3>
              <p className="text-slate-500 text-[15px] leading-relaxed mb-8 flex-grow">
                {service.description}
              </p>

              {/* Link */}
              <a 
                href={service.link} 
                className="text-teal-600 font-semibold text-[15px] flex items-center gap-2 hover:text-teal-700 transition-colors w-max"
              >
                Learn more <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default Services;