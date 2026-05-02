import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { FaStar, FaReply, FaBullhorn } from 'react-icons/fa';
import Navbar from '../../components/navigation.jsx';
import Footer from '../../components/footer.jsx';
import UserContactWidget from '../../components/UserContactWidget.jsx';
import ModernTimePicker from '../../utils/ModernTimePicker.jsx';
import HeatmapWidget from '../../components/HeatmapWidget.jsx';

const HospitalDashboard = () => {
    const [userName, setUserName] = useState('Hospital');
    const [userId, setUserId] = useState(null);
    const role = localStorage.getItem('role') || 'hospitals/veterinarians';
    
    const MAPS_API_KEY = import.meta.env.VITE_MAPS || import.meta.env.VITE_MAPS_API_KEY || "";

    // View States
    const [hospital, setHospital] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Reply States
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");

    // Form Data
    const [formData, setFormData] = useState({
        name: '', address: '', city: '',
        location: { lat: 7.8731, lng: 80.7718 },
        hours: { open: '09:00', close: '17:00', is24_7: false },
        contact: { phone: '', email: '', website: '' }
    });

    // Alert Broadcast State
    const [alertForm, setAlertForm] = useState({
        message: '', daysValid: 7, location: { lat: 7.8731, lng: 80.7718 }
    });
    const [isAlertLoading, setIsAlertLoading] = useState(false);

    useEffect(() => {
        const fetchUserDataAndHospital = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    setUserId(decoded.id);

                    const userRes = await fetch(`http://localhost:5000/api/users/${decoded.id}`, { headers: { Authorization: `Bearer ${token}` } });
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        setUserName(userData.name);
                    }

                    const hospitalRes = await fetch('http://localhost:5000/api/hospitals');
                    if (hospitalRes.ok) {
                        const allHospitals = await hospitalRes.json();
                        const myHospital = allHospitals.find(h => h.manager === decoded.id);
                        
                        if (myHospital) {
                            setHospital(myHospital);
                            setFormData({
                                name: myHospital.name || '',
                                address: myHospital.address || '',
                                city: myHospital.city || '',
                                location: { 
                                    lat: myHospital.location?.lat || 7.8731, 
                                    lng: myHospital.location?.lng || 80.7718 
                                },
                                hours: { 
                                    open: myHospital.hours?.open || '09:00', 
                                    close: myHospital.hours?.close || '17:00', 
                                    is24_7: myHospital.hours?.is24_7 || false 
                                },
                                contact: { 
                                    phone: myHospital.contact?.phone || '', 
                                    email: myHospital.contact?.email || '', 
                                    website: myHospital.contact?.website || '' 
                                }
                            });
                        } else {
                            setIsEditing(true);
                        }
                    }
                } catch (error) { console.error("Failed to fetch data", error); }
            }
        };
        fetchUserDataAndHospital();
    }, []);

    // Handlers
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleNestedChange = (e, section) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [section]: { ...prev[section], [name]: type === 'checkbox' ? checked : value }
        }));
    };

    const handleMapClick = (e) => {
        if (!isEditing) return;
        setFormData(prev => ({
            ...prev,
            location: { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        const token = localStorage.getItem('token');
        
        const payload = {
            ...formData,
            location: { lat: parseFloat(formData.location.lat), lng: parseFloat(formData.location.lng) }
        };

        try {
            const url = hospital ? `http://localhost:5000/api/hospitals/${hospital._id}` : `http://localhost:5000/api/hospitals`;
            const method = hospital ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (res.ok) {
                setHospital(data);
                setIsEditing(false);
                setMessage({ type: 'success', text: 'Hospital details saved successfully!' });
                setTimeout(() => setMessage({ type: '', text: '' }), 5000);
            } else {
                setMessage({ type: 'error', text: data.message || 'Failed to save details.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An error occurred while saving.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReplySubmit = async (reviewId) => {
        if (!replyText.trim()) return;
        const token = localStorage.getItem('token');
        
        try {
            const res = await fetch(`http://localhost:5000/api/hospitals/${hospital._id}/reviews/${reviewId}/respond`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ response: replyText })
            });

            if (res.ok) {
                const updatedHospital = await res.json();
                setHospital(updatedHospital);
                setReplyingTo(null);
                setReplyText("");
            } else {
                alert("Failed to submit reply.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Alert Broadcast Handler
    const handleAlertSubmit = async (e) => {
        e.preventDefault();
        setIsAlertLoading(true);
        setMessage({ type: '', text: '' });
        
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    type: 'Disease Outbreak',
                    message: alertForm.message,
                    daysValid: alertForm.daysValid,
                    lat: alertForm.location.lat,
                    lng: alertForm.location.lng
                })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'Disease outbreak alert broadcasted to the community.' });
                setAlertForm({ message: '', daysValid: 7, location: { lat: 7.8731, lng: 80.7718 } });
            } else {
                setMessage({ type: 'error', text: 'Failed to broadcast alert.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Network error while broadcasting.' });
        } finally {
            setIsAlertLoading(false);
            setTimeout(() => setMessage({ type: '', text: '' }), 5000);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Dr. {userName} / Clinic</h1>
                            <p className="text-teal-600 font-medium capitalize flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-teal-500"></span>{role}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        
                        {/* Manager Section */}
                        <div className="lg:col-span-2 bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                            
                            {/* Tabs */}
                            {hospital && !isEditing && (
                                <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto">
                                    <button 
                                        onClick={() => setActiveTab('profile')} 
                                        className={`flex-1 py-4 px-4 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'profile' ? 'border-teal-600 text-teal-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Clinic Profile
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('reviews')} 
                                        className={`flex-1 py-4 px-4 font-bold text-sm transition-colors border-b-2 flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'reviews' ? 'border-teal-600 text-teal-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Manage Reviews
                                        {hospital.reviews?.length > 0 && (
                                            <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-xs">{hospital.reviews.length}</span>
                                        )}
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('analytics')} 
                                        className={`flex-1 py-4 px-4 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'analytics' ? 'border-teal-600 text-teal-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                    >
                                        Geospatial Analytics
                                    </button>
                                    {/* Alerts Tab */}
                                    <button 
                                        onClick={() => setActiveTab('alerts')} 
                                        className={`flex-1 py-4 px-4 font-bold text-sm transition-colors border-b-2 flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === 'alerts' ? 'border-teal-600 text-teal-700 bg-white' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                                    >
                                        <FaBullhorn /> Broadcast Alerts
                                    </button>
                                </div>
                            )}

                            <div className="p-8">
                                {message.text && (
                                    <div className={`mb-6 px-4 py-3 rounded-2xl text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                                        {message.text}
                                    </div>
                                )}

                                {/* PROFILE TAB */}
                                {(!hospital || isEditing || activeTab === 'profile') && (
                                    <>
                                        <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-4">
                                            <h2 className="text-xl font-bold text-slate-900">{isEditing ? 'Edit Details' : 'Clinic Directory Profile'}</h2>
                                            {hospital && !isEditing && (
                                                <button onClick={() => setIsEditing(true)} className="text-teal-600 text-sm font-semibold hover:text-teal-700 bg-teal-50 px-4 py-2 rounded-full transition-colors">
                                                    Edit Details
                                                </button>
                                            )}
                                        </div>

                                        {!isEditing && hospital ? (
                                            /* View Mode */
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div>
                                                        <p className="text-sm text-slate-500 font-medium mb-1">Clinic Name</p>
                                                        <p className="text-slate-900 font-bold text-lg">{hospital.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500 font-medium mb-1">City</p>
                                                        <p className="text-slate-900 font-medium">{hospital.city}</p>
                                                    </div>
                                                    <div className="sm:col-span-2">
                                                        <p className="text-sm text-slate-500 font-medium mb-1">Full Address</p>
                                                        <p className="text-slate-900 font-medium">{hospital.address}</p>
                                                    </div>
                                                </div>

                                                <div className="border-t border-gray-50 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                    <div>
                                                        <p className="text-sm text-slate-500 font-medium mb-1">Contact Info</p>
                                                        <p className="text-slate-900 font-medium">📞 {hospital.contact.phone}</p>
                                                        {hospital.contact.email && <p className="text-slate-900 font-medium">✉️ {hospital.contact.email}</p>}
                                                        {hospital.contact.website && <p className="text-slate-900 font-medium">🌐 {hospital.contact.website}</p>}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-500 font-medium mb-1">Operating Hours</p>
                                                        {hospital.hours.is24_7 ? (
                                                            <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold mt-1">24/7 Emergency</span>
                                                        ) : (
                                                            <p className="text-slate-900 font-medium">
                                                                🕒 
                                                                {new Date(`1970-01-01T${hospital.hours.open}:00`).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})} - 
                                                                {new Date(`1970-01-01T${hospital.hours.close}:00`).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Mini Map View */}
                                                <div className="border-t border-gray-50 pt-6">
                                                    <p className="text-sm text-slate-500 font-medium mb-2">Location Map</p>
                                                    <div className="h-48 w-full rounded-2xl overflow-hidden border border-gray-200">
                                                        <APIProvider apiKey={MAPS_API_KEY}>
                                                            <Map 
                                                                mapId="DEMO_MAP_ID"
                                                                defaultCenter={{ lat: hospital.location.lat, lng: hospital.location.lng }} 
                                                                defaultZoom={14} 
                                                                disableDefaultUI
                                                            >
                                                                <AdvancedMarker position={{ lat: hospital.location.lat, lng: hospital.location.lng }}>
                                                                    <Pin background={'#0d9488'} borderColor={'#0f766e'} glyphColor={'#fff'} />
                                                                </AdvancedMarker>
                                                            </Map>
                                                        </APIProvider>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Edit / Create Mode */
                                            <form onSubmit={handleSubmit} className="space-y-6">
                                                {!hospital && (
                                                    <div className="bg-teal-50 border border-teal-200 text-teal-800 px-4 py-3 rounded-2xl text-sm font-medium mb-6">
                                                        Welcome! Please complete your clinic's profile to appear in the public directory.
                                                    </div>
                                                )}

                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">General Information</h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="sm:col-span-2">
                                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Clinic Name *</label>
                                                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm" />
                                                        </div>
                                                        <div className="sm:col-span-2">
                                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Full Address *</label>
                                                            <input type="text" name="address" value={formData.address} onChange={handleChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-500 mb-1">City *</label>
                                                            <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm" />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Interactive Map Picker */}
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-800 mb-2 border-b pb-2">Map Location *</h3>
                                                    <p className="text-xs text-slate-500 mb-3">Click on the map to pin your clinic's exact location.</p>
                                                    <div className="h-64 w-full rounded-2xl overflow-hidden border border-gray-200 relative bg-gray-100">
                                                        <APIProvider apiKey={MAPS_API_KEY}>
                                                            <Map 
                                                                mapId="DEMO_MAP_ID"
                                                                defaultCenter={{ lat: formData.location.lat, lng: formData.location.lng }} 
                                                                defaultZoom={7} 
                                                                onClick={handleMapClick}
                                                                gestureHandling={'greedy'}
                                                            >
                                                                <AdvancedMarker position={{ lat: formData.location.lat, lng: formData.location.lng }}>
                                                                    <Pin background={'#0d9488'} borderColor={'#0f766e'} glyphColor={'#fff'} />
                                                                </AdvancedMarker>
                                                            </Map>
                                                        </APIProvider>
                                                    </div>
                                                </div>

                                                {/* Operating Hours */}
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Operating Hours</h3>
                                                    <div className="mb-4 flex items-center">
                                                        <input type="checkbox" id="is24_7" name="is24_7" checked={formData.hours.is24_7} onChange={(e) => handleNestedChange(e, 'hours')} className="w-4 h-4 text-teal-600 bg-gray-50 border-gray-300 rounded focus:ring-teal-500" />
                                                        <label htmlFor="is24_7" className="ml-2 text-sm font-semibold text-slate-700">Open 24/7 (Emergency Care)</label>
                                                    </div>
                                                    {!formData.hours.is24_7 && (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-xs font-semibold text-slate-500 mb-1">Opening Time *</label>
                                                                <ModernTimePicker 
                                                                    name="open" 
                                                                    value={formData.hours.open} 
                                                                    onChange={(e) => handleNestedChange(e, 'hours')} 
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-xs font-semibold text-slate-500 mb-1">Closing Time *</label>
                                                                <ModernTimePicker 
                                                                    name="close" 
                                                                    value={formData.hours.close} 
                                                                    onChange={(e) => handleNestedChange(e, 'hours')} 
                                                                />
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Contact Details */}
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-800 mb-4 border-b pb-2">Contact Details</h3>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number *</label>
                                                            <input type="tel" name="phone" value={formData.contact.phone} onChange={(e) => handleNestedChange(e, 'contact')} required className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm" />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                                                            <input type="email" name="email" value={formData.contact.email} onChange={(e) => handleNestedChange(e, 'contact')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm" />
                                                        </div>
                                                        <div className="sm:col-span-2">
                                                            <label className="block text-xs font-semibold text-slate-500 mb-1">Website</label>
                                                            <input type="url" name="website" value={formData.contact.website} onChange={(e) => handleNestedChange(e, 'contact')} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm" placeholder="https://" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-4 pt-4">
                                                    <button type="submit" disabled={isLoading} className={`flex-1 bg-teal-600 text-white py-3 rounded-full font-semibold transition duration-200 shadow-md ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-teal-700'}`}>
                                                        {isLoading ? 'Saving...' : 'Save Profile'}
                                                    </button>
                                                    {hospital && (
                                                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 border border-gray-200 text-slate-600 py-3 rounded-full font-semibold hover:bg-gray-50 transition">
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </form>
                                        )}
                                    </>
                                )}

                                {/* REVIEWS TAB */}
                                {activeTab === 'reviews' && hospital && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-4">
                                            <h2 className="text-xl font-bold text-slate-900">Patient Reviews</h2>
                                            <div className="flex items-center gap-1 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-sm font-bold">
                                                <FaStar /> <span>{hospital.rating.toFixed(1)} Average</span>
                                            </div>
                                        </div>

                                        {hospital.reviews?.length > 0 ? (
                                            hospital.reviews.map((review) => (
                                                <div key={review._id} className="border border-gray-100 rounded-2xl p-5 shadow-sm bg-white">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div className="font-bold text-slate-900">{review.name}</div>
                                                        <div className="flex text-orange-400">
                                                            {[...Array(5)].map((_, i) => (
                                                                <FaStar key={i} className={i < review.rating ? "text-orange-400" : "text-gray-200"} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-600 text-[15px] mb-3">{review.comment}</p>
                                                    <p className="text-xs text-slate-400 mb-4">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                    
                                                    {/* Manager Response Logic */}
                                                    {review.response && replyingTo !== review._id ? (
                                                        <div className="bg-teal-50 border-l-4 border-teal-500 rounded-r-xl p-4 mt-2">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <p className="text-xs font-bold text-teal-800 flex items-center gap-2"><FaReply /> Clinic Response</p>
                                                                <button 
                                                                    onClick={() => { setReplyingTo(review._id); setReplyText(review.response); }}
                                                                    className="text-[11px] font-bold text-teal-600 hover:text-teal-800 transition-colors"
                                                                >
                                                                    Edit Reply
                                                                </button>
                                                            </div>
                                                            <p className="text-teal-900 text-[14px] leading-relaxed">{review.response}</p>
                                                            <p className="text-[11px] text-teal-600 mt-2">{new Date(review.respondedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    ) : replyingTo === review._id ? (
                                                        <div className="bg-gray-50 p-4 rounded-xl mt-4 border border-gray-200">
                                                            <label className="block text-xs font-bold text-slate-700 mb-2">Your Reply:</label>
                                                            <textarea 
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none text-sm mb-3"
                                                                rows="3"
                                                                placeholder="Type a professional response..."
                                                            ></textarea>
                                                            <div className="flex gap-2 justify-end">
                                                                <button onClick={() => { setReplyingTo(null); setReplyText(""); }} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
                                                                <button onClick={() => handleReplySubmit(review._id)} className="px-5 py-2 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors">
                                                                    {review.response ? "Update Reply" : "Post Reply"}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => { setReplyingTo(review._id); setReplyText(""); }} className="text-teal-600 text-sm font-semibold hover:text-teal-700 flex items-center gap-2">
                                                            <FaReply /> Reply to Review
                                                        </button>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                                                <span className="text-4xl">⭐</span>
                                                <p className="text-slate-500 mt-4 font-medium">No reviews yet.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ANALYTICS TAB */}
                                {activeTab === 'analytics' && hospital && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-4">
                                            <h2 className="text-xl font-bold text-slate-900">Density Heatmap</h2>
                                        </div>
                                        <p className="text-slate-500 text-sm mb-4">
                                            Geospatial analytics of reported stray animals to help clinics anticipate local needs and optimize resource allocation.
                                        </p>
                                        <div className="w-full min-h-[400px]">
                                            <HeatmapWidget token={localStorage.getItem('token')} />
                                        </div>
                                    </div>
                                )}

                                {/* ALERTS TAB */}
                                {activeTab === 'alerts' && hospital && (
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center mb-4 border-b border-gray-50 pb-4">
                                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                                Broadcast Disease Alert
                                            </h2>
                                        </div>
                                        <p className="text-slate-500 text-sm mb-6">
                                            Notify the community about localized disease outbreaks. Alerts will appear on the public Notification Hub and remain active for the specified duration.
                                        </p>
                                        <form onSubmit={handleAlertSubmit} className="space-y-6 max-w-2xl">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 mb-1">Alert Message *</label>
                                                <textarea 
                                                    required
                                                    value={alertForm.message}
                                                    onChange={e => setAlertForm({...alertForm, message: e.target.value})}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm resize-none"
                                                    rows="3"
                                                    placeholder="e.g., URGENT: Parvovirus outbreak detected in this area. Please ensure your dogs are vaccinated."
                                                ></textarea>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-500 mb-1">Duration (Days) *</label>
                                                <input 
                                                    type="number" 
                                                    required
                                                    min="1"
                                                    max="30"
                                                    value={alertForm.daysValid}
                                                    onChange={e => setAlertForm({...alertForm, daysValid: parseInt(e.target.value)})}
                                                    className="w-full sm:w-1/3 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm" 
                                                />
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-slate-800 mb-2 border-b pb-2">Affected Area *</h3>
                                                <p className="text-xs text-slate-500 mb-3">Click on the map to pin the epicenter of the outbreak.</p>
                                                <div className="h-64 w-full rounded-2xl overflow-hidden border border-gray-200 relative bg-gray-100 shadow-inner">
                                                    <APIProvider apiKey={MAPS_API_KEY}>
                                                        <Map 
                                                            mapId="ALERT_MAP_ID"
                                                            defaultCenter={alertForm.location} 
                                                            center={alertForm.location}
                                                            defaultZoom={12} 
                                                            onClick={(e) => setAlertForm({...alertForm, location: {lat: e.detail.latLng.lat, lng: e.detail.latLng.lng}})}
                                                            gestureHandling={'greedy'}
                                                        >
                                                            <AdvancedMarker position={alertForm.location}>
                                                                <Pin background={'#ef4444'} borderColor={'#b91c1c'} glyphColor={'#fff'} />
                                                            </AdvancedMarker>
                                                        </Map>
                                                    </APIProvider>
                                                </div>
                                            </div>
                                            <button 
                                                type="submit" 
                                                disabled={isAlertLoading} 
                                                className={`bg-red-600 text-white font-bold py-3 px-8 rounded-full shadow-md transition-colors ${isAlertLoading ? 'opacity-50' : 'hover:bg-red-700'}`}
                                            >
                                                {isAlertLoading ? 'Broadcasting...' : 'Broadcast Alert'}
                                            </button>
                                        </form>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Support Widget */}
                        <div className="lg:col-span-1">
                            <UserContactWidget />
                        </div>

                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default HospitalDashboard;