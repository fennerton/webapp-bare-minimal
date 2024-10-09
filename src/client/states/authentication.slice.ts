import { StateCreator } from "zustand";
import { Authentication as User } from "../../interfaces/authentication";

export interface AuthenticationSlice {
  user: User | null;
  proactiveLoggingOut: boolean;
  userLogin: (user: User) => void;
  setProactiveLoggingOut: (loggingOut: boolean) => void;
  userLogout: (nextUrl: string) => void;
}

export const createAuthenticationSlice: StateCreator<
  AuthenticationSlice,
  [["zustand/devtools", never]],
  [],
  AuthenticationSlice
> = (set, getState) => ({
  user: null,
  proactiveLoggingOut: false,
  userLogin: (user: User) => set({ user }, false, "userLogin"),
  setProactiveLoggingOut: (loggingOut) =>
    set({ proactiveLoggingOut: loggingOut }, false, "setLoggingOut"),
  userLogout: (nextUrl: string) => {
    getState().setProactiveLoggingOut(false);
    set({ user: null }, false, "userLogout");
    window.location.href = nextUrl;
  },
});
