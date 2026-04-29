import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { FaSearch, FaCalendarAlt, FaTrash, FaBuilding, FaMapMarkerAlt, FaUsers, FaClock } from 'react-icons/fa';
import AdminSidebar from '../../components/AdminSidebar';

const AdminEventManagement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('Admin');
    const [events, setEvents] = useState([]);
    const [filteredEvents, setFilteredEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ total: 0, upcoming: 0, past: 0 });
    const role = localStorage.getItem('role') || 'system admin';

    useEffect(() => {
        fetchAdminData();
        fetchEvents();
    }, []);

    const fetchAdminData = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                const res = await fetch(`http://localhost:5000/api/users/${decoded.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserName(data.name);
                }
            } catch (error) { console.error("Failed to fetch admin data:", error); }
        }
    };

    const fetchEvents = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/events/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setEvents(data);
                
                const now = new Date().setHours(0,0,0,0);
                setStats({
                    total: data.length,
                    upcoming: data.filter(ev => new Date(ev.date) >= now).length,
                    past: data.filter(ev => new Date(ev.date) < now).length
                });
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Search
    useEffect(() => {
        if (!searchQuery) {
            setFilteredEvents(events);
            return;
        }
        const query = searchQuery.toLowerCase();
        const results = events.filter(ev => 
            ev.title?.toLowerCase().includes(query) || 
            ev.shelter?.organizationName?.toLowerCase().includes(query) ||
            ev.eventType?.toLowerCase().includes(query) ||
            ev.location?.toLowerCase().includes(query)
        );
        setFilteredEvents(results);
    }, [searchQuery, events]);

    const handleDelete = async (id) => {
        if (!window.confirm('WARNING: Are you sure you want to permanently delete this event?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/events/admin/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setEvents(prev => prev.filter(ev => ev._id !== id));
            }
        } catch (error) {
            console.error('Failed to delete event:', error);
        }
    };

    return (
        <div className="flex h-screen bg-[#f9fdfc] font-sans overflow-hidden">
            
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                
                {/* Admin Top Header */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 shrink-0">
                    <button className="md:hidden p-2 text-slate-500 hover:bg-gray-50 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    <div className="flex-1"></div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-slate-900">{userName}</p>
                            <p className="text-xs font-medium text-teal-600 capitalize">{role}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
                            {userName.charAt(0)}
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-8">
                        
                        {/* Header & Stats */}
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Event Management</h1>
                            <p className="text-slate-500 mb-8">Oversee all shelter events, adoption drives, and fundraisers.</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl shrink-0">
                                        <FaCalendarAlt />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 font-semibold text-sm">Total Events</p>
                                        <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shrink-0">
                                        <FaClock />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 font-semibold text-sm">Upcoming</p>
                                        <p className="text-3xl font-black text-slate-900">{stats.upcoming}</p>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-500 flex items-center justify-center text-2xl shrink-0">
                                        <FaCalendarAlt className="opacity-50" />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 font-semibold text-sm">Past Events</p>
                                        <p className="text-3xl font-black text-slate-900">{stats.past}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search Control */}
                        <div className="bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100">
                            <div className="w-full flex items-center bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
                                <FaSearch className="text-slate-400 mr-3" />
                                <input 
                                    type="text" 
                                    placeholder="Search by event title, host shelter, or location..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent focus:outline-none text-sm text-slate-700"
                                />
                            </div>
                        </div>

                        {/* Events Data Table */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[900px]">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Event Info</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Host Organization</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Date & Time</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Attendance</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center text-slate-400">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                                                    Loading events...
                                                </td>
                                            </tr>
                                        ) : filteredEvents.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center text-slate-500 font-medium">
                                                    No events found matching your criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredEvents.map((event) => {
                                                const isPast = new Date(event.date) < new Date().setHours(0,0,0,0);
                                                return (
                                                    <tr key={event._id} className={`hover:bg-slate-50/50 transition-colors ${isPast ? 'opacity-60' : ''}`}>
                                                        {/* Event Info */}
                                                        <td className="py-4 px-6">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-900">{event.title}</span>
                                                                <span className="bg-orange-50 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase w-max mt-1 border border-orange-100">
                                                                    {event.eventType}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Host Organization */}
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-2 text-sm text-slate-700">
                                                                <FaBuilding className="text-teal-500" /> 
                                                                <span className="font-medium">{event.shelter?.organizationName || 'Unknown'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                                <FaMapMarkerAlt className="text-slate-400" /> {event.location}
                                                            </div>
                                                        </td>

                                                        {/* Date & Time */}
                                                        <td className="py-4 px-6">
                                                            <p className="text-sm font-semibold text-slate-700">
                                                                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-0.5">
                                                                {event.time.start} - {event.time.end}
                                                            </p>
                                                        </td>

                                                        {/* Capacity */}
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-sm">
                                                                    <FaUsers />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-900">
                                                                        {event.registeredAttendees?.length || 0} <span className="text-slate-400 font-medium">/ {event.capacity}</span>
                                                                    </p>
                                                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Registered</p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="py-4 px-6 text-right">
                                                            <button 
                                                                onClick={() => handleDelete(event._id)}
                                                                className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-sm"
                                                                title="Delete Event"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            {/* Inline CSS for Custom Scrollbar */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}} />
        </div>
    );
};

export default AdminEventManagement;