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
  getRedirectResult,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const googleProvider = new GoogleAuthProvider();

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
  await signInWithRedirect(auth, googleProvider);
}

export async function checkGoogleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    return result ? result.user : null;
  } catch (err) {
    console.error("Google redirect result error:", err.code, err.message);
    return null;
  }
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

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

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
    "auth/popup-closed-by-user":   "Sign in popup was closed. Please try again.",
    "auth/popup-blocked":          "Popup was blocked by your browser. Please allow popups.",
    "auth/account-exists-with-different-credential": "An account already exists with this email using a different sign in method.",
  };
  return map[code] || "Something went wrong. Please try again.";
}
