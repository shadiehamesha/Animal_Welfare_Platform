import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';

const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('Admin');
    const [recentMessages, setRecentMessages] = useState([]);
    const role = localStorage.getItem('role') || 'system admin';

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    // Fetch User info
                    const decoded = jwtDecode(token);
                    const userRes = await fetch(`http://localhost:5000/api/users/${decoded.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        setUserName(userData.name);
                    }

                    // Fetch Recent Messages
                    const msgRes = await fetch('http://localhost:5000/api/contacts', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (msgRes.ok) {
                        const msgData = await msgRes.json();
                        setRecentMessages(msgData.slice(0, 3)); // Get only top 3
                    }
                } catch (error) {
                    console.error("Failed to fetch data", error);
                }
            }
        };
        fetchData();
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
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Messages Widget */}
                            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-900">Recent Messages</h2>
                                    <Link to="/dashboard/admin/contacts" className="text-teal-600 text-sm font-semibold hover:text-teal-700">
                                        View All →
                                    </Link>
                                </div>
                                
                                {recentMessages.length > 0 ? (
                                    <div className="space-y-4">
                                        {recentMessages.map(msg => (
                                            <div key={msg._id} className="p-4 border border-gray-50 bg-gray-50/50 rounded-2xl flex justify-between items-center">
                                                <div className="truncate pr-4">
                                                    <p className="font-semibold text-slate-800 truncate">{msg.subject}</p>
                                                    <p className="text-xs text-slate-500 mt-1">{new Date(msg.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize shrink-0 ${
                                                    msg.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                    msg.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-green-100 text-green-700'
                                                }`}>
                                                    {msg.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center py-6">
                                        <span className="text-3xl mb-2">📭</span>
                                        <p className="text-slate-500 text-sm text-center">No recent messages.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;