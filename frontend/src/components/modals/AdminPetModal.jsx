import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaCamera } from 'react-icons/fa';
import ModernDatePicker from '../../utils/ModernDatePicker';

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
        healthStatus: { vaccinated: false, sterilized: false, medicalNotes: '' },
        vaccinationSchedule: []
    });
    const [photo, setPhoto] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

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
                },
                vaccinationSchedule: pet.vaccinationSchedule?.map(v => ({
                    vaccineName: v.vaccineName || '',
                    dueDate: v.dueDate ? new Date(v.dueDate).toISOString().split('T')[0] : '',
                    status: v.status || 'Pending'
                })) || []
            });
            setPreviewUrl(pet.photos && pet.photos.length > 0 ? pet.photos[0] : null);
        } else {
            setFormData({
                name: '', species: 'Dog', breed: '', age: '', size: 'Unknown', gender: 'Unknown',
                adoptionStatus: 'Available',
                healthStatus: { vaccinated: false, sterilized: false, medicalNotes: '' },
                vaccinationSchedule: []
            });
            setPreviewUrl(null);
        }
        setPhoto(null);
    }, [pet, isOpen]);

    if (!isOpen) return null;

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

    const handleAddVaccine = () => {
        setFormData(prev => ({
            ...prev,
            vaccinationSchedule: [...prev.vaccinationSchedule, { vaccineName: '', dueDate: '', status: 'Pending' }]
        }));
    };

    const handleRemoveVaccine = (index) => {
        setFormData(prev => ({
            ...prev,
            vaccinationSchedule: prev.vaccinationSchedule.filter((_, i) => i !== index)
        }));
    };

    const handleVaccineChange = (index, e) => {
        const { name, value } = e.target;
        const updatedSchedule = [...formData.vaccinationSchedule];
        updatedSchedule[index][name] = value;
        setFormData(prev => ({ ...prev, vaccinationSchedule: updatedSchedule }));
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(e.target.files[0]);
            setPreviewUrl(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Convert to FormData to support file upload
        const payload = new FormData();
        payload.append('name', formData.name);
        payload.append('species', formData.species);
        payload.append('breed', formData.breed);
        payload.append('age', formData.age);
        payload.append('size', formData.size);
        payload.append('gender', formData.gender);
        payload.append('adoptionStatus', formData.adoptionStatus);
        payload.append('healthStatus', JSON.stringify(formData.healthStatus)); // Send nested obj as string
        payload.append('vaccinationSchedule', JSON.stringify(formData.vaccinationSchedule));

        if (photo) {
            payload.append('photo', photo);
        }

        onSave(payload, pet ? pet._id : null);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
                
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4 shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{pet ? 'Edit Pet Details' : 'Add New Pet'}</h2>
                        {pet?.shelter && <p className="text-sm text-teal-600 font-semibold mt-1">Shelter: {pet.shelter.organizationName}</p>}
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 hover:bg-gray-200 transition-colors">
                        <FaTimes />
                    </button>
                </div>
                
                <div className="overflow-y-auto px-2 py-2 custom-scrollbar">
                    <form id="adminPetForm" onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Photo Upload Section */}
                        <div className="flex flex-col items-center justify-center p-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl relative overflow-hidden group">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Pet preview" className="w-full h-40 object-cover rounded-xl" />
                            ) : (
                                <div className="text-center py-6">
                                    <FaCamera className="mx-auto text-3xl text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500 font-medium">Click to upload pet photo</p>
                                </div>
                            )}
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handlePhotoChange} 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {previewUrl && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <p className="text-white font-bold">Change Photo</p>
                                </div>
                            )}
                        </div>

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
                                <label className="block text-sm font-semibold text-slate-800 mb-1">Age</label>
                                <input type="text" name="age" value={formData.age} onChange={handleChange} placeholder="e.g. 2 months" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-sm" />
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

                        <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 mt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-bold text-slate-800">Vaccination Schedule</h3>
                                <button type="button" onClick={handleAddVaccine} className="text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-3 py-1.5 rounded-lg transition-colors">
                                    + Add Vaccine
                                </button>
                            </div>
                            
                            {formData.vaccinationSchedule.length === 0 ? (
                                <p className="text-xs text-slate-500 italic">No vaccines scheduled.</p>
                            ) : (
                                <div className="space-y-3">
                                    {formData.vaccinationSchedule.map((vaccine, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white p-3 rounded-xl border border-gray-200 shadow-sm relative group">
                                            <div className="flex-1 w-full">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Vaccine Name</label>
                                                <input type="text" name="vaccineName" value={vaccine.vaccineName} onChange={(e) => handleVaccineChange(index, e)} required className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all text-sm" placeholder="e.g. Rabies" />
                                            </div>
                                            <div className="flex-1 w-full">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Due Date</label>
                                                <ModernDatePicker name="dueDate" value={vaccine.dueDate} onChange={(e) => handleVaccineChange(index, e)} />
                                            </div>
                                            <div className="flex-1 w-full sm:w-auto min-w-[120px]">
                                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</label>
                                                <CustomSelect name="status" value={vaccine.status} options={['Pending', 'Completed']} onChange={(e) => handleVaccineChange(index, e)} />
                                            </div>
                                            <button type="button" onClick={() => handleRemoveVaccine(index)} className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-gray-200 text-red-500 rounded-full flex items-center justify-center hover:bg-red-50 shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                <FaTimes size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
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
        </div>
    );
};

export default AdminPetModal;