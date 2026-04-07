import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import UserModal from '../../components/modals/UserModal';
import AdminSidebar from '../../components/AdminSidebar';

const UserManagement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('Admin');
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    
    const usersPerPage = 8;
    const role = localStorage.getItem('role') || 'system admin';

    // Fetch Admin Data & Users
    useEffect(() => {
        fetchAdminData();
        fetchUsers();
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

    const fetchUsers = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('http://localhost:5000/api/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) { console.error("Error fetching users:", error); }
    };

    // CRUD Operations
    const handleSaveUser = async (formData, userId) => {
        const token = localStorage.getItem('token');
        const url = userId 
            ? `http://localhost:5000/api/users/${userId}` 
            : `http://localhost:5000/api/users/register`;
        const method = userId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchUsers();
                setIsModalOpen(false);
            } else {
                const error = await res.json();
                alert(`Error: ${error.message}`);
            }
        } catch (err) { console.error(err); }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) fetchUsers();
        } catch (err) { console.error(err); }
    };

    const openAddModal = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    // Search and Pagination Logic
    const filteredUsers = users.filter(u => 
        (u._id && u._id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.name && u.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    return (
        <div className="flex h-screen bg-[#f9fdfc] font-sans overflow-hidden">
            
            <AdminSidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
            />

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 shrink-0">
                    <button className="md:hidden p-2 text-slate-500 hover:bg-gray-50 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                    
                    <div className="flex-1 md:flex-none"></div>

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

                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-6 lg:p-10">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                            <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
                            <button onClick={openAddModal} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 px-6 rounded-full transition-colors shadow-sm">
                                + Add New User
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex items-center">
                            <span className="text-xl pl-2 pr-4 text-slate-400">🔍</span>
                            <input 
                                type="text" 
                                placeholder="Search by ID, Name, or Email..." 
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full focus:outline-none text-slate-700 placeholder-slate-400"
                            />
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="py-4 px-6 font-semibold text-sm text-slate-500">ID</th>
                                            <th className="py-4 px-6 font-semibold text-sm text-slate-500">Name</th>
                                            <th className="py-4 px-6 font-semibold text-sm text-slate-500">Email</th>
                                            <th className="py-4 px-6 font-semibold text-sm text-slate-500">Role</th>
                                            <th className="py-4 px-6 font-semibold text-sm text-slate-500 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentUsers.map((u) => (
                                            <tr key={u._id} className="border-b border-gray-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 px-6 text-sm text-slate-400 font-mono">...{u._id.slice(-6)}</td>
                                                <td className="py-4 px-6 text-sm font-semibold text-slate-800">{u.name}</td>
                                                <td className="py-4 px-6 text-sm text-slate-600">{u.email}</td>
                                                <td className="py-4 px-6 text-sm">
                                                    <span className="px-3 py-1 bg-[#eafff5] text-teal-700 rounded-full text-xs font-bold capitalize">
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-center flex justify-center gap-3">
                                                    <button onClick={() => openEditModal(u)} className="text-blue-500 hover:text-blue-700 font-medium bg-blue-50 px-3 py-1.5 rounded-lg">Edit</button>
                                                    <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:text-red-700 font-medium bg-red-50 px-3 py-1.5 rounded-lg">Delete</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {currentUsers.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="py-8 text-center text-slate-500">No users found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <span className="text-sm text-slate-500">
                                        Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} entries
                                    </span>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Prev
                                        </button>
                                        <button 
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <UserModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSaveUser} 
                user={selectedUser} 
            />
        </div>
    );
};

export default UserManagement;