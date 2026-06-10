import { create } from "zustand";

interface AppState {
  // Define state types here
  isCartOpen: boolean;
  toggleCart: () => void;
}

// Example Zustand store foundation
export const useAppStore = create<AppState>((set) => ({
  isCartOpen: false,
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
}));
