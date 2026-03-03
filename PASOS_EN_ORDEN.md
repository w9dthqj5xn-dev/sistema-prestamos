# 📋 PASOS A SEGUIR (EN ORDEN)

## 🔵 PASO 1: SUBIR A GITHUB (2 minutos)

### 1.1 Ir a GitHub y crear repositorio
```
1. Ve a https://github.com/new
2. Nombre: sistema-prestamos
3. Descripción: Sistema de gestión de préstamos y pagos
4. Selecciona: Public
5. Click: "Create repository"
6. COPIA la URL que aparece (ej: https://github.com/TU_USUARIO/sistema-prestamos.git)
```

### 1.2 En Terminal, conectar y subir
```bash
# Copiar exactamente, reemplazando TU_USUARIO por tu usuario GitHub
git remote add origin https://github.com/TU_USUARIO/sistema-prestamos.git
git branch -M main
git push -u origin main
```

**Resultado esperado:** El código sube a GitHub ✅

---

## 🟢 PASO 2: DESPLEGAR EN NETLIFY (3 minutos)

### 2.1 Ir a Netlify
```
1. Ve a https://app.netlify.com/signup
2. Click: "GitHub" (para registrarte con GitHub)
3. Autoriza Netlify
```

### 2.2 Crear sitio
```
1. Click: "Add new site"
2. Click: "Import an existing project"
3. Click: "GitHub"
4. Busca: sistema-prestamos
5. Click: Seleccionar repositorio
```

### 2.3 Configurar
```
- Build command: (DEJAR VACÍO)
- Publish directory: .
- Click: "Deploy site"
```

**Esperarás 2-3 minutos. Tu URL será:**
```
https://sistema-prestamos-xxxxx.netlify.app
```

**¡Sitio en vivo!** ✅

---

## 🟡 PASO 3: CREAR FIREBASE (5 minutos)

### 3.1 Crear proyecto
```
1. Ve a https://console.firebase.google.com
2. Click: "Agregar proyecto"
3. Nombre: sistema-prestamos
4. Click: "Continuar"
5. Desactiva: "Google Analytics" (opcional)
6. Click: "Crear proyecto"
7. ESPERA 1-2 minutos
```

### 3.2 Obtener credenciales
```
1. Haz clic en ⚙️ (esquina arriba derecha)
2. Click: "Configuración del proyecto"
3. Pestaña: "General"
4. Desplázate hasta: "Tus aplicaciones"
5. Click: Ícono </> para crear app web
6. Nombre: sistema-prestamos-web
7. Click: "Registrar aplicación"
8. COPIA TODO EL CÓDIGO (firebaseConfig)
```

**Código que copias se verá así:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "...firebaseapp.com",
  projectId: "sistema-prestamos-...",
  storageBucket: "...appspot.com",
  messagingSenderId: "...",
  appId: "1:...:web:..."
};
```

### 3.3 Crear Firestore Database
```
1. En Firebase Console, menú izquierdo: "Firestore Database"
2. Click: "Crear base de datos"
3. Selecciona: "Comenzar en modo de prueba"
4. Ubicación: Elige la más cercana (ej: us-east1)
5. Click: "Crear"
6. ESPERA a que se cree
```

**Base de datos en la nube!** ✅

---

## 🔴 PASO 4: CONECTAR FIREBASE A TU APP (5 minutos)

### 4.1 Crear archivo de configuración
```bash
# En tu terminal, en la carpeta del proyecto:
cat > firebase-config.js << 'EOF'
const firebaseConfig = {
  apiKey: "AQUI_TU_API_KEY",
  authDomain: "AQUI_TU_AUTH_DOMAIN",
  projectId: "AQUI_TU_PROJECT_ID",
  storageBucket: "AQUI_TU_STORAGE_BUCKET",
  messagingSenderId: "AQUI_TU_MESSAGING_SENDER_ID",
  appId: "AQUI_TU_APP_ID"
};

document.addEventListener('DOMContentLoaded', async () => {
  const initialized = await window.firebaseSync.inicializar(firebaseConfig);
  console.log('Firebase inicializado:', initialized);
});
EOF
```

### 4.2 Reemplazar valores
```
Abre firebase-config.js en tu editor
Reemplaza cada "AQUI_TU_..." con los valores que copiaste de Firebase
```

### 4.3 Guardar cambios
```bash
git add .
git commit -m "Agregar configuración Firebase"
git push origin main
```

**¡Netlify se actualizará automáticamente!** ✅

---

## ✅ ¡LISTO!

Ahora tienes:
- ✅ Sitio en: `https://sistema-prestamos-xxxxx.netlify.app`
- ✅ Base de datos en la nube
- ✅ Los datos se guardan en Firestore

---

## 🎯 RESUMEN RÁPIDO DE USUARIOS

**¿Usuario de GitHub?** (Sí/No)
**Tu usuario GitHub:** ______________________

Con esta info voy paso a paso contigo 😊

---

## 📚 ARCHIVOS DE AYUDA

- `GUIA_COMPLETA.md` - Guía detallada
- `QUICK_START.md` - Resumen rápido
- `firebase-sync.js` - Código Firebase ya listo
