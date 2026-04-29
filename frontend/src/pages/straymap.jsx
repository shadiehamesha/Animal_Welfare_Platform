import React, { useEffect, useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/navigation';
import Footer from '../components/footer';

const StrayMap = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const MAPS_API_KEY = import.meta.env.VITE_MAPS || import.meta.env.VITE_MAPS_API_KEY || "";

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/reports/public');
                setReports(response.data);
            } catch (error) {
                console.error("Failed to load public reports:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <div className="text-teal-600 font-medium bg-teal-50 px-6 py-3 rounded-full">
                        Loading community map...
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
            <Navbar />
            
            <main className="flex-grow relative flex flex-col w-full h-[calc(100vh-80px)] min-h-[600px]">
                {/* Header Overlay */}
                <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-start pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-sm border border-slate-100 pointer-events-auto max-w-sm">
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Community Stray Map</h1>
                        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                            Showing <span className="font-medium text-teal-600">{reports.length}</span> active reports. 
                            Locations are approximate (~500m radius) to protect user privacy.
                        </p>
                    </div>
                    
                    <Link 
                        to="/report"
                        className="pointer-events-auto px-6 py-3 bg-teal-600 text-white rounded-full font-medium shadow-lg hover:bg-teal-700 transition-colors hover:-translate-y-0.5"
                    >
                        + Report a Stray
                    </Link>
                </div>

                {/* Map Container */}
                <div className="flex-grow w-full">
                    <APIProvider apiKey={MAPS_API_KEY}>
                        <Map
                            defaultCenter={{ lat: 7.8731, lng: 80.7718 }} // Centered on Sri Lanka
                            defaultZoom={8}
                            mapId="PUBLIC_STRAY_DIRECTORY_MAP_ID"
                            disableDefaultUI={true}
                            zoomControl={true}
                        >
                            {reports.map((report) => (
                                <AdvancedMarker
                                    key={report._id}
                                    position={{ 
                                        lat: report.location.coordinates[1], 
                                        lng: report.location.coordinates[0] 
                                    }}
                                    onClick={() => setSelectedReport(report)}
                                >
                                    <Pin 
                                        background={report.species === 'Dog' ? '#0d9488' : '#eab308'} // Teal for Dogs, Yellow for Cats/Other
                                        borderColor={'#ffffff'}
                                        glyphColor={'#ffffff'}
                                    />
                                </AdvancedMarker>
                            ))}

                            {/* Information Window for selected marker */}
                            {selectedReport && (
                                <InfoWindow
                                    position={{ 
                                        lat: selectedReport.location.coordinates[1], 
                                        lng: selectedReport.location.coordinates[0] 
                                    }}
                                    onCloseClick={() => setSelectedReport(null)}
                                    headerDisabled={true}
                                    style={{ padding: 0, borderRadius: '1rem' }}
                                >
                                    <div className="p-4 max-w-[250px] font-sans">
                                        <div className="w-full h-32 rounded-xl overflow-hidden mb-3 bg-slate-100">
                                            <img 
                                                src={`http://localhost:5000${selectedReport.imageUrl}`} 
                                                alt={`Stray ${selectedReport.species}`} 
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full">
                                                {selectedReport.species}
                                            </span>
                                            <span className="text-xs text-slate-400">
                                                {new Date(selectedReport.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 line-clamp-3">
                                            {selectedReport.description}
                                        </p>
                                    </div>
                                </InfoWindow>
                            )}
                        </Map>
                    </APIProvider>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default StrayMap;