import Image from "next/image";

export default function Home() {
  return (
    <div>
      <div className="night-sky">
        <span className="shooting-star"></span>
      </div>
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div className="night-sky"></div>
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
          <div>Tech With Kevin</div>
          <p>
            As a Software Engineer, I thrive on solving complex technical challenges across the full technology stack.
            By day, I architect and implement browser-based security solutions at Forcepoint, working with everything from C++ systems components to JavaScript browser extensions.
            My journey has evolved from building internal productivity tools with Python and JavaScript, to full-stack development with Python Django and React, through test automation, and to my current focus on systems programming and security.
            By night - or rather, in the early morning hours - I continue to expand my expertise across the software spectrum, exploring technologies like Rust while pursuing my MSc. in Computer Science at the International University of Applied Sciences, a journey that began in January 2023.
            This blend of practical experience and academic pursuit fuels building efficient, maintainable and secure software systems that make a meaningful impact.
          </p>

        </main>
        <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/file.svg"
              alt="File icon"
              width={16}
              height={16}
            />
            Learn
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/window.svg"
              alt="Window icon"
              width={16}
              height={16}
            />
            Examples
          </a>
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />
            Go to nextjs.org →
          </a>
        </footer>
      </div>
    </div>
  );
}

// app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const LandingPage = () => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <main className="h-screen snap-y snap-mandatory overflow-y-scroll">
      {/* Hero Section with Animation */}
      <section className="relative h-screen snap-start bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-pulse absolute inset-0 opacity-20">
            {/* Animated background elements */}
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  width: `${Math.random() * 20}px`,
                  height: `${Math.random() * 20}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${Math.random() * 10 + 5}s linear infinite`,
                }}
              />
            ))}
          </div>
        </div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-6xl font-bold mb-4 animate-fade-in">
            Your Name Here
          </h1>
          <p className="text-xl opacity-90">
            Web Developer | Designer | Creative Thinker
          </p>
        </div>
      </section>

      {/* Elevator Pitch Section */}
      <section className="h-screen snap-start bg-white flex items-center justify-center p-8">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">
            Nice to meet you!
          </h2>
          <p className="text-xl text-gray-600">
            [Your elevator pitch will go here]
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="h-screen snap-start bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">About Me</h2>
          <p className="text-xl text-gray-600">
            [Your about section content will go here]
          </p>
          <Link
            href="/about"
            className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Learn More About Me
          </Link>
        </div>
      </section>

      {/* Projects Section */}
      <section className="h-screen snap-start bg-white flex items-center justify-center p-8">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">My Projects</h2>
          <p className="text-xl text-gray-600">
            [Your projects overview will go here]
          </p>
          <Link
            href="/projects"
            className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Projects
          </Link>
        </div>
      </section>

      {/* Blog Section */}
      <section className="h-screen snap-start bg-gray-50 flex items-center justify-center p-8">
        <div className="max-w-3xl">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">Blog</h2>
          <p className="text-xl text-gray-600">
            [Your blog preview will go here]
          </p>
          <Link
            href="/blog"
            className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Read My Blog
          </Link>
        </div>
      </section>
    </main>
  );
};

// export default LandingPage;
