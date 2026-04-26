import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    maxWidth = 'max-w-2xl',
    hideCloseButton = false
}) => {
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

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={handleBackdropClick}
        >
            <div 
                ref={modalRef}
                className={`bg-white w-full ${maxWidth} max-h-[90vh] rounded-[2rem] shadow-2xl flex flex-col transform transition-all animate-fade-in-up`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-[2rem] shrink-0">
                    <h2 id="modal-title" className="text-2xl font-bold text-slate-900 tracking-tight">
                        {title}
                    </h2>
                    {!hideCloseButton && (
                        <button 
                            onClick={onClose} 
                            className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-gray-50 hover:text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 shrink-0"
                            aria-label="Close modal"
                        >
                            <FaTimes />
                        </button>
                    )}
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-grow">
                    {children}
                </div>
            </div>

            {/* Inline CSS for the entry animation and scrollbar */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.98); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}} />
        </div>
    );
};

export default Modal;