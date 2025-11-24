"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { educationData } from "@/lib/education";

const AboutPage = (): React.JSX.Element => {
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
            className={`text-center mb-12 transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary mb-4">
              About Me
            </h1>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-6" />
            <p className="text-lg sm:text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Software engineer, lifelong learner, and problem solver.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Introduction with Image */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div
              className={`space-y-4 transition-all duration-700 delay-200 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-8"
              }`}
            >
              <h2 className="text-3xl font-bold text-text-primary">
                Hello, I&apos;m Kevin
              </h2>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
                {/*Your introduction paragraph here - tell your story, what drives
                you, your passion for software engineering, etc.*/}
                A software engineer with full-stack experience working with
                TypeScript and React, and C# .NET and .NET Framework, and Python
                Django. I have a passion for building scalable and performant
                solutions to challenging problems. I also have a passion for
                writing code in Rust 🦀.
              </p>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
                {/*Second paragraph - your journey into tech, key experiences,
                what you love about building software, etc...*/}
                Starting in the field of Actuarial Science (and Economics),
                I&apos;ve always loved math, science and technology (and
                coffee)! I got my start in Software engineering working
                full-stack with Python Django and React. I then moved on to
                working as an automation test engineer for a bit before
                transitioning to a developing cybersecurity software in C++ and
                Objective-C. Now I&apos;m back into a full-stack role with a global
                ecommerce platform building solutions in TypeScript React and
                C#.
              </p>
            </div>
            <div
              className={`transition-all duration-700 delay-100 ${
                isVisible
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 -translate-x-8"
              }`}
            >
              <div className="relative aspect-square rounded-lg overflow-hidden border-4 border-primary/20 shadow-lg hover:border-primary/40 transition-all duration-300 hover:scale-105">
                {/* Placeholder for profile image */}
                <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                  <Image
                    alt="Image of Software Engineer Kevin Sullivan"
                    src="/images/selfie-coffee-002.png"
                    width={600}
                    height={600}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Journey */}
          <div
            className={`transition-all duration-700 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl font-bold text-text-primary mb-8 flex items-center gap-3">
              <span className="text-2xl">🚀</span>
              Professional Journey
            </h2>
            <div className="space-y-6">
              {/* Current Role */}
              <div className="p-6 bg-paper rounded-lg border-l-4 border-primary shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                  <h3 className="text-xl font-bold text-text-primary">
                    Software Engineer
                  </h3>
                  <span className="text-sm text-text-secondary mt-1 sm:mt-0">
                    Present
                  </span>
                </div>
                <p className="text-primary font-semibold mb-2">
                  Rithum (formerly CommerceHub)
                </p>
                <p className="text-text-secondary leading-relaxed">
                  [Brief description of your current role, responsibilities,
                  technologies you work with, and impact you&apos;re making]
                </p>
              </div>

              {/* Previous Role */}
              <div className="p-6 bg-paper rounded-lg border-l-4 border-secondary shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                  <h3 className="text-xl font-bold text-text-primary">
                    Junior Software Engineer
                  </h3>
                  <span className="text-sm text-text-secondary mt-1 sm:mt-0">
                    [Dates]
                  </span>
                </div>
                <p className="text-secondary font-semibold mb-2">
                  [Company Name]
                </p>
                <p className="text-text-secondary leading-relaxed">
                  [Description of responsibilities and achievements]
                </p>
              </div>

              {/* Add more positions as needed */}
            </div>
          </div>

          {/* Education */}
          <div
            className={`transition-all duration-700 delay-400 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl font-bold text-text-primary mb-8 flex items-center gap-3">
              <span className="text-2xl">🎓</span>
              Education
            </h2>
            <div className="space-y-6">
              {educationData.map((edu) => (
                <Link
                  key={edu.id}
                  href={`/about/edu/${edu.slug}`}
                  className="block p-6 bg-paper rounded-lg border-l-4 border-accent-orange shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                    <h3 className="text-xl font-bold text-text-primary group-hover:text-accent-orange transition-colors duration-300">
                      {edu.title}
                    </h3>
                    <span className="text-sm text-text-secondary mt-1 sm:mt-0">
                      {edu.startDate} - {edu.endDate}
                    </span>
                  </div>
                  <p className="text-accent-orange font-semibold mb-2">
                    {edu.university}
                  </p>
                  <p className="text-text-secondary leading-relaxed">
                    {edu.courses.length} course{edu.courses.length !== 1 ? "s" : ""} •{" "}
                    <span className="group-hover:text-primary transition-colors duration-300">
                      Click to explore →
                    </span>
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Skills & Technologies */}
          <div
            className={`transition-all duration-700 delay-500 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl font-bold text-text-primary mb-8 flex items-center gap-3">
              <span className="text-2xl">🛠️</span>
              Skills & Technologies
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Frontend */}
              <div className="p-6 bg-paper rounded-lg border-2 border-primary/20 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300">
                <h3 className="text-lg font-bold text-primary mb-4">
                  Frontend
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["React", "TypeScript", "Next.js", "Tailwind CSS"].map(
                    (skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 bg-primary/10 text-primary text-sm rounded-full border border-primary/20 hover:bg-primary/20 transition-colors duration-200"
                      >
                        {skill}
                      </span>
                    ),
                  )}
                </div>
              </div>

              {/* Backend */}
              <div className="p-6 bg-paper rounded-lg border-2 border-secondary/20 hover:border-secondary/50 shadow-sm hover:shadow-md transition-all duration-300">
                <h3 className="text-lg font-bold text-secondary mb-4">
                  Backend
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["C#", ".NET", "Python", "Node.js"].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-secondary/10 text-secondary text-sm rounded-full border border-secondary/20 hover:bg-secondary/20 transition-colors duration-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Systems & Tools */}
              <div className="p-6 bg-paper rounded-lg border-2 border-accent-orange/20 hover:border-accent-orange/50 shadow-sm hover:shadow-md transition-all duration-300">
                <h3 className="text-lg font-bold text-accent-orange mb-4">
                  Systems &apos; Tools
                </h3>
                <div className="flex flex-wrap gap-2">
                  {["Rust", "Git", "Docker", "Linux"].map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-accent-orange/10 text-accent-orange text-sm rounded-full border border-accent-orange/20 hover:bg-accent-orange/20 transition-colors duration-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interests & Hobbies */}
          <div
            className={`transition-all duration-700 delay-600 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl font-bold text-text-primary mb-8 flex items-center gap-3">
              <span className="text-2xl">✨</span>
              Beyond Code
            </h2>
            <div className="p-6 sm:p-8 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border-2 border-primary/10">
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed mb-4">
                [Share your interests outside of programming - hobbies, sports,
                creative pursuits, volunteer work, etc.]
              </p>
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
                [Additional paragraph about what you do for fun, learning
                interests, travel, or other personal aspects you&apos;d like to
                share]
              </p>
            </div>
          </div>

          {/* CTA Section */}
          <div
            className={`text-center py-12 transition-all duration-700 delay-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6">
              Let&apos;s Connect
            </h2>
            <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
              I&apos;m always open to interesting conversations and
              collaboration opportunities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/projects"
                className="group w-full sm:w-auto px-8 py-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border-2 border-primary"
              >
                <span className="flex items-center justify-center gap-2">
                  View My Work
                  <span className="group-hover:translate-x-1 transition-transform duration-300">
                    →
                  </span>
                </span>
              </Link>
              <a
                href="https://github.com/ks982579"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 bg-background-paper text-primary font-semibold rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border-2 border-primary"
              >
                GitHub Profile
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
