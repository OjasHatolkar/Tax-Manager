"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import { useAuthProfile } from "@/lib/auth/useAuthProfile";
import { deleteUserTask, readUserTasks, toggleUserTask, writeUserTasks, type UserTask } from "@/lib/tasks/storage";

const EMPTY_TASKS: UserTask[] = [];

export default function TaskDashboard() {
  const { profile, loading: profileLoading } = useAuthProfile();
  const [taskState, setTaskState] = useState<{ userId: string; tasks: UserTask[]; error: string | null } | null>(null);
  const activeState = profile?.sub && taskState?.userId === profile.sub ? taskState : null;
  const tasks = activeState?.tasks ?? EMPTY_TASKS;
  const error = activeState?.error ?? null;

  useEffect(() => {
    if (!profile?.sub) return;
    let loadedTasks: UserTask[] = [];
    let loadError: string | null = null;
    try {
      loadedTasks = readUserTasks(profile.sub, window.localStorage);
    } catch {
      loadError = "Tasks could not be loaded from this browser.";
    }
    // localStorage is the persistence boundary; load it when Auth0 resolves this profile.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTaskState({ userId: profile.sub, tasks: loadedTasks, error: loadError });
  }, [profile?.sub]);

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
    [tasks],
  );
  const incompleteCount = tasks.filter((task) => task.status === "incomplete").length;

  function save(next: UserTask[]) {
    if (!profile?.sub) return;
    try {
      writeUserTasks(profile.sub, next, window.localStorage);
      setTaskState({ userId: profile.sub, tasks: next, error: null });
    } catch {
      setTaskState({ userId: profile.sub, tasks, error: "Your browser could not save this change. Check that local storage is available." });
    }
  }

  if (profileLoading) {
    return <p className="mt-8 text-center text-sm text-ink-600">Checking your sign-in…</p>;
  }

  if (!profile?.sub) {
    return <section className="mx-auto mt-8 max-w-xl rounded-2xl border border-forest-100 bg-white p-8 text-center shadow-card">
      <h1 className="text-2xl font-semibold text-ink-900">Your tasks</h1>
      <p className="mt-3 text-sm text-ink-600">Sign in to view and manage tasks saved under your profile.</p>
      <Link href="/auth/login?returnTo=%2Ftasks" className="mt-5 inline-flex rounded-full bg-forest-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-700">Sign in</Link>
    </section>;
  }

  return <div className="mx-auto mt-8 max-w-3xl space-y-6">
    <section className="rounded-2xl border border-forest-100 bg-white p-6 shadow-card sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-sm font-medium text-forest-800">My Tasks</p><h1 className="mt-1 text-3xl font-semibold tracking-tight text-ink-900">Tax topics to follow up on</h1><p className="mt-2 text-sm text-ink-600">{incompleteCount} open {incompleteCount === 1 ? "task" : "tasks"} · {tasks.length - incompleteCount} completed</p></div>
        <Link href="/assessment" className="text-sm font-medium text-forest-800 underline underline-offset-4">Back to assessment</Link>
      </div>
    </section>

    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-900">Tasks are saved in this browser under your signed-in profile, so they remain available after you sign out and back in here. They are not synced across browsers or devices.</p>
    {error && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

    {sortedTasks.length === 0 ? <section className="rounded-2xl border border-dashed border-forest-200 bg-white px-6 py-12 text-center">
      <h2 className="text-lg font-semibold text-ink-900">No tasks yet</h2>
      <p className="mt-2 text-sm text-ink-600">From your assessment results, choose the tax topics you want to follow up on.</p>
      <Link href="/assessment" className="mt-5 inline-flex rounded-full bg-forest-800 px-5 py-2.5 text-sm font-medium text-white hover:bg-forest-700">Go to assessment</Link>
    </section> : <section aria-label="Saved tasks" className="space-y-3">
      {sortedTasks.map((task) => <article key={task.id} className={`rounded-xl border bg-white p-5 shadow-sm ${task.status === "complete" ? "border-forest-100 opacity-80" : "border-forest-200"}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1"><p className="text-xs font-medium uppercase tracking-wide text-forest-800">{task.taxYear} tax year · {new Date(task.createdAt).toLocaleDateString()}</p><h2 className={`mt-1 text-lg font-semibold text-ink-900 ${task.status === "complete" ? "line-through decoration-ink-400" : ""}`}>{task.title}</h2><p className="mt-2 text-sm leading-relaxed text-ink-700">{task.summary}</p></div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" aria-pressed={task.status === "complete"} onClick={() => save(toggleUserTask(tasks, task.id))} className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 px-3 py-2 text-xs font-medium text-forest-900 hover:bg-forest-50">{task.status === "complete" ? <><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Mark incomplete</> : <><Circle className="h-4 w-4" aria-hidden="true" />Mark complete</>}</button>
            <button type="button" aria-label={`Delete ${task.title} task`} onClick={() => save(deleteUserTask(tasks, task.id))} className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
          </div>
        </div>
        {task.citations.length > 0 && <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">{task.citations.map((citation) => <li key={`${citation.url}-${citation.label}`}><a href={citation.url} target="_blank" rel="noreferrer" className="text-xs font-medium text-forest-800 underline underline-offset-2">{citation.label}</a></li>)}</ul>}
      </article>)}
    </section>}
  </div>;
}
