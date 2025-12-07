# 🔬 Sistema de Laboratorio Remoto

Bienvenido al proyecto de Laboratorio Remoto. Este sistema permite a estudiantes e investigadores acceder y controlar equipos físicos a distancia, gestionando el acceso mediante una cola de espera inteligente.

## 🛠️ Tecnologías e Ingeniería de Sistemas

Este proyecto utiliza una arquitectura **Cliente-Servidor** moderna, implementando patrones de diseño robustos para garantizar escalabilidad y mantenimiento.

### Stack Tecnológico
*   **Backend Runtime:** [Node.js](https://nodejs.org/) (Entorno de ejecución asíncrono).
*   **Framework Web:** [Express.js](https://expressjs.com/) (Manejo de rutas REST API).
*   **Base de Datos:** [MySQL](https://www.mysql.com/) (Relacional) gestionada con [Sequelize ORM](https://sequelize.org/).
*   **Comunicación en Tiempo Real:** [Socket.IO](https://socket.io/) (WebSockets bidireccionales para control de latencia mínima).
*   **Frontend:** HTML5, CSS3, JavaScript (Vanilla + ES6 Modules) y [Bootstrap 5](https://getbootstrap.com/) para el diseño responsivo (SPA - Single Page Application).
*   **Contenedorización:** [Docker](https://www.docker.com/) y Docker Compose para orquestación de servicios.

### Arquitectura del Sistema
El proyecto sigue el patrón **MVC (Modelo-Vista-Controlador)**:
1.  **Modelos (`src/models`):** Definen la estructura de los datos (Usuarios, Turnos) y la interacción con la base de datos.
2.  **Controladores (`src/controllers`):** Contienen la lógica de negocio (Autenticación, Gestión de Colas).
3.  **Rutas (`src/routes`):** Mapean las URLs a los controladores correspondientes.
4.  **Vistas (Frontend):** La interfaz de usuario (`index.html`) que interactúa con el usuario final.

## 🚀 Guía de Instalación y Ejecución

### Requisitos Previos
*   Docker y Docker Compose instalados.
*   Node.js instalado (opcional si usas Docker, pero recomendado para desarrollo local).

### Pasos para Iniciar
1.  **Configurar Variables de Entorno:**
    Asegúrate de tener el archivo `.env` en la raíz (ya incluido en el repositorio) con la configuración correcta de base de datos.

2.  **Iniciar con Docker (Recomendado):**
    ```bash
    docker-compose up --build
    ```
    Esto levantará la base de datos MySQL y el servidor Node.js automáticamente.

3.  **Iniciar Manualmente (Desarrollo):**
    Si prefieres ejecutar el servidor localmente:
    ```bash
    npm install
    npm run dev
    ```
    *Nota: Asegúrate de que la base de datos MySQL esté corriendo.*

4.  **Acceder a la Aplicación:**
    Abre tu navegador en: `http://localhost:3000`

## 📖 Guía de Uso

### 1. Registro e Inicio de Sesión
*   Entra a la aplicación y selecciona **"Registro"** para crear una cuenta nueva.
*   Usa tus credenciales para iniciar sesión.
*   **Ingeniería:** El sistema utiliza *JWT (JSON Web Tokens)* (implícito en esta versión simple) o validación directa de credenciales hasheadas para seguridad.

### 2. Gestión de Perfil
*   Haz clic en tu nombre de usuario en la barra superior y selecciona **"Mi Perfil"**.
*   Puedes actualizar tu **Alias (Username)** y tu **Avatar**.
*   Los cambios se guardan en la base de datos MySQL de forma persistente.

### 3. Solicitar Turno (Cola FIFO)
*   En el **Panel de Control**, haz clic en **"Solicitar Turno"**.
*   El sistema te añadirá a una cola de espera (*First-In, First-Out*).
*   Cuando sea tu turno, recibirás una notificación en tiempo real gracias a los WebSockets.

### 4. Control del Experimento
*   Una vez activo, verás los controles para "Iniciar Experimento".
*   Recibirás datos de sensores (simulados) en tiempo real en tu pantalla.

### 5. Cerrar Sesión (Smart Logout)
*   Al cerrar sesión, el sistema detecta tu salida y **automáticamente libera tu turno** en la cola, permitiendo que el siguiente usuario avance inmediatamente.

## 📂 Estructura del Proyecto
```
.
├── src/
│   ├── config/         # Configuración de DB y entorno
│   ├── controllers/    # Lógica de negocio (Auth, Turnos)
│   ├── models/         # Definiciones de tablas (Sequelize)
│   ├── routes/         # Endpoints de la API
│   ├── server.js       # Punto de entrada del servidor
│   └── socket.handler.js # Lógica de WebSockets
├── public/             # Archivos estáticos (si los hubiera)
├── index.html          # Single Page Application (Frontend)
├── compose.yaml        # Configuración Docker
└── package.json        # Dependencias del proyecto
```

---
*Desarrollado para el curso de Laboratorio de Sistemas.*
