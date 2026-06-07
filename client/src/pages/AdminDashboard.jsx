import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutList, Loader2, LogOut, Plus, RefreshCcw, Tags } from 'lucide-react';
import CategoriesPanel from '../components/admin/CategoriesPanel.jsx';
import ItemModal from '../components/admin/ItemModal.jsx';
import ItemsTable from '../components/admin/ItemsTable.jsx';
import SidebarButton from '../components/admin/SidebarButton.jsx';
import api from '../api.js';

const emptyCategory = {
  name_ar: '',
  name_en: '',
  sort_order: 0
};

const MAX_UPLOAD_BYTES = 650 * 1024;
const MAX_IMAGE_DIMENSION = 1200;
const IMAGE_QUALITY_STEPS = [0.82, 0.72, 0.62, 0.52];
const LOWEST_IMAGE_QUALITY = IMAGE_QUALITY_STEPS[IMAGE_QUALITY_STEPS.length - 1];

function emptyItem(categoryId = '') {
  return {
    category_id: categoryId,
    name_ar: '',
    name_en: '',
    description_ar: '',
    description_en: '',
    price: '',
    image_url: '',
    available: true,
    sort_order: 0
  };
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Could not prepare image for upload.'));
        }
      },
      type,
      quality
    );
  });
}

async function resizeImageForUpload(file) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.src = imageUrl;
    await image.decode();

    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, width, height);

    for (const quality of IMAGE_QUALITY_STEPS) {
      const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
      if (blob.size <= MAX_UPLOAD_BYTES || quality === LOWEST_IMAGE_QUALITY) {
        return new File([blob], `${file.name.replace(/\.[^.]+$/, '') || 'menu-item'}.jpg`, {
          type: 'image/jpeg'
        });
      }
    }
  } finally {
    URL.revokeObjectURL(imageUrl);
  }

  return file;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState('items');
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [togglingItemIds, setTogglingItemIds] = useState(() => new Set());
  const [error, setError] = useState('');
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemForm, setItemForm] = useState(emptyItem());
  const [categoryForm, setCategoryForm] = useState(emptyCategory);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  useEffect(() => {
    refreshData();
  }, []);

  const categoryOptions = useMemo(
    () => categories.map((category) => ({ value: category.id, label: category.name_ar })),
    [categories]
  );

  function logout() {
    localStorage.removeItem('abu_saj_token');
    navigate('/admin', { replace: true });
  }

  function handleApiError(apiError, fallback) {
    setError(apiError.response?.data?.message || fallback);
    if (apiError.response?.status === 401) logout();
  }

  function itemWithCategoryNames(item, fallback = {}) {
    const category = categories.find((currentCategory) => Number(currentCategory.id) === Number(item.category_id));

    return {
      ...fallback,
      ...item,
      category_name_ar: category?.name_ar || fallback.category_name_ar || null,
      category_name_en: category?.name_en || fallback.category_name_en || null,
      category_sort_order: category?.sort_order || fallback.category_sort_order || 0
    };
  }

  async function refreshData({ showLoading = true } = {}) {
    if (showLoading) {
      setLoading(true);
    }
    setError('');

    try {
      const cacheBuster = Date.now();
      const [itemsResponse, categoriesResponse] = await Promise.all([
        api.get('/api/items', { params: { _: cacheBuster } }),
        api.get('/api/categories', { params: { includeUnavailable: true, _: cacheBuster } })
      ]);

      setItems(itemsResponse.data);
      setCategories(categoriesResponse.data);
    } catch (apiError) {
      handleApiError(apiError, 'Could not load dashboard data.');
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }

  function openNewItem() {
    setEditingItemId(null);
    setItemForm(emptyItem(categoryOptions[0]?.value || ''));
    setItemModalOpen(true);
  }

  function openEditItem(item) {
    setEditingItemId(item.id);
    setItemForm({
      category_id: item.category_id || '',
      name_ar: item.name_ar || '',
      name_en: item.name_en || '',
      description_ar: item.description_ar || '',
      description_en: item.description_en || '',
      price: item.price || '',
      image_url: item.image_url || '',
      available: item.available !== false,
      sort_order: item.sort_order || 0
    });
    setItemModalOpen(true);
  }

  function updateItemForm(field, value) {
    setItemForm((current) => ({ ...current, [field]: value }));
  }

  async function uploadImage(file) {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const preparedFile = await resizeImageForUpload(file);
      const formData = new FormData();
      formData.append('image', preparedFile);
      const response = await api.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!response.data?.url) {
        throw new Error('Image upload did not return a URL.');
      }

      updateItemForm('image_url', response.data.url);
    } catch (apiError) {
      handleApiError(apiError, 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  }

  async function saveItem(event) {
    event.preventDefault();
    if (uploading) return;

    setSaving(true);
    setError('');

    const payload = {
      ...itemForm,
      category_id: Number(itemForm.category_id),
      price: Number(itemForm.price),
      sort_order: Number(itemForm.sort_order || 0)
    };

    try {
      let savedItem;
      if (editingItemId) {
        const response = await api.put(`/api/items/${editingItemId}`, payload);
        savedItem = response.data;

        setItems((currentItems) =>
          currentItems.map((currentItem) =>
            Number(currentItem.id) === Number(editingItemId) ? itemWithCategoryNames(savedItem, currentItem) : currentItem
          )
        );
      } else {
        const response = await api.post('/api/items', payload);
        savedItem = response.data;

        setItems((currentItems) => [...currentItems, itemWithCategoryNames(savedItem)]);
      }
      setItemModalOpen(false);
    } catch (apiError) {
      handleApiError(apiError, 'Could not save item.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailability(item) {
    const nextAvailable = !(item.available !== false);

    setTogglingItemIds((current) => new Set(current).add(item.id));
    setItems((currentItems) =>
      currentItems.map((currentItem) =>
        currentItem.id === item.id ? { ...currentItem, available: nextAvailable } : currentItem
      )
    );
    try {
      const response = await api.patch(`/api/items/${item.id}/availability`, {
        available: nextAvailable
      });
      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id
            ? {
                ...currentItem,
                ...response.data,
                category_name_ar: currentItem.category_name_ar,
                category_name_en: currentItem.category_name_en
              }
            : currentItem
        )
      );
    } catch (apiError) {
      setItems((currentItems) =>
        currentItems.map((currentItem) =>
          currentItem.id === item.id ? { ...currentItem, available: item.available !== false } : currentItem
        )
      );
      handleApiError(apiError, 'Could not update availability.');
    } finally {
      setTogglingItemIds((current) => {
        const next = new Set(current);
        next.delete(item.id);
        return next;
      });
    }
  }

  async function deleteItem(item) {
    if (!window.confirm(`Delete ${item.name_ar}?`)) return;

    try {
      await api.delete(`/api/items/${item.id}`);
      await refreshData();
    } catch (apiError) {
      handleApiError(apiError, 'Could not delete item.');
    }
  }

  async function saveCategory(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      ...categoryForm,
      sort_order: Number(categoryForm.sort_order || 0)
    };

    try {
      if (editingCategoryId) {
        await api.put(`/api/categories/${editingCategoryId}`, payload);
      } else {
        await api.post('/api/categories', payload);
      }
      setCategoryForm(emptyCategory);
      setEditingCategoryId(null);
      await refreshData();
    } catch (apiError) {
      handleApiError(apiError, 'Could not save category.');
    } finally {
      setSaving(false);
    }
  }

  function editCategory(category) {
    setEditingCategoryId(category.id);
    setCategoryForm({
      name_ar: category.name_ar || '',
      name_en: category.name_en || '',
      sort_order: category.sort_order || 0
    });
  }

  async function deleteCategory(category) {
    if (!window.confirm(`Delete ${category.name_ar} and its items?`)) return;

    try {
      await api.delete(`/api/categories/${category.id}`);
      await refreshData();
    } catch (apiError) {
      handleApiError(apiError, 'Could not delete category.');
    }
  }

  return (
    <main className="admin-shell min-h-screen" dir="ltr">
      <div className="flex min-h-screen flex-col md:flex-row">
        <AdminSidebar view={view} onLogout={logout} onViewChange={setView} />

        <section className="min-w-0 flex-1 p-4 sm:p-6">
          <DashboardHeader activeView={view} onAddItem={openNewItem} onRefresh={refreshData} />

          {error ? (
            <div className="mb-4 rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="flex h-60 items-center justify-center text-stone-300">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : view === 'items' ? (
            <ItemsTable
              items={items}
              togglingItemIds={togglingItemIds}
              onEdit={openEditItem}
              onDelete={deleteItem}
              onToggle={toggleAvailability}
            />
          ) : (
            <CategoriesPanel
              categories={categories}
              form={categoryForm}
              editingId={editingCategoryId}
              saving={saving}
              onChange={(field, value) => setCategoryForm((current) => ({ ...current, [field]: value }))}
              onCancel={() => {
                setEditingCategoryId(null);
                setCategoryForm(emptyCategory);
              }}
              onDelete={deleteCategory}
              onEdit={editCategory}
              onSubmit={saveCategory}
            />
          )}
        </section>
      </div>

      <ItemModal
        categories={categoryOptions}
        form={itemForm}
        isOpen={itemModalOpen}
        isEditing={Boolean(editingItemId)}
        saving={saving}
        uploading={uploading}
        error={error}
        onChange={updateItemForm}
        onClose={() => setItemModalOpen(false)}
        onImageDelete={() => updateItemForm('image_url', '')}
        onImageUpload={uploadImage}
        onSubmit={saveItem}
      />
    </main>
  );
}

function AdminSidebar({ view, onLogout, onViewChange }) {
  return (
    <aside className="border-b border-white/10 bg-black/25 p-4 md:w-64 md:border-b-0 md:border-r">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase text-gold-300/70">Abu Al-Saj</p>
        <h1 className="mt-1 text-2xl font-bold text-white">Dashboard</h1>
      </div>

      <nav className="flex gap-2 md:flex-col">
        <SidebarButton active={view === 'items'} icon={LayoutList} label="Items" onClick={() => onViewChange('items')} />
        <SidebarButton active={view === 'categories'} icon={Tags} label="Categories" onClick={() => onViewChange('categories')} />
      </nav>

      <button
        type="button"
        onClick={onLogout}
        className="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-stone-200 transition hover:bg-white/10"
      >
        <LogOut size={17} />
        Logout
      </button>
    </aside>
  );
}

function DashboardHeader({ activeView, onAddItem, onRefresh }) {
  return (
    <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-white">{activeView === 'items' ? 'Items' : 'Categories'}</h2>
        <p className="text-sm text-stone-400">Manage the live public menu.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onRefresh}
          className="focus-ring inline-flex items-center justify-center gap-2 rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-stone-200 transition hover:bg-white/10"
        >
          <RefreshCcw size={16} />
          Refresh
        </button>
        {activeView === 'items' ? (
          <button
            type="button"
            onClick={onAddItem}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-gold-500 px-3 py-2 text-sm font-bold text-black transition hover:bg-gold-400"
          >
            <Plus size={16} />
            Add Item
          </button>
        ) : null}
      </div>
    </header>
  );
}
