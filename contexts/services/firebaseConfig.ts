import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDigKrx3vGUjj1PY9wkZaUyRPv4gin_QyY",
  authDomain: "vibe-2f27b.firebaseapp.com",
  databaseURL: "https://vibe-2f27b-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "vibe-2f27b",
  storageBucket: "vibe-2f27b.appspot.com",
  messagingSenderId: "1052204016227",
  appId: "1:1052204016227:web:f78e24ea0f40272a4e8e56",
  measurementId: "G-C7SE3KGGPT"
};


// تهيئة Firebase
// سيقوم Firebase بإظهار خطأ في الكونسول إذا كانت الإعدادات غير متوفرة أو غير صحيحة.
const app = initializeApp(firebaseConfig);


// تهيئة وتصدير خدمات Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;