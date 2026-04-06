import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('Admin');
    const role = localStorage.getItem('role') || 'system admin';
    const navigate = useNavigate();

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-[#f9fdfc] font-sans overflow-hidden">
            
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 z-20 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 z-30 transform transition-transform duration-300 md:relative md:translate-x-0 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-20 flex items-center px-8 border-b border-gray-100">
                    <span className="text-xl font-bold text-teal-800 tracking-tight">🐾 meoWoof</span>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <a href="#" className="flex items-center gap-3 px-4 py-3 bg-[#eafff5] text-teal-700 rounded-xl font-semibold transition-colors">
                        📊 Dashboard
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-gray-50 hover:text-teal-600 rounded-xl font-medium transition-colors">
                        👥 Manage Users
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-gray-50 hover:text-teal-600 rounded-xl font-medium transition-colors">
                        🏥 Verify Facilities
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-gray-50 hover:text-teal-600 rounded-xl font-medium transition-colors">
                        ⚙️ System Settings
                    </a>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 bg-red-50 border border-red-500 hover:bg-red-100 hover:border-red-600 rounded-xl font-bold transition-colors">
                        Logout
                    </button>
                </div>
            </aside>

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
                        
                        {/* Widgets Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
                                <div className="text-slate-500 text-sm font-medium mb-2">Total Users</div>
                                <div className="text-3xl font-bold text-slate-900">1,248</div>
                                <div className="text-teal-600 text-sm font-medium mt-2">↑ 12% this week</div>
                            </div>
                            <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
                                <div className="text-slate-500 text-sm font-medium mb-2">Pending Verifications</div>
                                <div className="text-3xl font-bold text-slate-900">24</div>
                                <div className="text-orange-500 text-sm font-medium mt-2">Requires attention</div>
                            </div>
                            <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
                                <div className="text-slate-500 text-sm font-medium mb-2">Active Strays Reported</div>
                                <div className="text-3xl font-bold text-slate-900">156</div>
                                <div className="text-slate-400 text-sm font-medium mt-2">Across 12 regions</div>
                            </div>
                            <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm">
                                <div className="text-slate-500 text-sm font-medium mb-2">System Health</div>
                                <div className="text-3xl font-bold text-teal-600">99.9%</div>
                                <div className="text-slate-400 text-sm font-medium mt-2">All services operational</div>
                            </div>
                        </div>

                        {/* Large Placeholder Widget */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Recent System Activity</h2>
                            <div className="space-y-4">
                                {[1, 2, 3].map((item) => (
                                    <div key={item} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">🔔</div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">New Shelter Registration</p>
                                                <p className="text-xs text-slate-500">Pawsitive Rescue submitted documents.</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-400">2h ago</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;