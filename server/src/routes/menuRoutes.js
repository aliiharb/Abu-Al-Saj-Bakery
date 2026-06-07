import { Router } from 'express';
import { requireAuth } from '../auth.js';
import * as menuRepository from '../repositories/menuRepository.js';
import { asyncHandler } from '../utils/http.js';
import { normalizeAvailabilityPayload, normalizeCategoryPayload, normalizeItemPayload } from '../validation.js';

const router = Router();

router.get(
  '/categories',
  asyncHandler(async (req, res) => {
    const categories = await menuRepository.listCategoriesWithItems({
      includeUnavailable: req.query.includeUnavailable === 'true',
      forceFallback: req.query.fallback === 'true'
    });

    res.json(categories);
  })
);

router.get(
  '/items',
  asyncHandler(async (_req, res) => {
    res.json(await menuRepository.listItems());
  })
);

router.post(
  '/items',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = normalizeItemPayload(req.body);
    res.status(201).json(await menuRepository.createItem(item));
  })
);

router.put(
  '/items/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = normalizeItemPayload(req.body);
    const updated = await menuRepository.updateItem(req.params.id, item);

    if (!updated) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    res.json(updated);
  })
);

router.patch(
  '/items/:id/availability',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { available } = normalizeAvailabilityPayload(req.body);
    const updated = await menuRepository.updateItemAvailability(req.params.id, available);

    if (!updated) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    res.json(updated);
  })
);

router.delete(
  '/items/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const deleted = await menuRepository.deleteItem(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    res.status(204).send();
  })
);

router.post(
  '/categories',
  requireAuth,
  asyncHandler(async (req, res) => {
    const category = normalizeCategoryPayload(req.body);
    res.status(201).json(await menuRepository.createCategory(category));
  })
);

router.put(
  '/categories/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const category = normalizeCategoryPayload(req.body);
    const updated = await menuRepository.updateCategory(req.params.id, category);

    if (!updated) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.json(updated);
  })
);

router.delete(
  '/categories/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const deleted = await menuRepository.deleteCategory(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    res.status(204).send();
  })
);

export default router;
