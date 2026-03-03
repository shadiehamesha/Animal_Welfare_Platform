import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Search = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Handle form submission and input validation
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Validation: Only navigate if the search is not empty or just spaces
    if (searchQuery.trim().length > 0) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Handle popular search clicks
  const handlePopularSearch = (term) => {
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <section className="bg-[#f9fdfc] py-12 px-4 sm:px-6 lg:px-8 font-sans pb-24">
      <div className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-50 px-6 py-16 md:py-20 text-center">
        
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-[#111827] mb-10 tracking-tight">
          Looking for something specific?
        </h2>
        
        {/* Search Form */}
        <form className="max-w-3xl mx-auto relative mb-8 flex flex-col sm:flex-row gap-4 sm:gap-0" onSubmit={handleSearch}>
          <div className="flex-grow flex items-center bg-white sm:rounded-l-full sm:rounded-r-none rounded-full border border-gray-200 sm:border-r-0 pl-6 pr-4 py-2 sm:py-0 h-14 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
            <input 
              type="text" 
              placeholder="Search for vets, medicines, or shelters..." 
              className="w-full bg-transparent text-slate-700 placeholder-slate-300 focus:outline-none text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            type="submit" 
            className="bg-[#0d9488] hover:bg-teal-700 text-white px-8 h-14 rounded-full sm:rounded-l-none font-semibold transition-colors shadow-sm whitespace-nowrap text-[15px]"
          >
            Search Now
          </button>
        </form>

        {/* Popular Searches */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 text-[14px] text-slate-500 font-medium">
          <span className="text-slate-400">Popular:</span>
          <button type="button" onClick={() => handlePopularSearch('Emergency Vet')} className="hover:text-teal-600 transition-colors cursor-pointer">Emergency Vet</button>
          <button type="button" onClick={() => handlePopularSearch('Cat Food')} className="hover:text-teal-600 transition-colors cursor-pointer">Cat Food</button>
          <button type="button" onClick={() => handlePopularSearch('Adoption Events')} className="hover:text-teal-600 transition-colors cursor-pointer">Adoption Events</button>
          <button type="button" onClick={() => handlePopularSearch('Dog Training')} className="hover:text-teal-600 transition-colors cursor-pointer">Dog Training</button>
        </div>

      </div>
    </section>
  );
};

export default Search;