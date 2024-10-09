import { create } from "zustand";
import {
  AuthenticationSlice,
  createAuthenticationSlice,
} from "./authentication.slice";
import {
  createSideNavDisplaySlice,
  SideNavDisplaySlice,
} from "./side-nav-display.slice";
import { devtools, persist } from "zustand/middleware";

export const useBoundStore = create<
  AuthenticationSlice & SideNavDisplaySlice
>()(
  devtools(
    persist(
      (...a) => ({
        ...createAuthenticationSlice(...a),
        ...createSideNavDisplaySlice(...a),
      }),
      {
        name: "persisted-application-state",
        partialize: (state) => ({ user: state.user }),
      },
    ),
  ),
);
