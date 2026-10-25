import { NextResponse } from "next/server";
import { Type } from "@google/genai";
import { getAuthoritativeEvaluations, getGemini, getModel } from "@/lib/gemini/server";
import { cleanFacts } from "@/lib/gemini/sanitize";

const SYSTEM = `You help college students and recent grads understand their own tax situation.
You receive QUESTIONNAIRE ANSWERS (user-provided) and RULES ENGINE RESULTS (authoritative).
- Base every statement on those two inputs. Never invent deductions, credits, amounts,
  thresholds, rates, or deadlines. If a number is not in the input, do not state one.
- If something depends on facts that are missing, say what is missing.
- Plain, calm language. Short sentences. No jargon without explaining it.
- This is guidance, not tax advice. For complicated situations, suggest a VITA site or a tax preparer.
Return JSON matching the schema.`;

const schema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING },
        actions: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: { title: { type: Type.STRING }, detail: { type: Type.STRING } },
                required: ["title", "detail"],
            },
        },
        caveats: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["summary", "actions", "caveats"],
};

type Advice = {
    summary: string;
    actions: { title: string; detail: string }[];
    caveats: string[];
};

function parseAdvice(text: string | undefined): Advice | null {
    if (!text) return null;
    try {
        const data = JSON.parse(text);
        if (typeof data.summary !== "string" || data.summary.length > 1500) return null;
        if (!Array.isArray(data.actions) || data.actions.length > 10) return null;
        if (!Array.isArray(data.caveats) || data.caveats.length > 10) return null;
        for (const a of data.actions) {
            if (typeof a?.title !== "string" || typeof a?.detail !== "string") return null;
            if (a.title.length > 200 || a.detail.length > 800) return null;
        }
        if (!data.caveats.every((c: unknown) => typeof c === "string" && c.length <= 500)) return null;
        return data as Advice;
    } catch {
        return null;
    }
}

export async function POST(req: Request) {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { answers } = (body ?? {}) as Record<string, unknown>;
    const facts = cleanFacts(answers);
    if (!facts) {
        return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const evaluations = getAuthoritativeEvaluations(facts);

    try {
        const result = await getGemini().models.generateContent({
            model: getModel(),
            contents:
                `QUESTIONNAIRE ANSWERS:\n${JSON.stringify(facts)}\n\n` +
                `RULES ENGINE RESULTS:\n${JSON.stringify(evaluations)}`,
            config: {
                systemInstruction: SYSTEM,
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.2,
            },
        });
        // Invalid or truncated model output becomes null, never raw text.
        const advice = parseAdvice(result.text);
        if (!advice) {
            return NextResponse.json(
                { error: "Gemini returned an invalid response", advice: null },
                { status: 502 }
            );
        }
        return NextResponse.json({ advice });
    } catch (err) {
        console.error("Gemini explain failed:", err);
        return NextResponse.json(
            { error: "Gemini is temporarily unavailable", advice: null },
            { status: 503 }
        );
    }
}
