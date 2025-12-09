// auth/auth.routes.js
import express from 'express';
import { body } from 'express-validator';
import UserController from '../controllers/auth.controller.js';
import { isAdmin } from '../middlewares/isAdmin.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { validate } from '../middlewares/validate.js';

const router = express.Router();

// Validaciones
const registerValidation = [
    body('email').isEmail().withMessage('El email no es válido'),
    body('password').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
    validate
];

const loginValidation = [
    body('email').isEmail().withMessage('El email no es válido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
    validate
];

router.post('/register', authLimiter, registerValidation, UserController.register);
router.post('/login', authLimiter, loginValidation, UserController.login);
router.post('/logout', UserController.logout);
router.post('/request-reset', authLimiter, UserController.requestPasswordReset); // Public
router.get('/me', UserController.me);
router.get('/profile/:id', UserController.getProfile);
router.put('/profile/:id', UserController.updateProfile);
router.put('/change-password', UserController.changePassword);
router.delete('/delete', UserController.deleteAccount);

// Admin Routes
router.get('/admin/users', isAdmin, UserController.getAllUsers);
router.delete('/admin/users/:id', isAdmin, UserController.deleteUserByAdmin);
router.put('/admin/users/:id/password', isAdmin, UserController.resetUserPasswordByAdmin);

export default router;
