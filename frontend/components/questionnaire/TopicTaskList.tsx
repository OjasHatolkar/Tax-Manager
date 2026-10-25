"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, HelpCircle } from "lucide-react";
import { useAuthProfile } from "@/lib/auth/useAuthProfile";
import { readUserTasks, writeUserTasks, type UserTask } from "@/lib/tasks/storage";
import type { TopicEvaluation } from "@/lib/rules/types";

interface TopicTaskListProps {
  evaluations: TopicEvaluation[];
  resolvedTopics: number;
  taxYear: number;
}

const STATUS_STYLES: Record<TopicEvaluation["status"], { icon: typeof CheckCircle2; label: string; className: string }> = {
  may_apply: { icon: CheckCircle2, label: "May be worth investigating", className: "border-forest-300 bg-forest-50 text-forest-900" },
  needs_info: { icon: HelpCircle, label: "Needs more information", className: "border-amber-300 bg-amber-50 text-amber-900" },
  does_not_apply: { icon: AlertCircle, label: "Likely does not apply", className: "border-ink-200 bg-cream-100 text-ink-500" },
};

export default function TopicTaskList({ evaluations, resolvedTopics, taxYear }: TopicTaskListProps) {
  const { profile, loading } = useAuthProfile();
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggleSelected(topicId: string) {
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
    setMessage(null);
  }

  function createTasks() {
    if (!profile?.sub || selected.size === 0) return;
    try {
      const existing: UserTask[] = readUserTasks(profile.sub, window.localStorage);
      const now = new Date().toISOString();
      const newTasks = evaluations.filter(({ topicId }) => selected.has(topicId)).map((evaluation): UserTask => ({
        id: window.crypto.randomUUID(),
        topicId: evaluation.topicId,
        title: evaluation.title,
        summary: evaluation.summary,
        taxYear,
        status: "incomplete",
        createdAt: now,
        citations: evaluation.citations,
      }));
      writeUserTasks(profile.sub, [...newTasks, ...existing], window.localStorage);
      setSelected(new Set());
      setMessage(`${newTasks.length} ${newTasks.length === 1 ? "task was" : "tasks were"} added to My Tasks.`);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save tasks in this browser.");
    }
  }

  return <section>
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div><h3 className="text-sm font-semibold text-ink-900">Topics evaluated ({resolvedTopics} of {evaluations.length} resolved)</h3><p className="mt-1 text-xs text-ink-600">Save any topic as a task to follow up on later.</p></div>
      {profile?.sub && <Link href="/tasks" className="text-sm font-medium text-forest-800 underline underline-offset-2">View My Tasks</Link>}
    </div>
    <ul className="mt-3 space-y-2.5">
      {evaluations.map((evaluation) => {
        const style = STATUS_STYLES[evaluation.status];
        const Icon = style.icon;
        return <li key={evaluation.topicId} className={`rounded-xl border px-4 py-3 text-sm ${style.className}`}>
          <div className="flex flex-wrap items-center gap-2 font-medium"><Icon className="h-4 w-4 shrink-0" aria-hidden="true" /><span>{evaluation.title}</span><span className="ml-auto text-xs font-normal opacity-80">{style.label}</span></div>
          <p className="mt-1 text-xs leading-relaxed opacity-90">{evaluation.summary}</p>
          {evaluation.citations[0] && <a href={evaluation.citations[0].url} target="_blank" rel="noreferrer" className="mt-1.5 inline-block text-xs font-medium underline underline-offset-2">{evaluation.citations[0].label}</a>}
          {profile?.sub && <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 text-xs font-medium"><input type="checkbox" aria-label={`Add ${evaluation.title} to My Tasks`} checked={selected.has(evaluation.topicId)} onChange={() => toggleSelected(evaluation.topicId)} className="h-4 w-4 accent-forest-800" />Add to My Tasks</label>}
        </li>;
      })}
    </ul>
    {loading && <p className="mt-3 text-xs text-ink-500">Checking sign-in to enable task creation…</p>}
    {!loading && !profile?.sub && <p className="mt-3 text-xs text-ink-600"><Link className="font-medium text-forest-800 underline underline-offset-2" href="/auth/login?returnTo=%2Fassessment">Sign in</Link> to select topics and save them as tasks.</p>}
    {profile?.sub && selected.size > 0 && <button type="button" onClick={createTasks} className="mt-4 rounded-full bg-forest-800 px-4 py-2 text-sm font-medium text-white hover:bg-forest-700">Create {selected.size} {selected.size === 1 ? "task" : "tasks"}</button>}
    {message && <p role="status" className="mt-3 text-sm text-forest-800">{message} <Link className="font-medium underline underline-offset-2" href="/tasks">View tasks</Link></p>}
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  </section>;
}
