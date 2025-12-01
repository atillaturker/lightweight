import { User } from "firebase/auth";

export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface AuthService {
  signInWithGoogle: () => Promise<UserData>;
  signInWithEmailAndPassword: (
    email: string,
    password: string
  ) => Promise<UserData>;
  logout: () => Promise<void>;
  createUserWithEmailAndPassword: (
    email: string,
    password: string,
    username: string
  ) => Promise<User>;
}
