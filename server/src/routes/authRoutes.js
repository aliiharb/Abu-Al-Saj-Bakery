import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/http.js';

const router = Router();

function passwordMatches(inputPassword, configuredPassword) {
  if (configuredPassword.startsWith('$2')) {
    return bcrypt.compare(inputPassword || '', configuredPassword);
  }
  return Promise.resolve(inputPassword === configuredPassword);
}

router.post(
  '/auth/login',
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Admin auth environment variables are not configured.' });
    }

    const validUsername = username === process.env.ADMIN_USERNAME;
    const validPassword = await passwordMatches(password, process.env.ADMIN_PASSWORD);

    if (!validUsername || !validPassword) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json({ token });
  })
);

export default router;

