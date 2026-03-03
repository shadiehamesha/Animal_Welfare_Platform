import React from 'react';
import { FiLinkedin, FiTwitter, FiGlobe } from 'react-icons/fi';

const teamData = [
  {
    name: 'Dr. Sarah Chen',
    role: 'Co-Founder & Vet',
    bio: 'Veterinarian with 15 years of experience in shelter medicine.',
    avatarEmoji: '👩‍⚕️',
    avatarColor: 'bg-blue-50',
  },
  {
    name: 'Marcus Rivera',
    role: 'Community Lead',
    bio: 'Community builder passionate about connecting people for good.',
    avatarEmoji: '👨‍💻',
    avatarColor: 'bg-[#ffeedb]',
  },
  {
    name: 'Priya Patel',
    role: 'Rescue Operations',
    bio: 'Former shelter director coordinating nationwide rescue efforts.',
    avatarEmoji: '👩‍🔬',
    avatarColor: 'bg-purple-50',
  },
];

const AboutTeam = () => {
  return (
    <section className="bg-white py-8 px-4 sm:px-6 lg:px-8 font-sans mt-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Content */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Meet the Team
          </h2>
          <p className="text-slate-500 text-xl max-w-2xl mx-auto">
            Passionate people dedicated to animal welfare.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {teamData.map((member, index) => (
            <div 
              key={index}
              className="bg-white border border-gray-100 rounded-[2rem] p-10 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              {/* Avatar Circle */}
              <div className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl mb-8 ${member.avatarColor}`}>
                {member.avatarEmoji}
              </div>

              {/* Text Content */}
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {member.name}
              </h3>
              <p className="text-[#0d9488] font-medium text-sm mb-6 tracking-wide">
                {member.role}
              </p>
              <p className="text-slate-500 leading-relaxed text-[15px] mb-8">
                {member.bio}
              </p>

              {/* Social Icons */}
              <div className="flex items-center justify-center gap-4">
                {[<FiLinkedin />, <FiTwitter />, <FiGlobe />].map((icon, i) => (
                  <a href="#" key={i} className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-colors">
                    {icon}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default AboutTeam;