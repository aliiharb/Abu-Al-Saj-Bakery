import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
      return res.status(500).json({
        error: 'Server auth environment variables are not configured'
      });
    }

    const validUsername = username === process.env.ADMIN_USERNAME;
    const storedPassword = process.env.ADMIN_PASSWORD;
    let passwordOk = false;

    if (storedPassword?.startsWith('$2')) {
      passwordOk = await bcrypt.compare(password, storedPassword);
    } else {
      passwordOk = password === storedPassword;
    }

    if (!validUsername || !passwordOk) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const token = jwt.sign({ username, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '24h'
    });

    return res.json({ token });
  } catch (error) {
    console.error('Admin login failed:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
