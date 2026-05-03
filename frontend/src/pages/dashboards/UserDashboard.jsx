import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { Link } from 'react-router-dom';
import { FaFileAlt, FaCalendarCheck, FaHandsHelping, FaMapMarkerAlt, FaClock, FaBuilding, FaExclamationCircle } from 'react-icons/fa';
import Navbar from '../../components/navigation';
import Footer from '../../components/footer';
import UserContactWidget from '../../components/UserContactWidget';

const UserStatsWidget = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:border-teal-100 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center text-2xl shrink-0">
                    <FaFileAlt />
                </div>
                <div>
                    <p className="text-slate-500 font-semibold text-sm">My Reports</p>
                    <p className="text-3xl font-black text-slate-900">{stats.reports}</p>
                </div>
            </div>
            
            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:border-teal-100 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl shrink-0">
                    <FaCalendarCheck />
                </div>
                <div>
                    <p className="text-slate-500 font-semibold text-sm">Upcoming Events</p>
                    <p className="text-3xl font-black text-slate-900">{stats.events}</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5 hover:border-teal-100 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center text-2xl shrink-0">
                    <FaHandsHelping />
                </div>
                <div>
                    <p className="text-slate-500 font-semibold text-sm">Active Volunteer Tasks</p>
                    <p className="text-3xl font-black text-slate-900">{stats.tasks}</p>
                </div>
            </div>
        </div>
    );
};

const UserReportsList = ({ reports }) => {
    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 lg:p-8 flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900">My Stray Reports</h2>
                <Link to="/report" className="text-teal-600 text-sm font-semibold hover:text-teal-700 bg-teal-50 px-4 py-2 rounded-full transition-colors">
                    + New Report
                </Link>
            </div>
            
            <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2" style={{ maxHeight: '500px' }}>
                {reports.length > 0 ? (
                    reports.map(report => (
                        <div key={report._id} className="p-5 border border-gray-100 bg-gray-50/50 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center hover:border-teal-200 transition-colors">
                            {/* Image Placeholder or Actual Image */}
                            <div className="w-16 h-16 rounded-xl bg-gray-200 shrink-0 overflow-hidden">
                                {report.imageUrl ? (
                                    <img src={`http://localhost:5000${report.imageUrl}`} alt="Stray" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl">🐾</div>
                                )}
                            </div>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-slate-900 capitalize">{report.animalType || 'Animal Report'}</h3>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                                        report.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                                        report.status === 'Claimed' ? 'bg-blue-100 text-blue-700' :
                                        'bg-orange-100 text-orange-700'
                                    }`}>
                                        {report.status || 'Pending'}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mb-2 line-clamp-1">{report.description}</p>
                                <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
                                    <span className="flex items-center gap-1"><FaMapMarkerAlt /> {report.location?.address || 'Location provided'}</span>
                                    <span className="flex items-center gap-1"><FaClock /> {new Date(report.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 border-2 border-dashed border-gray-100 rounded-2xl">
                        <span className="text-4xl mb-3">📭</span>
                        <p className="text-slate-800 font-bold mb-1">No reports yet.</p>
                        <p className="text-slate-500 text-sm text-center px-4">You haven't reported any stray animals.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const UserEventsList = ({ events, tasks }) => {
    return (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 lg:p-8 flex flex-col h-full">
            <h2 className="text-xl font-bold text-slate-900 mb-6">My Activities</h2>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-8" style={{ maxHeight: '500px' }}>
                
                {/* Registered Events Section */}
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Registered Events</h3>
                    <div className="space-y-3">
                        {events.length > 0 ? (
                            events.map(event => (
                                <div key={event._id} className="p-4 border border-teal-100 bg-teal-50/30 rounded-2xl flex flex-col">
                                    <h4 className="font-bold text-slate-900 mb-1">{event.title}</h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-600 mb-2">
                                        <FaBuilding className="text-teal-500" />
                                        <span className="font-medium">{event.shelter?.organizationName || 'Shelter'}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 bg-white px-3 py-2 rounded-lg border border-teal-50">
                                        <span className="flex items-center gap-1.5 text-teal-700"><FaClock /> {new Date(event.date).toLocaleDateString()} at {event.time?.start}</span>
                                        <span className="flex items-center gap-1.5"><FaMapMarkerAlt /> {event.location}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 font-medium italic">You are not registered for any upcoming events.</p>
                        )}
                    </div>
                </div>

                {/* Volunteering Tasks Section */}
                <div>
                    <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Volunteer Commitments</h3>
                    <div className="space-y-3">
                        {tasks.length > 0 ? (
                            tasks.map(task => (
                                <div key={task._id} className="p-4 border border-blue-100 bg-blue-50/30 rounded-2xl flex flex-col">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-slate-900">{task.title}</h4>
                                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                                            task.status === 'Approved' ? 'bg-green-100 text-green-700 border-green-200' : 
                                            'bg-blue-100 text-blue-700 border-blue-200'
                                        }`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 mb-3">{task.description}</p>
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                        <FaBuilding className="text-blue-500" />
                                        <span>For: {task.shelter?.organizationName || 'Shelter'}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-400 font-medium italic">You haven't claimed any volunteer tasks yet.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

const UserDashboard = () => {
    const [user, setUser] = useState({ name: 'User', email: '' });
    const [reports, setReports] = useState([]);
    const [events, setEvents] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;

            try {
                const decoded = jwtDecode(token);
                const userRes = await fetch(`http://localhost:5000/api/users/${decoded.id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (userRes.ok) setUser(await userRes.json());

                const reportsRes = await fetch(`http://localhost:5000/api/reports/my-reports`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (reportsRes.ok) setReports(await reportsRes.json());

                const eventsRes = await fetch(`http://localhost:5000/api/events/my-registered-events`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (eventsRes.ok) setEvents(await eventsRes.json());

                const tasksRes = await fetch(`http://localhost:5000/api/tasks/my-volunteer-tasks`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (tasksRes.ok) setTasks(await tasksRes.json());

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
                <Navbar />
                <main className="flex-grow flex justify-center items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <main className="flex-grow py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                
                {/* Dashboard Welcome Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                            Welcome back, {user.name.split(' ')[0]} 👋
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg">
                            Here is a summary of your impact on the community.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full border border-gray-100 shadow-sm">
                        <FaExclamationCircle className="text-teal-600" />
                        <span className="text-sm font-semibold text-slate-700">Need help? <Link to="/contact" className="text-teal-600 hover:underline">Contact Support</Link></span>
                    </div>
                </div>

                {/* Stats Widget */}
                <UserStatsWidget stats={{
                    reports: reports.length,
                    events: events.length,
                    tasks: tasks.length
                }} />

                {/* Main Content Grid */}
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
                        <UserReportsList reports={reports} />
                        <UserEventsList events={events} tasks={tasks} />
                    </div>
                    
                    <div className="w-full lg:w-[400px] shrink-0">
                        <UserContactWidget />
                    </div>
                </div>
                
            </main>

            <Footer />

            {/* Custom Scrollbar Styles specific to the dashboard lists */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}} />
        </div>
    );
};

export default UserDashboard;