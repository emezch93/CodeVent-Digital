import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDPpvSSDrnhoepDgf_ZgI5lSCgTEawljAA",
  authDomain: "codeventdigital.site",
  projectId: "codevent-digital",
  storageBucket: "codevent-digital.firebasestorage.app",
  messagingSenderId: "840016876762",
  appId: "1:840016876762:web:7f37e3fe9d1662f65681e3",
  measurementId: "G-GCT1HMZDLT"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
