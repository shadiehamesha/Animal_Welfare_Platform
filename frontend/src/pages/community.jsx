import React from "react";
import Navbar from "../components/navigation";
import Footer from "../components/footer";

const Community = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            
            <main className="flex-grow flex flex-col items-center justify-center bg-[#f9fdfc] py-20 px-4 text-center">
               <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                   Connect with like minded people
               </h1>
               <p className="text-slate-500 text-lg max-w-2xl">
                   This page is currently under construction. Check back soon!
               </p>
            </main>

            <Footer />
        </div>
    );
}

export default Community;