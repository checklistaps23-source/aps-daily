import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBKSanpRPtqfCxF8frPTwY4EkUqoeA5b9I",
  authDomain: "checklist-journaliere.firebaseapp.com",
  projectId: "checklist-journaliere",
  storageBucket: "checklist-journaliere.firebasestorage.app",
  messagingSenderId: "705224192497",
  appId: "1:705224192497:web:e1a30a0207175db989d450"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
