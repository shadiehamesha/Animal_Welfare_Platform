import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { FaPills, FaEdit, FaTrash, FaReply, FaStar, FaStore, FaPlus } from 'react-icons/fa';
import PharmacyModal from '../../components/modals/PharmacyModal';
import MedicineModal from '../../components/modals/MedicineModal';
import UserContactWidget from '../../components/UserContactWidget';
import Navbar from '../../components/navigation';
import Footer from '../../components/footer';

const PharmacyDashboard = () => {
    const [userName, setUserName] = useState('');
    const [userId, setUserId] = useState('');
    const [pharmacy, setPharmacy] = useState(null);
    const [medicines, setMedicines] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modals & States
    const [isPharmacyModalOpen, setIsPharmacyModalOpen] = useState(false);
    const [isMedicineModalOpen, setIsMedicineModalOpen] = useState(false);
    const [selectedMedicine, setSelectedMedicine] = useState(null);
    const [replyText, setReplyText] = useState({});
    const [editingReply, setEditingReply] = useState({});

    useEffect(() => {
        const initializeDashboard = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                const decoded = jwtDecode(token);
                setUserId(decoded.id);
                
                // Fetch User Details
                try {
                    const userRes = await fetch(`http://localhost:5000/api/users/${decoded.id}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        setUserName(userData.name);
                    }
                } catch (err) { console.error(err); }

                await fetchPharmacyData(decoded.id);
            }
        };
        initializeDashboard();
    }, []);

    const fetchPharmacyData = async (managerId) => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            // Fetch Pharmacy Profile
            const pharRes = await fetch('http://localhost:5000/api/pharmacies');
            if (pharRes.ok) {
                const allPharmacies = await pharRes.json();
                const myPharmacy = allPharmacies.find(p => p.manager === managerId || (p.manager && p.manager._id === managerId));
                setPharmacy(myPharmacy || null);

                // If pharmacy exists, fetch inventory
                if (myPharmacy) {
                    const invRes = await fetch('http://localhost:5000/api/medicines/inventory', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (invRes.ok) {
                        const invData = await invRes.json();
                        setMedicines(invData);
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSavePharmacy = async (formData, pharmacyId) => {
        const token = localStorage.getItem('token');
        const url = pharmacyId ? `http://localhost:5000/api/pharmacies/${pharmacyId}` : `http://localhost:5000/api/pharmacies`;
        const method = pharmacyId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsPharmacyModalOpen(false);
                fetchPharmacyData(userId);
            }
        } catch (err) { console.error(err); }
    };

    const handleSaveMedicine = async (formData, medicineId) => {
        const token = localStorage.getItem('token');
        const url = medicineId ? `http://localhost:5000/api/medicines/${medicineId}` : `http://localhost:5000/api/medicines`;
        const method = medicineId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setIsMedicineModalOpen(false);
                fetchPharmacyData(userId);
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteMedicine = async (id) => {
        if (!window.confirm('Are you sure you want to delete this medicine?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/medicines/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchPharmacyData(userId);
        } catch (err) { console.error(err); }
    };

    const openMedicineModal = (medicine = null) => {
        setSelectedMedicine(medicine);
        setIsMedicineModalOpen(true);
    };

    const handleReplyChange = (reviewId, text) => {
        setReplyText(prev => ({ ...prev, [reviewId]: text }));
    };

    const submitReply = async (reviewId) => {
        if (!replyText[reviewId]?.trim()) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/pharmacies/${pharmacy._id}/reviews/${reviewId}/respond`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ response: replyText[reviewId] })
            });
            if (res.ok) {
                setReplyText(prev => ({ ...prev, [reviewId]: '' }));
                setEditingReply(prev => ({ ...prev, [reviewId]: false }));
                fetchPharmacyData(userId);
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteReply = async (reviewId) => {
        if (!window.confirm('Are you sure you want to delete your reply?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/pharmacies/${pharmacy._id}/reviews/${reviewId}/remove-reply`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchPharmacyData(userId);
            }
        } catch (err) { console.error(err); }
    };

    const startEditingReply = (review) => {
        setReplyText(prev => ({ ...prev, [review._id]: review.response }));
        setEditingReply(prev => ({ ...prev, [review._id]: true }));
    };

    const cancelEditingReply = (reviewId) => {
        setEditingReply(prev => ({ ...prev, [reviewId]: false }));
        setReplyText(prev => ({ ...prev, [reviewId]: '' }));
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <main className="flex-grow pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Dashboard Header */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Welcome back, {userName}</h1>
                    <p className="text-slate-500 text-lg">Manage your pharmacy profile, inventory, and customer reviews.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Column: Profile & Widget */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* Pharmacy Profile Card */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 text-2xl">
                                    <FaStore />
                                </div>
                                <button 
                                    onClick={() => setIsPharmacyModalOpen(true)}
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-full transition-colors"
                                >
                                    {pharmacy ? 'Edit Profile' : 'Setup Profile'}
                                </button>
                            </div>
                            
                            {pharmacy ? (
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-1">{pharmacy.name}</h2>
                                    <p className="text-sm text-slate-500 mb-4">{pharmacy.address}, {pharmacy.city}</p>
                                    
                                    <div className="space-y-3 text-sm text-slate-700">
                                        <div className="flex justify-between border-b border-gray-50 pb-2">
                                            <span className="font-semibold text-slate-900">Rating:</span>
                                            <span className="flex items-center gap-1 text-orange-500 font-bold">
                                                <FaStar /> {pharmacy.rating?.toFixed(1) || '0.0'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between border-b border-gray-50 pb-2">
                                            <span className="font-semibold text-slate-900">Hours:</span>
                                            <span>{pharmacy.hours.is24_7 ? '24/7' : `${pharmacy.hours.open} - ${pharmacy.hours.close}`}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-semibold text-slate-900">Phone:</span>
                                            <span>{pharmacy.contact.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-sm text-slate-500 mb-4">You haven't set up your pharmacy profile yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Contact Widget */}
                        <UserContactWidget />
                    </div>

                    {/* Right Column: Inventory & Reviews */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Inventory Section */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-slate-900">Medicine Inventory</h2>
                                <button 
                                    onClick={() => openMedicineModal()}
                                    disabled={!pharmacy}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-full transition-colors disabled:opacity-50"
                                >
                                    <FaPlus /> Add Medicine
                                </button>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-8 text-slate-500">Loading inventory...</div>
                            ) : !pharmacy ? (
                                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100 text-slate-500 font-medium">
                                    Please set up your pharmacy profile first to add inventory.
                                </div>
                            ) : medicines.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100 text-slate-500 font-medium">
                                    No medicines in your inventory. Click "Add Medicine" to get started.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {medicines.map(med => (
                                        <div key={med._id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl bg-gray-50 border border-gray-100 gap-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900">{med.name}</h3>
                                                <p className="text-sm text-slate-500">{med.category} • LKR {med.price.toFixed(2)}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${med.inStock ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                    {med.inStock ? 'In Stock' : 'Out of Stock'}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openMedicineModal(med)} className="p-2 bg-white border border-gray-200 rounded-lg text-slate-600 hover:text-teal-600 hover:border-teal-200 transition-colors"><FaEdit size={16}/></button>
                                                    <button onClick={() => handleDeleteMedicine(med._id)} className="p-2 bg-white border border-gray-200 rounded-lg text-slate-600 hover:text-red-600 hover:border-red-200 transition-colors"><FaTrash size={16}/></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reviews Section */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Customer Reviews</h2>
                            
                            {!pharmacy || !pharmacy.reviews || pharmacy.reviews.length === 0 ? (
                                <div className="text-center py-8 bg-gray-50 rounded-2xl border border-gray-100 text-slate-500 font-medium">
                                    No reviews yet.
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {pharmacy.reviews.map(review => (
                                        <div key={review._id} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className="font-bold text-slate-900">{review.name}</span>
                                                    <div className="flex text-orange-400 mt-1 text-xs">
                                                        {[...Array(5)].map((_, i) => <FaStar key={i} className={i < review.rating ? "text-orange-400" : "text-gray-200"} />)}
                                                    </div>
                                                </div>
                                                <span className="text-xs font-medium text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[15px] text-slate-700 mt-3 mb-4 leading-relaxed">{review.comment}</p>

                                            {review.response && !editingReply[review._id] ? (
                                                <div className="bg-teal-50/50 p-4 rounded-xl border-l-[3px] border-teal-500 mt-4 relative">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <p className="text-xs font-bold flex items-center gap-1.5 text-teal-800">
                                                            <FaReply /> Your Reply
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <button 
                                                                onClick={() => startEditingReply(review)} 
                                                                className="text-teal-600 hover:text-teal-800 text-xs font-bold"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteReply(review._id)} 
                                                                className="text-red-500 hover:text-red-700 text-xs font-bold"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-teal-900">{review.response}</p>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col sm:flex-row gap-3 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                    <input 
                                                        type="text"
                                                        placeholder="Write a reply..."
                                                        value={replyText[review._id] || ''}
                                                        onChange={(e) => handleReplyChange(review._id, e.target.value)}
                                                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm"
                                                    />
                                                    <div className="flex gap-2 shrink-0">
                                                        {editingReply[review._id] && (
                                                            <button 
                                                                onClick={() => cancelEditingReply(review._id)}
                                                                className="px-4 py-2.5 bg-white border border-gray-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => submitReply(review._id)}
                                                            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
                                                        >
                                                            {editingReply[review._id] ? 'Update' : 'Reply'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>

            {/* Modals */}
            <PharmacyModal 
                isOpen={isPharmacyModalOpen} 
                onClose={() => setIsPharmacyModalOpen(false)} 
                onSave={handleSavePharmacy} 
                pharmacy={pharmacy} 
            />
            <MedicineModal 
                isOpen={isMedicineModalOpen} 
                onClose={() => setIsMedicineModalOpen(false)} 
                onSave={handleSaveMedicine} 
                medicine={selectedMedicine} 
            />
            <Footer />
        </div>
    );
};

export default PharmacyDashboard;