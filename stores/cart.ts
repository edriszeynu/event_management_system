import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  tierId: string;
  name: string;
  price: number;
  quantity: number;
  max: number;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
}

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  addItem: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeItem: (tierId: string) => void;
  updateQuantity: (tierId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      addItem: (item) => {
        const existing = get().items.find((i) => i.tierId === item.tierId);
        let newItems;
        if (existing) {
          newItems = get().items.map((i) =>
            i.tierId === item.tierId
              ? { ...i, quantity: Math.min(i.quantity + (item.quantity || 1), i.max) }
              : i
          );
        } else {
          newItems = [
            ...get().items,
            {
              ...item,
              quantity: item.quantity || 1,
            },
          ];
        }
        set({ items: newItems });
      },
      removeItem: (tierId) => {
        set({ items: get().items.filter((i) => i.tierId !== tierId) });
      },
      updateQuantity: (tierId, quantity) => {
        const items = get().items.map((i) =>
          i.tierId === tierId ? { ...i, quantity: Math.min(Math.max(1, quantity), i.max) } : i
        );
        set({ items });
      },
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },
      getItemCount: () => {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);