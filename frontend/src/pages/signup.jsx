import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/navigation.jsx';
import Footer from '../components/footer.jsx';

// Custom Dropdown Component
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
        // Mock a standard event object to keep the existing handleChange logic working
        onChange({ target: { name, value: optionValue } });
        setIsOpen(false);
    };

    const selectedLabel = options.find(opt => opt.value === value)?.label || 'Select an option';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-5 py-3.5 bg-gray-50 border ${isOpen ? 'border-teal-500 ring-2 ring-teal-500 ring-opacity-20' : 'border-gray-200'} rounded-2xl focus:outline-none transition-all duration-200 text-slate-800 font-medium flex justify-between items-center`}
            >
                <span>{selectedLabel}</span>
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
                className={`absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.05)] py-2 transition-all duration-200 origin-top ${
                    isOpen ? 'opacity-100 scale-y-100 visible' : 'opacity-0 scale-y-95 invisible'
                }`}
            >
                {options.map((option) => (
                    <div
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`px-5 py-3 cursor-pointer text-sm font-medium transition-colors duration-150 flex items-center justify-between
                            ${value === option.value 
                                ? 'bg-teal-50/50 text-teal-700' 
                                : 'text-slate-600 hover:bg-gray-50 hover:text-teal-600'
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

const SignUp = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'normal user' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const roleOptions = [
        { value: 'normal user', label: 'Normal User' },
        { value: 'organizations/shelters', label: 'Organization/Shelter' },
        { value: 'pharmacies', label: 'Pharmacy' },
        { value: 'hospitals/veterinarians', label: 'Hospital/Veterinarian' }
    ];

    // Helper function to handle role-based routing
    const redirectBasedOnRole = (role) => {
        switch (role) {
            case 'system admin': navigate('/dashboard/admin'); break;
            case 'organizations/shelters': navigate('/dashboard/organization'); break;
            case 'pharmacies': navigate('/dashboard/pharmacy'); break;
            case 'hospitals/veterinarians': navigate('/dashboard/hospital'); break;
            default: navigate('/dashboard/user'); break;
        }
    };

    // Auto-redirect if already logged in
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        if (token && role) {
            redirectBasedOnRole(role);
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            // 1. Register the user
            const regRes = await fetch('http://localhost:5000/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const regData = await regRes.json();

            if (!regRes.ok) {
                throw new Error(regData.message || 'Registration failed. Please try again.');
            }

            // 2. Automatically log them in after successful registration
            const loginRes = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: formData.email, password: formData.password }),
            });

            const loginData = await loginRes.json();

            if (!loginRes.ok) {
                // If auto-login fails, redirect them to standard login page
                navigate('/login');
                return;
            }

            // Save auth details and redirect
            localStorage.setItem('token', loginData.token);
            localStorage.setItem('role', loginData.role);
            redirectBasedOnRole(loginData.role);

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <div className="flex flex-1 items-center justify-center p-4 my-10">
                <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50">
                    <div className="text-center mb-8">
                        <span className="text-4xl text-teal-600">🐾</span>
                        <h2 className="text-3xl font-bold mt-4 text-slate-900">Create Account</h2>
                        <p className="text-slate-500 mt-2">Join our community of animal lovers.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-2xl text-sm text-center mb-6 font-medium">
                            {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-slate-800">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition text-slate-800"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-slate-800">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@example.com"
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition text-slate-800"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-slate-800">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="••••••••"
                                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500 transition text-slate-800"
                                required
                            />
                        </div>
                        
                        {/* Replaced Native Select with Custom Select */}
                        <div>
                            <label className="block text-sm font-semibold mb-2 text-slate-800">Account Type</label>
                            <CustomSelect 
                                name="role"
                                value={formData.role}
                                options={roleOptions}
                                onChange={handleChange}
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className={`w-full bg-teal-600 text-white py-4 rounded-full font-semibold transition duration-200 shadow-md ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-teal-700 hover:shadow-lg'}`}
                        >
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-500 font-medium">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row gap-4">
                            <button type="button" className="w-full flex justify-center items-center py-3.5 px-4 border border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition duration-200 font-semibold text-slate-700 shadow-sm">
                                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                Google
                            </button>
                            <button type="button" className="w-full flex justify-center items-center py-3.5 px-4 border border-gray-200 rounded-2xl hover:bg-[#1877F2]/5 hover:border-[#1877F2]/30 transition duration-200 font-semibold text-slate-700 shadow-sm">
                                <svg className="w-5 h-5 mr-3 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                </svg>
                                Facebook
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-600 font-medium">
                            Already have an account? <Link to="/login" className="text-teal-600 font-bold hover:text-teal-700 transition">Login</Link>
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default SignUp;