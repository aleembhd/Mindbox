// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Import Analytics only on client side
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAlcMrVggsRI9QnYrAiOHIa5E4UCuFvbGs",
  authDomain: "fir-tutorial-f3f75.firebaseapp.com",
  databaseURL: "https://fir-tutorial-f3f75-default-rtdb.firebaseio.com",
  projectId: "fir-tutorial-f3f75",
  storageBucket: "fir-tutorial-f3f75.firebasestorage.app",
  messagingSenderId: "174499071357",
  appId: "1:174499071357:web:521ccf4702ee0636edf814",
  measurementId: "G-3D3XJGY0PZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Storage
const storage = getStorage(app);

export { db, storage };
export default app;