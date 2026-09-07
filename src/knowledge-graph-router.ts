import { KNOWLEDGE_TOPICS, handleKnowledgeTopicRoute } from "./knowledge-graph.ts";

const TOPIC_SLUGS = new Set(KNOWLEDGE_TOPICS.map((topic) => topic.slug));

function normalize(path: string): string {
  return path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;
}

export function isKnownKnowledgeTopicRoute(path: string): boolean {
  const normalized = normalize(path);
  if (normalized === "/topics") return true;
  if (!normalized.startsWith("/topics/")) return false;
  return TOPIC_SLUGS.has(normalized.slice("/topics/".length));
}

export function handleKnownKnowledgeTopicRoute(path: string): Response {
  if (!isKnownKnowledgeTopicRoute(path)) return new Response("Not found", { status: 404 });
  return handleKnowledgeTopicRoute(path);
}
