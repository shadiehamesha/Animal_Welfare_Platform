import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { FaSearch, FaPaw, FaTrash, FaEdit, FaCheckCircle, FaBuilding } from 'react-icons/fa';
import AdminSidebar from '../../components/AdminSidebar';
import AdminPetModal from '../../components/modals/AdminPetModal';

const AdminPetManagement = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [userName, setUserName] = useState('Admin');
    const [pets, setPets] = useState([]);
    const [filteredPets, setFilteredPets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ total: 0, available: 0, adopted: 0 });
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPet, setSelectedPet] = useState(null);

    const role = localStorage.getItem('role') || 'system admin';

    useEffect(() => {
        fetchAdminData();
        fetchPets();
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

    const fetchPets = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/pets/admin/all', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setPets(data);
                
                setStats({
                    total: data.length,
                    available: data.filter(p => p.adoptionStatus === 'Available').length,
                    adopted: data.filter(p => p.adoptionStatus === 'Adopted').length
                });
            } else {
                setPets([]);
            }
        } catch (error) {
            console.error("Error fetching pets:", error);
            setPets([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Search
    useEffect(() => {
        if (!searchQuery) {
            setFilteredPets(pets);
            return;
        }
        const query = searchQuery.toLowerCase();
        const results = pets.filter(p => 
            p.name?.toLowerCase().includes(query) || 
            p.species?.toLowerCase().includes(query) ||
            p.breed?.toLowerCase().includes(query) ||
            p.shelter?.organizationName?.toLowerCase().includes(query)
        );
        setFilteredPets(results);
    }, [searchQuery, pets]);

    const handleDelete = async (id) => {
        if (!window.confirm('WARNING: Are you sure you want to permanently delete this pet record?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:5000/api/pets/admin/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                fetchPets();
            }
        } catch (error) {
            console.error('Failed to delete pet:', error);
        }
    };

    const handleSavePet = async (formData, petId) => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:5000/api/pets/admin/${petId}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                fetchPets();
                setIsModalOpen(false);
            } else {
                alert('Failed to update pet.');
            }
        } catch (err) { console.error(err); }
    };

    const openEditModal = (pet) => {
        setSelectedPet(pet);
        setIsModalOpen(true);
    };

    return (
        <div className="flex h-screen bg-[#f9fdfc] font-sans overflow-hidden">
            <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Admin Header */}
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
                        
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Pet Inventory Management</h1>
                            <p className="text-slate-500 mb-8">Oversee all animals currently registered across partner shelters.</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl shrink-0">
                                        <FaPaw />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 font-semibold text-sm">Total Pets</p>
                                        <p className="text-3xl font-black text-slate-900">{stats.total}</p>
                                    </div>
                                </div>
                                
                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center text-2xl shrink-0">
                                        <FaCheckCircle />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 font-semibold text-sm">Available for Adoption</p>
                                        <p className="text-3xl font-black text-slate-900">{stats.available}</p>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl shrink-0">
                                        <FaCheckCircle />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 font-semibold text-sm">Successfully Adopted</p>
                                        <p className="text-3xl font-black text-slate-900">{stats.adopted}</p>
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
                                    placeholder="Search by name, breed, species, or shelter..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent focus:outline-none text-sm text-slate-700"
                                />
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[900px]">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Pet Details</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Shelter</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Health Info</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="py-4 px-6 font-bold text-xs text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center text-slate-400">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                                                    Loading pets...
                                                </td>
                                            </tr>
                                        ) : filteredPets.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="py-12 text-center text-slate-500 font-medium">
                                                    No pets found matching your criteria.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredPets.map((pet) => (
                                                <tr key={pet._id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                                                <FaPaw />
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-slate-900">{pet.name}</p>
                                                                <p className="text-xs text-slate-500 font-medium">{pet.species} • {pet.breed || 'Mixed'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                                            <FaBuilding className="text-teal-500 shrink-0" /> 
                                                            <span className="font-medium truncate max-w-[150px]">{pet.shelter?.organizationName || 'Unknown'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <div className="flex gap-2">
                                                            {pet.healthStatus?.vaccinated ? 
                                                                <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded border border-green-100">Vax'd</span> : 
                                                                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200">No Vax</span>}
                                                            {pet.healthStatus?.sterilized ? 
                                                                <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">Spayed/Neutered</span> : 
                                                                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-200">Intact</span>}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-6">
                                                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md border ${
                                                            pet.adoptionStatus === 'Available' ? 'bg-green-50 text-green-700 border-green-200' :
                                                            pet.adoptionStatus === 'Adopted' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                            'bg-orange-50 text-orange-700 border-orange-200'
                                                        }`}>
                                                            {pet.adoptionStatus}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-right space-x-2 whitespace-nowrap">
                                                        <button onClick={() => openEditModal(pet)} className="p-2.5 bg-gray-50 text-slate-600 rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-colors shadow-sm border border-gray-200">
                                                            <FaEdit size={14} />
                                                        </button>
                                                        <button onClick={() => handleDelete(pet._id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors shadow-sm">
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <AdminPetModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSavePet} 
                pet={selectedPet} 
            />

            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}} />
        </div>
    );
};

export default AdminPetManagement;