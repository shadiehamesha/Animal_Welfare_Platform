import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { FaStar, FaTimes, FaReply, FaTrash, FaBuilding, FaClock } from 'react-icons/fa';
import AdminSidebar from '../../components/AdminSidebar';
import PharmacyModal from '../../components/modals/PharmacyModal';

const AdminPharmacyManagement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('Admin');
    const [pharmacies, setPharmacies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState({ total: 0, open247: 0, avgRating: 0 });
    
    // Modals
    const [isPharmacyModalOpen, setIsPharmacyModalOpen] = useState(false);
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    
    const itemsPerPage = 6;
    const role = localStorage.getItem('role') || 'system admin';

    useEffect(() => {
        fetchAdminData();
        fetchPharmacies();
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
            } catch (error) { console.error("Error fetching admin data:", error); }
        }
    };

    const fetchPharmacies = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/pharmacies');
            if (res.ok) {
                const data = await res.json();
                setPharmacies(data);
                
                // Calculate Stats
                const total247 = data.filter(p => p.hours?.is24_7).length;
                const totalRating = data.reduce((acc, p) => acc + (p.rating || 0), 0);
                const avg = data.length > 0 ? (totalRating / data.length).toFixed(1) : 0;
                
                setStats({ total: data.length, open247: total247, avgRating: avg });
            }
        } catch (error) { console.error("Error fetching pharmacies:", error); } finally {
            setIsLoading(false);
        }
    };

    const handleSavePharmacy = async (formData, pharmacyId) => {
        const token = localStorage.getItem('token');
        const url = pharmacyId 
            ? `http://localhost:5000/api/pharmacies/${pharmacyId}` 
            : `http://localhost:5000/api/pharmacies`;
        const method = pharmacyId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchPharmacies();
                setIsPharmacyModalOpen(false);
            } else {
                const error = await res.json();
                alert(`Error: ${error.message}`);
            }
        } catch (err) { console.error(err); }
    };

    const handleDeletePharmacy = async (pharmacyId) => {
        if (!window.confirm('Are you sure you want to completely delete this pharmacy and its entire medicine inventory?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/pharmacies/${pharmacyId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if(res.ok) fetchPharmacies();
        } catch (err) { console.error(err); }
    };

    const handleDeleteReview = async (pharmacyId, reviewId) => {
        if (!window.confirm('Delete this review? This action cannot be undone.')) return;
        const token = localStorage.getItem('token');
        
        try {
            const res = await fetch(`http://localhost:5000/api/pharmacies/${pharmacyId}/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if(res.ok) {
                const updatedPharmacies = pharmacies.map(p => {
                    if (p._id === pharmacyId) {
                        return { ...p, reviews: p.reviews.filter(r => r._id !== reviewId) };
                    }
                    return p;
                });
                setPharmacies(updatedPharmacies);
                setSelectedPharmacy(updatedPharmacies.find(p => p._id === pharmacyId));
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteReply = async (pharmacyId, reviewId) => {
        if (!window.confirm('Remove the pharmacy\'s reply from this review?')) return;
        const token = localStorage.getItem('token');
        
        try {
            const res = await fetch(`http://localhost:5000/api/pharmacies/${pharmacyId}/reviews/${reviewId}/remove-reply`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                }
            });
            
            if (res.ok) {
                const updatedPharmacy = await res.json();
                setPharmacies(pharmacies.map(p => p._id === pharmacyId ? updatedPharmacy : p));
                setSelectedPharmacy(updatedPharmacy);
            }
        } catch (err) { console.error(err); }
    };

    const openAddModal = () => {
        setSelectedPharmacy(null);
        setIsPharmacyModalOpen(true);
    };

    const openEditModal = (pharmacy) => {
        setSelectedPharmacy(pharmacy);
        setIsPharmacyModalOpen(true);
    };

    const openReviewModal = async (pharmacy) => {
        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/pharmacies/${pharmacy._id}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedPharmacy(data);
                setIsReviewModalOpen(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPharmacies = pharmacies.filter(p => 
        (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.city && p.city.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPharmacies.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPharmacies.length / itemsPerPage);

    return (
        <div className="flex h-screen bg-[#f9fdfc] font-sans overflow-hidden">
            
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
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
                    <div className="max-w-7xl mx-auto">
                        
                        {/* Header & Add Button */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900">Pharmacy Management</h1>
                                <p className="text-slate-500 mt-1">Oversee registered pharmacies, their ratings, and public reviews.</p>
                            </div>
                            <button onClick={openAddModal} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-full transition-colors shadow-sm whitespace-nowrap">
                                + Add New Pharmacy
                            </button>
                        </div>

                        {/* Stats Widgets */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl shrink-0">
                                    <FaBuilding />
                                </div>
                                <div>
                                    <p className="text-slate-500 font-semibold text-sm">Total Pharmacies</p>
                                    <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shrink-0">
                                    <FaClock />
                                </div>
                                <div>
                                    <p className="text-slate-500 font-semibold text-sm">24/7 Pharmacies</p>
                                    <p className="text-3xl font-black text-slate-900">{stats.open247}</p>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center text-2xl shrink-0">
                                    <FaStar />
                                </div>
                                <div>
                                    <p className="text-slate-500 font-semibold text-sm">Network Avg Rating</p>
                                    <p className="text-3xl font-black text-slate-900">{stats.avgRating}</p>
                                </div>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex items-center">
                            <span className="text-xl pl-2 pr-4 text-slate-400">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Search pharmacies by name or city..." 
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full focus:outline-none text-slate-700 placeholder-slate-400 font-medium bg-transparent"
                            />
                        </div>

                        {/* Pharmacies Grid */}
                        {isLoading ? (
                            <div className="flex justify-center items-center py-20">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                {currentItems.map((p) => (
                                    <div key={p._id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 flex flex-col hover:border-teal-100 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                                                <p className="text-slate-500 text-sm mt-1">{p.city}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2 shrink-0">
                                                <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm font-bold border border-orange-100">
                                                    <FaStar /> <span>{p.rating?.toFixed(1) || '0.0'}</span>
                                                </div>
                                                {p.hours?.is24_7 && (
                                                    <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border border-green-100">
                                                        24/7 Open
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <p className="text-slate-600 text-sm mb-6 line-clamp-2">{p.address}</p>

                                        <div className="mt-auto flex flex-wrap gap-3 pt-4 border-t border-gray-50">
                                            <button onClick={() => openEditModal(p)} className="flex-1 bg-gray-50 hover:bg-gray-100 text-slate-700 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm border border-gray-200 shadow-sm">
                                                Edit Details
                                            </button>
                                            <button onClick={() => openReviewModal(p)} className="flex-1 bg-teal-50 hover:bg-teal-100 text-teal-700 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 border border-teal-100 shadow-sm">
                                                Reviews <span className="bg-teal-600 text-white rounded-full px-2 py-0.5 text-[10px]">{p.numReviews}</span>
                                            </button>
                                            <button onClick={() => handleDeletePharmacy(p._id)} className="w-auto bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 px-4 rounded-xl transition-colors text-sm border border-red-100 shadow-sm" title="Delete Pharmacy">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {currentItems.length === 0 && (
                                    <div className="col-span-1 lg:col-span-2 text-center py-16 bg-white rounded-[2rem] border border-gray-100 shadow-sm">
                                        <span className="text-4xl opacity-50">🏪</span>
                                        <p className="text-slate-500 mt-4 font-medium">No pharmacies found matching your search.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Pagination */}
                        {!isLoading && totalPages > 1 && (
                            <div className="flex justify-center gap-2 mb-8">
                                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">Prev</button>
                                <span className="px-5 py-2.5 text-sm font-bold text-slate-800 bg-gray-50 rounded-xl border border-gray-100">{currentPage} / {totalPages}</span>
                                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors">Next</button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Edit/Add Pharmacy Modal */}
            <PharmacyModal 
                isOpen={isPharmacyModalOpen} 
                onClose={() => setIsPharmacyModalOpen(false)} 
                onSave={handleSavePharmacy} 
                pharmacy={selectedPharmacy} 
            />

            {/* Review Moderation Modal */}
            {isReviewModalOpen && selectedPharmacy && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
                        
                        <div className="flex justify-between items-center mb-6 shrink-0 border-b border-gray-100 pb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">Moderate Reviews</h2>
                                <p className="text-sm text-teal-600 font-semibold mt-1">{selectedPharmacy.name}</p>
                            </div>
                            <button onClick={() => setIsReviewModalOpen(false)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 hover:bg-gray-200 transition-colors">
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto pr-2 custom-scrollbar space-y-4">
                            <div className="bg-orange-50 border border-orange-200 text-orange-800 text-sm p-4 rounded-2xl font-medium mb-4 shadow-sm">
                                <strong>Admin Notice:</strong> You can only remove reviews or pharmacy replies that violate community guidelines. You cannot edit review text.
                            </div>

                            {selectedPharmacy.reviews && selectedPharmacy.reviews.length > 0 ? (
                                selectedPharmacy.reviews.map((review) => (
                                    <div key={review._id} className="border border-gray-200 rounded-2xl p-5 shadow-sm bg-white relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-slate-900 flex items-center gap-2">
                                                    {review.name}
                                                    <span className="text-xs text-slate-400 font-mono font-normal bg-gray-100 px-2 py-0.5 rounded">ID: {review.user?._id || review.user}</span>
                                                </div>
                                                <div className="flex text-orange-400 mt-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar key={i} className={i < review.rating ? "text-orange-400" : "text-gray-200"} />
                                                    ))}
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteReview(selectedPharmacy._id, review._id)}
                                                className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                                            >
                                                Delete Review
                                            </button>
                                        </div>
                                        
                                        <p className="text-slate-700 text-[15px] my-3 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">{review.comment}</p>
                                        <p className="text-xs text-slate-400 mb-4 font-medium">{new Date(review.createdAt).toLocaleDateString()}</p>
                                        
                                        {/* Pharmacy Response Logic */}
                                        {review.response && (
                                            <div className="bg-teal-50/50 border-l-[3px] border-teal-500 rounded-r-xl p-4 mt-2 relative">
                                                <div className="flex justify-between items-start mb-2">
                                                    <p className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                                                        <FaReply /> Pharmacy Response
                                                    </p>
                                                    <button 
                                                        onClick={() => handleDeleteReply(selectedPharmacy._id, review._id)}
                                                        className="text-orange-600 hover:text-orange-800 bg-orange-100 hover:bg-orange-200 px-3 py-1 rounded-lg text-[10px] font-bold transition-colors shadow-sm"
                                                    >
                                                        Remove Reply
                                                    </button>
                                                </div>
                                                <p className="text-teal-900 text-sm leading-relaxed">{review.response}</p>
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
                                    <p className="text-slate-500 font-medium">No reviews for this pharmacy.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up { animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}} />
        </div>
    );
};

export default AdminPharmacyManagement;