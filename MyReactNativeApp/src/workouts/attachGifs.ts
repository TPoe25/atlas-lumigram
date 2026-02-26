import type { WorkoutResult } from "./types";

export function attachGifUrls(
    apiResults: WorkoutResult[],
    db: { name: string; gifUrl: string }[]
) {
    return apiResults.map((exercise) => {
        const match = db.find((e) =>
            exercise.name.toLowerCase().includes(e.name.toLowerCase())
        );

        return {
            ...exercise,
            gifUrl: match?.gifUrl ?? "",
        };
    });
}
