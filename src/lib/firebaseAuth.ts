// Firebase Authentication Service
// Handles: Email/Password, Phone OTP, Email Link (OTP)

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { setUser, getUser } from "@/lib/firestore";
import type { User } from "@/lib/store";

// ─── EMAIL / PASSWORD AUTH ───────────────────────────────────────────────────
export const loginWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
};

export const registerWithEmail = async (
  email: string,
  password: string,
  name: string,
  phone: string
): Promise<FirebaseUser> => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  // Save user profile to Firestore
  await setUser(cred.user.uid, {
    id: cred.user.uid,
    name,
    email,
    phone,
    password: "", // Never store plaintext password in Firestore
  });
  return cred.user;
};

export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

// ─── GOOGLE AUTH ─────────────────────────────────────────────────────────────
export const loginWithGoogle = async (): Promise<FirebaseUser> => {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  
  // Optionally update Firestore user profile if they don't exist
  const existingUser = await getUser(cred.user.uid);
  if (!existingUser) {
    await setUser(cred.user.uid, {
      id: cred.user.uid,
      name: cred.user.displayName || "Google User",
      email: cred.user.email || "",
      phone: cred.user.phoneNumber || "",
      password: "", 
    });
  }
  return cred.user;
};

// ─── SIGN OUT ────────────────────────────────────────────────────────────────
export const logout = async () => {
  await signOut(auth);
};

// ─── AUTH STATE LISTENER ─────────────────────────────────────────────────────
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// ─── SYNC FIREBASE USER WITH APP USER ────────────────────────────────────────
export const syncFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
  const profile = await getUser(firebaseUser.uid);
  if (profile) return profile;

  // If no Firestore profile (e.g. phone auth), create a basic one
  const newUser: User = {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.phoneNumber || "User",
    email: firebaseUser.email || "",
    phone: firebaseUser.phoneNumber || "",
    password: "",
  };
  await setUser(firebaseUser.uid, newUser);
  return newUser;
};

// ─── ADMIN CHECK ─────────────────────────────────────────────────────────────
export const ADMIN_EMAIL = "admin@vinika.com";
export const isAdmin = (email: string | null) => email === ADMIN_EMAIL;
