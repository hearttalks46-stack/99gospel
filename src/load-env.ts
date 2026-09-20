import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));

function readEnvText(full: string): string {
  const buf = readFileSync(full);
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return buf.subarray(2).toString("utf16le");
  }
  let text = buf.toString("utf8");
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1);
  }
  return text;
}

export function parseEnvText(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const rawLine of text.split(/\r?\n/)) {
    let line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    if (line.startsWith("export ")) {
      line = line.slice(7).trim();
    }
    const eq = line.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

export function findEnvFiles(
  startDir = process.cwd(),
  options: { stopAt?: string } = {},
): string[] {
  const files: string[] = [];
  const seen = new Set<string>();
  let dir = resolve(startDir);
  const stopAt = options.stopAt ? resolve(options.stopAt) : undefined;

  const push = (candidate: string) => {
    const full = resolve(candidate);
    if (!seen.has(full) && existsSync(full)) {
      seen.add(full);
      files.push(full);
    }
  };

  for (let i = 0; i < 8; i++) {
    push(join(dir, ".env"));
    push(join(dir, ".env.local"));
    if (stopAt && dir === stopAt) {
      break;
    }
    const parent = resolve(dir, "..");
    if (parent === dir) {
      break;
    }
    dir = parent;
  }

  if (!stopAt) {
    push(join(packageRoot, ".env"));
    push(join(dirname(packageRoot), ".env"));
  }
  return files;
}

/** Load `.env` files from this folder and parent folders (VS Code often edits the workspace root `.env`). */
export function loadDotEnv(
  filePath?: string,
  startDir = process.cwd(),
  options: { stopAt?: string } = {},
): string[] {
  const files = filePath
    ? [resolve(filePath)]
    : findEnvFiles(startDir, options).slice().reverse();
  const loaded: string[] = [];

  for (const full of files) {
    if (!existsSync(full)) {
      continue;
    }
    loaded.push(full);
    const parsed = parseEnvText(readEnvText(full));
    for (const [key, value] of Object.entries(parsed)) {
      const current = process.env[key];
      if ((current === undefined || current.trim() === "") && value.trim()) {
        process.env[key] = value;
      }
    }
  }

  return loaded;
}

export function envKeyNames(): string[] {
  return ["EMAIL_FROM", "EMAIL_TO", "SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"].filter(
    (key) => Boolean(process.env[key]?.trim()),
  );
}
