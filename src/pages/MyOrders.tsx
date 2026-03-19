import Layout from "@/components/Layout";
import { useApp } from "@/context/AppContext";
import { store } from "@/lib/store";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Package, ChevronDown, ChevronUp, Star } from "lucide-react";
import { updateOrder } from "@/lib/firestore";
import { useToast } from "@/hooks/use-toast";
import type { Review } from "@/lib/store";

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-blue-100 text-blue-700",
  packed: "bg-yellow-100 text-yellow-700",
  dispatched: "bg-orange-100 text-orange-700",
  delivered: "bg-primary/10 text-primary",
  cancelled: "bg-destructive/10 text-destructive",
};

const MyOrdersPage = () => {
  const { user } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [reviewState, setReviewState] = useState<{ productId: string, rating: number, comment: string } | null>(null);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const orders = store.getOrders().filter(o => o.userId === user.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleReviewSubmit = (productId: string) => {
    if (!reviewState || !reviewState.comment.trim()) {
      toast({ title: "Comment required", variant: "destructive" });
      return;
    }
    const review: Review = {
      id: "rev_" + Date.now(),
      productId,
      userId: user.id,
      userName: user.name,
      rating: reviewState.rating,
      comment: reviewState.comment.trim(),
      date: new Date().toLocaleDateString(),
      verified: true,
    };
    const reviews = store.getReviews();
    reviews.push(review);
    store.setReviews(reviews);
    setReviewState(null);
    toast({ title: "Review submitted!", description: "Thank you for your feedback!" });
  };

  const handleCancelOrder = async (orderId: string) => {
    if (confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
      try {
        await updateOrder(orderId, { status: "cancelled" });
        // The store listener usually auto-updates, but we force specific logic here if wanted.
        toast({ title: "Order Cancelled", description: "Your order has been cancelled successfully." });
      } catch (err: any) {
        toast({ title: "Error", description: err.message || "Failed to cancel order.", variant: "destructive" });
      }
    }
  };

  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-8">My Orders</h1>
          {orders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order.id} className="card-warm overflow-hidden">
                  <button
                    className="w-full p-5 flex items-center justify-between text-left"
                    onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-heading font-bold text-foreground">{order.ref}</span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusColors[order.status]}`}>
                          {order.status}
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${order.paymentStatus === "paid" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}`}>
                          {order.paymentStatus === "paid" ? "Paid" : "COD"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {new Date(order.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        {" • "}
                        {order.items.length} item{order.items.length > 1 ? "s" : ""} • ₹{order.total}
                      </p>
                    </div>
                    {expandedId === order.id ? <ChevronUp className="h-5 w-5 text-muted-foreground" /> : <ChevronDown className="h-5 w-5 text-muted-foreground" />}
                  </button>
                  {expandedId === order.id && (
                    <div className="px-5 pb-5 border-t border-border pt-4 animate-fade-in space-y-3">
                      {order.items.map(i => (
                        <div key={i.productId} className="flex flex-col text-sm border-b border-border/50 pb-2 last:border-0">
                          <div className="flex justify-between font-medium">
                            <span>{i.name} × {i.qty}</span>
                            <span>₹{i.price * i.qty}</span>
                          </div>
                          {order.status === "delivered" && (
                            <div className="mt-4 mb-2">
                              {reviewState?.productId === i.productId ? (
                                <div className="space-y-3 bg-secondary/30 p-4 rounded-xl border border-border">
                                  <div className="font-semibold text-sm">Review this item</div>
                                  <div className="flex gap-1.5">
                                    {[1, 2, 3, 4, 5].map(star => (
                                      <Star key={star} className={`h-6 w-6 cursor-pointer transition-colors ${star <= reviewState.rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground hover:text-amber-500"}`} onClick={() => setReviewState({ ...reviewState, rating: star })} />
                                    ))}
                                  </div>
                                  <textarea className="w-full h-20 text-sm p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="Share your experience..." value={reviewState.comment} onChange={e => setReviewState({ ...reviewState, comment: e.target.value })} />
                                  <div className="flex gap-2">
                                    <button onClick={() => handleReviewSubmit(i.productId)} className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium">Submit Review</button>
                                    <button onClick={() => setReviewState(null)} className="text-sm bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 font-medium">Cancel</button>
                                  </div>
                                </div>
                              ) : (
                                <button onClick={() => setReviewState({ productId: i.productId, rating: 5, comment: "" })} className="text-xs bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-full font-medium transition-colors flex items-center gap-1.5 w-fit">
                                  <Star className="h-3.5 w-3.5 fill-primary" /> Write a Review
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      <div className="border-t border-border pt-3 space-y-1 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>₹{order.subtotal}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{order.shipping === 0 ? "FREE" : `₹${order.shipping}`}</span></div>
                        {order.discount > 0 && <div className="flex justify-between text-primary"><span>Discount</span><span>-₹{order.discount}</span></div>}
                        <div className="flex justify-between font-bold"><span>Total</span><span>₹{order.total}</span></div>
                      </div>
                      <div className="text-sm text-muted-foreground pt-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                          <p>Ship to: {order.address.name}, {order.address.address}, {order.address.district}, {order.address.state} - {order.address.pincode}</p>
                          {order.deliveryPartner && <p className="mt-1">Delivery: {order.deliveryPartner} | Tracking: {order.trackingId}</p>}
                          {order.estimatedDelivery && <p>Est. delivery: {order.estimatedDelivery}</p>}
                        </div>
                        {order.status === "pending" && (
                          <button onClick={() => handleCancelOrder(order.id)} className="px-4 py-2 bg-destructive/10 text-destructive text-xs font-semibold rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-colors shrink-0">
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 p-6 bg-accent/5 border border-accent/20 rounded-2xl text-center shadow-sm">
            <h3 className="font-heading font-semibold text-lg text-foreground mb-2">Need to update your requirements?</h3>
            <p className="text-sm text-muted-foreground mb-4">If you want to modify your order details or have any custom requirements, immediately reach out to our admin support.</p>
            <a href="mailto:vinikafoodthoughts@gmail.com" className="inline-flex items-center justify-center bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-md">
              Contact Admin Support
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default MyOrdersPage;
