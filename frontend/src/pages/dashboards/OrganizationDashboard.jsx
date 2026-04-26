import React, { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode';
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { 
    FaChartPie, FaPaw, FaCalendarAlt, FaHandsHelping, FaBuilding, 
    FaPlus, FaFileImport, FaMapMarkerAlt, FaClock, FaCheckCircle,
    FaEdit, FaTrash
} from 'react-icons/fa';
import Navbar from '../../components/navigation.jsx';
import Footer from '../../components/footer.jsx';
import UserContactWidget from '../../components/UserContactWidget.jsx';
import ModernTimePicker from '../../utils/ModernTimePicker.jsx';
import ModernDatePicker from '../../utils/ModernDatePicker.jsx';

// --- Custom Dropdown Component ---
const CustomSelect = ({ name, value, options, onChange, required = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { name, value: optionValue, type: 'select-one' } });
        setIsOpen(false);
    };

    const selectedLabel = options.find(opt => opt.value === value)?.label || 'Select...';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-2.5 bg-gray-50 border ${isOpen ? 'border-teal-500 ring-2 ring-teal-500 ring-opacity-20' : 'border-gray-200'} rounded-xl focus:outline-none transition-all duration-200 text-sm font-medium text-slate-700 flex justify-between items-center`}
            >
                <span>{selectedLabel}</span>
                <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`absolute z-20 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'}`}>
                {options.map((option) => (
                    <div
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`px-4 py-2 cursor-pointer text-sm font-medium transition-colors duration-150 flex items-center justify-between
                            ${value === option.value ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-gray-50 hover:text-teal-600'}
                        `}
                    >
                        {option.label}
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Dashboard Component ---
const OrganizationDashboard = () => {
    const [userName, setUserName] = useState('Organization');
    const role = localStorage.getItem('role') || 'organizations/shelters';
    
    const MAPS_API_KEY = import.meta.env.VITE_MAPS || import.meta.env.VITE_MAPS_API_KEY || "";

    // UI States
    const [activeTab, setActiveTab] = useState('overview');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [isLoading, setIsLoading] = useState(false);

    // Data States
    const [shelter, setShelter] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [pets, setPets] = useState([]);
    const [events, setEvents] = useState([]);
    const [tasks, setTasks] = useState([]);

    // Edit States
    const [editingPetId, setEditingPetId] = useState(null);
    const [editingTaskId, setEditingTaskId] = useState(null);
    const [editingEventId, setEditingEventId] = useState(null);

    // Modal States
    const [isPetModalOpen, setIsPetModalOpen] = useState(false);
    const [isEventModalOpen, setIsEventModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);

    // Default Form States
    const defaultPetForm = {
        name: '', species: 'Dog', breed: '', age: '', gender: 'Unknown',
        healthStatus: { vaccinated: false, sterilized: false, medicalNotes: '' },
        adoptionStatus: 'Available', description: ''
    };
    const defaultEventForm = {
        title: '', eventType: 'Adoption Drive', description: '', date: '', 
        time: { start: '09:00', end: '17:00' }, location: '', capacity: 50
    };
    const defaultTaskForm = {
        title: '', description: '', taskType: 'Event Help'
    };

    // Form States
    const [profileForm, setProfileForm] = useState({
        organizationName: '', registrationNumber: '', description: '', address: '', city: '',
        location: { lat: 7.8731, lng: 80.7718 },
        contact: { phone: '', email: '', website: '' }
    });
    const [petForm, setPetForm] = useState(defaultPetForm);
    const [eventForm, setEventForm] = useState(defaultEventForm);
    const [taskForm, setTaskForm] = useState(defaultTaskForm);
    const [bulkImportData, setBulkImportData] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            // 1. Fetch User Data
            const decoded = jwtDecode(token);
            const userRes = await fetch(`http://localhost:5000/api/users/${decoded.id}`, { headers: { Authorization: `Bearer ${token}` } });
            if (userRes.ok) {
                const userData = await userRes.json();
                setUserName(userData.name);
            }

            // 2. Fetch Shelter Profile
            const shelterRes = await fetch('http://localhost:5000/api/organizations/profile', { headers: { Authorization: `Bearer ${token}` } });
            if (shelterRes.ok) {
                const shelterData = await shelterRes.json();
                setShelter(shelterData);
                setProfileForm({
                    organizationName: shelterData.organizationName || '',
                    registrationNumber: shelterData.registrationNumber || '',
                    description: shelterData.description || '',
                    address: shelterData.address || '',
                    city: shelterData.city || '',
                    location: { 
                        lat: shelterData.location?.lat || 7.8731, 
                        lng: shelterData.location?.lng || 80.7718 
                    },
                    contact: shelterData.contact || { phone: '', email: '', website: '' }
                });

                // Fetch dependent data only if shelter profile exists
                fetchAnalytics(token);
                fetchPets(token);
                fetchEvents(token);
                fetchTasks(token);
            }
        } catch (error) {
            console.error("Data fetching error:", error);
        }
    };

    const fetchAnalytics = async (token) => {
        const res = await fetch('http://localhost:5000/api/organizations/analytics', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setAnalytics(await res.json());
    };

    const fetchPets = async (token) => {
        const res = await fetch('http://localhost:5000/api/pets/inventory', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setPets(await res.json());
    };

    const fetchEvents = async (token) => {
        const res = await fetch('http://localhost:5000/api/events/my-events', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setEvents(await res.json());
    };

    const fetchTasks = async (token) => {
        const res = await fetch('http://localhost:5000/api/tasks/my-tasks', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) setTasks(await res.json());
    };

    // --- Form Handlers ---
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const token = localStorage.getItem('token');
        try {
            const payload = {
                ...profileForm,
                location: { lat: parseFloat(profileForm.location.lat), lng: parseFloat(profileForm.location.lng) }
            };

            const res = await fetch('http://localhost:5000/api/organizations/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const data = await res.json();
                setShelter(data);
                setMessage({ type: 'success', text: 'Profile saved successfully!' });
            }
        } catch (err) { setMessage({ type: 'error', text: 'Failed to save profile.' }); }
        finally { setIsLoading(false); setTimeout(() => setMessage({type:'', text:''}), 3000); }
    };

    // --- Pet Handlers ---
    const openAddPetModal = () => {
        setEditingPetId(null);
        setPetForm(defaultPetForm);
        setIsPetModalOpen(true);
    };

    const openEditPetModal = (pet) => {
        setEditingPetId(pet._id);
        setPetForm({
            name: pet.name || '',
            species: pet.species || 'Dog',
            breed: pet.breed || '',
            age: pet.age || '',
            gender: pet.gender || 'Unknown',
            healthStatus: pet.healthStatus || { vaccinated: false, sterilized: false, medicalNotes: '' },
            adoptionStatus: pet.adoptionStatus || 'Available',
            description: pet.description || ''
        });
        setIsPetModalOpen(true);
    };

    const handlePetSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const url = editingPetId ? `http://localhost:5000/api/pets/${editingPetId}` : 'http://localhost:5000/api/pets';
        const method = editingPetId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(petForm)
            });
            if (res.ok) {
                fetchPets(token);
                fetchAnalytics(token);
                setIsPetModalOpen(false);
                setPetForm(defaultPetForm);
                setEditingPetId(null);
            }
        } catch (err) { console.error(err); }
    };

    const handleDeletePet = async (petId) => {
        if (!window.confirm('Are you sure you want to delete this pet?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/pets/${petId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchPets(token);
                fetchAnalytics(token);
            }
        } catch (err) { console.error(err); }
    };

    const updatePetStatus = async (petId, newStatus) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/pets/${petId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ adoptionStatus: newStatus })
            });
            if (res.ok) {
                fetchPets(token);
                fetchAnalytics(token);
            }
        } catch (err) { console.error(err); }
    };

    const handleBulkImport = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        try {
            const parsedData = JSON.parse(bulkImportData);
            const res = await fetch('http://localhost:5000/api/pets/bulk-import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ pets: parsedData })
            });
            if (res.ok) {
                fetchPets(token);
                fetchAnalytics(token);
                setIsBulkImportModalOpen(false);
                setBulkImportData('');
            } else {
                alert("Import failed. Check JSON format.");
            }
        } catch (err) { alert("Invalid JSON format"); }
    };

    // --- Event Handlers ---
    const openAddEventModal = () => {
        setEditingEventId(null);
        setEventForm(defaultEventForm);
        setIsEventModalOpen(true);
    };

    const openEditEventModal = (event) => {
        setEditingEventId(event._id);
        setEventForm({
            title: event.title || '',
            eventType: event.eventType || 'Adoption Drive',
            description: event.description || '',
            date: event.date ? event.date.split('T')[0] : '', // Format for date picker
            time: event.time || { start: '09:00', end: '17:00' },
            location: event.location || '',
            capacity: event.capacity || 50
        });
        setIsEventModalOpen(true);
    };

    const handleEventSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const url = editingEventId ? `http://localhost:5000/api/events/${editingEventId}` : 'http://localhost:5000/api/events';
        const method = editingEventId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(eventForm)
            });
            if (res.ok) {
                fetchEvents(token);
                setIsEventModalOpen(false);
                setEditingEventId(null);
                setEventForm(defaultEventForm);
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/events/${eventId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchEvents(token);
            }
        } catch (err) { console.error(err); }
    };

    // --- Task Handlers ---
    const openAddTaskModal = () => {
        setEditingTaskId(null);
        setTaskForm(defaultTaskForm);
        setIsTaskModalOpen(true);
    };

    const openEditTaskModal = (task) => {
        setEditingTaskId(task._id);
        setTaskForm({
            title: task.title || '',
            description: task.description || '',
            taskType: task.taskType || 'Event Help'
        });
        setIsTaskModalOpen(true);
    };

    const handleTaskSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const url = editingTaskId ? `http://localhost:5000/api/tasks/${editingTaskId}` : 'http://localhost:5000/api/tasks';
        const method = editingTaskId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(taskForm)
            });
            if (res.ok) {
                fetchTasks(token);
                setIsTaskModalOpen(false);
                setTaskForm(defaultTaskForm);
                setEditingTaskId(null);
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                fetchTasks(token);
            }
        } catch (err) { console.error(err); }
    };

    const approveTask = async (taskId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/tasks/${taskId}/approve`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchTasks(token);
        } catch (err) { console.error(err); }
    };

    // --- Render Helpers ---
    const inputClasses = "w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm";
    const labelClasses = "block text-xs font-semibold text-slate-500 mb-1";

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">{shelter?.organizationName || `${userName}'s Workspace`}</h1>
                            <p className="text-teal-600 font-medium capitalize flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-teal-500"></span>{role}
                            </p>
                        </div>
                    </div>

                    {!shelter && activeTab !== 'profile' ? (
                        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-6 rounded-2xl text-center mb-8">
                            <h3 className="font-bold text-lg mb-2">Profile Incomplete</h3>
                            <p className="mb-4">You must complete your organization profile before managing pets, events, or volunteers.</p>
                            <button onClick={() => setActiveTab('profile')} className="bg-orange-600 text-white px-6 py-2 rounded-full font-bold">Complete Profile Now</button>
                        </div>
                    ) : null}

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1 space-y-2">
                            {[
                                { id: 'overview', label: 'Overview & Analytics', icon: <FaChartPie /> },
                                { id: 'profile', label: 'Organization Profile', icon: <FaBuilding /> },
                                { id: 'pets', label: 'Pet Inventory', icon: <FaPaw /> },
                                { id: 'events', label: 'Events & Campaigns', icon: <FaCalendarAlt /> },
                                { id: 'tasks', label: 'Volunteer Tracking', icon: <FaHandsHelping /> },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-colors font-semibold text-sm ${
                                        activeTab === tab.id 
                                            ? 'bg-teal-600 text-white shadow-md' 
                                            : 'bg-white text-slate-600 hover:bg-teal-50 hover:text-teal-700 border border-gray-100'
                                    }`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Main Content Area */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 min-h-[600px]">
                                
                                {message.text && (
                                    <div className={`mb-6 px-4 py-3 rounded-2xl text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                                        {message.text}
                                    </div>
                                )}

                                {/* --- OVERVIEW TAB --- */}
                                {activeTab === 'overview' && shelter && (
                                    <div className="space-y-8">
                                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Shelter Analytics</h2>
                                        
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                                                <p className="text-blue-800 font-bold text-sm mb-1">Total Pets</p>
                                                <p className="text-3xl font-black text-blue-600">{analytics?.totalPets || 0}</p>
                                            </div>
                                            <div className="bg-green-50/50 p-5 rounded-2xl border border-green-100">
                                                <p className="text-green-800 font-bold text-sm mb-1">Available</p>
                                                <p className="text-3xl font-black text-green-600">{analytics?.breakdown?.Available || 0}</p>
                                            </div>
                                            <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-100">
                                                <p className="text-purple-800 font-bold text-sm mb-1">Adopted</p>
                                                <p className="text-3xl font-black text-purple-600">{analytics?.breakdown?.Adopted || 0}</p>
                                            </div>
                                            <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100">
                                                <p className="text-orange-800 font-bold text-sm mb-1">Pending</p>
                                                <p className="text-3xl font-black text-orange-600">{analytics?.breakdown?.['Pending Review'] || 0}</p>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-8">
                                            <h2 className="text-xl font-bold text-slate-900 mb-6">Support & Communications</h2>
                                            <div className="max-w-md">
                                                <UserContactWidget />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- PROFILE TAB --- */}
                                {activeTab === 'profile' && (
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Organization Profile</h2>
                                        <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-2xl">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="sm:col-span-2">
                                                    <label className={labelClasses}>Organization Name *</label>
                                                    <input type="text" name="organizationName" value={profileForm.organizationName} onChange={(e) => setProfileForm({...profileForm, organizationName: e.target.value})} required className={inputClasses} />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Registration Number (NGO/NPO)</label>
                                                    <input type="text" name="registrationNumber" value={profileForm.registrationNumber} onChange={(e) => setProfileForm({...profileForm, registrationNumber: e.target.value})} className={inputClasses} />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>City *</label>
                                                    <input type="text" name="city" value={profileForm.city} onChange={(e) => setProfileForm({...profileForm, city: e.target.value})} required className={inputClasses} />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className={labelClasses}>Full Address *</label>
                                                    <input type="text" name="address" value={profileForm.address} onChange={(e) => setProfileForm({...profileForm, address: e.target.value})} required className={inputClasses} />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className={labelClasses}>About Organization</label>
                                                    <textarea name="description" value={profileForm.description} onChange={(e) => setProfileForm({...profileForm, description: e.target.value})} rows="3" className={`${inputClasses} resize-none`}></textarea>
                                                </div>

                                                <div className="sm:col-span-2 mt-2">
                                                    <h3 className="text-sm font-bold text-slate-800 mb-2 border-b pb-2">Map Location</h3>
                                                    <p className="text-xs text-slate-500 mb-3">Click on the map to pin your shelter's exact location for the public directory.</p>
                                                    <div className="h-64 w-full rounded-2xl overflow-hidden border border-gray-200 relative bg-gray-100">
                                                        <APIProvider apiKey={MAPS_API_KEY}>
                                                            <Map 
                                                                mapId="SHELTER_MAP_ID"
                                                                defaultCenter={{ lat: profileForm.location.lat, lng: profileForm.location.lng }} 
                                                                defaultZoom={7} 
                                                                onClick={(e) => setProfileForm(prev => ({ ...prev, location: { lat: e.detail.latLng.lat, lng: e.detail.latLng.lng } }))}
                                                                gestureHandling={'greedy'}
                                                            >
                                                                <AdvancedMarker position={{ lat: profileForm.location.lat, lng: profileForm.location.lng }}>
                                                                    <Pin background={'#0d9488'} borderColor={'#0f766e'} glyphColor={'#fff'} />
                                                                </AdvancedMarker>
                                                            </Map>
                                                        </APIProvider>
                                                    </div>
                                                </div>
                                            </div>

                                            <h3 className="text-sm font-bold text-slate-800 border-b pb-2 pt-4">Contact Information</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className={labelClasses}>Phone Number *</label>
                                                    <input type="tel" name="phone" value={profileForm.contact.phone} onChange={(e) => setProfileForm({...profileForm, contact: {...profileForm.contact, phone: e.target.value}})} required className={inputClasses} />
                                                </div>
                                                <div>
                                                    <label className={labelClasses}>Email Address *</label>
                                                    <input type="email" name="email" value={profileForm.contact.email} onChange={(e) => setProfileForm({...profileForm, contact: {...profileForm.contact, email: e.target.value}})} required className={inputClasses} />
                                                </div>
                                                <div className="sm:col-span-2">
                                                    <label className={labelClasses}>Website URL</label>
                                                    <input type="url" name="website" value={profileForm.contact.website} onChange={(e) => setProfileForm({...profileForm, contact: {...profileForm.contact, website: e.target.value}})} className={inputClasses} placeholder="https://" />
                                                </div>
                                            </div>

                                            <button type="submit" disabled={isLoading} className="bg-teal-600 text-white font-bold py-3 px-8 rounded-full hover:bg-teal-700 transition shadow-sm">
                                                {isLoading ? 'Saving...' : 'Save Profile'}
                                            </button>
                                        </form>
                                    </div>
                                )}

                                {/* --- PETS TAB --- */}
                                {activeTab === 'pets' && shelter && (
                                    <div>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold text-slate-900">Pet Inventory</h2>
                                            <div className="flex gap-3">
                                                <button onClick={() => setIsBulkImportModalOpen(true)} className="flex items-center gap-2 bg-slate-100 text-slate-700 font-bold py-2 px-4 rounded-xl hover:bg-slate-200 transition text-sm">
                                                    <FaFileImport /> Bulk Import
                                                </button>
                                                <button onClick={openAddPetModal} className="flex items-center gap-2 bg-teal-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-teal-700 transition text-sm">
                                                    <FaPlus /> Add Pet
                                                </button>
                                            </div>
                                        </div>

                                        <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100">
                                            <table className="w-full text-left border-collapse min-w-[600px]">
                                                <thead>
                                                    <tr className="bg-gray-50 border-b border-gray-100">
                                                        <th className="py-3 px-5 font-semibold text-xs text-slate-500 uppercase tracking-wider">Pet</th>
                                                        <th className="py-3 px-5 font-semibold text-xs text-slate-500 uppercase tracking-wider">Details</th>
                                                        <th className="py-3 px-5 font-semibold text-xs text-slate-500 uppercase tracking-wider">Medical</th>
                                                        <th className="py-3 px-5 font-semibold text-xs text-slate-500 uppercase tracking-wider">Status</th>
                                                        <th className="py-3 px-5 font-semibold text-xs text-slate-500 uppercase tracking-wider">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pets.map(pet => (
                                                        <tr key={pet._id} className="border-b border-gray-50 last:border-0 hover:bg-slate-50/50 transition">
                                                            <td className="py-4 px-5">
                                                                <p className="font-bold text-slate-900">{pet.name}</p>
                                                                <p className="text-xs text-slate-500">{pet.species}</p>
                                                            </td>
                                                            <td className="py-4 px-5 text-sm text-slate-700">
                                                                {pet.breed || 'Mixed'} • {pet.age || 'N/A'} • {pet.gender}
                                                            </td>
                                                            <td className="py-4 px-5">
                                                                <div className="flex gap-1 flex-wrap">
                                                                    {pet.healthStatus.vaccinated && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded font-bold">Vax</span>}
                                                                    {pet.healthStatus.sterilized && <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded font-bold">Sterile</span>}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-5">
                                                                <CustomSelect 
                                                                    name="adoptionStatus"
                                                                    value={pet.adoptionStatus}
                                                                    options={[
                                                                        {value: 'Available', label: 'Available'},
                                                                        {value: 'Pending Review', label: 'Pending'},
                                                                        {value: 'Adopted', label: 'Adopted'},
                                                                        {value: 'Fostered', label: 'Fostered'}
                                                                    ]}
                                                                    onChange={(e) => updatePetStatus(pet._id, e.target.value)}
                                                                />
                                                            </td>
                                                            <td className="py-4 px-5 flex gap-2">
                                                                <button onClick={() => openEditPetModal(pet)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors" title="Edit Pet">
                                                                    <FaEdit />
                                                                </button>
                                                                <button onClick={() => handleDeletePet(pet._id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Delete Pet">
                                                                    <FaTrash />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    {pets.length === 0 && (
                                                        <tr><td colSpan="5" className="py-8 text-center text-slate-500">No pets in inventory.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* --- EVENTS TAB --- */}
                                {activeTab === 'events' && shelter && (
                                    <div>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold text-slate-900">Events & Campaigns</h2>
                                            <button onClick={openAddEventModal} className="flex items-center gap-2 bg-teal-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-teal-700 transition text-sm">
                                                <FaPlus /> Create Event
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {events.map(event => (
                                                <div key={event._id} className="border border-gray-100 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center bg-white hover:border-teal-100 transition-colors shadow-sm">
                                                    <div className="bg-white border border-gray-200 rounded-xl w-20 h-20 flex flex-col items-center justify-center shrink-0 shadow-sm">
                                                        <span className="text-xs font-bold text-red-500 uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                                        <span className="text-2xl font-black text-slate-800">{new Date(event.date).getDate()}</span>
                                                    </div>
                                                    <div className="flex-grow">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{event.eventType}</span>
                                                        </div>
                                                        <h3 className="font-bold text-lg text-slate-900">{event.title}</h3>
                                                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2 font-medium">
                                                            <span className="flex items-center gap-1.5"><FaClock/> {event.time.start} - {event.time.end}</span>
                                                            <span className="flex items-center gap-1.5"><FaMapMarkerAlt/> {event.location}</span>
                                                            <span className="flex items-center gap-1.5">Capacity: {event.capacity}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-4 sm:mt-0 shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-4 w-full sm:w-auto justify-end">
                                                        <button onClick={() => openEditEventModal(event)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2.5 rounded-xl transition-colors" title="Edit Event">
                                                            <FaEdit />
                                                        </button>
                                                        <button onClick={() => handleDeleteEvent(event._id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2.5 rounded-xl transition-colors" title="Delete Event">
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {events.length === 0 && <p className="text-slate-500">No events scheduled.</p>}
                                        </div>
                                    </div>
                                )}

                                {/* --- TASKS TAB --- */}
                                {activeTab === 'tasks' && shelter && (
                                    <div>
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold text-slate-900">Volunteer Tracking</h2>
                                            <button onClick={openAddTaskModal} className="flex items-center gap-2 bg-teal-600 text-white font-bold py-2 px-4 rounded-xl hover:bg-teal-700 transition text-sm">
                                                <FaPlus /> Create Task
                                            </button>
                                        </div>

                                        <div className="space-y-4">
                                            {tasks.map(task => (
                                                <div key={task._id} className="border border-gray-100 rounded-2xl p-5 bg-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-teal-100 transition-colors">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{task.taskType}</span>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${task.status === 'Open' ? 'bg-green-100 text-green-700' : task.status === 'Claimed' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-700'}`}>{task.status}</span>
                                                        </div>
                                                        <h3 className="font-bold text-slate-900">{task.title}</h3>
                                                        {task.volunteer && (
                                                            <p className="text-xs text-slate-500 mt-1">Claimed by: <span className="font-bold text-slate-700">{task.volunteer.name}</span></p>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center gap-2">
                                                        {task.status === 'Claimed' && (
                                                            <button onClick={() => approveTask(task._id)} className="bg-teal-50 text-teal-700 border border-teal-200 font-bold py-1.5 px-3 rounded-lg hover:bg-teal-100 transition text-xs flex items-center gap-1.5 shrink-0">
                                                                <FaCheckCircle /> Approve
                                                            </button>
                                                        )}
                                                        <button onClick={() => openEditTaskModal(task)} className="text-blue-500 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 p-2 rounded-lg transition-colors" title="Edit Task">
                                                            <FaEdit />
                                                        </button>
                                                        <button onClick={() => handleDeleteTask(task._id)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-2 rounded-lg transition-colors" title="Delete Task">
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                            {tasks.length === 0 && <p className="text-slate-500">No volunteer tasks created.</p>}
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {/* --- MODALS --- */}
            
            {/* Add / Edit Pet Modal */}
            {isPetModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">{editingPetId ? 'Edit Pet Details' : 'Add New Pet'}</h2>
                            <button onClick={() => setIsPetModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 hover:bg-gray-200">✕</button>
                        </div>
                        <form onSubmit={handlePetSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className={labelClasses}>Pet Name *</label>
                                    <input type="text" value={petForm.name} onChange={(e) => setPetForm({...petForm, name: e.target.value})} required className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Species *</label>
                                    <CustomSelect name="species" value={petForm.species} options={[{value:'Dog', label:'Dog'}, {value:'Cat', label:'Cat'}, {value:'Other', label:'Other'}]} onChange={(e) => setPetForm({...petForm, species: e.target.value})} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Breed</label>
                                    <input type="text" value={petForm.breed} onChange={(e) => setPetForm({...petForm, breed: e.target.value})} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Age (e.g. 2 months)</label>
                                    <input type="text" value={petForm.age} onChange={(e) => setPetForm({...petForm, age: e.target.value})} className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Gender</label>
                                    <CustomSelect name="gender" value={petForm.gender} options={[{value:'Male', label:'Male'}, {value:'Female', label:'Female'}, {value:'Unknown', label:'Unknown'}]} onChange={(e) => setPetForm({...petForm, gender: e.target.value})} />
                                </div>
                                <div className="col-span-2 bg-gray-50 p-4 rounded-xl border border-gray-200 mt-2">
                                    <h3 className="text-sm font-bold text-slate-800 mb-3">Health Status</h3>
                                    <div className="flex gap-6 mb-3">
                                        <label className="flex items-center text-sm font-medium text-slate-700">
                                            <input type="checkbox" checked={petForm.healthStatus.vaccinated} onChange={(e) => setPetForm({...petForm, healthStatus: {...petForm.healthStatus, vaccinated: e.target.checked}})} className="mr-2 text-teal-600 focus:ring-teal-500 rounded" /> Vaccinated
                                        </label>
                                        <label className="flex items-center text-sm font-medium text-slate-700">
                                            <input type="checkbox" checked={petForm.healthStatus.sterilized} onChange={(e) => setPetForm({...petForm, healthStatus: {...petForm.healthStatus, sterilized: e.target.checked}})} className="mr-2 text-teal-600 focus:ring-teal-500 rounded" /> Sterilized
                                        </label>
                                    </div>
                                    <input type="text" placeholder="Medical Notes (optional)" value={petForm.healthStatus.medicalNotes} onChange={(e) => setPetForm({...petForm, healthStatus: {...petForm.healthStatus, medicalNotes: e.target.value}})} className={inputClasses} />
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-4 bg-teal-600 text-white font-bold py-3.5 rounded-xl hover:bg-teal-700 transition">
                                {editingPetId ? 'Update Pet Profile' : 'Save Pet Profile'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Import Modal */}
            {isBulkImportModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Bulk Import Pets</h2>
                            <button onClick={() => setIsBulkImportModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-500">✕</button>
                        </div>
                        <form onSubmit={handleBulkImport}>
                            <label className={labelClasses}>Paste JSON Data Array</label>
                            <textarea rows="8" value={bulkImportData} onChange={(e) => setBulkImportData(e.target.value)} placeholder='[{"name": "Rex", "species": "Dog", "breed": "Husky"}]' className={`${inputClasses} resize-none font-mono text-xs`} required></textarea>
                            <button type="submit" className="w-full mt-4 bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition">Import Data</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add / Edit Event Modal */}
            {isEventModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">{editingEventId ? 'Edit Event' : 'Create Event'}</h2>
                            <button onClick={() => setIsEventModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-500">✕</button>
                        </div>
                        <form onSubmit={handleEventSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className={labelClasses}>Event Title *</label>
                                    <input type="text" value={eventForm.title} onChange={(e) => setEventForm({...eventForm, title: e.target.value})} required className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Event Type</label>
                                    <CustomSelect name="eventType" value={eventForm.eventType} options={[{value:'Vaccination', label:'Vaccination'}, {value:'Sterilization', label:'Sterilization'}, {value:'Adoption Drive', label:'Adoption Drive'}, {value:'Fundraiser', label:'Fundraiser'}]} onChange={(e) => setEventForm({...eventForm, eventType: e.target.value})} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Date *</label>
                                    {/* Replaced native date input with ModernDatePicker */}
                                    <ModernDatePicker name="date" value={eventForm.date} onChange={(e) => setEventForm({...eventForm, date: e.target.value})} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Start Time</label>
                                    <ModernTimePicker name="start" value={eventForm.time.start} onChange={(e) => setEventForm({...eventForm, time: {...eventForm.time, start: e.target.value}})} />
                                </div>
                                <div>
                                    <label className={labelClasses}>End Time</label>
                                    <ModernTimePicker name="end" value={eventForm.time.end} onChange={(e) => setEventForm({...eventForm, time: {...eventForm.time, end: e.target.value}})} />
                                </div>
                                <div className="col-span-2">
                                    <label className={labelClasses}>Location *</label>
                                    <input type="text" value={eventForm.location} onChange={(e) => setEventForm({...eventForm, location: e.target.value})} required className={inputClasses} />
                                </div>
                                <div>
                                    <label className={labelClasses}>Capacity (Attendees/Pets) *</label>
                                    <input type="number" value={eventForm.capacity} onChange={(e) => setEventForm({...eventForm, capacity: parseInt(e.target.value)})} required className={inputClasses} />
                                </div>
                                <div className="col-span-2">
                                    <label className={labelClasses}>Description</label>
                                    <textarea rows="3" value={eventForm.description} onChange={(e) => setEventForm({...eventForm, description: e.target.value})} className={`${inputClasses} resize-none`}></textarea>
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-4 bg-teal-600 text-white font-bold py-3.5 rounded-xl hover:bg-teal-700 transition">
                                {editingEventId ? 'Update Event' : 'Publish Event'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add / Edit Task Modal */}
            {isTaskModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">{editingTaskId ? 'Edit Volunteer Task' : 'Create Volunteer Task'}</h2>
                            <button onClick={() => setIsTaskModalOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-500">✕</button>
                        </div>
                        <form onSubmit={handleTaskSubmit} className="space-y-4">
                            <div>
                                <label className={labelClasses}>Task Title *</label>
                                <input type="text" value={taskForm.title} onChange={(e) => setTaskForm({...taskForm, title: e.target.value})} required className={inputClasses} placeholder="e.g. Transport Dog to Vet" />
                            </div>
                            <div>
                                <label className={labelClasses}>Task Type</label>
                                <CustomSelect name="taskType" value={taskForm.taskType} options={[{value:'Rescue', label:'Rescue/Pickup'}, {value:'Transport', label:'Transport'}, {value:'Fostering', label:'Fostering'}, {value:'Event Help', label:'Event Help'}]} onChange={(e) => setTaskForm({...taskForm, taskType: e.target.value})} />
                            </div>
                            <div>
                                <label className={labelClasses}>Description / Requirements *</label>
                                <textarea rows="4" value={taskForm.description} onChange={(e) => setTaskForm({...taskForm, description: e.target.value})} required className={`${inputClasses} resize-none`} placeholder="Details about what needs to be done..."></textarea>
                            </div>
                            <button type="submit" className="w-full mt-4 bg-teal-600 text-white font-bold py-3.5 rounded-xl hover:bg-teal-700 transition">
                                {editingTaskId ? 'Update Task' : 'Create Task'}
                            </button>
                        </form>
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

export default OrganizationDashboard;