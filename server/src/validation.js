import { createHttpError } from './utils/http.js';

function optionalText(value) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text.length ? text : null;
}

function requiredText(value, fieldName) {
  const text = optionalText(value);
  if (!text) {
    throw createHttpError(400, `${fieldName} is required.`);
  }
  return text;
}

function parseInteger(value, fallback = 0) {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    throw createHttpError(400, 'Invalid integer value.');
  }
  return parsed;
}

function parsePrice(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw createHttpError(400, 'Price must be a positive number.');
  }
  return Math.round(parsed);
}

function parseBoolean(value, fallback = true) {
  if (value === undefined || value === null || value === '') return fallback;
  if (typeof value === 'boolean') return value;
  return ['true', '1', 'yes', 'on'].includes(String(value).toLowerCase());
}

export function normalizeItemPayload(body) {
  const categoryId = parseInteger(body.category_id, null);
  if (!categoryId) {
    throw createHttpError(400, 'Category is required.');
  }

  return {
    category_id: categoryId,
    name_ar: requiredText(body.name_ar, 'Arabic name'),
    name_en: optionalText(body.name_en),
    description_ar: optionalText(body.description_ar),
    description_en: optionalText(body.description_en),
    price: parsePrice(body.price),
    image_url: optionalText(body.image_url),
    available: parseBoolean(body.available, true),
    sort_order: parseInteger(body.sort_order, 0)
  };
}

export function normalizeCategoryPayload(body) {
  return {
    name_ar: requiredText(body.name_ar, 'Arabic category name'),
    name_en: optionalText(body.name_en),
    sort_order: parseInteger(body.sort_order, 0)
  };
}

