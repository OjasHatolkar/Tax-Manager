"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, CheckCircle2, HelpCircle, Sparkles } from "lucide-react";
import type { QuestionnaireAnswers } from "./types";
import { mapToTaxFacts } from "@/lib/questionnaire/mapToTaxFacts";
import { getRuleSetsForYear } from "@/lib/rules/data";
import { evaluateRuleSet } from "@/lib/rules/engine/evaluateTopic";
import { summarizeCompleteness } from "@/lib/rules/engine/missingFacts";
import { deterministicFollowUp, FOLLOW_UP_INPUTS, followUpAnswerLabel, getAdaptiveFollowUp, MAX_ADAPTIVE_QUESTIONS, parseFollowUpAnswer } from "@/lib/gemini/followUp";
import type { ExplainAdvice, FollowUpQuestion } from "@/lib/gemini/types";
import type { TaxFacts, TopicEvaluation } from "@/lib/rules/types";

interface ResultsPanelProps { answers: QuestionnaireAnswers }

const STATUS_STYLES: Record<TopicEvaluation["status"], { icon: typeof CheckCircle2; label: string; className: string }> = {
  may_apply: { icon: CheckCircle2, label: "May be worth investigating", className: "border-forest-300 bg-forest-50 text-forest-900" },
  needs_info: { icon: HelpCircle, label: "Needs more information", className: "border-amber-300 bg-amber-50 text-amber-900" },
  does_not_apply: { icon: AlertCircle, label: "Likely does not apply", className: "border-ink-200 bg-cream-100 text-ink-500" },
};

export default function ResultsPanel({ answers }: ResultsPanelProps) {
  const baseFacts = mapToTaxFacts(answers);
  const [additionalFacts, setAdditionalFacts] = useState<Partial<TaxFacts>>({});
  const facts = { ...baseFacts, ...additionalFacts } as TaxFacts;
  const supportedTaxYear = answers.taxYear === "2025";
  const ruleSets = supportedTaxYear ? getRuleSetsForYear(2025) : [];
  const evaluations = ruleSets.flatMap((rs) => evaluateRuleSet(rs.topics, facts, rs.id, rs.version));
  const completeness = summarizeCompleteness(facts, evaluations);
  const [followUp, setFollowUp] = useState<FollowUpQuestion | null>(null);
  const [phase, setPhase] = useState<"loading" | "question" | "advice_loading" | "advice" | "error">("loading");
  const [askedFacts, setAskedFacts] = useState<(keyof TaxFacts)[]>([]);
  const [turns, setTurns] = useState<{ question: string; answer: string }[]>([]);
  const [rawAnswer, setRawAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [advice, setAdvice] = useState<ExplainAdvice | null>(null);

  async function requestAdvice(updatedFacts: TaxFacts) {
    setPhase("advice_loading"); setFollowUp(null); setError(null);
    try {
      const response = await fetch("/api/gemini/explain", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers: updatedFacts }) });
      const payload = await response.json() as { advice?: ExplainAdvice | null; error?: string };
      if (!response.ok || !payload.advice) throw new Error(payload.error || "Could not generate personalized advice.");
      setAdvice(payload.advice); setPhase("advice");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not generate personalized advice."); setPhase("error"); }
  }

  async function requestNextQuestion(updatedFacts: TaxFacts, excluded: (keyof TaxFacts)[]) {
    setPhase("loading"); setError(null);
    const currentEvaluations = ruleSets.flatMap((rs) => evaluateRuleSet(rs.topics, updatedFacts, rs.id, rs.version));
    const request = { facts: updatedFacts, evaluations: currentEvaluations, excludedFacts: excluded };
    try {
      const next = await getAdaptiveFollowUp(request);
      if (next) { setFollowUp(next); setRawAnswer(""); setPhase("question"); }
      else await requestAdvice(updatedFacts);
    } catch {
      const fallback = deterministicFollowUp(request);
      if (fallback) { setFollowUp(fallback); setPhase("question"); }
      else await requestAdvice(updatedFacts);
    }
  }

  useEffect(() => {
    if (!supportedTaxYear) return;
    let active = true;
    const timeout = window.setTimeout(() => { if (active) void requestNextQuestion(baseFacts, []); }, 250);
    return () => { active = false; window.clearTimeout(timeout); };
    // Parent keys this panel by the questionnaire answers, so each new answer set starts a fresh conversation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supportedTaxYear]);

  if (!supportedTaxYear) return <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-4 text-sm text-amber-900">The rules currently available here cover the 2025 tax year only. No results are shown for this selection; choose 2025 to see the supported assessment.</div>;

  const documentIds = new Set<string>();
  const documents = evaluations.filter((e) => e.status !== "does_not_apply").flatMap((e) => e.requiredDocuments).filter((doc) => { if (documentIds.has(doc.id)) return false; documentIds.add(doc.id); return true; });

  function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!followUp) return;
    const target = followUp.targetFact;
    const parsed = parseFollowUpAnswer(target, rawAnswer);
    if (parsed === null && rawAnswer !== "not_sure") { setError("Enter a valid answer, or choose “I’m not sure.”"); return; }
    const updatedFacts = { ...facts } as TaxFacts;
    if (parsed !== null) (updatedFacts as Record<string, string | number | boolean>)[target] = parsed;
    const nextAsked = [...askedFacts, target];
    setAskedFacts(nextAsked);
    if (parsed !== null) setAdditionalFacts((previous) => ({ ...previous, [target]: parsed }));
    setTurns((previous) => [...previous, { question: followUp.question, answer: followUpAnswerLabel(target, rawAnswer) }]);
    setFollowUp(null);
    if (nextAsked.length >= MAX_ADAPTIVE_QUESTIONS) void requestAdvice(updatedFacts);
    else void requestNextQuestion(updatedFacts, nextAsked);
  }

  const spec = followUp ? FOLLOW_UP_INPUTS[followUp.targetFact] : null;
  const selectClass = "mt-1 block w-full rounded-lg border border-ink-200 bg-white px-3 py-2";

  return <div className="mt-6 space-y-6">
    <div className="rounded-xl border border-forest-200 bg-forest-50 px-4 py-4 text-sm text-forest-800"><strong>Illustrative preview, not a tax determination.</strong> These results come from Tax Help&apos;s deterministic rules engine running against the answers above. Nothing here is a confirmed credit, deduction, refund, or filing outcome.</div>
    <section><h3 className="text-sm font-semibold text-ink-900">Documents worth having on hand</h3>{documents.length === 0 ? <p className="mt-2 text-sm text-ink-600">Answer a few more questions to generate a document checklist.</p> : <ul className="mt-3 space-y-2">{documents.map((doc) => <li key={doc.id} className="rounded-lg border border-forest-100 bg-white px-3.5 py-2.5 text-sm text-ink-800"><span className="font-medium">{doc.label}</span>{doc.note && <span className="block text-xs text-ink-500">{doc.note}</span>}</li>)}</ul>}</section>
    <section><h3 className="text-sm font-semibold text-ink-900">Topics evaluated ({completeness.resolvedTopics} of {evaluations.length} resolved)</h3><ul className="mt-3 space-y-2.5">{evaluations.map((evaluation) => { const style = STATUS_STYLES[evaluation.status]; const Icon = style.icon; return <li key={evaluation.topicId} className={`rounded-xl border px-4 py-3 text-sm ${style.className}`}><div className="flex items-center gap-2 font-medium"><Icon className="h-4 w-4 shrink-0" aria-hidden="true" />{evaluation.title}<span className="ml-auto text-xs font-normal opacity-80">{style.label}</span></div><p className="mt-1 text-xs leading-relaxed opacity-90">{evaluation.summary}</p>{evaluation.citations[0] && <a href={evaluation.citations[0].url} target="_blank" rel="noreferrer" className="mt-1.5 inline-block text-xs font-medium underline underline-offset-2">{evaluation.citations[0].label}</a>}</li>; })}</ul></section>
    <section className="rounded-xl border border-dashed border-forest-300 bg-white px-4 py-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-ink-900"><Sparkles className="h-4 w-4 text-forest-700" aria-hidden="true" />{phase === "advice" ? "Personalized guidance" : "A few more details"}</h3>
      {(phase === "loading" || phase === "advice_loading") && <p className="mt-2 text-sm text-ink-500">{phase === "advice_loading" ? "Preparing your guidance…" : "Thinking of a follow-up…"}</p>}
      {turns.length > 0 && <ol className="mt-3 space-y-2" aria-label="Follow-up answers">{turns.map((turn, index) => <li key={`${index}-${turn.question}`} className="rounded-lg bg-cream-50 px-3 py-2 text-xs text-ink-600"><span className="font-medium">Q:</span> {turn.question}<br /><span className="font-medium">A:</span> {turn.answer}</li>)}</ol>}
      {phase === "question" && followUp && spec && <form className="mt-3 space-y-3" onSubmit={submitAnswer}>
        <p className="text-sm font-medium text-ink-800">Question {askedFacts.length + 1} of {MAX_ADAPTIVE_QUESTIONS}: {followUp.question}</p><p className="text-xs text-ink-500">{followUp.rationale}</p>
        {spec.kind === "boolean" && <label className="block text-sm text-ink-700">{spec.label}<select required value={rawAnswer} onChange={(event) => setRawAnswer(event.target.value)} className={selectClass}><option value="" disabled>Select an answer</option><option value="yes">Yes</option><option value="no">No</option><option value="not_sure">I’m not sure</option></select></label>}
        {spec.kind === "filingStatus" && <label className="block text-sm text-ink-700">{spec.label}<select required value={rawAnswer} onChange={(event) => setRawAnswer(event.target.value)} className={selectClass}><option value="" disabled>Select a filing status</option><option value="single">Single</option><option value="married_filing_jointly">Married filing jointly</option><option value="married_filing_separately">Married filing separately</option><option value="head_of_household">Head of household</option><option value="not_sure">I’m not sure</option></select></label>}
        {spec.kind === "number" && <><label className="block text-sm text-ink-700">{spec.label}{spec.unit === "dollars" ? " (dollars)" : ""}<input type="number" step={spec.unit === "dollars" ? "0.01" : "1"} value={rawAnswer === "not_sure" ? "" : rawAnswer} onChange={(event) => setRawAnswer(event.target.value)} className={selectClass} /></label><button type="button" onClick={() => setRawAnswer("not_sure")} className="text-xs text-forest-800 underline underline-offset-2">I’m not sure</button>{rawAnswer === "not_sure" && <span className="ml-2 text-xs text-ink-500">This fact will be skipped.</span>}</>}
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <div className="flex items-center justify-between"><span className="text-[11px] text-ink-500">{followUp.source === "gemini" ? "Generated by Gemini" : "Rule-based fallback"}</span><button type="submit" className="rounded-lg bg-forest-700 px-4 py-2 text-sm font-medium text-white hover:bg-forest-800">Submit answer</button></div>
      </form>}
      {phase === "error" && <div className="mt-3" role="alert"><p className="text-sm text-red-700">{error}</p><button type="button" onClick={() => void requestAdvice(facts)} className="mt-2 rounded-lg border border-ink-200 px-3 py-1.5 text-sm">Retry personalized advice</button></div>}
      {phase === "advice" && advice && <div className="mt-3 space-y-3"><p className="text-sm leading-relaxed text-ink-800">{advice.summary}</p>{advice.actions.length > 0 && <ul className="space-y-2">{advice.actions.map((action, index) => <li key={`${action.title}-${index}`} className="rounded-lg bg-cream-50 px-3 py-2 text-sm"><strong className="text-ink-900">{action.title}</strong><p className="mt-0.5 text-ink-700">{action.detail}</p></li>)}</ul>}{advice.caveats.length > 0 && <div className="border-t border-ink-100 pt-2 text-xs text-ink-500">{advice.caveats.map((caveat, index) => <p key={`${index}-${caveat}`}>{caveat}</p>)}</div>}</div>}
    </section>
  </div>;
}
