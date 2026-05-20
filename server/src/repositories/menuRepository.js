import { query } from '../db.js';
import * as memoryStore from '../memoryStore.js';

const FALLBACK_ERROR_CODES = new Set([
  'ENOTFOUND',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'ECONNRESET',
  '28P01',
  '3D000',
  '42P01'
]);

function canUseMemoryFallback(error) {
  return !process.env.DATABASE_URL || FALLBACK_ERROR_CODES.has(error?.code);
}

async function withDatabaseFallback(databaseOperation, fallbackOperation) {
  if (!process.env.DATABASE_URL) {
    return fallbackOperation();
  }

  try {
    return await databaseOperation();
  } catch (error) {
    if (!canUseMemoryFallback(error)) {
      throw error;
    }

    console.warn(`Using in-memory menu fallback: ${error.code || error.message}`);
    return fallbackOperation();
  }
}

export function listCategoriesWithItems({ includeUnavailable = false, forceFallback = false } = {}) {
  if (forceFallback) {
    return Promise.resolve(memoryStore.listCategoriesWithItems({ includeUnavailable }));
  }

  return withDatabaseFallback(
    async () => {
      const categoriesResult = await query(
        'SELECT id, name_ar, name_en, sort_order FROM categories ORDER BY sort_order ASC, id ASC'
      );
      const itemsResult = await query(
        `SELECT id, category_id, name_ar, name_en, description_ar, description_en, price,
                image_url, available, sort_order, created_at
         FROM menu_items
         ${includeUnavailable ? '' : 'WHERE available = TRUE'}
         ORDER BY sort_order ASC, id ASC`
      );

      const itemsByCategory = new Map();
      for (const item of itemsResult.rows) {
        const bucket = itemsByCategory.get(item.category_id) || [];
        bucket.push(item);
        itemsByCategory.set(item.category_id, bucket);
      }

      return categoriesResult.rows.map((category) => ({
        ...category,
        items: itemsByCategory.get(category.id) || []
      }));
    },
    () => memoryStore.listCategoriesWithItems({ includeUnavailable })
  );
}

export function listItems() {
  return withDatabaseFallback(
    async () => {
      const result = await query(
        `SELECT mi.id, mi.category_id, mi.name_ar, mi.name_en, mi.description_ar,
                mi.description_en, mi.price, mi.image_url, mi.available, mi.sort_order,
                mi.created_at, c.name_ar AS category_name_ar, c.name_en AS category_name_en
         FROM menu_items mi
         LEFT JOIN categories c ON c.id = mi.category_id
         ORDER BY c.sort_order ASC, mi.sort_order ASC, mi.id ASC`
      );
      return result.rows;
    },
    () => memoryStore.listItems()
  );
}

export function createItem(item) {
  return withDatabaseFallback(
    async () => {
      const result = await query(
        `INSERT INTO menu_items
         (category_id, name_ar, name_en, description_ar, description_en, price, image_url, available, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING *`,
        [
          item.category_id,
          item.name_ar,
          item.name_en,
          item.description_ar,
          item.description_en,
          item.price,
          item.image_url,
          item.available,
          item.sort_order
        ]
      );
      return result.rows[0];
    },
    () => memoryStore.createItem(item)
  );
}

export function updateItem(id, item) {
  return withDatabaseFallback(
    async () => {
      const result = await query(
        `UPDATE menu_items
         SET category_id = $1,
             name_ar = $2,
             name_en = $3,
             description_ar = $4,
             description_en = $5,
             price = $6,
             image_url = $7,
             available = $8,
             sort_order = $9
         WHERE id = $10
         RETURNING *`,
        [
          item.category_id,
          item.name_ar,
          item.name_en,
          item.description_ar,
          item.description_en,
          item.price,
          item.image_url,
          item.available,
          item.sort_order,
          id
        ]
      );
      return result.rowCount ? result.rows[0] : null;
    },
    () => memoryStore.updateItem(id, item)
  );
}

export function deleteItem(id) {
  return withDatabaseFallback(
    async () => {
      const result = await query('DELETE FROM menu_items WHERE id = $1 RETURNING id', [id]);
      return Boolean(result.rowCount);
    },
    () => memoryStore.deleteItem(id)
  );
}

export function createCategory(category) {
  return withDatabaseFallback(
    async () => {
      const result = await query(
        'INSERT INTO categories (name_ar, name_en, sort_order) VALUES ($1, $2, $3) RETURNING *',
        [category.name_ar, category.name_en, category.sort_order]
      );
      return result.rows[0];
    },
    () => memoryStore.createCategory(category)
  );
}

export function updateCategory(id, category) {
  return withDatabaseFallback(
    async () => {
      const result = await query(
        `UPDATE categories
         SET name_ar = $1, name_en = $2, sort_order = $3
         WHERE id = $4
         RETURNING *`,
        [category.name_ar, category.name_en, category.sort_order, id]
      );
      return result.rowCount ? result.rows[0] : null;
    },
    () => memoryStore.updateCategory(id, category)
  );
}

export function deleteCategory(id) {
  return withDatabaseFallback(
    async () => {
      const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
      return Boolean(result.rowCount);
    },
    () => memoryStore.deleteCategory(id)
  );
}

