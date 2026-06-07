import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, LockKeyhole, MessageCircle, Phone, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { resolveImageUrl } from '../api.js';
import CartDrawer from '../components/CartDrawer.jsx';
import { useCart } from '../context/CartContext.jsx';
import { categoryNotes, fallbackCategories, formatPrice } from '../menuData.js';

export default function PublicMenu() {
  const [categories, setCategories] = useState(fallbackCategories);
  const [activeId, setActiveId] = useState(fallbackCategories[0]?.id);
  const [loading, setLoading] = useState(true);
  const [cartOpen, setCartOpen] = useState(false);
  const { itemCount } = useCart();
  const sectionRefs = useRef({});

  useEffect(() => {
    let mounted = true;

    api
      .get('/api/categories')
      .then((response) => {
        if (mounted && Array.isArray(response.data) && response.data.length) {
          setCategories(response.data);
          setActiveId(response.data[0].id);
        }
      })
      .catch(() => {
        if (mounted) {
          setCategories(fallbackCategories);
          setActiveId(fallbackCategories[0]?.id);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.dataset?.categoryId) {
          setActiveId(Number(visible.target.dataset.categoryId));
        }
      },
      { rootMargin: '-34% 0px -54% 0px', threshold: [0.2, 0.35, 0.55] }
    );

    Object.values(sectionRefs.current).forEach((section) => {
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, [categories]);

  const availableCategories = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        items: (category.items || []).filter((item) => item.available !== false)
      })),
    [categories]
  );

  function scrollToCategory(categoryId) {
    sectionRefs.current[categoryId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <main className="menu-page font-arabic" dir="rtl">
      <div className="menu-content mx-auto flex min-h-screen w-full max-w-3xl flex-col px-4 pb-10 pt-8 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="pb-6 text-center"
        >
          <div className="ornament-line mx-auto mb-4 max-w-sm text-sm">◆</div>
          <p className="text-xs font-semibold uppercase text-gold-300/80">Lebanese Saj Bakery</p>
          <h1 className="brand-title mt-2 font-display text-6xl font-bold leading-tight text-gold-300 sm:text-7xl">
            أبو الصاج
          </h1>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <a
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gold-500/35 bg-black/30 px-4 py-2 text-sm font-semibold text-gold-300 backdrop-blur focus-ring"
              href="tel:71968846"
            >
              <Phone size={16} />
              71968846
            </a>
            <Link
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gold-500/35 bg-gold-500/12 px-4 py-2 text-sm font-semibold text-gold-300 backdrop-blur transition hover:bg-gold-500/20 focus-ring"
              to="/admin"
            >
              <LockKeyhole size={16} />
              دخول الإدارة
            </Link>
          </div>
        </motion.header>

        <nav className="sticky top-0 z-20 -mx-4 border-y border-gold-500/25 bg-coal/92 px-4 py-3 shadow-gold backdrop-blur-md sm:-mx-6 sm:px-6">
          <div className="gold-scrollbar flex gap-3 overflow-x-auto pb-1">
            {availableCategories.map((category) => {
              const active = activeId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => scrollToCategory(category.id)}
                  className={`focus-ring shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${
                    active
                      ? 'border-gold-300 bg-gold-500 text-black shadow-[0_0_24px_rgba(201,168,76,0.22)]'
                      : 'border-gold-500/25 bg-white/[0.03] text-gold-300 hover:border-gold-400/70'
                  }`}
                >
                  {category.name_ar}
                </button>
              );
            })}
          </div>
        </nav>

        {loading ? (
          <div className="py-12 text-center text-sm text-gold-300/70">...</div>
        ) : (
          <div className="space-y-12 pt-8">
            {availableCategories.map((category, categoryIndex) => (
              <motion.section
                key={category.id}
                ref={(node) => {
                  sectionRefs.current[category.id] = node;
                }}
                data-category-id={category.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ delay: categoryIndex * 0.05, duration: 0.45 }}
                className="scroll-mt-24"
              >
                <div className="mb-6 text-center">
                  <h2 className="ribbon-title rounded px-8 py-2 font-display text-2xl font-bold">
                    {category.name_ar}
                  </h2>
                  {categoryNotes[category.name_ar] ? (
                    <p className="mt-4 text-sm font-semibold text-gold-300/75">{categoryNotes[category.name_ar]}</p>
                  ) : null}
                </div>

                <div className="space-y-3">
                  {category.items?.length ? (
                    category.items.map((item) => <MenuItem key={item.id} item={item} />)
                  ) : (
                    <div className="rounded border border-gold-500/20 bg-black/20 px-4 py-5 text-center text-sm text-stone-300">
                      لا توجد أصناف حالياً
                    </div>
                  )}
                </div>
              </motion.section>
            ))}
          </div>
        )}

        <footer className="mt-auto pt-14 text-center">
          <div className="ornament-line mx-auto mb-5 max-w-xs text-xs">◆</div>
          <a
            className="inline-flex items-center justify-center gap-2 rounded-full border border-gold-500/35 bg-gold-500/10 px-5 py-2 text-sm font-bold text-gold-300 transition hover:bg-gold-500/18 focus-ring"
            href="https://wa.me/96171968846"
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={17} />
            واتساب
          </a>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-sm font-semibold text-gold-300/75" dir="ltr">
            <span>Powered by Harb</span>
            <span aria-hidden="true">|</span>
            <a
              className="inline-flex items-center justify-center gap-2 text-gold-300 transition hover:text-gold-200 focus-ring"
              href="mailto:alimharb204@gmail.com"
            >
              alimharb204@gmail.com
            </a>
          </div>
        </footer>
      </div>

      <button
        type="button"
        className="focus-ring fixed bottom-5 right-4 z-40 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-gold-300/60 bg-gold-500 px-5 py-3 text-sm font-extrabold text-black shadow-[0_16px_42px_rgba(0,0,0,0.42)] transition hover:bg-gold-400 sm:right-6"
        onClick={() => setCartOpen(true)}
        aria-label={`Open cart with ${itemCount} items`}
      >
        <ShoppingCart size={19} />
        <span>Cart</span>
        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-black px-2 text-xs text-gold-300">
          {itemCount}
        </span>
      </button>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </main>
  );
}

function MenuItem({ item }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addItem(item);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 900);
  }

  return (
    <article className="group flex min-h-16 flex-col gap-3 border-b border-gold-500/18 bg-black/10 px-2 py-3 transition hover:border-gold-400/45 hover:bg-gold-500/[0.04] sm:flex-row sm:items-center">
      {item.image_url ? (
        <img
          className="h-16 w-16 shrink-0 rounded-full border border-gold-400/50 object-cover sm:h-14 sm:w-14"
          src={resolveImageUrl(item.image_url)}
          alt={item.name_ar}
          loading="lazy"
        />
      ) : null}
      <div className="min-w-0 self-stretch sm:self-auto">
        <h3 className="font-display text-xl font-semibold leading-snug text-stone-50">{item.name_ar}</h3>
        {item.description_ar ? <p className="mt-1 text-sm leading-6 text-stone-300/75">{item.description_ar}</p> : null}
      </div>
      <div className="hidden h-px min-w-8 flex-1 border-b border-dotted border-gold-500/45 group-hover:border-gold-300/80 sm:block" />
      <div className="flex w-full shrink-0 items-center justify-between gap-3 sm:w-auto sm:flex-col sm:items-end">
        <div className="font-semibold text-gold-300 sm:text-left">
          <span className="block text-lg leading-none">{formatPrice(item.price)}</span>
          <span className="text-[11px] text-gold-300/60">ل.ل</span>
        </div>
        <button
          type="button"
          className={`focus-ring inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition ${
            added
              ? 'border-green-300/50 bg-green-500/18 text-green-100'
              : 'border-gold-500/35 bg-gold-500/12 text-gold-300 hover:bg-gold-500/20'
          }`}
          onClick={handleAddToCart}
        >
          {added ? <Check size={16} /> : <ShoppingCart size={16} />}
          {added ? 'Added' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
