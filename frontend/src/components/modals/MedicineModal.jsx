import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

// Custom Dropdown Component
const CustomSelect = ({ name, value, options, onChange }) => {
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
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-3 bg-gray-50 border ${isOpen ? 'border-teal-500 ring-2 ring-teal-500 ring-opacity-20' : 'border-gray-200'} rounded-xl focus:outline-none transition-all duration-200 text-slate-800 flex justify-between items-center`}
            >
                <span>{value}</span>
                <svg 
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
            </button>

            <div 
                className={`absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.05)] py-2 transition-all duration-200 origin-top max-h-60 overflow-y-auto ${
                    isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'
                }`}
            >
                {options.map((option) => (
                    <div
                        key={option}
                        onClick={() => handleSelect(option)}
                        className={`px-4 py-2.5 cursor-pointer text-sm transition-colors duration-150 flex items-center justify-between
                            ${value === option 
                                ? 'bg-teal-50/50 text-teal-700 font-semibold' 
                                : 'text-slate-600 hover:bg-gray-50 hover:text-teal-600 font-medium'
                            }
                        `}
                    >
                        {option}
                        {value === option && (
                            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const MedicineModal = ({ isOpen, onClose, onSave, medicine }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'Antibiotics',
        description: '',
        price: '',
        inStock: true
    });

    const categories = ['Antibiotics', 'Flea & Tick', 'Supplements', 'Pain Relief', 'Wound Care', 'Other'];

    useEffect(() => {
        if (medicine) {
            setFormData({
                name: medicine.name || '',
                category: medicine.category || 'Antibiotics',
                description: medicine.description || '',
                price: medicine.price || '',
                inStock: medicine.inStock !== undefined ? medicine.inStock : true
            });
        } else {
            setFormData({
                name: '', category: 'Antibiotics', description: '', price: '', inStock: true
            });
        }
    }, [medicine, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, medicine ? medicine._id : null);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl flex flex-col transform transition-all animate-fade-in-up">
                
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-2xl font-bold text-slate-900">
                        {medicine ? 'Edit Medicine' : 'Add New Medicine'}
                    </h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 hover:bg-gray-200 transition-colors">
                        <FaTimes />
                    </button>
                </div>
                
                <form id="medicineForm" onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Medicine Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-1">Category *</label>
                            <CustomSelect 
                                name="category"
                                value={formData.category}
                                options={categories}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-1">Price (LKR) *</label>
                            <input type="number" step="0.01" name="price" value={formData.price} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-1">Description</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all resize-none" placeholder="Dosage info, active ingredients..."></textarea>
                    </div>

                    <div className="flex items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <input type="checkbox" id="inStock" name="inStock" checked={formData.inStock} onChange={handleChange} className="w-5 h-5 text-teal-600 bg-white border-gray-300 rounded focus:ring-teal-500 cursor-pointer" />
                        <label htmlFor="inStock" className="ml-3 text-sm font-bold text-slate-700 cursor-pointer">Currently in Stock</label>
                    </div>
                </form>
                
                <div className="flex gap-4 pt-6 mt-2">
                    <button type="button" onClick={onClose} className="flex-1 px-6 py-3.5 border border-gray-200 text-slate-600 font-bold rounded-full hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" form="medicineForm" className="flex-1 px-6 py-3.5 bg-teal-600 text-white font-bold rounded-full hover:bg-teal-700 transition-colors shadow-md">
                        {medicine ? 'Save Changes' : 'Add to Inventory'}
                    </button>
                </div>

            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up { animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}} />
        </div>
    );
};

export default MedicineModal;