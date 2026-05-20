export default function FormField({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-stone-300">{label}</span>
      {children}
    </label>
  );
}

