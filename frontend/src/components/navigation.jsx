import React, { useState } from 'react';


const navLinks = [
  { name: 'About', href: '/about' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Privacy Policy', href: '/privacy' },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    // Main Navigation Container with a top border to match image
    <nav className="bg-white w-full border-t-4 border-teal-600/20 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* ----- Left Side: Brand Logo & Text ----- */}
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-teal-800 tracking-tight">
                🐾&nbsp;&nbsp;&nbsp;Animal Welfare
              </span>
            </a>
          </div>

          {/* ----- Right Side Container ----- */}
          <div className="flex items-center gap-8">
            {/* Navigation Links (Hidden on small mobile screens) */}
            <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="hover:text-teal-600 transition-colors duration-200"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {/* Login Button (Outline) */}
              <a
                href="/login"
                className="px-5 py-2 text-sm font-bold text-teal-600 border border-teal-600 rounded-full hover:bg-teal-600 hover:text-white transition-colors duration-200"
              >
                Login
              </a>
              {/* Sign Up Button (Filled) */}
              <a
                href="/signup"
                className="px-5 py-2 text-sm font-bold text-white bg-teal-600 border border-transparent rounded-full hover:bg-teal-800 shadow-md transition-colors duration-200"
              >
                Sign Up
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col gap-1 focus:outline-none"
              aria-label="Toggle menu"
            >
              <span className={`block w-6 h-0.5 bg-teal-600 transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-teal-600 transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-teal-600 transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>

        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 text-center">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block py-2 px-4 text-sm font-semibold text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;