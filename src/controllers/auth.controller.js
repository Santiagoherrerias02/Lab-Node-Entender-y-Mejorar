// auth/auth.controller.js
import { registerUser, loginUser } from '../services/auth.service.js';
import jwt from 'jsonwebtoken';

export const UserController = {
  //Registrar usuario y guardarlo en la bd
  register: async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await registerUser(email, password);
      console.log("Usuario registrado exitosamente:", user.id);
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
        httpOnly: false, // Cambiar a false para que sea accesible desde JavaScript
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      });
      // Decodificar el token para obtener el userId
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('--------token decoded ----------', decoded)
      
      res.json({ 
        message: 'Login exitoso',
        userId: decoded.userId
      });
    } catch (err) {
      res.status(401).json({ error: err.message });
    }
  },
  //Cerrar sesión
  logout: (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Sesión cerrada' });
  }
}
export default UserController;