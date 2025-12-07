# Manual Técnico y de Usuario - Laboratorio Remoto

## 1. Visión General del Sistema
Este proyecto implementa un **Laboratorio Remoto** que permite a usuarios (estudiantes/investigadores) interactuar con hardware físico a través de una interfaz web en tiempo real.

### Arquitectura
El sistema sigue una arquitectura **Cliente-Servidor** utilizando un diseño **Single Page Application (SPA)**.

*   **Frontend (Cliente):** HTML5, CSS3 (Bootstrap 5), JavaScript (Vanilla). Se comunica con el backend mediante API REST (fetch) y WebSockets (Socket.io).
*   **Backend (Servidor):** Node.js con Express.
*   **Base de Datos:** MySQL.
*   **ORM:** Sequelize (para abstracción de base de datos).
*   **Comunicación Real-time:** Socket.io (para colas de espera y control de hardware).
*   **Contenedorización:** Docker y Docker Compose.

## 2. Tecnologías Clave

*   **Node.js & Express:** Manejo de rutas HTTP, lógica de negocio y autenticación.
*   **Sequelize:** Modelado de datos. Permite definir esquemas en código JS (`src/models`) que se sincronizan automáticamente con MySQL.
*   **Socket.io:** Esencial para este proyecto. Permite enviar datos del sensor en tiempo real al cliente y gestionar la "cesión de turno" sin recargar la página.
*   **Docker:** Garantiza que el entorno de ejecución (especialmente la versión de MySQL y Node) sea idéntico en desarrollo y producción.

## 3. Instrucciones de Despliegue (Cómo usarlo)

### Prerrequisitos
*   Docker Desktop instalado y corriendo.
*   Git.

### Pasos para iniciar
1.  **Clonar el repositorio:**
    ```bash
    git clone <url-del-repo>
    cd <carpeta-del-repo>
    ```

2.  **Iniciar los servicios:**
    Como ingeniero de sistemas, debes saber que este proyecto orquesta sus servicios mediante `compose.yaml`.
    ```bash
    docker compose up --build -d
    ```
    *   `--build`: Reconstruye la imagen si hubo cambios en `package.json`.
    *   `-d`: Ejecuta en segundo plano (detached).

3.  **Verificar Logs:**
    Si algo falla, lo primero es verificar los logs:
    ```bash
    docker compose logs -f app
    ```
    Busca el mensaje: `✅ Conexión a la base de datos establecida correctamente.`

4.  **Acceder a la Aplicación:**
    Abre tu navegador en: `http://localhost:3000`

### Solución de Problemas Comunes
*   **Error de Conexión a DB:** Asegúrate de que el contenedor `mysql` esté "healthy" o corriendo. A veces MySQL tarda unos segundos más en iniciar que la app de Node; la app debería reintentar o tú debes reiniciarla (`docker compose restart app`).
*   **No conecta Socket.io:** Verifica que no tengas bloqueadores de red o firewalls corporativos bloqueando el puerto 3000.

## 4. Flujo de Datos (Mejoras Implementadas)

### Autenticación
El sistema utiliza **JWT (JSON Web Tokens)** almacenados en cookies HTTP-Only para mayor seguridad.
1.  **Login:** El usuario envía credenciales -> Servidor valida y devuelve cookie con Token.
2.  **Persistencia:** Al recargar la página, el frontend consulta `/api/auth/me`. El servidor valida la cookie y restaura la sesión.

### Sistema de Turnos
1.  Usuario solicita turno -> Servidor lo añade a una cola (Queue) en memoria o BD.
2.  Cuando el hardware se libera, el servidor emite un evento `socket.emit('turno:ofrecido')` al siguiente socket ID en la lista.

## 5. Estructura de Archivos
*   `src/app.js`: Punto de entrada. Configura Express y Middlewares.
*   `src/models/`: Definición de tablas (User, Shift, etc.).
*   `src/controllers/`: Lógica de negocio (qué hacer cuando llega una petición).
*   `src/routes/`: Definición de endpoints API.
*   `src/config/`: Configuración de DB y variables de entorno.
