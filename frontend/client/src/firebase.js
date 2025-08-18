// Import the functions you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9NNl_ouUQymrBz_U6QyijJ-sExWvg1LU",
  authDomain: "dream-destiny-fb066.firebaseapp.com",
  projectId: "dream-destiny-fb066",
  storageBucket: "dream-destiny-fb066.firebasestorage.app",
  messagingSenderId: "74548611415",
  appId: "1:74548611415:web:88fdefd08be76595789612",
  measurementId: "G-PKQSKVYT3G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ✅ Analytics (optional)
const analytics = getAnalytics(app);

export { auth, googleProvider };
