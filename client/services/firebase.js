import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyAdCkNDNjnrusXg6blO7z02EkhCiezpvdY",
  authDomain: "ai-powered-digital-marke-fc7af.firebaseapp.com",
  databaseURL: 'https://ai-powered-digital-marke-fc7af-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: "ai-powered-digital-marke-fc7af",
  storageBucket: "ai-powered-digital-marke-fc7af.appspot.com",
  messagingSenderId: "552564748664",
  appId: "1:552564748664:web:94c3eb9a66f8e76fc6188d",
  measurementId:  "G-M9V60YDLGY",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db }; 