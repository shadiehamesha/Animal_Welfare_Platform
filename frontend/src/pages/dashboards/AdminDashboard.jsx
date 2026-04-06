import React from 'react';
import Navbar from '../../components/navigation.jsx';

const AdminDashboard = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            <div className="flex flex-1 items-center justify-center">
                <h1 className="text-4xl font-bold text-slate-900">System Admin Dashboard</h1>
            </div>
        </div>
    );
};

export default AdminDashboard;