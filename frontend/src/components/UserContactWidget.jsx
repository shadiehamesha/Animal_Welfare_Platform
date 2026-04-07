import React, { useState, useEffect } from 'react';

const UserContactWidget = () => {
    const [messages, setMessages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const recentMessages = messages.slice(0, 3);

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
                        <div className="flex justify-between items-center mb-6 shrink-0">
                            <h2 className="text-2xl font-bold text-slate-900">Message History</h2>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-slate-600 font-bold">
                                ✕
                            </button>
                        </div>
                        
                        <div className="overflow-y-auto pr-2 space-y-4 flex-1">
                            {messages.map(msg => (
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
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UserContactWidget;