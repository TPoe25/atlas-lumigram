import * as SQLite from "expo-sqlite";

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

let db: SQLite.SQLiteDatabase | null = null;

export function initDb() {
  if (db) return;

  db = SQLite.openDatabaseSync("sports_tracker.db");

  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      kind TEXT NOT NULL CHECK(kind IN ('strength','conditioning')),
      title TEXT NOT NULL,
      sets INTEGER,
      reps INTEGER,
      weight REAL,
      duration_minutes INTEGER,
      distance_miles REAL,
      notes TEXT,
      created_at TEXT NOT NULL
    );
  `);
}

export function getUsers(): User[] {
  initDb();
  return db!.getAllSync<User>(`SELECT * FROM users ORDER BY id DESC;`);
}

export function addUser(name: string) {
  const n = name.trim();
  if (!n) return;
  initDb();
  db!.runSync(`INSERT INTO users (name, created_at) VALUES (?, datetime('now'));`, [n]);
}

export function deleteUser(userId: number) {
  initDb();
  db!.runSync(`DELETE FROM activities WHERE user_id = ?;`, [userId]);
  db!.runSync(`DELETE FROM users WHERE id = ?;`, [userId]);
}

export function getActivitiesForUser(userId: number): Activity[] {
  initDb();
  return db!.getAllSync<Activity>(
    `SELECT * FROM activities WHERE user_id = ? ORDER BY id DESC;`,
    [userId]
  );
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
  initDb();
  db!.runSync(
    `INSERT INTO activities (
      user_id, kind, title, sets, reps, weight, duration_minutes, distance_miles, notes, created_at
    ) VALUES (?, 'strength', ?, ?, ?, ?, NULL, NULL, ?, datetime('now'));`,
    [
      args.userId,
      title,
      args.sets,
      args.reps,
      typeof args.weight === "number" ? args.weight : null,
      args.notes?.trim() || null,
    ]
  );
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
  initDb();
  db!.runSync(
    `INSERT INTO activities (
      user_id, kind, title, sets, reps, weight, duration_minutes, distance_miles, notes, created_at
    ) VALUES (?, 'conditioning', ?, NULL, NULL, NULL, ?, ?, ?, datetime('now'));`,
    [
      args.userId,
      title,
      args.durationMinutes,
      typeof args.distanceMiles === "number" ? args.distanceMiles : null,
      args.notes?.trim() || null,
    ]
  );
}

export function deleteActivity(activityId: number) {
  initDb();
  db!.runSync(`DELETE FROM activities WHERE id = ?;`, [activityId]);
}

export function deleteAllActivitiesForUser(userId: number) {
  initDb();
  db!.runSync(`DELETE FROM activities WHERE user_id = ?;`, [userId]);
}

export function updateActivity(
  activityId: number,
  updates: {
    title: string;
    sets?: number | null;
    reps?: number | null;
    weight?: number | null;
    duration_minutes?: number | null;
    distance_miles?: number | null;
    notes?: string | null;
  }
) {
  initDb();

  const title = updates.title.trim();
  if (!title) return;

  const notes =
    updates.notes === null || updates.notes === undefined
      ? null
      : updates.notes.trim() || null;

  db!.runSync(
    `UPDATE activities SET
      title = ?,
      sets = ?,
      reps = ?,
      weight = ?,
      duration_minutes = ?,
      distance_miles = ?,
      notes = ?
    WHERE id = ?;`,
    [
      title,
      updates.sets ?? null,
      updates.reps ?? null,
      updates.weight ?? null,
      updates.duration_minutes ?? null,
      updates.distance_miles ?? null,
      notes,
      activityId,
    ]
  );
}

export function getActivityById(activityId: number): Activity | null {
  initDb();
  const rows = db!.getAllSync<Activity>(
    `SELECT * FROM activities WHERE id = ? LIMIT 1;`,
    [activityId]
  );
  return rows[0] ?? null;
}
