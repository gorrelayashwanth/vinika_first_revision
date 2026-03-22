import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { Product, store, Review } from "@/lib/store";
import { getImageUrl } from "@/lib/productImages";
import { ShoppingCart, ChevronLeft, ChevronRight, Leaf, Info, Star } from "lucide-react";

const ProductCard = ({ product, delay = 0 }: { product: Product, delay?: number }) => {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [imgIdx, setImgIdx] = useState(0);
  const [showHighlights, setShowHighlights] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const { addToCart, user } = useApp();

  const triggerCartFly = (e: React.MouseEvent) => {
    const btn = e.currentTarget;
    const cartBtn = document.getElementById("navbar-cart-btn");
    if (!btn || !cartBtn) return;

    const btnRect = btn.getBoundingClientRect();
    const cartRect = cartBtn.getBoundingClientRect();

    const dot = document.createElement("div");
    dot.className = "cart-fly-dot";
    dot.style.left = `${btnRect.left + btnRect.width / 2}px`;
    dot.style.top = `${btnRect.top + btnRect.height / 2}px`;
    
    const dx = cartRect.left - btnRect.left;
    const dy = cartRect.top - btnRect.top;
    
    dot.style.setProperty("--dx", `${dx}px`);
    dot.style.setProperty("--dy", `${dy}px`);

    document.body.appendChild(dot);
    
    setTimeout(() => {
      dot.remove();
      cartBtn.classList.add("cart-bounce");
      setTimeout(() => cartBtn.classList.remove("cart-bounce"), 300);
    }, 600);
  };

  const images = (product.images && product.images.length > 0) ? product.images : ["product-turmeric"];
  const currentImage = getImageUrl(images[imgIdx]);

  const variants = product.quantityPricing && product.quantityPricing.length > 0
    ? product.quantityPricing
    : [{ label: "1 Pack", price: product.price }];

  const currentPrice = variants[selectedVariant]?.price || product.price;
  const currentLabel = variants[selectedVariant]?.label || "";

  // Reviews
  const allReviews = store.getReviews();
  const productReviews = allReviews.filter(r => r.productId === product.id);
  const avgRating = productReviews.length > 0
    ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1)
    : null;

  // Check if user has purchased this product
  const orders = store.getOrders();
  const hasPurchased = user ? orders.some(o =>
    o.userId === user.id &&
    o.status === "delivered" &&
    o.items.some(i => i.productId === product.id)
  ) : false;

  const hasReviewed = user ? productReviews.some(r => r.userId === user.id) : false;

  const submitReview = () => {
    if (!user || !reviewComment.trim()) return;
    const review: Review = {
      id: "rev_" + Date.now(),
      productId: product.id,
      userId: user.id,
      userName: user.name,
      rating: reviewRating,
      comment: reviewComment.trim(),
      date: new Date().toLocaleDateString(),
      verified: true,
    };
    const reviews = store.getReviews();
    reviews.push(review);
    store.setReviews(reviews);
    setReviewComment("");
    setShowReviewForm(false);
  };

  return (
    <div className="card-warm overflow-hidden group transition-all duration-300 reveal product-card-hover flex flex-col" style={{ transitionDelay: `${delay}ms` }}>
      {/* Image Carousel */}
      <Link to={`/product/${product.slug}`} className="aspect-square overflow-hidden bg-secondary relative block">
        <img src={currentImage} alt={product.name} className="w-full h-full object-cover product-card-img-zoom" />
        {images.length > 1 && (
          <>
            <button onClick={(e) => { e.preventDefault(); setImgIdx((imgIdx - 1 + images.length) % images.length); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity arrow-hover z-10">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={(e) => { e.preventDefault(); setImgIdx((imgIdx + 1) % images.length); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity arrow-hover z-10">
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {images.map((_, i) => (
                <button key={i} onClick={(e) => { e.preventDefault(); setImgIdx(i); }} className={`w-2 h-2 rounded-full transition-colors ${i === imgIdx ? "bg-primary" : "bg-background/60"}`} />
              ))}
            </div>
          </>
        )}
        {product.highlights?.vegNonVeg === "Veg" && (
          <div className="absolute top-2 left-2 bg-background/90 rounded-full p-1 z-10">
            <Leaf className="h-4 w-4 text-primary" />
          </div>
        )}
        {avgRating && (
          <div className="absolute top-2 right-2 bg-background/90 rounded-full px-2 py-1 flex items-center gap-1 z-10">
            <Star className="h-3 w-3 text-accent fill-accent" />
            <span className="text-xs font-semibold">{avgRating}</span>
          </div>
        )}
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        <span className="text-xs font-medium uppercase tracking-wider text-accent">{product.category}</span>
        <Link to={`/product/${product.slug}`} className="hover:text-primary transition-colors">
          <h3 className="font-heading text-lg font-semibold mt-1">{product.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{product.description}</p>

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-3">
          <span className="text-xl font-bold text-foreground">₹{currentPrice}</span>
          <span className="text-sm text-muted-foreground line-through">₹{product.mrp}</span>
          <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {Math.round(((product.mrp - currentPrice) / product.mrp) * 100)}% OFF
          </span>
        </div>

        {/* Weight/Quantity Variants */}
        {variants.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {variants.map((v, i) => (
              <button
                key={i}
                className={`text-xs px-3 py-1.5 rounded-full border pill-select-transition ${
                  selectedVariant === i
                    ? "border-primary bg-primary/10 text-primary font-semibold"
                    : "border-border text-muted-foreground hover:border-primary/50"
                }`}
                onClick={() => setSelectedVariant(i)}
              >
                {v.label} — ₹{v.price}
              </button>
            ))}
          </div>
        )}

        {/* Add to cart */}
        <div className="mt-4">
          <Button variant="accent" size="sm" className="w-full btn-cart-hover btn-cart-active btn-shimmer" onClick={(e) => { triggerCartFly(e); addToCart(product.id, 1, currentLabel); }}>
            <ShoppingCart className="h-4 w-4" /> Add to Cart • {currentLabel}
          </Button>
        </div>

        {/* Reviews Summary */}
        {productReviews.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map(s => (
                  <Star key={s} className={`h-3.5 w-3.5 ${s <= Math.round(Number(avgRating)) ? "text-accent fill-accent" : "text-muted-foreground"}`} />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{productReviews.length} review{productReviews.length !== 1 ? "s" : ""}</span>
            </div>
            {productReviews.slice(0, 2).map(r => (
              <div key={r.id} className="text-xs mb-1.5">
                <div className="flex items-center gap-1">
                  <span className="font-semibold text-foreground">{r.userName}</span>
                  {r.verified && <span className="text-primary text-[10px]">✓ Verified</span>}
                </div>
                <p className="text-muted-foreground">{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Write Review */}
        {hasPurchased && !hasReviewed && (
          <div className="mt-3">
            {!showReviewForm ? (
              <button onClick={() => setShowReviewForm(true)} className="text-xs text-primary font-medium hover:underline">
                ✍ Write a Review
              </button>
            ) : (
              <div className="bg-secondary/50 rounded-xl p-3 space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button key={s} onClick={() => setReviewRating(s)}>
                      <Star className={`h-5 w-5 ${s <= reviewRating ? "text-accent fill-accent" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full text-sm p-2 rounded-lg border border-input bg-background resize-none h-16"
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="accent" onClick={submitReview}>Submit</Button>
                  <Button size="sm" variant="ghost" onClick={() => setShowReviewForm(false)}>Cancel</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Product Highlights Toggle */}
        {product.highlights && product.highlights.genericName && (
          <div className="mt-3">
            <button onClick={() => setShowHighlights(!showHighlights)} className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline link-terracotta">
              <Info className="h-3.5 w-3.5" />
              {showHighlights ? "Hide" : "View"} Product Details
            </button>
            {showHighlights && (
              <div className="mt-2 bg-secondary/50 rounded-xl p-3 text-xs space-y-1.5">
                <div className="font-heading font-semibold text-sm text-foreground mb-2">Product Highlights</div>
                {[
                  ["Generic Name", product.highlights.genericName],
                  ["Net Quantity", product.highlights.netQuantity + "g"],
                  ["Shelf Life", product.highlights.shelfLife],
                  ["Weight", product.highlights.weight],
                  ["FSSAI License", product.highlights.fssaiLicense],
                  ["Veg/Non-Veg", product.highlights.vegNonVeg],
                  ["Country of Origin", product.highlights.countryOfOrigin],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
