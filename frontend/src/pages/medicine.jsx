import React, { useState } from "react";
import { FaSearch, FaMapMarkerAlt, FaPhone, FaBuilding, FaExclamationCircle } from "react-icons/fa";
import Navbar from "../components/navigation";
import Footer from "../components/footer";

const Medicine = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [medicines, setMedicines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        setHasSearched(true);
        
        try {
            const res = await fetch(`http://localhost:5000/api/medicines/search?q=${encodeURIComponent(searchQuery.trim())}`);
            if (res.ok) {
                const data = await res.json();
                setMedicines(data);
            }
        } catch (error) {
            console.error("Error searching medicines:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <main className="flex-grow pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
                
                {/* Hero Search Section */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                        Find Pet Medications
                    </h1>
                    <p className="text-slate-500 text-lg mb-10">
                        Search across our network of verified pharmacies to find exactly what your pet needs, and check real-time stock availability.
                    </p>

                    <form onSubmit={handleSearch} className="relative w-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-full">
                        <div className="flex items-center bg-white rounded-full border border-gray-200 pl-6 pr-2 py-2 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                            <FaSearch className="text-teal-600 text-xl shrink-0" />
                            <input 
                                type="text" 
                                placeholder="Search for Tick medicine, Antibiotics, Supplements..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent text-slate-700 placeholder-slate-400 focus:outline-none text-lg px-4 h-14"
                            />
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="bg-teal-600 hover:bg-teal-700 text-white px-8 h-12 rounded-full font-bold transition-colors shadow-sm disabled:opacity-70 whitespace-nowrap"
                            >
                                {loading ? 'Searching...' : 'Find Medicine'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results Section */}
                <div className="w-full">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                        </div>
                    ) : hasSearched && medicines.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm max-w-2xl mx-auto">
                            <span className="text-5xl mb-4 block">🔍</span>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">No results found</h3>
                            <p className="text-slate-500 font-medium">We couldn't find any medicine matching "{searchQuery}". Try using broader terms.</p>
                        </div>
                    ) : medicines.length > 0 ? (
                        <div>
                            <p className="text-slate-500 font-semibold mb-6 ml-2">Found {medicines.length} results for "{searchQuery}"</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {medicines.map((med) => (
                                    <div key={med._id} className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-teal-100 transition-all">
                                        
                                        {/* Medicine Details Header */}
                                        <div className="p-6 border-b border-gray-50 bg-slate-50/50">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-xl font-bold text-slate-900">{med.name}</h3>
                                                    <span className="inline-block bg-white text-slate-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-gray-200 mt-2">
                                                        {med.category}
                                                    </span>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-2xl font-black text-teal-600">LKR {med.price.toFixed(2)}</p>
                                                </div>
                                            </div>
                                            
                                            {med.description && (
                                                <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                                                    {med.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Pharmacy Details Footer */}
                                        <div className="p-6 flex-grow flex flex-col">
                                            <div className="flex items-center gap-2 mb-4">
                                                {med.inStock ? (
                                                    <span className="bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide border border-green-100 flex items-center gap-1.5">
                                                        <span className="w-2 h-2 rounded-full bg-green-500"></span> In Stock
                                                    </span>
                                                ) : (
                                                    <span className="bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wide border border-red-100 flex items-center gap-1.5">
                                                        <FaExclamationCircle /> Out of Stock
                                                    </span>
                                                )}
                                            </div>

                                            <div className="bg-gray-50 rounded-2xl p-4 mt-auto border border-gray-100">
                                                <p className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                                    <FaBuilding className="text-teal-500" /> 
                                                    Available at: {med.pharmacy?.name}
                                                </p>
                                                <div className="space-y-2">
                                                    <p className="text-xs font-medium text-slate-600 flex items-center gap-2">
                                                        <FaMapMarkerAlt className="text-slate-400 shrink-0" /> 
                                                        <span className="truncate">{med.pharmacy?.address}, {med.pharmacy?.city}</span>
                                                    </p>
                                                    <p className="text-xs font-medium text-slate-600 flex items-center gap-2">
                                                        <FaPhone className="text-slate-400 shrink-0" /> 
                                                        {med.pharmacy?.contact?.phone}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Medicine;