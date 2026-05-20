export default function SidebarButton({ active, icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition md:justify-start ${
        active ? 'bg-gold-500 text-black' : 'text-stone-200 hover:bg-white/10'
      }`}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}

