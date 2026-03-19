import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const OrderSuccessPage = () => {
  const raw = sessionStorage.getItem("vinika_lastOrder");
  const order = raw ? JSON.parse(raw) : null;

  return (
    <Layout>
      <section className="min-h-[70vh] flex items-center justify-center py-16">
        <div className="text-center max-w-lg mx-auto animate-fade-in px-4">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-14 w-14 text-primary" />
            </div>
          </div>
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">Order Placed Successfully! 🎉</h1>
          {order && (
            <>
              <p className="text-muted-foreground mb-6">Order Reference: <span className="font-bold text-foreground">{order.ref}</span></p>
              <div className="card-warm p-5 text-left mb-6">
                <h3 className="font-heading font-semibold text-foreground mb-3">Order Summary</h3>
                {order.items.map((i: any) => (
                  <div key={i.productId} className="flex justify-between text-sm py-1">
                    <span>{i.name} × {i.qty}</span>
                    <span>₹{i.price * i.qty}</span>
                  </div>
                ))}
                <div className="border-t border-border mt-3 pt-3 flex justify-between font-bold">
                  <span>Total</span><span>₹{order.total}</span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Payment: {order.paymentStatus === "paid" ? "Online (Paid)" : "Cash on Delivery"}
                </div>
              </div>
            </>
          )}
          <Button variant="hero" asChild>
            <Link to="/my-orders">Track Your Orders</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default OrderSuccessPage;
