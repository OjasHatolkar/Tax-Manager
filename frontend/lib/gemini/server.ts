import { GoogleGenAI } from "@google/genai";
import { getRuleSetsForYear } from "@/lib/rules/data";
import { evaluateRuleSet } from "@/lib/rules/engine/evaluateTopic";
import type { TaxFacts } from "@/lib/rules/types";

let client: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) throw new Error("GEMINI_API_KEY is not set");
    client ??= new GoogleGenAI({ apiKey });
    return client;
}

export function getModel(): string {
    const model = process.env.GEMINI_API_MODEL?.trim();
    if (!model) throw new Error("GEMINI_API_MODEL is not set");
    return model;
}

/** Rebuild rule results on the server; never treat browser-supplied results as authoritative. */
export function getAuthoritativeEvaluations(facts: TaxFacts) {
    return getRuleSetsForYear(2025).flatMap((ruleSet) =>
        evaluateRuleSet(ruleSet.topics, facts, ruleSet.id, ruleSet.version)
    );
}
