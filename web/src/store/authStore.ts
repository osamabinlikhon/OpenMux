import { create } from "zustand";
import { firebaseAuth, AuthUser } from "../services/firebase";

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  initializeAuth: () => () => void;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    displayName?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,

  initializeAuth: () => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((user) => {
      set({
        user,
        isAuthenticated: !!user,
        loading: false,
      });
    });

    return unsubscribe;
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null });
    try {
      const user = await firebaseAuth.signInWithGoogle();
      set({ user, isAuthenticated: true, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signInWithEmail: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const user = await firebaseAuth.signInWithEmail(email, password);
      set({ user, isAuthenticated: true, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signUpWithEmail: async (
    email: string,
    password: string,
    displayName?: string,
  ) => {
    set({ loading: true, error: null });
    try {
      const user = await firebaseAuth.signUpWithEmail(
        email,
        password,
        displayName,
      );
      set({ user, isAuthenticated: true, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await firebaseAuth.signOut();
      set({ user: null, isAuthenticated: false, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
