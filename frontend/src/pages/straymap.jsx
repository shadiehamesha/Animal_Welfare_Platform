import React, { useState, useEffect, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { FaMapMarkerAlt, FaCamera, FaSearch, FaTimes, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import Navbar from '../components/navigation.jsx';
import Footer from '../components/footer.jsx';

const StrayMap = () => {
    const MAPS_API_KEY = import.meta.env.VITE_MAPS || import.meta.env.VITE_MAPS_API_KEY || "";
    
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 7.8731, lng: 80.7718 }); // Center of Sri Lanka
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Claim Workflow States
    const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
    const [claimImage, setClaimImage] = useState(null);
    const [claimImagePreview, setClaimImagePreview] = useState(null);
    const [isClaiming, setIsClaiming] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef(null);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('token'));
        
        // Attempt to get user's location. If denied, it silently falls back to default mapCenter.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setMapCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.log("Geolocation access denied or unavailable. Using default map center.")
            );
        }

        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/reports/public');
            if (res.ok) {
                const data = await res.json();
                setReports(data);
            }
        } catch (error) {
            console.error("Failed to load map data", error);
        }
    };

    const handleClaimImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setClaimImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setClaimImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const submitClaim = async (e) => {
        e.preventDefault();
        if (!claimImage) {
            setMessage({ type: 'error', text: 'Proof photo is required.' });
            return;
        }

        setIsClaiming(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('image', claimImage);

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/reports/${selectedReport._id}/claim`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            const data = await res.json();
            if (res.ok) {
                setMessage({ type: 'success', text: 'Claim submitted! Admins will review it shortly.' });
                setTimeout(() => {
                    setIsClaimModalOpen(false);
                    setSelectedReport(null);
                    fetchReports();
                }, 2500);
            } else {
                setMessage({ type: 'error', text: data.message || 'Claim failed.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error occurred.' });
        } finally {
            setIsClaiming(false);
        }
    };

    const closeDetails = () => {
        setSelectedReport(null);
        setIsClaimModalOpen(false);
        setClaimImage(null);
        setClaimImagePreview(null);
        setMessage({ type: '', text: '' });
    };

    return (
        <div className="flex flex-col min-h-screen font-sans bg-[#f9fdfc]">
            <Navbar />
            
            <main className="flex-grow flex flex-col relative">
                {/* Header Overlay */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg border border-white/50 text-center pointer-events-none w-max">
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Active Operations Map</h1>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase mt-1 justify-center">
                        <span className="flex items-center gap-1.5 text-teal-700"><div className="w-2 h-2 rounded-full bg-teal-500"></div> Stray Sightings</span>
                        <span className="flex items-center gap-1.5 text-orange-700"><div className="w-2 h-2 rounded-full bg-orange-500"></div> Lost Pets</span>
                    </div>
                </div>

                {/* Map Container */}
                <div className="flex-grow w-full relative bg-gray-100 min-h-[calc(100vh-140px)]">
                    <APIProvider apiKey={MAPS_API_KEY}>
                        <Map
                            style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
                            mapId="MAIN_STRAY_MAP"
                            center={mapCenter}
                            onCameraChanged={(e) => setMapCenter(e.detail.center)}
                            defaultZoom={11}
                            disableDefaultUI={true}
                            zoomControl={true}
                            gestureHandling={'greedy'}
                        >
                            {reports.map((report) => {
                                const lat = report.location?.coordinates[1];
                                const lng = report.location?.coordinates[0];
                                if (!lat || !lng) return null;

                                const isLost = report.reportType === 'Lost';

                                return (
                                    <AdvancedMarker 
                                        key={report._id}
                                        position={{ lat, lng }}
                                        onClick={() => {
                                            setSelectedReport(report);
                                            setMapCenter({ lat, lng }); // Center map on click
                                        }}
                                    >
                                        <Pin 
                                            background={isLost ? '#f97316' : '#0d9488'} 
                                            borderColor={isLost ? '#c2410c' : '#0f766e'} 
                                            glyphColor={'#fff'} 
                                            scale={selectedReport?._id === report._id ? 1.3 : 1}
                                        />
                                    </AdvancedMarker>
                                );
                            })}
                        </Map>
                    </APIProvider>
                </div>

                {/* Floating Details Card */}
                {selectedReport && !isClaimModalOpen && (
                    <div className="absolute bottom-6 left-4 right-4 md:left-auto md:right-6 md:top-24 md:bottom-auto w-auto md:w-[400px] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-20 flex flex-col max-h-[80vh] animate-fade-in-up">
                        <div className="relative h-56 bg-gray-100 shrink-0">
                            <img 
                                src={`http://localhost:5000${selectedReport.imageUrl}`} 
                                alt="Reported Animal" 
                                className="w-full h-full object-cover"
                            />
                            <button 
                                onClick={closeDetails}
                                className="absolute top-4 right-4 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center text-slate-800 hover:bg-white transition-colors shadow-sm"
                            >
                                <FaTimes />
                            </button>
                            <div className="absolute top-4 left-4 flex gap-2">
                                <span className={`text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase shadow-sm ${selectedReport.reportType === 'Lost' ? 'bg-orange-500 text-white' : 'bg-teal-600 text-white'}`}>
                                    {selectedReport.reportType || 'Stray'}
                                </span>
                                <span className="bg-white/90 backdrop-blur text-slate-800 text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase shadow-sm">
                                    {selectedReport.species}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">
                            <p className="text-slate-800 font-medium leading-relaxed mb-4 text-[15px]">
                                {selectedReport.description}
                            </p>
                            
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100 mb-6">
                                <p className="text-xs text-slate-500 flex items-center gap-2">
                                    <FaSearch className="text-slate-400" /> 
                                    <strong className="text-slate-700">Reported:</strong> {new Date(selectedReport.createdAt).toLocaleDateString()}
                                </p>
                                <p className="text-xs text-slate-500 flex items-center gap-2 font-mono">
                                    <FaMapMarkerAlt className="text-slate-400" /> 
                                    <strong className="text-slate-700 font-sans">Approx Loc:</strong> {selectedReport.location.coordinates[1].toFixed(4)}, {selectedReport.location.coordinates[0].toFixed(4)}
                                </p>
                            </div>

                            {isLoggedIn ? (
                                <button 
                                    onClick={() => setIsClaimModalOpen(true)}
                                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                                >
                                    <FaCheckCircle /> {selectedReport.reportType === 'Lost' ? 'I Found This Pet' : 'I am Rescuing This Animal'}
                                </button>
                            ) : (
                                <div className="bg-orange-50 border border-orange-200 text-orange-800 p-4 rounded-xl text-xs font-semibold text-center">
                                    Log in to claim this animal or coordinate a rescue.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Claim Modal Overlay */}
                {isClaimModalOpen && selectedReport && (
                    <div className="absolute inset-0 bg-slate-900/60 z-30 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl flex flex-col animate-fade-in-up">
                            
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 mb-1">Verify Rescue</h2>
                                    <p className="text-sm text-slate-500">Please upload a real-time photo of the animal to verify your claim.</p>
                                </div>
                                <button onClick={closeDetails} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 hover:bg-gray-200 shrink-0">
                                    <FaTimes />
                                </button>
                            </div>

                            {message.text && (
                                <div className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                                    {message.text}
                                </div>
                            )}

                            <form onSubmit={submitClaim} className="space-y-6">
                                <div>
                                    <div 
                                        onClick={() => fileInputRef.current.click()}
                                        className={`w-full h-56 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors ${claimImagePreview ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                                    >
                                        {claimImagePreview ? (
                                            <img src={claimImagePreview} alt="Proof" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-6">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3 shadow-sm">
                                                    <FaCamera size={20} />
                                                </div>
                                                <p className="text-sm font-bold text-slate-700">Upload Verification Photo</p>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleClaimImageChange} className="hidden" />
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl flex gap-3 text-sm text-yellow-800 font-medium">
                                    <FaExclamationTriangle className="shrink-0 mt-0.5" />
                                    <p>Your photo will be sent to the admin team for review. Fraudulent claims may result in an account ban.</p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsClaimModalOpen(false)}
                                        className="flex-1 py-3.5 bg-white border border-gray-200 text-slate-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isClaiming}
                                        className={`flex-1 py-3.5 font-bold text-white rounded-xl shadow-md transition-colors ${isClaiming ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'}`}
                                    >
                                        {isClaiming ? 'Submitting...' : 'Submit Claim'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>

            <Footer />

            {/* Custom Animations */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}} />
        </div>
    );
};

export default StrayMap;