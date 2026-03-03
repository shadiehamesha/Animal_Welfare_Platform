import React from "react";
import Navbar from "../components/navigation";
import Footer from "../components/footer";
import Hero from "../components/homepage/hero";
import BannerText from "../components/homepage/bannerText";
import Services from "../components/homepage/services";
import Search from "../components/homepage/search";

const Homepage = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <BannerText />
            <Services />
            <Search />
            <Footer />
        </>
    );
}

export default Homepage;