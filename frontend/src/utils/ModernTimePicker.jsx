import React, { useState, useEffect, useRef } from 'react';

const ModernTimePicker = ({ value, onChange, name }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const [mode, setMode] = useState('hours');

    // Parse the 24-hour value into HR, MIN, AM/PM
    const parseTime = (val) => {
        if (!val) return { hr: '12', min: '00', period: 'AM' };
        const [h, m] = val.split(':');
        let hourNum = parseInt(h, 10) || 12;
        const isPm = hourNum >= 12;
        if (hourNum === 0) hourNum = 12;
        if (hourNum > 12) hourNum -= 12;
        return {
            hr: hourNum.toString().padStart(2, '0'),
            min: (m || '00').padStart(2, '0'),
            period: isPm ? 'PM' : 'AM'
        };
    };

    const timeObj = parseTime(value);
    const [inputValue, setInputValue] = useState(`${timeObj.hr}:${timeObj.min} ${timeObj.period}`);

    // Sync input value when popover closes to auto-format whatever was typed
    useEffect(() => {
        if (!isOpen) {
            setInputValue(`${timeObj.hr}:${timeObj.min} ${timeObj.period}`);
        }
    }, [isOpen, timeObj.hr, timeObj.min, timeObj.period]);

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

    // Helper to format back to 24-hour format and update parent state
    const updateParent = (newHr, newMin, newPeriod) => {
        let h = parseInt(newHr, 10);
        if (newPeriod === 'PM' && h !== 12) h += 12;
        if (newPeriod === 'AM' && h === 12) h = 0;
        const formattedTime = `${h.toString().padStart(2, '0')}:${newMin}`;
        onChange({ target: { name, value: formattedTime } });
    };

    // Handle manual typing
    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);

        // Regex matches valid times: "9:30", "09:30", "9:30 AM", "14:30", "2:15 pm"
        const match = val.match(/^\s*([01]?[0-9]|2[0-3])\s*[:.]\s*([0-5][0-9])\s*(AM|PM|am|pm)?\s*$/);
        if (match) {
            let h = parseInt(match[1], 10);
            const m = match[2];
            const p = match[3] ? match[3].toUpperCase() : null;

            let h24 = h;
            if (p === 'PM' && h < 12) h24 += 12;
            if (p === 'AM' && h === 12) h24 = 0;

            const formattedTime = `${h24.toString().padStart(2, '0')}:${m.padStart(2, '0')}`;
            onChange({ target: { name, value: formattedTime } });
        }
    };

    const handleHrClick = (h) => {
        updateParent(h, timeObj.min, timeObj.period);
        setInputValue(`${h}:${timeObj.min} ${timeObj.period}`);
        setMode('minutes'); // Auto switch to minutes view
    };

    const handleMinClick = (m) => {
        updateParent(timeObj.hr, m, timeObj.period);
        setInputValue(`${timeObj.hr}:${m} ${timeObj.period}`);
        setIsOpen(false); // Auto close after selecting minutes
    };

    const handlePeriodClick = (p) => {
        updateParent(timeObj.hr, timeObj.min, p);
        setInputValue(`${timeObj.hr}:${timeObj.min} ${p}`);
    };

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
    // Generate minutes in 5-minute intervals for better UX
    const minutes = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Input Trigger */}
            <div className={`w-full px-4 py-2 bg-gray-50 border ${isOpen ? 'border-teal-500 ring-2 ring-teal-500 ring-opacity-20 bg-white' : 'border-gray-200'} rounded-xl focus-within:bg-white focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-opacity-20 transition-all duration-200 text-sm font-medium flex items-center justify-between text-slate-700 shadow-sm`}>
                <div className="flex items-center gap-2 flex-1">
                    <svg className="w-4 h-4 text-teal-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <input 
                        type="text"
                        value={inputValue}
                        onChange={handleInputChange}
                        onFocus={() => setIsOpen(true)}
                        className="bg-transparent focus:outline-none w-full font-semibold text-slate-700 placeholder-slate-400 py-0.5"
                        placeholder="hh:mm AM/PM"
                    />
                </div>
                <button type="button" onClick={() => setIsOpen(!isOpen)} className="focus:outline-none p-1 text-slate-400 hover:text-teal-600 transition-colors">
                    <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Custom Interactive Popover Panel */}
            <div className={`absolute z-[60] w-[280px] mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl p-4 left-0 sm:right-0 transition-all duration-200 origin-top ${isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'}`}>
                
                {/* Popover Header / Active Selection */}
                <div className="flex justify-between items-center mb-4 bg-gray-50 p-1.5 rounded-xl border border-gray-200">
                    <div className="flex space-x-1">
                        <button
                            type="button"
                            onClick={() => setMode('hours')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${mode === 'hours' ? 'bg-white text-teal-700 shadow-sm border border-gray-200' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            {timeObj.hr}
                        </button>
                        <span className="flex items-center text-slate-400 font-bold">:</span>
                        <button
                            type="button"
                            onClick={() => setMode('minutes')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${mode === 'minutes' ? 'bg-white text-teal-700 shadow-sm border border-gray-200' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            {timeObj.min}
                        </button>
                    </div>
                    <div className="flex space-x-1 border-l border-gray-300 pl-2">
                        <button
                            type="button"
                            onClick={() => handlePeriodClick('AM')}
                            className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${timeObj.period === 'AM' ? 'bg-teal-100 text-teal-800' : 'text-slate-500 hover:bg-gray-200'}`}
                        >
                            AM
                        </button>
                        <button
                            type="button"
                            onClick={() => handlePeriodClick('PM')}
                            className={`px-2 py-1.5 rounded-lg text-xs font-bold transition-colors ${timeObj.period === 'PM' ? 'bg-teal-100 text-teal-800' : 'text-slate-500 hover:bg-gray-200'}`}
                        >
                            PM
                        </button>
                    </div>
                </div>

                {/* Grid Buttons */}
                <div className="grid grid-cols-4 gap-2">
                    {mode === 'hours' && hours.map(h => (
                        <button
                            key={`h-${h}`}
                            type="button"
                            onClick={() => handleHrClick(h)}
                            className={`py-2 rounded-xl text-sm font-semibold transition-all ${timeObj.hr === h ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-50 border border-gray-100 text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200'}`}
                        >
                            {h}
                        </button>
                    ))}
                    {mode === 'minutes' && minutes.map(m => (
                        <button
                            key={`m-${m}`}
                            type="button"
                            onClick={() => handleMinClick(m)}
                            className={`py-2 rounded-xl text-sm font-semibold transition-all ${timeObj.min === m ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-50 border border-gray-100 text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200'}`}
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModernTimePicker;