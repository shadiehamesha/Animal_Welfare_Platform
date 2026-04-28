import React, { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { FaStar, FaMapMarkerAlt, FaClock, FaPhone, FaTimes, FaSearch, FaReply } from "react-icons/fa";
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

const Hospitals = () => {
    const [hospitals, setHospitals] = useState([]);
    const [filteredHospitals, setFilteredHospitals] = useState([]);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [is247Filter, setIs247Filter] = useState(false);
    
    const [selectedHospital, setSelectedHospital] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
    const [reviewStatus, setReviewStatus] = useState({ loading: false, error: null, success: false });

    // Set map center default to Sri Lanka
    const [mapCenter, setMapCenter] = useState({ lat: 7.8731, lng: 80.7718 });
    const [mapZoom, setMapZoom] = useState(7);

    const MAPS_API_KEY = import.meta.env.VITE_MAPS || import.meta.env.VITE_MAPS_API_KEY || "";

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setIsLoggedIn(true);
        fetchHospitals();
    }, []);

    const fetchHospitals = async (city = "") => {
        try {
            const url = city 
                ? `http://localhost:5000/api/hospitals?city=${encodeURIComponent(city)}` 
                : `http://localhost:5000/api/hospitals`;
                
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setHospitals(data);
                
                if (data.length > 0 && city) {
                    setMapCenter({ lat: data[0].location.lat, lng: data[0].location.lng });
                    setMapZoom(12);
                } else if (!city) {
                    setMapCenter({ lat: 7.8731, lng: 80.7718 });
                    setMapZoom(7);
                }
            }
        } catch (error) {
            console.error("Error fetching hospitals:", error);
        }
    };

    // Handle Local Search & Toggle Filtering
    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const results = hospitals.filter(h => {
            const matchesSearch = h.name.toLowerCase().includes(lowercasedQuery) || 
                                  h.address.toLowerCase().includes(lowercasedQuery);
            const matches247 = is247Filter ? h.hours.is24_7 : true;
            return matchesSearch && matches247;
        });
        setFilteredHospitals(results);
    }, [searchQuery, is247Filter, hospitals]);

    const handleCitySearch = (e) => {
        e.preventDefault();
        fetchHospitals(cityFilter);
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setCityFilter("");
        setIs247Filter(false);
        fetchHospitals("");
    };

    const openHospitalModal = async (hospital) => {
        try {
            // Fetch fresh hospital data to get all reviews and responses populated
            const res = await fetch(`http://localhost:5000/api/hospitals/${hospital._id}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedHospital(data);
                setIsModalOpen(true);
                setReviewStatus({ loading: false, error: null, success: false });
                setReviewForm({ rating: 5, comment: "" });
            }
        } catch (error) {
            console.error("Error fetching hospital details:", error);
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        setReviewStatus({ loading: true, error: null, success: false });
        const token = localStorage.getItem("token");

        try {
            const res = await fetch(`http://localhost:5000/api/hospitals/${selectedHospital._id}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(reviewForm)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to submit review.");
            }

            setReviewStatus({ loading: false, error: null, success: true });
            
            // Refresh modal data
            openHospitalModal(selectedHospital);
        } catch (error) {
            setReviewStatus({ loading: false, error: error.message, success: false });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <main className="flex-grow flex flex-col pt-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                
                {/* Header & Search Section */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                        Find Veterinary Care
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mb-8">
                        Locate top-rated hospitals and emergency clinics near you. Explore the map below to find the best care for your furry friends.
                    </p>

                    <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-4 items-center">
                        
                        {/* Search by Name/Address */}
                        <div className="w-full xl:flex-1 flex items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
                            <FaSearch className="text-slate-400 mr-3 shrink-0" />
                            <input 
                                type="text" 
                                placeholder="Search clinic name or address..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent focus:outline-none text-slate-700"
                            />
                        </div>

                        {/* Search by City (API based) */}
                        <form onSubmit={handleCitySearch} className="w-full xl:flex-1 flex gap-2">
                            <div className="flex-1 flex items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
                                <FaMapMarkerAlt className="text-slate-400 mr-3 shrink-0" />
                                <input 
                                    type="text" 
                                    placeholder="Filter by city (e.g., Colombo)" 
                                    value={cityFilter}
                                    onChange={(e) => setCityFilter(e.target.value)}
                                    className="w-full bg-transparent focus:outline-none text-slate-700"
                                />
                            </div>
                            <button type="submit" className="bg-[#0d9488] hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-semibold transition-colors shadow-sm shrink-0">
                                Search
                            </button>
                        </form>

                        {/* Toggles & Clear Buttons */}
                        <div className="w-full xl:w-auto flex flex-col sm:flex-row items-center gap-3 shrink-0">
                            {/* 24/7 Filter Toggle */}
                            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3 bg-green-50/50 border border-green-100 px-5 py-3.5 rounded-2xl cursor-pointer" onClick={() => setIs247Filter(!is247Filter)}>
                                <span className="text-sm font-bold text-green-800">24/7 Emergency Only</span>
                                <div className={`w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer transition-colors ${is247Filter ? 'bg-green-500' : 'bg-gray-300'}`}>
                                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${is247Filter ? 'translate-x-6' : ''}`}></div>
                                </div>
                            </div>
                            
                            {/* Clear Filters Button */}
                            <button 
                                onClick={handleClearFilters}
                                className="w-full sm:w-auto border border-gray-200 text-slate-600 hover:bg-gray-50 px-5 py-3.5 rounded-2xl font-semibold transition-colors shadow-sm"
                            >
                                Clear Filters
                            </button>
                        </div>

                    </div>
                </div>

                {/* Full Width Map View */}
                <div className="relative w-full h-[600px] lg:h-[750px] bg-slate-100 rounded-[2.5rem] overflow-hidden border border-gray-200 shadow-inner flex-grow">
                    <APIProvider apiKey={MAPS_API_KEY}>
                        <Map
                            defaultCenter={mapCenter}
                            defaultZoom={mapZoom}
                            mapId="HOSPITAL_DIRECTORY_MAP"
                            gestureHandling={'greedy'}
                        >
                            <MapUpdater center={mapCenter} zoom={mapZoom} />
                            
                            {filteredHospitals.map((hospital) => (
                                <AdvancedMarker 
                                    key={hospital._id} 
                                    position={{ lat: hospital.location.lat, lng: hospital.location.lng }}
                                    onClick={() => openHospitalModal(hospital)}
                                    className="cursor-pointer"
                                >
                                    {/* Custom Name Marker */}
                                    <div className="relative group">
                                        <div className="bg-[#0d9488] text-white px-4 py-2 rounded-full font-bold shadow-lg text-sm border-[3px] border-white group-hover:bg-teal-700 transition-colors whitespace-nowrap flex items-center gap-2">
                                            {hospital.hours.is24_7 && <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>}
                                            {hospital.name}
                                        </div>
                                        {/* Marker tail */}
                                        <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
                                    </div>
                                </AdvancedMarker>
                            ))}
                        </Map>
                    </APIProvider>

                    {filteredHospitals.length === 0 && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 pointer-events-none">
                            <span className="text-5xl mb-4">🗺️</span>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">No clinics found</h3>
                            <p className="text-slate-600 font-medium text-center px-4 max-w-md">Try adjusting your search terms, toggling off filters, or loading a different area.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            {/* Hospital Details & Reviews Modal */}
            {isModalOpen && selectedHospital && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 shrink-0">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h2 className="text-2xl font-bold text-slate-900">{selectedHospital.name}</h2>
                                    <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full text-xs font-bold">
                                        <FaStar />
                                        <span>{selectedHospital.rating.toFixed(1)}</span>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-sm flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-teal-600 shrink-0" />
                                    {selectedHospital.address}, {selectedHospital.city}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-gray-50 hover:text-slate-800 transition-colors shrink-0">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Scrollable Body */}
                        <div className="overflow-y-auto p-8 custom-scrollbar">
                            
                            {/* Operational Details Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                                <div className="bg-teal-50/50 rounded-2xl p-5 border border-teal-100">
                                    <h3 className="text-sm font-bold text-teal-800 mb-3 uppercase tracking-wider flex items-center gap-2">
                                        <FaClock /> Hours
                                    </h3>
                                    {selectedHospital.hours.is24_7 ? (
                                        <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold">24/7 Emergency Care</span>
                                    ) : (
                                        <p className="text-slate-700 font-medium">{selectedHospital.hours.open} - {selectedHospital.hours.close}</p>
                                    )}
                                </div>
                                <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                                    <h3 className="text-sm font-bold text-blue-800 mb-3 uppercase tracking-wider flex items-center gap-2">
                                        <FaPhone /> Contact
                                    </h3>
                                    <p className="text-slate-700 font-medium mb-1">{selectedHospital.contact.phone}</p>
                                    {selectedHospital.contact.email && <p className="text-slate-700 font-medium mb-1">{selectedHospital.contact.email}</p>}
                                    {selectedHospital.contact.website && <p className="text-slate-700 font-medium"><a href={selectedHospital.contact.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Visit Website</a></p>}
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="border-t border-gray-100 pt-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-2xl font-bold text-slate-900">Patient Reviews</h3>
                                    <span className="text-slate-500 font-medium">{selectedHospital.numReviews} Reviews</span>
                                </div>

                                {/* Review List */}
                                <div className="space-y-6 mb-10">
                                    {selectedHospital.reviews && selectedHospital.reviews.length > 0 ? (
                                        selectedHospital.reviews.map((review, index) => (
                                            <div key={index} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className="font-bold text-slate-900">{review.name}</span>
                                                    <div className="flex text-orange-400">
                                                        {[...Array(5)].map((_, i) => (
                                                            <FaStar key={i} className={i < review.rating ? "text-orange-400" : "text-gray-200"} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <p className="text-slate-600 leading-relaxed text-[15px]">{review.comment}</p>
                                                <p className="text-xs text-slate-400 mt-3 font-medium">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                
                                                {/* Clinic Response UI */}
                                                {review.response && (
                                                    <div className="bg-teal-50/50 border-l-[3px] border-teal-500 rounded-r-xl p-4 mt-4">
                                                        <p className="text-xs font-bold text-teal-800 mb-1.5 flex items-center gap-1.5">
                                                            <FaReply /> Clinic Response
                                                        </p>
                                                        <p className="text-teal-900 text-sm leading-relaxed">{review.response}</p>
                                                        {review.respondedAt && (
                                                            <p className="text-[11px] text-teal-600/80 mt-2 font-medium">
                                                                Responded on {new Date(review.respondedAt).toLocaleDateString()}
                                                            </p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-8 text-center">
                                            <p className="text-slate-500 font-medium">No reviews yet. Be the first to share your experience!</p>
                                        </div>
                                    )}
                                </div>

                                {/* Write a Review Form */}
                                {isLoggedIn ? (
                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                        <h4 className="font-bold text-slate-900 mb-4">Write a Review</h4>
                                        {reviewStatus.success && (
                                            <div className="bg-green-50 text-green-700 p-3 rounded-xl mb-4 text-sm font-medium border border-green-200">Review submitted successfully!</div>
                                        )}
                                        {reviewStatus.error && (
                                            <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm font-medium border border-red-200">{reviewStatus.error}</div>
                                        )}
                                        <form onSubmit={submitReview}>
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Rating</label>
                                                <select 
                                                    value={reviewForm.rating} 
                                                    onChange={(e) => setReviewForm({...reviewForm, rating: e.target.value})}
                                                    className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium text-slate-700"
                                                >
                                                    <option value="5">5 - Excellent</option>
                                                    <option value="4">4 - Very Good</option>
                                                    <option value="3">3 - Average</option>
                                                    <option value="2">2 - Poor</option>
                                                    <option value="1">1 - Terrible</option>
                                                </select>
                                            </div>
                                            <div className="mb-4">
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Comment</label>
                                                <textarea 
                                                    rows="3" 
                                                    required 
                                                    value={reviewForm.comment} 
                                                    onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                                    className="w-full p-3.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none font-medium text-slate-700 placeholder:text-slate-400"
                                                    placeholder="Share details of your own experience at this clinic..."
                                                ></textarea>
                                            </div>
                                            <button 
                                                type="submit" 
                                                disabled={reviewStatus.loading}
                                                className={`w-full bg-[#0d9488] text-white font-bold py-4 rounded-xl transition-colors shadow-md ${reviewStatus.loading ? 'opacity-70' : 'hover:bg-teal-700'}`}
                                            >
                                                {reviewStatus.loading ? 'Submitting...' : 'Submit Review'}
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="bg-teal-50 border border-teal-100 rounded-2xl p-8 text-center">
                                        <p className="text-teal-800 font-medium mb-4">Please log in to write a review.</p>
                                        <a href="/login" className="inline-block bg-teal-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-teal-700 transition-colors shadow-sm">
                                            Log In Now
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Scrollbar CSS */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}} />
        </div>
    );
};

export default Hospitals;