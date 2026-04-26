import React, { useState, useEffect, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';

const ModernDatePicker = ({ value, onChange, name }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());

    // Close popover when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sync with external value changes
    useEffect(() => {
        if (value) setCurrentDate(new Date(value));
    }, [value]);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day) => {
        const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        // Format to YYYY-MM-DD to act like a standard date input
        const formattedDate = selectedDate.toISOString().split('T')[0];
        
        onChange({ target: { name, value: formattedDate } });
        setIsOpen(false);
    };

    const getDisplayValue = () => {
        if (!value) return '';
        const d = new Date(value);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const isSelected = (day) => {
        if (!value) return false;
        const valDate = new Date(value);
        return valDate.getDate() === day && 
               valDate.getMonth() === currentDate.getMonth() && 
               valDate.getFullYear() === currentDate.getFullYear();
    };

    const isToday = (day) => {
        const today = new Date();
        return today.getDate() === day && 
               today.getMonth() === currentDate.getMonth() && 
               today.getFullYear() === currentDate.getFullYear();
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Input Trigger */}
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-2 bg-gray-50 border cursor-pointer ${isOpen ? 'border-teal-500 ring-2 ring-teal-500 ring-opacity-20 bg-white' : 'border-gray-200'} rounded-xl transition-all duration-200 text-sm font-medium flex items-center justify-between text-slate-700 shadow-sm`}
            >
                <div className="flex items-center gap-3 flex-1">
                    <FaCalendarAlt className="text-teal-600 flex-shrink-0" />
                    <span className={value ? "text-slate-800 font-semibold" : "text-slate-400 font-semibold"}>
                        {getDisplayValue() || 'Select Date'}
                    </span>
                </div>
                <button type="button" className="focus:outline-none p-1 text-slate-400 hover:text-teal-600 transition-colors">
                    <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Popover Calendar */}
            <div className={`absolute z-[60] w-[280px] mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 left-0 sm:right-0 transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'}`}>
                
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <button type="button" onClick={handlePrevMonth} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                        <FaChevronLeft className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-slate-800 text-sm">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </span>
                    <button type="button" onClick={handleNextMonth} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                        <FaChevronRight className="w-3 h-3" />
                    </button>
                </div>

                {/* Days Header */}
                <div className="grid grid-cols-7 mb-2">
                    {dayNames.map(day => (
                        <div key={day} className="text-center text-xs font-bold text-slate-400">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-y-1">
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="h-8"></div>
                    ))}
                    {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const selected = isSelected(day);
                        const today = isToday(day);

                        return (
                            <button
                                key={day}
                                type="button"
                                onClick={() => handleDateSelect(day)}
                                className={`h-8 w-8 mx-auto rounded-full text-sm font-semibold flex items-center justify-center transition-colors
                                    ${selected ? 'bg-teal-600 text-white shadow-md' : 
                                      today ? 'bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100' : 
                                      'text-slate-700 hover:bg-gray-100'
                                    }
                                `}
                            >
                                {day}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ModernDatePicker;