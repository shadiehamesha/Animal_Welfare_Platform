import React, { useEffect, useRef } from 'react';
import { FaTimes, FaUser, FaEnvelope, FaUsers } from 'react-icons/fa';

const EventAttendeesModal = ({ isOpen, onClose, event }) => {
    const modalRef = useRef(null);

    // Close on Escape key press
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Prevent body scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // Handle click outside to close
    const handleBackdropClick = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
            onClose();
        }
    };

    if (!isOpen || !event) return null;

    const attendeesCount = event.registeredAttendees?.length || 0;
    const isFull = attendeesCount >= event.capacity;
    const fillPercentage = Math.min((attendeesCount / event.capacity) * 100, 100);

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={handleBackdropClick}
        >
            <div 
                ref={modalRef}
                className="bg-white w-full max-w-lg max-h-[85vh] rounded-[2rem] shadow-2xl flex flex-col transform transition-all animate-fade-in-up"
            >
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 rounded-t-[2rem] shrink-0">
                    <div className="pr-4">
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight mb-1">
                            {event.title}
                        </h2>
                        <p className="text-sm font-medium text-teal-600">Attendee List</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-gray-50 hover:text-slate-800 transition-colors shrink-0 shadow-sm"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Event Capacity Progress */}
                <div className="px-8 py-5 border-b border-gray-50 shrink-0">
                    <div className="flex justify-between items-end mb-2">
                        <div className="flex items-center gap-2">
                            <FaUsers className="text-slate-400" />
                            <span className="text-sm font-bold text-slate-700">Capacity Tracker</span>
                        </div>
                        <span className={`text-sm font-bold ${isFull ? 'text-red-500' : 'text-teal-600'}`}>
                            {attendeesCount} / {event.capacity}
                        </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                        <div 
                            className={`h-2.5 rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-teal-500'}`}
                            style={{ width: `${fillPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-grow bg-slate-50/30">
                    {attendeesCount > 0 ? (
                        <div className="space-y-3">
                            {event.registeredAttendees.map((user, index) => (
                                <div key={user._id || index} className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:border-teal-100 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg border border-teal-100 shrink-0">
                                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-bold text-slate-900 truncate">{user.name || 'Anonymous User'}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                                            <FaEnvelope className="shrink-0" />
                                            <span className="truncate">{user.email || 'No email provided'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
                            <span className="text-4xl text-slate-300 mb-3 block">📭</span>
                            <h4 className="text-slate-700 font-bold mb-1">No Attendees Yet</h4>
                            <p className="text-sm text-slate-500">Wait for users to register for this event.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Inline CSS for animation and scrollbar */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}} />
        </div>
    );
};

export default EventAttendeesModal;