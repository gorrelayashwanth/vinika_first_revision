import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { onAuthStateChange, syncFirebaseUser, logout as fbLogout } from "@/lib/firebaseAuth";
import {
  subscribeToProducts, addOrder, decrementStock,
  subscribeToUserOrders, applyCoupon as fbApplyCoupon,
  getSettings as fbGetSettings, getContent as fbGetContent,
  incrementCouponUsage
} from "@/lib/firestore";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { store } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import type { User, CartItem, Product, Order, AdminSettings, AdminContent } from "@/lib/store";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AppContextType {
  // Auth
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  logout: () => void;
  updateLocalUser: (u: User) => void;

  // Products (real-time)
  products: Product[];
  settings: AdminSettings;
  content: AdminContent;

  // Cart
  cart: CartItem[];
  cartCount: number;
  addToCart: (productId: string, qty: number, selectedVariant?: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Orders (real-time for logged-in user)
  orders: Order[];

  // Coupon
  applyCoupon: (code: string, total: number) => Promise<{ valid: boolean; discount: number; message: string; couponId?: string }>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};

// ─── Cart helpers using localStorage (cart is session-local) ─────────────────
const CART_KEY = "vinika_cart";
const loadCart = (): CartItem[] => {
  try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch { return []; }
};
const saveCart = (cart: CartItem[]) => localStorage.setItem(CART_KEY, JSON.stringify(cart));

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>(store.getProducts());
  const [settings, setSettings] = useState<AdminSettings>(store.getSettings());
  const [content, setContent] = useState<AdminContent>(store.getContent());
  const [cart, setCart] = useState<CartItem[]>(loadCart());
  const [orders, setOrders] = useState<Order[]>([]);
  const { toast } = useToast();

  // ── Auth listener ──
  useEffect(() => {
    const unsub = onAuthStateChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const profile = await syncFirebaseUser(fbUser);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  // ── Real-time products listener ──
  useEffect(() => {
    const unsub = subscribeToProducts(setProducts);
    return unsub;
  }, []);

  // ── Real-time settings/content listener ──
  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, "config", "settings"), (snap) => {
      if (snap.exists()) setSettings(snap.data() as AdminSettings);
    });
    const unsubContent = onSnapshot(doc(db, "config", "content"), (snap) => {
      if (snap.exists()) setContent(snap.data() as AdminContent);
    });
    return () => { unsubSettings(); unsubContent(); };
  }, []);

  // ── Real-time user orders listener ──
  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToUserOrders(user.id, setOrders);
    return unsub;
  }, [user?.id]);

  // ── Cart persistence ──
  const updateCart = useCallback((newCart: CartItem[]) => {
    setCart(newCart);
    saveCart(newCart);
  }, []);

  const addToCart = useCallback((productId: string, qty: number, selectedVariant?: string) => {
    const newCart = [...cart];
    const existing = newCart.find(c => c.productId === productId && c.selectedVariant === selectedVariant);
    if (existing) {
      existing.qty += qty;
    } else {
      newCart.push({ productId, qty, selectedVariant });
    }
    updateCart(newCart);
    const p = products.find(p => p.id === productId);
    toast({ title: "Added to cart!", description: `${p?.name || "Item"} ${selectedVariant ? `(${selectedVariant})` : ""} x${qty}` });
  }, [cart, products, toast, updateCart]);

  const updateCartQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      updateCart(cart.filter(c => c.productId !== productId));
    } else {
      updateCart(cart.map(c => c.productId === productId ? { ...c, qty } : c));
    }
  }, [cart, updateCart]);

  const removeFromCart = useCallback((productId: string) => {
    updateCart(cart.filter(c => c.productId !== productId));
  }, [cart, updateCart]);

  const clearCart = useCallback(() => updateCart([]), [updateCart]);

  const logout = useCallback(async () => {
    await fbLogout();
    setUser(null);
    setFirebaseUser(null);
    toast({ title: "Logged out" });
  }, [toast]);

  const updateLocalUser = useCallback((u: User) => setUser(u), []);

  const applyCoupon = useCallback(async (code: string, total: number) => {
    return await fbApplyCoupon(code, total);
  }, []);

  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  return (
    <AppContext.Provider value={{
      user, firebaseUser, loading, logout, updateLocalUser,
      products, cart, cartCount, addToCart, updateCartQty, removeFromCart, clearCart,
      orders, applyCoupon,
    }}>
      {children}
    </AppContext.Provider>
  );
};
