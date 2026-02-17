import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  User,
  updateProfile,
} from "firebase/auth";

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyCn13A3JZwHInhHG20oYzzC4YoSJ-m2EBk",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "bondhushobha-9a5e0.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "bondhushobha-9a5e0",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "bondhushobha-9a5e0.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1064473829012",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:1064473829012:web:a8de0c4374c4557b8d9e81",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4N6Z2CY2L8",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  providerId: string;
}

export class FirebaseAuthService {
  async signInWithGoogle(): Promise<AuthUser> {
    const result = await signInWithPopup(auth, googleProvider);
    return this.mapUser(result.user);
  }

  async signInWithEmail(email: string, password: string): Promise<AuthUser> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return this.mapUser(result.user);
  }

  async signUpWithEmail(
    email: string,
    password: string,
    displayName?: string,
  ): Promise<AuthUser> {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName && result.user) {
      await updateProfile(result.user, { displayName });
    }

    return this.mapUser(result.user);
  }

  async signOut(): Promise<void> {
    await signOut(auth);
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      callback(user ? this.mapUser(user) : null);
    });
    return unsubscribe;
  }

  getCurrentUser(): AuthUser | null {
    const user = auth.currentUser;
    return user ? this.mapUser(user) : null;
  }

  private mapUser(user: User): AuthUser {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      providerId: user.providerId,
    };
  }

  getIdToken(): Promise<string | null> {
    return auth.currentUser?.getIdToken() || Promise.resolve(null);
  }
}

export const firebaseAuth = new FirebaseAuthService();
export { auth };
export default firebaseAuth;
