import multer from 'multer';
import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { downloadMenuImage, uploadMenuImage } from '../services/storageService.js';
import { asyncHandler } from '../utils/http.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

function requestBaseUrl(req) {
  const forwardedProtocol = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const protocol = forwardedProtocol || req.protocol;
  return `${protocol}://${req.get('host')}`;
}

router.post(
  '/upload',
  requireAuth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file received.' });
    }

    res.status(201).json(await uploadMenuImage(req.file, { baseUrl: requestBaseUrl(req) }));
  })
);

router.get(
  '/images',
  asyncHandler(async (req, res) => {
    const objectPath = String(req.query.path || '').trim();

    if (!objectPath) {
      return res.status(400).json({ message: 'Image path is required.' });
    }

    const image = await downloadMenuImage(objectPath);

    res.set({
      'Cache-Control': 'public, max-age=31536000, immutable',
      'Content-Type': image.contentType
    });
    res.send(image.buffer);
  })
);

export default router;
