import React from "react";
import { FaPaw, FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Navbar from "../components/navigation";
import Footer from "../components/footer";

const Login = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <main className="flex-grow flex flex-col items-center justify-center py-16 px-4 sm:px-6">
                <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2rem]">
                    
                    {/* Logo & Header */}
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-16 h-16 bg-[#e6fcf5] rounded-full flex items-center justify-center mb-6">
                            <FaPaw className="text-3xl text-teal-600" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Welcome Back!</h1>
                        <p className="text-slate-500">Log in to continue your journey with us.</p>
                    </div>

                    {/* Form */}
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">Email</label>
                            <input 
                                type="email" 
                                placeholder="name@example.com" 
                                className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-slate-800">Password</label>
                                <a href="/forgot-password" className="text-sm font-semibold text-teal-600 hover:text-teal-700">Forgot password?</a>
                            </div>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400 tracking-widest"
                            />
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                id="remember" 
                                className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                            />
                            <label htmlFor="remember" className="ml-2 text-sm text-slate-600 cursor-pointer">
                                Remember me
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button className="w-full bg-[#0d9488] hover:bg-teal-700 text-white font-bold py-4 rounded-full transition-colors shadow-md shadow-teal-900/10 mt-2">
                            Sign In
                        </button>
                    </form>

                    {/* Social Logins */}
                    <div className="mt-8 text-center text-sm text-slate-500 mb-6">Or continue with</div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button className="flex-1 flex items-center justify-center gap-2 border border-teal-600 text-teal-700 font-bold py-3 px-4 rounded-full hover:bg-teal-50 transition-colors">
                            <FcGoogle className="text-xl" /> Google
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-2 border border-teal-600 text-teal-700 font-bold py-3 px-4 rounded-full hover:bg-teal-50 transition-colors">
                            <FaFacebook className="text-xl text-[#1877F2]" /> Facebook
                        </button>
                    </div>

                    {/* Sign Up Link */}
                    <div className="mt-10 text-center text-sm text-slate-500">
                        Don't have an account? <a href="/signup" className="font-bold text-teal-600 hover:text-teal-700">Sign up</a>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}

export default Login;