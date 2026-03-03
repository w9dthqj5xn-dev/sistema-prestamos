// ========================================
// INTEGRACIÓN CON FIREBASE
// ========================================

// Importar Firebase (se cargará desde CDN en index.html)
// Para usar estos métodos, primero debes:
// 1. Crear proyecto en Firebase Console
// 2. Obtener las credenciales
// 3. Reemplazar los valores en index.html

class FirebaseSync {
    constructor() {
        this.db = null;
        this.initialized = false;
    }

    // Inicializar Firebase
    async inicializar(config) {
        try {
            // Importar Firebase (asumiendo que está cargado vía CDN en HTML)
            if (!window.firebase) {
                console.log('Firebase no está disponible. Usando localStorage.');
                return false;
            }

            const app = firebase.initializeApp(config);
            this.db = firebase.firestore(app);
            this.initialized = true;
            console.log('✅ Firebase inicializado correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error inicializando Firebase:', error);
            return false;
        }
    }

    // Guardar clientes en Firestore
    async guardarClientes(clientes) {
        if (!this.initialized) return;

        try {
            const batch = this.db.batch();
            const colRef = this.db.collection('clientes');

            clientes.forEach(cliente => {
                const docRef = colRef.doc(cliente.id.toString());
                batch.set(docRef, cliente);
            });

            await batch.commit();
            console.log('✅ Clientes guardados en Firebase');
        } catch (error) {
            console.error('❌ Error guardando clientes:', error);
        }
    }

    // Guardar pagos en Firestore
    async guardarPagos(pagos) {
        if (!this.initialized) return;

        try {
            const batch = this.db.batch();
            const colRef = this.db.collection('pagos');

            pagos.forEach(pago => {
                const docRef = colRef.doc(pago.id.toString());
                batch.set(docRef, pago);
            });

            await batch.commit();
            console.log('✅ Pagos guardados en Firebase');
        } catch (error) {
            console.error('❌ Error guardando pagos:', error);
        }
    }

    // Cargar clientes desde Firestore
    async cargarClientes() {
        if (!this.initialized) return [];

        try {
            const snapshot = await this.db.collection('clientes').get();
            const clientes = [];
            snapshot.forEach(doc => {
                clientes.push(doc.data());
            });
            console.log('✅ Clientes cargados desde Firebase');
            return clientes;
        } catch (error) {
            console.error('❌ Error cargando clientes:', error);
            return [];
        }
    }

    // Cargar pagos desde Firestore
    async cargarPagos() {
        if (!this.initialized) return [];

        try {
            const snapshot = await this.db.collection('pagos').get();
            const pagos = [];
            snapshot.forEach(doc => {
                pagos.push(doc.data());
            });
            console.log('✅ Pagos cargados desde Firebase');
            return pagos;
        } catch (error) {
            console.error('❌ Error cargando pagos:', error);
            return [];
        }
    }

    // Sincronizar datos locales con Firebase
    async sincronizar(clientes, pagos) {
        if (!this.initialized) {
            console.log('⚠️ Firebase no está disponible. Usando solo localStorage.');
            return false;
        }

        try {
            await this.guardarClientes(clientes);
            await this.guardarPagos(pagos);
            return true;
        } catch (error) {
            console.error('❌ Error sincronizando con Firebase:', error);
            return false;
        }
    }
}

// Crear instancia global
window.firebaseSync = new FirebaseSync();
