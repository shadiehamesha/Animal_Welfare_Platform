import React, { useState, useEffect } from 'react';
import Navbar from '../components/navigation.jsx';
import Footer from '../components/footer.jsx';
import AlertCard from '../components/AlertCard.jsx';
import { FaBell, FaShieldAlt } from 'react-icons/fa';

const Alerts = () => {
    const [publicAlerts, setPublicAlerts] = useState([]);
    const [personalAlerts, setPersonalAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState('public'); // 'public' or 'personal'

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);

        const fetchAlerts = async () => {
            setIsLoading(true);
            try {
                // Fetch Community Alerts (Lost Pets, Outbreaks)
                const publicRes = await fetch('http://localhost:5000/api/alerts/public');
                if (publicRes.ok) setPublicAlerts(await publicRes.json());

                // Fetch Personal Reminders if authenticated
                if (token) {
                    const personalRes = await fetch('http://localhost:5000/api/alerts/personal', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (personalRes.ok) setPersonalAlerts(await personalRes.json());
                }
            } catch (error) {
                console.error("Failed to load alerts:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAlerts();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
                        <FaBell />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">Notification Hub</h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">Stay informed about community emergencies, lost pets, and your personal medical reminders.</p>
                </div>

                {/* Tab Navigation */}
                {isLoggedIn && (
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                        <button 
                            onClick={() => setActiveTab('public')}
                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'public' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Community Alerts
                            {publicAlerts.length > 0 && <span className="ml-2 bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px]">{publicAlerts.length}</span>}
                        </button>
                        <button 
                            onClick={() => setActiveTab('personal')}
                            className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${activeTab === 'personal' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            <FaShieldAlt /> My Reminders
                            {personalAlerts.length > 0 && <span className="ml-1 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-[10px]">{personalAlerts.length}</span>}
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 md:p-8 min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-full py-20">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mb-4"></div>
                            <p className="text-slate-500 font-medium">Checking for updates...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeTab === 'public' ? (
                                publicAlerts.length > 0 ? (
                                    publicAlerts.map(alert => <AlertCard key={alert._id} alert={alert} />)
                                ) : (
                                    <div className="text-center py-16">
                                        <span className="text-5xl mb-4 block opacity-30">✅</span>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">All Clear</h3>
                                        <p className="text-slate-500">There are no active disease outbreaks or lost pet alerts in your area.</p>
                                    </div>
                                )
                            ) : (
                                personalAlerts.length > 0 ? (
                                    personalAlerts.map(alert => <AlertCard key={alert._id} alert={alert} />)
                                ) : (
                                    <div className="text-center py-16">
                                        <span className="text-5xl mb-4 block opacity-30">📅</span>
                                        <h3 className="text-xl font-bold text-slate-800 mb-2">Up to Date</h3>
                                        <p className="text-slate-500">You have no pending immunization reminders. Great job keeping your pets healthy!</p>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Alerts;