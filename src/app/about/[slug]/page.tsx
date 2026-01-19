import { notFound } from "next/navigation";
import { getAllAboutPages, getAboutPageBySlug } from "@/lib/about";
import MdxContent from "@/components/MdxContent";
import Link from "next/link";
import type { Metadata } from "next";

interface AboutPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const pages = getAllAboutPages();
  return pages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getAboutPageBySlug(slug);

  if (!page) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: page.title,
    description: page.description,
  };
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { slug } = await params;
  const page = getAboutPageBySlug(slug);

  if (!page) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8" style={{
      backgroundImage: `
        linear-gradient(rgba(139, 69, 19, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 69, 19, 0.08) 1px, transparent 1px)
      `,
      backgroundSize: "50px 50px",
      backgroundAttachment: "fixed",
    }}>
      <article className="max-w-4xl mx-auto">
        {/* Back to about link */}
        <Link
          href="/about"
          className="text-primary hover:text-secondary mb-6 inline-block transition-colors font-medium"
        >
          ← Back to About
        </Link>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4 flex items-center gap-3">
            {page.icon && <span className="text-5xl">{page.icon}</span>}
            {page.title}
          </h1>
          <div className="text-text-secondary mb-6">
            <time dateTime={page.date} className="font-medium">
              {new Date(page.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {page.author && <span> • By {page.author}</span>}
          </div>
          {page.tags && page.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {page.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-secondary/10 border border-secondary text-secondary text-xs font-semibold rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Content */}
        <div className="bg-paper rounded-lg border-2 border-primary/20 p-8 shadow-sm">
          <MdxContent source={page.content} />
        </div>
      </article>
    </main>
  );
}
