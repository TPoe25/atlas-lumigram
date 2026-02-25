export type User = { id: number; name: string; created_at: string };
export type ActivityKind = "strength" | "conditioning";
export type Activity = {
    id: number;
    user_id: number;
    kind: ActivityKind;
    title: string;
    sets: number | null;
    reps: number | null;
    weight: number | null;
    duration_minutes: number | null;
    distance_miles: number | null;
    notes: string | null;
    created_at: string;
};

let webUsers: User[] = [];
let webActivities: Activity[] = [];
let webUserId = 1;
let webActivityId = 1;

export function initDb() {
    // no-op on web
}

export function getUsers(): User[] {
    return [...webUsers].sort((a, b) => b.id - a.id);
}

export function addUser(name: string) {
    const n = name.trim();
    if (!n) return;
    webUsers.push({ id: webUserId++, name: n, created_at: new Date().toISOString() });
}

export function deleteUser(userId: number) {
    webActivities = webActivities.filter((a) => a.user_id !== userId);
    webUsers = webUsers.filter((u) => u.id !== userId);
}

export function getActivitiesForUser(userId: number): Activity[] {
    return webActivities
        .filter((a) => a.user_id === userId)
        .sort((a, b) => b.id - a.id);
}

export function addStrengthActivity(args: {
    userId: number;
    title: string;
    sets: number;
    reps: number;
    weight?: number;
    notes?: string;
}) {
    const title = args.title.trim();
    if (!title) return;

    webActivities.push({
        id: webActivityId++,
        user_id: args.userId,
        kind: "strength",
        title,
        sets: args.sets,
        reps: args.reps,
        weight: typeof args.weight === "number" ? args.weight : null,
        duration_minutes: null,
        distance_miles: null,
        notes: args.notes?.trim() || null,
        created_at: new Date().toISOString(),
    });
}

export function addConditioningActivity(args: {
    userId: number;
    title: string;
    durationMinutes: number;
    distanceMiles?: number;
    notes?: string;
}) {
    const title = args.title.trim();
    if (!title) return;

    webActivities.push({
        id: webActivityId++,
        user_id: args.userId,
        kind: "conditioning",
        title,
        sets: null,
        reps: null,
        weight: null,
        duration_minutes: args.durationMinutes,
        distance_miles: typeof args.distanceMiles === "number" ? args.distanceMiles : null,
        notes: args.notes?.trim() || null,
        created_at: new Date().toISOString(),
    });
}

export function deleteActivity(activityId: number) {
    webActivities = webActivities.filter((a) => a.id !== activityId);
}

export function deleteAllActivitiesForUser(userId: number) {
    webActivities = webActivities.filter((a) => a.user_id !== userId);
}
