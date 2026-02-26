export type ApiNinjasExercise = {
  name: string;
  type: string;
  muscle: string;
  difficulty: string;
  instructions: string;
  equipments?: string[];
  safety_info?: string;
};

export type WorkoutResult = ApiNinjasExercise & {
  id: string;      // for list keys + routing
  gifUrl?: string; // later when you match ExerciseDB gifs
};
