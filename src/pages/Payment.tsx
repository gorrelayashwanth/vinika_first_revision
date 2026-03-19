import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { store, Order } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { addOrder, decrementStock } from "@/lib/firestore";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { user, clearCart } = useApp();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const raw = sessionStorage.getItem("vinika_checkout");
  const checkout = raw ? JSON.parse(raw) : null;

  const createOrder = async (paymentStatus: "paid" | "cod", razorpayPaymentId?: string) => {
    if (!checkout || !user) return;
    setLoading(true);
    const { form, paymentMethod, items, subtotal, shipping, discount, total } = checkout;
    const ref = "VFT-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const order: Omit<Order, "id"> = {
      ref, userId: user.id,
      items: items.map((i: any) => {
        const item: any = { productId: i.productId, qty: i.qty, price: i.unitPrice, name: i.product.name };
        if (i.selectedVariant) item.variant = i.selectedVariant;
        return item;
      }),
      subtotal, shipping, discount, total, address: form,
      paymentMethod, paymentStatus, status: "pending",
      date: new Date().toISOString(),
    };
    if (razorpayPaymentId) order.razorpayPaymentId = razorpayPaymentId;
    if (checkout.couponCode) order.couponCode = checkout.couponCode;
    
    try {
      const id = await addOrder(order);
      for (const i of items) {
        await decrementStock(i.productId, i.qty);
      }
      clearCart();
      sessionStorage.setItem("vinika_lastOrder", JSON.stringify({ id, ...order }));
      sessionStorage.removeItem("vinika_checkout");
      navigate("/order-success");
    } catch (e: any) {
      toast({ title: "Failed to create order", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!raw || !user) { navigate("/cart"); return; }
    if (checkout?.paymentMethod === "cod") { createOrder("cod"); }
  }, []);

  const handleRazorpay = () => {
    if (!checkout || !user) return;
    const { form, total } = checkout;
    setLoading(true);
    const settings = store.getSettings();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const options = {
        key: settings.razorpayKey, amount: total * 100, currency: "INR",
        name: "Vinika Food Thoughts", description: "Order Payment",
        handler: (response: any) => createOrder("paid", response.razorpay_payment_id),
        prefill: { name: form.name, email: form.email, contact: form.phone },
        theme: { color: "#2D5016" },
        modal: { ondismiss: () => { setLoading(false); toast({ title: "Payment cancelled", variant: "destructive" }); } },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      setLoading(false);
    };
    script.onerror = () => { setLoading(false); toast({ title: "Failed to load payment", variant: "destructive" }); };
    document.body.appendChild(script);
  };

  if (!checkout || !user || checkout.paymentMethod === "cod") {
    return <Layout><div className="min-h-[60vh] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></Layout>;
  }

  return (
    <Layout>
      <section className="min-h-[60vh] flex items-center justify-center py-16">
        <div className="card-warm p-8 max-w-md w-full text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">Complete Payment</h1>
          <p className="text-muted-foreground mb-2">Amount: <span className="font-bold text-foreground">₹{checkout.total}</span></p>
          <p className="text-sm text-muted-foreground mb-8">Click below to pay securely via Razorpay</p>
          <Button variant="hero" size="lg" className="w-full" onClick={handleRazorpay} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pay Now"}
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default PaymentPage;
