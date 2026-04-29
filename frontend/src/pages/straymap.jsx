import React, { useState, useEffect, useRef } from "react";
import { APIProvider, Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { FaMapMarkerAlt, FaTimes, FaCamera, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import Navbar from "../components/navigation";
import Footer from "../components/footer";

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

const StrayMap = () => {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // Claim Workflow States
    const [claimMode, setClaimMode] = useState(false);
    const [proofImage, setProofImage] = useState(null);
    const [proofPreview, setProofPreview] = useState(null);
    const [claimStatus, setClaimStatus] = useState({ loading: false, error: null, success: false });
    const fileInputRef = useRef(null);

    const [mapCenter, setMapCenter] = useState({ lat: 7.8731, lng: 80.7718 });
    const [mapZoom, setMapZoom] = useState(7);
    const MAPS_API_KEY = import.meta.env.VITE_MAPS || import.meta.env.VITE_MAPS_API_KEY || "";

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) setIsLoggedIn(true);
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/reports/public");
            if (res.ok) {
                const data = await res.json();
                setReports(data);
            }
        } catch (error) {
            console.error("Error fetching public reports:", error);
        }
    };

    const handleMarkerClick = (report) => {
        setSelectedReport(report);
        setIsModalOpen(true);
        setClaimMode(false);
        setProofImage(null);
        setProofPreview(null);
        setClaimStatus({ loading: false, error: null, success: false });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProofImage(file);
            setProofPreview(URL.createObjectURL(file));
        }
    };

    const submitClaim = async (e) => {
        e.preventDefault();
        if (!proofImage) {
            return setClaimStatus({ loading: false, error: "Please upload a proof image.", success: false });
        }

        setClaimStatus({ loading: true, error: null, success: false });
        const token = localStorage.getItem("token");
        const formData = new FormData();
        formData.append("image", proofImage);

        try {
            const res = await fetch(`http://localhost:5000/api/reports/${selectedReport._id}/claim`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to submit claim.");

            setClaimStatus({ loading: false, error: null, success: true });
            
            // Optionally remove the report from the local view so they don't claim it twice
            setTimeout(() => {
                setReports(reports.filter(r => r._id !== selectedReport._id));
                setIsModalOpen(false);
            }, 3000);
            
        } catch (error) {
            setClaimStatus({ loading: false, error: error.message, success: false });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <main className="flex-grow flex flex-col pt-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                        Active Stray Radar
                    </h1>
                    <p className="text-slate-500 text-lg max-w-3xl">
                        View recently reported stray animals in your area. If you recognize a pet or want to take responsibility for a stray, click the marker to claim them.
                    </p>
                </div>

                <div className="relative w-full h-[600px] bg-slate-100 rounded-[2.5rem] overflow-hidden border border-gray-200 shadow-inner flex-grow">
                    <APIProvider apiKey={MAPS_API_KEY}>
                        <Map defaultCenter={mapCenter} defaultZoom={mapZoom} mapId="STRAY_PUBLIC_MAP" gestureHandling={'greedy'}>
                            <MapUpdater center={mapCenter} zoom={mapZoom} />
                            {reports.map((report) => (
                                <AdvancedMarker 
                                    key={report._id} 
                                    position={{ lat: report.location.coordinates[1], lng: report.location.coordinates[0] }}
                                    onClick={() => handleMarkerClick(report)}
                                    className="cursor-pointer"
                                >
                                    <div className="relative group">
                                        <div className="bg-[#0d9488] text-white p-2 rounded-full shadow-lg border-2 border-white group-hover:scale-110 transition-transform">
                                            <FaMapMarkerAlt size={20} />
                                        </div>
                                    </div>
                                </AdvancedMarker>
                            ))}
                        </Map>
                    </APIProvider>
                </div>
            </main>

            {/* View & Claim Modal */}
            {isModalOpen && selectedReport && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-slate-900">
                                {claimMode ? 'Claim Animal' : 'Stray Report Details'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-500 hover:bg-gray-200 rounded-full transition-colors">
                                <FaTimes />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6 custom-scrollbar">
                            {!claimMode ? (
                                // --- VIEW MODE ---
                                <div className="space-y-5">
                                    <img 
                                        src={`http://localhost:5000${selectedReport.imageUrl}`} 
                                        alt="Stray" 
                                        className="w-full h-64 object-cover rounded-2xl border border-gray-200"
                                    />
                                    <div>
                                        <div className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide mb-2">
                                            {selectedReport.species}
                                        </div>
                                        <p className="text-slate-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            {selectedReport.description}
                                        </p>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium text-right">
                                        Reported on {new Date(selectedReport.createdAt).toLocaleDateString()}
                                    </p>
                                    
                                    <div className="pt-4 border-t border-gray-100">
                                        {isLoggedIn ? (
                                            <button 
                                                onClick={() => setClaimMode(true)}
                                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-full transition-colors shadow-md flex items-center justify-center gap-2"
                                            >
                                                <FaCheckCircle /> I Found This Animal / Claim
                                            </button>
                                        ) : (
                                            <div className="text-center bg-teal-50 p-4 rounded-2xl border border-teal-100">
                                                <p className="text-sm text-teal-800 font-medium mb-2">You must be logged in to claim this animal.</p>
                                                <a href="/login" className="text-teal-600 font-bold hover:underline">Log In Here</a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                // --- CLAIM MODE ---
                                <div>
                                    {claimStatus.success ? (
                                        <div className="text-center py-10">
                                            <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <FaCheckCircle size={32} />
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">Claim Submitted!</h3>
                                            <p className="text-slate-500 text-sm">
                                                Our admins will review your proof image shortly. Thank you for stepping up!
                                            </p>
                                        </div>
                                    ) : (
                                        <form onSubmit={submitClaim} className="space-y-6">
                                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-2xl flex gap-3 text-yellow-800 text-sm">
                                                <FaExclamationTriangle className="shrink-0 mt-0.5" />
                                                <p>To prevent false claims, please upload a clear, recent photo of the animal in your possession.</p>
                                            </div>

                                            {claimStatus.error && (
                                                <p className="text-red-500 text-sm font-medium bg-red-50 p-3 rounded-xl">{claimStatus.error}</p>
                                            )}

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-700 mb-2">Proof Image *</label>
                                                <input 
                                                    type="file" 
                                                    accept="image/*" 
                                                    onChange={handleImageChange}
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                />
                                                <div 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className={`w-full h-48 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer transition-colors overflow-hidden
                                                        ${proofPreview ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-400 bg-gray-50'}`}
                                                >
                                                    {proofPreview ? (
                                                        <img src={proofPreview} alt="Proof" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="text-center text-slate-500">
                                                            <FaCamera className="mx-auto mb-2 text-2xl" />
                                                            <span className="text-sm font-medium">Tap to upload photo</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                                <button type="button" onClick={() => setClaimMode(false)} className="flex-1 py-3 border border-gray-200 text-slate-600 font-bold rounded-full hover:bg-gray-50 transition-colors">
                                                    Cancel
                                                </button>
                                                <button type="submit" disabled={claimStatus.loading} className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-full transition-colors shadow-md disabled:opacity-50">
                                                    {claimStatus.loading ? 'Uploading...' : 'Submit Claim'}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
            <Footer />
            <style dangerouslySetInnerHTML={{__html: `.custom-scrollbar::-webkit-scrollbar { width: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }`}} />
        </div>
    );
};

export default StrayMap;