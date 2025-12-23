"use client";

import Link from "next/link";
import { useState } from "react";
import type { TopicGroup, SubtopicGroup } from "@/lib/notes";

// Subtopic section component
function SubtopicSection({
  topicSlug,
  subtopic,
}: {
  topicSlug: string;
  subtopic: SubtopicGroup;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="pl-4 border-l-2 border-accent-blue/30">
      {/* Subtopic Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2 text-left hover:text-accent-blue transition-colors"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-secondary">
            {subtopic.subtopic}
          </h3>
          <span className="px-2 py-1 bg-accent-blue/10 text-accent-blue text-xs font-semibold rounded">
            {subtopic.count}
          </span>
        </div>

        <svg
          className={`w-5 h-5 text-secondary transform transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Note Links */}
      {isExpanded && (
        <ul className="mt-2 space-y-2 pl-2">
          {subtopic.notes.map((note) => (
            <li key={note.slug}>
              <Link
                href={`/notes/${topicSlug}/${subtopic.subtopicSlug}/${note.slug}`}
                className="block px-3 py-2 rounded hover:bg-accent-blue/5 border border-transparent hover:border-accent-blue/20 transition-all"
              >
                <div className="font-medium text-primary hover:text-accent-blue">
                  {note.title}
                </div>
                {note.description && (
                  <div className="text-sm text-text-secondary mt-1">
                    {note.description}
                  </div>
                )}
                <div className="text-xs text-text-secondary mt-1">
                  {new Date(note.date).toLocaleDateString()}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Topic card component
export default function TopicCard({ topicGroup }: { topicGroup: TopicGroup }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-paper rounded-lg border-2 border-accent-blue/20 hover:border-accent-blue/40 shadow-sm transition-all duration-300">
      {/* Topic Header - Clickable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-accent-blue/5 transition-colors duration-200 rounded-t-lg"
      >
        <div className="flex items-center gap-4">
          <div className="text-3xl">📖</div>
          <div>
            <h2 className="text-2xl font-bold text-accent-blue">
              {topicGroup.topic}
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              {topicGroup.subtopics.length} subtopic
              {topicGroup.subtopics.length !== 1 ? "s" : ""} •{" "}
              {topicGroup.totalNotes} note
              {topicGroup.totalNotes !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Chevron Icon */}
        <svg
          className={`w-6 h-6 text-accent-blue transform transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded Content - Subtopics */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 space-y-4 border-t border-accent-blue/10">
          {topicGroup.subtopics.map((subtopic) => (
            <SubtopicSection
              key={subtopic.subtopicSlug}
              topicSlug={topicGroup.topicSlug}
              subtopic={subtopic}
            />
          ))}
        </div>
      )}
    </div>
  );
}
