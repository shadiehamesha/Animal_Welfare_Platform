import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import ModernTimePicker from '../../utils/ModernTimePicker';

const HospitalModal = ({ isOpen, onClose, onSave, hospital }) => {
    const [formData, setFormData] = useState({
        name: '', 
        address: '', 
        city: '',
        location: { lat: 7.8731, lng: 80.7718 },
        hours: { open: '09:00', close: '17:00', is24_7: false },
        contact: { phone: '', email: '', website: '' }
    });

    const MAPS_API_KEY = import.meta.env.VITE_MAPS || import.meta.env.VITE_MAPS_API_KEY || "";

    useEffect(() => {
        if (hospital) {
            setFormData({
                name: hospital.name || '',
                address: hospital.address || '',
                city: hospital.city || '',
                location: { 
                    lat: hospital.location?.lat || 7.8731, 
                    lng: hospital.location?.lng || 80.7718 
                },
                hours: { 
                    open: hospital.hours?.open || '09:00', 
                    close: hospital.hours?.close || '17:00', 
                    is24_7: hospital.hours?.is24_7 || false 
                },
                contact: { 
                    phone: hospital.contact?.phone || '', 
                    email: hospital.contact?.email || '', 
                    website: hospital.contact?.website || '' 
                }
            });
        } else {
            setFormData({
                name: '', address: '', city: '',
                location: { lat: 7.8731, lng: 80.7718 },
                hours: { open: '09:00', close: '17:00', is24_7: false },
                contact: { phone: '', email: '', website: '' }
            });
        }
    }, [hospital, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNestedChange = (e, section) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [section]: { 
                ...prev[section], 
                [name]: type === 'checkbox' ? checked : value 
            }
        }));
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
        onSave(formData, hospital ? hospital._id : null);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] p-8 max-w-3xl w-full shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
                
                <div className="flex justify-between items-center mb-6 shrink-0 border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {hospital ? 'Edit Hospital' : 'Add New Hospital'}
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 hover:bg-gray-200 transition-colors">
                        <FaTimes />
                    </button>
                </div>
                
                <div className="overflow-y-auto px-2 py-2 custom-scrollbar">
                    <form id="hospitalForm" onSubmit={handleSubmit} className="space-y-6">

                        {/* General Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-slate-800 mb-1">Clinic Name *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-slate-800 mb-1">Address *</label>
                                <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-1">City *</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
                            </div>
                        </div>

                        {/* Interactive Map for Coordinates */}
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                            <label className="block text-sm font-bold text-slate-800 mb-1">Exact Location *</label>
                            <p className="text-xs text-slate-500 mb-3">Click on the map to pinpoint the hospital's coordinates.</p>
                            
                            <div className="w-full h-[250px] rounded-xl overflow-hidden border border-gray-200 mb-3 focus-within:border-teal-500 transition-all">
                                <APIProvider apiKey={MAPS_API_KEY}>
                                    <Map
                                        defaultCenter={formData.location}
                                        defaultZoom={12}
                                        mapId="HOSPITAL_MODAL_MAP_ID"
                                        disableDefaultUI={true}
                                        zoomControl={true}
                                        onClick={handleMapClick}
                                    >
                                        <Marker position={formData.location} />
                                    </Map>
                                </APIProvider>
                            </div>
                            
                            <div className="flex gap-4 text-xs font-mono text-slate-500 bg-white p-2 rounded-lg border border-gray-100 w-max">
                                <span>Lat: {formData.location.lat.toFixed(5)}</span>
                                <span>Lng: {formData.location.lng.toFixed(5)}</span>
                            </div>
                        </div>

                        {/* Hours */}
                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                            <h3 className="text-sm font-bold text-slate-800 mb-4">Operating Hours</h3>
                            <div className="mb-4 flex items-center">
                                <input type="checkbox" id="is24_7" name="is24_7" checked={formData.hours.is24_7} onChange={(e) => handleNestedChange(e, 'hours')} className="w-5 h-5 text-teal-600 bg-white border-gray-300 rounded focus:ring-teal-500" />
                                <label htmlFor="is24_7" className="ml-2 text-sm font-semibold text-slate-700 cursor-pointer">Open 24/7 (Emergency Care)</label>
                            </div>
                            {!formData.hours.is24_7 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Open Time *</label>
                                        <ModernTimePicker 
                                            name="open" 
                                            value={formData.hours.open} 
                                            onChange={(e) => handleNestedChange(e, 'hours')} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Close Time *</label>
                                        <ModernTimePicker 
                                            name="close" 
                                            value={formData.hours.close} 
                                            onChange={(e) => handleNestedChange(e, 'hours')} 
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Contact */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-1">Phone *</label>
                                <input type="tel" name="phone" value={formData.contact.phone} onChange={(e) => handleNestedChange(e, 'contact')} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-1">Email</label>
                                <input type="email" name="email" value={formData.contact.email} onChange={(e) => handleNestedChange(e, 'contact')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-slate-800 mb-1">Website</label>
                                <input type="url" name="website" value={formData.contact.website} onChange={(e) => handleNestedChange(e, 'contact')} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
                            </div>
                        </div>

                    </form>
                </div>
                
                <div className="flex gap-4 pt-6 mt-4 border-t border-gray-100 shrink-0">
                    <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 border border-gray-200 text-slate-600 font-bold rounded-full hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" form="hospitalForm" className="flex-1 px-6 py-3.5 bg-teal-600 text-white font-bold rounded-full hover:bg-teal-700 transition-colors shadow-md">
                        {hospital ? 'Save Changes' : 'Create Hospital'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default HospitalModal;