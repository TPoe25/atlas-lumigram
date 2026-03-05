import {
    addDoc,
    collection,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";
import { db } from "../firebase";
import type { NewWorkoutLog, WorkoutLog } from "./logTypes";

export async function addWorkoutLog(log: NewWorkoutLog) {
    // logs stored in: workouts/{uid}/logs
    const colRef = collection(db, "workouts", log.uid, "logs");
    const docRef = await addDoc(colRef, {
        ...log,
        exerciseNameLower: log.exerciseName.toLowerCase(),
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function getWorkoutLogsForUser(uid: string, take = 50): Promise<WorkoutLog[]> {
    const colRef = collection(db, "workouts", uid, "logs");
    const qy = query(colRef, orderBy("createdAt", "desc"), limit(take));
    const snap = await getDocs(qy);

    return snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
    })) as WorkoutLog[];
}

// Simple prefix search (exercise name) for a specific user's logs
export async function searchWorkoutLogsForUser(uid: string, text: string, take = 20) {
    const t = text.trim().toLowerCase();
    if (!t) return [];

    const start = t;
    const end = t + "\uf8ff";

    const colRef = collection(db, "workouts", uid, "logs");
    const qy = query(
        colRef,
        where("exerciseNameLower", ">=", start),
        where("exerciseNameLower", "<=", end),
        orderBy("exerciseNameLower"),
        limit(take)
    );

    const snap = await getDocs(qy);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as WorkoutLog[];
}
