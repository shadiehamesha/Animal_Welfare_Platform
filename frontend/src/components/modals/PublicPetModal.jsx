import React from 'react';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaSyringe, FaBuilding, FaCheckCircle, FaStethoscope } from 'react-icons/fa';
import Modal from './OrganizationModal';

const PublicPetModal = ({ isOpen, onClose, pet }) => {
    if (!pet) return null;

    const photoUrl = pet.photos && pet.photos.length > 0 
        ? pet.photos[0] : null;

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={onClose} 
            title={`Meet ${pet.name}`}
            maxWidth="max-w-4xl"
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Left Column: Image & Badges */}
                <div className="space-y-4">
                    <div className="w-full h-80 bg-gray-100 rounded-[2rem] overflow-hidden relative shadow-sm border border-gray-100">
                        {photoUrl ? (
                            <img src={photoUrl} alt={pet.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-6xl bg-teal-50">
                                {pet.species === 'Cat' ? '🐱' : pet.species === 'Dog' ? '🐶' : '🐾'}
                            </div>
                        )}
                        <div className="absolute bottom-4 left-4 flex gap-2">
                            <span className="bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                {pet.species}
                            </span>
                            <span className="bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                                {pet.gender}
                            </span>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                        <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <FaStethoscope className="text-teal-600" /> Health & Medical
                        </h4>
                        <div className="flex flex-wrap gap-2 mb-3">
                            <span className={`text-xs font-bold px-3 py-1 rounded-md border ${pet.healthStatus?.vaccinated ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                {pet.healthStatus?.vaccinated ? 'Vaccinated' : 'Not Vaccinated'}
                            </span>
                            <span className={`text-xs font-bold px-3 py-1 rounded-md border ${pet.healthStatus?.sterilized ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                {pet.healthStatus?.sterilized ? 'Spayed/Neutered' : 'Intact'}
                            </span>
                        </div>
                        {pet.healthStatus?.medicalNotes && (
                            <p className="text-sm text-slate-600 mt-2 bg-white p-3 rounded-xl border border-gray-100">
                                {pet.healthStatus.medicalNotes}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right Column: Details & Shelter Info */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 mb-2">{pet.name}</h3>
                        <p className="text-lg text-slate-600 font-medium">{pet.breed || 'Mixed Breed'} • {pet.age || 'Age Unknown'}</p>
                        {pet.size && pet.size !== 'Unknown' && (
                            <p className="text-sm text-slate-500 mt-1">{pet.size} Size</p>
                        )}
                        <div className="mt-4">
                             <span className="bg-teal-50 text-teal-700 text-sm font-bold px-4 py-2 rounded-xl border border-teal-100">
                                Status: {pet.adoptionStatus}
                            </span>
                        </div>
                    </div>

                    {pet.description && (
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-slate-600 text-sm leading-relaxed">{pet.description}</p>
                        </div>
                    )}

                    {pet.shelter && (
                        <div className="pt-6 mt-6 border-t border-gray-100">
                            <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <FaBuilding className="text-teal-600 text-lg" /> Hosted By
                            </h4>
                            <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-[0_4px_20px_rgb(13,148,136,0.05)]">
                                <div className="flex items-center gap-2 mb-2">
                                    <h5 className="font-bold text-lg text-slate-900">{pet.shelter.organizationName}</h5>
                                    {pet.shelter.isVerified && <FaCheckCircle className="text-green-500" title="Verified Shelter" />}
                                </div>
                                
                                <div className="space-y-3 mt-4 text-sm">
                                    <div className="flex items-start gap-3 text-slate-700">
                                        <FaMapMarkerAlt className="text-teal-500 mt-1 shrink-0" /> 
                                        <span className="font-medium">{pet.shelter.address}, {pet.shelter.city}</span>
                                    </div>
                                    {pet.shelter.contact?.phone && (
                                        <div className="flex items-center gap-3 text-slate-700">
                                            <FaPhone className="text-teal-500 shrink-0" /> 
                                            <span className="font-medium">{pet.shelter.contact.phone}</span>
                                        </div>
                                    )}
                                    {pet.shelter.contact?.email && (
                                        <div className="flex items-center gap-3 text-slate-700">
                                            <FaEnvelope className="text-teal-500 shrink-0" /> 
                                            <span className="font-medium">{pet.shelter.contact.email}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

export default PublicPetModal;