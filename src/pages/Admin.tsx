import { useState, useEffect } from "react";
import { store, Product, Order, User, Message, AdminSettings, AdminContent, QuantityPrice, ProductHighlights, Coupon, Review } from "@/lib/store";
import { AVAILABLE_IMAGES, getImageUrl } from "@/lib/productImages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ShieldCheck, Package, Users, MessageSquare, Settings, FileText,
  Trash2, Plus, Save, LogOut, Pencil, X, ArrowUp, ArrowDown, Image as ImageIcon,
  Tag, Star, Bell, Loader2, Upload
} from "lucide-react";
import {
  updateOrder as fbUpdateOrder,
  addProduct as fbAddProduct, updateProduct as fbUpdateProduct, deleteProduct as fbDeleteProduct,
  saveCoupon as fbSaveCoupon, deleteCoupon as fbDeleteCoupon,
  setSettings as fbSetSettings, setContent as fbSetContent,
  subscribeToOrders, subscribeToNotifications, markAllNotificationsRead, markNotificationRead, type AdminNotification,
  subscribeToUsers
} from "@/lib/firestore";
import { uploadProductImage, deleteProductImage, isFirebaseUrl } from "@/lib/firebaseStorage";

const ADMIN_EMAIL = "admin@vinika.com";
const ADMIN_PASSWORD = "admin123";

const AdminPage = () => {
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!authed) return;
    const unsubN = subscribeToNotifications(setNotifications);
    const unsubO = subscribeToOrders((ords) => setPendingCount(ords.filter(o => o.status === "pending").length));
    return () => { unsubN(); unsubO(); };
  }, [authed]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setAuthed(true);
      sessionStorage.setItem("vinika_admin", "true");
    } else {
      toast({ title: "Access Denied", description: "Invalid admin credentials", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("vinika_admin") === "true") setAuthed(true);
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-2" />
            <CardTitle className="font-heading text-2xl">Admin Access</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">Enter admin credentials to continue</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)} />
              <Input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
              <Button type="submit" className="w-full">Login as Admin</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const unverifiedReviews = store.getReviews().filter(r => !r.verified).length;
  const newMessagesCount = store.getMessages().filter(m => {
    // Treat messages from last 48 hours as "new" if they don't have a read status
    const isRecent = new Date(m.date).getTime() > Date.now() - 48 * 60 * 60 * 1000;
    return isRecent;
  }).length;
  // Use a hacky global "new user" count based on id timestamp if available, else 0
  const newUsersCount = 0; // Simplified for UI

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="font-heading text-lg font-bold">Vinika Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setShowNotifPanel(!showNotifPanel)} className="relative">
              <Bell className="h-5 w-5" />
              {notifications.length > 0 && <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-destructive rounded-full"></span>}
            </Button>
            {showNotifPanel && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-background border border-border shadow-lg rounded-md z-50 p-3 max-h-96 overflow-y-auto">
                <div className="flex justify-between items-center mb-2 pb-2 border-b">
                  <h4 className="font-semibold text-sm">Notifications</h4>
                  {notifications.length > 0 && <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={markAllNotificationsRead}>Clear All</Button>}
                </div>
                {notifications.length === 0 ? <p className="text-sm text-muted-foreground p-2">No new notifications</p> : null}
                {notifications.map(n => (
                  <div key={n.id} className="p-2 hover:bg-muted/50 rounded-md cursor-pointer mb-1 border" onClick={() => markNotificationRead(n.id)}>
                    <p className="text-sm font-medium">{n.type === "new_order" ? `New Order: ${n.orderRef}` : n.type === "new_message" ? `Message from ${n.customer}` : "Alert"}</p>
                    <p className="text-xs text-muted-foreground">Click to mark as read.</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => { sessionStorage.removeItem("vinika_admin"); setAuthed(false); }}>
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </div>
      <div className="container mx-auto p-4 max-w-6xl">
        <Tabs defaultValue="orders">
          <TabsList className="w-full flex flex-wrap h-auto gap-1 mb-6">
            <TabsTrigger value="orders" className="gap-1 relative">
              <Package className="h-4 w-4" /> Orders
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-md animate-pulse z-10">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-1"><Package className="h-4 w-4" /> Products</TabsTrigger>
            <TabsTrigger value="coupons" className="gap-1"><Tag className="h-4 w-4" /> Coupons</TabsTrigger>
            
            <TabsTrigger value="reviews" className="gap-1 relative">
              <Star className="h-4 w-4" /> Reviews
              {unverifiedReviews > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-md animate-pulse z-10">
                  {unverifiedReviews}
                </span>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="users" className="gap-1 relative">
              <Users className="h-4 w-4" /> Users
            </TabsTrigger>
            
            <TabsTrigger value="messages" className="gap-1 relative">
              <MessageSquare className="h-4 w-4" /> Messages
              {newMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold shadow-md animate-pulse z-10">
                  {newMessagesCount}
                </span>
              )}
            </TabsTrigger>
            
            <TabsTrigger value="settings" className="gap-1"><Settings className="h-4 w-4" /> Settings</TabsTrigger>
            <TabsTrigger value="content" className="gap-1"><FileText className="h-4 w-4" /> Content</TabsTrigger>
          </TabsList>

          <TabsContent value="orders"><OrdersTab /></TabsContent>
          <TabsContent value="products"><ProductsTab /></TabsContent>
          <TabsContent value="coupons"><CouponsTab /></TabsContent>
          <TabsContent value="reviews"><ReviewsTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="messages"><MessagesTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
          <TabsContent value="content"><ContentTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

/* ─── ORDERS TAB ─── */
const OrdersTab = () => {
  const [orders, setOrders] = useState<Order[]>(store.getOrders());
  const { toast } = useToast();

  useEffect(() => {
    const unsub = subscribeToOrders(setOrders);
    return unsub;
  }, []);

  const updateStatus = (id: string, status: Order["status"]) => {
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    store.setOrders(updated);
    setOrders(updated);
    fbUpdateOrder(id, { status }).catch(console.error);
    toast({ title: "Order updated" });
  };

  const updateTracking = (id: string, field: string, value: string) => {
    const updated = orders.map(o => o.id === id ? { ...o, [field]: value } : o);
    store.setOrders(updated);
    setOrders(updated);
    fbUpdateOrder(id, { [field]: value }).catch(console.error);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    confirmed: "bg-blue-100 text-blue-700",
    packed: "bg-yellow-100 text-yellow-700",
    dispatched: "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
  };

  if (!orders.length) return <p className="text-muted-foreground text-center py-10">No orders yet.</p>;

  // Sort orders: pending first, then by date descending
  const sortedOrders = [...orders].sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-bold">Manage Orders ({orders.length})</h2>
      {sortedOrders.map(order => (
        <Card key={order.id} className={order.status === "pending" ? "border-amber-400 border-2 shadow-amber-500/20 shadow-lg relative bg-amber-50/10" : ""}>
          {order.status === "pending" && (
            <div className="absolute -top-3 -right-3">
              <Badge variant="destructive" className="animate-bounce shadow-xl uppercase font-black px-3 py-1 text-xs">⭐ New Order</Badge>
            </div>
          )}
          <CardContent className="p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-bold font-heading">{order.ref}</span>
                <span className="text-muted-foreground text-sm ml-2">{order.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColors[order.status]}>{order.status}</Badge>
                <Badge variant={order.paymentStatus === "paid" ? "default" : "secondary"}>{order.paymentStatus}</Badge>
              </div>
            </div>
            <div className="text-sm bg-muted/30 p-3 rounded-md border border-border">
              <div className="flex justify-between items-center mb-2 border-b border-border pb-2">
                <span className="font-semibold text-primary">Delivery Partner Information</span>
                {order.paymentStatus === "cod" && (
                  <Badge variant="destructive" className="animate-pulse shadow-sm">COD: Collect ₹{order.total}</Badge>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                <div><span className="text-muted-foreground mr-1">Name:</span> <strong className="text-foreground">{order.address?.name}</strong></div>
                <div><span className="text-muted-foreground mr-1">Phone:</span> <strong className="text-foreground font-mono">{order.address?.phone}</strong></div>
                {order.address?.email && <div><span className="text-muted-foreground mr-1">Email:</span> <strong className="text-foreground">{order.address.email}</strong></div>}
                <div className="md:col-span-2"><span className="text-muted-foreground mr-1">Address:</span> <strong className="text-foreground">{order.address?.address}, {order.address?.district}, {order.address?.state} - {order.address?.pincode}</strong></div>
              </div>
              
              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground mr-1 font-medium">Items to Deliver:</span>
                <span className="text-foreground font-semibold">
                  {order.items.map((i: any) => `${i.name} ${i.variant ? `(${i.variant})` : ""} x${i.qty}`).join(", ")}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-end">
              <div>
                <label className="text-xs text-muted-foreground">Status</label>
                <select value={order.status} onChange={e => updateStatus(order.id, e.target.value as Order["status"])} className="block border border-input rounded-md px-2 py-1.5 text-sm bg-background">
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="packed">Packed</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Delivery Partner</label>
                <Input value={order.deliveryPartner || ""} onChange={e => updateTracking(order.id, "deliveryPartner", e.target.value)} placeholder="e.g. Delhivery" className="h-9 w-40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Tracking ID</label>
                <Input value={order.trackingId || ""} onChange={e => updateTracking(order.id, "trackingId", e.target.value)} placeholder="Tracking #" className="h-9 w-40" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Est. Delivery</label>
                <Input type="date" value={order.estimatedDelivery || ""} onChange={e => updateTracking(order.id, "estimatedDelivery", e.target.value)} className="h-9 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/* ─── PRODUCTS TAB ─── */
const emptyHighlights: ProductHighlights = {
  genericName: "Dosa Batters & Mixes", netQuantity: "200", shelfLife: "6 Months",
  weight: "200gm", fssaiLicense: "20125121000814", vegNonVeg: "Veg", countryOfOrigin: "India",
};

const ProductsTab = () => {
  const [products, setProducts] = useState<Product[]>(store.getProducts());
  const [editing, setEditing] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { toast } = useToast();

  const emptyProduct: Product = {
    id: "", name: "", slug: "", price: 0, mrp: 0, image: "", images: [],
    description: "", ingredients: [], benefits: [], featured: false, category: "premix", stock: 0,
    quantityPricing: [{ label: "1 Pack", price: 0 }],
    highlights: { ...emptyHighlights },
  };

  const save = async (p: Product) => {
    let updated: Product[];
    const isEditing = products.find(x => x.id === p.id);
    const finalProduct = { ...p, id: p.id || "p" + Date.now() }; // ensure we keep id if we set it during upload
    
    if (isEditing) {
      updated = products.map(x => x.id === p.id ? finalProduct : x);
      fbUpdateProduct(finalProduct.id, finalProduct).catch(console.error);
    } else {
      updated = [...products, finalProduct];
      fbAddProduct(finalProduct).catch(console.error);
    }
    store.setProducts(updated);
    setProducts(updated);
    setEditing(null);
    toast({ title: "Product saved" });
  };

  const remove = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    store.setProducts(updated);
    setProducts(updated);
    fbDeleteProduct(id).catch(console.error);
    toast({ title: "Product deleted" });
  };

  const addImage = (imageKey: string) => {
    if (editing && !editing.images.includes(imageKey)) {
      setEditing({ ...editing, images: [...editing.images, imageKey] });
    }
  };

  const removeImage = async (idx: number) => {
    if (editing) {
      const imgKey = editing.images[idx];
      setEditing({ ...editing, images: editing.images.filter((_, i) => i !== idx) });
      if (isFirebaseUrl(imgKey)) {
        await deleteProductImage(imgKey).catch(console.error);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editing) return;
    try {
      setUploadingImage(true);
      const tempId = editing.id || "p" + Date.now();
      if (!editing.id) setEditing(prev => prev ? { ...prev, id: tempId } : null);
      
      const url = await uploadProductImage(file, tempId);
      setEditing(prev => prev ? { ...prev, images: [...prev.images, url] } : null);
    } catch (err: any) {
      toast({ title: "Upload Failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingImage(false);
      // clear the input
      e.target.value = "";
    }
  };

  const moveImage = (idx: number, dir: -1 | 1) => {
    if (!editing) return;
    const images = [...editing.images];
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= images.length) return;
    [images[idx], images[newIdx]] = [images[newIdx], images[idx]];
    setEditing({ ...editing, images });
  };

  const addVariant = () => {
    if (editing) {
      const p = editing.price || 0;
      const count = editing.quantityPricing.length + 1;
      setEditing({ 
        ...editing, 
        quantityPricing: [...editing.quantityPricing, { label: `${count} Product${count > 1 ? 's' : ''}`, price: p * count }] 
      });
    }
  };

  const updateVariant = (idx: number, field: keyof QuantityPrice, value: string | number) => {
    if (editing) {
      const qp = [...editing.quantityPricing];
      qp[idx] = { ...qp[idx], [field]: value };
      setEditing({ ...editing, quantityPricing: qp });
    }
  };

  const removeVariant = (idx: number) => {
    if (editing) setEditing({ ...editing, quantityPricing: editing.quantityPricing.filter((_, i) => i !== idx) });
  };

  const updateHighlight = (key: keyof ProductHighlights, value: string) => {
    if (editing) setEditing({ ...editing, highlights: { ...editing.highlights, [key]: value } });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">Products ({products.length})</h2>
        <Button size="sm" onClick={() => setEditing({ ...emptyProduct })}><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
      </div>

      {editing && (
        <Card>
          <CardContent className="p-4 space-y-5">
            {/* Basic Fields */}
            <div>
              <h3 className="font-heading font-semibold text-sm mb-3 text-primary">Basic Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground">Name</label><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Category</label><Input value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Base Price (₹)</label><Input type="number" value={editing.price} onChange={e => setEditing({ ...editing, price: +e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">MRP (₹)</label><Input type="number" value={editing.mrp} onChange={e => setEditing({ ...editing, mrp: +e.target.value })} /></div>
                <div><label className="text-xs text-muted-foreground">Stock</label><Input type="number" value={editing.stock} onChange={e => setEditing({ ...editing, stock: +e.target.value })} /></div>
              </div>
              <div className="mt-3"><label className="text-xs text-muted-foreground">Description</label><Textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} /></div>
              <div className="flex items-center gap-2 mt-3"><Switch checked={editing.featured} onCheckedChange={v => setEditing({ ...editing, featured: v })} /><span className="text-sm">Featured</span></div>
            </div>

            {/* Product Images */}
            <div>
              <h3 className="font-heading font-semibold text-sm mb-3 text-primary flex items-center gap-1"><ImageIcon className="h-4 w-4" /> Product Images ({editing.images.length})</h3>
              <div className="flex flex-wrap gap-3 mb-3">
                {editing.images.map((imgKey, idx) => (
                  <div key={idx} className="relative group border border-border rounded-lg overflow-hidden w-24 h-24">
                    <img src={isFirebaseUrl(imgKey) ? imgKey : getImageUrl(imgKey)} alt={`Product img ${idx}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <button onClick={() => moveImage(idx, -1)} className="p-1 bg-background rounded"><ArrowUp className="h-3 w-3" /></button>
                      <button onClick={() => moveImage(idx, 1)} className="p-1 bg-background rounded"><ArrowDown className="h-3 w-3" /></button>
                      <button onClick={() => removeImage(idx)} className="p-1 bg-destructive text-destructive-foreground rounded"><X className="h-3 w-3" /></button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="flex-1 relative">
                  <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploadingImage} className="absolute inset-0 opacity-0 cursor-pointer" />
                  <Button variant="outline" className="w-full pointer-events-none" disabled={uploadingImage}>
                    {uploadingImage ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                    {uploadingImage ? "Uploading..." : "Upload from Device"}
                  </Button>
                </div>
                <div className="flex-1">
                  <select className="border border-input rounded-md px-3 h-10 text-sm bg-background w-full focus:ring-1 focus:ring-primary focus:outline-none" onChange={e => { if (e.target.value) { addImage(e.target.value); e.target.value = ""; } }} defaultValue="">
                    <option value="" disabled>Or Pick from Library...</option>
                    {AVAILABLE_IMAGES.filter(img => !editing.images.includes(img.key)).map(img => (
                      <option key={img.key} value={img.key}>{img.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <h3 className="font-heading font-semibold text-sm mb-3 text-primary">Ingredients</h3>
              <div className="space-y-2">
                {editing.ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={ing} onChange={e => { const ingredients = [...editing.ingredients]; ingredients[i] = e.target.value; setEditing({...editing, ingredients}); }} />
                    <Button size="icon" variant="ghost" onClick={() => setEditing({...editing, ingredients: editing.ingredients.filter((_, j) => j !== i)})}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => setEditing({...editing, ingredients: [...editing.ingredients, "New Ingredient"]})}><Plus className="h-4 w-4 mr-1" /> Add Ingredient</Button>
              </div>
            </div>

            {/* Benefits */}
            <div>
              <h3 className="font-heading font-semibold text-sm mb-3 text-primary">Benefits</h3>
              <div className="space-y-2">
                {editing.benefits.map((ben, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={ben} onChange={e => { const benefits = [...editing.benefits]; benefits[i] = e.target.value; setEditing({...editing, benefits}); }} />
                    <Button size="icon" variant="ghost" onClick={() => setEditing({...editing, benefits: editing.benefits.filter((_, j) => j !== i)})}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={() => setEditing({...editing, benefits: [...editing.benefits, "New Benefit"]})}><Plus className="h-4 w-4 mr-1" /> Add Benefit</Button>
              </div>
            </div>

            {/* Quantity / Products Variants */}
            <div>
              <div className="mb-3">
                <h3 className="font-heading font-semibold text-sm text-primary">Quantity Pricing (Overrides Base Price)</h3>
                <p className="text-[10px] text-muted-foreground leading-none mt-1">If variants exist here, these prices are shown on the shop instead of Base Price.</p>
              </div>
              <div className="space-y-2">
                {editing.quantityPricing.map((qp, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground">Label (e.g. 1 Product or 2 Products)</label>
                      <Input value={qp.label} onChange={e => updateVariant(idx, "label", e.target.value)} className="h-8" />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-muted-foreground">Price (₹)</label>
                      <Input type="number" value={qp.price} onChange={e => updateVariant(idx, "price", +e.target.value)} className="h-8" />
                    </div>
                    <Button size="icon" variant="ghost" className="mt-3" onClick={() => removeVariant(idx)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="outline" className="mt-2" onClick={addVariant}><Plus className="h-3.5 w-3.5 mr-1" /> Add Variant</Button>
            </div>

            {/* Product Highlights */}
            <div>
              <h3 className="font-heading font-semibold text-sm mb-3 text-primary">Product Highlights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {([
                  ["genericName", "Generic Name"], ["netQuantity", "Net Quantity (g)"], ["shelfLife", "Shelf Life"],
                  ["weight", "Weight"], ["fssaiLicense", "FSSAI License No."], ["vegNonVeg", "Veg/Non-Veg"], ["countryOfOrigin", "Country of Origin"],
                ] as [keyof ProductHighlights, string][]).map(([key, label]) => (
                  <div key={key}><label className="text-xs text-muted-foreground">{label}</label><Input value={editing.highlights[key]} onChange={e => updateHighlight(key, e.target.value)} /></div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => save(editing)}><Save className="h-4 w-4 mr-1" /> Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(null)}><X className="h-4 w-4 mr-1" /> Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {products.map(p => (
        <Card key={p.id}>
          <CardContent className="p-4 flex items-center justify-between gap-3">
            {p.images.length > 0 && <img src={getImageUrl(p.images[0])} alt={p.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />}
            <div className="flex-1 min-w-0">
              <span className="font-semibold">{p.name}</span>
              <span className="text-muted-foreground text-sm ml-2">₹{p.price} / MRP ₹{p.mrp} / Stock: {p.stock}</span>
              {p.featured && <Badge className="ml-2">Featured</Badge>}
              <div className="text-xs text-muted-foreground mt-1">
                {p.images.length} images · {p.quantityPricing.length} variants
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button size="icon" variant="ghost" onClick={() => setEditing({ ...p })}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/* ─── COUPONS TAB ─── */
const CouponsTab = () => {
  const [coupons, setCoupons] = useState<Coupon[]>(store.getCoupons());
  const [editing, setEditing] = useState<Coupon | null>(null);
  const { toast } = useToast();

  const emptyCoupon: Coupon = { id: "", code: "", discountPercent: 10, discountAmount: 0, minOrderValue: 0, maxUses: 100, usedCount: 0, active: true, expiryDate: "2027-12-31" };

  const save = (c: Coupon) => {
    let updated: Coupon[];
    if (coupons.find(x => x.id === c.id)) {
      updated = coupons.map(x => x.id === c.id ? c : x);
    } else {
      c.id = "c" + Date.now();
      updated = [...coupons, c];
    }
    store.setCoupons(updated);
    setCoupons(updated);
    fbSaveCoupon(c).catch(console.error);
    setEditing(null);
    toast({ title: "Coupon saved" });
  };

  const remove = (id: string) => {
    const updated = coupons.filter(c => c.id !== id);
    store.setCoupons(updated);
    setCoupons(updated);
    fbDeleteCoupon(id).catch(console.error);
    toast({ title: "Coupon deleted" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">Coupons ({coupons.length})</h2>
        <Button size="sm" onClick={() => setEditing({ ...emptyCoupon })}><Plus className="h-4 w-4 mr-1" /> Add Coupon</Button>
      </div>

      {editing && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground">Coupon Code</label><Input value={editing.code} onChange={e => setEditing({ ...editing, code: e.target.value.toUpperCase() })} placeholder="e.g. SAVE20" /></div>
              <div><label className="text-xs text-muted-foreground">Discount % (0 for flat amount)</label><Input type="number" value={editing.discountPercent} onChange={e => setEditing({ ...editing, discountPercent: +e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">Flat Discount ₹ (0 for %)</label><Input type="number" value={editing.discountAmount} onChange={e => setEditing({ ...editing, discountAmount: +e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">Min Order Value (₹)</label><Input type="number" value={editing.minOrderValue} onChange={e => setEditing({ ...editing, minOrderValue: +e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">Max Uses (0 = unlimited)</label><Input type="number" value={editing.maxUses} onChange={e => setEditing({ ...editing, maxUses: +e.target.value })} /></div>
              <div><label className="text-xs text-muted-foreground">Expiry Date</label><Input type="date" value={editing.expiryDate} onChange={e => setEditing({ ...editing, expiryDate: e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2"><Switch checked={editing.active} onCheckedChange={v => setEditing({ ...editing, active: v })} /><span className="text-sm">Active</span></div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => save(editing)}><Save className="h-4 w-4 mr-1" /> Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(null)}><X className="h-4 w-4 mr-1" /> Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {coupons.map(c => (
        <Card key={c.id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="font-mono font-bold text-primary">{c.code}</span>
              <span className="text-sm text-muted-foreground ml-2">
                {c.discountPercent > 0 ? `${c.discountPercent}% off` : `₹${c.discountAmount} off`}
                {c.minOrderValue > 0 && ` (min ₹${c.minOrderValue})`}
              </span>
              <div className="text-xs text-muted-foreground mt-1">
                Used: {c.usedCount}/{c.maxUses || "∞"} · Expires: {c.expiryDate}
                {!c.active && <Badge variant="secondary" className="ml-2">Inactive</Badge>}
              </div>
            </div>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => setEditing({ ...c })}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/* ─── REVIEWS TAB ─── */
const ReviewsTab = () => {
  const [reviews, setReviews] = useState<Review[]>(store.getReviews());
  const products = store.getProducts();
  const { toast } = useToast();

  const remove = (id: string) => {
    const updated = reviews.filter(r => r.id !== id);
    store.setReviews(updated);
    setReviews(updated);
    toast({ title: "Review deleted" });
  };

  if (!reviews.length) return <p className="text-muted-foreground text-center py-10">No reviews yet.</p>;

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-bold">Product Reviews ({reviews.length})</h2>
      {reviews.map(r => {
        const product = products.find(p => p.id === r.productId);
        return (
          <Card key={r.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="font-semibold">{r.userName}</span>
                  <span className="text-muted-foreground text-sm ml-2">on {product?.name || r.productId}</span>
                  <div className="flex gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className={`h-3.5 w-3.5 ${s <= r.rating ? "text-accent fill-accent" : "text-muted-foreground"}`} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                  {r.verified && <Badge variant="secondary" className="text-xs">Verified</Badge>}
                  <Button size="icon" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              <p className="text-sm">{r.comment}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

/* ─── USERS TAB ─── */
const UsersTab = () => {
  const [users, setUsers] = useState<User[]>([]);
  
  useEffect(() => {
    const unsub = subscribeToUsers(setUsers);
    return unsub;
  }, []);

  if (!users.length) return <p className="text-muted-foreground text-center py-10">No registered users yet.</p>;
  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-bold">Registered Users ({users.length})</h2>
      {users.map(u => (
        <Card key={u.id}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="font-semibold">{u.name}</span>
              <span className="text-muted-foreground text-sm ml-2">{u.email}</span>
              <span className="text-muted-foreground text-sm ml-2">{u.phone}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/* ─── MESSAGES TAB ─── */
const MessagesTab = () => {
  const [messages, setMessages] = useState<Message[]>(store.getMessages());
  const { toast } = useToast();

  const remove = (id: string) => {
    const updated = messages.filter(m => m.id !== id);
    store.setMessages(updated);
    setMessages(updated);
    toast({ title: "Message deleted" });
  };

  if (!messages.length) return <p className="text-muted-foreground text-center py-10">No messages yet.</p>;

  return (
    <div className="space-y-4">
      <h2 className="font-heading text-xl font-bold">Contact Messages ({messages.length})</h2>
      {messages.map(m => (
        <Card key={m.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-semibold">{m.name}</span>
                <span className="text-muted-foreground text-sm ml-2">{m.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{m.date}</span>
                <Button size="icon" variant="ghost" onClick={() => remove(m.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
            <p className="text-sm">{m.message}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

/* ─── SETTINGS TAB ─── */
const SettingsTab = () => {
  const [settings, setSettings] = useState<AdminSettings>(store.getSettings());
  const { toast } = useToast();

  const update = (key: keyof AdminSettings, value: string | number | boolean) => {
    const s = { ...settings, [key]: value };
    setSettings(s);
    store.setSettings(s);
  };

  const saveAll = () => { store.setSettings(settings); fbSetSettings(settings).catch(console.error); toast({ title: "Settings saved" }); };

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-bold">Store Settings</h2>
      <Card><CardHeader><CardTitle className="text-base">Announcement Bar</CardTitle></CardHeader><CardContent><Input value={settings.announcementBar} onChange={e => update("announcementBar", e.target.value)} /></CardContent></Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Shipping & Discounts</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-xs text-muted-foreground">Shipping Charge (₹)</label><Input type="number" value={settings.shippingCharge} onChange={e => update("shippingCharge", +e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">Free Shipping Threshold (₹)</label><Input type="number" value={settings.freeShippingThreshold} onChange={e => update("freeShippingThreshold", +e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">Discount Threshold (₹)</label><Input type="number" value={settings.discountThreshold} onChange={e => update("discountThreshold", +e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">Discount Percent (%)</label><Input type="number" value={settings.discountPercent} onChange={e => update("discountPercent", +e.target.value)} /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Payment Methods</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3"><Switch checked={settings.razorpayEnabled} onCheckedChange={v => update("razorpayEnabled", v)} /><span className="text-sm">Razorpay (Online)</span></div>
          {settings.razorpayEnabled && <div><label className="text-xs text-muted-foreground">Razorpay Key</label><Input value={settings.razorpayKey} onChange={e => update("razorpayKey", e.target.value)} /></div>}
          <div className="flex items-center gap-3"><Switch checked={settings.codEnabled} onCheckedChange={v => update("codEnabled", v)} /><span className="text-sm">Cash on Delivery</span></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Contact Information</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="text-xs text-muted-foreground">Address</label><Input value={settings.contactAddress} onChange={e => update("contactAddress", e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">Phone</label><Input value={settings.contactPhone} onChange={e => update("contactPhone", e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">Email</label><Input value={settings.contactEmail} onChange={e => update("contactEmail", e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">Hours</label><Input value={settings.contactHours} onChange={e => update("contactHours", e.target.value)} /></div>
        </CardContent>
      </Card>
      <Button onClick={saveAll}><Save className="h-4 w-4 mr-1" /> Save All Settings</Button>
    </div>
  );
};

/* ─── CONTENT TAB ─── */
const ContentTab = () => {
  const [content, setContent] = useState<AdminContent>(store.getContent());
  const { toast } = useToast();

  const update = (key: keyof AdminContent, value: string | string[]) => {
    const c = { ...content, [key]: value };
    setContent(c);
    store.setContent(c);
  };

  const saveAll = () => { store.setContent(content); fbSetContent(content).catch(console.error); toast({ title: "Content saved" }); };

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl font-bold">Site Content</h2>
      <Card>
        <CardHeader><CardTitle className="text-base">Hero Section</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Headline</label><Input value={content.heroHeadline} onChange={e => update("heroHeadline", e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">Subtext</label><Textarea value={content.heroSubtext} onChange={e => update("heroSubtext", e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">CTA Button 1</label><Input value={content.heroCTA1} onChange={e => update("heroCTA1", e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground">CTA Button 2</label><Input value={content.heroCTA2} onChange={e => update("heroCTA2", e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Feature Badges</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {content.features.map((f, i) => (
            <div key={i} className="flex gap-2">
              <Input value={f} onChange={e => { const features = [...content.features]; features[i] = e.target.value; update("features", features); }} />
              <Button size="icon" variant="ghost" onClick={() => update("features", content.features.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => update("features", [...content.features, "New Feature"])}><Plus className="h-4 w-4 mr-1" /> Add Feature</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Rolling Banner</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><label className="text-xs text-muted-foreground">Banner Quote</label><Textarea value={content.bannerQuote} onChange={e => update("bannerQuote", e.target.value)} rows={3} /></div>
          <div><label className="text-xs text-muted-foreground">Banner Speed (Lower = Faster, default 40)</label><Input type="number" value={content.bannerSpeed} onChange={e => update("bannerSpeed", +e.target.value)} /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">About Section</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><label className="text-xs text-muted-foreground">About Teaser</label><Textarea value={content.aboutTeaser} onChange={e => update("aboutTeaser", e.target.value)} /></div>
          <div><label className="text-xs text-muted-foreground">About Hero</label><Textarea value={content.aboutHero} onChange={e => update("aboutHero", e.target.value)} rows={4} /></div>
          <div><label className="text-xs text-muted-foreground">Brand Mission</label><Textarea value={content.brandMission} onChange={e => update("brandMission", e.target.value)} rows={3} /></div>
          <div><label className="text-xs text-muted-foreground">Brand Vision</label><Textarea value={content.brandVision} onChange={e => update("brandVision", e.target.value)} rows={3} /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">About Products Section</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><label className="text-xs text-muted-foreground">About Products Intro</label><Textarea value={content.aboutProductsIntro} onChange={e => update("aboutProductsIntro", e.target.value)} rows={3} /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Founder Message</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs text-muted-foreground">Name</label><Input value={content.founderName} onChange={e => update("founderName", e.target.value)} /></div>
            <div><label className="text-xs text-muted-foreground">Title</label><Input value={content.founderTitle} onChange={e => update("founderTitle", e.target.value)} /></div>
          </div>
          <div><label className="text-xs text-muted-foreground">Message</label><Textarea value={content.founderMessage} onChange={e => update("founderMessage", e.target.value)} rows={4} /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Values</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {content.values.map((v, i) => (
            <div key={i} className="flex gap-2">
              <Input value={v} onChange={e => { const values = [...content.values]; values[i] = e.target.value; update("values", values); }} />
              <Button size="icon" variant="ghost" onClick={() => update("values", content.values.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => update("values", [...content.values, "New Value"])}><Plus className="h-4 w-4 mr-1" /> Add Value</Button>
        </CardContent>
      </Card>
      <Button onClick={saveAll}><Save className="h-4 w-4 mr-1" /> Save All Content</Button>
    </div>
  );
};

export default AdminPage;
