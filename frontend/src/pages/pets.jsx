import React, { useState, useEffect } from 'react';
import Navbar from '../components/navigation.jsx';
import Footer from '../components/footer.jsx';
import PetFilterBar from '../components/PetFilterBar.jsx';
import PublicPetModal from '../components/modals/PublicPetModal.jsx';
import { FaHeart, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa';

const Pets = () => {
    const [pets, setPets] = useState([]);
    const [recommendedPets, setRecommendedPets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    
    // Modal State
    const [selectedPet, setSelectedPet] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [filters, setFilters] = useState({
        search: '', species: '', size: '', age: '', sort: 'newest'
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
        
        const fetchPetsData = async () => {
            setIsLoading(true);
            try {
                // Fetch public inventory
                const publicRes = await fetch('http://localhost:5000/api/pets/public');
                if (publicRes.ok) setPets(await publicRes.json());

                // Fetch recommendations if logged in
                if (token) {
                    const recRes = await fetch('http://localhost:5000/api/pets/recommendations', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (recRes.ok) setRecommendedPets(await recRes.json());
                }
            } catch (error) {
                console.error("Error fetching pets:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPetsData();
    }, []);

    const openModal = (pet) => {
        setSelectedPet(pet);
        setIsModalOpen(true);
    };

    const filteredPets = pets.filter(pet => {
        const searchMatch = !filters.search || 
            pet.name.toLowerCase().includes(filters.search.toLowerCase()) || 
            (pet.breed && pet.breed.toLowerCase().includes(filters.search.toLowerCase()));
        const speciesMatch = !filters.species || pet.species === filters.species;
        const sizeMatch = !filters.size || pet.size === filters.size;
        return searchMatch && speciesMatch && sizeMatch;
    }).sort((a, b) => {
        if (filters.sort === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
        if (filters.sort === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
        return 0;
    });

    const PetCard = ({ pet, recommended = false }) => (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden hover:shadow-lg hover:border-teal-100 transition-all duration-300 group flex flex-col h-full relative">
            {recommended && (
                <div className="absolute top-4 left-4 bg-teal-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide z-10 flex items-center gap-1 shadow-sm">
                    <FaHeart /> Match
                </div>
            )}
            <div className="h-56 bg-gray-100 overflow-hidden relative">
                {pet.photos && pet.photos.length > 0 ? (
                    <img src={pet.photos[0]} alt={pet.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl bg-teal-50/50">
                        {pet.species === 'Cat' ? '🐱' : pet.species === 'Dog' ? '🐶' : '🐾'}
                    </div>
                )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{pet.name}</h3>
                    <span className="bg-gray-50 text-slate-600 text-[11px] font-bold px-2 py-1 rounded-md uppercase border border-gray-100">{pet.species}</span>
                </div>
                <p className="text-sm text-slate-500 mb-4">{pet.breed || 'Mixed Breed'} • {pet.age || 'Age Unknown'}</p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                    {pet.size && pet.size !== 'Unknown' && <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded">{pet.size} Size</span>}
                    {pet.healthStatus?.vaccinated && <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded">Vaccinated</span>}
                    {pet.healthStatus?.sterilized && <span className="bg-purple-50 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded">Sterilized</span>}
                </div>

                {/* Updated Action Area */}
                <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <button onClick={() => openModal(pet)} className="text-xs text-slate-400 hover:text-teal-600 font-semibold transition-colors flex items-center gap-1.5">
                        <FaMapMarkerAlt /> {pet.shelter ? 'View Shelter' : 'View Contact'}
                    </button>
                    <button onClick={() => openModal(pet)} className="text-teal-600 hover:text-teal-800 font-bold text-sm transition-colors flex items-center gap-1">
                        Meet {pet.name} <span className="text-lg leading-none">&rarr;</span>
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <div className="bg-teal-700 text-white py-16 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Find Your New Best Friend</h1>
                    <p className="text-teal-100 text-lg max-w-2xl mx-auto">Browse available pets from verified shelters across the country. Every adoption saves a life.</p>
                </div>
            </div>

            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full -mt-8">
                <PetFilterBar filters={filters} setFilters={setFilters} />

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
                        <p className="text-slate-500 font-medium">Fetching adorable pets...</p>
                    </div>
                ) : (
                    <>
                        {/* Recommendation UI */}
                        {isLoggedIn && recommendedPets.length > 0 && !filters.search && !filters.species && (
                            <div className="mb-16">
                                <div className="flex items-center gap-3 mb-6">
                                    <h2 className="text-2xl font-bold text-slate-900">Recommended For You</h2>
                                    <span className="bg-teal-50 text-teal-600 text-xs font-bold px-3 py-1 rounded-full border border-teal-100 flex items-center gap-1">
                                        <FaInfoCircle /> Based on your activity
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {recommendedPets.slice(0, 4).map(pet => (
                                        <PetCard key={`rec-${pet._id}`} pet={pet} recommended={true} />
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-slate-900">Available for Adoption</h2>
                            <span className="text-sm font-semibold text-slate-500">{filteredPets.length} pets found</span>
                        </div>

                        {filteredPets.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {filteredPets.map(pet => (
                                    <PetCard key={pet._id} pet={pet} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
                                <span className="text-5xl mb-4 block opacity-50">🐾</span>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No pets match your criteria</h3>
                                <p className="text-slate-500">Try adjusting your filters or check back later.</p>
                                <button onClick={() => setFilters({search: '', species: '', size: '', age: '', sort: 'newest'})} className="mt-6 text-teal-600 font-bold hover:text-teal-700">Clear Filters</button>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Render the Modal */}
            <PublicPetModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                pet={selectedPet} 
            />

            <Footer />
        </div>
    );
};

export default Pets;