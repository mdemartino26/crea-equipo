import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET, 
  appId: process.env.REACT_APP_APP_ID,
};


const cfg = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET, // debe ser *.appspot.com
  appId: process.env.REACT_APP_APP_ID,
};
console.log("Firebase cfg ok?", Object.fromEntries(
  Object.entries(cfg).map(([k,v]) => [k, !!v])
));

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);