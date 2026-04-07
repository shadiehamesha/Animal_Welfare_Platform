import React from 'react';
import { FaPaw, FaEnvelope, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-[#222b36] text-slate-400 font-sans pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          
          {/* Column 1: Brand & Description */}
          <div className="flex flex-col gap-4 pr-4">
            <div className="flex items-center gap-3 text-white mb-2">
              <FaPaw className="text-xl text-slate-500" />
              <span className="font-logo text-lg font-bold tracking-wide">meoWoof</span>
            </div>
            <p className="text-[15px] leading-relaxed">
              Building a compassionate community for every stray and pet. Join us in making the world a better place for animals.
            </p>
          </div>

          {/* Column 2: Services */}
          <div>
            <h3 className="text-white text-[16px] font-semibold mb-6">Services</h3>
            <ul className="flex flex-col gap-4 text-[15px]">
              <li><a href="/report" className="hover:text-teal-600 transition-colors duration-200">Report a Stray</a></li>
              <li><a href="/hospitals" className="hover:text-teal-600 transition-colors duration-200">Find a Hospital</a></li>
              <li><a href="/shelters" className="hover:text-teal-600 transition-colors duration-200">Animal Shelters</a></li>
              <li><a href="/pharmacies" className="hover:text-teal-600 transition-colors duration-200">Pet Pharmacy</a></li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div>
            <h3 className="text-white text-[16px] font-semibold mb-6">Company</h3>
            <ul className="flex flex-col gap-4 text-[15px]">
              <li><a href="/about" className="hover:text-teal-600 transition-colors duration-200">About Us</a></li>
              <li><a href="/careers" className="hover:text-teal-600 transition-colors duration-200">Careers</a></li>
              <li><a href="/blog" className="hover:text-teal-600 transition-colors duration-200">Blog</a></li>
              <li><a href="/contact" className="hover:text-teal-600 transition-colors duration-200">Contact</a></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h3 className="text-white text-[16px] font-semibold mb-6">Contact</h3>
            <ul className="flex flex-col gap-4 text-[15px]">
              <li className="flex items-center gap-3">
                <FaEnvelope className="text-slate-300" />
                <a href="mailto:hello@animalwelfare.com" className="hover:text-teal-600 transition-colors duration-200">hello@animalwelfare.com</a>
              </li>
              <li className="flex flex-col gap-0">
                <span>123 Pet Lover Lane</span>
                <span>Homagama, Sri Lanka</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Section: Copyright */}
        <div className="flex justify-center items-center text-[15px]">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-12">
            <span>© 2026</span>
            <span className="flex items-center gap-2">
              <span className='font-logo'>meoWoof</span>  Made with <FaHeart className="text-slate-400 text-sm mx-1" /> for animals.
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;