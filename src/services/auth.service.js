// auth/auth.service.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES;

export async function registerUser(email, password) {

  const user = await User.findByEmail(email);
  if (user) {
    throw new Error('El usuario ya existe');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const userCreated = await User.addUser(email, hashedPassword);

  return userCreated;
}

export async function loginUser(email, password) {
  const user = await User.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Credenciales inválidas');
  }
  const userId = user.id;
  
  const payload = { userId };
  
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES });
  
  // Verificar el token inmediatamente
  const decoded = jwt.verify(token, JWT_SECRET);
  
  return token;
}
