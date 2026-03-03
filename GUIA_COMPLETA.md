# 🔥 GUÍA COMPLETA: NETLIFY + FIREBASE

## PARTE 1: DESPLEGAR EN NETLIFY (Hosting)

### Paso 1.1: Preparar Git
```bash
cd "/Users/ing.carlosjimenez/Library/Mobile Documents/com~apple~CloudDocs/Proyectos/sistema-prestamos"

# Guardar todos los cambios
git add .
git commit -m "Agregar integración Firebase y despliegue"
git status  # Debe estar limpio (sin cambios)
```

### Paso 1.2: Crear repositorio en GitHub
1. Ve a https://github.com/new
2. **Repository name**: `sistema-prestamos`
3. **Description**: "Sistema de gestión de préstamos y pagos"
4. Selecciona **Public** (importante)
5. Click **"Create repository"**
6. Copia la URL que aparece (será algo como: `https://github.com/TU_USUARIO/sistema-prestamos.git`)

### Paso 1.3: Conectar repo local con GitHub
```bash
# Reemplaza TU_USUARIO con tu usuario de GitHub
git remote add origin https://github.com/TU_USUARIO/sistema-prestamos.git
git branch -M main
git push -u origin main
```

### Paso 1.4: Desplegar en Netlify
1. Ve a https://app.netlify.com/signup
2. Click **"GitHub"** para registrarte con GitHub
3. Autoriza Netlify en GitHub
4. Click **"Add new site"** → **"Import an existing project"**
5. Selecciona **"GitHub"**
6. Busca y selecciona **`sistema-prestamos`**
7. **Build settings**:
   - Build command: (dejar vacío)
   - Publish directory: `.`
8. Click **"Deploy site"**

**¡Tu sitio estará en:** `https://sistema-prestamos-xxxxx.netlify.app`

---

## PARTE 2: CONFIGURAR FIREBASE (Base de datos en la nube)

### Paso 2.1: Crear proyecto Firebase
1. Ve a https://console.firebase.google.com
2. Click **"Agregar proyecto"**
3. **Nombre del proyecto**: `sistema-prestamos`
4. Click **"Continuar"**
5. Desactiva **"Habilitar Google Analytics"** (opcional)
6. Click **"Crear proyecto"**
7. Espera a que se cree (1-2 minutos)

### Paso 2.2: Obtener credenciales de Firebase
1. Una vez en el proyecto, haz clic en el ícono de rueda ⚙️ → **"Configuración del proyecto"**
2. Ve a la pestaña **"General"**
3. Desplázate hasta **"Tus aplicaciones"**
4. Click en el ícono **`</>`** para crear una app web
5. **Nombre**: `sistema-prestamos-web`
6. Click **"Registrar aplicación"**
7. **COPIA TODO EL CÓDIGO FIREBASE CONFIG** (el objeto con apiKey, projectId, etc.)

Debería verse así:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "sistema-prestamos-xxxxx.firebaseapp.com",
  projectId: "sistema-prestamos-xxxxx",
  storageBucket: "sistema-prestamos-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

8. Click **"Siguiente"** hasta completar

### Paso 2.3: Configurar Firestore Database
1. En la consola de Firebase, ve a **"Firestore Database"** (en el menú izquierdo)
2. Click **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de prueba"** (para testing)
4. Ubicación: Elige la más cercana
5. Click **"Crear"**

### Paso 2.4: Agregar la configuración a tu app
1. En tu proyecto local, crea el archivo `firebase-config.js`:

```bash
# Crear el archivo
cat > firebase-config.js << 'EOF'
// FIRESTORE CONFIG - Reemplaza con tus valores de Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSy...",  // Tu apiKey
  authDomain: "sistema-prestamos-xxxxx.firebaseapp.com",
  projectId: "sistema-prestamos-xxxxx",
  storageBucket: "sistema-prestamos-xxxxx.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Inicializar Firebase al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
  const initialized = await window.firebaseSync.inicializar(firebaseConfig);
  console.log('Firebase inicializado:', initialized);
});
EOF
```

2. Abre el archivo en tu editor y **reemplaza los valores con los de tu Firebase Config**

3. Agrega el script en `index.html` (antes de `app.js`):
```html
<!-- En la sección <head>, descomenta Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js"></script>

<!-- En el <body>, antes de </body> -->
<script src="firebase-config.js"></script>
```

---

## PARTE 3: HABILITAR SINCRONIZACIÓN (Opcional)

Si quieres que **automáticamente** guarde en Firebase cuando hagas cambios:

Abre `app.js` y en la función `guardarDatos()`, agrega:

```javascript
guardarDatos(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        
        // Sincronizar con Firebase si está disponible
        if (window.firebaseSync && window.firebaseSync.initialized) {
            if (key === 'clientes') {
                window.firebaseSync.guardarClientes(data);
            } else if (key === 'pagos') {
                window.firebaseSync.guardarPagos(data);
            }
        }
    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            throw new Error('The quota has been exceeded.');
        }
        throw e;
    }
}
```

---

## ✅ CHECKLIST FINAL

- [ ] Repositorio en GitHub
- [ ] Desplegado en Netlify
- [ ] Proyecto Firebase creado
- [ ] Firestore Database creada
- [ ] `firebase-config.js` creado con tus credenciales
- [ ] Firebase SDK habilitado en `index.html`
- [ ] Código de sincronización agregado (si quieres)

---

## 🚀 RESULTADO FINAL

**Tendrás:**
- ✅ Sitio web en: `https://sistema-prestamos-xxxxx.netlify.app`
- ✅ Base de datos en la nube con Firestore
- ✅ Datos persistentes en la nube
- ✅ Deploy automático desde GitHub

---

## 📞 PRÓXIMOS PASOS

Si quieres agregar más funcionalidades después:
- 🔐 Autenticación (login en la nube)
- 📊 Análisis en tiempo real
- 🔔 Notificaciones
- 📱 Sincronización entre dispositivos

---

**¿Necesitas ayuda con algún paso?** Pregunta 😊
