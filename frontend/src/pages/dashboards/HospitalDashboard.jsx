import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../../components/navigation.jsx';
import Footer from '../../components/footer.jsx';

const HospitalDashboard = () => {
    const [userName, setUserName] = useState('Hospital');
    const role = localStorage.getItem('role') || 'hospitals/veterinarians';

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    const res = await fetch(`http://localhost:5000/api/users/${decoded.id}`, { headers: { Authorization: `Bearer ${token}` } });
                    if (res.ok) {
                        const data = await res.json();
                        setUserName(data.name);
                    }
                } catch (error) { console.error("Failed to fetch user data", error); }
            }
        };
        fetchUserData();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Dr. {userName} / Clinic</h1>
                            <p className="text-teal-600 font-medium capitalize flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-teal-500"></span>{role}
                            </p>
                        </div>
                        <button className="bg-slate-900 hover:bg-black text-white font-semibold py-3 px-6 rounded-full transition-colors shadow-sm w-max">
                            View Schedule
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Today's Appointments</h2>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                                    <div>
                                        <p className="font-bold text-slate-800">Bella (Golden Retriever)</p>
                                        <p className="text-sm text-slate-500">Routine Checkup</p>
                                    </div>
                                    <span className="bg-teal-100 text-teal-800 text-xs font-bold px-3 py-1 rounded-full">10:00 AM</span>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl">
                                    <div>
                                        <p className="font-bold text-slate-800">Stray Cat #142</p>
                                        <p className="text-sm text-red-600">Emergency / Rescue drop-off</p>
                                    </div>
                                    <span className="bg-red-200 text-red-900 text-xs font-bold px-3 py-1 rounded-full">11:30 AM</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-[#eafff5] p-8 rounded-[2rem] border border-teal-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-white text-teal-600 rounded-full flex items-center justify-center text-2xl mb-4 shadow-sm">🩺</div>
                            <h3 className="text-lg font-bold text-teal-900 mb-2">Available for Emergencies</h3>
                            <p className="text-teal-700 text-sm mb-6">Your status is currently set to accepting emergency rescues.</p>
                            <button className="bg-white text-teal-700 border border-teal-200 font-semibold py-2 px-6 rounded-full hover:bg-teal-50 transition-colors">
                                Change Status
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default HospitalDashboard;