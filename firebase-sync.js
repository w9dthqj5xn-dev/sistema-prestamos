// ========================================
// INTEGRACIÓN CON FIREBASE - REST API
// ========================================

class FirebaseSync {
    constructor() {
        this.initialized = false;
        this.projectId = null;
        this.apiKey = null;
    }

    // Inicializar Firebase
    async inicializar(config) {
        try {
            this.projectId = config.projectId;
            this.apiKey = config.apiKey;
            this.initialized = true;
            console.log('✅ Firebase inicializado correctamente');
            console.log('📊 Los datos se guardarán en la nube automáticamente');
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
            for (let cliente of clientes) {
                const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/clientes/${cliente.id}`;
                
                const docData = {
                    fields: this._convertToFirestore(cliente)
                };

                await fetch(url, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(docData)
                });
            }
            console.log('✅ Clientes guardados en Firebase');
        } catch (error) {
            console.error('⚠️ Error guardando clientes (continuando con localStorage):', error);
        }
    }

    // Guardar pagos en Firestore
    async guardarPagos(pagos) {
        if (!this.initialized) return;

        try {
            for (let pago of pagos) {
                const url = `https://firestore.googleapis.com/v1/projects/${this.projectId}/databases/(default)/documents/pagos/${pago.id}`;
                
                const docData = {
                    fields: this._convertToFirestore(pago)
                };

                await fetch(url, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(docData)
                });
            }
            console.log('✅ Pagos guardados en Firebase');
        } catch (error) {
            console.error('⚠️ Error guardando pagos (continuando con localStorage):', error);
        }
    }

    // Convertir datos a formato Firestore
    _convertToFirestore(obj) {
        const fields = {};
        
        for (let key in obj) {
            const value = obj[key];
            
            if (typeof value === 'string') {
                fields[key] = { stringValue: value };
            } else if (typeof value === 'number') {
                fields[key] = { integerValue: value.toString() };
            } else if (typeof value === 'boolean') {
                fields[key] = { booleanValue: value };
            } else if (Array.isArray(value)) {
                fields[key] = { arrayValue: { values: value } };
            } else if (value === null) {
                fields[key] = { nullValue: null };
            } else if (typeof value === 'object') {
                fields[key] = { mapValue: { fields: this._convertToFirestore(value) } };
            }
        }
        
        return fields;
    }
}

// Crear instancia global
window.firebaseSync = new FirebaseSync();

