// ========================================
// CONFIGURACIÓN DE FIREBASE
// ========================================

const firebaseConfig = {
  apiKey: "AIzaSyCdbhGYafCiX3F0_Mz4BQXbPFumv-xghd0",
  authDomain: "sistema-prestamos-d3fc6.firebaseapp.com",
  projectId: "sistema-prestamos-d3fc6",
  storageBucket: "sistema-prestamos-d3fc6.firebasestorage.app",
  messagingSenderId: "494891015498",
  appId: "1:494891015498:web:85c12ea8c8610f630635b3",
  measurementId: "G-JG6LL9MFKQ"
};

// Inicializar Firebase de inmediato
async function initializeFirebase() {
  if (window.firebaseSync) {
    try {
      const initialized = await window.firebaseSync.inicializar(firebaseConfig);
      if (initialized) {
        console.log('✅ Firebase conectado correctamente');
        console.log('📊 Los datos se guardarán en la nube automáticamente');
      } else {
        console.log('⚠️ Firebase no disponible, usando localStorage');
      }
    } catch (error) {
      console.error('❌ Error al inicializar Firebase:', error);
    }
  } else {
    console.warn('⚠️ firebaseSync no está disponible');
  }
}

// Llamar cuando el documento esté listo (pero después de que firebaseSync esté disponible)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFirebase);
} else {
  initializeFirebase();
}
