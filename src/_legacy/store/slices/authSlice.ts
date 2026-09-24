import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { authState, UserData } from "../types";

const initialState: authState = {
  isAuthenticated: false,
  isInitialized: false,
  isLoading: true,
  error: null,
  user: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Action to set user data upon successful authentication or Firebase onAuthStateChanged
    setUser: (state, action: PayloadAction<UserData>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.isInitialized = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { setUser, logout, setLoading, setInitialized, setError } =
  authSlice.actions;
export default authSlice.reducer;
