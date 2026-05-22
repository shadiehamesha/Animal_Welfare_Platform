import React, { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import { FaMapMarkerAlt, FaPhone, FaTimes, FaSearch, FaEnvelope, FaGlobe, FaCalendarAlt, FaPaw, FaHandsHelping } from "react-icons/fa";
import Navbar from "../components/navigation";
import Footer from "../components/footer";

// Helper component to pan the map 
const MapUpdater = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (map && center) {
            map.panTo(center);
            map.setZoom(zoom);
        }
    }, [map, center, zoom]);
    return null;
};

const Shelters = () => {
    const [shelters, setShelters] = useState([]);
    const [filteredShelters, setFilteredShelters] = useState([]);
    
    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    
    // Modal & Selection States
    const [selectedShelter, setSelectedShelter] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    
    // Associated Data States
    const [shelterPets, setShelterPets] = useState([]);
    const [shelterEvents, setShelterEvents] = useState([]);
    const [shelterTasks, setShelterTasks] = useState([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Set map center default to Sri Lanka
    const [mapCenter, setMapCenter] = useState({ lat: 7.8731, lng: 80.7718 });
    const [mapZoom, setMapZoom] = useState(7);

    const MAPS_API_KEY = import.meta.env.VITE_MAPS || import.meta.env.VITE_MAPS_API_KEY || "";

    useEffect(() => {
        fetchShelters();
    }, []);

    const fetchShelters = async (city = "") => {
        try {
            const url = city 
                ? `http://localhost:5000/api/organizations/public?city=${encodeURIComponent(city)}` 
                : `http://localhost:5000/api/organizations/public`;
                
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                setShelters(data);
                
                if (data.length > 0 && city && data[0].location) {
                    setMapCenter({ lat: data[0].location.lat, lng: data[0].location.lng });
                    setMapZoom(12);
                } else if (!city) {
                    setMapCenter({ lat: 7.8731, lng: 80.7718 });
                    setMapZoom(7);
                }
            }
        } catch (error) {
            console.error("Error fetching shelters:", error);
        }
    };

    // Handle Local Search Filtering
    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const results = shelters.filter(s => {
            const matchesSearch = (s.organizationName && s.organizationName.toLowerCase().includes(lowercasedQuery)) || 
                                  (s.address && s.address.toLowerCase().includes(lowercasedQuery));
            return matchesSearch;
        });
        setFilteredShelters(results);
    }, [searchQuery, shelters]);

    const handleCitySearch = (e) => {
        e.preventDefault();
        fetchShelters(cityFilter);
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setCityFilter("");
        fetchShelters("");
    };

    const openShelterModal = async (shelter) => {
        setSelectedShelter(shelter);
        setActiveTab('profile');
        setIsModalOpen(true);
        setIsLoadingData(true);
        
        try {
            // Fetch associated public data for this shelter concurrently
            const [petsRes, eventsRes, tasksRes] = await Promise.all([
                fetch(`http://localhost:5000/api/pets/public?shelter=${shelter._id}`),
                fetch(`http://localhost:5000/api/events/public?shelter=${shelter._id}`),
                fetch(`http://localhost:5000/api/tasks/public?shelter=${shelter._id}&status=Open`)
            ]);

            if (petsRes.ok) setShelterPets(await petsRes.json());
            if (eventsRes.ok) setShelterEvents(await eventsRes.json());
            if (tasksRes.ok) setShelterTasks(await tasksRes.json());

        } catch (error) {
            console.error("Error fetching shelter details:", error);
        } finally {
            setIsLoadingData(false);
        }
    };

    // Claim / Register for Volunteer Task
    const handleClaimTask = async (taskId) => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert("Please log in to register for volunteer tasks.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/claim`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();
            if (res.ok) {
                alert("Successfully registered for the task!");
                setShelterTasks(prevTasks => 
                    prevTasks.map(t => t._id === taskId ? { ...t, status: 'Claimed' } : t)
                );
            } else {
                alert(data.message || "Failed to register for task.");
            }
        } catch (error) {
            console.error("Error claiming task:", error);
            alert("An error occurred. Please try again.");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <main className="flex-grow flex flex-col pt-8 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                
                {/* Header & Search Section */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                        Find Animal Shelters
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mb-8">
                        Locate verified shelters, NGOs, and rescue organizations near you. Adopt a pet, join local events, or volunteer your time.
                    </p>

                    <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-4 items-center">
                        
                        {/* Search by Name/Address */}
                        <div className="w-full xl:flex-1 flex items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
                            <FaSearch className="text-slate-400 mr-3 shrink-0" />
                            <input 
                                type="text" 
                                placeholder="Search shelter name or address..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent focus:outline-none text-slate-700"
                            />
                        </div>

                        {/* Search by City */}
                        <form onSubmit={handleCitySearch} className="w-full xl:flex-1 flex gap-2">
                            <div className="flex-1 flex items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
                                <FaMapMarkerAlt className="text-slate-400 mr-3 shrink-0" />
                                <input 
                                    type="text" 
                                    placeholder="Filter by city (e.g., Colombo)" 
                                    value={cityFilter}
                                    onChange={(e) => setCityFilter(e.target.value)}
                                    className="w-full bg-transparent focus:outline-none text-slate-700"
                                />
                            </div>
                            <button type="submit" className="bg-[#0d9488] hover:bg-teal-700 text-white px-6 py-3 rounded-2xl font-semibold transition-colors shadow-sm shrink-0">
                                Search
                            </button>
                        </form>

                        {/* Clear Buttons */}
                        <div className="w-full xl:w-auto flex items-center shrink-0">
                            <button 
                                onClick={handleClearFilters}
                                className="w-full border border-gray-200 text-slate-600 hover:bg-gray-50 px-5 py-3.5 rounded-2xl font-semibold transition-colors shadow-sm"
                            >
                                Clear Filters
                            </button>
                        </div>

                    </div>
                </div>

                {/* Full Width Map View */}
                <div className="relative w-full h-[500px] lg:h-[600px] bg-slate-100 rounded-[2.5rem] overflow-hidden border border-gray-200 shadow-inner flex-shrink-0">
                    <APIProvider apiKey={MAPS_API_KEY}>
                        <Map
                            defaultCenter={mapCenter}
                            defaultZoom={mapZoom}
                            mapId="SHELTER_DIRECTORY_MAP"
                            gestureHandling={'greedy'}
                        >
                            <MapUpdater center={mapCenter} zoom={mapZoom} />

                            {filteredShelters.map((shelter) => (
                                shelter.location && (
                                    <AdvancedMarker 
                                        key={shelter._id} 
                                        position={{ lat: shelter.location.lat, lng: shelter.location.lng }}
                                        onClick={() => openShelterModal(shelter)}
                                        className="cursor-pointer"
                                    >
                                        <div className="relative group">
                                            <div className="bg-[#0d9488] text-white px-4 py-2 rounded-full font-bold shadow-lg text-sm border-[3px] border-white group-hover:bg-teal-700 transition-colors whitespace-nowrap flex items-center gap-2">
                                                <FaPaw />
                                                {shelter.organizationName}
                                            </div>
                                            <div className="absolute left-1/2 -bottom-2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white"></div>
                                        </div>
                                    </AdvancedMarker>
                                )
                            ))}
                        </Map>
                    </APIProvider>

                    {filteredShelters.length === 0 && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 pointer-events-none">
                            <span className="text-5xl mb-4">🏡</span>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">No shelters found</h3>
                            <p className="text-slate-600 font-medium text-center px-4 max-w-md">Try adjusting your search terms or exploring a different city.</p>
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            {/* Shelter Details Modal */}
            {isModalOpen && selectedShelter && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 shrink-0">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-1">{selectedShelter.organizationName}</h2>
                                {selectedShelter.registrationNumber && (
                                    <span className="inline-block bg-teal-100 text-teal-800 text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                                        Reg No: {selectedShelter.registrationNumber}
                                    </span>
                                )}
                                <p className="text-slate-500 text-sm flex items-center gap-2">
                                    <FaMapMarkerAlt className="text-teal-600 shrink-0" />
                                    {selectedShelter.address}, {selectedShelter.city}
                                </p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-gray-50 hover:text-slate-800 transition-colors shrink-0">
                                <FaTimes />
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex border-b border-gray-100 px-8 shrink-0 bg-white overflow-x-auto custom-scrollbar">
                            <button 
                                onClick={() => setActiveTab('profile')} 
                                className={`py-4 px-4 font-bold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'profile' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                            >
                                Organization Profile
                            </button>
                            <button 
                                onClick={() => setActiveTab('pets')} 
                                className={`py-4 px-4 font-bold text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'pets' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                            >
                                <FaPaw /> Adoptable Pets
                            </button>
                            <button 
                                onClick={() => setActiveTab('events')} 
                                className={`py-4 px-4 font-bold text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'events' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                            >
                                <FaCalendarAlt /> Events & Drives
                            </button>
                            <button 
                                onClick={() => setActiveTab('volunteer')} 
                                className={`py-4 px-4 font-bold text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${activeTab === 'volunteer' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                            >
                                <FaHandsHelping /> Volunteer
                            </button>
                        </div>

                        {/* Modal Scrollable Body */}
                        <div className="overflow-y-auto p-8 custom-scrollbar bg-gray-50/30 flex-grow">
                            
                            {/* Loading State */}
                            {isLoadingData && activeTab !== 'profile' ? (
                                <div className="flex justify-center items-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                                </div>
                            ) : (
                                <>
                                    {/* TAB: PROFILE */}
                                    {activeTab === 'profile' && (
                                        <div className="space-y-8">
                                            {selectedShelter.description && (
                                                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                                    <h3 className="text-lg font-bold text-slate-900 mb-3">About Us</h3>
                                                    <p className="text-slate-600 leading-relaxed text-[15px]">{selectedShelter.description}</p>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                                                    <h3 className="text-sm font-bold text-blue-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                                                        <FaPhone /> Contact Information
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {selectedShelter.contact?.phone && (
                                                            <p className="text-slate-700 font-medium flex items-center gap-3">
                                                                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-500 shrink-0"><FaPhone className="text-xs" /></span>
                                                                {selectedShelter.contact.phone}
                                                            </p>
                                                        )}
                                                        {selectedShelter.contact?.email && (
                                                            <p className="text-slate-700 font-medium flex items-center gap-3">
                                                                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-500 shrink-0"><FaEnvelope className="text-xs" /></span>
                                                                {selectedShelter.contact.email}
                                                            </p>
                                                        )}
                                                        {selectedShelter.contact?.website && (
                                                            <p className="text-slate-700 font-medium flex items-center gap-3">
                                                                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-500 shrink-0"><FaGlobe className="text-xs" /></span>
                                                                <a href={selectedShelter.contact.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">Visit Website</a>
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                                    <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider flex items-center gap-2">
                                                        <FaMapMarkerAlt /> Location
                                                    </h3>
                                                    <p className="text-slate-700 font-medium mb-1">{selectedShelter.address}</p>
                                                    <p className="text-slate-500 text-sm">{selectedShelter.city}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* TAB: PETS */}
                                    {activeTab === 'pets' && (
                                        <div>
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-xl font-bold text-slate-900">Meet Our Animals</h3>
                                                <span className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-bold">{shelterPets.length} Available</span>
                                            </div>

                                            {shelterPets.length > 0 ? (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {shelterPets.map(pet => (
                                                        <div key={pet._id} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:border-teal-200 transition-colors">
                                                            <div className="h-40 bg-gray-100 relative flex items-center justify-center text-4xl">
                                                                {pet.photos && pet.photos.length > 0 ? (
                                                                    <img src={pet.photos[0]} alt={pet.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    pet.species === 'Dog' ? '🐶' : pet.species === 'Cat' ? '🐱' : '🐾'
                                                                )}
                                                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                                                                    {pet.adoptionStatus}
                                                                </div>
                                                            </div>
                                                            <div className="p-5 flex flex-col flex-grow">
                                                                <h4 className="font-bold text-lg text-slate-900 mb-1">{pet.name}</h4>
                                                                <p className="text-sm text-slate-500 mb-3">{pet.breed} • {pet.age} • {pet.gender}</p>
                                                                
                                                                <div className="flex gap-2 mb-4">
                                                                    {pet.healthStatus?.vaccinated && <span className="bg-green-50 text-green-700 text-[10px] px-2 py-1 rounded-md font-bold">Vaccinated</span>}
                                                                    {pet.healthStatus?.sterilized && <span className="bg-purple-50 text-purple-700 text-[10px] px-2 py-1 rounded-md font-bold">Sterilized</span>}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                                                    <span className="text-4xl">📭</span>
                                                    <p className="text-slate-500 mt-4 font-medium">No pets currently listed for adoption.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* TAB: EVENTS */}
                                    {activeTab === 'events' && (
                                        <div className="space-y-4">
                                            {shelterEvents.length > 0 ? (
                                                shelterEvents.map(event => (
                                                    <div key={event._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                                                        <div className="bg-teal-50 text-teal-700 min-w-[80px] h-[80px] rounded-2xl flex flex-col items-center justify-center shrink-0">
                                                            <span className="text-sm font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                                            <span className="text-2xl font-black leading-none">{new Date(event.date).getDate()}</span>
                                                        </div>
                                                        <div className="flex-grow">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">{event.eventType}</span>
                                                            </div>
                                                            <h4 className="text-lg font-bold text-slate-900 mb-2">{event.title}</h4>
                                                            <p className="text-sm text-slate-600 mb-3">{event.description}</p>
                                                            <div className="flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                                                                <span className="flex items-center gap-1.5"><FaCalendarAlt /> {event.time.start} - {event.time.end}</span>
                                                                <span className="flex items-center gap-1.5"><FaMapMarkerAlt /> {event.location}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                                                    <span className="text-4xl">📅</span>
                                                    <p className="text-slate-500 mt-4 font-medium">No upcoming events scheduled.</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* TAB: VOLUNTEER */}
                                    {activeTab === 'volunteer' && (
                                        <div>
                                            <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl mb-6">
                                                <h3 className="text-blue-800 font-bold mb-2">Help Us Make a Difference</h3>
                                                <p className="text-blue-900/80 text-sm leading-relaxed">
                                                    Shelters rely heavily on community support. Browse the open tasks below and volunteer your time to help transport animals, assist at events, or foster pets in need.
                                                </p>
                                            </div>

                                            <div className="space-y-4">
                                                {shelterTasks.length > 0 ? (
                                                    shelterTasks.map(task => (
                                                        <div key={task._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase">{task.taskType}</span>
                                                                </div>
                                                                <h4 className="font-bold text-slate-900 text-lg mb-1">{task.title}</h4>
                                                                <p className="text-slate-600 text-sm">{task.description}</p>
                                                            </div>

                                                            {/* User Action for Volunteer Tasks */}
                                                            {task.status === 'Open' ? (
                                                                <button 
                                                                    onClick={() => handleClaimTask(task._id)}
                                                                    className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-colors shrink-0"
                                                                >
                                                                    Volunteer Now
                                                                </button>
                                                            ) : (
                                                                <span className="bg-gray-100 text-gray-500 px-4 py-2.5 rounded-xl font-bold text-sm shrink-0">
                                                                    No longer available
                                                                </span>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
                                                        <span className="text-4xl">🤝</span>
                                                        <p className="text-slate-500 mt-4 font-medium">No open volunteer tasks right now.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}} />
        </div>
    );
};

export default Shelters;