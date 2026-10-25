import type { TopicEvaluation } from "@/lib/rules/types";

export type UserTask = {
  id: string;
  topicId: string;
  title: string;
  summary: string;
  taxYear: number;
  status: "incomplete" | "complete";
  createdAt: string;
  citations: TopicEvaluation["citations"];
};

type StorageLike = Pick<Storage, "getItem" | "setItem">;
const MAX_USER_TASKS = 500;

export function getUserTasksStorageKey(userId: string): string {
  return `taxhelp.tasks.v1.user.${encodeURIComponent(userId)}`;
}

function isUserTask(value: unknown): value is UserTask {
  if (!value || typeof value !== "object") return false;
  const task = value as Partial<UserTask>;
  return typeof task.id === "string" && typeof task.topicId === "string" &&
    typeof task.title === "string" && typeof task.summary === "string" &&
    typeof task.taxYear === "number" && Number.isInteger(task.taxYear) &&
    (task.status === "incomplete" || task.status === "complete") &&
    typeof task.createdAt === "string" && Number.isFinite(Date.parse(task.createdAt)) &&
    Array.isArray(task.citations) && task.citations.every((citation) =>
      citation && typeof citation.label === "string" && typeof citation.url === "string");
}

export function readUserTasks(userId: string, storage: StorageLike): UserTask[] {
  try {
    const serialized = storage.getItem(getUserTasksStorageKey(userId));
    if (!serialized) return [];
    const parsed: unknown = JSON.parse(serialized);
    return Array.isArray(parsed) ? parsed.filter(isUserTask).slice(0, MAX_USER_TASKS) : [];
  } catch {
    return [];
  }
}

export function writeUserTasks(userId: string, tasks: UserTask[], storage: StorageLike): void {
  if (tasks.length > MAX_USER_TASKS) throw new Error(`A maximum of ${MAX_USER_TASKS} tasks can be saved.`);
  storage.setItem(getUserTasksStorageKey(userId), JSON.stringify(tasks));
}

export function toggleUserTask(tasks: UserTask[], taskId: string): UserTask[] {
  return tasks.map((task) => task.id === taskId
    ? { ...task, status: task.status === "complete" ? "incomplete" : "complete" }
    : task);
}

export function deleteUserTask(tasks: UserTask[], taskId: string): UserTask[] {
  return tasks.filter((task) => task.id !== taskId);
}
