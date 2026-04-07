import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaEnvelope, FaMapMarkerAlt, FaPaw } from "react-icons/fa";
import Navbar from "../components/navigation";
import Footer from "../components/footer";

const ContactUs = () => {
    const [formData, setFormData] = useState({ subject: '', message: '' });
    const [status, setStatus] = useState({ loading: false, error: null, success: false });
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) setIsLoggedIn(true);
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear errors when typing
        if (status.error) setStatus({ ...status, error: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Client-side validation
        if (formData.subject.trim().length < 3) {
            return setStatus({ ...status, error: "Subject must be at least 3 characters long." });
        }
        if (formData.message.trim().length < 10) {
            return setStatus({ ...status, error: "Please provide a little more detail in your message (min 10 characters)." });
        }

        setStatus({ loading: true, error: null, success: false });

        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:5000/api/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Failed to send message. Please try again.');
            }

            setStatus({ loading: false, error: null, success: true });
            setFormData({ subject: '', message: '' }); // Reset form
            
        } catch (error) {
            setStatus({ loading: false, error: error.message, success: false });
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <main className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    
                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="w-16 h-16 bg-[#e6fcf5] rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaPaw className="text-3xl text-teal-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
                            Get in Touch
                        </h1>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
                            Have questions about our platform, need support, or want to partner with us? We'd love to hear from you.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
                        
                        {/* Contact Information Cards (Left Side) */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-start gap-5">
                                <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center text-xl shrink-0">
                                    <FaEnvelope />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">Email Us</h3>
                                    <p className="text-slate-500 text-sm mb-2">Our friendly team is here to help.</p>
                                    <a href="mailto:hello@meowoof.com" className="text-teal-600 font-semibold hover:text-teal-700 transition">hello@meowoof.com</a>
                                </div>
                            </div>

                            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-start gap-5">
                                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center text-xl shrink-0">
                                    <FaMapMarkerAlt />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-1">Headquarters</h3>
                                    <p className="text-slate-500 text-sm mb-2">Come say hello at our main office.</p>
                                    <p className="text-slate-700 font-medium">123 Pet Lover Lane<br/>Homagama, Sri Lanka</p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form (Right Side) */}
                        <div className="lg:col-span-3 bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50">
                            
                            {!isLoggedIn ? (
                                /* Auth required state */
                                <div className="text-center py-10">
                                    <div className="text-5xl mb-4">🔒</div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Login Required</h3>
                                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                        To help us better track inquiries and prevent spam, please log in to your account to send a message.
                                    </p>
                                    <div className="flex justify-center gap-4">
                                        <Link to="/login" className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3.5 rounded-full font-semibold transition-colors shadow-md">
                                            Log In Now
                                        </Link>
                                        <Link to="/signup" className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-3.5 rounded-full font-semibold transition-colors">
                                            Sign Up
                                        </Link>
                                    </div>
                                </div>
                            ) : status.success ? (
                                /* Success state */
                                <div className="text-center py-10">
                                    <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Message Sent!</h3>
                                    <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                        Thank you for reaching out. Our support team will review your message and get back to you shortly.
                                    </p>
                                    <button 
                                        onClick={() => setStatus({ ...status, success: false })}
                                        className="bg-slate-900 hover:bg-black text-white px-8 py-3.5 rounded-full font-semibold transition-colors shadow-md"
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                /* Form */
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {status.error && (
                                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm font-medium">
                                            {status.error}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-semibold text-slate-800 mb-2">Subject</label>
                                        <input 
                                            type="text" 
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            maxLength="150"
                                            placeholder="What is this regarding?" 
                                            className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 text-slate-800"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-semibold text-slate-800">Message</label>
                                            <span className="text-xs text-slate-400 font-medium">{formData.message.length}/1000</span>
                                        </div>
                                        <textarea 
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            maxLength="1000"
                                            rows="5"
                                            placeholder="How can we help you today?" 
                                            className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 text-slate-800 resize-none"
                                            required
                                        ></textarea>
                                    </div>

                                    <button 
                                        type="submit" 
                                        disabled={status.loading}
                                        className={`w-full bg-[#0d9488] hover:bg-teal-700 text-white font-bold py-4 rounded-full transition-colors shadow-md shadow-teal-900/10 mt-2 ${status.loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {status.loading ? 'Sending...' : 'Send Message'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default ContactUs;