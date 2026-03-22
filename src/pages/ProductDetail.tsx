import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { store, Product } from "@/lib/store";
import { getImageUrl } from "@/lib/productImages";
import { ChevronLeft, ChevronRight, Info, Star, ShoppingCart, ArrowLeft, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, user } = useApp();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [imgIdx, setImgIdx] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [showDetails, setShowDetails] = useState(true);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  
  // Touch swipe support
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const products = store.getProducts();
    const p = products.find(prod => prod.slug === slug);
    if (!p) {
      navigate("/shop");
      return;
    }
    setProduct(p);
    document.title = `${p.name} — Vinika Food Thoughts`;
    
    // Find related products
    const related = products.filter(prod => prod.id !== p.id).slice(0, 3);
    setRelatedProducts(related);
  }, [slug, navigate]);

  if (!product) return null;

  const images = (product.images && product.images.length > 0) ? product.images : ["product-turmeric"];
  const currentImage = getImageUrl(images[imgIdx]);

  const variants = product.quantityPricing && product.quantityPricing.length > 0
    ? product.quantityPricing
    : [{ label: "1 Pack", price: product.price }];

  const currentPrice = variants[selectedVariant]?.price || product.price;
  const currentLabel = variants[selectedVariant]?.label || "";

  // Compute discount tag
  const discountPercent = Math.round(((product.mrp - currentPrice) / product.mrp) * 100);

  // Reviews
  const allReviews = store.getReviews();
  const productReviews = allReviews.filter(r => r.productId === product.id);
  const avgRating = productReviews.length > 0
    ? (productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1)
    : "0";
  
  const ratingsCount = [5, 4, 3, 2, 1].map(star => {
    const count = productReviews.filter(r => r.rating === star).length;
    return {
      star,
      count,
      percent: productReviews.length > 0 ? (count / productReviews.length) * 100 : 0
    };
  });

  const nextImage = () => setImgIdx((imgIdx + 1) % images.length);
  const prevImage = () => setImgIdx((imgIdx - 1 + images.length) % images.length);

  // Handle Swipe
  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) nextImage();
    if (isRightSwipe) prevImage();
    setTouchStart(null);
    setTouchEnd(null);
  };

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

  return (
    <Layout>
      <div className="bg-[#f0e8d8] min-h-screen pb-20">
        
        {/* Back Navigation */}
        <div className="container mx-auto px-4 py-4 md:py-6 relative z-10">
          <button onClick={() => navigate(-1)} className="flex items-center text-[#6b6b5a] hover:text-[#c07840] font-medium text-sm transition-colors group">
            <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Shop
          </button>
        </div>

        {/* Product Dual Column Layout */}
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 lg:gap-24 mb-16">
            
            {/* LEFT: Image Carousel */}
            <div className="w-full md:w-1/2 flex-shrink-0">
              <div 
                className="card-warm overflow-hidden bg-white/50 aspect-[4/5] md:aspect-square relative sticky top-24"
                onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
              >
                <img 
                  key={currentImage} // forces re-render for simple transition
                  src={currentImage} 
                  alt={product.name} 
                  className="w-full h-full object-contain mix-blend-multiply opacity-0 animate-[fadeIn_0.3s_ease_forwards]" 
                />
                
                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white shadow-md transition-colors z-10">
                      <ChevronLeft className="h-5 w-5 text-[#1a1a0a]" />
                    </button>
                    <button onClick={nextImage} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white shadow-md transition-colors z-10">
                      <ChevronRight className="h-5 w-5 text-[#1a1a0a]" />
                    </button>
                    
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/5 px-3 py-1.5 rounded-full backdrop-blur-sm">
                      {images.map((_, i) => (
                        <button 
                          key={i} 
                          onClick={() => setImgIdx(i)} 
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${i === imgIdx ? "bg-[#c07840] w-4" : "bg-[#c07840]/30 hover:bg-[#c07840]/60"}`} 
                        />
                      ))}
                    </div>
                  </>
                )}
                
                {product.highlights?.vegNonVeg === "Veg" && (
                  <div className="absolute top-4 left-4 bg-white/90 rounded-full p-1.5 shadow-sm z-10">
                    <Leaf className="h-5 w-5 text-[#4a7c1e]" />
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Product Info Block */}
            <div className="w-full md:w-1/2 pt-2 md:pt-4 flex flex-col">
              
              <span className="text-xs font-semibold uppercase tracking-widest text-[#c07840] mb-2">{product.category}</span>
              <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-[#1a1a0a] leading-tight mb-4">
                {product.name}
              </h1>

              {/* Reviews Summary above description */}
              {productReviews.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-[#c07840] fill-[#c07840] mr-1" />
                    <span className="font-bold text-[#1a1a0a]">{avgRating}</span>
                  </div>
                  <span className="text-sm text-[#6b6b5a] underline decoration-[#6b6b5a]/30 decoration-dashed">
                    ({productReviews.length} reviews)
                  </span>
                </div>
              )}

              {/* Short Description */}
              <div className="text-[#6b6b5a] mb-6 leading-relaxed">
                <p className={`${!showFullDesc && "line-clamp-2"} transition-all`}>
                  {product.description}
                </p>
                {product.description.length > 120 && (
                  <button onClick={() => setShowFullDesc(!showFullDesc)} className="text-[#c07840] font-medium text-sm mt-1 hover:underline">
                    {showFullDesc ? "Read less" : "Read more"}
                  </button>
                )}
              </div>

              {/* Price Row */}
              <div className="flex items-center gap-3 mb-6 bg-white/40 p-4 rounded-2xl border border-white/60 shadow-sm w-fit">
                <span className="text-3xl font-bold text-[#1a1a0a]">₹{currentPrice}</span>
                <span className="text-lg text-[#6b6b5a] line-through decoration-[#6b6b5a]/50">₹{product.mrp}</span>
                {discountPercent > 0 && (
                  <span className="text-sm font-bold text-[#4a7c1e] bg-[#e8f5e0] px-2.5 py-1 rounded-full">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {/* Pack Selector Pills */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#1a1a0a] mb-3">Select Quantity</h3>
                <div className="flex flex-wrap gap-2.5">
                  {variants.map((v, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedVariant(i)}
                      className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedVariant === i
                          ? "border-[2px] border-[#4a7c1e] text-[#4a7c1e] bg-transparent shadow-sm"
                          : "border border-[#ccc] text-[#6b6b5a] bg-transparent hover:border-[#4a7c1e]/50"
                      }`}
                    >
                      {v.label} — ₹{v.price}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="mb-6">
                <Button 
                  className="w-full bg-[#c07840] hover:bg-[#a8622e] text-white rounded-full py-6 md:py-7 text-lg font-bold shadow-lg shadow-[#c07840]/20 transition-transform active:scale-[0.98]"
                  onClick={(e) => { triggerCartFly(e); addToCart(product.id, 1, currentLabel); }}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" /> Add to Cart • {currentLabel}
                </Button>
              </div>

              {/* Details Toggle */}
              {product.highlights && product.highlights.genericName && (
                <div className="mb-8">
                  <button 
                    onClick={() => setShowDetails(!showDetails)} 
                    className="flex items-center text-sm font-medium text-[#c07840] hover:text-[#a8622e] transition-colors"
                  >
                    <Info className="h-4 w-4 mr-1.5" />
                    {showDetails ? "Hide Product Details" : "Show Product Details"}
                  </button>

                  {/* Highlights Table */}
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-4 bg-white rounded-2xl p-5 shadow-sm border border-black/5">
                          <h4 className="font-heading font-bold text-[#1a1a0a] mb-4 text-lg">Product Highlights</h4>
                          <div className="space-y-0 text-sm">
                            {[
                              ["Generic Name", product.highlights.genericName],
                              ["Net Quantity", product.highlights.netQuantity + "g"],
                              ["Shelf Life", product.highlights.shelfLife],
                              ["Weight", product.highlights.weight],
                              ["FSSAI License", product.highlights.fssaiLicense],
                              ["Veg/Non-Veg", product.highlights.vegNonVeg === "Veg" ? <span className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-[#4a7c1e]"></div>Veg</span> : "Non-Veg"],
                              ["Country of Origin", product.highlights.countryOfOrigin],
                            ].map(([label, value], i) => (
                              <div key={label as string} className={`flex justify-between py-2.5 px-3 rounded-lg ${i % 2 === 0 ? "bg-[#f0e8d8]/40" : "bg-white"}`}>
                                <span className="text-[#6b6b5a] font-medium">{label}</span>
                                <span className="font-semibold text-[#1a1a0a] text-right">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Full Description & Ingredients */}
              <div className="border-t border-black/10 pt-8 mt-4">
                <h2 className="font-heading text-2xl font-bold text-[#1a1a0a] mb-4">About This Product</h2>
                <div className="prose prose-sm md:prose-base prose-[#6b6b5a] max-w-none text-[#6b6b5a] leading-relaxed">
                  <p>{product.description}</p>
                </div>
                
                {product.ingredients && product.ingredients.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-heading text-lg font-bold text-[#1a1a0a] mb-3">Ingredients</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.ingredients.map((ing, i) => (
                        <span key={i} className="bg-white px-3 py-1.5 rounded-full text-sm text-[#6b6b5a] border border-black/5 shadow-sm">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {product.benefits && product.benefits.length > 0 && (
                  <div className="mt-6">
                    <h3 className="font-heading text-lg font-bold text-[#1a1a0a] mb-3">Key Benefits</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-[#6b6b5a]">
                      {product.benefits.map((ben, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Leaf className="h-4 w-4 text-[#4a7c1e] mt-0.5 flex-shrink-0" />
                          <span>{ben}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

            </div>
          </div>
          
          {/* Customer Reviews Section */}
          <div className="border-t border-black/10 pt-16 mb-16 max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl font-bold text-[#1a1a0a] mb-8 text-center">Customer Reviews</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-10">
              {/* Ratings Summary */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-black/5 text-center flex flex-col items-center h-fit">
                <div className="text-5xl font-bold text-[#1a1a0a]">{avgRating}</div>
                <div className="flex gap-1 justify-center my-3">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={`h-5 w-5 ${star <= Math.round(Number(avgRating)) ? "text-[#c07840] fill-[#c07840]" : "text-[#ccc]"}`} />
                  ))}
                </div>
                <p className="text-sm text-[#6b6b5a] mb-6">Based on {productReviews.length} reviews</p>
                
                <div className="w-full space-y-2 mb-6">
                  {ratingsCount.map(item => (
                    <div key={item.star} className="flex items-center text-sm">
                      <span className="w-3 font-medium text-[#1a1a0a]">{item.star}</span>
                      <Star className="h-3 w-3 text-[#1a1a0a] fill-[#1a1a0a] mx-1" />
                      <div className="flex-1 h-2 bg-[#f0e8d8] rounded-full mx-2 overflow-hidden">
                        <div className="h-full bg-[#c07840] rounded-full" style={{ width: `${item.percent}%` }} />
                      </div>
                      <span className="w-8 text-right text-[#6b6b5a]">{item.count}</span>
                    </div>
                  ))}
                </div>
                
                <Button className="w-full bg-transparent text-[#4a7c1e] border-2 border-[#4a7c1e] hover:bg-[#4a7c1e] hover:text-white rounded-full transition-colors">
                  Write a Review
                </Button>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {productReviews.length === 0 ? (
                  <div className="bg-white/50 border border-dashed border-[#ccc] rounded-2xl p-10 text-center flex flex-col items-center justify-center h-full min-h-[250px]">
                    <Star className="h-10 w-10 text-[#ccc] mb-4" />
                    <h3 className="text-lg font-bold text-[#1a1a0a]">No reviews yet</h3>
                    <p className="text-[#6b6b5a] mt-1">Be the first to review this product!</p>
                  </div>
                ) : (
                  productReviews.map(r => (
                    <div key={r.id} className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-[#1a1a0a]">{r.userName}</span>
                            {r.verified && (
                              <span className="flex items-center text-[10px] font-bold text-[#4a7c1e] bg-[#e8f5e0] px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                ✓ Verified
                              </span>
                            )}
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Star key={s} className={`h-3 w-3 ${s <= r.rating ? "text-[#c07840] fill-[#c07840]" : "text-[#ccc]"}`} />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-[#6b6b5a]">{r.date}</span>
                      </div>
                      <p className="text-[#6b6b5a] text-sm leading-relaxed">{r.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-10 border-t border-black/10">
              <h2 className="font-heading text-3xl font-bold text-[#1a1a0a] mb-8 text-center md:text-left">You Might Also Like</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
