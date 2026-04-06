import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../../components/navigation.jsx';
import Footer from '../../components/footer.jsx';

const UserDashboard = () => {
    const [userName, setUserName] = useState('User');
    const role = localStorage.getItem('role') || 'normal user';

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
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Welcome back, {userName}!</h1>
                            <p className="text-teal-600 font-medium capitalize flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                                {role} Account
                            </p>
                        </div>
                        <button className="bg-[#0d9488] hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-full transition-colors shadow-sm w-max">
                            + Report a Stray
                        </button>
                    </div>

                    {/* Widgets Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center text-xl mb-4">📋</div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">My Reports</h3>
                            <p className="text-slate-500 text-sm mb-4">You have 2 active reports.</p>
                            <a href="#" className="text-teal-600 text-sm font-semibold hover:text-teal-700">View details &rarr;</a>
                        </div>
                        
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-2xl flex items-center justify-center text-xl mb-4">❤️</div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Saved Pets</h3>
                            <p className="text-slate-500 text-sm mb-4">4 pets looking for adoption.</p>
                            <a href="#" className="text-teal-600 text-sm font-semibold hover:text-teal-700">View gallery &rarr;</a>
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-xl mb-4">💬</div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Community</h3>
                            <p className="text-slate-500 text-sm mb-4">3 new replies on your post.</p>
                            <a href="#" className="text-teal-600 text-sm font-semibold hover:text-teal-700">Open forum &rarr;</a>
                        </div>
                    </div>

                    {/* Wide Widget */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Local Alerts Near You</h2>
                        <div className="bg-[#fff8f1] border border-orange-100 p-5 rounded-2xl flex items-start gap-4">
                            <span className="text-2xl mt-1">🚨</span>
                            <div>
                                <h4 className="font-bold text-orange-800 mb-1">Missing Golden Retriever</h4>
                                <p className="text-orange-600 text-sm">Reported 2 miles away. Last seen near Central Park. Please keep an eye out!</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default UserDashboard;