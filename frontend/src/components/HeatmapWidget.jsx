import React, { useEffect, useState } from 'react';
import { APIProvider, Map, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import axios from 'axios';

// Component responsible for rendering the actual Heatmap Layer inside the map context
const HeatmapLayer = ({ data }) => {
    const map = useMap();
    const visualization = useMapsLibrary('visualization'); // Load the visualization library

    useEffect(() => {
        // Wait until map, data, AND the visualization library are fully loaded
        if (!map || !data || data.length === 0 || !visualization) return;

        // Map the backend coordinates to Google Maps LatLng objects
        const heatmapData = data.map(point => ({
            location: new window.google.maps.LatLng(point.lat, point.lng),
            weight: point.weight || 1
        }));

        // Initialize the visualization layer using the safely loaded library
        const heatmap = new visualization.HeatmapLayer({
            data: heatmapData,
            radius: 30, // Adjust radius to determine cluster spread
            opacity: 0.8
        });

        heatmap.setMap(map);

        // Cleanup when unmounting or data changes
        return () => heatmap.setMap(null);
    }, [map, data, visualization]);

    return null; 
};

const HeatmapWidget = ({ token }) => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);
    const MAPS_API_KEY = import.meta.env.VITE_MAPS || import.meta.env.VITE_MAPS_API_KEY || "";

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/reports/analytics/heatmap', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHeatmapData(response.data);
            } catch (error) {
                console.error("Failed to load heatmap data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [token]);

    if (loading) {
        return (
            <div className="flex h-96 w-full items-center justify-center rounded-[2rem] bg-slate-50 text-slate-500">
                <span className="font-medium">Loading geospatial analytics...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-800 tracking-tight">Stray Density Heatmap</h3>
                <span className="text-sm font-medium text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
                    {heatmapData.length} Active Reports
                </span>
            </div>
            
            <div className="h-[400px] w-full overflow-hidden rounded-[2rem] shadow-sm border border-slate-100">
                <APIProvider apiKey={MAPS_API_KEY}>
                    <Map
                        defaultCenter={{ lat: 7.8731, lng: 80.7718 }} // Centered on Sri Lanka
                        defaultZoom={7}
                        mapId="HEATMAP_WIDGET_MAP_ID"
                        disableDefaultUI={true}
                        zoomControl={true}
                    >
                        <HeatmapLayer data={heatmapData} />
                    </Map>
                </APIProvider>
            </div>
        </div>
    );
};

export default HeatmapWidget;