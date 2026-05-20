import { Loader2, Pencil, Trash2 } from 'lucide-react';
import FormField from './FormField.jsx';
import IconButton from './IconButton.jsx';

export default function CategoriesPanel({
  categories,
  form,
  editingId,
  saving,
  onCancel,
  onChange,
  onDelete,
  onEdit,
  onSubmit
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(280px,360px)_1fr]">
      <form onSubmit={onSubmit} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
        <h3 className="mb-4 text-lg font-bold text-white">{editingId ? 'Edit Category' : 'Add Category'}</h3>
        <FormField label="Name Arabic">
          <input
            className="admin-input"
            value={form.name_ar}
            onChange={(event) => onChange('name_ar', event.target.value)}
            required
          />
        </FormField>
        <FormField label="Name English">
          <input className="admin-input" value={form.name_en} onChange={(event) => onChange('name_en', event.target.value)} />
        </FormField>
        <FormField label="Sort Order">
          <input
            className="admin-input"
            type="number"
            value={form.sort_order}
            onChange={(event) => onChange('sort_order', event.target.value)}
          />
        </FormField>
        <div className="mt-5 flex gap-2">
          <button
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-gold-500 px-3 py-2 text-sm font-bold text-black transition hover:bg-gold-400 disabled:opacity-60"
            disabled={saving}
            type="submit"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {editingId ? 'Update' : 'Add'}
          </button>
          {editingId ? (
            <button
              className="focus-ring rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-stone-200 transition hover:bg-white/10"
              type="button"
              onClick={onCancel}
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
        <div className="overflow-x-auto">
          <table className="min-w-[560px] w-full text-left text-sm">
            <thead className="bg-white/[0.06] text-xs uppercase text-stone-400">
              <tr>
                <th className="px-4 py-3">Arabic</th>
                <th className="px-4 py-3">English</th>
                <th className="px-4 py-3">Sort</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-4 py-3 font-semibold text-stone-100">{category.name_ar}</td>
                  <td className="px-4 py-3 text-stone-300">{category.name_en || '-'}</td>
                  <td className="px-4 py-3 text-stone-300">{category.sort_order || 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <IconButton label="Edit" icon={Pencil} onClick={() => onEdit(category)} />
                      <IconButton label="Delete" icon={Trash2} onClick={() => onDelete(category)} danger />
                    </div>
                  </td>
                </tr>
              ))}
              {!categories.length ? (
                <tr>
                  <td className="px-4 py-10 text-center text-stone-400" colSpan={4}>
                    No categories yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

