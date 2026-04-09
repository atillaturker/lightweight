import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { Routine, Workout } from "../../types/workout";
import { db } from "./config";

const getUserWorkoutsRef = (userId: string) =>
  collection(db, "users", userId, "workouts");

const getUserRoutineRef = (userId: string) =>
  collection(db, "users", userId, "routines");

export const saveUserWorkoutToFireStore = async (
  userId: string,
  workout: Workout,
) => {
  try {
    const userWorkoutRef = getUserWorkoutsRef(userId);
    const docRef = doc(userWorkoutRef, workout.id);
    await setDoc(docRef, workout, { merge: true });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error(
      "Error adding workout to fireStore(addUserWorkoutToFireStore) ",
      e,
    );
  }
};
export const saveUserRoutineToFireStore = async (
  userId: string,
  routine: Routine,
) => {
  if (!userId || !routine) {
    throw new Error("UserID or Routine not found! (saveUserRoutine)");
  }

  try {
    const userRoutineRef = getUserRoutineRef(userId);
    const docRef = doc(userRoutineRef, routine.id);
    await setDoc(docRef, routine, { merge: true });
    console.log("Routine written with ID: ", docRef.id);
  } catch (error) {
    console.error("Error adding routine to fireStore: ", error);
    throw error;
  }
};

export const updateUserRoutineInFireStore = async (
  userId: string,
  routine: Routine,
) => {
  if (!userId || !routine) {
    throw new Error("UserID or Routine not found! (updateUserRoutine)");
  }

  try {
    const userRoutineRef = getUserRoutineRef(userId);
    const docRef = doc(userRoutineRef, routine.id);
    await setDoc(docRef, routine, { merge: true });
    console.log("Routine updated with ID: ", docRef.id);
  } catch (error) {
    console.error("Error updating routine in fireStore: ", error);
    throw error;
  }
};

export const fetchUserWorkoutsFromFireStore = async (
  userId: string,
): Promise<Workout[]> => {
  try {
    const userWorkoutRef = getUserWorkoutsRef(userId);
    const q = query(userWorkoutRef, orderBy("date", "desc"));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as Workout);
  } catch (error) {
    console.error(
      "Error fetching user Workouts(fetchUserWorkoutsFromFireStore)",
      error,
    );
    throw error;
  }
};

export const fetchUserRoutinesFromFireStore = async (
  userId: string,
): Promise<Routine[]> => {
  if (!userId) {
    throw new Error("UserID not found! (fetchUserRoutinesFromFireStore)");
  }

  try {
    const userRoutineRef = getUserRoutineRef(userId);
    const q = query(userRoutineRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => doc.data() as Routine);
  } catch (error) {
    console.error("Error fetching user routines from fireStore: ", error);
    throw error;
  }
};
