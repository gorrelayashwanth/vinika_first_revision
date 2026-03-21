export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
}

export interface QuantityPrice {
  label: string; // e.g., "200gms"
  price: number;
}

export interface ProductHighlights {
  genericName: string;
  netQuantity: string;
  shelfLife: string;
  weight: string;
  fssaiLicense: string;
  vegNonVeg: string;
  countryOfOrigin: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  images: string[];
  description: string;
  ingredients: string[];
  benefits: string[];
  featured: boolean;
  category: string;
  stock: number;
  quantityPricing: QuantityPrice[];
  highlights: ProductHighlights;
}

export interface CartItem {
  productId: string;
  qty: number;
  selectedVariant?: string; // label of selected quantity variant
}

export interface Order {
  id: string;
  ref: string;
  userId: string;
  items: { productId: string; qty: number; price: number; name: string; variant?: string }[];
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;
  address: { name: string; phone: string; email: string; address: string; district: string; pincode: string; state: string; city?: string };
  paymentMethod: "razorpay" | "cod";
  paymentStatus: "paid" | "cod" | "failed";
  razorpayPaymentId?: string;
  status: "pending" | "confirmed" | "packed" | "dispatched" | "delivered" | "cancelled";
  deliveryPartner?: string;
  trackingId?: string;
  estimatedDelivery?: string;
  date: string;
}

export interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  date: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  discountAmount: number;
  minOrderValue: number;
  maxUses: number;
  usedCount: number;
  active: boolean;
  expiryDate: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface AdminSettings {
  announcementBar: string;
  shippingCharge: number;
  freeShippingThreshold: number;
  discountThreshold: number;
  discountPercent: number;
  razorpayEnabled: boolean;
  codEnabled: boolean;
  razorpayKey: string;
  contactAddress: string;
  contactPhone: string;
  contactEmail: string;
  contactHours: string;
}

export interface AdminContent {
  heroHeadline: string;
  heroSubtext: string;
  heroCTA1: string;
  heroCTA2: string;
  features: string[];
  statsNatural: string;
  statsAdditives: string;
  statsOrders: string;
  statsYears: string;
  aboutTeaser: string;
  aboutHero: string;
  values: string[];
  founderName: string;
  founderTitle: string;
  founderMessage: string;
  brandMission: string;
  brandVision: string;
  aboutProductsIntro: string;
  preparationSteps: string[];
  productFeatures: string[];
  productFeaturesFooter: string;
}

const defaultProducts: Product[] = [
  {
    id: "p1",
    name: "Andhra Pesarattu Premix",
    price: 149,
    mrp: 199,
    image: "",
    images: ["app-front", "app-ingredients", "app-back", "app-nutrition", "app-benefits"],
    description: "A wholesome traditional Andhra breakfast mix made primarily from green gram and natural ingredients. This premix allows you to prepare authentic pesarattu quickly while maintaining the rich taste and nutrition of the original recipe.",
    ingredients: ["Green gram (moong dal)", "Rice", "Poha (flattened rice)", "Ginger powder", "Green chilli powder", "Salt"],
    benefits: ["High in plant protein", "Rich in dietary fibre", "Supports digestion and sustained energy", "Authentic Andhra flavour", "Quick and easy preparation"],
    featured: true,
    category: "premix",
    stock: 50,
    quantityPricing: [
      { label: "1 Pack", price: 149 },
      { label: "2 Packs", price: 280 },
      { label: "3 Packs", price: 400 },
    ],
    highlights: {
      genericName: "Dosa Batters & Mixes",
      netQuantity: "200",
      shelfLife: "6 Months",
      weight: "200gm",
      fssaiLicense: "20125121000814",
      vegNonVeg: "Veg",
      countryOfOrigin: "India",
    },
  },
  {
    id: "p2",
    name: "Beet Pro Multi Millet Dosa Premix",
    price: 149,
    mrp: 199,
    image: "",
    images: ["bdp-front", "bdp-ingredients", "bdp-back", "bdp-nutrition", "bdp-howto"],
    description: "A nutritious dosa mix made from a combination of millets and grains, enriched with beetroot powder for natural colour and added health benefits. Colourful and appealing for children.",
    ingredients: ["Red rice", "Finger millet (ragi)", "Foxtail millet", "Urad dal", "Poha", "Beetroot powder", "Salt"],
    benefits: ["Rich in iron and fibre", "Supports digestion and energy levels", "Colourful and appealing for children", "Multi-grain nutrition", "Quick and easy to prepare"],
    featured: true,
    category: "premix",
    stock: 30,
    quantityPricing: [
      { label: "1 Pack", price: 149 },
      { label: "2 Packs", price: 280 },
      { label: "3 Packs", price: 400 },
    ],
    highlights: {
      genericName: "Dosa Batters & Mixes",
      netQuantity: "200",
      shelfLife: "6 Months",
      weight: "200gm",
      fssaiLicense: "20125121000814",
      vegNonVeg: "Veg",
      countryOfOrigin: "India",
    },
  },
];

const defaultSettings: AdminSettings = {
  announcementBar: "🌿 Free shipping on orders above ₹499! Vinika Food Thoughts: Authentic & Natural",
  shippingCharge: 60,
  freeShippingThreshold: 499,
  discountThreshold: 999,
  discountPercent: 10,
  razorpayEnabled: true,
  codEnabled: true,
  razorpayKey: "rzp_test_placeholder",
  contactAddress: "H.No: 3-25, Opposite Gramapanchayati Road, Indupalle – 521311",
  contactPhone: "+91 7989815279",
  contactEmail: "vinikafoodthoughts@gmail.com",
  contactHours: "Mon–Sat: 9AM–6PM",
};

const defaultContent: AdminContent = {
  heroHeadline: "Vinika Food Thoughts",
  heroSubtext: "Rooted in tradition. Ready for today. Vinika Food Thoughts brings you honest, natural South Indian breakfast premixes — made from real grains, millets, and whole ingredients. No preservatives. No artificial colours. Just wholesome food your family can trust, ready in minutes.",
  heroCTA1: "Shop Now",
  heroCTA2: "Our Story",
  features: ["100% Natural", "No Preservatives", "No Artificial Colours", "High Protein", "Ready in 5 Min"],
  statsNatural: "100% Natural",
  statsAdditives: "0 Additives",
  statsOrders: "5000+ Happy Customers",
  statsYears: "3 Years of Trust",
  aboutTeaser: "Traditional South Indian breakfast premixes made from carefully selected grains, millets, and natural ingredients — crafted for modern kitchens without compromising on taste or nutrition.",
  aboutHero: "Vinika Food Thoughts was born from the belief that healthy food should not be complicated. In today's busy world, families deserve nutritious, traditional meals that are quick to prepare. Every Vinika product is crafted with the same care you'd give food for your own family — using honest ingredients, time-tested recipes, and no shortcuts. We bring the goodness of South Indian food traditions into everyday kitchens.",
  values: ["Pure Ingredients", "Small Batch Crafted", "Traditional Recipes", "No Shortcuts", "Family First"],
  founderName: "Vishwabhanu Patnala",
  founderTitle: "Founder, Vinika Food Thoughts",
  founderMessage: "Vinika started from a simple belief — healthy, traditional food should be easy to prepare in today's busy lives. Every product is developed with the same care I would give to food made for my own family. Our ingredients are honest, our recipes are time-tested, and our mission is simple: to bring natural, wholesome food back to everyday kitchens. Thank you for being part of this journey.",
  brandMission: "To make healthy and natural food options easily accessible to modern households while preserving traditional taste and nutrition.",
  brandVision: "To become a trusted food brand that inspires people to choose natural, wholesome, and convenient food solutions for everyday living.",
  aboutProductsIntro: "Vinika Food Thoughts currently offers healthy instant dosa premixes made from natural ingredients. These premixes are designed to make traditional South Indian breakfasts quick and convenient without compromising nutrition or taste.",
  preparationSteps: [
    "Add the premix to a bowl.",
    "Add water and mix to dosa batter consistency.",
    "Allow the batter to rest for a few minutes if desired.",
    "Pour onto a hot pan and cook like a regular dosa or pesarattu.",
    "Serve hot with chutney or sambar."
  ],
  productFeatures: [
    "Natural ingredients",
    "No artificial colours",
    "No preservatives",
    "Carefully tested recipes",
    "Hygienic preparation",
    "Convenient cooking"
  ],
  productFeaturesFooter: "Vinika products are designed for families who want nutritious food without complicated preparation.",
};

const defaultCoupons: Coupon[] = [
  {
    id: "c1",
    code: "VINIKA10",
    discountPercent: 10,
    discountAmount: 0,
    minOrderValue: 300,
    maxUses: 100,
    usedCount: 0,
    active: true,
    expiryDate: "2027-12-31",
  },
];

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getUsers: (): User[] => get("vinika_users", []),
  setUsers: (u: User[]) => set("vinika_users", u),

  getProducts: (): Product[] => {
    const localProds = get("vinika_products", defaultProducts);
    const products = localProds.length > 0 ? localProds : defaultProducts;
    
    return products.map(p => ({
      ...p,
      category: p.category || "premix",
      stock: p.stock || 0,
      ingredients: p.ingredients || defaultProducts.find(dp => dp.id === p.id)?.ingredients || [],
      benefits: p.benefits || defaultProducts.find(dp => dp.id === p.id)?.benefits || [],
      images: p.images || [],
      quantityPricing: (p.quantityPricing || []).map((qp: any) => ({
        label: qp.label || `${qp.minQty || 1} pcs`,
        price: qp.price,
      })),
      highlights: p.highlights || {
        genericName: "", netQuantity: "", shelfLife: "", weight: "",
        fssaiLicense: "", vegNonVeg: "Veg", countryOfOrigin: "India",
      },
    }));
  },
  setProducts: (p: Product[]) => set("vinika_products", p),

  getCart: (): CartItem[] => get("vinika_cart", []),
  setCart: (c: CartItem[]) => set("vinika_cart", c),

  getOrders: (): Order[] => get("vinika_orders", []),
  setOrders: (o: Order[]) => set("vinika_orders", o),

  getMessages: (): Message[] => get("vinika_messages", []),
  setMessages: (m: Message[]) => set("vinika_messages", m),

  getCoupons: (): Coupon[] => get("vinika_coupons", defaultCoupons),
  setCoupons: (c: Coupon[]) => set("vinika_coupons", c),

  getReviews: (): Review[] => get("vinika_reviews", []),
  setReviews: (r: Review[]) => set("vinika_reviews", r),

  getSettings: (): AdminSettings => get("vinika_settings", defaultSettings),
  setSettings: (s: AdminSettings) => set("vinika_settings", s),

  getContent: (): AdminContent => {
    const defaultData = defaultContent;
    const localData = get("vinika_content", defaultData);
    return { ...defaultData, ...localData };
  },
  setContent: (c: AdminContent) => set("vinika_content", c),

  getCurrentUser: (): User | null => get("vinika_currentUser", null),
  setCurrentUser: (u: User | null) => set("vinika_currentUser", u),

  applyCoupon: (code: string, orderTotal: number): { valid: boolean; discount: number; message: string } => {
    const coupons = get<Coupon[]>("vinika_coupons", defaultCoupons);
    const coupon = coupons.find(c => c.code.toLowerCase() === code.toLowerCase() && c.active);
    if (!coupon) return { valid: false, discount: 0, message: "Invalid coupon code" };
    if (new Date(coupon.expiryDate) < new Date()) return { valid: false, discount: 0, message: "Coupon has expired" };
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return { valid: false, discount: 0, message: "Coupon usage limit reached" };
    if (orderTotal < coupon.minOrderValue) return { valid: false, discount: 0, message: `Minimum order ₹${coupon.minOrderValue} required` };

    let discount = 0;
    if (coupon.discountPercent > 0) discount = Math.round(orderTotal * coupon.discountPercent / 100);
    else if (coupon.discountAmount > 0) discount = coupon.discountAmount;

    return { valid: true, discount, message: `Coupon applied! You save ₹${discount}` };
  },

  useCoupon: (code: string) => {
    const coupons = get<Coupon[]>("vinika_coupons", defaultCoupons);
    const updated = coupons.map(c => c.code.toLowerCase() === code.toLowerCase() ? { ...c, usedCount: c.usedCount + 1 } : c);
    set("vinika_coupons", updated);
  },
};
