import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { 
    FaSearch, FaBuilding, FaTrash, FaCheckCircle, 
    FaMapMarkerAlt, FaEnvelope, FaPhone, FaTimesCircle, FaShieldAlt
} from 'react-icons/fa';
import AdminSidebar from '../../components/AdminSidebar';

const AdminOrganizationManagement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('Admin');
    const [organizations, setOrganizations] = useState([]);
    const [filteredOrgs, setFilteredOrgs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    
    // Stats
    const [stats, setStats] = useState({ total: 0, verified: 0, pending: 0 });
    
    const role = localStorage.getItem('role') || 'system admin';

    useEffect(() => {
        fetchAdminData();
        fetchOrganizations();
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
            } catch (error) { 
                console.error("Failed to fetch admin data:", error); 
            }
        }
    };

    const fetchOrganizations = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/organizations', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setOrganizations(data);
                
                // Calculate stats strictly based on returned data
                setStats({
                    total: data.length,
                    verified: data.filter(org => org.isVerified).length,
                    pending: data.filter(org => !org.isVerified).length
                });
            } else {
                setOrganizations([]);
                setStats({ total: 0, verified: 0, pending: 0 });
            }
        } catch (error) {
            console.error("Error fetching organizations:", error);
            setOrganizations([]);
            setStats({ total: 0, verified: 0, pending: 0 });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Search and Filtering
    useEffect(() => {
        let results = organizations;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            results = results.filter(org => 
                org.organizationName?.toLowerCase().includes(query) || 
                org.city?.toLowerCase().includes(query) ||
                org.registrationNumber?.toLowerCase().includes(query)
            );
        }

        if (filterStatus !== 'All') {
            const isVerif = filterStatus === 'Verified';
            results = results.filter(org => (org.isVerified || false) === isVerif);
        }

        setFilteredOrgs(results);
    }, [searchQuery, filterStatus, organizations]);

    const handleVerify = async (id) => {
        if (!window.confirm('Are you sure you want to verify this organization?')) return;
        
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/organizations/${id}/verify`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
                // Update local state
                setOrganizations(orgs => orgs.map(org => 
                    org._id === id ? { ...org, isVerified: true } : org
                ));
            }
        } catch (error) {
            console.error('Failed to verify:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('WARNING: This will permanently delete this organization and all associated pets and events. Continue?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/organizations/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setOrganizations(orgs => orgs.filter(org => org._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    };

    return (
        <div className="flex h-screen bg-[#f9fdfc] font-sans overflow-hidden">
            
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                
                {/* Admin Top Header */}
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
                        
                        {/* Header & Stats */}
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Organization Management</h1>
                            <p className="text-slate-500 mb-8">Oversee registered animal shelters, NGOs, and rescue groups.</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl shrink-0">
                                        <FaBuilding />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 font-semibold text-sm">Total Organizations</p>
                                        <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-2xl shrink-0">
                                        <FaCheckCircle />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 font-semibold text-sm">Verified Shelters</p>
                                        <p className="text-3xl font-black text-slate-900">{stats.verified}</p>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-2xl shrink-0">
                                        <FaShieldAlt />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 font-semibold text-sm">Pending Verification</p>
                                        <p className="text-3xl font-black text-slate-900">{stats.pending}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Controls (Search & Filter) */}
                        <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="w-full md:w-96 flex items-center bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
                                <FaSearch className="text-slate-400 mr-3" />
                                <input 
                                    type="text" 
                                    placeholder="Search by name, city, or Reg No..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent focus:outline-none text-sm text-slate-700"
                                />
                            </div>

                            <div className="w-full md:w-auto flex gap-2 overflow-x-auto">
                                {['All', 'Verified', 'Pending'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${
                                            filterStatus === status 
                                                ? 'bg-slate-900 text-white' 
                                                : 'bg-gray-50 text-slate-600 hover:bg-gray-100 border border-gray-100'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Organization Details</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Location & Contact</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Manager</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider text-center">Status</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center text-slate-400">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                                                    Loading organizations...
                                                </td>
                                            </tr>
                                        ) : filteredOrgs.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center text-slate-500 font-medium">
                                                    No organizations found matching your criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredOrgs.map((org) => (
                                                <tr key={org._id} className="hover:bg-slate-50/50 transition-colors">
                                                    
                                                    {/* Org Details */}
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                                                                <FaBuilding />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900">{org.organizationName}</p>
                                                                <p className="text-xs text-slate-500 font-medium mt-0.5">Reg: {org.registrationNumber || 'N/A'}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Location & Contact */}
                                                    <td className="py-4 px-6">
                                                        <div className="space-y-1.5">
                                                            <p className="text-sm text-slate-700 flex items-center gap-2">
                                                                <FaMapMarkerAlt className="text-slate-400" /> {org.city}
                                                            </p>
                                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                                <FaPhone className="text-slate-400" /> {org.contact?.phone || 'N/A'}
                                                            </p>
                                                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                                                <FaEnvelope className="text-slate-400" /> {org.contact?.email || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    {/* Manager Info */}
                                                    <td className="py-4 px-6">
                                                        <p className="text-sm font-semibold text-slate-700">{org.manager?.name || 'Unknown'}</p>
                                                        <p className="text-xs text-slate-500">Joined {new Date(org.createdAt).toLocaleDateString()}</p>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="py-4 px-6 text-center">
                                                        {org.isVerified ? (
                                                            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md border border-green-100">
                                                                <FaCheckCircle /> Verified
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-md border border-orange-100">
                                                                <FaTimesCircle /> Pending
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-4 px-6 text-right space-x-2">
                                                        {!org.isVerified && (
                                                            <button 
                                                                onClick={() => handleVerify(org._id)}
                                                                className="p-2 bg-teal-50 text-teal-600 rounded-lg hover:bg-teal-100 transition-colors shadow-sm"
                                                                title="Verify Organization"
                                                            >
                                                                <FaCheckCircle size={16} />
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleDelete(org._id)}
                                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                                                            title="Delete Organization"
                                                        >
                                                            <FaTrash size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Inline CSS for Custom Scrollbar */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}} />
        </div>
    );
};

export default AdminOrganizationManagement;