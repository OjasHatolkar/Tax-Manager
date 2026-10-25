import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function findTypeScriptFile(basePath) {
  for (const candidate of [basePath, `${basePath}.ts`, `${basePath}.tsx`, `${basePath}.js`, `${basePath}.jsx`,
    path.join(basePath, "index.ts"), path.join(basePath, "index.tsx")]) {
    try {
      if ((await fs.stat(candidate)).isFile()) return candidate;
    } catch {
      // Keep looking through the supported TypeScript and JavaScript extensions.
    }
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("next/")) {
    const nextEntry = path.join(projectRoot, "node_modules", `${specifier}.js`);
    try {
      if ((await fs.stat(nextEntry)).isFile()) {
        return { url: pathToFileURL(nextEntry).href, shortCircuit: true };
      }
    } catch {
      // Continue through the normal Node resolver for package export paths.
    }
  }
  const parentPath = context.parentURL?.startsWith("file:")
    ? path.dirname(fileURLToPath(context.parentURL))
    : projectRoot;
  const basePath = specifier.startsWith("@/")
    ? path.join(projectRoot, specifier.slice(2))
    : specifier.startsWith(".")
      ? path.resolve(parentPath, specifier)
      : null;

  if (basePath) {
    const resolved = await findTypeScriptFile(basePath);
    if (resolved) return { url: pathToFileURL(resolved).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (!url.startsWith("file:") || !/\.(?:ts|tsx)$/.test(url)) return nextLoad(url, context);
  const filename = fileURLToPath(url);
  const source = await fs.readFile(filename, "utf8");
  const output = ts.transpile(source, {
    fileName: filename,
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
    jsx: ts.JsxEmit.ReactJSX,
    esModuleInterop: true,
  });
  return { format: "module", source: output, shortCircuit: true };
}
