import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
} from "firebase/firestore";
import { Workout } from "../../types/workout";
import { db } from "./config";

const getUserWorkoutsRef = (userId: string) =>
  collection(db, "users", userId, "workouts");

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
