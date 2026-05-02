import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

const CustomSelect = ({ name, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (optionValue) => {
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 bg-gray-50 border ${isOpen ? 'border-teal-500 ring-2 ring-teal-500 ring-opacity-20' : 'border-gray-200'} rounded-xl focus:outline-none transition-all duration-200 text-slate-800 flex justify-between items-center text-sm`}
            >
                <span>{value}</span>
                <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <div className={`absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.05)] py-2 transition-all duration-200 origin-top max-h-48 overflow-y-auto ${isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'}`}>
                {options.map((option) => (
                    <div
                        key={option}
                        onClick={() => handleSelect(option)}
                        className={`px-4 py-2 cursor-pointer text-sm transition-colors duration-150 flex items-center justify-between ${value === option ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-slate-600 hover:bg-gray-50 hover:text-teal-600'}`}
                    >
                        {option}
                    </div>
                ))}
            </div>
        </div>
    );
};

const AdminPetModal = ({ isOpen, onClose, onSave, pet }) => {
    const [formData, setFormData] = useState({
        name: '', species: 'Dog', breed: '', age: '', size: 'Unknown', gender: 'Unknown',
        adoptionStatus: 'Available',
        healthStatus: { vaccinated: false, sterilized: false, medicalNotes: '' }
    });

    useEffect(() => {
        if (pet) {
            setFormData({
                name: pet.name || '',
                species: pet.species || 'Dog',
                breed: pet.breed || '',
                age: pet.age || '',
                size: pet.size || 'Unknown',
                gender: pet.gender || 'Unknown',
                adoptionStatus: pet.adoptionStatus || 'Available',
                healthStatus: { 
                    vaccinated: pet.healthStatus?.vaccinated || false, 
                    sterilized: pet.healthStatus?.sterilized || false, 
                    medicalNotes: pet.healthStatus?.medicalNotes || '' 
                }
            });
        }
    }, [pet, isOpen]);

    if (!isOpen || !pet) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleNestedChange = (e) => {
        const { name, checked, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            healthStatus: { ...prev.healthStatus, [name]: type === 'checkbox' ? checked : value }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, pet._id);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
                
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Edit Pet Details</h2>
                        <p className="text-sm text-teal-600 font-semibold mt-1">Shelter: {pet.shelter?.organizationName}</p>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 hover:bg-gray-200 transition-colors">
                        <FaTimes />
                    </button>
                </div>
                
                <div className="overflow-y-auto px-2 py-2 custom-scrollbar">
                    <form id="adminPetForm" onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-semibold text-slate-800 mb-1">Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-1">Species</label>
                                <CustomSelect name="species" value={formData.species} options={['Dog', 'Cat', 'Other']} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-1">Breed</label>
                                <input type="text" name="breed" value={formData.breed} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-1">Size</label>
                                <CustomSelect name="size" value={formData.size} options={['Small', 'Medium', 'Large', 'Unknown']} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-800 mb-1">Status</label>
                                <CustomSelect name="adoptionStatus" value={formData.adoptionStatus} options={['Available', 'Pending Review', 'Adopted', 'Fostered']} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 mt-4">
                            <h3 className="text-sm font-bold text-slate-800 mb-4">Health & Medical</h3>
                            <div className="flex gap-6 mb-4">
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                                    <input type="checkbox" name="vaccinated" checked={formData.healthStatus.vaccinated} onChange={handleNestedChange} className="w-4 h-4 text-teal-600 bg-white border-gray-300 rounded focus:ring-teal-500" />
                                    Vaccinated
                                </label>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                                    <input type="checkbox" name="sterilized" checked={formData.healthStatus.sterilized} onChange={handleNestedChange} className="w-4 h-4 text-teal-600 bg-white border-gray-300 rounded focus:ring-teal-500" />
                                    Sterilized
                                </label>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1">Medical Notes</label>
                                <textarea name="medicalNotes" value={formData.healthStatus.medicalNotes} onChange={handleNestedChange} rows="2" className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm resize-none"></textarea>
                            </div>
                        </div>
                    </form>
                </div>
                
                <div className="flex gap-4 pt-6 mt-4 border-t border-gray-100 shrink-0">
                    <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 border border-gray-200 text-slate-600 font-bold rounded-full hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" form="adminPetForm" className="flex-1 px-6 py-3.5 bg-teal-600 text-white font-bold rounded-full hover:bg-teal-700 transition-colors shadow-md">
                        Save Changes
                    </button>
                </div>

            </div>
            <style dangerouslySetInnerHTML={{__html: `@keyframes fadeInUp { from { opacity: 0; transform: translateY(20px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } } .animate-fade-in-up { animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }`}} />
        </div>
    );
};

export default AdminPetModal;