import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { FaCamera, FaMapMarkerAlt, FaUpload, FaSearch, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import Navbar from '../components/navigation.jsx';
import Footer from '../components/footer.jsx';

// custom dropdown component
const CustomSelect = ({ value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    const selectedLabel = options.find(opt => opt.value === value)?.label || 'Select...';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-gray-50 border ${isOpen ? 'border-teal-500 ring-2 ring-teal-500 ring-opacity-20' : 'border-gray-200'} text-slate-700 text-sm rounded-2xl px-5 py-3.5 focus:outline-none transition-all font-medium flex justify-between items-center`}
            >
                <span>{selectedLabel}</span>
                <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.05)] py-2 transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'}`}>
                {options.map((option) => (
                    <div
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`px-5 py-3 cursor-pointer text-sm font-medium transition-colors duration-150 flex items-center justify-between
                            ${value === option.value ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-gray-50 hover:text-teal-600'}
                        `}
                    >
                        {option.label}
                        {value === option.value && (
                            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

// Stray Report Component
const StrayReport = () => {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const MAPS_API_KEY = import.meta.env.VITE_MAPS || import.meta.env.VITE_MAPS_API_KEY || "";

    // Form States
    const [reportType, setReportType] = useState('Stray');
    const [species, setSpecies] = useState('Dog');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // Map States (Separated center from pin location to allow panning)
    const [location, setLocation] = useState({ lat: 7.8731, lng: 80.7718 });
    const [mapCenter, setMapCenter] = useState({ lat: 7.8731, lng: 80.7718 });

    // UI States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [duplicateWarning, setDuplicateWarning] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem('token'));
        // Try to get user's actual location on load
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setLocation(coords);
                    setMapCenter(coords);
                },
                (err) => console.log("Geolocation blocked or failed.", err)
            );
        }
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'Image must be smaller than 5MB.' });
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleMapClick = (e) => {
        if (e.detail.latLng) {
            setLocation({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
        }
    };

    const submitForm = async (force = false) => {
        if (!image) {
            setMessage({ type: 'error', text: 'Please upload a photo of the animal.' });
            return;
        }

        setIsSubmitting(true);
        setMessage({ type: '', text: '' });

        const formData = new FormData();
        formData.append('reportType', reportType);
        formData.append('species', species);
        formData.append('description', description);
        formData.append('lat', location.lat);
        formData.append('lng', location.lng);
        formData.append('image', image);
        if (force) formData.append('forceSubmit', 'true');

        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        try {
            const res = await fetch('http://localhost:5000/api/reports', {
                method: 'POST',
                headers,
                body: formData
            });

            const data = await res.json();

            if (res.status === 201) {
                setMessage({ type: 'success', text: reportType === 'Lost' ? 'Lost pet alert broadcasted to the community!' : 'Stray reported successfully!' });
                setDuplicateWarning(null);
                setTimeout(() => navigate('/map'), 2000);
            } else if (res.status === 409) {
                setDuplicateWarning(data.duplicateRecord);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to submit report.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'A network error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        submitForm(false);
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3 tracking-tight">Report an Animal</h1>
                    <p className="text-slate-500 text-lg max-w-2xl mx-auto">Help a stray in need or alert the community about a lost pet.</p>
                </div>

                {/* Report Type Toggle */}
                <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-8 max-w-md mx-auto shadow-inner">
                    <button 
                        onClick={() => setReportType('Stray')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${reportType === 'Stray' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FaSearch /> Found a Stray
                    </button>
                    <button 
                        onClick={() => setReportType('Lost')}
                        className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${reportType === 'Lost' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <FaExclamationTriangle /> Lost My Pet
                    </button>
                </div>

                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] p-6 md:p-10">
                    {message.text && (
                        <div className={`mb-8 px-5 py-4 rounded-2xl text-sm font-medium flex items-center gap-3 ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                            {message.type === 'error' ? <FaExclamationTriangle /> : <span className="text-lg">✅</span>}
                            {message.text}
                        </div>
                    )}

                    {!isLoggedIn && reportType === 'Lost' && (
                        <div className="mb-8 px-5 py-4 bg-orange-50 border border-orange-200 text-orange-800 rounded-2xl text-sm font-medium flex items-start gap-3">
                            <FaExclamationTriangle className="mt-0.5 shrink-0" />
                            <p>You are reporting anonymously. To receive direct notifications when someone claims they found your pet, please log in.</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            
                            {/* Left Column: Image & Details */}
                            <div className="space-y-6">
                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-2">Photo *</label>
                                    <div 
                                        onClick={() => fileInputRef.current.click()}
                                        className={`w-full h-64 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-colors ${imagePreview ? 'border-teal-500 bg-teal-50/30' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="text-center p-6">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-400 mx-auto mb-3 shadow-sm">
                                                    <FaCamera size={20} />
                                                </div>
                                                <p className="text-sm font-bold text-slate-700">Click to upload photo</p>
                                                <p className="text-xs text-slate-500 mt-1">Clear photos help with AI matching</p>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 relative z-10">
                                        <label className="block text-sm font-bold text-slate-800 mb-2">Species *</label>
                                        <CustomSelect 
                                            value={species}
                                            options={[
                                                { value: 'Dog', label: 'Dog' },
                                                { value: 'Cat', label: 'Cat' },
                                                { value: 'Other', label: 'Other' }
                                            ]}
                                            onChange={(val) => setSpecies(val)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-2">Description *</label>
                                    <textarea 
                                        rows="4" 
                                        required
                                        placeholder={reportType === 'Lost' ? "Describe your pet, collar details, name, etc." : "Describe the animal, condition, collar if any..."}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 text-slate-700 text-sm rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Right Column: Location Map */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-1">Location *</label>
                                    <p className="text-xs text-slate-500 mb-3">Pan the map and click to drop a pin where the animal was {reportType === 'Lost' ? 'last seen' : 'found'}.</p>
                                </div>
                                
                                <div className="h-[400px] w-full rounded-3xl overflow-hidden border border-gray-200 relative bg-gray-100 shadow-inner">
                                    <APIProvider apiKey={MAPS_API_KEY}>
                                        <Map 
                                            mapId="REPORT_MAP_ID"
                                            center={mapCenter}
                                            onCameraChanged={(e) => setMapCenter(e.detail.center)}
                                            defaultZoom={14} 
                                            onClick={handleMapClick}
                                            gestureHandling={'greedy'}
                                            disableDefaultUI={true}
                                            zoomControl={true}
                                        >
                                            <AdvancedMarker position={location}>
                                                <Pin 
                                                    background={reportType === 'Lost' ? '#f97316' : '#0d9488'} 
                                                    borderColor={reportType === 'Lost' ? '#c2410c' : '#0f766e'} 
                                                    glyphColor={'#fff'} 
                                                />
                                            </AdvancedMarker>
                                        </Map>
                                    </APIProvider>
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            navigator.geolocation.getCurrentPosition(
                                                pos => {
                                                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                                                    setLocation(coords);
                                                    setMapCenter(coords);
                                                }
                                            );
                                        }}
                                        className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-xl text-sm font-bold text-slate-700 shadow-md border border-gray-100 flex items-center gap-2 hover:bg-gray-50 transition-colors"
                                    >
                                        <FaMapMarkerAlt className="text-teal-600" /> Use Current Location
                                    </button>
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex gap-4 text-xs font-mono text-slate-500">
                                    <span>Lat: {location.lat.toFixed(5)}</span>
                                    <span>Lng: {location.lng.toFixed(5)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end relative z-0">
                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className={`px-8 py-4 rounded-full font-bold text-white shadow-md transition-all flex items-center gap-2 ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : reportType === 'Lost' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-teal-600 hover:bg-teal-700'}`}
                            >
                                {isSubmitting ? 'Processing...' : (
                                    <><FaUpload /> {reportType === 'Lost' ? 'Broadcast Lost Alert' : 'Submit Stray Report'}</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />

            {/* AI Duplicate Detection Modal */}
            {duplicateWarning && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl flex flex-col">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 text-xl">
                                    <FaExclamationTriangle />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 leading-tight">Potential Duplicate Detected</h2>
                                    <p className="text-sm text-slate-500 mt-1">Our AI noticed a highly similar animal reported nearby.</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-4 mb-6">
                            <img src={`http://localhost:5000${duplicateWarning.imageUrl}`} alt="Existing Report" className="w-full h-48 object-cover rounded-xl mb-3" />
                            <p className="text-sm font-medium text-slate-700"><strong className="text-slate-900">Existing Description:</strong> {duplicateWarning.description}</p>
                            <p className="text-xs text-slate-500 mt-2">Reported on: {new Date(duplicateWarning.createdAt).toLocaleDateString()}</p>
                        </div>

                        <div className="flex gap-3 mt-auto">
                            <button 
                                onClick={() => submitForm(true)} 
                                className="flex-1 px-4 py-3 bg-white border border-gray-200 text-slate-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                No, this is different
                            </button>
                            <button 
                                onClick={() => { setDuplicateWarning(null); navigate('/map'); }} 
                                className="flex-1 px-4 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
                            >
                                Yes, view existing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StrayReport;