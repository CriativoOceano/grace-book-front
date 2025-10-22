export const environment = {
  production: false,

  // Configurações da API Backend
  apiUrl: (globalThis as any)['NG_APP_API_URL'] || 'http://localhost:3000',

  // Configurações do Firebase
  firebase: {
    apiKey: 'AIzaSyCnL84TMKFVcl1Pwc36_sDM8qPfcjDl3Y4',
    authDomain: 'sede-campestre-oceano.firebaseapp.com',
    projectId: 'sede-campestre-oceano',
    storageBucket: 'sede-campestre-oceano.firebasestorage.app',
    messagingSenderId: '587888881295',
    appId: '1:587888881295:web:1c29e8f89c65226a2a4afa',
    measurementId: 'G-PQ3VY53780',
  },
};
