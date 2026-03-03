import React from "react";
import { FaPaw } from "react-icons/fa";
import Navbar from "../../components/navigation";
import Footer from "../../components/footer";

const ForgotPassword = () => {
    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />
            
            <main className="flex-grow flex flex-col items-center justify-center py-16 px-4 sm:px-6">
                <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-[2rem]">
                    
                    <div className="flex flex-col items-center text-center mb-10">
                        <div className="w-16 h-16 bg-[#e6fcf5] rounded-full flex items-center justify-center mb-6">
                            <FaPaw className="text-3xl text-teal-600" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">Forgot Password?</h1>
                        <p className="text-slate-500 text-sm leading-relaxed px-2">
                            Enter your email address and we'll send you an OTP code to reset your password.
                        </p>
                    </div>

                    <form className="space-y-6" action="/reset-password">
                        <div>
                            <label className="block text-sm font-semibold text-slate-800 mb-2">Email</label>
                            <input 
                                type="email" 
                                placeholder="name@example.com" 
                                className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all placeholder:text-slate-400"
                                required
                            />
                        </div>

                        <button type="submit" className="w-full bg-[#0d9488] hover:bg-teal-700 text-white font-bold py-4 rounded-full transition-colors shadow-md shadow-teal-900/10">
                            Send OTP Code
                        </button>
                    </form>

                    <div className="mt-10 text-center text-sm text-slate-500">
                        Remembered your password? <a href="/login" className="font-bold text-teal-600 hover:text-teal-700">Back to log in</a>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}

export default ForgotPassword;