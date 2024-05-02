import { User } from "@prisma/client";
import { create } from "zustand";

interface UserState {
  currentUser: User | null;
}

interface UserActions {
  setUser: (user: User) => void;
}

export const useUserStore = create<UserState & UserActions>((set) => ({
  currentUser: null,
  setUser: (user: User) => set(() => ({ currentUser: user })),
}));
