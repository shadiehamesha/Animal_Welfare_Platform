import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import HeatmapWidget from '../../components/HeatmapWidget';

const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('Admin');
    const [recentMessages, setRecentMessages] = useState([]);
    const [token, setToken] = useState('');
    const role = localStorage.getItem('role') || 'system admin';

    // State for platform metrics initialized to 0
    const [metrics, setMetrics] = useState({
        totalReports: 0,
        activeCases: 0,
        resolvedCases: 0,
        partnerHospitals: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                setToken(storedToken); // Save token to state for the HeatmapWidget
                try {
                    // Fetch User info
                    const decoded = jwtDecode(storedToken);
                    const userRes = await fetch(`http://localhost:5000/api/users/${decoded.id}`, {
                        headers: { Authorization: `Bearer ${storedToken}` }
                    });
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        setUserName(userData.name);
                    }

                    // Fetch Recent Messages
                    const msgRes = await fetch('http://localhost:5000/api/contacts', {
                        headers: { Authorization: `Bearer ${storedToken}` }
                    });
                    if (msgRes.ok) {
                        const msgData = await msgRes.json();
                        setRecentMessages(msgData.slice(0, 3)); // Get only top 3
                    }

                    // Fetch Real Dynamic Metrics
                    const hospRes = await fetch('http://localhost:5000/api/hospitals');
                    const hospitals = hospRes.ok ? await hospRes.json() : [];

                    const repRes = await fetch('http://localhost:5000/api/reports/public');
                    const reports = repRes.ok ? await repRes.json() : [];

                    // Update metrics state with actual data from DB
                    setMetrics({
                        totalReports: reports.length, 
                        activeCases: reports.length, 
                        resolvedCases: 0, // This can be updated when a resolved endpoint is implemented
                        partnerHospitals: hospitals.length || 0
                    });

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
                    <div className="max-w-7xl mx-auto space-y-8">
                        
                        <header>
                            <h1 className="text-3xl font-bold text-slate-900">System Overview</h1>
                            <p className="text-slate-500 mt-1">Monitor platform activity and stray animal reports.</p>
                        </header>

                        {/* Key Metrics Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-center">
                                <span className="text-slate-500 text-sm font-medium mb-1">Total Reports</span>
                                <span className="text-3xl font-bold text-teal-600">{metrics.totalReports}</span>
                            </div>
                            
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-center">
                                <span className="text-slate-500 text-sm font-medium mb-1">Active Cases</span>
                                <span className="text-3xl font-bold text-yellow-600">{metrics.activeCases}</span>
                            </div>
                            
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-center">
                                <span className="text-slate-500 text-sm font-medium mb-1">Resolved Cases</span>
                                <span className="text-3xl font-bold text-slate-700">{metrics.resolvedCases}</span>
                            </div>
                            
                            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-center">
                                <span className="text-slate-500 text-sm font-medium mb-1">Partner Hospitals</span>
                                <span className="text-3xl font-bold text-blue-600">{metrics.partnerHospitals}</span>
                            </div>
                        </div>

                        {/* Main Content Grid: Heatmap & Messages */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Geospatial Analytics Section (Takes up 2 columns on large screens) */}
                            <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col">
                                <div className="mb-6">
                                    <h2 className="text-xl font-bold text-slate-900">Geospatial Analytics</h2>
                                    <p className="text-slate-500 text-sm mt-1">Density mapping of reported stray animals to optimize resource allocation.</p>
                                </div>
                                
                                <div className="flex-1 min-h-[400px]">
                                    {token ? (
                                        <HeatmapWidget token={token} />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center rounded-[2rem] bg-slate-50 text-slate-500">
                                            <span className="font-medium">Authenticating...</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Messages Widget */}
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-6 md:p-8 flex flex-col h-full">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-slate-900">Recent Messages</h2>
                                    <Link to="/dashboard/admin/contacts" className="text-teal-600 text-sm font-semibold hover:text-teal-700">
                                        View All →
                                    </Link>
                                </div>
                                
                                {recentMessages.length > 0 ? (
                                    <div className="space-y-4 flex-1">
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