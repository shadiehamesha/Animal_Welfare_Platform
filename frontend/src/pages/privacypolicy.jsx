import React, { useState, useRef, useEffect } from "react";
import { FiFileText, FiEye, FiShield, FiLock } from "react-icons/fi";
import Navbar from "../components/navigation";
import Footer from "../components/footer";

const PrivacyPolicy = () => {
    const [activeSection, setActiveSection] = useState("data-collection");

    // Section refs
    const sectionsRef = {
        "data-collection": useRef(null),
        "how-we-use": useRef(null),
        "cookies": useRef(null),
        "data-sharing": useRef(null),
        "your-rights": useRef(null),
    };

    const sidebarLinks = [
        { id: "data-collection", label: "Data Collection" },
        { id: "how-we-use", label: "How We Use Data" },
        { id: "cookies", label: "Cookies & Tracking" },
        { id: "data-sharing", label: "Data Sharing" },
        { id: "your-rights", label: "Your Rights" },
    ];

    // Smooth scroll handler
    const handleScrollToSection = (id) => {
        const section = sectionsRef[id].current;
        if (section) {
            const yOffset = -100; // offset for fixed navbar
            const y =
                section.getBoundingClientRect().top +
                window.pageYOffset +
                yOffset;

            window.scrollTo({ top: y, behavior: "smooth" });
            setActiveSection(id);
        }
    };

    // Detect active section on scroll
    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 150;

            Object.keys(sectionsRef).forEach((key) => {
                const section = sectionsRef[key].current;
                if (section) {
                    const offsetTop = section.offsetTop;
                    const offsetHeight = section.offsetHeight;

                    if (
                        scrollPosition >= offsetTop &&
                        scrollPosition < offsetTop + offsetHeight
                    ) {
                        setActiveSection(key);
                    }
                }
            });
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-[#f9fdfc] font-sans">
            <Navbar />

            <main className="flex-grow pt-16 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">

                    {/* Header */}
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-[2.5rem] font-bold text-[#111827] mb-3">
                            Privacy Policy
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Last updated: February 21, 2026
                        </p>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

                        {/* Sidebar - Hidden on small & medium */}
                        <aside className="hidden lg:block w-64 shrink-0 sticky top-24">
                            <nav className="flex flex-col gap-1">
                                {sidebarLinks.map((link) => (
                                    <button
                                        key={link.id}
                                        onClick={() => handleScrollToSection(link.id)}
                                        className={`text-left px-5 py-3 rounded-xl text-[14px] font-medium transition-colors ${
                                            activeSection === link.id
                                                ? "bg-[#eafff5] text-teal-700"
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        {link.label}
                                    </button>
                                ))}
                            </nav>
                        </aside>

                        {/* Content */}
                        <div className="flex-grow bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-50">

                            {/* Section 1 */}
                            <div ref={sectionsRef["data-collection"]} className="mb-12">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center text-xl shrink-0">
                                        <FiFileText />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        1. Information We Collect
                                    </h2>
                                </div>
                                <div className="text-slate-600 text-[15px] leading-relaxed pl-14">
                                    <p className="mb-4">
                                        We collect information you provide directly to us when you create an account, report a stray, or contact us.
                                    </p>
                                </div>
                            </div>

                            {/* Section 2 */}
                            <div ref={sectionsRef["how-we-use"]} className="mb-12">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center text-xl shrink-0">
                                        <FiEye />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        2. How We Use Your Information
                                    </h2>
                                </div>
                                <div className="text-slate-600 text-[15px] leading-relaxed pl-14">
                                    <p>
                                        We use the information we collect to provide, maintain, and improve our services.
                                    </p>
                                </div>
                            </div>

                            {/* Section 3 */}
                            <div ref={sectionsRef["cookies"]} className="mb-12">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center text-xl shrink-0">
                                        <FiShield />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        3. Cookies and Tracking
                                    </h2>
                                </div>
                                <div className="text-slate-600 text-[15px] leading-relaxed pl-14">
                                    <p>
                                        We use cookies and similar tracking technologies to track the activity on our service.
                                    </p>
                                </div>
                            </div>

                            {/* Section 4 */}
                            <div ref={sectionsRef["data-sharing"]} className="mb-12">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center text-xl shrink-0">
                                        <FiLock />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        4. Data Sharing
                                    </h2>
                                </div>
                                <div className="text-slate-600 text-[15px] leading-relaxed pl-14">
                                    <p>
                                        We do not sell your personal data.
                                    </p>
                                </div>
                            </div>

                            {/* Section 5 */}
                            <div ref={sectionsRef["your-rights"]}>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-500 flex items-center justify-center text-xl shrink-0">
                                        <FiShield />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900">
                                        5. Your Rights
                                    </h2>
                                </div>
                                <div className="text-slate-600 text-[15px] leading-relaxed pl-14">
                                    <p>
                                        You have the right to access, update, or delete your personal information.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;