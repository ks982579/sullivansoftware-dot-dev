"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getEducationBySlug, Education } from "@/lib/education";

const EducationDetailPage = ({
  params,
}: {
  params: Promise<{ slug: string }>;
}): React.JSX.Element => {
  const [education, setEducation] = useState<Education | undefined>(undefined);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    params.then((resolvedParams) => {
      const edu = getEducationBySlug(resolvedParams.slug);
      setEducation(edu);
      setIsVisible(true);
    });
  }, [params]);

  if (!education) {
    return (
      <main className="min-h-screen flex flex-col">
        <section className="flex-grow py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-text-primary mb-4">
              Education not found
            </h1>
            <Link
              href="/about"
              className="text-primary hover:underline font-semibold"
            >
              Back to About
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const specializations = [
    ...new Set(
      education.courses
        .filter((course) => course.specialization)
        .map((course) => course.specialization)
    ),
  ];

  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-paper">
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
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-primary hover:underline mb-6 font-semibold transition-colors duration-300"
          >
            <span>←</span> Back to About
          </Link>

          <div
            className={`transition-all duration-700 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4"
            }`}
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-3">
              {education.title}
            </h1>
            <p className="text-lg text-accent-orange font-semibold mb-2">
              {education.university}
            </p>
            <p className="text-text-secondary">
              {education.startDate} — {education.endDate}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-grow py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Introduction */}
          <div
            className={`transition-all duration-700 delay-200 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <p className="text-lg text-text-secondary leading-relaxed">
              {education.description}
            </p>
          </div>

          {/* Specializations */}
          {specializations.length > 0 && (
            <div
              className={`transition-all duration-700 delay-300 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <h2 className="text-2xl font-bold text-text-primary mb-4">
                Specializations
              </h2>
              <div className="flex flex-wrap gap-3">
                {specializations.map((spec) => (
                  <span
                    key={spec}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-full border border-primary/30 font-semibold text-sm"
                  >
                    {spec}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Courses */}
          <div
            className={`transition-all duration-700 delay-400 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-3xl font-bold text-text-primary mb-8 flex items-center gap-3">
              <span className="text-2xl">📚</span>
              Courses & Specializations
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {education.courses.map((course, index) => (
                <div
                  key={course.id}
                  className={`p-6 bg-paper rounded-lg border-2 border-primary/20 hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                  style={{
                    transitionDelay: `${400 + index * 50}ms`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-bold text-text-primary leading-tight flex-1">
                      {course.name}
                    </h3>
                    {course.specialization && (
                      <span className="px-2 py-1 bg-accent-orange/10 text-accent-orange text-xs font-semibold rounded-full whitespace-nowrap">
                        {course.specialization}
                      </span>
                    )}
                  </div>
                  <p className="text-text-secondary leading-relaxed text-sm">
                    {course.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div
            className={`text-center py-12 transition-all duration-700 delay-500 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <Link
              href="/about"
              className="inline-block px-8 py-4 bg-primary text-white font-semibold rounded-lg shadow-md hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-300 border-2 border-primary"
            >
              Back to About
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EducationDetailPage;
