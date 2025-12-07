# Migración a Sequelize ORM

## ¿Por qué Sequelize?

### Ventajas sobre consultas SQL directas:

1. **Código más limpio y mantenible**
   - No más strings SQL largos
   - Sintaxis más legible
   - Menos propenso a errores

2. **Seguridad mejorada**
   - Protección automática contra SQL Injection
   - Validaciones integradas
   - Escapado automático de caracteres

3. **Relaciones fáciles de manejar**
   - Includes automáticos
   - Joins simplificados
   - Relaciones bidireccionales

4. **Funcionalidades avanzadas**
   - Migraciones automáticas
   - Seeders para datos de prueba
   - Hooks para lógica de negocio
   - Transacciones simplificadas

## Comparación de código

### Antes (SQL directo):
```javascript
// Crear shift
connection.query('INSERT INTO shift (id_usuario) VALUES (?)', [user_id], (err, result) => {
  if (err) return reject(err);
  resolve(result.insertId);
});

// Obtener shifts con usuario
connection.query(`
  SELECT s.*, u.username, u.email 
  FROM shift s 
  JOIN users u ON s.id_usuario = u.id
`, (err, result) => {
  if (err) return reject(err);
  resolve(result);
});
```

### Después (Sequelize):
```javascript
// Crear shift
const shift = await Shift.create({ id_usuario: userId });

// Obtener shifts con usuario
const shifts = await Shift.findAll({
  include: [{
    model: User,
    as: 'user',
    attributes: ['username', 'email']
  }]
});
```

## Estructura de archivos

```
src/
├── config/
│   ├── database.js          # Configuración de Sequelize
│   └── init-database.js     # Inicialización de BD
├── models/
│   ├── index.js             # Relaciones entre modelos
│   ├── user.model.js        # Modelo de Usuario
│   └── shift.model.js       # Modelo de Shift
└── controllers/
    ├── user.controller.js    # Controladores de Usuario
    └── shift.controller.js   # Controladores de Shift
```

## Comandos útiles de Sequelize

### Consultas básicas:
```javascript
// Crear
const user = await User.create({ username, email, password });

// Buscar por ID
const user = await User.findByPk(id);

// Buscar con condiciones
const user = await User.findOne({ where: { email } });

// Buscar todos
const users = await User.findAll();

// Actualizar
await user.update({ username: 'nuevo' });

// Eliminar
await user.destroy();
```

### Consultas con relaciones:
```javascript
// Incluir datos relacionados
const shifts = await Shift.findAll({
  include: [{
    model: User,
    as: 'user',
    attributes: ['username', 'email']
  }]
});

// Filtrar por relación
const users = await User.findAll({
  include: [{
    model: Shift,
    as: 'shifts',
    where: { created_at: { [Op.gte]: new Date() } }
  }]
});
```

### Operadores de consulta:
```javascript
const { Op } = require('sequelize');

// OR
User.findOne({
  where: {
    [Op.or]: [
      { email: email },
      { username: username }
    ]
  }
});

// AND
User.findAll({
  where: {
    role: 'admin',
    created_at: { [Op.gte]: new Date('2024-01-01') }
  }
});
```

## Migraciones (Opcional)

Para proyectos más grandes, puedes usar migraciones:

```bash
# Instalar CLI de Sequelize
npm install -g sequelize-cli

# Crear migración
sequelize migration:generate --name create-users

# Ejecutar migraciones
sequelize db:migrate

# Revertir migración
sequelize db:migrate:undo
```

## Variables de entorno necesarias

```env
DB_NAME=lab_node
DB_USER=root
DB_PASSWORD=tu_password
DB_HOST=localhost
JWT_SECRET=tu_secret_key
```

## Próximos pasos

1. **Instalar dependencias adicionales**:
   ```bash
   npm install bcryptjs jsonwebtoken
   ```

2. **Crear middleware de autenticación**:
   - Verificar tokens JWT
   - Proteger rutas

3. **Implementar validaciones**:
   - Usar express-validator
   - Validaciones de Sequelize

4. **Agregar logging**:
   - Winston para logs
   - Logs de consultas SQL

5. **Testing**:
   - Jest para tests unitarios
   - Supertest para tests de API 