import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export default function BlogsPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Blog Posts</h1>

        {posts.length === 0 ? (
          <p className="text-gray-600">
            No blog posts yet. Check back soon!
          </p>
        ) : (
          <div className="space-y-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <Link href={`/blogs/${post.slug}`}>
                  <h2 className="text-2xl font-bold text-gray-900 hover:text-blue-600 mb-2">
                    {post.title}
                  </h2>
                </Link>
                <div className="text-sm text-gray-500 mb-3">
                  <span>{new Date(post.pubDate).toLocaleDateString()}</span>
                  {post.author && <span> • {post.author}</span>}
                </div>
                <p className="text-gray-700 mb-4">{post.description}</p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
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
    </div>
  );
}
