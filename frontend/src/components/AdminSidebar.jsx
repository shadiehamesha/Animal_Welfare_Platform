import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaHome, FaUsers, FaHospital, FaBuilding, FaEnvelope, FaSignOutAlt, FaPaw, FaShieldAlt, FaCalendarAlt, FaMapMarkerAlt, FaPills, FaBell } from 'react-icons/fa';

const AdminSidebar = ({ isMobileOpen, setIsMobileOpen }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const navLinks = [
        { path: '/dashboard/admin', name: 'Overview', icon: <FaHome /> },
        { path: '/dashboard/admin/users', name: 'Users', icon: <FaUsers /> },
        { path: '/dashboard/admin/organizations', name: 'Organizations', icon: <FaBuilding /> },
        { path: '/dashboard/admin/hospitals', name: 'Hospitals', icon: <FaHospital /> },
        { path: '/dashboard/admin/pharmacies', name: 'Pharmacies', icon: <FaPills /> },
        { path: '/dashboard/admin/strays', name: 'Stray Reports', icon: <FaMapMarkerAlt /> },
        { path: '/dashboard/admin/pets', name: 'Pet Inventory', icon: <FaPaw /> },
        { path: '/dashboard/admin/alerts', name: 'Alerts', icon: <FaBell /> },
        { path: '/dashboard/admin/contacts', name: 'Messages', icon: <FaEnvelope /> },
        { path: '/dashboard/admin/moderation', name: 'Moderation', icon: <FaShieldAlt /> },
        { path: '/dashboard/admin/events', name: 'Event Management', icon: <FaCalendarAlt /> },
    ];

    const sidebarContent = (
        <div className="h-full flex flex-col bg-white border-r border-gray-100 shadow-sm w-64">
            
            {/* Logo Area */}
            <div className="h-20 flex items-center px-8 border-b border-gray-100 shrink-0">
                <div className="flex items-center gap-3 text-teal-600">
                    <FaPaw className="text-3xl" />
                    <span className="text-xl font-black tracking-tight text-slate-900">AdminPanel</span>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar">
                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Management</p>
                
                {navLinks.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        end={link.path === '/dashboard/admin'}
                        onClick={() => setIsMobileOpen && setIsMobileOpen(false)}
                        className={({ isActive }) => `
                            flex items-center gap-3 px-4 py-3 rounded-2xl font-normal transition-all duration-200
                            ${isActive 
                                ? 'bg-teal-50 text-teal-700 shadow-sm' 
                                : 'text-slate-500 hover:bg-gray-50 hover:text-slate-900'
                            }
                        `}
                    >
                        <span className="text-lg">{link.icon}</span>
                        <span>{link.name}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 border-t border-gray-100 shrink-0">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-normal text-red-600 hover:bg-red-50 transition-colors"
                >
                    <FaSignOutAlt className="text-lg" />
                    <span>Log Out</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden lg:block h-screen sticky top-0">
                {sidebarContent}
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden flex">
                    <div 
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <div className="relative w-64 max-w-sm h-full flex flex-col shadow-2xl transform transition-transform">
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminSidebar;