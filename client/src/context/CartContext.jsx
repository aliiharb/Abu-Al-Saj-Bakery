import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CART_STORAGE_KEY = 'abu_saj_cart';

const CartContext = createContext(null);

function normalizeCartItem(item) {
  return {
    id: item.id,
    name: item.name || item.name_ar || item.name_en || 'Menu item',
    price: Number(item.price || 0),
    image_url: item.image_url || '',
    quantity: Number(item.quantity || 1),
    note: item.note || ''
  };
}

function loadStoredCart() {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    return parsed.map(normalizeCartItem).filter((item) => item.id !== undefined && item.quantity > 0);
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadStoredCart);

  useEffect(() => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const value = useMemo(() => {
    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      cartItems,
      itemCount,
      total,
      addItem(item) {
        const nextItem = normalizeCartItem(item);

        setCartItems((currentItems) => {
          const existing = currentItems.find((cartItem) => cartItem.id === nextItem.id);

          if (!existing) {
            return [...currentItems, { ...nextItem, quantity: 1, note: '' }];
          }

          return currentItems.map((cartItem) =>
            cartItem.id === nextItem.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
          );
        });
      },
      updateQuantity(id, quantity) {
        setCartItems((currentItems) =>
          currentItems.map((item) => (item.id === id ? { ...item, quantity: Math.max(1, Number(quantity) || 1) } : item))
        );
      },
      updateNote(id, note) {
        setCartItems((currentItems) =>
          currentItems.map((item) => (item.id === id ? { ...item, note } : item))
        );
      },
      removeItem(id) {
        setCartItems((currentItems) => currentItems.filter((item) => item.id !== id));
      },
      clearCart() {
        setCartItems([]);
      }
    };
  }, [cartItems]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }

  return context;
}
