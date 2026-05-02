import React, { useState, useEffect } from 'react';
import { FaSyringe, FaExclamationTriangle, FaSearch, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';

const AlertCard = ({ alert }) => {
    // Initialize location with coordinates as a fallback
    const initialLocation = alert.location && alert.location.coordinates && alert.location.coordinates.length === 2
        ? `Lat: ${alert.location.coordinates[1].toFixed(3)}, Lng: ${alert.location.coordinates[0].toFixed(3)}`
        : '';
        
    const [locationName, setLocationName] = useState(initialLocation);

    // Client-side reverse geocoding
    useEffect(() => {
        if (alert.location && alert.location.coordinates && alert.location.coordinates.length === 2) {
            const lng = alert.location.coordinates[0];
            const lat = alert.location.coordinates[1];
            
            const fetchAddress = async () => {
                try {
                    const apiKey = import.meta.env.VITE_MAPS || import.meta.env.VITE_MAPS_API_KEY || "";
                    if (!apiKey) return;
                    
                    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
                    const data = await response.json();
                    
                    if (data.status === 'OK' && data.results.length > 0) {
                        // Look for a locality, sublocality, or neighborhood for a name
                        const addressComponents = data.results[0].address_components;
                        const cityOrLocality = addressComponents.find(c => 
                            c.types.includes('sublocality') || 
                            c.types.includes('locality') || 
                            c.types.includes('neighborhood')
                        );
                        
                        if (cityOrLocality) {
                            setLocationName(cityOrLocality.long_name);
                        } else {
                            // Fallback to the first part of the formatted address
                            setLocationName(data.results[0].formatted_address.split(',')[0]); 
                        }
                    }
                } catch (error) {
                    console.error('Error reverse geocoding:', error);
                    // On error, retain the initial coordinates
                }
            };
            
            fetchAddress();
        }
    }, [alert.location]);

    // Theme configuration based on Alert Type
    const getTheme = () => {
        switch (alert.type) {
            case 'Disease Outbreak':
                return {
                    bg: 'bg-red-50', border: 'border-red-100', iconBg: 'bg-red-100', 
                    iconText: 'text-red-600', titleText: 'text-red-900',
                    icon: <FaExclamationTriangle />
                };
            case 'Lost Pet':
                return {
                    bg: 'bg-orange-50', border: 'border-orange-100', iconBg: 'bg-orange-100', 
                    iconText: 'text-orange-600', titleText: 'text-orange-900',
                    icon: <FaSearch />
                };
            case 'Immunization Reminder':
                return {
                    bg: 'bg-blue-50', border: 'border-blue-100', iconBg: 'bg-blue-100', 
                    iconText: 'text-blue-600', titleText: 'text-blue-900',
                    icon: <FaSyringe />
                };
            default:
                return {
                    bg: 'bg-gray-50', border: 'border-gray-100', iconBg: 'bg-gray-200', 
                    iconText: 'text-gray-600', titleText: 'text-gray-900',
                    icon: <FaExclamationTriangle />
                };
        }
    };

    const theme = getTheme();
    
    const formattedDate = new Date(alert.createdAt).toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    return (
        <div className={`${theme.bg} border ${theme.border} rounded-2xl p-5 flex gap-4 transition-all hover:shadow-md`}>
            {/* Icon Block */}
            <div className={`w-12 h-12 rounded-full ${theme.iconBg} ${theme.iconText} flex items-center justify-center text-xl shrink-0 shadow-sm`}>
                {theme.icon}
            </div>

            {/* Content */}
            <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                    <h3 className={`font-bold ${theme.titleText} uppercase tracking-wide text-xs`}>{alert.type}</h3>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                        <FaCalendarAlt className="opacity-70" /> {formattedDate}
                    </span>
                </div>
                
                <p className="text-slate-800 text-sm font-medium leading-relaxed mb-3">
                    {alert.message}
                </p>

                {/* Geolocation Tag */}
                {alert.location && alert.location.coordinates && alert.location.coordinates.length === 2 && (
                    <div className="inline-flex items-center gap-1.5 bg-white/60 border border-white px-2.5 py-1 rounded-md text-xs font-semibold text-slate-600 shadow-sm">
                        <FaMapMarkerAlt className="text-slate-400" />
                        {locationName}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AlertCard;