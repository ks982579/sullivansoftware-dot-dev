import fs from "fs";
import path from "path";
import matter from "gray-matter";

const notesDirectory = path.join(process.cwd(), "src/content/notes");

export interface Note {
  slug: string;
  topic: string;
  subtopic: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  draft?: boolean;
  content: string;
  filePath: string;
  topicSlug: string;
  subtopicSlug: string;
}

export interface SubtopicGroup {
  subtopic: string;
  subtopicSlug: string;
  notes: Note[];
  count: number;
}

export interface TopicGroup {
  topic: string;
  topicSlug: string;
  subtopics: SubtopicGroup[];
  totalNotes: number;
}

// Helper function to create URL-safe slugs
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "");
}

export function getAllNotes(): Note[] {
  // Gracefully handle missing directory
  if (!fs.existsSync(notesDirectory)) {
    console.warn("Notes directory not found at:", notesDirectory);
    return [];
  }

  const notes: Note[] = [];

  // Recursive function to traverse directories
  function traverseDirectory(currentPath: string, depth: number = 0) {
    try {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentPath, entry.name);

        try {
          if (entry.isDirectory()) {
            // Limit depth to prevent infinite recursion
            if (depth < 3) {
              traverseDirectory(fullPath, depth + 1);
            }
          } else if (entry.name.endsWith(".md")) {
            const fileContents = fs.readFileSync(fullPath, "utf8");
            const { data, content } = matter(fileContents);

            // Validate required fields
            const requiredFields = ["topic", "subtopic", "title", "date"];
            const missingFields = requiredFields.filter(
              (field) => !data[field]
            );

            if (missingFields.length > 0) {
              console.warn(
                `Skipping ${fullPath}: missing required fields: ${missingFields.join(", ")}`
              );
              continue;
            }

            // Validate date format
            if (isNaN(Date.parse(data.date))) {
              console.warn(`Invalid date in ${fullPath}: ${data.date}`);
              continue;
            }

            // Skip drafts
            if (data.draft === true) {
              continue;
            }

            const slug = entry.name.replace(/\.md$/, "");
            const topicSlug = slugify(data.topic);
            const subtopicSlug = slugify(data.subtopic);

            notes.push({
              slug,
              topic: data.topic,
              subtopic: data.subtopic,
              title: data.title,
              date: data.date,
              description: data.description,
              tags: data.tags || [],
              draft: data.draft || false,
              content,
              filePath: path.relative(notesDirectory, fullPath),
              topicSlug,
              subtopicSlug,
            });
          }
        } catch (error) {
          console.error(`Error processing ${fullPath}:`, error);
        }
      }
    } catch (error) {
      console.error(`Error reading directory ${currentPath}:`, error);
    }
  }

  traverseDirectory(notesDirectory);

  // Sort by date (newest first)
  return notes.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getGroupedNotes(): TopicGroup[] {
  const notes = getAllNotes();
  const topicsMap = new Map<string, Map<string, Note[]>>();

  // Group notes by topic -> subtopic
  for (const note of notes) {
    if (!topicsMap.has(note.topic)) {
      topicsMap.set(note.topic, new Map());
    }
    const subtopicsMap = topicsMap.get(note.topic)!;

    if (!subtopicsMap.has(note.subtopic)) {
      subtopicsMap.set(note.subtopic, []);
    }
    subtopicsMap.get(note.subtopic)!.push(note);
  }

  // Convert to TopicGroup array
  const topicGroups: TopicGroup[] = [];

  for (const [topic, subtopicsMap] of topicsMap.entries()) {
    const subtopics: SubtopicGroup[] = [];
    let totalNotes = 0;

    for (const [subtopic, notes] of subtopicsMap.entries()) {
      subtopics.push({
        subtopic,
        subtopicSlug: slugify(subtopic),
        notes,
        count: notes.length,
      });
      totalNotes += notes.length;
    }

    // Sort subtopics alphabetically
    subtopics.sort((a, b) => a.subtopic.localeCompare(b.subtopic));

    topicGroups.push({
      topic,
      topicSlug: slugify(topic),
      subtopics,
      totalNotes,
    });
  }

  // Sort topics alphabetically
  return topicGroups.sort((a, b) => a.topic.localeCompare(b.topic));
}

export function getNoteBySlug(
  topicSlug: string,
  subtopicSlug: string,
  slug: string
): Note | null {
  const notes = getAllNotes();

  return (
    notes.find(
      (note) =>
        note.topicSlug === topicSlug &&
        note.subtopicSlug === subtopicSlug &&
        note.slug === slug
    ) || null
  );
}

export function getAllNoteTags(): string[] {
  const notes = getAllNotes();
  const tags = notes.flatMap((note) => note.tags || []);
  return [...new Set(tags)].sort();
}

export function getNotesByTag(tag: string): Note[] {
  const notes = getAllNotes();
  return notes.filter((note) => note.tags?.includes(tag));
}
