export default function IconButton({ icon: Icon, label, danger = false, onClick }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`focus-ring inline-flex h-9 w-9 items-center justify-center rounded-md border transition ${
        danger
          ? 'border-red-400/25 text-red-200 hover:bg-red-500/15'
          : 'border-white/10 text-stone-200 hover:bg-white/10'
      }`}
    >
      <Icon size={16} />
    </button>
  );
}

