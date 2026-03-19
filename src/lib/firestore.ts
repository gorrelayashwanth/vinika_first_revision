// Firestore service layer — replaces localStorage store.ts
// All reads/writes now go to Firebase Firestore

import {
  collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc,
  deleteDoc, query, where, orderBy, onSnapshot, serverTimestamp,
  Timestamp, DocumentData, QueryConstraint, limit, writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Product, Order, User, Message, Coupon, Review, AdminSettings, AdminContent } from "@/lib/store";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const toData = (doc: DocumentData) => ({ id: doc.id, ...doc.data() });

// ─── USERS ───────────────────────────────────────────────────────────────────
export const getUser = async (uid: string): Promise<User | null> => {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as User) : null;
};

export const setUser = async (uid: string, data: Partial<User>) => {
  await setDoc(doc(db, "users", uid), data, { merge: true });
};

export const subscribeToUsers = (callback: (users: User[]) => void) => {
  return onSnapshot(collection(db, "users"), (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as User)));
  });
};

// ─── PRODUCTS ────────────────────────────────────────────────────────────────
export const getProducts = async (): Promise<Product[]> => {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
};

export const addProduct = async (product: Omit<Product, "id">) => {
  const ref = await addDoc(collection(db, "products"), {
    ...product,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateProduct = async (id: string, data: Partial<Product>) => {
  await updateDoc(doc(db, "products", id), { ...data, updatedAt: serverTimestamp() });
};

export const deleteProduct = async (id: string) => {
  await deleteDoc(doc(db, "products", id));
};

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  return onSnapshot(collection(db, "products"), (snap) => {
    const products = snap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
    callback(products);
  });
};

export const decrementStock = async (productId: string, qty: number) => {
  const ref = doc(db, "products", productId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const current = snap.data().stock || 0;
    await updateDoc(ref, { stock: Math.max(0, current - qty) });
  }
};

// ─── ORDERS ──────────────────────────────────────────────────────────────────
export const getOrders = async (userId?: string): Promise<Order[]> => {
  const constraints: QueryConstraint[] = [orderBy("date", "desc")];
  if (userId) constraints.unshift(where("userId", "==", userId));
  const snap = await getDocs(query(collection(db, "orders"), ...constraints));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
};

export const addOrder = async (order: Omit<Order, "id">): Promise<string> => {
  const ref = await addDoc(collection(db, "orders"), {
    ...order,
    createdAt: serverTimestamp(),
  });
  // Create admin notification
  await addDoc(collection(db, "notifications"), {
    type: "new_order",
    orderId: ref.id,
    orderRef: order.ref,
    total: order.total,
    customer: order.address?.name || "Customer",
    read: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const updateOrder = async (id: string, data: Partial<Order>) => {
  await updateDoc(doc(db, "orders", id), { ...data, updatedAt: serverTimestamp() });
};

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  return onSnapshot(
    query(collection(db, "orders"), orderBy("createdAt", "desc")),
    (snap) => {
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      callback(orders);
    }
  );
};

export const subscribeToUserOrders = (userId: string, callback: (orders: Order[]) => void) => {
  return onSnapshot(
    query(collection(db, "orders"), where("userId", "==", userId), orderBy("createdAt", "desc")),
    (snap) => {
      const orders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      callback(orders);
    }
  );
};

// ─── NOTIFICATIONS ───────────────────────────────────────────────────────────
export interface AdminNotification {
  id: string;
  type: "new_order" | "new_message" | "low_stock";
  orderId?: string;
  orderRef?: string;
  total?: number;
  customer?: string;
  productName?: string;
  read: boolean;
  createdAt: Timestamp;
}

export const subscribeToNotifications = (callback: (notifs: AdminNotification[]) => void) => {
  return onSnapshot(
    query(collection(db, "notifications"), where("read", "==", false), orderBy("createdAt", "desc"), limit(50)),
    (snap) => {
      const notifs = snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminNotification));
      callback(notifs);
    }
  );
};

export const markNotificationRead = async (id: string) => {
  await updateDoc(doc(db, "notifications", id), { read: true });
};

export const markAllNotificationsRead = async () => {
  const snap = await getDocs(query(collection(db, "notifications"), where("read", "==", false)));
  const batch = writeBatch(db);
  snap.docs.forEach(d => batch.update(d.ref, { read: true }));
  await batch.commit();
};

// ─── MESSAGES ────────────────────────────────────────────────────────────────
export const getMessages = async (): Promise<Message[]> => {
  const snap = await getDocs(query(collection(db, "messages"), orderBy("date", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
};

export const addMessage = async (msg: Omit<Message, "id">) => {
  const ref = await addDoc(collection(db, "messages"), { ...msg, createdAt: serverTimestamp() });
  // create admin notification
  await addDoc(collection(db, "notifications"), {
    type: "new_message",
    customer: msg.name,
    read: false,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const deleteMessage = async (id: string) => {
  await deleteDoc(doc(db, "messages", id));
};

// ─── COUPONS ─────────────────────────────────────────────────────────────────
export const getCoupons = async (): Promise<Coupon[]> => {
  const snap = await getDocs(collection(db, "coupons"));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Coupon));
};

export const saveCoupon = async (coupon: Coupon) => {
  if (coupon.id) {
    await setDoc(doc(db, "coupons", coupon.id), coupon);
  } else {
    await addDoc(collection(db, "coupons"), coupon);
  }
};

export const deleteCoupon = async (id: string) => {
  await deleteDoc(doc(db, "coupons", id));
};

export const applyCoupon = async (code: string, total: number) => {
  const snap = await getDocs(query(collection(db, "coupons"), where("code", "==", code.toUpperCase()), where("active", "==", true)));
  if (snap.empty) return { valid: false, discount: 0, message: "Invalid coupon code" };
  const coupon = snap.docs[0].data() as Coupon;
  if (new Date(coupon.expiryDate) < new Date()) return { valid: false, discount: 0, message: "Coupon has expired" };
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return { valid: false, discount: 0, message: "Coupon usage limit reached" };
  if (total < coupon.minOrderValue) return { valid: false, discount: 0, message: `Minimum order ₹${coupon.minOrderValue} required` };
  const discount = coupon.discountPercent > 0 ? Math.round(total * coupon.discountPercent / 100) : coupon.discountAmount;
  return { valid: true, discount, message: `Coupon applied! You save ₹${discount}`, couponId: snap.docs[0].id };
};

export const incrementCouponUsage = async (couponId: string) => {
  const ref = doc(db, "coupons", couponId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { usedCount: (snap.data().usedCount || 0) + 1 });
  }
};

// ─── REVIEWS ─────────────────────────────────────────────────────────────────
export const getReviews = async (productId?: string): Promise<Review[]> => {
  const constraints: QueryConstraint[] = [orderBy("date", "desc")];
  if (productId) constraints.unshift(where("productId", "==", productId));
  const snap = await getDocs(query(collection(db, "reviews"), ...constraints));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as Review));
};

export const addReview = async (review: Omit<Review, "id">) => {
  await addDoc(collection(db, "reviews"), { ...review, createdAt: serverTimestamp() });
};

export const deleteReview = async (id: string) => {
  await deleteDoc(doc(db, "reviews", id));
};

export const subscribeToReviews = (productId: string, callback: (reviews: Review[]) => void) => {
  return onSnapshot(
    query(collection(db, "reviews"), where("productId", "==", productId), orderBy("date", "desc")),
    (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
    }
  );
};

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
export const getSettings = async (): Promise<AdminSettings | null> => {
  const snap = await getDoc(doc(db, "config", "settings"));
  return snap.exists() ? (snap.data() as AdminSettings) : null;
};

export const setSettings = async (settings: AdminSettings) => {
  await setDoc(doc(db, "config", "settings"), settings);
};

// ─── CONTENT ─────────────────────────────────────────────────────────────────
export const getContent = async (): Promise<AdminContent | null> => {
  const snap = await getDoc(doc(db, "config", "content"));
  return snap.exists() ? (snap.data() as AdminContent) : null;
};

export const setContent = async (content: AdminContent) => {
  await setDoc(doc(db, "config", "content"), content);
};

// ─── LIVE CHAT ────────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  text: string;
  sender: "user" | "admin";
  senderName: string;
  createdAt: Timestamp;
}

export interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: "open" | "closed";
  lastMessage: string;
  lastMessageAt: Timestamp;
  unreadByAdmin: number;
}

export const createChatSession = async (userId: string, userName: string, userEmail: string): Promise<string> => {
  // Check if there's already an open session for this user
  const existing = await getDocs(
    query(collection(db, "chats"), where("userId", "==", userId), where("status", "==", "open"))
  );
  if (!existing.empty) return existing.docs[0].id;

  const ref = await addDoc(collection(db, "chats"), {
    userId, userName, userEmail,
    status: "open",
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    unreadByAdmin: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const sendChatMessage = async (sessionId: string, text: string, sender: "user" | "admin", senderName: string) => {
  await addDoc(collection(db, "chats", sessionId, "messages"), {
    text, sender, senderName,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, "chats", sessionId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
    ...(sender === "user" ? { unreadByAdmin: (await getDoc(doc(db, "chats", sessionId))).data()?.unreadByAdmin + 1 || 1 } : { unreadByAdmin: 0 }),
  });
};

export const subscribeToChatMessages = (sessionId: string, callback: (msgs: ChatMessage[]) => void) => {
  return onSnapshot(
    query(collection(db, "chats", sessionId, "messages"), orderBy("createdAt", "asc")),
    (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
    }
  );
};

export const subscribeToChatSessions = (callback: (sessions: ChatSession[]) => void) => {
  return onSnapshot(
    query(collection(db, "chats"), where("status", "==", "open"), orderBy("lastMessageAt", "desc")),
    (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatSession)));
    }
  );
};

export const closeChatSession = async (sessionId: string) => {
  await updateDoc(doc(db, "chats", sessionId), { status: "closed" });
};
