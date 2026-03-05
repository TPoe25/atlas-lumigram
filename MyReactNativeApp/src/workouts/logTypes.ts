export type WorkoutLog = {
    id: string;
    uid: string;
    exerciseName: string;
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
    createdAt?: any; // Firestore Timestamp
};

export type NewWorkoutLog = Omit<WorkoutLog, "id" | "createdAt">;
