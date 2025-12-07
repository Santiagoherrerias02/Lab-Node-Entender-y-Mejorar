// auth/auth.controller.js
import { registerUser, loginUser } from '../services/auth.service.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Shift } from '../models/index.js';

export const UserController = {
  //Registrar usuario y guardarlo en la bd
  register: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await registerUser(email, password);

      // Auto-login para onboarding
      const token = await loginUser(email, password);
      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      });

      res.status(201).json({ 
        message: 'Usuario registrado con éxito',
        userId: user.id 
      });
    } catch (err) {
      console.error('Error en registro:', err);
      res.status(400).json({ error: err.message });
    }
  },
  //Iniciar sesión y generar un token
  login: async (req, res) => {
    const { email, password } = req.body;
    try {
      const token = await loginUser(email, password);
      res.cookie('token', token, {
        httpOnly: true, // Seguro: no accesible por JS
        secure: false,  // Cambiar a true si usas HTTPS
        maxAge: 24 * 60 * 60 * 1000,
      });
      // Decodificar el token para obtener el userId
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      res.json({ 
        message: 'Login exitoso',
        userId: decoded.userId
      });
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  },
  //Cerrar sesión
  logout: async (req, res) => {
    // Si hay userId en el request (pasado por cliente o extraído de token si hubiera middleware)
    // Intentamos limpiar turno
    const { userId } = req.body;

    if (userId) {
        try {
            await Shift.destroy({ where: { id_usuario: userId } });
            // console.log(`Turnos eliminados para usuario ${userId} al hacer logout`);
        } catch (error) {
            console.error('Error limpiando turnos al logout:', error);
        }
    }

    res.clearCookie('token');
    res.json({ message: 'Sesión cerrada' });
  },

  // Obtener perfil
  getProfile: async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, { attributes: ['id', 'email', 'username', 'avatar'] });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
  },

  // Actualizar perfil
  updateProfile: async (req, res) => {
      try {
          const { username, avatar } = req.body;
          const user = await User.findByPk(req.params.id);
          if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

          user.username = username || user.username;
          user.avatar = avatar || user.avatar;
          await user.save();

          res.json({ message: 'Perfil actualizado', user: { id: user.id, username: user.username, avatar: user.avatar } });
      } catch (error) {
          if (error.name === 'SequelizeUniqueConstraintError') {
              return res.status(400).json({ message: 'El nombre de usuario ya está en uso. Elige otro.' });
          }
          res.status(500).json({ error: error.message });
      }
  },

  // Cambiar contraseña
  changePassword: async (req, res) => {
    try {
      const { userId, currentPassword, newPassword } = req.body;
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      // Verificar contraseña actual
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'La contraseña actual es incorrecta' });
      }

      // Hashear nueva contraseña
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();

      res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  // Verificar sesión (Me)
  me: async (req, res) => {
      try {
          const token = req.cookies.token;
          if (!token) {
              return res.status(401).json({ message: 'No autenticado' });
          }

          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const user = await User.findByPk(decoded.userId, { attributes: ['id', 'email', 'username', 'avatar'] });

          if (!user) {
             return res.status(404).json({ message: 'Usuario no encontrado' });
          }

          res.json({
              authenticated: true,
              user: user
          });
      } catch (error) {
          res.status(401).json({ message: 'Token inválido o expirado' });
      }
  },

  // Eliminar cuenta
  deleteAccount: async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: 'No autenticado' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Eliminar turnos activos
        await Shift.destroy({ where: { id_usuario: userId } });

        // Eliminar usuario
        const deleted = await User.destroy({ where: { id: userId } });

        if (deleted) {
            res.clearCookie('token');
            res.json({ message: 'Cuenta eliminada exitosamente' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }

    } catch (error) {
        console.error('Error al eliminar cuenta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}
export default UserController;