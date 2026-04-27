import React, { useState, useRef } from 'react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import axios from 'axios';
import Navbar from '../components/navigation';
import Footer from '../components/footer';

const StrayReport = () => {
    const fileInputRef = useRef(null);
    const MAPS_API_KEY = import.meta.env.VITE_MAPS || import.meta.env.VITE_MAPS_API_KEY || "";

    // Form State
    const [species, setSpecies] = useState('Dog');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [location, setLocation] = useState({ lat: 7.8731, lng: 80.7718 }); // Default to Sri Lanka
    const [locationSelected, setLocationSelected] = useState(false);

    // Submission & Duplicate State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [duplicateWarning, setDuplicateWarning] = useState(false);
    const [duplicateRecord, setDuplicateRecord] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
            setDuplicateWarning(false);
            setDuplicateRecord(null);
        }
    };

    const handleMapClick = (e) => {
        if (e.detail.latLng) {
            setLocation({ lat: e.detail.latLng.lat, lng: e.detail.latLng.lng });
            setLocationSelected(true);
        }
    };

    const resetForm = () => {
        setSpecies('Dog');
        setDescription('');
        setImage(null);
        setImagePreview(null);
        setLocationSelected(false);
        setSuccess(false);
        setDuplicateWarning(false);
        setDuplicateRecord(null);
    };

    const handleSubmit = async (e, forceSubmit = false) => {
        e.preventDefault();
        
        if (!image) return setError('Please upload an image of the animal.');
        if (!locationSelected && !forceSubmit) return setError('Please drop a pin on the map to indicate the location.');

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('image', image);
        formData.append('species', species);
        formData.append('description', description);
        formData.append('lat', location.lat);
        formData.append('lng', location.lng);
        if (forceSubmit) formData.append('forceSubmit', true);

        try {
            await axios.post('http://localhost:5000/api/reports', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            // Show success message and clear states
            setSuccess(true);
            setDuplicateWarning(false);
            setDuplicateRecord(null);
        } catch (err) {
            if (err.response && err.response.status === 409) {
                setDuplicateWarning(true);
                setDuplicateRecord(err.response.data.duplicateRecord);
            } else {
                setError(err.response?.data?.message || 'An error occurred during submission.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
            <Navbar />
            
            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 bg-teal-50/30">
                        <h2 className="text-2xl font-semibold text-slate-800 tracking-tight">Report a Stray Animal</h2>
                        <p className="text-slate-500 mt-1 text-sm">Your exact location data is kept private to protect the animal.</p>
                    </div>

                    {success ? (
                        <div className="p-10 text-center flex flex-col items-center">
                            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900 mb-3">Report Submitted Successfully!</h3>
                            <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                Thank you for helping an animal in need. Your report has been added to the community map.
                            </p>
                            <button 
                                onClick={resetForm}
                                className="bg-teal-600 text-white font-bold py-3.5 px-8 rounded-full hover:bg-teal-700 transition-colors shadow-sm"
                            >
                                Report Another Stray
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={(e) => handleSubmit(e, false)} className="p-8 space-y-8">
                            {/* Error Banner */}
                            {error && (
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            {/* Duplicate Warning Modal / Inline Alert */}
                            {duplicateWarning && duplicateRecord && (
                                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-2xl space-y-4">
                                    <h3 className="font-semibold text-yellow-800 text-lg">Wait, is this the same animal?</h3>
                                    <p className="text-yellow-700 text-sm">
                                        Our system detected a very similar photo reported nearby recently. To prevent duplicates, please verify.
                                    </p>
                                    <div className="flex gap-4 items-center bg-white p-3 rounded-xl">
                                        <img src={duplicateRecord.imageUrl} alt="Potential duplicate" className="w-20 h-20 object-cover rounded-lg" />
                                        <div className="text-sm text-slate-600">
                                            <p><span className="font-medium">Species:</span> {duplicateRecord.species}</p>
                                            <p><span className="font-medium">Reported:</span> {new Date(duplicateRecord.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-full text-sm font-medium hover:bg-slate-50 transition-colors"
                                        >
                                            Yes, it's the same (Cancel)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => handleSubmit(e, true)}
                                            className="px-4 py-2 bg-yellow-500 text-white rounded-full text-sm font-medium hover:bg-yellow-600 transition-colors shadow-sm"
                                        >
                                            No, different animal (Submit anyway)
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Details & Photo */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Species</label>
                                        <select 
                                            value={species} 
                                            onChange={(e) => setSpecies(e.target.value)}
                                            className="w-full px-4 py-3 rounded-2xl border-slate-200 bg-slate-50 focus:ring-teal-500 focus:border-teal-500 text-slate-700 outline-none"
                                        >
                                            <option value="Dog">Dog</option>
                                            <option value="Cat">Cat</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                                        <textarea 
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows="3"
                                            className="w-full px-4 py-3 rounded-2xl border-slate-200 bg-slate-50 focus:ring-teal-500 focus:border-teal-500 text-slate-700 outline-none resize-none"
                                            placeholder="Condition, distinct markings, behavior..."
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Photo</label>
                                        <input 
                                            type="file" 
                                            accept="image/*" 
                                            onChange={handleImageChange}
                                            ref={fileInputRef}
                                            className="hidden"
                                        />
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`w-full h-32 border-2 border-dashed rounded-2xl flex items-center justify-center cursor-pointer transition-colors overflow-hidden
                                                ${imagePreview ? 'border-teal-500 bg-teal-50/20' : 'border-slate-300 hover:border-teal-400 bg-slate-50'}`}
                                        >
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="text-slate-500 text-sm font-medium">Tap to upload a photo</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Map for Geotagging */}
                                <div className="flex flex-col h-full">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Exact Location <span className="text-red-500">*</span>
                                    </label>
                                    <p className="text-xs text-slate-500 mb-3">Click on the map to drop a pin.</p>
                                    <div className={`flex-grow min-h-[300px] w-full rounded-2xl overflow-hidden border-2 transition-colors ${locationSelected ? 'border-teal-500' : 'border-slate-200'}`}>
                                        <APIProvider apiKey={MAPS_API_KEY}>
                                            <Map
                                                defaultCenter={location}
                                                defaultZoom={12}
                                                mapId="REPORT_STRAY_MAP_ID"
                                                disableDefaultUI={true}
                                                zoomControl={true}
                                                onClick={handleMapClick}
                                            >
                                                {locationSelected && <Marker position={location} />}
                                            </Map>
                                        </APIProvider>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={loading || duplicateWarning}
                                    className="px-8 py-3 bg-teal-600 text-white rounded-full font-medium hover:bg-teal-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Processing...' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default StrayReport;