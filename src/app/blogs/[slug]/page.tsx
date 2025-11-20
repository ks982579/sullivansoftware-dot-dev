import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import MdxContent from "@/components/MdxContent";
import Link from "next/link";

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
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
        {/* Back to blogs link */}
        <Link
          href="/blogs"
          className="text-primary hover:text-secondary mb-6 inline-block transition-colors font-medium"
        >
          ← Back to all posts
        </Link>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
            {post.title}
          </h1>
          <div className="text-text-secondary mb-6">
            <time dateTime={post.pubDate} className="font-medium">
              {new Date(post.pubDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {post.author && <span> • By {post.author}</span>}
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
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
          <MdxContent source={post.content} />
        </div>
      </article>
    </main>
  );
}
