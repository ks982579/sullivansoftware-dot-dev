"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { educationData } from "@/lib/education";

const CoolSites = (): React.JSX.Element => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <main className="min-h-screen flex flex-col">
            {/* Hero Section */}
            <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-paper">
                {/* Subtle retro grid background */}
                <div className="absolute inset-0 opacity-[0.03]">
                    <div
                        className="w-full h-full"
                        style={{
                            backgroundImage: `
                linear-gradient(var(--primary) 1px, transparent 1px),
                linear-gradient(90deg, var(--primary) 1px, transparent 1px)
              `,
                            backgroundSize: "50px 50px",
                        }}
                    />
                </div>

                <div className="relative max-w-5xl mx-auto">
                    <div
                        className={`text-center mb-12 transition-all duration-700 ${isVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-4"
                            }`}
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary mb-4">
                            Cool Sites
                        </h1>
                        <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-6" />
                        <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
                            Github Repos and other Cools Sites!
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            {/* Adding Search one day */}
            <section className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto space-y-16">
                    <div
                        className={`transition-all duration-700 delay-300 ${isVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-8"
                            }`}
                    >
                        <h2 className="text-3xl font-bold text-text-primary mb-8 flex items-center gap-3">
                            Github Repos
                        </h2>
                        <div className="space-y-6">

                            {/* Todo: Make own component */}
                            <div className="p-6 bg-paper rounded-lg border-l-4 border-primary shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                                    <h3 className="text-xl font-bold text-text-primary">
                                        Kilimchoi | Engineering-Blogs
                                    </h3>
                                    <span className="text-sm text-text-secondary mt-1 sm:mt-0">
                                        Added: 29 April 2026
                                    </span>
                                </div>
                                <p className="text-primary font-semibold mb-2">
                                    <a href="https://github.com/kilimchoi/engineering-blogs" target="_blank">
                                        Kilimchoi / Engineering-Blogs
                                    </a>
                                </p>
                                <p className="text-text-secondary leading-relaxed">
                                    An expansive list of engineering blogs to keep you up to date on your Tech needs!
                                </p>
                            </div>

                            {/* Add more as needed */}
                        </div>
                    </div>

                    {/* Other Sites */}
                    <div
                        className={`transition-all duration-700 delay-400 ${isVisible
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-8"
                            }`}
                    >
                        <h2 className="text-3xl font-bold text-text-primary mb-8 flex items-center gap-3">
                            Other Sites
                        </h2>
                        <div className="space-y-6">

                            {/* Todo: Make own component */}
                            <div className="p-6 bg-paper rounded-lg border-l-4 border-primary shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                                    <h3 className="text-xl font-bold text-text-primary">
                                        FreeCodeCamp
                                    </h3>
                                    <span className="text-sm text-text-secondary mt-1 sm:mt-0">
                                        Added: 29 April 2026
                                    </span>
                                </div>
                                <p className="text-primary font-semibold mb-2">
                                    <a href="https://freecodecamp.org/" target="_blank">
                                        FreeCodeCamp
                                    </a>
                                </p>
                                <p className="text-text-secondary leading-relaxed">
                                    An amazing and free platform to learn to code!
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </section>
        </main>
    );
};

export default CoolSites;
