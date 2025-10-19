// TODO: Initialize Firebase
//
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, AIzaSyA0AJ4SMtORZL0QXC_W02tEaX5yu-WOVsE 
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN, vititracker-a8549.firebaseapp.com
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, vititracker-a8549
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,vititracker-a8549.firebasestorage.app
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, 237819050933 
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID, 1:237819050933:web:77150a804708bca96037fc
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// export const placeholder = "Firebase configuration placeholder"
