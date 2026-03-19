import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { store } from "@/lib/store";
import { CreditCard, Truck, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getImageUrl } from "@/lib/productImages";

const CheckoutPage = () => {
  const { cart, products, user } = useApp();
  const settings = store.getSettings();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({
    name: user?.name || "", 
    phone: user?.phone || "", 
    email: user?.email || "",
    address: user?.address || "", 
    city: "",
    district: "", 
    pincode: "", 
    state: "",
  });
  
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">(settings.razorpayEnabled ? "razorpay" : "cod");
  const [codConfirmed, setCodConfirmed] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const items = cart.map(c => { 
    const p = products.find(pr => pr.id === c.productId); 
    if (!p) return null;
    const variant = p.quantityPricing?.find(v => v.label === c.selectedVariant);
    const price = variant?.price || p.price;
    return { ...c, product: p, unitPrice: price };
  }).filter(Boolean) as any[];

  const subtotal = items.reduce((s: number, i: any) => s + i.unitPrice * i.qty, 0);
  const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCharge;
  
  const couponData = sessionStorage.getItem("vinika_coupon");
  const parsedCoupon = couponData ? JSON.parse(couponData) : null;
  const couponDiscount = parsedCoupon ? parsedCoupon.discount : 0;
  const couponCode = parsedCoupon ? parsedCoupon.code : undefined;

  const discount = (subtotal >= settings.discountThreshold ? Math.round(subtotal * settings.discountPercent / 100) : 0) + couponDiscount;
  const total = subtotal + shipping - discount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Validation
    if (form.phone.length !== 10 || !/^\d+$/.test(form.phone)) {
      toast({ title: "Invalid Phone", description: "Please enter a valid 10-digit mobile number.", variant: "destructive" });
      return;
    }
    if (form.pincode.length !== 6 || !/^\d+$/.test(form.pincode)) {
      toast({ title: "Invalid Pincode", description: "Please enter a valid 6-digit postal code.", variant: "destructive" });
      return;
    }
    if (form.address.length < 10) {
      toast({ title: "Address too short", description: "Please provide your complete shipping address.", variant: "destructive" });
      return;
    }
    if (paymentMethod === "cod" && !codConfirmed) {
      toast({ title: "Action Required", description: "Please confirm that this is a genuine COD order by checking the verification box.", variant: "destructive" });
      return;
    }
    
    // Strict Delivery Location Check
    const allowedCities = ["vijayawada", "mangalagiri", "indupalle"];
    if (!allowedCities.includes(form.city.toLowerCase().trim())) {
      toast({ title: "Delivery Unavailable", description: "We currently only deliver to Vijayawada, Mangalagiri, and Indupalle.", variant: "destructive" });
      return;
    }

    sessionStorage.setItem("vinika_checkout", JSON.stringify({ form, paymentMethod, items, subtotal, shipping, discount, total, couponCode }));
    navigate("/payment");
  };

  const fields = [
    { key: "name", label: "Full Name", type: "text" },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "email", label: "Email", type: "email" },
    { key: "address", label: "Full Address", type: "text" },
    { key: "district", label: "District", type: "text" },
    { key: "pincode", label: "Pincode", type: "text" },
    { key: "state", label: "State", type: "text" },
  ];

  return (
    <Layout>
      <section className="py-8 md:py-12 bg-gray-50/50 min-h-screen">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
            <span className="font-semibold text-primary">1. Cart</span>
            <span>&raquo;</span>
            <span className="font-semibold text-foreground">2. Checkout</span>
            <span>&raquo;</span>
            <span>3. Payment</span>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              
              {/* Trust Badge */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Secure Checkout Guarantee</h3>
                  <p className="text-sm text-muted-foreground mt-1">Your personal information is encrypted and securely processed. We never store your full payment details.</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="font-heading text-xl font-bold text-foreground mx-mb-6 border-b border-border/50 pb-4 mb-6">Contact & Shipping Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Full Name</label>
                    <input type="text" required value={form.name} onChange={e => set("name", e.target.value)} placeholder="John Doe" className="w-full h-12 px-4 rounded-xl border border-input bg-background/50 hover:bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                  
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Mobile Number <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-muted-foreground text-sm font-medium">+91</div>
                      <input type="tel" required value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} maxLength={10} placeholder="9876543210" className="w-full h-12 pl-12 pr-4 rounded-xl border border-input bg-background/50 hover:bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Email Address (Optional)</label>
                    <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="name@example.com" className="w-full h-12 px-4 rounded-xl border border-input bg-background/50 hover:bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>

                  <div className="sm:col-span-2 mt-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Complete Delivery Address <span className="text-red-500">*</span></label>
                    <textarea required value={form.address} onChange={e => set("address", e.target.value)} placeholder="House No, Building Name, Street, Landmark..." className="w-full h-24 p-4 rounded-xl border border-input bg-background/50 hover:bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">Pincode <span className="text-red-500">*</span></label>
                    <input type="text" required value={form.pincode} onChange={e => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} placeholder="500001" className="w-full h-12 px-4 rounded-xl border border-input bg-background/50 hover:bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">City / Town <span className="text-red-500">*</span></label>
                      <select required value={form.city} onChange={e => set("city", e.target.value)} className="w-full h-12 px-4 rounded-xl border border-input bg-background/50 hover:bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer">
                        <option value="" disabled>Select Delivery City...</option>
                        <option value="Vijayawada">Vijayawada</option>
                        <option value="Mangalagiri">Mangalagiri</option>
                        <option value="Indupalle">Indupalle</option>
                      </select>
                      <p className="text-[10px] text-amber-600 font-medium mt-1">Delivery limited to these areas.</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">District</label>
                      <input type="text" required value={form.district} onChange={e => set("district", e.target.value)} placeholder="NTR District" className="w-full h-12 px-4 rounded-xl border border-input bg-background/50 hover:bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">State <span className="text-red-500">*</span></label>
                    <input type="text" required value={form.state} onChange={e => set("state", e.target.value)} placeholder="Andhra Pradesh" className="w-full h-12 px-4 rounded-xl border border-input bg-background/50 hover:bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Payment Select */}
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="font-heading text-xl font-bold text-foreground border-b border-border/50 pb-4 mb-6">Payment Method</h2>
                <div className="space-y-4">
                  {settings.razorpayEnabled && (
                    <label className={`flex items-start md:items-center gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "razorpay" ? "border-primary bg-primary/5 shadow-[0_0_0_1px_rgba(var(--primary),0.1)]" : "border-border hover:border-border/80"}`}>
                      <div className="mt-1 md:mt-0">
                        <input type="radio" name="payment" checked={paymentMethod === "razorpay"} onChange={() => setPaymentMethod("razorpay")} className="sr-only" />
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === "razorpay" ? "border-primary" : "border-muted-foreground/30"}`}>
                          {paymentMethod === "razorpay" && <div className="w-3 h-3 rounded-full bg-primary" />}
                        </div>
                      </div>
                      <div className="bg-white p-2 rounded-lg shrink-0 border border-border/50 hidden sm:block">
                        <CreditCard className="h-6 w-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-base">Pay Online Safely (Razorpay)</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-full">Recommended</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Pay instantly via UPI, Credit Card, Debit Card, or Net Banking.</p>
                      </div>
                    </label>
                  )}
                  {settings.codEnabled && (
                    <div className={`rounded-xl border-2 transition-all ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:border-border/80"}`}>
                      <label className="flex items-start md:items-center gap-4 p-5 cursor-pointer">
                        <div className="mt-1 md:mt-0">
                          <input type="radio" name="payment" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="sr-only" />
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === "cod" ? "border-primary" : "border-muted-foreground/30"}`}>
                            {paymentMethod === "cod" && <div className="w-3 h-3 rounded-full bg-primary" />}
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-lg shrink-0 border border-border/50 hidden sm:block">
                          <Truck className="h-6 w-6 text-accent" />
                        </div>
                        <div className="flex-1">
                          <span className="font-bold text-base block">Cash on Delivery (COD)</span>
                          <p className="text-sm text-muted-foreground mt-1">Pay with cash when your order is delivered to your doorstep.</p>
                        </div>
                      </label>
                      
                      {/* STRICT COD ANTI-FAKE CHECKBOX */}
                      {paymentMethod === "cod" && (
                        <div className="px-5 pb-5 pt-0 mt-2">
                          <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                            <label className="flex items-start gap-3 cursor-pointer">
                              <input 
                                type="checkbox" 
                                className="mt-1 w-5 h-5 rounded border-amber-500 text-amber-500 focus:ring-amber-500" 
                                required 
                                checked={codConfirmed}
                                onChange={e => setCodConfirmed(e.target.checked)}
                              />
                              <div className="flex-1 text-sm text-amber-900 leading-snug">
                                <span className="font-bold block mb-0.5">I confirm this is a genuine order.</span>
                                I agree to pay ₹{total} at the time of delivery. I understand that placing fake or dummy orders will lead to my IP address and account being permanently banned from Vinika Health Boutique.
                              </div>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm h-fit sticky top-24">
                <h2 className="font-heading text-xl font-bold text-foreground border-b border-border/50 pb-4 mb-6">Order Summary</h2>
                
                <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                  {items.map((i: any) => (
                    <div key={i.productId} className="flex gap-4">
                      <div className="w-16 h-16 rounded-xl border border-border/50 overflow-hidden shrink-0 bg-secondary flex items-center justify-center">
                        <img src={getImageUrl(i.product.images?.[0] || i.product.image)} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 text-sm flex flex-col justify-center">
                        <div className="font-semibold line-clamp-2 leading-snug">{i.product.name}</div>
                        <div className="text-muted-foreground flex justify-between mt-1">
                          <span>Qty: {i.qty} {i.selectedVariant ? `• ${i.selectedVariant}` : ""}</span>
                          <span className="font-semibold text-foreground">₹{i.unitPrice * i.qty}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-secondary/50 rounded-xl p-4 space-y-3 text-sm">
                  <div className="flex justify-between items-center text-muted-foreground"><span>Item Subtotal</span><span className="font-medium text-foreground">₹{subtotal}</span></div>
                  <div className="flex justify-between items-center text-muted-foreground"><span>Shipping Fees</span><span className="font-medium text-foreground">{shipping === 0 ? <span className="text-primary font-bold">FREE</span> : `₹${shipping}`}</span></div>
                  {discount > 0 && <div className="flex justify-between items-center text-primary font-medium"><span>Discount Applied</span><span>-₹{discount}</span></div>}
                  
                  <div className="border-t border-border pt-3 mt-3 flex justify-between items-center">
                    <span className="font-heading font-bold text-base text-foreground">Total to Pay</span>
                    <span className="font-heading font-bold text-2xl text-accent">₹{total}</span>
                  </div>
                </div>

                <Button type="submit" variant="hero" size="lg" className="w-full mt-6 h-14 text-base shadow-xl shadow-primary/20">
                  <span className="mr-2">Place Order • ₹{total}</span>
                  <CheckCircle2 className="h-5 w-5 opacity-80" />
                </Button>
                
                <p className="text-center text-[10px] text-muted-foreground mt-4 leading-relaxed">
                  By placing your order, you agree to our <br/>Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default CheckoutPage;
