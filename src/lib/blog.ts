import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "src/content/posts");

export interface BlogPost {
  slug: string;
  title: string;
  pubDate: string;
  description: string;
  author: string;
  tags: string[];
  draft?: boolean;
  image?: {
    url: string;
    alt: string;
  };
  content: string;
}

export function getAllPosts(): BlogPost[] {
  // Check if directory exists, if not return empty array
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, "");

      // Read markdown file as string
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // Use gray-matter to parse the post metadata section
      const { data, content } = matter(fileContents);

      // Combine the data with the slug and content
      return {
        slug,
        title: data.title,
        pubDate: data.pubDate,
        description: data.description,
        author: data.author,
        tags: data.tags || [],
        draft: data.draft || false,
        image: data.image,
        content,
      } as BlogPost;
    })
    .filter((post) => !post.draft) // Filter out draft posts
    .sort((a, b) => {
      // Sort by date, newest first
      return new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime();
    });

  return allPostsData;
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(postsDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      pubDate: data.pubDate,
      description: data.description,
      author: data.author,
      tags: data.tags || [],
      draft: data.draft || false,
      image: data.image,
      content,
    } as BlogPost;
  } catch {
    return null;
  }
}

export function getAllTags(): string[] {
  const posts = getAllPosts();
  const tags = posts.flatMap((post) => post.tags);
  // Get unique tags
  return [...new Set(tags)].sort();
}

export function getPostsByTag(tag: string): BlogPost[] {
  const posts = getAllPosts();
  return posts.filter((post) => post.tags.includes(tag));
}
