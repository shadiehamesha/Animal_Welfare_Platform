import React, { useState, useEffect } from "react";
import { FaSearch, FaCalendarAlt, FaMapMarkerAlt, FaClock, FaBuilding, FaUsers, FaCheck } from "react-icons/fa";
import { Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/navigation";
import Footer from "../components/footer";

const Events = () => {
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        // Check if user is logged in and extract their ID
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUserId(decoded.id);
            } catch (err) {
                console.error("Invalid token");
            }
        }

        const fetchAllEvents = async () => {
            try {
                // Fetch all verified public organizations
                const orgRes = await fetch("http://localhost:5000/api/organizations/public");
                if (!orgRes.ok) throw new Error("Failed to fetch organizations");
                const organizations = await orgRes.json();

                // Fetch public events
                const eventPromises = organizations.map(async (org) => {
                    const eventRes = await fetch(`http://localhost:5000/api/events/public?shelter=${org._id}`);
                    if (eventRes.ok) {
                        const eventsData = await eventRes.json();
                        return eventsData.map(ev => ({ ...ev, shelterName: org.organizationName }));
                    }
                    return [];
                });

                const eventsArrays = await Promise.all(eventPromises);
                const allEvents = eventsArrays.flat();

                allEvents.sort((a, b) => new Date(a.date) - new Date(b.date));

                setEvents(allEvents);
                setFilteredEvents(allEvents);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllEvents();
    }, []);

    // Handle local search filtering
    useEffect(() => {
        const lowercasedQuery = searchQuery.toLowerCase();
        const results = events.filter((ev) => {
            return (
                ev.title?.toLowerCase().includes(lowercasedQuery) ||
                ev.location?.toLowerCase().includes(lowercasedQuery) ||
                ev.shelterName?.toLowerCase().includes(lowercasedQuery) ||
                ev.eventType?.toLowerCase().includes(lowercasedQuery)
            );
        });
        setFilteredEvents(results);
    }, [searchQuery, events]);

    // Handle Attendance
    const handleAttend = async (eventId) => {
        if (!userId) return; 

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/events/${eventId}/attend`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await res.json();
            
            if (res.ok) {
                // update UI so the user sees the change immediately
                const updateEventArray = (prev) => prev.map(ev => 
                    ev._id === eventId 
                    ? { ...ev, registeredAttendees: [...(ev.registeredAttendees || []), userId] } 
                    : ev
                );
                
                setEvents(updateEventArray);
                setFilteredEvents(updateEventArray);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error("Failed to register for event:", error);
            alert("An error occurred while registering for the event.");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <main className="flex-grow flex flex-col pt-12 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                
                {/* Header & Search Section */}
                <div className="mb-12 text-center md:text-left">
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                        Upcoming Events & Drives
                    </h1>
                    <p className="text-slate-500 text-lg max-w-2xl mb-8 md:mx-0 mx-auto">
                        Join adoption drives, vaccination camps, and fundraisers hosted by verified animal welfare organizations near you.
                    </p>

                    <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 flex items-center max-w-2xl">
                        <div className="w-full flex items-center bg-gray-50 rounded-2xl px-4 py-3 border border-gray-100 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
                            <FaSearch className="text-slate-400 mr-3 shrink-0" />
                            <input 
                                type="text" 
                                placeholder="Search by event name, location, or shelter..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent focus:outline-none text-slate-700 font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Events Grid */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredEvents.map(event => {
                            const attendeesCount = event.registeredAttendees?.length || 0;
                            const isFull = attendeesCount >= event.capacity;
                            const isAttending = userId && event.registeredAttendees?.includes(userId);

                            return (
                                <div key={event._id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4 hover:border-teal-200 transition-colors">
                                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                                        {/* Date Calendar Icon */}
                                        <div className="bg-teal-50 text-teal-700 min-w-[90px] h-[90px] rounded-2xl flex flex-col items-center justify-center shrink-0 border border-teal-100">
                                            <span className="text-sm font-bold uppercase tracking-wider">
                                                {new Date(event.date).toLocaleString('default', { month: 'short' })}
                                            </span>
                                            <span className="text-3xl font-black leading-none mt-1">
                                                {new Date(event.date).getDate()}
                                            </span>
                                        </div>
                                        
                                        {/* Event Details */}
                                        <div className="flex-grow w-full">
                                            <div className="flex flex-wrap items-center gap-2 mb-2">
                                                <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide border border-orange-100">
                                                    {event.eventType}
                                                </span>
                                            </div>
                                            
                                            <h3 className="text-xl font-bold text-slate-900 mb-2">{event.title}</h3>
                                            
                                            {event.description && (
                                                <p className="text-sm text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                                                    {event.description}
                                                </p>
                                            )}
                                            
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                                    <FaClock className="text-slate-400 shrink-0" /> 
                                                    <span>{event.time.start} - {event.time.end}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                                                    <FaMapMarkerAlt className="text-slate-400 shrink-0" /> 
                                                    <span className="truncate">{event.location}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-medium text-teal-600 mt-1">
                                                    <FaBuilding className="text-teal-500 shrink-0" /> 
                                                    <span className="truncate">Hosted by: {event.shelterName}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Attendance */}
                                    <div className="mt-2 pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm">
                                            <FaUsers className={isFull ? "text-red-400" : "text-teal-500"} />
                                            <span className={`font-bold ${isFull ? "text-red-500" : "text-slate-700"}`}>
                                                {attendeesCount} <span className="text-slate-400 font-medium">/ {event.capacity} Attending</span>
                                            </span>
                                        </div>
                                        
                                        <div>
                                            {!userId ? (
                                                <Link to="/login" className="text-sm font-bold text-teal-600 hover:underline">
                                                    Log in to attend
                                                </Link>
                                            ) : isAttending ? (
                                                <span className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-4 py-2 rounded-xl text-sm font-bold">
                                                    <FaCheck /> Attending
                                                </span>
                                            ) : isFull ? (
                                                <span className="bg-gray-100 text-gray-500 px-4 py-2 rounded-xl text-sm font-bold cursor-not-allowed">
                                                    Event Full
                                                </span>
                                            ) : (
                                                <button 
                                                    onClick={() => handleAttend(event._id)}
                                                    className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm"
                                                >
                                                    Attend Event
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[3rem] border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                        <span className="text-5xl mb-4">📅</span>
                        <h3 className="text-2xl font-bold text-slate-900 mb-2">No upcoming events</h3>
                        <p className="text-slate-500 font-medium max-w-md mx-auto">
                            {searchQuery 
                                ? "We couldn't find any events matching your search criteria." 
                                : "There are currently no public events scheduled. Please check back later!"}
                        </p>
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery("")}
                                className="mt-6 text-teal-600 font-bold hover:text-teal-700 hover:underline"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}

export default Events;