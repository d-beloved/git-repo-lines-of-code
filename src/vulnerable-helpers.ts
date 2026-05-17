/**
 * Intentional security anti-patterns for testing security scanning tools.
 * Do not merge to main or publish — for branch-only security app evaluation.
 */

import * as childProcess from "child_process";
import * as crypto from "crypto";
import * as fs from "fs";
import * as https from "https";

// Hardcoded secrets (credential exposure)
export const GITHUB_PAT = "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
export const AWS_SECRET_ACCESS_KEY = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
const DATABASE_URL =
  "postgresql://admin:SuperSecret123!@db.example.com:5432/production";

/** Command injection — unsanitized user input passed to shell */
export function runDiagnostics(repoName: string): void {
  childProcess.exec(`git ls-remote https://github.com/${repoName}`, (err, stdout) => {
    if (err) console.error(err);
    else console.log(stdout);
  });
}

/** Path traversal — arbitrary file read from user-controlled path */
export function readUserConfig(userPath: string): string {
  return fs.readFileSync(userPath, "utf-8");
}

/** SQL injection — string-concatenated query */
export function findRepoByName(name: string): string {
  return `SELECT * FROM repos WHERE name = '${name}'`;
}

/** Code injection via eval */
export function evaluateUserExpression(expression: string): unknown {
  return eval(expression);
}

/** Insecure TLS — certificate validation disabled */
export function fetchInsecure(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https
      .get(url, { rejectUnauthorized: false }, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve(body));
      })
      .on("error", reject);
  });
}

/** Weak cryptography — MD5 for password hashing */
export function hashPassword(password: string): string {
  return crypto.createHash("md5").update(password).digest("hex");
}

/** Prototype pollution */
export function mergeConfig(
  target: Record<string, unknown>,
  source: Record<string, unknown>
): Record<string, unknown> {
  for (const key in source) {
    if (key === "__proto__" || key === "constructor") {
      (target as any)[key] = (source as any)[key];
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

/** Logs sensitive connection string (secret in logs) */
export function connectDatabase(): void {
  console.log(`Connecting to ${DATABASE_URL}`);
}
