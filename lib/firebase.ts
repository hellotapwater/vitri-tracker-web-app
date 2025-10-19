import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0AJ4SMtORZL0QXC_W02tEaX5yu-WOVsE",
  authDomain: "vititracker-a8549.firebaseapp.com",
  projectId: "vititracker-a8549",
  storageBucket: "vititracker-a8549.firebasestorage.app",
  messagingSenderId: "237819050933",
  appId: "1:237819050933:web:77150a804708bca96037fc",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Firestore Collections Structure:
// - users/{userId} - User profiles with personal info
// - vitamins/{vitaminId} - Individual vitamin/supplement entries
// - foodLog/{entryId} - Daily food intake entries
// - userTablets/{tabletId} - User's vitamin tablets with nutrient content
// - dailyRecommendations/{userId} - Calculated daily vitamin needs
