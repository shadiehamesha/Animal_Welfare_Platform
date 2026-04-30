import React, { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { FaStar, FaMapMarkerAlt, FaClock, FaPhone, FaTimes, FaSearch, FaReply, FaPills } from "react-icons/fa";
import Navbar from "../components/navigation";
import Footer from "../components/footer";

// Helper component to pan the map
const MapUpdater = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (map && center) {
            map.panTo(center);
            map.setZoom(zoom);
        }
    }, [map, center, zoom]);
    return null;
};

const Pharmacy = () => {
    const [pharmacies, setPharmacies] = useState([]);
    const [filteredPharmacies, setFilteredPharmacies] = useState([]);
    
    const [searchQuery, setSearchQuery] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [is247Filter, setIs247Filter] = useState(false);
    
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
    const [reviewStatus, setReviewStatus] = useState({ loading: false, error: null, success: false });

    const [mapCenter, setMapCenter] = useState({ lat: 7.8731, lng: 80.7718 });
    const [mapZoom, setMapZoom] = useState(7);

    const MAPS_API_KEY = import.meta.env.VITE_MAPS || import.meta.env.VITE_MAPS_API_KEY || "";

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setIsLoggedIn(true);
        fetchPharmacies();
    }, []);

    const fetchPharmacies = async (city = "") => {
        try {
            const url = city 
                ? `http://localhost:5000/api/pharmacies?city=${encodeURIComponent(city)}` 
                : `http://localhost:5000/api/pharmacies`;
                
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setPharmacies(data);
                
                if (data.length > 0 && city) {
                    setMapCenter({ lat: data[0].location.lat, lng: data[0].location.lng });
                    setMapZoom(12);
                } else if (!city) {
                    setMapCenter({ lat: 7.8731, lng: 80.7718 });
                    setMapZoom(7);
                }
            }
        } catch (error) {
            console.error("Error fetching pharmacies:", error);
        }
    };

    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const results = pharmacies.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(lowercasedQuery) || 
                                  p.address.toLowerCase().includes(lowercasedQuery);
            const matches247 = is247Filter ? p.hours.is24_7 : true;
            return matchesSearch && matches247;
        });
        setFilteredPharmacies(results);
    }, [searchQuery, is247Filter, pharmacies]);

    const handleCitySearch = (e) => {
        e.preventDefault();
        fetchPharmacies(cityFilter);
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setCityFilter("");
        setIs247Filter(false);
        fetchPharmacies("");
    };

    const openPharmacyModal = async (pharmacy) => {
        try {
            const res = await fetch(`http://localhost:5000/api/pharmacies/${pharmacy._id}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedPharmacy(data);
                setIsModalOpen(true);
                setReviewStatus({ loading: false, error: null, success: false });
                setReviewForm({ rating: 5, comment: "" });
            }
        } catch (error) {
            console.error("Error fetching pharmacy details:", error);
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        setReviewStatus({ loading: true, error: null, success: false });
        
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`http://localhost:5000/api/pharmacies/${selectedPharmacy._id}/reviews`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(reviewForm)
            });

            const data = await res.json();

            if (res.ok) {
                setReviewStatus({ loading: false, error: null, success: true });
                openPharmacyModal(selectedPharmacy);
            } else {
                setReviewStatus({ loading: false, error: data.message, success: false });
            }
        } catch (error) {
            setReviewStatus({ loading: false, error: "Failed to submit review", success: false });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <main className="flex-grow pt-8 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Header & Search */}
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                        Pet Pharmacy Directory
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mb-8 md:mx-0 mx-auto">
                        Locate verified pharmacies carrying essential pet medications and supplies near you.
                    </p>

                    <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
                        <div className="flex-grow flex items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
                            <FaSearch className="text-slate-400 mr-3 shrink-0" />
                            <input 
                                type="text" 
                                placeholder="Search by name or street..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent focus:outline-none text-slate-700 font-medium"
                            />
                        </div>

                        <form onSubmit={handleCitySearch} className="flex gap-3 w-full md:w-auto">
                            <input 
                                type="text" 
                                placeholder="City (e.g. Colombo)" 
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                                className="w-full md:w-48 bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 text-slate-700 font-medium"
                            />
                            <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3 rounded-2xl transition-colors shadow-sm whitespace-nowrap">
                                Find
                            </button>
                        </form>

                        <button 
                            onClick={() => setIs247Filter(!is247Filter)}
                            className={`px-6 py-3 rounded-2xl font-bold transition-colors whitespace-nowrap border ${
                                is247Filter ? 'bg-teal-50 text-teal-700 border-teal-200' : 'bg-white text-slate-600 hover:bg-gray-50 border-gray-200'
                            }`}
                        >
                            24/7 Only
                        </button>

                        {(searchQuery || cityFilter || is247Filter) && (
                            <button onClick={handleClearFilters} className="text-slate-400 hover:text-slate-600 font-medium px-4 whitespace-nowrap">
                                Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content: Map Full Width */}
                <div className="w-full h-[600px] rounded-[2rem] overflow-hidden border border-gray-100 shadow-sm bg-slate-100 relative">
                    <APIProvider apiKey={MAPS_API_KEY}>
                        <Map
                            mapId="PHARMACY_DIRECTORY_MAP"
                            defaultCenter={mapCenter}
                            defaultZoom={mapZoom}
                            disableDefaultUI={true}
                            zoomControl={true}
                        >
                            <MapUpdater center={mapCenter} zoom={mapZoom} />
                            {filteredPharmacies.map(pharmacy => (
                                <AdvancedMarker 
                                    key={pharmacy._id} 
                                    position={{ lat: pharmacy.location.lat, lng: pharmacy.location.lng }}
                                    onClick={() => openPharmacyModal(pharmacy)}
                                >
                                    <div className="w-10 h-10 bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:bg-teal-700 hover:scale-110 transition-transform">
                                        <FaPills size={18} />
                                    </div>
                                </AdvancedMarker>
                            ))}
                        </Map>
                    </APIProvider>
                </div>
            </main>

            {/* Pharmacy Details & Reviews Modal */}
            {isModalOpen && selectedPharmacy && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
                        
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">{selectedPharmacy.name}</h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="flex items-center gap-1 text-sm font-bold text-orange-500">
                                        <FaStar /> {selectedPharmacy.rating?.toFixed(1) || '0.0'} 
                                        <span className="text-slate-400 font-medium ml-1">({selectedPharmacy.numReviews} reviews)</span>
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-gray-50 hover:text-slate-800 transition-colors shrink-0 shadow-sm">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 overflow-y-auto custom-scrollbar flex-grow bg-slate-50/30">
                            
                            {/* Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
                                    <FaMapMarkerAlt className="text-teal-500 mt-1 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 mb-1">Address</p>
                                        <p className="text-sm text-slate-600">{selectedPharmacy.address}</p>
                                        <p className="text-sm text-slate-600">{selectedPharmacy.city}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3">
                                    <FaClock className="text-teal-500 mt-1 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 mb-1">Operating Hours</p>
                                        {selectedPharmacy.hours.is24_7 ? (
                                            <p className="text-sm text-green-600 font-semibold">Open 24/7</p>
                                        ) : (
                                            <p className="text-sm text-slate-600">{selectedPharmacy.hours.open} - {selectedPharmacy.hours.close}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3 md:col-span-2">
                                    <FaPhone className="text-teal-500 mt-1 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 mb-1">Contact</p>
                                        <p className="text-sm text-slate-600">{selectedPharmacy.contact.phone}</p>
                                        {selectedPharmacy.contact.email && <p className="text-sm text-slate-600">{selectedPharmacy.contact.email}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <h3 className="text-xl font-bold text-slate-900 mb-6 border-b border-gray-200 pb-3">Community Reviews</h3>
                            
                            {/* Add Review Form */}
                            {isLoggedIn ? (
                                <form onSubmit={submitReview} className="bg-white p-6 rounded-2xl border border-teal-100 shadow-sm mb-8">
                                    <h4 className="text-sm font-bold text-teal-800 mb-4">Write a Review</h4>
                                    
                                    {reviewStatus.success && <p className="text-green-600 text-sm font-medium mb-3">Review submitted successfully!</p>}
                                    {reviewStatus.error && <p className="text-red-600 text-sm font-medium mb-3">{reviewStatus.error}</p>}

                                    <div className="mb-4 flex items-center gap-2">
                                        <label className="text-sm font-medium text-slate-700">Rating:</label>
                                        <select 
                                            value={reviewForm.rating} 
                                            onChange={(e) => setReviewForm({...reviewForm, rating: e.target.value})}
                                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-teal-500"
                                        >
                                            {[5,4,3,2,1].map(num => <option key={num} value={num}>{num} Stars</option>)}
                                        </select>
                                    </div>
                                    <textarea 
                                        rows="3" 
                                        required
                                        placeholder="Share your experience with this pharmacy..."
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none mb-3 text-sm"
                                    ></textarea>
                                    <button 
                                        type="submit" 
                                        disabled={reviewStatus.loading}
                                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors text-sm disabled:opacity-50"
                                    >
                                        {reviewStatus.loading ? 'Submitting...' : 'Post Review'}
                                    </button>
                                </form>
                            ) : (
                                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center mb-8">
                                    <p className="text-slate-600 text-sm mb-3">Please log in to leave a review.</p>
                                    <a href="/login" className="inline-block bg-white border border-gray-200 text-slate-800 font-bold px-6 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm">Log In</a>
                                </div>
                            )}

                            {/* Review List */}
                            <div className="space-y-4">
                                {selectedPharmacy.reviews && selectedPharmacy.reviews.length > 0 ? (
                                    selectedPharmacy.reviews.map(review => (
                                        <div key={review._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <p className="font-bold text-slate-900">{review.name}</p>
                                                    <div className="flex text-orange-400 mt-0.5 text-xs">
                                                        {[...Array(5)].map((_, i) => <FaStar key={i} className={i < review.rating ? "text-orange-400" : "text-gray-200"} />)}
                                                    </div>
                                                </div>
                                                <span className="text-xs font-medium text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-slate-600 text-[15px] mt-3 leading-relaxed">{review.comment}</p>
                                            
                                            {/* Pharmacy Response */}
                                            {review.response && (
                                                <div className="mt-4 bg-teal-50/50 border-l-[3px] border-teal-500 rounded-r-xl p-4">
                                                    <p className="text-xs font-bold text-teal-800 flex items-center gap-1.5 mb-1.5">
                                                        <FaReply /> Pharmacy Response
                                                    </p>
                                                    <p className="text-teal-900 text-sm leading-relaxed">{review.response}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-slate-500 py-6">No reviews yet.</p>
                                )}
                            </div>

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

            <Footer />
        </div>
    );
}

export default Pharmacy;