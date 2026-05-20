import multer from 'multer';
import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { uploadMenuImage } from '../services/storageService.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.post(
  '/upload',
  requireAuth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file received.' });
    }

    res.status(201).json(await uploadMenuImage(req.file));
  })
);

export default router;

