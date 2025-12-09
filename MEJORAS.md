# Reporte de Mejoras y Feedback (Sistema de Laboratorio Remoto)
*Por Jules, Ingeniero en Sistemas*

Este documento detalla el análisis del estado actual del proyecto, identifica vulnerabilidades y áreas de mejora en UX, y propone una hoja de ruta para futuras implementaciones.

---

## 1. Seguridad 🔒

### Estado Actual:
- **Autenticación:** Uso correcto de JWT en cookies `httpOnly`. Contraseñas hasheadas con `bcrypt`.
- **Roles:** Implementación básica de roles ('user', 'admin') y middleware `isAdmin`.
- **Vulnerabilidades Detectadas:**
    1.  **Rate Limiting Inexistente:** Los endpoints de login y registro son vulnerables a ataques de fuerza bruta. No hay límite de intentos.
    2.  **Validación de Entradas Débil:** Se confía en la validación del frontend. El backend acepta cualquier string como email o contraseña sin verificar longitud mínima o complejidad.
    3.  **CORS Permisivo:** El backend podría estar aceptando peticiones de cualquier origen si no se configura `cors` explícitamente con dominios permitidos.
    4.  **Exposición de IDs:** Se usan IDs secuenciales (1, 2, 3...) en la base de datos. Esto permite enumeración de usuarios (`/profile/1`, `/profile/2`).
    5.  **HTTPS:** Las cookies no tienen el flag `secure: true` activado, lo cual es inseguro si no se despliega bajo HTTPS.

### Recomendaciones:
- Implementar `express-rate-limit` para bloquear IPs tras 5 intentos fallidos de login.
- Usar `express-validator` en el backend para forzar contraseñas de +8 caracteres y emails válidos.
- Migrar a **UUIDs** en lugar de IDs enteros para los usuarios.
- Configurar cabeceras de seguridad con `helmet`.

---

## 2. UI/UX (Experiencia de Usuario) 🎨

### Puntos Fuertes:
- **Diseño SPA:** La aplicación se siente rápida al no recargar la página.
- **Onboarding:** La pantalla de bienvenida personalizada mejora la retención.
- **Feedback Visual:** Uso de modales y alertas para confirmar acciones destructivas.

### Áreas de Mejora:
1.  **Navegación Móvil:**
    - El menú hamburguesa de Bootstrap funciona, pero al hacer clic en un enlace, el menú no se cierra automáticamente, tapando el contenido.
    - **Solución:** Añadir un listener de JS para colapsar el menú al seleccionar una opción.

2.  **Validación en Tiempo Real:**
    - El usuario solo sabe que su contraseña es corta o su email inválido al enviar el formulario.
    - **Solución:** Mostrar mensajes de error debajo de los inputs mientras el usuario escribe (ej: "La contraseña debe tener 8 caracteres").

3.  **Estado de Carga (Loading States):**
    - Al iniciar sesión o crear un turno, no siempre hay un indicador visual de "Cargando..." en el botón, lo que puede llevar a múltiples clics.
    - **Solución:** Añadir spinners (`<span class="spinner-border">`) dentro de los botones durante peticiones async.

4.  **Accesibilidad:**
    - Faltan atributos `aria-label` en botones que solo tienen iconos (ej: botón de editar perfil).

---

## 3. Arquitectura y Código 🏗️

### Observaciones:
- **Monolito Frontend:** Todo el código JS del frontend vive en `index.html`. A medida que crezca, será inmanejable.
    - **Solución:** Migrar a un framework ligero como Vue.js o React, o al menos separar la lógica en archivos `.js` modulares (`auth.js`, `dashboard.js`).
- **Gestión de Estado:** Se usan variables globales (`userId`, `currentSocketId`). Esto es propenso a errores.

---

## 4. Hoja de Ruta Sugerida 🚀

### Corto Plazo (1-2 Semanas):
- [ ] Implementar validación de formularios en tiempo real.
- [ ] Corregir el cierre del menú móvil.
- [ ] Añadir validación de complejidad de contraseña en backend.

### Mediano Plazo (1 Mes):
- [ ] **Historial de Experimentos:** Permitir a los usuarios ver un log de sus sesiones pasadas (fechas, datos de sensores).
- [ ] **Recuperación Real de Contraseña:** Integrar un servicio de email (SendGrid/Nodemailer) para enviar tokens de reset reales en lugar de depender del admin.

### Largo Plazo (3 Meses):
- [ ] **Streaming de Video:** Integrar una cámara web en el laboratorio para ver el experimento en tiempo real vía WebRTC.
- [ ] **Migración Frontend:** Refactorizar a React/Next.js para mejor escalabilidad.

---
*Fin del reporte.*
