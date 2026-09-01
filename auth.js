// auth.js
// ─────────────────────────────────────────────────────────────
// Handles: Signup · Login · Logout · Auth state · UI gating
// Depends on: firebase-config.js  (must load first)
// Used by:    index.html (and any other page needing auth)
// ─────────────────────────────────────────────────────────────

import { auth } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithRedirect,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const googleProvider = new GoogleAuthProvider();


// ══════════════════════════════════════════════════════════════
// 1. AUTH ACTIONS
// ══════════════════════════════════════════════════════════════

export async function signUp(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name.trim() });
  return cred.user;
}

export async function logIn(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signInWithGoogle() {
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user;
}

export async function logOut() {
  await signOut(auth);
}

export function currentUser() {
  return auth.currentUser;
}

export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}


// ══════════════════════════════════════════════════════════════
// 2. AUTH STATE LISTENER
// Fires immediately with the persisted session, then on
// every login / logout.
// ══════════════════════════════════════════════════════════════

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}


// ══════════════════════════════════════════════════════════════
// 3. UI GATING
// Add  data-auth="protected"  to any element you want locked.
// Add  data-auth="logged-in"  to show only when authenticated.
// Add  data-auth="logged-out" to show only when not logged in.
// ══════════════════════════════════════════════════════════════

export function applyAuthGate(user) {
  document.querySelectorAll('[data-auth="protected"]').forEach(el => {
    el.classList.toggle('auth-locked', !user);
  });
  document.querySelectorAll('[data-auth="logged-in"]').forEach(el => {
    el.style.display = user ? '' : 'none';
  });
  document.querySelectorAll('[data-auth="logged-out"]').forEach(el => {
    el.style.display = user ? 'none' : '';
  });
}


// ══════════════════════════════════════════════════════════════
// 4. FIREBASE ERROR → HUMAN MESSAGE
// ══════════════════════════════════════════════════════════════

export function friendlyError(code) {
  const map = {
    "auth/email-already-in-use":   "An account with this email already exists.",
    "auth/invalid-email":          "Please enter a valid email address.",
    "auth/weak-password":          "Password must be at least 6 characters.",
    "auth/user-not-found":         "No account found with this email.",
    "auth/wrong-password":         "Incorrect password. Please try again.",
    "auth/invalid-credential":     "Invalid email or password.",
    "auth/too-many-requests":      "Too many attempts. Please wait a moment.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/missing-email":          "Please enter your email address.",
    "auth/user-disabled":          "This account has been disabled.",
    "auth/popup-closed-by-user":   "Sign-in popup was closed. Please try again.",
    "auth/popup-blocked":          "Popup was blocked by your browser. Please allow popups.",
    "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign-in method.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
