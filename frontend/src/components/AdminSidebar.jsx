import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const AdminSidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-20 md:hidden" 
                    onClick={onClose} 
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 z-30 transform transition-transform duration-300 md:relative md:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-20 flex items-center px-8 border-b border-gray-100 shrink-0">
                    <span className="font-logo text-3xl text-teal-800 tracking-tight">🐾 meoWoof</span>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <Link 
                        to="/dashboard/admin" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isActive('/dashboard/admin') 
                                ? 'bg-[#eafff5] text-teal-700' 
                                : 'text-slate-500 hover:bg-gray-50 hover:text-teal-600'
                        }`}
                    >
                        📊 Dashboard
                    </Link>
                    <Link 
                        to="/dashboard/admin/users" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isActive('/dashboard/admin/users') 
                                ? 'bg-[#eafff5] text-teal-700' 
                                : 'text-slate-500 hover:bg-gray-50 hover:text-teal-600'
                        }`}
                    >
                        👥 Manage Users
                    </Link>
                    <Link 
                        to="/dashboard/admin/contacts" 
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        isActive('/dashboard/admin/contacts') 
                                ? 'bg-[#eafff5] text-teal-700' 
                                : 'text-slate-500 hover:bg-gray-50 hover:text-teal-600'
                        }`}
                    >
                        ✉️ Manage Messages
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-100 shrink-0">
                    <button 
                        onClick={handleLogout} 
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-red-50 border border-red-500 hover:bg-red-100 hover:border-red-600 rounded-xl transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </aside>
        </>
    );
};

export default AdminSidebar;