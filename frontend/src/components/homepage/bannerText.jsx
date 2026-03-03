import React from 'react';

const BannerText = () => {
  return (
    <section className="bg-[#f9fdfc] py-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
          Everything your furry friend needs
        </h2>
        
        {/* Subheading */}
        <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
          Access a comprehensive suite of tools and resources designed to help you
          care for animals better.
        </p>
      </div>
    </section>
  );
};

export default BannerText;