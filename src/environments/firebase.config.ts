// Configurações do Firebase para desenvolvimento
export const firebaseConfig = {
  apiKey: (globalThis as any)['NG_APP_FIREBASE_API_KEY'] || '',
  authDomain: (globalThis as any)['NG_APP_FIREBASE_AUTH_DOMAIN'] || '',
  projectId: (globalThis as any)['NG_APP_FIREBASE_PROJECT_ID'] || '',
  storageBucket: (globalThis as any)['NG_APP_FIREBASE_STORAGE_BUCKET'] || '',
  messagingSenderId: (globalThis as any)['NG_APP_FIREBASE_MESSAGING_SENDER_ID'] || '',
  appId: (globalThis as any)['NG_APP_FIREBASE_APP_ID'] || '',
  measurementId: (globalThis as any)['NG_APP_FIREBASE_MEASUREMENT_ID'] || ''
};

// Configurações do Firebase para produção (usando apenas env vars)
export const firebaseConfigProd = {
  apiKey: (globalThis as any)['NG_APP_FIREBASE_API_KEY'],
  authDomain: (globalThis as any)['NG_APP_FIREBASE_AUTH_DOMAIN'],
  projectId: (globalThis as any)['NG_APP_FIREBASE_PROJECT_ID'],
  storageBucket: (globalThis as any)['NG_APP_FIREBASE_STORAGE_BUCKET'],
  messagingSenderId: (globalThis as any)['NG_APP_FIREBASE_MESSAGING_SENDER_ID'],
  appId: (globalThis as any)['NG_APP_FIREBASE_APP_ID'],
  measurementId: (globalThis as any)['NG_APP_FIREBASE_MEASUREMENT_ID']
};
