import React from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/navigation";
import Footer from "../components/footer";

const Search = () => {
    // Extract the 'q' parameter from the URL
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            
            <main className="flex-grow flex flex-col items-center justify-center bg-[#f9fdfc] py-20 px-4 text-center">
               <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">
                   Search Results
               </h1>
               
               <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 max-w-2xl w-full">
                   {query ? (
                       <p className="text-slate-600 text-xl">
                           Your search is: <span className="font-bold text-teal-600">"{query}"</span>
                       </p>
                   ) : (
                       <p className="text-slate-500 text-lg">
                           Please enter a search term to see results.
                       </p>
                   )}
               </div>
            </main>

            <Footer />
        </div>
    );
}

export default Search;