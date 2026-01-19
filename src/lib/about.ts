import fs from "fs";
import path from "path";
import matter from "gray-matter";

const aboutDirectory = path.join(process.cwd(), "src/content/about");

export interface AboutPage {
  slug: string;
  title: string;
  description: string;
  date: string;
  author?: string;
  tags?: string[];
  draft?: boolean;
  icon?: string;
  content: string;
}

export function getAllAboutPages(): AboutPage[] {
  // Check if directory exists, if not return empty array
  if (!fs.existsSync(aboutDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(aboutDirectory);
  const allPagesData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      // Remove ".md" from file name to get slug
      const slug = fileName.replace(/\.md$/, "");

      // Read markdown file as string
      const fullPath = path.join(aboutDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");

      // Use gray-matter to parse the page metadata section
      const { data, content } = matter(fileContents);

      // Combine the data with the slug and content
      return {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        author: data.author,
        tags: data.tags || [],
        draft: data.draft || false,
        icon: data.icon,
        content,
      } as AboutPage;
    })
    .filter((page) => !page.draft) // Filter out draft pages
    .sort((a, b) => {
      // Sort alphabetically by title
      return a.title.localeCompare(b.title);
    });

  return allPagesData;
}

export function getAboutPageBySlug(slug: string): AboutPage | null {
  try {
    const fullPath = path.join(aboutDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      description: data.description,
      date: data.date,
      author: data.author,
      tags: data.tags || [],
      draft: data.draft || false,
      icon: data.icon,
      content,
    } as AboutPage;
  } catch {
    return null;
  }
}

export function getAllAboutTags(): string[] {
  const pages = getAllAboutPages();
  const tags = pages.flatMap((page) => page.tags || []);
  // Get unique tags
  return [...new Set(tags)].sort();
}

export function getAboutPagesByTag(tag: string): AboutPage[] {
  const pages = getAllAboutPages();
  return pages.filter((page) => page.tags?.includes(tag));
}
