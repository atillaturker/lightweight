import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./slices/authSlice";
import workoutReducer from "./slices/workoutSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    workout: workoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
