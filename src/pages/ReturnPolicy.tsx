import Layout from "@/components/Layout";

const ReturnPolicyPage = () => {
  return (
    <Layout>
      <section className="py-20 bg-background min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl text-center md:text-left">
          <div className="text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">Return & Refund Policy</h1>
          </div>
          <div className="prose prose-lg dark:prose-invert mx-auto max-w-none text-muted-foreground space-y-8">
            <div className="card-warm p-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Refunds and Exchanges</h2>
              <p>As Vinika Health Boutique provides fresh, handcrafted food products, we maintain a strict <strong>no return, no refund, and no exchange policy</strong> for all items once shipped.</p>
              
              <h3 className="text-lg font-bold text-foreground mb-3 mt-6">Missing or Damaged Items</h3>
              <p>If you find that an item is missing from your delivered package or has arrived damaged, we request you to:</p>
              <ol className="list-decimal pl-6 mt-3 space-y-2">
                <li>Capture a clear video while unboxing the package for the very first time.</li>
                <li>Submit the unboxing video to our WhatsApp support at <strong>+91 7989815279</strong> within 24 hours of delivery.</li>
              </ol>
              <p className="mt-4">Our team will verify the unboxing video. If the claim is found to be genuine, we will gladly send a replacement for the missing or damaged item(s).</p>
            </div>
            
            <div className="card-warm p-8">
              <h2 className="text-xl font-bold text-foreground mb-4">Cancellation Policy</h2>
              <p>You may cancel your order at any time while the order status is still <strong>"Pending"</strong>. You can do this directly from your "My Orders" page. Once an order is processed or moved to Confirmed/Dispatched, cancellation is no longer possible.</p>
            </div>

            <div className="card-warm p-8 bg-accent/5 border border-accent/20">
              <h2 className="text-xl font-bold text-foreground mb-2">Need Help?</h2>
              <p className="mb-4">If you have completely exceptional circumstances or need to update your order details (like address or items) urgently, please reach out to our admin team immediately.</p>
              <a href="mailto:vinikafoodthoughts@gmail.com" className="text-primary font-bold hover:underline">
                Email us at: vinikafoodthoughts@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ReturnPolicyPage;
