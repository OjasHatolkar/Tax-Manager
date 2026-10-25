"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, HelpCircle, Sparkles } from "lucide-react";
import type { QuestionnaireAnswers } from "./types";
import { mapToTaxFacts } from "@/lib/questionnaire/mapToTaxFacts";
import { getRuleSetsForYear } from "@/lib/rules/data";
import { evaluateRuleSet } from "@/lib/rules/engine/evaluateTopic";
import { summarizeCompleteness } from "@/lib/rules/engine/missingFacts";
import { deterministicFollowUp, getAdaptiveFollowUp } from "@/lib/gemini/followUp";
import type { FollowUpQuestion } from "@/lib/gemini/types";
import type { TopicEvaluation } from "@/lib/rules/types";

interface ResultsPanelProps {
  answers: QuestionnaireAnswers;
}

const STATUS_STYLES: Record<
  TopicEvaluation["status"],
  { icon: typeof CheckCircle2; label: string; className: string }
> = {
  may_apply: {
    icon: CheckCircle2,
    label: "May be worth investigating",
    className: "border-forest-300 bg-forest-50 text-forest-900",
  },
  needs_info: {
    icon: HelpCircle,
    label: "Needs more information",
    className: "border-amber-300 bg-amber-50 text-amber-900",
  },
  does_not_apply: {
    icon: AlertCircle,
    label: "Likely does not apply",
    className: "border-ink-200 bg-cream-100 text-ink-500",
  },
};

/**
 * Runs the questionnaire's answers through the deterministic rules engine
 * and shows the result, plus one adaptive follow-up question. Gemini helps
 * phrase it; the rules engine remains the source of valid missing facts.
 *
 * This is illustrative, not a final determination: every "may apply" topic
 * is explicitly framed as something to look into, never a guarantee.
 */
export default function ResultsPanel({ answers }: ResultsPanelProps) {
  const [followUp, setFollowUp] = useState<FollowUpQuestion | null>(null);
  const [loadingFollowUp, setLoadingFollowUp] = useState(true);

  const facts = mapToTaxFacts(answers);
  const ruleSets = getRuleSetsForYear(2025);
  const evaluations = ruleSets.flatMap((rs) =>
    evaluateRuleSet(rs.topics, facts, rs.id, rs.version)
  );
  const completeness = summarizeCompleteness(facts, evaluations);

  useEffect(() => {
    let cancelled = false;
    setLoadingFollowUp(true);
    const request = { facts, evaluations };
    getAdaptiveFollowUp(request)
      .catch(() => deterministicFollowUp(request))
      .then((result) => {
        if (!cancelled) {
          setFollowUp(result);
          setLoadingFollowUp(false);
        }
      });
    return () => {
      cancelled = true;
    };
    // Re-run only when the underlying answers change, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(answers)]);

  const documentIds = new Set<string>();
  const documents = evaluations
    .filter((e) => e.status !== "does_not_apply")
    .flatMap((e) => e.requiredDocuments)
    .filter((doc) => {
      if (documentIds.has(doc.id)) return false;
      documentIds.add(doc.id);
      return true;
    });

  return (
    <div className="mt-6 space-y-6">
      <div className="rounded-xl border border-forest-200 bg-forest-50 px-4 py-4 text-sm text-forest-800">
        <strong>Illustrative preview, not a tax determination.</strong> These
        results come from Tax Help&apos;s deterministic rules engine running
        against the answers above. Nothing here is a confirmed credit,
        deduction, refund, or filing outcome.
      </div>

      {/* Document checklist */}
      <section>
        <h3 className="text-sm font-semibold text-ink-900">
          Documents worth having on hand
        </h3>
        {documents.length === 0 ? (
          <p className="mt-2 text-sm text-ink-600">
            Answer a few more questions to generate a document checklist.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="rounded-lg border border-forest-100 bg-white px-3.5 py-2.5 text-sm text-ink-800"
              >
                <span className="font-medium">{doc.label}</span>
                {doc.note && (
                  <span className="block text-xs text-ink-500">{doc.note}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Topics */}
      <section>
        <h3 className="text-sm font-semibold text-ink-900">
          Topics evaluated ({completeness.resolvedTopics} of {evaluations.length}{" "}
          resolved)
        </h3>
        <ul className="mt-3 space-y-2.5">
          {evaluations.map((evaluation) => {
            const style = STATUS_STYLES[evaluation.status];
            const Icon = style.icon;
            return (
              <li
                key={evaluation.topicId}
                className={`rounded-xl border px-4 py-3 text-sm ${style.className}`}
              >
                <div className="flex items-center gap-2 font-medium">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {evaluation.title}
                  <span className="ml-auto text-xs font-normal opacity-80">
                    {style.label}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed opacity-90">
                  {evaluation.summary}
                </p>
                {evaluation.citations.length > 0 && (
                  <a
                    href={evaluation.citations[0]?.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1.5 inline-block text-xs font-medium underline underline-offset-2"
                  >
                    {evaluation.citations[0]?.label}
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Adaptive follow-up (Gemini integration point) */}
      <section className="rounded-xl border border-dashed border-forest-300 bg-white px-4 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
          <Sparkles className="h-4 w-4 text-forest-700" aria-hidden="true" />
          Follow-up question
        </div>
        {loadingFollowUp && (
          <p className="mt-2 text-sm text-ink-500">Thinking of a follow-up…</p>
        )}
        {!loadingFollowUp && followUp && (
          <div className="mt-2">
            <p className="text-sm text-ink-800">{followUp.question}</p>
            <p className="mt-1 text-xs text-ink-500">{followUp.rationale}</p>
            <span className="mt-2 inline-block rounded-full bg-cream-200 px-2.5 py-0.5 text-[11px] font-medium text-ink-600">
              {followUp.source === "gemini"
                ? "Generated by Gemini"
                : "Rule-based fallback"}
            </span>
          </div>
        )}
        {!loadingFollowUp && !followUp && (
          <p className="mt-2 text-sm text-ink-500">
            No outstanding questions — every evaluated topic has enough
            information to resolve.
          </p>
        )}
      </section>
    </div>
  );
}
