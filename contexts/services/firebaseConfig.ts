import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// هام: يجب توفير إعدادات Firebase كمتغيرات بيئة (environment variables).
// تأكد من أن هذه المتغيرات مُعرفة في بيئة التشغيل الخاصة بك.
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN_HERE",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "YOUR_DATABASE_URL_HERE",
  projectId: process.env.FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID_HERE",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: process.env.FIREBASE_APP_ID || "YOUR_APP_ID_HERE",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID_HERE"
};

// تهيئة Firebase
// سيقوم Firebase بإظهار خطأ في الكونسول إذا كانت الإعدادات غير متوفرة.
const app = initializeApp(firebaseConfig);


// تهيئة وتصدير خدمات Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;