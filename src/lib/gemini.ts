const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Models tried in priority order for grapher & general AI tools
const GRAPHER_MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.7-flash"];
const NATIVE_MODELS = ["gemini-2.5-flash", "gemini-3.7-flash", "gemini-2.5-flash-lite", "gemini-3.6-flash"];

import fs from "node:fs";
import path from "node:path";

function readEnvKeysFromFile(): string[] {
  try {
    const envPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const lines = content.split("\n");
      const keys: string[] = [];
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("GEMINI_API_KEY")) {
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx !== -1) {
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, "");
            if (val) keys.push(val);
          }
        }
      }
      return keys;
    }
  } catch {
    // ignore
  }
  return [];
}

const DEFAULT_GEMINI_KEYS = [
  "AIzaSyAVLFEog7LQGCr6YkBbrVVEZ2-KkiJF9Do",
  "AQ.Ab8RN6LpsttZ06EuoK--l2odkccLPvKrWOBTsh210JRpVY-s5w",
  "AQ.Ab8RN6IebV4Rr2hPVeLPf4yhu0EmbS-oYGYHWbfGSxfHz0VXsw",
];

export function getGeminiKeys(): string[] {
  const fileKeys = readEnvKeysFromFile();
  const envKeys = [
    process.env.GEMINI_API_KEY_1,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_4,
    process.env.GEMINI_API_KEY_5,
    process.env.GEMINI_API_KEY,
  ].filter(Boolean) as string[];

  const combined = Array.from(new Set([...fileKeys, ...envKeys, ...DEFAULT_GEMINI_KEYS]));

  // Prioritize active working keys (e.g. AIza...) first
  combined.sort((a, b) => {
    if (a.startsWith("AIza") && !b.startsWith("AIza")) return -1;
    if (!a.startsWith("AIza") && b.startsWith("AIza")) return 1;
    return 0;
  });

  return combined;
}

export async function fetchGemini(body: Record<string, unknown>): Promise<Response> {
  const keys = getGeminiKeys();

  if (keys.length === 0) {
    throw new Error(
      "No AI API key found. Please configure GEMINI_API_KEY in your .env file.",
    );
  }

  const requestedModel = (body.model as string) || "gemini-3.5-flash-lite";
  const modelCandidates = Array.from(
    new Set([
      requestedModel,
      "gemini-3.5-flash-lite",
      "gemini-3.5-flash",
      "gemini-3.6-flash",
      "gemini-2.5-flash",
    ])
  );

  let lastError: unknown = null;

  for (const model of modelCandidates) {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
      const { seed, ...sanitizedBody } = body;
      const reqBody = { ...sanitizedBody, model };

      try {
        let resp = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reqBody),
        });

        if (resp.status === 429 || resp.status === 503) {
          const firstErrText = await resp.clone().text();
          // If quota permanently exceeded on this key, do not waste time retrying it
          if (!firstErrText.includes("exceeded your current quota")) {
            console.warn(`Gemini Direct (${model}) key index ${i + 1} got ${resp.status}. Retrying in 1s...`);
            await delay(1000);
            resp = await fetch(url, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${key}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(reqBody),
            });
          }
        }

        if (resp.ok) {
          return resp; // Return the successful response
        }

        const status = resp.status;
        const text = await resp.text();
        console.warn(`Gemini Direct request (${model}) key index ${i + 1} failed: status=${status}, body=${text.slice(0, 150)}`);
        lastError = { status, text };
      } catch (e) {
        console.error(`Gemini request (${model}) key index ${i + 1} threw network error:`, e);
        lastError = e;
      }
    }
  }

  // All keys and model candidates failed
  const lastErrorObj = lastError as Record<string, unknown> | null;
  const errMsg =
    lastErrorObj && typeof lastErrorObj === "object" && "text" in lastErrorObj
      ? String(lastErrorObj.text)
      : lastError instanceof Error
        ? lastError.message
        : "All Gemini API keys failed.";
  const errStatus =
    lastErrorObj && typeof lastErrorObj === "object" && "status" in lastErrorObj
      ? Number(lastErrorObj.status)
      : 500;

  return new Response(
    JSON.stringify({ error: `All keys failed. Status ${errStatus}: ${errMsg}` }),
    {
      status: errStatus,
      headers: { "Content-Type": "application/json" },
    },
  );
}

/**
 * Specialized fetch for the grapher tool: tries fast models in sequence
 * to find one that is available and returns quickly.
 */
export async function fetchGeminiForGrapher(
  body: Record<string, unknown>
): Promise<Response> {
  const keys = getGeminiKeys();

  if (keys.length === 0) {
    throw new Error("No AI API key found.");
  }

  const url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

  for (const model of GRAPHER_MODELS) {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const { seed, ...sanitizedBody } = body;
      const reqBody = { ...sanitizedBody, model };
      try {
        let resp = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify(reqBody),
        });

        if (resp.status === 429 || resp.status === 503) {
          console.warn(`[grapher] model=${model} key=${i + 1} got ${resp.status}, retrying after 1s...`);
          await delay(1000);
          resp = await fetch(url, {
            method: "POST",
            headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
            body: JSON.stringify(reqBody),
          });
        }

        if (resp.ok) {
          return resp;
        }

        const status = resp.status;
        if (status === 503 || status === 404) break;
      } catch (e) {
        console.error(`[grapher] model=${model} key=${i + 1} network error:`, e);
      }
    }
  }

  return new Response(
    JSON.stringify({ error: "All grapher models/keys failed." }),
    { status: 503, headers: { "Content-Type": "application/json" } },
  );
}

export async function fetchGeminiNative(body: Record<string, unknown>): Promise<Response> {
  const keys = getGeminiKeys();

  if (keys.length === 0) {
    throw new Error(
      "No AI API key found. Please configure GEMINI_API_KEY in your .env file.",
    );
  }

  let lastError: unknown = null;

  for (const model of NATIVE_MODELS) {
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

      try {
        let resp = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        });

        if (resp.status === 429 || resp.status === 503) {
          console.warn(`Gemini Native (${model}) key index ${i + 1} failed with ${resp.status}. Retrying in 1.5s...`);
          await delay(1500);
          resp = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
          });
        }

        if (resp.ok) {
          return resp; // Return the successful response
        }

        const status = resp.status;
        const text = await resp.text();
        console.warn(`Gemini Native (${model}) key index ${i + 1} failed: status=${status}, body=${text.slice(0, 150)}`);
        lastError = { status, text };

        // If 503 or 404, immediately try next model
        if (status === 503 || status === 404) {
          break;
        }
      } catch (e) {
        console.error(`Gemini Native (${model}) key index ${i + 1} network error:`, e);
        lastError = e;
      }
    }
  }

  // All keys & models failed
  const lastErrorObj = lastError as Record<string, unknown> | null;
  const errMsg =
    lastErrorObj && typeof lastErrorObj === "object" && "text" in lastErrorObj
      ? String(lastErrorObj.text)
      : lastError instanceof Error
        ? lastError.message
        : "All Gemini API keys failed.";
  const errStatus =
    lastErrorObj && typeof lastErrorObj === "object" && "status" in lastErrorObj
      ? Number(lastErrorObj.status)
      : 500;

  return new Response(
    JSON.stringify({ error: `All keys failed. Status ${errStatus}: ${errMsg}` }),
    {
      status: errStatus,
      headers: { "Content-Type": "application/json" },
    },
  );
}

