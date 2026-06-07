import { fallbackCategories } from './seedData.js';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

let categories = fallbackCategories.map(({ items: _items, ...category }) => ({ ...category }));
let items = fallbackCategories.flatMap((category) =>
  (category.items || []).map((item, index) => ({
    category_id: category.id,
    description_ar: null,
    description_en: null,
    image_url: null,
    sort_order: (index + 1) * 10,
    created_at: new Date().toISOString(),
    ...item
  }))
);

let nextCategoryId = Math.max(...categories.map((category) => category.id), 0) + 1;
let nextItemId = Math.max(...items.map((item) => item.id), 0) + 1;

function sortByMenuOrder(left, right) {
  return (left.sort_order || 0) - (right.sort_order || 0) || left.id - right.id;
}

export function listCategoriesWithItems({ includeUnavailable = false } = {}) {
  const sortedItems = [...items].sort(sortByMenuOrder);

  return clone(
    [...categories].sort(sortByMenuOrder).map((category) => ({
      ...category,
      items: sortedItems.filter(
        (item) => item.category_id === category.id && (includeUnavailable || item.available !== false)
      )
    }))
  );
}

export function listItems() {
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  return clone(
    [...items].sort((left, right) => {
      const leftCategory = categoryById.get(left.category_id);
      const rightCategory = categoryById.get(right.category_id);
      return sortByMenuOrder(leftCategory || {}, rightCategory || {}) || sortByMenuOrder(left, right);
    }).map((item) => {
      const category = categoryById.get(item.category_id);
      return {
        ...item,
        category_name_ar: category?.name_ar || null,
        category_name_en: category?.name_en || null
      };
    })
  );
}

export function createItem(item) {
  const created = {
    id: nextItemId++,
    created_at: new Date().toISOString(),
    ...item
  };
  items.push(created);
  return clone(created);
}

export function updateItem(id, item) {
  const numericId = Number(id);
  const index = items.findIndex((current) => current.id === numericId);
  if (index === -1) return null;

  items[index] = {
    ...items[index],
    ...item,
    id: numericId
  };

  return clone(items[index]);
}

export function updateItemAvailability(id, available) {
  const numericId = Number(id);
  const index = items.findIndex((current) => current.id === numericId);
  if (index === -1) return null;

  items[index] = {
    ...items[index],
    available
  };

  return clone(items[index]);
}

export function deleteItem(id) {
  const numericId = Number(id);
  const before = items.length;
  items = items.filter((item) => item.id !== numericId);
  return items.length !== before;
}

export function createCategory(category) {
  const created = {
    id: nextCategoryId++,
    ...category
  };
  categories.push(created);
  return clone(created);
}

export function updateCategory(id, category) {
  const numericId = Number(id);
  const index = categories.findIndex((current) => current.id === numericId);
  if (index === -1) return null;

  categories[index] = {
    ...categories[index],
    ...category,
    id: numericId
  };

  return clone(categories[index]);
}

export function deleteCategory(id) {
  const numericId = Number(id);
  const before = categories.length;
  categories = categories.filter((category) => category.id !== numericId);
  items = items.filter((item) => item.category_id !== numericId);
  return categories.length !== before;
}
