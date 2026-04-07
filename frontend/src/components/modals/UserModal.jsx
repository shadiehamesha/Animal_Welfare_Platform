import React, { useState, useEffect, useRef } from 'react';

// Custom Dropdown Component matching the app's theme
const CustomSelect = ({ name, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
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
        // Mock a standard event object to plug seamlessly into your existing handleChange
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-5 py-3 bg-gray-50 border ${isOpen ? 'border-teal-500 ring-2 ring-teal-500 ring-opacity-20' : 'border-gray-200'} rounded-2xl focus:outline-none transition-all duration-200 text-slate-800 capitalize flex justify-between items-center`}
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

            {/* Dropdown Menu */}
            <div 
                className={`absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.05)] py-2 transition-all duration-200 origin-top max-h-60 overflow-y-auto ${
                    isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'
                }`}
            >
                {options.map((option) => (
                    <div
                        key={option}
                        onClick={() => handleSelect(option)}
                        className={`px-5 py-3 cursor-pointer text-sm capitalize transition-colors duration-150 flex items-center justify-between
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

const UserModal = ({ isOpen, onClose, onSave, user }) => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'normal user'
    });

    const roles = [
        'normal user', 
        'system admin', 
        'organizations/shelters', 
        'pharmacies', 
        'hospitals/veterinarians'
    ];

    useEffect(() => {
        if (user) {
            setFormData({ name: user.name, email: user.email, password: '', role: user.role });
        } else {
            setFormData({ name: '', email: '', password: '', role: 'normal user' });
        }
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, user ? user._id : null);
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-xl">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                    {user ? 'Edit User' : 'Add New User'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">Name</label>
                        <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">Email</label>
                        <input 
                            type="email" 
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                            required
                        />
                    </div>

                    {!user && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">Password</label>
                            <input 
                                type="password" 
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                                required={!user}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-slate-800 mb-2">Role</label>
                        <CustomSelect 
                            name="role"
                            value={formData.role}
                            options={roles}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-200 text-slate-600 font-semibold rounded-full hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 px-6 py-3 bg-teal-600 text-white font-semibold rounded-full hover:bg-teal-700 transition-colors shadow-md"
                        >
                            {user ? 'Save Changes' : 'Add User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserModal;