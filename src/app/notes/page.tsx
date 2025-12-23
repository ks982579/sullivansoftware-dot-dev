import { getGroupedNotes } from "@/lib/notes";
import TopicCard from "./components/TopicCard";

export default function NotesPage() {
  const topicGroups = getGroupedNotes();

  return (
    <main
      className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `
          linear-gradient(rgba(139, 69, 19, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139, 69, 19, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: "50px 50px",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header with Japanese Retro Corner Accents */}
        <div className="mb-8 animate-fade-in relative">
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t-4 border-l-4 border-accent-blue opacity-40" />
          <div className="absolute -top-4 -right-4 w-8 h-8 border-t-4 border-r-4 border-accent-blue opacity-40" />

          <h1 className="text-4xl sm:text-5xl font-bold text-accent-blue mb-4">
            Master&apos;s Programme Notes
          </h1>
          <p className="text-lg text-text-secondary mb-4">
            Lecture notes, summaries, and study materials organized by topic
          </p>
          <div className="w-20 h-1 bg-accent-blue rounded-full" />
        </div>

        {/* Empty State */}
        {topicGroups.length === 0 ? (
          <div className="text-center py-16 px-6 bg-paper rounded-lg border-4 border-accent-blue/20 animate-fade-in">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-text-primary text-lg font-medium mb-2">
              No notes yet
            </p>
            <p className="text-text-secondary">
              Add markdown files to{" "}
              <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                src/content/notes/[topic]/[subtopic]/
              </code>
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {topicGroups.map((topicGroup) => (
              <TopicCard key={topicGroup.topicSlug} topicGroup={topicGroup} />
            ))}
          </div>
        )}
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}
