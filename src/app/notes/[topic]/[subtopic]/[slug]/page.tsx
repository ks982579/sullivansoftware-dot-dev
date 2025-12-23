import { notFound } from "next/navigation";
import { getAllNotes, getNoteBySlug } from "@/lib/notes";
import MdxContent from "@/components/MdxContent";
import Link from "next/link";

interface NotePageProps {
  params: Promise<{
    topic: string;
    subtopic: string;
    slug: string;
  }>;
}

// Static generation - pre-render all notes at build time
export async function generateStaticParams() {
  const notes = getAllNotes();

  return notes.map((note) => ({
    topic: note.topicSlug,
    subtopic: note.subtopicSlug,
    slug: note.slug,
  }));
}

// Metadata for SEO
export async function generateMetadata({ params }: NotePageProps) {
  const { topic, subtopic, slug } = await params;
  const note = getNoteBySlug(topic, subtopic, slug);

  if (!note) {
    return {
      title: "Note Not Found",
    };
  }

  return {
    title: `${note.title} | Master's Notes`,
    description: note.description || `Notes on ${note.title}`,
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const { topic, subtopic, slug } = await params;
  const note = getNoteBySlug(topic, subtopic, slug);

  if (!note) {
    notFound();
  }

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
      <article className="max-w-4xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 text-sm">
          <Link
            href="/notes"
            className="text-accent-blue hover:text-secondary transition-colors font-medium"
          >
            ← All Notes
          </Link>
          <span className="mx-2 text-text-secondary">/</span>
          <span className="text-text-secondary">{note.topic}</span>
          <span className="mx-2 text-text-secondary">/</span>
          <span className="text-text-secondary">{note.subtopic}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          {/* Topic & Subtopic Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-accent-blue/10 border border-accent-blue text-accent-blue text-xs font-semibold rounded">
              {note.topic}
            </span>
            <span className="px-3 py-1 bg-secondary/10 border border-secondary text-secondary text-xs font-semibold rounded">
              {note.subtopic}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-bold text-accent-blue mb-4">
            {note.title}
          </h1>

          {/* Metadata */}
          <div className="text-text-secondary mb-6">
            <time dateTime={note.date} className="font-medium">
              {new Date(note.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          </div>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full border border-primary/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content Card with KaTeX Support */}
        <div className="bg-paper rounded-lg border-2 border-accent-blue/20 p-8 shadow-sm">
          <MdxContent source={note.content} />
        </div>

        {/* Back to Top Link */}
        <div className="mt-8 text-center">
          <a
            href="#"
            className="inline-block px-6 py-3 bg-accent-blue/10 text-accent-blue font-semibold rounded-lg border-2 border-accent-blue/20 hover:bg-accent-blue/20 hover:border-accent-blue/40 transition-all duration-300"
          >
            ↑ Back to Top
          </a>
        </div>
      </article>
    </main>
  );
}
