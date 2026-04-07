import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import AdminSidebar from '../../components/AdminSidebar';

const AdminContactManagement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('Admin');
    const [messages, setMessages] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    
    const role = localStorage.getItem('role') || 'system admin';

    useEffect(() => {
        fetchAdminData();
        fetchMessages();
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
            } catch (error) { console.error(error); }
        }
    };

    const fetchMessages = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/contacts', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (error) { console.error("Error fetching messages:", error); }
    };

    const handleStatusChange = async (id, newStatus) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/contacts/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) fetchMessages();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/contacts/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchMessages();
        } catch (err) { console.error(err); }
    };

    // Filter Logic
    const filteredMessages = messages.filter(m => {
        const matchesSearch = 
            (m.user?._id && m.user._id.toLowerCase().includes(searchQuery.toLowerCase())) ||
            m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.message.toLowerCase().includes(searchQuery.toLowerCase());
            
        const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-orange-50 text-orange-600 border-orange-200';
            case 'reviewed': return 'bg-blue-50 text-blue-600 border-blue-200';
            case 'resolved': return 'bg-green-50 text-green-600 border-green-200';
            default: return 'bg-gray-50 text-gray-600 border-gray-200';
        }
    };

    return (
        <div className="flex h-screen bg-[#f9fdfc] font-sans overflow-hidden">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 flex flex-col h-full overflow-hidden">
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

                <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-3xl font-bold text-slate-900 mb-8">Contact Messages</h1>

                        {/* Filters & Search */}
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center">
                                <span className="text-xl pl-3 pr-2 text-slate-400">🔍</span>
                                <input 
                                    type="text" 
                                    placeholder="Search by User ID, Subject, or Message..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full focus:outline-none text-slate-700 placeholder-slate-400 py-2"
                                />
                            </div>
                            <select 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="bg-white border border-gray-100 shadow-sm text-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-medium"
                            >
                                <option value="all">All Statuses</option>
                                <option value="pending">Pending</option>
                                <option value="reviewed">Reviewed</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>

                        {/* Messages Grid */}
                        <div className="space-y-4">
                            {filteredMessages.map((msg) => (
                                <div key={msg._id} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6">
                                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 border-b border-gray-50 pb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900">{msg.subject}</h3>
                                            <p className="text-sm text-slate-500 mt-1">
                                                From User ID: <span className="font-mono text-xs bg-gray-50 px-2 py-1 rounded">{msg.user?._id || 'Unknown'}</span> 
                                                <span className="mx-2">•</span> 
                                                {new Date(msg.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <select
                                                value={msg.status}
                                                onChange={(e) => handleStatusChange(msg._id, e.target.value)}
                                                className={`text-sm font-bold border rounded-full px-4 py-2 cursor-pointer focus:outline-none ${getStatusColor(msg.status)}`}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="reviewed">Reviewed</option>
                                                <option value="resolved">Resolved</option>
                                            </select>
                                            <button 
                                                onClick={() => handleDelete(msg._id)}
                                                className="text-red-500 hover:text-red-700 font-medium bg-red-50 hover:bg-red-100 px-4 py-2 rounded-full transition-colors text-sm"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-slate-700 leading-relaxed text-[15px] whitespace-pre-wrap">{msg.message}</p>
                                </div>
                            ))}
                            {filteredMessages.length === 0 && (
                                <div className="text-center py-12 bg-white rounded-[2rem] border border-gray-100">
                                    <span className="text-4xl">📭</span>
                                    <p className="text-slate-500 mt-4 font-medium">No messages found.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminContactManagement;