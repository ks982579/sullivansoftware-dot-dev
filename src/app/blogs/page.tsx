import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export default function BlogsPage() {
  const posts = getAllPosts();

  return (
    <main className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8" style={{
      backgroundImage: `
        linear-gradient(rgba(139, 69, 19, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(139, 69, 19, 0.08) 1px, transparent 1px)
      `,
      backgroundSize: "50px 50px",
      backgroundAttachment: "fixed",
    }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in relative">
          {/* Corner Accent - Top Left */}
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t-4 border-l-4 border-primary opacity-40" />
          {/* Corner Accent - Top Right */}
          <div className="absolute -top-4 -right-4 w-8 h-8 border-t-4 border-r-4 border-primary opacity-40" />

          <h1 className="text-4xl sm:text-5xl font-bold text-primary mb-4">
            Blog Posts
          </h1>
          <p className="text-lg text-text-secondary mb-4">
            Thoughts, tutorials, and insights
          </p>
          <div className="w-20 h-1 bg-primary rounded-full" />
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 px-6 bg-paper rounded-lg border-4 border-primary/20 animate-fade-in">
            <p className="text-text-primary text-lg font-medium">
              No blog posts yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-paper rounded-lg border-2 border-primary/20 p-6 hover:border-primary/40 hover:shadow-md transition-all duration-200"
              >
                <Link href={`/blogs/${post.slug}`}>
                  <h2 className="text-2xl font-bold text-primary hover:text-secondary mb-2 transition-colors">
                    {post.title}
                  </h2>
                </Link>
                <div className="text-sm text-text-secondary mb-3">
                  <span>{new Date(post.pubDate).toLocaleDateString()}</span>
                  {post.author && <span> • {post.author}</span>}
                </div>
                <p className="text-text-primary mb-4">{post.description}</p>
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
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Styles */}
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
