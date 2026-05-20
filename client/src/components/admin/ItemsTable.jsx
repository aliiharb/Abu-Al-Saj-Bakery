import { Switch } from '@headlessui/react';
import { ImageUp, Pencil, Trash2 } from 'lucide-react';
import { formatPrice } from '../../menuData.js';
import IconButton from './IconButton.jsx';

export default function ItemsTable({ items, onEdit, onDelete, onToggle }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.035]">
      <div className="overflow-x-auto">
        <table className="min-w-[880px] w-full text-left text-sm">
          <thead className="bg-white/[0.06] text-xs uppercase text-stone-400">
            <tr>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Name (AR)</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Available</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {items.map((item) => (
              <tr key={item.id} className="text-stone-200">
                <td className="px-4 py-3">
                  {item.image_url ? (
                    <img className="h-11 w-11 rounded-full object-cover" src={item.image_url} alt={item.name_ar} />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-stone-500">
                      <ImageUp size={17} />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 font-semibold">{item.name_ar}</td>
                <td className="px-4 py-3 text-stone-300">{item.category_name_ar || '-'}</td>
                <td className="px-4 py-3 text-gold-300">{formatPrice(item.price)}</td>
                <td className="px-4 py-3">
                  <Switch
                    checked={item.available !== false}
                    onChange={() => onToggle(item)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                      item.available !== false ? 'bg-gold-500' : 'bg-stone-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                        item.available !== false ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </Switch>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <IconButton label="Edit" icon={Pencil} onClick={() => onEdit(item)} />
                    <IconButton label="Delete" icon={Trash2} onClick={() => onDelete(item)} danger />
                  </div>
                </td>
              </tr>
            ))}
            {!items.length ? (
              <tr>
                <td className="px-4 py-10 text-center text-stone-400" colSpan={6}>
                  No items yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

