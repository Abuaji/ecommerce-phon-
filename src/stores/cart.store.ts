import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  sanityProductId: string;
  name: string;
  price: number;
  imageUrl?: string | undefined;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (sanityProductId: string) => void;
  updateQuantity: (sanityProductId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.sanityProductId === newItem.sanityProductId);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.sanityProductId === newItem.sanityProductId
                  ? { ...i, quantity: i.quantity + newItem.quantity }
                  : i
              ),
            };
          }
          return { items: [...state.items, newItem] };
        });
      },
      removeItem: (sanityProductId) => {
        set((state) => ({
          items: state.items.filter((i) => i.sanityProductId !== sanityProductId),
        }));
      },
      updateQuantity: (sanityProductId, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.sanityProductId === sanityProductId ? { ...i, quantity } : i
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      getSubtotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'ecommerce-cart-storage',
    }
  )
);
