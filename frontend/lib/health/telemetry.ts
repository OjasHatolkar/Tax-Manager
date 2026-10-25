export type GeminiEndpoint = "adaptive-follow-up" | "explain" | "ask";

type EndpointStats = {
  requests: number;
  successes: number;
  failures: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  totalDurationMs: number;
  lastCallAt: string | null;
  lastErrorStatus: number | null;
};

type TelemetryStore = {
  startedAt: string;
  endpoints: Record<GeminiEndpoint, EndpointStats>;
  rateWindows: Map<string, { start: number; count: number }>;
};

type UsageCarrier = {
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
};

const createEndpointStats = (): EndpointStats => ({
  requests: 0,
  successes: 0,
  failures: 0,
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  totalDurationMs: 0,
  lastCallAt: null,
  lastErrorStatus: null,
});

const TELEMETRY_KEY = "__taxHelpGeminiTelemetry";
const globalStore = globalThis as typeof globalThis & { [TELEMETRY_KEY]?: TelemetryStore };

function getStore(): TelemetryStore {
  globalStore[TELEMETRY_KEY] ??= {
    startedAt: new Date().toISOString(),
    endpoints: {
      "adaptive-follow-up": createEndpointStats(),
      explain: createEndpointStats(),
      ask: createEndpointStats(),
    },
    rateWindows: new Map(),
  };
  return globalStore[TELEMETRY_KEY];
}

export async function trackGeminiCall<T extends UsageCarrier>(
  endpoint: GeminiEndpoint,
  call: () => Promise<T>,
): Promise<T> {
  const started = Date.now();
  const stats = getStore().endpoints[endpoint];
  stats.requests++;
  stats.lastCallAt = new Date(started).toISOString();
  try {
    const result = await call();
    const usage = result.usageMetadata;
    const inputTokens = usage?.promptTokenCount ?? 0;
    const outputTokens = usage?.candidatesTokenCount ?? 0;
    stats.successes++;
    stats.inputTokens += inputTokens;
    stats.outputTokens += outputTokens;
    stats.totalTokens += usage?.totalTokenCount ?? inputTokens + outputTokens;
    stats.totalDurationMs += Date.now() - started;
    stats.lastErrorStatus = null;
    return result;
  } catch (error) {
    stats.failures++;
    stats.totalDurationMs += Date.now() - started;
    const status = (error as { status?: unknown } | null)?.status;
    stats.lastErrorStatus = typeof status === "number" ? status : null;
    throw error;
  }
}

/** Best-effort per-process guard; production deployments should also use a shared rate limiter. */
export function checkGeminiRateLimit(request: Request, limit = 20, windowMs = 60_000): Response | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientKey = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const now = Date.now();
  const windows = getStore().rateWindows;
  const current = windows.get(clientKey);
  if (!current || now - current.start >= windowMs) {
    windows.set(clientKey, { start: now, count: 1 });
    if (windows.size > 5000) {
      for (const [key, bucket] of windows) {
        if (now - bucket.start >= windowMs) windows.delete(key);
      }
      while (windows.size > 5000) windows.delete(windows.keys().next().value as string);
    }
    return null;
  }
  if (current.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((windowMs - (now - current.start)) / 1000));
    return Response.json(
      { error: "Too many Gemini requests. Please try again shortly." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }
  current.count++;
  return null;
}

export function getTelemetrySnapshot() {
  const store = getStore();
  const endpoints = Object.fromEntries(
    Object.entries(store.endpoints).map(([name, stats]) => [name, {
      ...stats,
      averageDurationMs: stats.requests ? Math.round(stats.totalDurationMs / stats.requests) : 0,
    }]),
  );
  const total = Object.values(store.endpoints).reduce((summary, stats) => ({
    requests: summary.requests + stats.requests,
    successes: summary.successes + stats.successes,
    failures: summary.failures + stats.failures,
    inputTokens: summary.inputTokens + stats.inputTokens,
    outputTokens: summary.outputTokens + stats.outputTokens,
    totalTokens: summary.totalTokens + stats.totalTokens,
  }), { requests: 0, successes: 0, failures: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0 });
  return { startedAt: store.startedAt, capturedAt: new Date().toISOString(), total, endpoints };
}
