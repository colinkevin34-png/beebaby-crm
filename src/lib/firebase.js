import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// ✅ Config Firebase — déjà remplie avec ton projet prospectrm
const firebaseConfig = {
  apiKey:            "AIzaSyArcAK4MfPAcwPefsBALxkSkaHLbsD2T-U",
  authDomain:        "prospectcrm-33b44.firebaseapp.com",
  projectId:         "prospectcrm-33b44",
  storageBucket:     "prospectcrm-33b44.firebasestorage.app",
  messagingSenderId: "46039670434",
  appId:             "1:46039670434:web:43508491538ac2e226c1fb",
  measurementId:     "G-R3ZWPYSL2K",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
enableIndexedDbPersistence(db).catch(() => {});
export default app;
