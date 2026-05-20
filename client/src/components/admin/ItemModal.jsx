import { Fragment } from 'react';
import { Dialog, DialogPanel, DialogTitle, Switch, Transition, TransitionChild } from '@headlessui/react';
import { ImageUp, Loader2, X } from 'lucide-react';
import FormField from './FormField.jsx';

export default function ItemModal({
  categories,
  form,
  isEditing,
  isOpen,
  saving,
  uploading,
  onChange,
  onClose,
  onImageUpload,
  onSubmit
}) {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto p-4">
          <div className="flex min-h-full items-center justify-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 translate-y-2"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-2"
            >
              <DialogPanel className="w-full max-w-3xl rounded-lg border border-white/10 bg-stone-950 p-5 text-stone-100 shadow-2xl">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <DialogTitle className="text-xl font-bold">{isEditing ? 'Edit Item' : 'Add Item'}</DialogTitle>
                  <button
                    type="button"
                    onClick={onClose}
                    className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-stone-300 hover:bg-white/10"
                    aria-label="Close"
                  >
                    <X size={17} />
                  </button>
                </div>

                <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Name Arabic">
                    <input
                      className="admin-input"
                      value={form.name_ar}
                      onChange={(event) => onChange('name_ar', event.target.value)}
                      required
                    />
                  </FormField>
                  <FormField label="Name English">
                    <input
                      className="admin-input"
                      value={form.name_en}
                      onChange={(event) => onChange('name_en', event.target.value)}
                    />
                  </FormField>
                  <FormField label="Description Arabic">
                    <textarea
                      className="admin-input min-h-24"
                      value={form.description_ar}
                      onChange={(event) => onChange('description_ar', event.target.value)}
                    />
                  </FormField>
                  <FormField label="Description English">
                    <textarea
                      className="admin-input min-h-24"
                      value={form.description_en}
                      onChange={(event) => onChange('description_en', event.target.value)}
                    />
                  </FormField>
                  <FormField label="Price">
                    <input
                      className="admin-input"
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={(event) => onChange('price', event.target.value)}
                      required
                    />
                  </FormField>
                  <FormField label="Category">
                    <select
                      className="admin-input"
                      value={form.category_id}
                      onChange={(event) => onChange('category_id', event.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select category
                      </option>
                      {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Sort Order">
                    <input
                      className="admin-input"
                      type="number"
                      value={form.sort_order}
                      onChange={(event) => onChange('sort_order', event.target.value)}
                    />
                  </FormField>
                  <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/30 px-3 py-3">
                    <span className="text-sm font-semibold text-stone-300">Available</span>
                    <Switch
                      checked={form.available}
                      onChange={(value) => onChange('available', value)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                        form.available ? 'bg-gold-500' : 'bg-stone-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                          form.available ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </Switch>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="mb-2 block text-sm font-semibold text-stone-300">Image Upload</span>
                    <div className="flex flex-col gap-3 rounded-md border border-white/10 bg-black/30 p-3 sm:flex-row sm:items-center">
                      {form.image_url ? (
                        <img className="h-20 w-20 rounded-md object-cover" src={form.image_url} alt={form.name_ar || 'Menu item'} />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-md bg-white/10 text-stone-500">
                          <ImageUp size={22} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <input
                          className="block w-full text-sm text-stone-300 file:mr-3 file:rounded-md file:border-0 file:bg-gold-500 file:px-3 file:py-2 file:font-bold file:text-black"
                          type="file"
                          accept="image/*"
                          onChange={(event) => onImageUpload(event.target.files?.[0])}
                        />
                        {uploading ? (
                          <p className="mt-2 inline-flex items-center gap-2 text-xs text-gold-300">
                            <Loader2 size={14} className="animate-spin" />
                            Uploading
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
                    <button
                      className="focus-ring rounded-md border border-white/10 px-4 py-2 text-sm font-semibold text-stone-200 transition hover:bg-white/10"
                      type="button"
                      onClick={onClose}
                    >
                      Cancel
                    </button>
                    <button
                      className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-gold-500 px-4 py-2 text-sm font-bold text-black transition hover:bg-gold-400 disabled:opacity-60"
                      type="submit"
                      disabled={saving || uploading}
                    >
                      {saving ? <Loader2 size={16} className="animate-spin" /> : null}
                      Save
                    </button>
                  </div>
                </form>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

