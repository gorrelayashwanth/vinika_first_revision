import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBar from "@/components/AnnouncementBar";
import ChatWidget from "@/components/ChatWidget";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/context/AppContext";
import { useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { store } from "@/lib/store";

const Layout = ({ children, showAnnouncement = false }: { children: ReactNode; showAnnouncement?: boolean }) => {
  const { cart } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);
  const products = store.getProducts();
  const totalPrice = cart.reduce((acc, item) => {
    const p = products.find(x => x.id === item.productId);
    if (!p) return acc;
    const variantPrice = item.selectedVariant ? p.quantityPricing?.find(q => q.label === item.selectedVariant)?.price : null;
    return acc + (variantPrice || p.price) * item.qty;
  }, 0);

  const hideBannerPages = ["/checkout", "/payment", "/admin"];
  const shouldShowBanner = totalItems > 0 && !hideBannerPages.some(p => location.pathname.startsWith(p));

  return (
    <div className="min-h-screen flex flex-col relative pb-safe">
      {showAnnouncement && <AnnouncementBar />}
      <Navbar />
      <motion.main
        className="flex-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>
      <Footer />
      <ChatWidget />

      <AnimatePresence>
        {shouldShowBanner && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 pointer-events-none"
          >
            <div className="container mx-auto max-w-5xl pointer-events-auto">
              <div 
                onClick={() => navigate("/checkout")}
                className="bg-primary text-primary-foreground rounded-2xl p-4 shadow-2xl flex items-center justify-between cursor-pointer hover:bg-primary/95 transition-all transform hover:scale-[1.01] overflow-hidden relative group"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl relative">
                    <ShoppingBag className="h-6 w-6" />
                    <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center shadow-sm">
                      {totalItems}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium opacity-90 leading-tight">Your Cart</p>
                    <p className="text-lg font-bold">₹{totalPrice}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 font-semibold">
                  <span>Checkout</span>
                  <div className="bg-white text-primary rounded-full p-1.5 group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Layout;

