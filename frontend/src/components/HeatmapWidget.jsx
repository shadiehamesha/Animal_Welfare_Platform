import React, { useEffect, useState } from 'react';
import { APIProvider, Map, useMap } from '@vis.gl/react-google-maps';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { HeatmapLayer as DeckGlHeatmapLayer } from '@deck.gl/aggregation-layers';
import axios from 'axios';

const HeatmapOverlay = ({ data }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !data || data.length === 0) return;

        // Deck.gl strictly requires arrays in [longitude, latitude] order
        const heatmapData = data.map(point => ({
            position: [point.lng, point.lat], 
            weight: point.weight || 1
        }));

        const heatmapLayer = new DeckGlHeatmapLayer({
            id: 'heatmap-layer',
            data: heatmapData,
            getPosition: d => d.position,
            getWeight: d => d.weight,
            radiusPixels: 30, 
        });

        const overlay = new GoogleMapsOverlay({
            layers: [heatmapLayer]
        });

        // Attach the deck.gl overlay to the Google Map instance
        overlay.setMap(map);

        return () => {
            overlay.setMap(null);
        };
    }, [map, data]);

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
                <APIProvider apiKey={MAPS_API_KEY} version="weekly">
                    <Map
                        defaultCenter={{ lat: 7.8731, lng: 80.7718 }} 
                        defaultZoom={7}
                        mapId="HEATMAP_WIDGET_MAP_ID"
                        disableDefaultUI={true}
                        zoomControl={true}
                    >
                        <HeatmapOverlay data={heatmapData} />
                    </Map>
                </APIProvider>
            </div>
        </div>
    );
};

export default HeatmapWidget;