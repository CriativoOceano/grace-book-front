// Configurações do Firebase para desenvolvimento
export const firebaseConfig = {
  apiKey: process.env['NG_APP_FIREBASE_API_KEY'] || "AIzaSyCnL84TMKFVcl1Pwc36_sDM8qPfcjDl3Y4",
  authDomain: process.env['NG_APP_FIREBASE_AUTH_DOMAIN'] || "sede-campestre-oceano.firebaseapp.com",
  projectId: process.env['NG_APP_FIREBASE_PROJECT_ID'] || "sede-campestre-oceano",
  storageBucket: process.env['NG_APP_FIREBASE_STORAGE_BUCKET'] || "sede-campestre-oceano.firebasestorage.app",
  messagingSenderId: process.env['NG_APP_FIREBASE_MESSAGING_SENDER_ID'] || "587888881295",
  appId: process.env['NG_APP_FIREBASE_APP_ID'] || "1:587888881295:web:1c29e8f89c65226a2a4afa",
  measurementId: process.env['NG_APP_FIREBASE_MEASUREMENT_ID'] || "G-PQ3VY53780"
};

// Configurações do Firebase para produção (usando apenas env vars)
export const firebaseConfigProd = {
  apiKey: process.env['NG_APP_FIREBASE_API_KEY'],
  authDomain: process.env['NG_APP_FIREBASE_AUTH_DOMAIN'],
  projectId: process.env['NG_APP_FIREBASE_PROJECT_ID'],
  storageBucket: process.env['NG_APP_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: process.env['NG_APP_FIREBASE_MESSAGING_SENDER_ID'],
  appId: process.env['NG_APP_FIREBASE_APP_ID'],
  measurementId: process.env['NG_APP_FIREBASE_MEASUREMENT_ID']
};
