import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section - Japanese Retro */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
        {/* Retro Grid Background Pattern */}
        <div className="absolute inset-0 opacity-5">
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

        {/* Vintage Corner Accents */}
        <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-primary opacity-20" />
        <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-primary opacity-20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-primary opacity-20" />
        <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-primary opacity-20" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Small retro label */}
          <div className="inline-block mb-6 px-4 py-2 bg-primary/10 border border-primary/30 rounded">
            <span className="text-sm font-semibold text-primary tracking-wider uppercase">
              Software Engineer
            </span>
          </div>

          {/* Name with retro styling */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-text-primary">
            <span className="inline-block transform hover:scale-105 transition-transform duration-300">
              Kevin
            </span>{" "}
            <span className="inline-block transform hover:scale-105 transition-transform duration-300">
              Sullivan
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
            Building elegant solutions to complex problems.
            <br />
            <span className="text-lg">
              Full-stack developer by day, MSc student by night.
            </span>
          </p>

          {/* CTA Buttons with retro styling */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/about"
              className="group px-8 py-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-2 border-primary"
            >
              <span className="flex items-center gap-2">
                About Me
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </span>
            </Link>
            <Link
              href="/projects"
              className="px-8 py-4 bg-background-paper text-primary font-semibold rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border-2 border-primary"
            >
              View Projects
            </Link>
          </div>

          {/* Tech Stack Pills */}
          <div className="mt-16 flex flex-wrap gap-3 justify-center max-w-2xl mx-auto">
            {[
              "React",
              "TypeScript",
              "Next.js",
              "C#",
              "Python",
              "Rust",
            ].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-secondary/10 text-secondary text-sm font-medium rounded-full border border-secondary/20"
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
      <section className="py-20 px-6 bg-paper">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Projects Card */}
            <Link
              href="/projects"
              className="group p-8 bg-background rounded-lg border-2 border-primary/20 hover:border-primary/50 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <span className="text-2xl">💻</span>
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">
                Projects
              </h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                Explore my latest work and side projects. From web apps to
                system tools.
              </p>
              <span className="text-primary font-semibold group-hover:translate-x-2 inline-block transition-transform">
                View all →
              </span>
            </Link>

            {/* Blog Card */}
            <Link
              href="/blogs"
              className="group p-8 bg-background rounded-lg border-2 border-secondary/20 hover:border-secondary/50 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">
                Blog
              </h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                Thoughts on software engineering, learning, and technology.
              </p>
              <span className="text-secondary font-semibold group-hover:translate-x-2 inline-block transition-transform">
                Read posts →
              </span>
            </Link>

            {/* About Card */}
            <Link
              href="/about"
              className="group p-8 bg-background rounded-lg border-2 border-accent-orange/20 hover:border-accent-orange/50 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="w-12 h-12 bg-accent-orange/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent-orange/20 transition-colors">
                <span className="text-2xl">👨‍💻</span>
              </div>
              <h3 className="text-2xl font-bold text-text-primary mb-3">
                About
              </h3>
              <p className="text-text-secondary leading-relaxed mb-4">
                Learn more about my background, skills, and what drives me.
              </p>
              <span className="text-accent-orange font-semibold group-hover:translate-x-2 inline-block transition-transform">
                Learn more →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Current Focus Section */}
      <section className="py-20 px-6 bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
              Currently
            </h2>
            <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-paper rounded-lg border-l-4 border-primary">
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                🏢 Software Engineer at Rithum
              </h3>
              <p className="text-text-secondary">
                Building e-commerce solutions with React, TypeScript, and C#
              </p>
            </div>

            <div className="p-6 bg-paper rounded-lg border-l-4 border-secondary">
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                🎓 MSc Computer Science Student
              </h3>
              <p className="text-text-secondary">
                International University of Applied Sciences (since Jan 2023)
              </p>
            </div>

            <div className="p-6 bg-paper rounded-lg border-l-4 border-accent-orange">
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                🦀 Exploring Rust
              </h3>
              <p className="text-text-secondary">
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
