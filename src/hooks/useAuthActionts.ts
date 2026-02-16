import { authService, getAuthErrorMessage } from "../services/firebase";
import { setError, setLoading, setUser, useAppDispatch } from "../store";

export const useAuthActions = () => {
  const dispatch = useAppDispatch();
  const handleRegisterWithEmailAndPassword = async (
    email: string,
    password: string,
    username: string,
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.createUserWithEmailAndPassword(
        email,
        username,
        password,
      );
      if (response) {
        dispatch(
          setUser({
            uid: response.uid,
            email: response.email,
            displayName: response.displayName,
            photoURL: response.photoURL,
            emailVerified: response.emailVerified,
          }),
        );
      }
      dispatch(setLoading(false));
    } catch (error: any) {
      console.error("Registration Error:", error);
      dispatch(setError(error.message || "Registration Error"));
      dispatch(setLoading(false));
    }
  };

  const handleSignInWithEmailAndPassword = async (
    email: string,
    password: string,
  ) => {
    try {
      dispatch(setLoading(true));
      const response = await authService.signInWithEmailAndPassword(
        email,
        password,
      );
      if (response) {
        dispatch(setUser(response));
        setError(null);
      }
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      const userErrorMessage = getAuthErrorMessage(errorCode) || "Login Error";
      console.error("Login Code:", errorCode, "ErrorMessage:", errorMessage);
      dispatch(setError(userErrorMessage));
      dispatch(setLoading(false));
      throw error;
    }
  };
  const handleGoogleSignIn = async () => {
    try {
      dispatch(setLoading(true));
      const response = await authService.signInWithGoogle();
      if (response) {
        dispatch(setUser(response));
      } else {
        dispatch(setLoading(false));
      }
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Login Error:", errorCode, errorMessage);
      const userErrorMessage = getAuthErrorMessage(errorCode) || "Login Error";
      dispatch(setError(userErrorMessage));
      dispatch(setLoading(false));
    }
  };

  return {
    handleGoogleSignIn,
    handleRegisterWithEmailAndPassword,
    handleSignInWithEmailAndPassword,
  };
};
