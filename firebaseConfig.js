// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,

} from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  doc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfX71Sy5lQHj7MIvFQF8SEkOnu51F-4Uw",
  authDomain: "eunsuk1.firebaseapp.com",
  projectId: "eunsuk1",
  storageBucket: "eunsuk1.firebasestorage.app",
  messagingSenderId: "939105794662",
  appId: "1:939105794662:web:ceba22e04f734c57350ba7",
  measurementId: "G-P9G0PDW4EQ"
};

// 앱 초기화
const app = initializeApp(firebaseConfig);

// ? React Native용 Auth 초기화 (AsyncStorage persistence)
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore
const db = getFirestore(app);

// ? 필요한 것들 전부 export
export {
  app,
  auth,
  db,
  // Firestore helpers
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  where,
  doc,
  getDocs,
  // Auth helpers
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  serverTimestamp,
};