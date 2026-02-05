import fs from "fs";
import path from "path";
import { QuizTemplateData } from "./quizTypes";

const templatesDirectory = path.join(process.cwd(), "src/content/quiz-templates");

export function getQuizTemplates(): QuizTemplateData[] {
  if (!fs.existsSync(templatesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(templatesDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".json"))
    .map((fileName) => {
      const fullPath = path.join(templatesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      return JSON.parse(fileContents) as QuizTemplateData;
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}
