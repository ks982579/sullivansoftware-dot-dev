import { getQuizTemplates } from "@/lib/quizTemplates";
import QuizAppClient from "./QuizAppClient";

export default function QuizAppPage() {
  const templates = getQuizTemplates();
  return <QuizAppClient templates={templates} />;
}
