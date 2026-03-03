# 🚀 DESPLIEGUE RÁPIDO - CHEAT SHEET

## NETLIFY (RECOMENDADO - MÁS FÁCIL)

### Opción A: Via GitHub (sin terminal)
```
1. Ve a: https://app.netlify.com
2. Click "Add new site" → "Import existing project"
3. Conecta tu GitHub
4. Selecciona: sistema-prestamos
5. Deploy automático ✨
```

### Opción B: Via CLI (con terminal)
```bash
npm install -g netlify-cli
cd tu/ruta/proyecto
netlify deploy --prod
```

---

## FIREBASE

### Con terminal:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy

# URL: https://tu-proyecto.web.app
```

---

## ✅ CHECKLIST PRE-DESPLIEGUE

- [ ] Código listo (sin errores en consola)
- [ ] `.gitignore` actualizado
- [ ] Repositorio en GitHub
- [ ] `netlify.toml` configurado ✅ (ya está)
- [ ] `firebase.json` configurado ✅ (ya está)
- [ ] Pruebas locales OK (`npm http-server` o Python)

---

## 🎯 RESULTADO FINAL

Después del despliegue tendrás:

### En Netlify:
- URL: `https://tu-proyecto.netlify.app`
- Deploy automático en cada push a GitHub
- SSL/HTTPS incluido
- Analytics incluido

### En Firebase:
- URL: `https://tu-proyecto.web.app`
- Deploy manual con CLI
- SSL/HTTPS incluido
- Opción de agregar DB/Auth después

---

## 💾 DESPUÉS DEL DESPLIEGUE

```bash
# Ver logs
netlify logs  # Netlify
firebase hosting:log  # Firebase

# Actualizar despliegue
git push origin main  # (Auto en Netlify)
firebase deploy  # (Manual en Firebase)
```

---

**¿Preguntas? Ver DEPLOYMENT.md para guía completa** 📖
