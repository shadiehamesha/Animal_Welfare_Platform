import React, { useState, useRef, useEffect } from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';

// custom dropdown
const CustomSelect = ({ name, value, options, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // close dropdown when clicking outside
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

    const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-gray-50 border ${isOpen ? 'border-teal-500 ring-2 ring-teal-500 ring-opacity-20' : 'border-gray-200'} text-slate-700 text-sm rounded-xl px-4 py-3 focus:outline-none transition-all font-medium flex justify-between items-center`}
            >
                <span className={!value && placeholder ? "text-slate-500" : "text-slate-700"}>
                    {selectedLabel}
                </span>
                <FaFilter className={`text-xs transition-colors ${isOpen ? 'text-teal-500' : 'text-slate-400'}`} />
            </button>
            
            <div className={`absolute z-20 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.05)] py-2 transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'}`}>
                {options.map((option) => (
                    <div
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`px-4 py-2.5 cursor-pointer text-sm font-medium transition-colors duration-150 flex items-center justify-between
                            ${value === option.value ? 'bg-teal-50 text-teal-700' : 'text-slate-600 hover:bg-gray-50 hover:text-teal-600'}
                        `}
                    >
                        {option.label}
                        {value === option.value && (
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

const PetFilterBar = ({ filters, setFilters }) => {
    
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({ search: '', species: '', size: '', age: '', sort: 'newest' });
    };

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] mb-10">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
                
                {/* Search Input */}
                <div className="w-full lg:w-1/3 relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaSearch className="text-slate-400" />
                    </div>
                    <input 
                        type="text" 
                        name="search"
                        value={filters.search}
                        onChange={handleChange}
                        placeholder="Search by name or breed..." 
                        className="w-full bg-gray-50 border border-gray-200 text-slate-700 text-sm rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium"
                    />
                </div>

                {/* Custom Filters */}
                <div className="w-full lg:w-2/3 grid grid-cols-2 md:grid-cols-4 gap-3">
                    
                    <CustomSelect 
                        name="species"
                        value={filters.species}
                        onChange={handleChange}
                        placeholder="All Species"
                        options={[
                            { value: '', label: 'All Species' },
                            { value: 'Dog', label: 'Dogs' },
                            { value: 'Cat', label: 'Cats' },
                            { value: 'Other', label: 'Others' }
                        ]}
                    />

                    <CustomSelect 
                        name="size"
                        value={filters.size}
                        onChange={handleChange}
                        placeholder="All Sizes"
                        options={[
                            { value: '', label: 'All Sizes' },
                            { value: 'Small', label: 'Small' },
                            { value: 'Medium', label: 'Medium' },
                            { value: 'Large', label: 'Large' }
                        ]}
                    />

                    <CustomSelect 
                        name="sort"
                        value={filters.sort}
                        onChange={handleChange}
                        placeholder="Sort By"
                        options={[
                            { value: 'newest', label: 'Newest Arrivals' },
                            { value: 'oldest', label: 'Longest Waiting' }
                        ]}
                    />

                    <button 
                        onClick={clearFilters}
                        className="w-full bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold text-sm rounded-xl py-3 transition-colors flex items-center justify-center gap-2"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PetFilterBar;