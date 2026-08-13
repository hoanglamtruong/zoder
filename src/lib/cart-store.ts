import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  lineId: string;
  productId: string;
  variantId: string | null;
  variantName: string | null;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
  shopId: string;
  shopName: string;
  quantity: number;
};

type NewCartItem = Omit<CartItem, "lineId" | "quantity">;

function toLineId(productId: string, variantId: string | null) {
  return variantId ? `${productId}:${variantId}` : productId;
}

type CartState = {
  items: CartItem[];
  addItem: (item: NewCartItem, quantity?: number) => void;
  removeItem: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const lineId = toLineId(item.productId, item.variantId);
          const existing = state.items.find((i) => i.lineId === lineId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.lineId === lineId ? { ...i, quantity: i.quantity + quantity } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, lineId, quantity }] };
        }),
      removeItem: (lineId) =>
        set((state) => ({ items: state.items.filter((i) => i.lineId !== lineId) })),
      setQuantity: (lineId, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.lineId === lineId ? { ...i, quantity } : i))
            .filter((i) => i.quantity > 0),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "zoder-cart" }
  )
);
