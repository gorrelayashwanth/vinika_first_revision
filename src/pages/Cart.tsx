import Layout from "@/components/Layout";
import { useApp } from "@/context/AppContext";
import { store } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Minus, Plus, ShoppingBag, Tag } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { getImageUrl } from "@/lib/productImages";
import { useState } from "react";

const CartPage = () => {
  const { cart, products, updateCartQty, removeFromCart, user } = useApp();
  const settings = store.getSettings();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState<{ valid: boolean; discount: number; message: string } | null>(null);

  const items = cart.map(c => {
    const p = products.find(pr => pr.id === c.productId);
    if (!p) return null;
    // Find the price for the selected variant
    const variant = p.quantityPricing?.find(v => v.label === c.selectedVariant);
    const price = variant?.price || p.price;
    return { ...c, product: p, unitPrice: price };
  }).filter(Boolean) as { productId: string; qty: number; selectedVariant?: string; product: typeof products[0]; unitPrice: number }[];

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
  const shipping = subtotal >= settings.freeShippingThreshold ? 0 : settings.shippingCharge;
  const couponDiscount = couponResult?.valid ? couponResult.discount : 0;
  const discount = (subtotal >= settings.discountThreshold ? Math.round(subtotal * settings.discountPercent / 100) : 0) + couponDiscount;
  const total = subtotal + shipping - discount;

  const applyCoupon = () => {
    if (!couponCode.trim()) return;
    const result = store.applyCoupon(couponCode.trim(), subtotal);
    setCouponResult(result);
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponResult(null);
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center py-20">
          <ShoppingBag className="h-20 w-20 text-muted-foreground/30 mb-6" />
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some healthy goodness to your cart!</p>
          <Button variant="hero" asChild><Link to="/shop">Browse Products</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-8">Shopping Cart</h1>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => {
                const firstImg = item.product.images?.[0];
                return (
                  <div key={item.productId} className="card-warm p-4 flex gap-4">
                    <img src={firstImg ? getImageUrl(firstImg) : "/placeholder.svg"} alt={item.product.name} className="w-24 h-24 object-cover rounded-xl" />
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-foreground">{item.product.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.selectedVariant && <span className="text-primary font-medium">{item.selectedVariant}</span>}
                        {" "}— ₹{item.unitPrice} each
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center border border-border rounded-full">
                          <button onClick={() => updateCartQty(item.productId, item.qty - 1)} className="p-1.5 hover:bg-secondary rounded-l-full">
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.qty}</span>
                          <button onClick={() => updateCartQty(item.productId, item.qty + 1)} className="p-1.5 hover:bg-secondary rounded-r-full">
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button onClick={() => removeFromCart(item.productId)} className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">₹{item.unitPrice * item.qty}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card-warm p-6 h-fit sticky top-24 space-y-4">
              <h3 className="font-heading text-lg font-bold text-foreground">Order Summary</h3>

              {/* Coupon */}
              <div className="border border-border rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Apply Coupon</span>
                </div>
                {couponResult?.valid ? (
                  <div className="flex items-center justify-between bg-primary/10 rounded-lg px-3 py-2">
                    <span className="text-sm text-primary font-semibold">{couponCode.toUpperCase()} applied!</span>
                    <button onClick={removeCoupon} className="text-xs text-destructive hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="h-9 text-sm"
                    />
                    <Button size="sm" variant="outline" onClick={applyCoupon}>Apply</Button>
                  </div>
                )}
                {couponResult && !couponResult.valid && (
                  <p className="text-xs text-destructive mt-1">{couponResult.message}</p>
                )}
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{subtotal}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className={shipping === 0 ? "text-primary font-semibold" : ""}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
                {discount > 0 && <div className="flex justify-between"><span className="text-primary font-medium">Discount</span><span className="text-primary">-₹{discount}</span></div>}
                <div className="border-t border-border pt-3 flex justify-between font-bold text-base">
                  <span>Total</span><span>₹{total}</span>
                </div>
              </div>
              <Button
                variant="hero" size="lg" className="w-full"
                onClick={() => {
                  if (couponResult?.valid) {
                    sessionStorage.setItem("vinika_coupon", JSON.stringify({ code: couponCode, discount: couponDiscount }));
                  }
                  user ? navigate("/checkout") : navigate("/login");
                }}
              >
                Proceed to Checkout
              </Button>
              {!user && <p className="text-xs text-muted-foreground text-center">Please login to continue</p>}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default CartPage;
