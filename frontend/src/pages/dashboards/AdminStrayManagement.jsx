import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { FaSearch, FaTrash, FaCheckCircle, FaTimesCircle, FaPaw, FaMapMarkerAlt, FaCamera, FaTimes, FaExclamationCircle } from 'react-icons/fa';
import AdminSidebar from '../../components/AdminSidebar';

const AdminStrayManagement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('Admin');
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    
    // Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [reviewActionLoading, setReviewActionLoading] = useState(false);
    
    // Stats
    const [stats, setStats] = useState({ total: 0, pendingClaims: 0, verified: 0 });
    
    const role = localStorage.getItem('role') || 'system admin';

    useEffect(() => {
        fetchAdminData();
        fetchReports();
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

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/reports/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setReports(data);
                
                setStats({
                    total: data.length,
                    pendingClaims: data.filter(r => r.claimStatus === 'Pending Review').length,
                    verified: data.filter(r => r.claimStatus === 'Verified').length
                });
            } else {
                setReports([]);
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
            setReports([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Search and Filtering
    useEffect(() => {
        let results = reports;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            results = results.filter(r => 
                r.species?.toLowerCase().includes(query) || 
                r.description?.toLowerCase().includes(query) ||
                r.reporter?.name?.toLowerCase().includes(query)
            );
        }

        if (filterStatus !== 'All') {
            if (filterStatus === 'Active') results = results.filter(r => r.status === 'Active' && r.claimStatus !== 'Pending Review');
            if (filterStatus === 'Pending Review') results = results.filter(r => r.claimStatus === 'Pending Review');
            if (filterStatus === 'Verified') results = results.filter(r => r.claimStatus === 'Verified');
        }

        setFilteredReports(results);
    }, [searchQuery, filterStatus, reports]);

    const handleDelete = async (id) => {
        if (!window.confirm('WARNING: This will permanently delete this report. Continue?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/reports/admin/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                fetchReports();
            }
        } catch (error) {
            console.error('Failed to delete report:', error);
        }
    };

    const openReviewModal = (report) => {
        setSelectedReport(report);
        setIsReviewModalOpen(true);
    };

    const handleReviewAction = async (action) => {
        if (!selectedReport) return;
        setReviewActionLoading(true);

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/reports/admin/${selectedReport._id}/claim`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ action })
            });

            if (res.ok) {
                setIsReviewModalOpen(false);
                fetchReports();
            } else {
                alert('Failed to process claim.');
            }
        } catch (error) {
            console.error(`Failed to ${action} claim:`, error);
        } finally {
            setReviewActionLoading(false);
        }
    };

    const getStatusBadge = (report) => {
        if (report.claimStatus === 'Pending Review') {
            return (
                <span className="inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 text-xs font-bold px-2.5 py-1 rounded-md border border-yellow-200">
                    <FaExclamationCircle /> Pending Claim
                </span>
            );
        }
        if (report.claimStatus === 'Verified') {
            return (
                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-md border border-green-200">
                    <FaCheckCircle /> Verified
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-200">
                Active Report
            </span>
        );
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
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Stray Reports & Claims</h1>
                            <p className="text-slate-500 mb-8">Manage active stray reports and verify user claims for found animals.</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shrink-0">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 font-semibold text-sm">Total Reports</p>
                                        <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-yellow-50 text-yellow-600 flex items-center justify-center text-2xl shrink-0">
                                        <FaExclamationCircle />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 font-semibold text-sm">Pending Claims</p>
                                        <p className="text-3xl font-black text-slate-900">{stats.pendingClaims}</p>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-2xl shrink-0">
                                        <FaCheckCircle />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 font-semibold text-sm">Verified Matches</p>
                                        <p className="text-3xl font-black text-slate-900">{stats.verified}</p>
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
                                    placeholder="Search species, description..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent focus:outline-none text-sm text-slate-700"
                                />
                            </div>

                            <div className="w-full md:w-auto flex gap-2 overflow-x-auto">
                                {['All', 'Active', 'Pending Review', 'Verified'].map(status => (
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
                                <table className="w-full text-left border-collapse min-w-[900px]">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Report Info</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Location / Date</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Submitted By</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider text-center">Status</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center text-slate-400">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                                                    Loading reports...
                                                </td>
                                            </tr>
                                        ) : filteredReports.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center text-slate-500 font-medium">
                                                    No reports found matching your criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredReports.map((report) => (
                                                <tr key={report._id} className="hover:bg-slate-50/50 transition-colors">
                                                    
                                                    {/* Report Info (Photo + Species) */}
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                                                                <img 
                                                                    src={`http://localhost:5000${report.imageUrl}`} 
                                                                    alt="Stray" 
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900 capitalize">{report.species}</p>
                                                                <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1 max-w-[200px]">
                                                                    {report.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Location / Date */}
                                                    <td className="py-4 px-6">
                                                        <div className="space-y-1">
                                                            <p className="text-sm text-slate-700 flex items-center gap-2 font-mono text-xs">
                                                                <FaMapMarkerAlt className="text-slate-400 text-sm" /> 
                                                                {report.location.coordinates[1].toFixed(4)}, {report.location.coordinates[0].toFixed(4)}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {new Date(report.createdAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </td>

                                                    {/* Reporter */}
                                                    <td className="py-4 px-6">
                                                        <p className="text-sm font-semibold text-slate-700">
                                                            {report.reporter?.name || 'Anonymous User'}
                                                        </p>
                                                        {report.reporter?.email && (
                                                            <p className="text-xs text-slate-500">{report.reporter.email}</p>
                                                        )}
                                                    </td>

                                                    {/* Status Badge */}
                                                    <td className="py-4 px-6 text-center">
                                                        {getStatusBadge(report)}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                                        {report.claimStatus === 'Pending Review' && (
                                                            <button 
                                                                onClick={() => openReviewModal(report)}
                                                                className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors shadow-sm text-sm font-bold border border-yellow-200"
                                                            >
                                                                Review Claim
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleDelete(report._id)}
                                                            className="p-2.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                                                            title="Delete Report"
                                                        >
                                                            <FaTrash size={14} />
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

            {/* Claim Review Modal */}
            {isReviewModalOpen && selectedReport && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Review Animal Claim</h2>
                                <p className="text-sm text-slate-500 mt-1">Compare the original report with the provided proof.</p>
                            </div>
                            <button onClick={() => setIsReviewModalOpen(false)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-gray-50 hover:text-slate-800 transition-colors shrink-0">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto p-8 custom-scrollbar bg-slate-50/30">
                            
                            {/* Comparison Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                
                                {/* Original Report */}
                                <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FaCamera className="text-slate-400" />
                                        <h3 className="font-bold text-slate-800">Original Report Photo</h3>
                                    </div>
                                    <img 
                                        src={`http://localhost:5000${selectedReport.imageUrl}`} 
                                        alt="Original Stray" 
                                        className="w-full h-64 object-cover rounded-xl border border-gray-100 mb-4"
                                    />
                                    <div className="text-sm text-slate-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        <p><strong className="text-slate-800">Reported By:</strong> {selectedReport.reporter?.name || 'Anonymous'}</p>
                                        <p><strong className="text-slate-800">Species:</strong> {selectedReport.species}</p>
                                        <p className="mt-2 text-slate-500">{selectedReport.description}</p>
                                    </div>
                                </div>

                                {/* User's Proof */}
                                <div className="bg-white rounded-2xl p-5 border border-yellow-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-yellow-200">
                                        PENDING APPROVAL
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <FaCheckCircle className="text-yellow-500" />
                                        <h3 className="font-bold text-slate-800">Claimant's Proof</h3>
                                    </div>
                                    <img 
                                        src={`http://localhost:5000${selectedReport.claimProofUrl}`} 
                                        alt="Claim Proof" 
                                        className="w-full h-64 object-cover rounded-xl border border-gray-100 mb-4"
                                    />
                                    <div className="text-sm text-slate-600 bg-yellow-50/50 p-3 rounded-xl border border-yellow-100">
                                        <p><strong className="text-slate-800">Claimed By:</strong> {selectedReport.claimedBy?.name || 'Unknown User'}</p>
                                        <p><strong className="text-slate-800">Email:</strong> {selectedReport.claimedBy?.email || 'N/A'}</p>
                                    </div>
                                </div>

                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 pt-4 border-t border-gray-200">
                                <button 
                                    onClick={() => handleReviewAction('reject')}
                                    disabled={reviewActionLoading}
                                    className="flex-1 py-4 bg-white border-2 border-red-200 text-red-600 font-bold rounded-full hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50"
                                >
                                    Reject Claim
                                </button>
                                <button 
                                    onClick={() => handleReviewAction('approve')}
                                    disabled={reviewActionLoading}
                                    className="flex-1 py-4 bg-teal-600 border-2 border-teal-600 text-white font-bold rounded-full hover:bg-teal-700 transition-colors shadow-md disabled:opacity-50"
                                >
                                    {reviewActionLoading ? 'Processing...' : 'Approve & Mark Verified'}
                                </button>
                            </div>
                            <p className="text-center text-xs text-slate-400 mt-4">
                                Approving the claim will remove this animal from the public stray map. Rejecting will delete the proof photo and restore the report to Active status.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Inline CSS for Custom Scrollbar */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}} />
        </div>
    );
};

export default AdminStrayManagement;