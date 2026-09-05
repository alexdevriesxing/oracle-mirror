export type CouncilEnv = {
  AI: any;
};

const COUNCIL_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const GATEWAY_CONFIG = { gateway: { id: "default" } };
const MAX_QUESTION_LENGTH = 500;
const MIN_QUESTION_LENGTH = 8;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 4;

export const COUNCIL_PERSONAS = [
  {
    id: "fortuna",
    name: "Madame Fortuna",
    glyph: "🔮",
    title: "Keeper of Possibilities",
    lens: "uncertainty, possible paths, intuition, and what may be overlooked without claiming literal prediction",
  },
  {
    id: "seraphina",
    name: "Seraphina",
    glyph: "🃏",
    title: "Reader of Patterns",
    lens: "symbolic patterns, choices, trade-offs, and one concrete action the seeker can take",
  },
  {
    id: "morpheus",
    name: "Morpheus",
    glyph: "☾",
    title: "Dream-Walker",
    lens: "hidden assumptions, emotions, subconscious motives, and the question beneath the question",
  },
  {
    id: "rosalind",
    name: "Rosalind",
    glyph: "♡",
    title: "Oracle of the Heart",
    lens: "relationships, empathy, boundaries, communication, and the human impact of the decision",
  },
  {
    id: "pythius",
    name: "Pythius",
    glyph: "◇",
    title: "Keeper of Patterns",
    lens: "structure, repeated patterns, practical sequencing, and what can be measured or tested",
  },
  {
    id: "laotan",
    name: "Sage Lao-Tan",
    glyph: "☯",
    title: "Reader of Change",
    lens: "timing, change, non-forcing, reversibility, and where patience may be wiser than pressure",
  },
] as const;

export type CouncilPersona = (typeof COUNCIL_PERSONAS)[number];

type CouncilVoice = {
  id: string;
  name: string;
  glyph: string;
  title: string;
  response: string;
};

type CouncilResult = {
  voices: CouncilVoice[];
  verdict: {
    title: string;
    summary: string;
    next_step: string;
  };
  source: "ai" | "fallback";
};

const rateWindows = new Map<string, { count: number; resetAt: number }>();

function hashSeed(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function normalizeCouncilQuestion(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const question = value.replace(/\s+/g, " ").trim();
  if (question.length < MIN_QUESTION_LENGTH || question.length > MAX_QUESTION_LENGTH) return null;
  return question;
}

export function selectCouncilMembers(question: string): CouncilPersona[] {
  const start = hashSeed(question) % COUNCIL_PERSONAS.length;
  const step = 5;
  return [0, 1, 2].map((offset) => COUNCIL_PERSONAS[(start + offset * step) % COUNCIL_PERSONAS.length]);
}

function cleanText(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function extractJson(text: string): unknown {
  const stripped = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(stripped.slice(start, end + 1));
  } catch {
    return null;
  }
}

export function parseCouncilResponse(text: string, members: CouncilPersona[]): CouncilResult | null {
  const parsed = extractJson(text);
  if (!parsed || typeof parsed !== "object") return null;
  const input = parsed as Record<string, unknown>;
  if (!Array.isArray(input.voices) || input.voices.length !== members.length) return null;

  const voices: CouncilVoice[] = [];
  for (const member of members) {
    const candidate = input.voices.find(
      (voice) => voice && typeof voice === "object" && (voice as Record<string, unknown>).id === member.id
    ) as Record<string, unknown> | undefined;
    const response = cleanText(candidate?.response, 700);
    if (!response) return null;
    voices.push({
      id: member.id,
      name: member.name,
      glyph: member.glyph,
      title: member.title,
      response,
    });
  }

  const verdictInput = input.verdict && typeof input.verdict === "object"
    ? input.verdict as Record<string, unknown>
    : null;
  if (!verdictInput) return null;

  const title = cleanText(verdictInput.title, 100);
  const summary = cleanText(verdictInput.summary, 900);
  const nextStep = cleanText(verdictInput.next_step, 320);
  if (!title || !summary || !nextStep) return null;

  return {
    voices,
    verdict: { title, summary, next_step: nextStep },
    source: "ai",
  };
}

function fallbackCouncil(members: CouncilPersona[]): CouncilResult {
  const fallbackById: Record<string, string> = {
    fortuna: "Several paths may still be open. Resist turning uncertainty into a verdict too early; notice which option keeps returning when the noise settles.",
    seraphina: "Separate what you know from what you fear. One small reversible action can reveal more than another round of speculation.",
    morpheus: "The strongest feeling around this question may be carrying information about an assumption beneath it. Name that assumption before deciding.",
    rosalind: "Consider who is affected, what has actually been communicated, and which boundary would make the situation kinder without making it vague.",
    pythius: "Look for the repeatable pattern. Write down the options, the evidence for each, and the smallest test that would reduce uncertainty.",
    laotan: "Timing is part of the answer. If the decision can wait, create enough space to see whether the pressure is real or merely loud.",
  };

  return {
    voices: members.map((member) => ({
      id: member.id,
      name: member.name,
      glyph: member.glyph,
      title: member.title,
      response: fallbackById[member.id] || "Look at the question from a different angle before forcing certainty.",
    })),
    verdict: {
      title: "The Mirror Favors Clarity Before Certainty",
      summary: "The council agrees on one point: the useful next move is not to predict the future, but to reduce ambiguity. Separate facts from assumptions, notice the emotional pressure around the choice, and prefer a reversible step that teaches you something.",
      next_step: "Choose one small action you can take today that creates information without locking you into the final outcome.",
    },
    source: "fallback",
  };
}

function rateLimitKey(request: Request): string {
  return request.headers.get("CF-Connecting-IP") || "anonymous";
}

function checkRateLimit(request: Request): boolean {
  const now = Date.now();
  const key = rateLimitKey(request);
  const current = rateWindows.get(key);
  if (!current || current.resetAt <= now) {
    rateWindows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= MAX_REQUESTS_PER_WINDOW) return false;
  current.count += 1;
  return true;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function systemPrompt(members: CouncilPersona[]): string {
  const memberLines = members
    .map((member) => `- ${member.id} / ${member.name} / ${member.title}: ${member.lens}.`)
    .join("\n");

  return `You are the Council of Mystics inside Oracle Mirror, an entertainment and reflection experience.\n\nThree fictional mystics must answer the same user question independently, followed by one synthesized Mirror Verdict. Keep the voices clearly different. Do not claim supernatural certainty, guaranteed outcomes, hidden facts, diagnoses, legal conclusions, investment instructions, or medical treatment. For medical, legal, financial, safety, abuse, self-harm, or other high-stakes situations, stay reflective and explicitly encourage appropriate qualified or emergency help when relevant. Do not intensify paranoia, delusions, or claims that signs/omens prove real-world conspiracies.\n\nSelected council:\n${memberLines}\n\nReturn ONLY valid JSON with this exact shape:\n{"voices":[{"id":"member-id","response":"45-80 words"},{"id":"member-id","response":"45-80 words"},{"id":"member-id","response":"45-80 words"}],"verdict":{"title":"short title","summary":"70-120 words","next_step":"one practical reflective next step"}}\n\nDo not repeat the user's question verbatim. Do not include markdown.`;
}

export async function handleCouncil(request: Request, env: CouncilEnv): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } });
  }

  const origin = request.headers.get("Origin");
  if (origin && origin !== "https://oraclemirror.com" && origin !== "https://www.oraclemirror.com") {
    return jsonResponse({ error: "Forbidden" }, 403);
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const question = normalizeCouncilQuestion(body.question);
  if (!question) {
    return jsonResponse({ error: `Question must be ${MIN_QUESTION_LENGTH}-${MAX_QUESTION_LENGTH} characters.` }, 400);
  }

  if (!checkRateLimit(request)) {
    return jsonResponse({ error: "The council is resting. Please try again in a few minutes." }, 429);
  }

  const members = selectCouncilMembers(question);

  try {
    const result = await env.AI.run(
      COUNCIL_MODEL,
      {
        messages: [
          { role: "system", content: systemPrompt(members) },
          { role: "user", content: `Reflect on this question: ${question}` },
        ],
        max_tokens: 1000,
        temperature: 0.75,
      },
      GATEWAY_CONFIG
    );
    const text = String(result?.response ?? result?.message ?? "");
    const parsed = parseCouncilResponse(text, members);
    return jsonResponse(parsed || fallbackCouncil(members));
  } catch {
    return jsonResponse(fallbackCouncil(members));
  }
}
