import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { FaSearch, FaBell, FaTrash, FaPlus, FaExclamationTriangle, FaMapMarkerAlt } from 'react-icons/fa';
import AdminSidebar from '../../components/AdminSidebar';
import AdminAlertModal from '../../components/modals/AdminAlertModal';

const AdminAlertManagement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('Admin');
    const [alerts, setAlerts] = useState([]);
    const [filteredAlerts, setFilteredAlerts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ total: 0, outbreaks: 0, lostPets: 0 });
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);

    const role = localStorage.getItem('role') || 'system admin';

    useEffect(() => {
        fetchAdminData();
        fetchAlerts();
    }, []);

    const fetchAdminData = async () => {
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
            } catch (error) { console.error("Failed to fetch admin data:", error); }
        }
    };

    const fetchAlerts = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/alerts/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setAlerts(data);
                
                setStats({
                    total: data.length,
                    outbreaks: data.filter(a => a.type === 'Disease Outbreak').length,
                    lostPets: data.filter(a => a.type === 'Lost Pet').length
                });
            } else {
                setAlerts([]);
            }
        } catch (error) {
            console.error("Error fetching alerts:", error);
            setAlerts([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Search
    useEffect(() => {
        if (!searchQuery) {
            setFilteredAlerts(alerts);
            return;
        }
        const query = searchQuery.toLowerCase();
        const results = alerts.filter(a => 
            a.type?.toLowerCase().includes(query) || 
            a.message?.toLowerCase().includes(query)
        );
        setFilteredAlerts(results);
    }, [searchQuery, alerts]);

    const handleDelete = async (id) => {
        if (!window.confirm('WARNING: Are you sure you want to delete this alert?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/alerts/admin/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                fetchAlerts();
            }
        } catch (error) {
            console.error('Failed to delete alert:', error);
        }
    };

    const handleSaveAlert = async (formData) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/alerts`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchAlerts();
                setIsModalOpen(false);
            } else {
                alert('Failed to create alert.');
            }
        } catch (err) { console.error(err); }
    };

    return (
        <div className="flex h-screen bg-[#f9fdfc] font-sans overflow-hidden">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Admin Header */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 shrink-0">
                    <button className="md:hidden p-2 text-slate-500 hover:bg-gray-50 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <div className="flex-1"></div>
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

                <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-8">
                        
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">Alert Management</h1>
                                <p className="text-slate-500">Monitor and broadcast emergency notifications to the community.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full transition-colors shadow-sm whitespace-nowrap">
                                <FaPlus /> Create Alert
                            </button>
                        </div>
                            
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl shrink-0">
                                    <FaBell />
                                </div>
                                <div>
                                    <p className="text-slate-500 font-semibold text-sm">Total Alerts</p>
                                    <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-2xl shrink-0">
                                    <FaExclamationTriangle />
                                </div>
                                <div>
                                    <p className="text-slate-500 font-semibold text-sm">Disease Outbreaks</p>
                                    <p className="text-3xl font-black text-slate-900">{stats.outbreaks}</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-2xl shrink-0">
                                    <FaSearch />
                                </div>
                                <div>
                                    <p className="text-slate-500 font-semibold text-sm">Lost Pets</p>
                                    <p className="text-3xl font-black text-slate-900">{stats.lostPets}</p>
                                </div>
                            </div>
                        </div>

                        {/* Search Control */}
                        <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100">
                            <div className="w-full flex items-center bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
                                <FaSearch className="text-slate-400 mr-3" />
                                <input 
                                    type="text" 
                                    placeholder="Search alerts by type or message..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent focus:outline-none text-sm text-slate-700"
                                />
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[900px]">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Alert Type</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Message</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Location</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center text-slate-400">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                                                    Loading alerts...
                                                </td>
                                            </tr>
                                        ) : filteredAlerts.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center text-slate-500 font-medium">
                                                    No alerts found matching your criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredAlerts.map((alert) => {
                                                const isExpired = new Date(alert.expiresAt) < new Date();
                                                return (
                                                <tr key={alert._id} className={`hover:bg-slate-50/50 transition-colors ${isExpired ? 'opacity-50' : ''}`}>
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase border ${
                                                            alert.type === 'Disease Outbreak' ? 'bg-red-50 text-red-700 border-red-200' :
                                                            alert.type === 'Lost Pet' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                            'bg-blue-50 text-blue-700 border-blue-200'
                                                        }`}>
                                                            {alert.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <p className="text-sm font-medium text-slate-800 line-clamp-2 max-w-md">{alert.message}</p>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {alert.location?.coordinates ? (
                                                            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                                                                <FaMapMarkerAlt className="text-slate-400" />
                                                                {alert.location.coordinates[1].toFixed(3)}, {alert.location.coordinates[0].toFixed(3)}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-slate-400">System Wide</span>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        {isExpired ? (
                                                            <span className="text-xs font-bold text-gray-500">Expired</span>
                                                        ) : (
                                                            <div className="flex flex-col">
                                                                <span className="text-xs font-bold text-green-600">Active</span>
                                                                <span className="text-[10px] text-slate-400 mt-0.5">Until {new Date(alert.expiresAt).toLocaleDateString()}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6 text-right">
                                                        <button onClick={() => handleDelete(alert._id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-sm">
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            )})
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <AdminAlertModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveAlert} 
            />

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}} />
        </div>
    );
};

export default AdminAlertManagement;