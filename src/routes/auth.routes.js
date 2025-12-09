// auth/auth.routes.js
import express from 'express';
import UserController from '../controllers/auth.controller.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = express.Router();

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.post('/logout', UserController.logout);
router.post('/request-reset', UserController.requestPasswordReset); // Public
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
