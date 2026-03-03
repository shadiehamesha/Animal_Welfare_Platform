import React from "react";
import Navbar from "../components/navigation";
import Footer from "../components/footer";
import AboutHero from "../components/about/hero";
import VisionMission from "../components/about/visionandmission";
import AboutValues from "../components/about/values";
import AboutStats from "../components/about/stats";
import AboutHistory from "../components/about/history"
import AboutTeam from "../components/about/team";
import AboutGoals from "../components/about/goals";
import AboutCTA from "../components/about/cta";

const About = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <AboutHero />
            <VisionMission />
            <AboutValues />
            <AboutStats />
            <AboutHistory />
            <AboutTeam />
            <AboutGoals />
            <AboutCTA />
            <Footer />
        </div>
    );
}

export default About;