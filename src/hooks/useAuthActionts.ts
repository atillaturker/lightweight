import { authService } from "../services/firebase";
import { setError, setLoading, setUser, useAppDispatch } from "../store";

export const useAuthActions = () => {
  const dispatch = useAppDispatch();
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
      console.error("Login Error:", error);
      dispatch(setError(error.message || "Login Error"));
    }
  };
  return { handleGoogleSignIn };
};
