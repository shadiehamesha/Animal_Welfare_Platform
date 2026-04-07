import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import AdminSidebar from '../../components/AdminSidebar';

const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('Admin');
    const role = localStorage.getItem('role') || 'system admin';

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    const res = await fetch(`http://localhost:5000/api/users/${decoded.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setUserName(data.name);
                    }
                } catch (error) {
                    console.error("Failed to fetch user data", error);
                }
            }
        };
        fetchUserData();
    }, []);

    return (
        <div className="flex h-screen bg-[#f9fdfc] font-sans overflow-hidden">
            
            <AdminSidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Topbar */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 shrink-0">
                    <button 
                        className="md:hidden p-2 text-slate-500 hover:bg-gray-50 rounded-lg"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    
                    <div className="flex-1 md:flex-none"></div>

                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900">{userName}</p>
                            <p className="text-xs font-medium text-teal-600 capitalize">{role}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
                            {userName.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-3xl font-bold text-slate-900 mb-8">System Overview</h1>
                        
                        {/* Empty State */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center text-center">
                            <span className="text-4xl text-slate-300 mb-4">📭</span>
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No data available</h3>
                            <p className="text-slate-500">System analytics and recent activity will appear here.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;