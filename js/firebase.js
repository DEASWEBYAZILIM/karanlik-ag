import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, set, get, update, onValue, runTransaction } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyASJQvP128UQU3XgTRwmq4QkhZbc5mTeHU",
  authDomain: "karanlik-ag-db.firebaseapp.com",
  projectId: "karanlik-ag-db",
  storageBucket: "karanlik-ag-db.firebasestorage.app",
  messagingSenderId: "367926437802",
  appId: "1:367926437802:web:0fd76d41ae4eb9d838add3"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Tüm js dosyaları erişebilsin diye window objesine atıyoruz
window.db = db; window.ref = ref; window.set = set; window.get = get; window.update = update; window.onValue = onValue; window.runTransaction = runTransaction;
