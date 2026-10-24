/**
 * Minimal, dependency-free test runner.
 *
 * The project has no test framework installed yet (kept deliberately light
 * for the hackathon). Run with:
 *   npx ts-node lib/rules/__tests__/scenarios.test.ts
 * Once the team adds Jest/Vitest, these `test()`/`expect()` calls can be
 * swapped for the real thing with minimal changes — the assertions
 * themselves don't need to change.
 */

// Minimal ambient declaration so this file has no dependency on @types/node
// (not installed in every environment this test may run in).
declare const process: { exit: (code: number) => void };

let passCount = 0;
let failCount = 0;

export function test(name: string, fn: () => void): void {
  try {
    fn();
    passCount++;
    console.log(`  \u2713 ${name}`);
  } catch (err) {
    failCount++;
    console.error(`  \u2717 ${name}`);
    console.error(`    ${(err as Error).message}`);
  }
}

export function expect<T>(actual: T) {
  return {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toContain(expected: unknown) {
      if (!Array.isArray(actual) || !actual.includes(expected)) {
        throw new Error(`Expected array to contain ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toHaveLength(expected: number) {
      const len = (actual as unknown as { length: number }).length;
      if (len !== expected) {
        throw new Error(`Expected length ${expected}, got ${len}`);
      }
    },
  };
}

export function printSummary(): void {
  console.log(`\n${passCount} passed, ${failCount} failed`);
  if (failCount > 0) process.exit(1);
}
