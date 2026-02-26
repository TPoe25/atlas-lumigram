import type { ApiNinjasExercise, WorkoutResult } from "./types";

const API_KEY = process.env.EXPO_PUBLIC_API_NINJAS_KEY;

type SearchArgs = {
    name?: string;
    type?: string;
    muscle?: string;
    difficulty?: string;
    equipments?: string; // comma separated
};

export async function searchApiNinjas(args: SearchArgs, signal?: AbortSignal): Promise<WorkoutResult[]> {
    if (!API_KEY) return [];

    const params = new URLSearchParams();
    if (args.name) params.set("name", args.name);
    if (args.type) params.set("type", args.type);
    if (args.muscle) params.set("muscle", args.muscle);
    if (args.difficulty) params.set("difficulty", args.difficulty);
    if (args.equipments) params.set("equipments", args.equipments);

    const url = `https://api.api-ninjas.com/v1/exercises?${params.toString()}`;

    const res = await fetch(url, {
        headers: { "X-Api-Key": API_KEY },
        signal,
    });

    if (!res.ok) return [];

    const data = (await res.json()) as ApiNinjasExercise[];

    // API returns up to 5 unless you paginate/premium; keep stable ids
    return data.map((x) => ({
        id: `api-${x.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: x.name,
        type: x.type,
        muscle: x.muscle,
        difficulty: x.difficulty,
        equipments: x.equipments,
        equipment: x.equipments?.[0] ?? undefined,
        instructions: x.instructions,
        safety_info: x.safety_info,
        source: "api",
    }));
}
