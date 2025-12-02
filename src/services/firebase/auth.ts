import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import {
  createUserWithEmailAndPassword as firebaseCreateUserWithEmailAndPassword,
  signInWithEmailAndPassword as firebaseSignInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "./config";
import { AuthService, UserData } from "./types";

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  offlineAccess: true,
});

export const authService: AuthService = {
  createUserWithEmailAndPassword: async (email, password, username) => {
    try {
      const userCredential = await firebaseCreateUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: username,
      });
      return userCredential.user;
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Create User Error:", errorCode, errorMessage);
      throw error;
    }
  },
  signInWithEmailAndPassword: async (email, password) => {
    try {
      const userCredential = await firebaseSignInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      } as UserData;
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Sign-In Error:", errorCode, errorMessage);
      throw error;
    }
  },
  signInWithGoogle: async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        const idToken = response?.data?.idToken;
        const googleCredential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(
          auth,
          googleCredential
        );
        const user = userCredential.user;
        return {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          emailVerified: user.emailVerified,
        } as UserData;
      } else {
        // Sign in cancelled by user
        throw new Error("Google Sign-In was cancelled by the user");
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            throw new Error("A sign in operation is already in progress");
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            throw new Error(
              "Google Play Services is not available or outdated"
            );
            break;
          case statusCodes.SIGN_IN_REQUIRED:
            throw new Error("User has not signed in yet");
            break;
          default:
            throw new Error("An unknown error occurred during Google sign-in");
        }
      } else {
        console.error("Authentication Error:", error);
        throw error;
      }
    }
  },
  logout: async () => {
    try {
      const user = auth.currentUser;
      const isGoogleUser = user?.providerData.some(
        (provider) => provider.providerId === "google.com"
      );
      if (isGoogleUser) {
        await GoogleSignin.signOut();
      }
      await signOut(auth);
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Logout Error:", errorCode, errorMessage);
      throw error;
    }
  },
};
