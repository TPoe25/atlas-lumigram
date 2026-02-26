import type { ApiNinjasExercise, WorkoutResult } from "./types";

export async function searchExercises(query: string): Promise<WorkoutResult[]> {
  const API_KEY = process.env.EXPO_PUBLIC_API_NINJAS_KEY;
  if (!API_KEY) throw new Error("Missing EXPO_PUBLIC_API_NINJAS_KEY");

  const q = query.trim();
  if (!q) return [];

  const url = `https://api.api-ninjas.com/v1/exercises?name=${encodeURIComponent(q)}`;

  const res = await fetch(url, {
    headers: { "X-Api-Key": API_KEY },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text || "Unknown error"}`);
  }

  const data = (await res.json()) as ApiNinjasExercise[];

  return data.map((x) => ({
    ...x,
    id: `${x.name}-${x.muscle}-${x.type}-${x.difficulty}`.replace(/\s+/g, "-").toLowerCase(),
  }));
}
