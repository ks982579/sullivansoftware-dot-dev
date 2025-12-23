"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <main className="min-h-screen">
      {/* Hero Section - Japanese Retro */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
        {/* Retro Grid Background Pattern */}
        <div className="absolute inset-0 opacity-[0.08]">
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

        {/* Vintage Corner Accents with staggered fade-in */}
        <div className="absolute top-0 left-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 border-t-4 border-l-4 border-primary opacity-20 animate-[fadeIn_0.8s_ease-in_0.2s_both]" />
        <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 border-t-4 border-r-4 border-primary opacity-20 animate-[fadeIn_0.8s_ease-in_0.3s_both]" />
        <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 border-b-4 border-l-4 border-primary opacity-20 animate-[fadeIn_0.8s_ease-in_0.4s_both]" />
        <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 border-b-4 border-r-4 border-primary opacity-20 animate-[fadeIn_0.8s_ease-in_0.5s_both]" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Small retro label */}
          <div
            className={`inline-block mb-4 sm:mb-6 px-4 py-2 bg-primary/10 border border-primary/30 rounded transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 -translate-y-4"
            }`}
          >
            <span className="text-xs sm:text-sm font-semibold text-primary tracking-wider uppercase">
              Software Engineer
            </span>
          </div>

          {/* Name with retro styling */}
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 text-text-primary transition-all duration-700 delay-100 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <span className="inline-block transform hover:scale-105 transition-transform duration-300 hover:text-primary">
              Kevin
            </span>{" "}
            <span className="inline-block transform hover:scale-105 transition-transform duration-300 hover:text-primary">
              Sullivan
            </span>
          </h1>

          {/* Tagline */}
          <p
            className={`text-lg sm:text-xl md:text-2xl text-text-secondary mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4 transition-all duration-700 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            Building elegant solutions to complex problems.
            <br />
            <span className="text-base sm:text-lg">
              Full-stack developer by day, MSc student by night.
            </span>
          </p>

          {/* CTA Buttons with retro styling */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center items-center px-4 transition-all duration-700 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <Link
              href="/about"
              className="group w-full sm:w-auto px-8 py-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border-2 border-primary"
            >
              <span className="flex items-center justify-center gap-2">
                About Me
                <span className="group-hover:translate-x-1 transition-transform duration-300">
                  →
                </span>
              </span>
            </Link>
            <Link
              href="/projects"
              className="w-full sm:w-auto px-8 py-4 bg-background-paper text-primary font-semibold rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border-2 border-primary"
            >
              View Projects
            </Link>
          </div>

          {/* Tech Stack Pills */}
          <div
            className={`mt-12 sm:mt-16 flex flex-wrap gap-2 sm:gap-3 justify-center max-w-2xl mx-auto px-4 transition-all duration-700 delay-500 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            {[
              "React",
              "TypeScript",
              "Next.js",
              "C#",
              "Python",
              "Rust",
            ].map((tech, index) => (
              <span
                key={tech}
                className="px-3 sm:px-4 py-2 bg-secondary/10 text-secondary text-xs sm:text-sm font-medium rounded-full border border-secondary/20 hover:bg-secondary/20 hover:border-secondary/40 hover:scale-110 transition-all duration-300"
                style={{
                  animationDelay: `${0.6 + index * 0.1}s`,
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/30 rounded-full flex justify-center">
            <div className="w-1.5 h-3 bg-primary/50 rounded-full mt-2 animate-pulse" />
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-paper">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Projects Card */}
            <Link
              href="/projects"
              className="group p-6 sm:p-8 bg-background rounded-lg border-2 border-primary/20 hover:border-primary/50 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] flex flex-col"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <span className="text-2xl">💻</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3">
                Projects
              </h3>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-4 flex-grow">
                Explore my latest work and side projects. From web apps to
                system tools.
              </p>
              <span className="text-primary font-semibold group-hover:translate-x-2 inline-block transition-transform duration-300">
                View all →
              </span>
            </Link>

            {/* Blog Card */}
            <Link
              href="/blogs"
              className="group p-6 sm:p-8 bg-background rounded-lg border-2 border-secondary/20 hover:border-secondary/50 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] flex flex-col"
            >
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary/20 group-hover:scale-110 transition-all duration-300">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3">
                Blog
              </h3>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-4 flex-grow">
                Thoughts on software engineering, learning, and technology.
              </p>
              <span className="text-secondary font-semibold group-hover:translate-x-2 inline-block transition-transform duration-300">
                Read posts →
              </span>
            </Link>

            {/* Notes Card */}
            <Link
              href="/notes"
              className="group p-6 sm:p-8 bg-background rounded-lg border-2 border-accent-blue/20 hover:border-accent-blue/50 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] flex flex-col"
            >
              <div className="w-12 h-12 bg-accent-blue/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent-blue/20 group-hover:scale-110 transition-all duration-300">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3">
                Notes
              </h3>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-4 flex-grow">
                Master&apos;s programme notes, study materials, and lecture summaries.
              </p>
              <span className="text-accent-blue font-semibold group-hover:translate-x-2 inline-block transition-transform duration-300">
                Browse notes →
              </span>
            </Link>

            {/* About Card */}
            <Link
              href="/about"
              className="group p-6 sm:p-8 bg-background rounded-lg border-2 border-accent-orange/20 hover:border-accent-orange/50 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] flex flex-col"
            >
              <div className="w-12 h-12 bg-accent-orange/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent-orange/20 group-hover:scale-110 transition-all duration-300">
                <span className="text-2xl">👨‍💻</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-text-primary mb-3">
                About
              </h3>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed mb-4 flex-grow">
                Learn more about my background, skills, and what drives me.
              </p>
              <span className="text-accent-orange font-semibold group-hover:translate-x-2 inline-block transition-transform duration-300">
                Learn more →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Current Focus Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Currently
            </h2>
            <div className="w-16 sm:w-20 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="p-5 sm:p-6 bg-paper rounded-lg border-l-4 border-primary hover:shadow-md hover:translate-x-1 transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
                🏢 Software Engineer at Rithum
              </h3>
              <p className="text-sm sm:text-base text-text-secondary">
                Building e-commerce solutions with React, TypeScript, and C#
              </p>
            </div>

            <div className="p-5 sm:p-6 bg-paper rounded-lg border-l-4 border-secondary hover:shadow-md hover:translate-x-1 transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
                🎓 MSc Computer Science Student
              </h3>
              <p className="text-sm sm:text-base text-text-secondary">
                International University of Applied Sciences (since Jan 2023)
              </p>
            </div>

            <div className="p-5 sm:p-6 bg-paper rounded-lg border-l-4 border-accent-orange hover:shadow-md hover:translate-x-1 transition-all duration-300">
              <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
                🦀 Exploring Rust
              </h3>
              <p className="text-sm sm:text-base text-text-secondary">
                Diving deep into systems programming and performance
                optimization
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
