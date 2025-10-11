// app/page.tsx
import Link from "next/link";

const LandingPage = () => {
  // const [scrollPosition, setScrollPosition] = useState(0);

  // -- Can be for adding progress indicators or triggering animations
  // useEffect(() => {
  //   const handleScroll = () => {
  //     setScrollPosition(window.scrollY);
  //   };
  //
  //   window.addEventListener('scroll', handleScroll);
  //   return () => window.removeEventListener('scroll', handleScroll);
  // }, []);

  return (
    // <div className="night-sky">
    //   <span className="shooting-star"></span>
    // </div>
    <main className="h-screen snap-y snap-mandatory overflow-y-scroll">
      {/* Hero Section with Animation */}
      <section className="relative h-screen snap-start bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-pulse absolute inset-0 opacity-20">
            {/* Animated background elements */}
            {[...Array(100)].map((_, i) => {
              const len: number = Math.max(Math.random() * 20, 5);
              return (
                <div
                  key={i}
                  className="absolute rounded-full bg-white"
                  style={{
                    width: `${len}px`,
                    height: `${len}px`,
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `float ${Math.random() * 10 + 5}s linear infinite`,
                  }}
                />
              );
            })}
          </div>
        </div>
        <div className="relative z-10 text-center text-white">
          <h1 className="text-6xl font-bold mb-4 animate-fade-in">
            Kevin Sullivan
          </h1>
          <p className="text-xl opacity-90">
            Software Engineer | Problem Solver | Creative Thinker
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
            As a Software Engineer, I thrive on solving complex technical
            challenges across the full technology stack. By day, I architect and
            implement browser-based security solutions at Forcepoint, working
            with everything from C++ systems components to JavaScript browser
            extensions. My journey has evolved from building internal
            productivity tools with Python and JavaScript, to full-stack
            development with Python Django and React, through test automation,
            and to my current focus on systems programming and security. By
            night - or rather, in the early morning hours - I continue to expand
            my expertise across the software spectrum, exploring technologies
            like Rust while pursuing my MSc. in Computer Science at the
            International University of Applied Sciences, a journey that began
            in January 2023. This blend of practical experience and academic
            pursuit fuels building efficient, maintainable and secure software
            systems that make a meaningful impact.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="h-screen snap-start bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">About Me</h2>
          <p className="text-xl text-gray-600">
            Learn more about what I do and how I do it!
          </p>
        </div>
        <Link
          href="/about"
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Learn More About Me
        </Link>
      </section>

      {/* Projects Section */}
      <section className="h-screen snap-start bg-white flex flex-col items-center justify-center p-8">
        <div className="max-w-3xl flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">My Projects</h2>
          <p className="text-xl text-gray-600">
            Come and see what I am working on!
          </p>
        </div>
        <Link
          href="/projects"
          className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          View All Projects
        </Link>
      </section>

      {/* Blog Section */}
      <section className="h-screen snap-start bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="max-w-3xl flex flex-col items-center justify-center">
          <h2 className="text-4xl font-bold mb-6 text-gray-800">Blog</h2>
          <p className="text-xl text-gray-600">
            Explore some interesting blogs I&apos;ve written.
          </p>
          <Link
            href="/blogs"
            className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Read My Blog
          </Link>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
