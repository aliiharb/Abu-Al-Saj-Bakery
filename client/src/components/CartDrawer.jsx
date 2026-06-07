import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { resolveImageUrl } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../menuData.js';

const DEFAULT_WHATSAPP_PHONE = '96171968846';
const WHATSAPP_PHONE = (import.meta.env.VITE_WHATSAPP_PHONE || DEFAULT_WHATSAPP_PHONE).replace(/\D/g, '');
const ORDER_TYPES = ['Pickup', 'Delivery'];

const initialCustomer = {
  name: '',
  phone: '',
  address: '',
  orderType: 'Pickup'
};

function formatCurrency(price) {
  return `${formatPrice(price)} LBP`;
}

function buildWhatsAppMessage({ cartItems, customer, total }) {
  const itemsText = cartItems
    .map((item, index) => {
      const subtotal = item.price * item.quantity;

      return `${index + 1}. ${item.name}
   Quantity: ${item.quantity}
   Unit price: ${formatCurrency(item.price)}
   Subtotal: ${formatCurrency(subtotal)}
   Notes: ${item.note?.trim() || 'no notes'}`;
    })
    .join('\n\n');

  return `New order from Abu Al-Saj website

Customer:
Name: ${customer.name.trim()}
Phone: ${customer.phone.trim() || 'not provided'}
Order type: ${customer.orderType}
Location: ${customer.address.trim() || 'not provided'}

Items:
${itemsText}

Total: ${formatCurrency(total)}

Please confirm this order.`;
}

function validateCheckout({ cartItems, customer }) {
  const errors = {};

  if (!cartItems.length) errors.cart = 'Your cart is empty.';
  if (!customer.name.trim()) errors.name = 'Customer name is required.';
  if (customer.orderType === 'Delivery' && !customer.address.trim()) {
    errors.address = 'Location/address is required for delivery.';
  }

  return errors;
}

export default function CartDrawer({ open, onClose }) {
  const cart = useCart();
  const [customer, setCustomer] = useState(initialCustomer);
  const [errors, setErrors] = useState({});
  const [orderNotice, setOrderNotice] = useState('');

  function updateCustomer(field, value) {
    setCustomer((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  }

  function handleClearCart() {
    cart.clearCart();
    setErrors({});
    setOrderNotice('');
  }

  function handleOrder() {
    setOrderNotice('');

    const nextErrors = validateCheckout({ cartItems: cart.cartItems, customer });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const message = buildWhatsAppMessage({
      cartItems: cart.cartItems,
      customer,
      total: cart.total
    });
    const url = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank', 'noopener,noreferrer');
    setOrderNotice('WhatsApp opened. You can clear the cart after sending your order.');
  }

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50" dir="ltr">
          <motion.button
            type="button"
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            aria-label="Close cart"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.aside
            className="absolute bottom-0 right-0 flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-lg border border-gold-500/30 bg-[#11100d] text-stone-100 shadow-2xl sm:bottom-auto sm:top-0 sm:h-full sm:max-h-none sm:max-w-lg sm:rounded-none sm:border-y-0 sm:border-r-0"
            initial={{ y: 44, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 44, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <CartHeader onClose={onClose} />

            <div className="gold-scrollbar flex-1 overflow-y-auto px-4 py-4">
              <FieldError message={errors.cart} className="mb-3" />
              <CartItems cart={cart} />
              <CheckoutForm customer={customer} errors={errors} onChange={updateCustomer} total={cart.total} />
            </div>

            <CartFooter notice={orderNotice} onClearCart={handleClearCart} onOrder={handleOrder} />
          </motion.aside>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

function CartHeader({ onClose }) {
  return (
    <header className="flex items-center justify-between border-b border-gold-500/20 px-4 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-gold-500 text-black">
          <ShoppingCart size={20} />
        </span>
        <div>
          <h2 className="text-lg font-bold text-gold-300">Your cart</h2>
          <p className="text-xs text-stone-400">Review items and order through WhatsApp</p>
        </div>
      </div>
      <button
        type="button"
        className="focus-ring flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-stone-200 transition hover:bg-white/[0.08]"
        onClick={onClose}
        aria-label="Close cart"
      >
        <X size={20} />
      </button>
    </header>
  );
}

function CartItems({ cart }) {
  if (!cart.cartItems.length) return <EmptyCart />;

  return (
    <div className="space-y-4">
      {cart.cartItems.map((item) => (
        <CartItemCard key={item.id} cart={cart} item={item} />
      ))}
    </div>
  );
}

function CartItemCard({ cart, item }) {
  return (
    <article className="rounded-md border border-gold-500/20 bg-black/25 p-3">
      <div className="flex gap-3">
        {item.image_url ? (
          <img
            className="h-14 w-14 shrink-0 rounded-md border border-gold-400/40 object-cover"
            src={resolveImageUrl(item.image_url)}
            alt={item.name}
            loading="lazy"
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-stone-50">{item.name}</h3>
          <p className="text-sm text-gold-300">{formatCurrency(item.price)}</p>
        </div>

        <button
          type="button"
          className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-red-300/25 bg-red-500/10 text-red-100 transition hover:bg-red-500/18"
          onClick={() => cart.removeItem(item.id)}
          aria-label={`Remove ${item.name}`}
        >
          <Trash2 size={17} />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <QuantityControls item={item} onChange={cart.updateQuantity} />
        <p className="text-sm font-bold text-stone-100">{formatCurrency(item.price * item.quantity)}</p>
      </div>

      <label className="mt-3 block">
        <span className="sr-only">Notes for {item.name}</span>
        <input
          className="focus-ring w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-stone-100 placeholder:text-stone-500"
          value={item.note}
          onChange={(event) => cart.updateNote(item.id, event.target.value)}
          placeholder="Notes for this item, e.g. no sesame, extra cheese"
        />
      </label>
    </article>
  );
}

function QuantityControls({ item, onChange }) {
  return (
    <div className="flex items-center overflow-hidden rounded-md border border-gold-500/25">
      <button
        type="button"
        className="focus-ring flex h-9 w-10 items-center justify-center bg-white/[0.04] text-gold-300 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={() => onChange(item.id, item.quantity - 1)}
        disabled={item.quantity <= 1}
        aria-label={`Decrease ${item.name} quantity`}
      >
        <Minus size={16} />
      </button>
      <span className="flex h-9 min-w-12 items-center justify-center px-3 text-sm font-bold">{item.quantity}</span>
      <button
        type="button"
        className="focus-ring flex h-9 w-10 items-center justify-center bg-white/[0.04] text-gold-300"
        onClick={() => onChange(item.id, item.quantity + 1)}
        aria-label={`Increase ${item.name} quantity`}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}

function EmptyCart() {
  return (
    <div className="rounded-md border border-gold-500/20 bg-black/25 px-4 py-8 text-center">
      <ShoppingCart className="mx-auto mb-3 text-gold-300" size={30} />
      <p className="font-semibold text-stone-100">Your cart is empty.</p>
      <p className="mt-1 text-sm text-stone-400">Add items from the menu to start an order.</p>
    </div>
  );
}

function CheckoutForm({ customer, errors, onChange, total }) {
  return (
    <section className="mt-5 border-t border-gold-500/18 pt-5">
      <div className="mb-4 flex items-center justify-between text-lg font-bold">
        <span>Total</span>
        <span className="text-gold-300">{formatCurrency(total)}</span>
      </div>

      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-stone-300">Customer name</span>
          <input
            className="focus-ring w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-stone-100"
            value={customer.name}
            onChange={(event) => onChange('name', event.target.value)}
            required
          />
          <FieldError message={errors.name} />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-stone-300">Phone number</span>
          <input
            className="focus-ring w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-stone-100"
            value={customer.phone}
            onChange={(event) => onChange('phone', event.target.value)}
          />
        </label>

        <fieldset>
          <legend className="mb-2 block text-sm font-semibold text-stone-300">Order type</legend>
          <div className="grid grid-cols-2 overflow-hidden rounded-md border border-gold-500/25">
            {ORDER_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className={`focus-ring px-3 py-2 text-sm font-bold transition ${
                  customer.orderType === type
                    ? 'bg-gold-500 text-black'
                    : 'bg-black/20 text-gold-300 hover:bg-gold-500/10'
                }`}
                onClick={() => onChange('orderType', type)}
              >
                {type}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-stone-300">
            Location/address {customer.orderType === 'Pickup' ? '(optional)' : ''}
          </span>
          <textarea
            className="focus-ring min-h-20 w-full resize-y rounded-md border border-white/10 bg-black/30 px-3 py-2 text-stone-100"
            value={customer.address}
            onChange={(event) => onChange('address', event.target.value)}
          />
          <FieldError message={errors.address} />
        </label>
      </div>
    </section>
  );
}

function CartFooter({ notice, onClearCart, onOrder }) {
  return (
    <footer className="border-t border-gold-500/20 bg-black/25 px-4 py-4">
      {notice ? (
        <div className="mb-3 rounded-md border border-green-300/30 bg-green-500/10 px-3 py-2 text-sm text-green-100">
          {notice}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          className="focus-ring inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-gold-500 px-4 py-2 font-bold text-black transition hover:bg-gold-400"
          onClick={onOrder}
        >
          <MessageCircle size={19} />
          Order via WhatsApp
        </button>
        <button
          type="button"
          className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 font-semibold text-stone-100 transition hover:bg-white/[0.08]"
          onClick={onClearCart}
        >
          <Trash2 size={17} />
          Clear cart
        </button>
      </div>
    </footer>
  );
}

function FieldError({ message, className = 'mt-1' }) {
  if (!message) return null;

  return <span className={`block text-xs text-red-200 ${className}`}>{message}</span>;
}
