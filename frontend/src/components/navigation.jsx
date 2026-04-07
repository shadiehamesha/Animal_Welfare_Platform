import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const navLinks = [
  { name: 'About', href: '/about' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Privacy Policy', href: '/privacy' },
];

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    navigate('/login');
  };

  const getDashboardRoute = () => {
    switch (userRole) {
      case 'system admin': return '/dashboard/admin';
      case 'organizations/shelters': return '/dashboard/organization';
      case 'pharmacies': return '/dashboard/pharmacy';
      case 'hospitals/veterinarians': return '/dashboard/hospital';
      default: return '/dashboard/user';
    }
  };

  return (
    <nav className="bg-white w-full font-sans border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="flex items-center gap-2">
              <span className="font-logo text-3xl font-bold text-teal-800 tracking-tight">
                🐾&nbsp;&nbsp;&nbsp;meoWoof
              </span>
            </a>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} className="hover:text-teal-600 transition-colors duration-200">
                  {link.name}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <a href={getDashboardRoute()} className="hidden sm:block px-5 py-2 text-sm font-bold text-teal-600 border border-teal-600 rounded-full hover:bg-teal-600 hover:text-white transition-colors duration-200">
                    Dashboard
                  </a>
                  <button onClick={handleLogout} className="px-5 py-2 text-sm font-bold text-red-600 bg-red-50 border border-red-500 rounded-full hover:bg-red-100 hover:border-red-600 transition-colors duration-200">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <a href="/login" className="px-5 py-2 text-sm font-bold text-teal-600 border border-teal-600 rounded-full hover:bg-teal-600 hover:text-white transition-colors duration-200">
                    Login
                  </a>
                  <a href="/signup" className="px-5 py-2 text-sm font-bold text-white bg-teal-600 border border-transparent rounded-full hover:bg-teal-800 shadow-md transition-colors duration-200">
                    Sign Up
                  </a>
                </>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden flex flex-col gap-1 focus:outline-none">
              <span className={`block w-6 h-0.5 bg-teal-600 transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-teal-600 transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-teal-600 transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 text-center">
            {navLinks.map((link) => (
              <a key={link.name} href={link.href} className="block py-2 px-4 text-sm font-semibold text-gray-600 hover:text-teal-600 hover:bg-teal-50 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
                {link.name}
              </a>
            ))}
            {isLoggedIn && (
               <a href={getDashboardRoute()} className="block py-2 px-4 text-sm font-semibold text-teal-600 hover:bg-teal-50 transition-colors duration-200" onClick={() => setMobileMenuOpen(false)}>
                 Dashboard
               </a>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;