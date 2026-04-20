import React, { useState, useEffect, useRef } from 'react';

// Custom Dropdown Component matching the admin dashboard UI
const CustomDropdown = ({ value, options, onChange, triggerClassName, dropdownAlign = 'right' }) => {
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

    const selectedLabel = options.find(opt => opt.value === value)?.label || value;

    return (
        <div className="relative shrink-0 w-full sm:w-auto" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between gap-3 focus:outline-none transition-all duration-200 ${triggerClassName} ${isOpen ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-gray-200'}`}
            >
                <span>{selectedLabel}</span>
                <svg 
                    className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Dropdown Menu */}
            <div 
                className={`absolute z-20 ${dropdownAlign === 'right' ? 'right-0' : 'left-0'} mt-2 w-full sm:min-w-[12rem] bg-white border border-gray-100 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.05)] py-2 transition-all duration-200 origin-top ${
                    isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'
                }`}
            >
                {options.map((option) => (
                    <div
                        key={option.value}
                        onClick={() => {
                            onChange(option.value);
                            setIsOpen(false);
                        }}
                        className={`px-5 py-2.5 cursor-pointer text-sm transition-colors duration-150 flex items-center justify-between
                            ${value === option.value 
                                ? 'bg-teal-50/50 text-teal-700 font-bold' 
                                : 'text-slate-600 hover:bg-gray-50 hover:text-teal-600 font-medium'
                            }
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

const UserContactWidget = () => {
    const [messages, setMessages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        const fetchMyMessages = async () => {
            const token = localStorage.getItem('token');
            if(token) {
                try {
                    const res = await fetch('http://localhost:5000/api/contacts/my-messages', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setMessages(data);
                    }
                } catch (error) { console.error(error); }
            }
        };
        fetchMyMessages();
    }, []);

    const filterOptions = [
        { value: 'all', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'reviewed', label: 'Reviewed' },
        { value: 'resolved', label: 'Resolved' }
    ];

    const recentMessages = messages.slice(0, 3);
    const filteredMessages = messages.filter(msg => 
        filterStatus === 'all' ? true : msg.status === filterStatus
    );

    return (
        <>
            {/* Dashboard Widget */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 max-w-md w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Contact Support</h2>
                    {messages.length > 0 && (
                        <button onClick={() => setIsModalOpen(true)} className="text-teal-600 text-sm font-semibold hover:text-teal-700">
                            View All →
                        </button>
                    )}
                </div>

                {recentMessages.length > 0 ? (
                    <div className="space-y-4">
                        {recentMessages.map(msg => (
                            <div key={msg._id} className="flex justify-between items-center p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                                <span className="text-sm font-medium text-slate-600">
                                    {new Date(msg.createdAt).toLocaleDateString()}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize shrink-0 ${
                                    msg.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                    msg.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                                    'bg-green-100 text-green-700'
                                }`}>
                                    {msg.status}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-slate-500 text-sm mb-4">You haven't sent any messages.</p>
                        <a href="/contact" className="text-teal-600 text-sm font-semibold hover:underline">Contact Us</a>
                    </div>
                )}
            </div>

            {/* View All Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-8 max-w-2xl w-full shadow-xl max-h-[80vh] flex flex-col">
                        
                        {/* Header & Controls */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 shrink-0 gap-4">
                            <h2 className="text-2xl font-bold text-slate-900">Message History</h2>
                            
                            <div className="flex items-center gap-3 w-full sm:w-auto z-20">
                                <CustomDropdown 
                                    value={filterStatus}
                                    options={filterOptions}
                                    onChange={(val) => setFilterStatus(val)}
                                    triggerClassName="w-full sm:w-40 bg-gray-50 border text-slate-700 rounded-xl px-4 py-2 font-medium hover:border-teal-400 text-sm"
                                    dropdownAlign="right"
                                />
                                <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 shrink-0 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-slate-600 font-bold transition-colors">
                                    ✕
                                </button>
                            </div>
                        </div>
                        
                        {/* Filtered Messages List */}
                        <div className="overflow-y-auto pr-2 space-y-4 flex-1">
                            {filteredMessages.length > 0 ? (
                                filteredMessages.map(msg => (
                                    <div key={msg._id} className="p-5 border border-gray-100 bg-gray-50/30 rounded-2xl">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-slate-900 text-lg">{msg.subject}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize shrink-0 ${
                                                msg.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                                msg.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                                {msg.status}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 text-sm mb-3 whitespace-pre-wrap">{msg.message}</p>
                                        <p className="text-xs text-slate-400 font-medium">Sent on {new Date(msg.createdAt).toLocaleDateString()}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-gray-100">
                                    <p className="text-slate-500 font-medium">No messages found for this status.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserContactWidget;