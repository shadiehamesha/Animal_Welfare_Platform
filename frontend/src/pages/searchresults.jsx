import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaSearch, FaMapMarkerAlt, FaStar, FaBuilding, FaPills, FaClinicMedical, FaArrowRight, FaClock, FaPhone, FaEnvelope } from 'react-icons/fa';
import Navbar from '../components/navigation';
import Footer from '../components/footer';
import Modal from '../components/modals/OrganizationModal';

const Search = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const initialQuery = searchParams.get('q') || '';
    
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [results, setResults] = useState({ hospitals: [], shelters: [], medicines: [], pharmacies: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    // Detail Modal State
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        if (initialQuery) {
            setSearchQuery(initialQuery);
            fetchSearchResults(initialQuery);
        } else {
            setIsLoading(false);
        }
    }, [initialQuery]);

    const fetchSearchResults = async (query) => {
        setIsLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data);
            }
        } catch (error) {
            console.error("Failed to fetch search results:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const totalResults = results.hospitals.length + results.shelters.length + results.medicines.length + results.pharmacies.length;

    // Helper components for UI consistency
    const SectionHeader = ({ title, count, icon }) => (
        <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-lg shrink-0">
                {icon}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <span className="bg-gray-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">{count}</span>
        </div>
    );

    // Dynamic Modal Content Renderer
    const renderModalContent = () => {
        if (!selectedItem) return null;
        const { type, data } = selectedItem;

        if (type === 'medicine') {
            return (
                <div className="space-y-6">
                    {/* Medicine Details */}
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{data.name}</h3>
                                <p className="text-sm text-teal-600 font-bold uppercase tracking-wider">{data.category}</p>
                            </div>
                            <span className="text-xl font-black text-slate-900">LKR {data.price?.toFixed(2)}</span>
                        </div>
                        <p className="text-slate-600 mt-2 text-sm">{data.description || 'No description available.'}</p>
                        <div className="mt-4">
                            <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${data.inStock ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                {data.inStock ? 'Currently In Stock' : 'Out of Stock'}
                            </span>
                        </div>
                    </div>

                    {/* Associated Pharmacy Details */}
                    {data.pharmacy && (
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                                <FaClinicMedical className="text-teal-600" /> Available at Pharmacy
                            </h4>
                            <div className="bg-white p-6 rounded-2xl border border-teal-100 shadow-[0_4px_20px_rgb(13,148,136,0.05)]">
                                <p className="font-bold text-slate-900 text-lg mb-1">{data.pharmacy.name}</p>
                                <p className="text-sm text-slate-500 mb-5 flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-teal-500 shrink-0" /> {data.pharmacy.address}, {data.pharmacy.city}
                                </p>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-xl">
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <FaClock className="text-slate-400 shrink-0" /> 
                                        <span className="font-medium">
                                            {data.pharmacy.hours?.is24_7 ? 'Open 24/7' : `${data.pharmacy.hours?.open} - ${data.pharmacy.hours?.close}`}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <FaPhone className="text-slate-400 shrink-0" /> 
                                        <span className="font-medium">{data.pharmacy.contact?.phone || 'No phone provided'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (type === 'hospital' || type === 'pharmacy') {
            return (
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-sm font-bold border border-orange-100">
                            <FaStar /> {data.rating?.toFixed(1) || '0.0'}
                        </span>
                        {data.hours?.is24_7 && (
                            <span className="bg-green-50 text-green-700 text-sm font-bold px-3 py-1.5 rounded-lg border border-green-100">
                                24/7 Emergency Care
                            </span>
                        )}
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <p className="font-bold text-slate-900 mb-2">Location</p>
                        <p className="text-slate-600 flex items-start gap-2 text-sm"><FaMapMarkerAlt className="mt-1 text-teal-500 shrink-0" /> {data.address}, {data.city}</p>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <p className="font-bold text-slate-900 mb-4">Contact & Hours</p>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-slate-700">
                                <FaClock className="text-teal-500 shrink-0" /> 
                                <span className="font-medium">{data.hours?.is24_7 ? 'Always Open' : `${data.hours?.open} to ${data.hours?.close}`}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-700">
                                <FaPhone className="text-teal-500 shrink-0" /> 
                                <span className="font-medium">{data.contact?.phone}</span>
                            </div>
                            {data.contact?.email && (
                                <div className="flex items-center gap-3 text-slate-700">
                                    <FaEnvelope className="text-teal-500 shrink-0" /> 
                                    <span className="font-medium">{data.contact.email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        if (type === 'shelter') {
            return (
                <div className="space-y-6">
                    {data.isVerified && (
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-bold border border-green-200">
                            <FaBuilding /> Verified Organization
                        </div>
                    )}
                    
                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <p className="font-bold text-slate-900 mb-2">Location</p>
                        <p className="text-slate-600 flex items-start gap-2 text-sm"><FaMapMarkerAlt className="mt-1 text-teal-500 shrink-0" /> {data.address}, {data.city}</p>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                        <p className="font-bold text-slate-900 mb-4">Contact Information</p>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3 text-slate-700">
                                <FaPhone className="text-teal-500 shrink-0" /> 
                                <span className="font-medium">{data.contact?.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-700">
                                <FaEnvelope className="text-teal-500 shrink-0" /> 
                                <span className="font-medium">{data.contact?.email}</span>
                            </div>
                        </div>
                    </div>
                    {data.description && (
                         <div className="bg-white p-5 rounded-2xl border border-gray-100">
                            <p className="font-bold text-slate-900 mb-2">About the Organization</p>
                            <p className="text-slate-600 text-sm leading-relaxed">{data.description}</p>
                        </div>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <main className="flex-grow pt-10 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                
                {/* Header & Search Bar */}
                <div className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Search Results</h1>
                    <p className="text-slate-500 text-lg mb-8">
                        {isLoading ? 'Searching across the platform...' : `Found ${totalResults} results for "${initialQuery}"`}
                    </p>

                    <form onSubmit={handleSearchSubmit} className="max-w-2xl bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex items-center focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
                        <div className="flex-grow flex items-center pl-4 pr-2">
                            <FaSearch className="text-slate-400 text-lg mr-3 shrink-0" />
                            <input 
                                type="text" 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search again for clinics, medicines, shelters..." 
                                className="w-full bg-transparent py-3 focus:outline-none text-slate-700 font-medium text-lg"
                            />
                        </div>
                        <button type="submit" className="bg-[#0d9488] hover:bg-teal-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm shrink-0">
                            Search
                        </button>
                    </form>
                </div>

                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                    </div>
                ) : totalResults === 0 ? (
                    <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                        <span className="text-5xl mb-4 block opacity-50">🔍</span>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No results found</h3>
                        <p className="text-slate-500 font-medium">We couldn't find any matches for "{initialQuery}". Try adjusting your keywords.</p>
                    </div>
                ) : (
                    <div>
                        {/* Tabs Navigation */}
                        <div className="flex overflow-x-auto gap-2 mb-8 pb-2 custom-scrollbar">
                            {[
                                { id: 'all', label: 'All Results', count: totalResults },
                                { id: 'hospitals', label: 'Hospitals', count: results.hospitals.length },
                                { id: 'shelters', label: 'Shelters', count: results.shelters.length },
                                { id: 'medicines', label: 'Medicines', count: results.medicines.length },
                                { id: 'pharmacies', label: 'Pharmacies', count: results.pharmacies.length },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${
                                        activeTab === tab.id 
                                        ? 'bg-teal-600 text-white shadow-md' 
                                        : 'bg-white text-slate-600 hover:bg-teal-50 border border-gray-100'
                                    }`}
                                >
                                    {tab.label}
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-teal-700' : 'bg-gray-100 text-slate-500'}`}>
                                        {tab.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Results Sections */}
                        <div className="space-y-12">
                            
                            {/* Hospitals */}
                            {(activeTab === 'all' || activeTab === 'hospitals') && results.hospitals.length > 0 && (
                                <section className="animate-fade-in-up">
                                    <SectionHeader title="Hospitals & Clinics" count={results.hospitals.length} icon={<FaClinicMedical />} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {results.hospitals.map(h => (
                                            <div key={h._id} onClick={() => setSelectedItem({ type: 'hospital', data: h, title: h.name })} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors pr-2">{h.name}</h3>
                                                    <span className="flex items-center gap-1 bg-orange-50 text-orange-600 px-2 py-1 rounded-lg text-xs font-bold shrink-0 border border-orange-100">
                                                        <FaStar /> {h.rating?.toFixed(1) || '0.0'}
                                                    </span>
                                                </div>
                                                <p className="text-slate-500 text-sm flex items-center gap-2 mb-2"><FaMapMarkerAlt className="text-slate-400" /> {h.city}</p>
                                                <p className="text-slate-600 text-sm line-clamp-1">{h.address}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Shelters */}
                            {(activeTab === 'all' || activeTab === 'shelters') && results.shelters.length > 0 && (
                                <section className="animate-fade-in-up">
                                    <SectionHeader title="Animal Shelters" count={results.shelters.length} icon={<FaBuilding />} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {results.shelters.map(s => (
                                            <div key={s._id} onClick={() => setSelectedItem({ type: 'shelter', data: s, title: s.organizationName })} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group">
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors mb-3">{s.organizationName}</h3>
                                                <p className="text-slate-500 text-sm flex items-center gap-2 mb-3"><FaMapMarkerAlt className="text-slate-400" /> {s.city}</p>
                                                {s.isVerified && (
                                                    <span className="inline-block bg-green-50 text-green-700 text-xs font-bold px-3 py-1 rounded-full border border-green-100">Verified Organization</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Medicines */}
                            {(activeTab === 'all' || activeTab === 'medicines') && results.medicines.length > 0 && (
                                <section className="animate-fade-in-up">
                                    <SectionHeader title="Medicines & Supplies" count={results.medicines.length} icon={<FaPills />} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {results.medicines.map(m => (
                                            <div key={m._id} onClick={() => setSelectedItem({ type: 'medicine', data: m, title: 'Medicine Details' })} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">{m.name}</h3>
                                                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mt-1">{m.category}</p>
                                                    </div>
                                                    <span className="text-lg font-bold text-teal-600">Rs.{m.price}</span>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                                        <FaBuilding className="text-slate-400 shrink-0" />
                                                        <span className="truncate max-w-[120px]">{m.pharmacy?.name || 'Unknown Pharmacy'}</span>
                                                    </div>
                                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase border ${m.inStock ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                                        {m.inStock ? 'In Stock' : 'Out of Stock'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Pharmacies */}
                            {(activeTab === 'all' || activeTab === 'pharmacies') && results.pharmacies.length > 0 && (
                                <section className="animate-fade-in-up">
                                    <SectionHeader title="Pharmacies" count={results.pharmacies.length} icon={<FaClinicMedical />} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {results.pharmacies.map(p => (
                                            <div key={p._id} onClick={() => setSelectedItem({ type: 'pharmacy', data: p, title: p.name })} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all cursor-pointer group flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors pr-2">{p.name}</h3>
                                                        {p.hours?.is24_7 && (
                                                            <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase shrink-0 border border-green-100">24/7</span>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-500 text-sm flex items-center gap-2"><FaMapMarkerAlt className="text-slate-400" /> {p.city}</p>
                                                </div>
                                                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center text-teal-600 text-sm font-bold group-hover:gap-2 transition-all">
                                                    View Details <FaArrowRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                        </div>
                    </div>
                )}
            </main>

            {/* Reused Generic Detail Modal */}
            <Modal 
                isOpen={!!selectedItem} 
                onClose={() => setSelectedItem(null)} 
                title={selectedItem?.title || "Details"}
                maxWidth="max-w-xl"
            >
                {renderModalContent()}
            </Modal>

            <Footer />
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
                .custom-scrollbar::-webkit-scrollbar { height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default Search;