"use client";

import { useEffect, useState } from "react";

type Stats = {
  requests: number;
  successes: number;
  failures: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  averageDurationMs: number;
  lastCallAt: string | null;
  lastErrorStatus: number | null;
};

type Snapshot = {
  startedAt: string;
  capturedAt: string;
  total: Omit<Stats, "averageDurationMs" | "lastCallAt" | "lastErrorStatus">;
  endpoints: Record<string, Stats>;
};

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-forest-100 bg-white p-4 shadow-sm">
      <dt className="text-sm text-ink-600">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold tabular-nums text-ink-900">{value}</dd>
    </div>
  );
}

export default function HealthDashboard() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const response = await fetch("/api/health", { cache: "no-store" });
        const data = await response.json();
        if (response.status === 401) throw new Error("AUTH_REQUIRED");
        if (!response.ok) throw new Error(data.error || `Health request failed (${response.status})`);
        if (active) {
          setSnapshot(data as Snapshot);
          setError(null);
          setUpdatedAt(new Date().toISOString());
        }
      } catch (reason) {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load health metrics");
      }
    };
    void refresh();
    const interval = window.setInterval(refresh, 30_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <main className="min-h-screen bg-cream-100 px-4 py-10 text-ink-900 sm:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wider text-forest-700">Operations</p>
          <h1 className="mt-2 text-3xl font-semibold">Service health</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-600">
            Aggregate Gemini API request counts, token usage, failures, and latency for this server process.
            These counters reset on restart and are not shared across server instances.
          </p>
        </header>

        {error && (
          <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            {error === "AUTH_REQUIRED" ? (
              <>
                Sign in through Auth0 to view aggregate telemetry. Any authenticated account can access this page. {" "}
                <a className="font-semibold underline" href="/auth/login?returnTo=%2Fhealth">Sign in</a>
              </>
            ) : error}
          </div>
        )}

        {snapshot && (
          <>
            <section aria-labelledby="usage-heading">
              <h2 id="usage-heading" className="mb-3 text-lg font-semibold">Gemini usage since process start</h2>
              <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Metric label="Requests" value={snapshot.total.requests.toLocaleString()} />
                <Metric label="Successful API calls" value={snapshot.total.successes.toLocaleString()} />
                <Metric label="Failed API calls" value={snapshot.total.failures.toLocaleString()} />
                <Metric label="Input tokens" value={snapshot.total.inputTokens.toLocaleString()} />
                <Metric label="Output tokens" value={snapshot.total.outputTokens.toLocaleString()} />
                <Metric label="Total tokens" value={snapshot.total.totalTokens.toLocaleString()} />
              </dl>
              <p className="mt-3 text-xs text-ink-600">
                Token counts come from Gemini response usage metadata. This is not a billing balance or a dollar-cost estimate;
                check Google AI Studio or Cloud billing for authoritative credits and charges.
              </p>
            </section>

            <section aria-labelledby="routes-heading">
              <h2 id="routes-heading" className="mb-3 text-lg font-semibold">By endpoint</h2>
              <div className="overflow-x-auto rounded-xl border border-forest-100 bg-white">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-cream-200 text-ink-700">
                    <tr>{["Endpoint", "Requests", "Failures", "Input tokens", "Output tokens", "Avg latency"].map((heading) => <th key={heading} className="px-4 py-3 font-medium">{heading}</th>)}</tr>
                  </thead>
                  <tbody>
                    {Object.entries(snapshot.endpoints).map(([name, stats]) => (
                      <tr key={name} className="border-t border-forest-100">
                        <th scope="row" className="px-4 py-3 font-medium">{name}</th>
                        <td className="px-4 py-3 tabular-nums">{stats.requests}</td>
                        <td className="px-4 py-3 tabular-nums">{stats.failures}</td>
                        <td className="px-4 py-3 tabular-nums">{stats.inputTokens.toLocaleString()}</td>
                        <td className="px-4 py-3 tabular-nums">{stats.outputTokens.toLocaleString()}</td>
                        <td className="px-4 py-3 tabular-nums">{stats.averageDurationMs} ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <p className="text-xs text-ink-500">
              Process started {new Date(snapshot.startedAt).toLocaleString()}. Last refreshed {updatedAt ? new Date(updatedAt).toLocaleTimeString() : "—"}.
              These process-local metrics are useful for development and single-instance monitoring; use shared storage for production totals.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
