import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Navbar from '../../components/navigation.jsx';
import Footer from '../../components/footer.jsx';

const OrganizationDashboard = () => {
    const [userName, setUserName] = useState('Organization');
    const role = localStorage.getItem('role') || 'organizations/shelters';

    useEffect(() => {
        // Same fetch logic
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
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{userName} Workspace</h1>
                            <p className="text-teal-600 font-medium capitalize flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-teal-500"></span>{role}
                            </p>
                        </div>
                        <button className="bg-[#0d9488] hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-full transition-colors shadow-sm w-max">
                            + List a Pet
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-slate-500 text-sm font-medium mb-2">Available Pets</div>
                            <div className="text-4xl font-bold text-slate-900">42</div>
                            <a href="#" className="inline-block mt-4 text-teal-600 text-sm font-semibold hover:text-teal-700">Manage listings &rarr;</a>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-slate-500 text-sm font-medium mb-2">Adoption Requests</div>
                            <div className="text-4xl font-bold text-slate-900">15</div>
                            <a href="#" className="inline-block mt-4 text-teal-600 text-sm font-semibold hover:text-teal-700">Review applications &rarr;</a>
                        </div>
                        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="text-slate-500 text-sm font-medium mb-2">Upcoming Events</div>
                            <div className="text-4xl font-bold text-slate-900">2</div>
                            <a href="#" className="inline-block mt-4 text-teal-600 text-sm font-semibold hover:text-teal-700">Manage calendar &rarr;</a>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrganizationDashboard;