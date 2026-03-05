import {
    addDoc,
    collection,
    CollectionReference,
    DocumentData,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";
import { db } from "../firebase";
import type { NewWorkoutLog, WorkoutLog } from "./logTypes";

function isPermissionDenied(error: any) {
    return error?.code === "permission-denied" || error?.code === "firestore/permission-denied";
}

async function addWorkoutLogToCollection(
    colRef: CollectionReference<DocumentData>,
    log: NewWorkoutLog
) {
    return await addDoc(colRef, {
        ...log,
        exerciseNameLower: log.exerciseName.toLowerCase(),
        createdAt: serverTimestamp(),
    });
}

export async function addWorkoutLog(log: NewWorkoutLog) {
    // Primary path
    try {
        const docRef = await addWorkoutLogToCollection(collection(db, "workouts", log.uid, "logs"), log);
        return docRef.id;
    } catch (e) {
        if (!isPermissionDenied(e)) throw e;
    }

    // Fallback for environments still using older deployed rules.
    const fallbackRef = await addWorkoutLogToCollection(collection(db, "users", log.uid, "logs"), log);
    return fallbackRef.id;
}

export async function getWorkoutLogsForUser(uid: string, take = 50): Promise<WorkoutLog[]> {
    const paths: Array<[string, string, string]> = [
        ["workouts", uid, "logs"],
        ["users", uid, "logs"],
    ];

    for (const [a, b, c] of paths) {
        try {
            const colRef = collection(db, a, b, c);
            const qy = query(colRef, orderBy("createdAt", "desc"), limit(take));
            const snap = await getDocs(qy);
            return snap.docs.map((d) => ({
                id: d.id,
                ...(d.data() as any),
            })) as WorkoutLog[];
        } catch (e) {
            if (!isPermissionDenied(e)) throw e;
        }
    }

    return [];
}

// Simple prefix search (exercise name) for a specific user's logs
export async function searchWorkoutLogsForUser(uid: string, text: string, take = 20) {
    const t = text.trim().toLowerCase();
    if (!t) return [];

    const start = t;
    const end = t + "\uf8ff";

    const paths: Array<[string, string, string]> = [
        ["workouts", uid, "logs"],
        ["users", uid, "logs"],
    ];

    for (const [a, b, c] of paths) {
        try {
            const colRef = collection(db, a, b, c);
            const qy = query(
                colRef,
                where("exerciseNameLower", ">=", start),
                where("exerciseNameLower", "<=", end),
                orderBy("exerciseNameLower"),
                limit(take)
            );
            const snap = await getDocs(qy);
            return snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as WorkoutLog[];
        } catch (e) {
            if (!isPermissionDenied(e)) throw e;
        }
    }

    return [];
}
