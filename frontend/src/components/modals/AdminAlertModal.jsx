import React, { useState, useRef, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

const CustomSelect = ({ name, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 bg-gray-50 border ${isOpen ? 'border-teal-500 ring-2 ring-teal-500 ring-opacity-20' : 'border-gray-200'} rounded-xl focus:outline-none transition-all duration-200 text-slate-800 flex justify-between items-center text-sm`}
            >
                <span>{value}</span>
                <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className={`absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.05)] py-2 transition-all duration-200 origin-top max-h-48 overflow-y-auto ${isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'}`}>
                {options.map((option) => (
                    <div
                        key={option}
                        onClick={() => handleSelect(option)}
                        className={`px-4 py-2 cursor-pointer text-sm transition-colors duration-150 flex items-center justify-between ${value === option ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600 hover:bg-gray-50 hover:text-teal-600'}`}
                    >
                        {option}
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminAlertModal = ({ isOpen, onClose, onSave }) => {
    const MAPS_API_KEY = import.meta.env.VITE_MAPS || import.meta.env.VITE_MAPS_API_KEY || "";

    const [formData, setFormData] = useState({
        type: 'Disease Outbreak',
        message: '',
        daysValid: 7,
        location: { lat: 7.8731, lng: 80.7718 }
    });

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleMapClick = (e) => {
        if (e.detail.latLng) {
            setFormData(prev => ({
                ...prev,
                location: { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng }
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            type: formData.type,
            message: formData.message,
            daysValid: parseInt(formData.daysValid),
            lat: formData.location.lat,
            lng: formData.location.lng
        });
    };

    const alertColor = formData.type === 'Disease Outbreak' ? 'red' : formData.type === 'Lost Pet' ? 'orange' : 'blue';

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
                
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Broadcast Alert</h2>
                        <p className="text-sm text-slate-500 font-semibold mt-1">Push a notification to the community hub.</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 hover:bg-gray-200 transition-colors">
                        <FaTimes />
                    </button>
                </div>
                
                <div className="overflow-y-auto px-2 py-2 custom-scrollbar">
                    <form id="adminAlertForm" onSubmit={handleSubmit} className="space-y-6">
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-1">Alert Type</label>
                                <CustomSelect 
                                    name="type" 
                                    value={formData.type} 
                                    options={['Disease Outbreak', 'Lost Pet', 'Immunization Reminder']} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-1">Duration (Days Active)</label>
                                <input 
                                    type="number" 
                                    name="daysValid" 
                                    value={formData.daysValid} 
                                    onChange={handleChange} 
                                    min="1" max="30" required 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm" 
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-slate-800 mb-1">Broadcast Message</label>
                                <textarea 
                                    name="message" 
                                    value={formData.message} 
                                    onChange={handleChange} 
                                    required rows="3" 
                                    placeholder="Enter the critical details for the public..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm resize-none" 
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-2 border-b pb-2">Targeted Location Area</h3>
                            <p className="text-xs text-slate-500 mb-3">Click the map to drop a pin at the epicenter of this alert.</p>
                            
                            <div className={`h-64 w-full rounded-2xl overflow-hidden border-2 transition-colors relative bg-gray-100 ${
                                alertColor === 'red' ? 'border-red-200' : alertColor === 'orange' ? 'border-orange-200' : 'border-blue-200'
                            }`}>
                                <APIProvider apiKey={MAPS_API_KEY}>
                                    <Map 
                                        mapId="ADMIN_ALERT_MAP"
                                        defaultCenter={formData.location} 
                                        defaultZoom={10} 
                                        onClick={handleMapClick}
                                        gestureHandling={'greedy'}
                                        disableDefaultUI
                                    >
                                        <AdvancedMarker position={formData.location}>
                                            <Pin 
                                                background={alertColor === 'red' ? '#ef4444' : alertColor === 'orange' ? '#f97316' : '#3b82f6'} 
                                                borderColor={alertColor === 'red' ? '#b91c1c' : alertColor === 'orange' ? '#c2410c' : '#1d4ed8'} 
                                                glyphColor={'#fff'} 
                                            />
                                        </AdvancedMarker>
                                    </Map>
                                </APIProvider>
                            </div>
                        </div>

                    </form>
                </div>
                
                <div className="flex gap-4 pt-6 mt-4 border-t border-gray-100 shrink-0">
                    <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 border border-gray-200 text-slate-600 font-bold rounded-full hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" form="adminAlertForm" className={`flex-1 px-6 py-3.5 text-white font-bold rounded-full shadow-md transition-colors ${
                        alertColor === 'red' ? 'bg-red-600 hover:bg-red-700' : 
                        alertColor === 'orange' ? 'bg-orange-600 hover:bg-orange-700' : 
                        'bg-blue-600 hover:bg-blue-700'
                    }`}>
                        Publish Alert
                    </button>
                </div>

            </div>
            <style dangerouslySetInnerHTML={{__html: `@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } } .animate-fade-in-up { animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`}} />
        </div>
    );
};

export default AdminAlertModal;