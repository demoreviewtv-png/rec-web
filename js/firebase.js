import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyClRzYRn4d4iXLLKQGRVntev3LQwTfuDLQ",
  authDomain: "redroom-9f4a0.firebaseapp.com",
  databaseURL: "https://redroom-9f4a0-default-rtdb.firebaseio.com",
  projectId: "redroom-9f4a0",
  storageBucket: "redroom-9f4a0.firebasestorage.app",
  messagingSenderId: "646291907356",
  appId: "1:646291907356:web:29f88d37dbed10775790d9",
  measurementId: "G-5QF7S4HR60"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let myUserId = localStorage.getItem("gt_user_id") || "hero_" + Math.random().toString(36).substr(2, 7);
localStorage.setItem("gt_user_id", myUserId);

async function initSaveData() {
  const ref = doc(db, "quest_heroes", myUserId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, { gold: 0, trophiesWon: 0 });
  }
  updateHUD();
}

window.addGold = async (amount) => {
  const ref = doc(db, "quest_heroes", myUserId);
  await updateDoc(ref, { gold: increment(amount) });
  updateHUD();
};

async function updateHUD() {
  const ref = doc(db, "quest_heroes", myUserId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const goldElem = document.getElementById("gold-count");
    if (goldElem) goldElem.innerText = snap.data().gold || 0;
  }
}

initSaveData();
