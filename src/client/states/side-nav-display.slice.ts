import { StateCreator } from 'zustand';

export interface SideNavDisplaySlice {
  displaySideNav: boolean;
  toggleSideNav: (display: boolean) => void;
}

export const createSideNavDisplaySlice: StateCreator<
  SideNavDisplaySlice,
  [['zustand/devtools', never]],
  [],
  SideNavDisplaySlice
> = (set) => ({
  displaySideNav: true,
  toggleSideNav: (displaySideNav: boolean) => set({ displaySideNav }, false, 'toggleSideNav'),
});