import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  // Return formatting compatible with frontend expectations
  return res.status(400).json({
      message: 'Error de validación',
      errors: errors.array()
  });
};
