import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { store } from "@/lib/store";
import { Link } from "react-router-dom";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { Leaf, Shield, FlaskConical, Heart, Users, Clock, Award, Sprout, BadgeCheck, CreditCard, Truck, Tag, RotateCcw, Store } from "lucide-react";
import heroBg from "@/assets/hero-bg-updated.png";

const HomePage = () => {
  const { products: cloudProducts, content: cloudContent } = useApp();
  const [showContent, setShowContent] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  
  // High-reliability products fallback
  let products = cloudProducts.length > 0 ? cloudProducts : store.getProducts();
  if (products.length === 0) products = store.getProducts();
  
  const featured = products.slice(0, 2);
  const content = cloudContent || store.getContent();

  // Framer Motion smooth springs
  const mouseX = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });
  const mouseY = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });
  const rotateX = useTransform(mouseY, [-400, 400], [8, -8]);
  const rotateY = useTransform(mouseX, [-400, 400], [-8, 8]);

  useScrollAnimation(".reveal", 0.15);
  useScrollAnimation(".trust-group", 0.15);
  useScrollAnimation(".banner-reveal", 0.15);
  useScrollAnimation(".feature-card", 0.15);

  const handleMouseMove = (e: React.MouseEvent) => {
    // Distance sensing from screen center for maximum reliability
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
    
    // Proximity Sensing Logic
    const distance = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
    if (distance < 450) {
      if (!showContent) setShowContent(true);
    } else if (showContent && distance > 550) {
      setShowContent(false);
    }
  };


  const whyChooseUs = [
    { icon: <BadgeCheck className="h-8 w-8" />, title: "Best Quality", desc: "Made with carefully selected natural ingredients, hygienically processed, and quality-tested" },
    { icon: <CreditCard className="h-8 w-8" />, title: "Online Payment", desc: "Easy, secure, and hassle-free online payment options for a smooth and convenient experience" },
    { icon: <Truck className="h-8 w-8" />, title: "Fast Delivery", desc: "Quick and reliable delivery to ensure fresh products reach your doorstep on time" },
  ];

  const trustBadges = [
    { icon: <Tag className="h-7 w-7" />, title: "Lowest Price" },
    { icon: <Store className="h-7 w-7" />, title: "Cash on Delivery" },
    { icon: <RotateCcw className="h-7 w-7" />, title: "7-day Returns" },
  ];

  return (
    <Layout showAnnouncement>
      {/* Hero */}
      <section 
        ref={sectionRef}
        className="relative min-h-[85vh] md:min-h-[95vh] flex items-center justify-center overflow-hidden bg-black cursor-none select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowContent(false)}
      >
        {/* Cursor Follower (Desktop only) */}
        {!showContent && (
          <motion.div 
            className="hidden md:block fixed z-[99] pointer-events-none w-12 h-12 rounded-full border border-white/30 backdrop-blur-sm shadow-xl"
            style={{ x: mouseX, y: mouseY, left: "50%", top: "50%", marginLeft: -24, marginTop: -24 }}
          />
        )}

        <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.img 
            id="hero-img"
            src={heroBg} 
            alt="Vinika Food Thoughts" 
            className="w-full h-full object-cover object-center"
            animate={{ 
              filter: showContent ? "blur(4px) brightness(0.7) saturate(0.9)" : "blur(0px) brightness(1) saturate(1)",
              scale: showContent ? 1.08 : 1
            }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
          <motion.div 
            className="absolute inset-0 bg-background/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: showContent ? 1 : 0 }}
            transition={{ duration: 1.2 }}
          />
        </div>
        
        {/* Interaction Layer (Overlay) */}
        <div className="absolute inset-0 z-10" onClick={() => setShowContent(!showContent)} />

        <div className="container mx-auto px-4 relative z-20 pointer-events-none">
          <motion.div 
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            animate={{ 
              opacity: showContent ? 1 : 0,
              y: showContent ? 0 : 40,
              scale: showContent ? 1 : 0.95
            }}
            transition={{ duration: 0.8, ease: "backOut" }}
            className="max-w-xl mx-auto bg-white/5 backdrop-blur-[30px] p-10 md:p-14 rounded-[4rem] border border-white/10 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ transform: "translateZ(50px)" }}>
              <h1 className="font-heading text-3xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight drop-shadow-sm">
                {content.heroHeadline}
              </h1>
              <p className="text-sm md:text-xl text-foreground font-semibold md:font-normal md:text-muted-foreground mt-4 md:mt-6 leading-relaxed">
                {content.heroSubtext}
              </p>
              <div className="flex flex-wrap gap-3 md:gap-4 mt-8 md:mt-10">
                <Button variant="hero" size="lg" className="btn-shimmer h-12 md:h-14 px-8 text-white rounded-full" asChild>
                  <Link to="/shop">{content.heroCTA1}</Link>
                </Button>
                <Button variant="heroOutline" size="lg" className="btn-outline-fill h-12 md:h-14 px-8 rounded-full" asChild>
                  <Link to="/about">{content.heroCTA2}</Link>
                </Button>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            animate={{ opacity: showContent ? 0 : 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[25vh] text-center pointer-events-none"
          >
            <div className="text-white/40 text-[10px] md:text-xs font-medium tracking-[0.4em] uppercase animate-pulse mb-2">
              Explore the Pureness
            </div>
            <div className="h-12 w-[1px] bg-gradient-to-b from-white/40 to-transparent mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 reveal">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Our Bestsellers</h2>
            <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {featured.map((p, i) => <ProductCard key={p.id} product={p} delay={i * 110} />)}
          </div>
        </div>
      </section>

      {/* Trust Badges Strip - Lowest Price / COD / 7-day Returns */}
      <section className="bg-primary/10 py-5">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {trustBadges.map((badge, i) => (
              <div key={i} className="flex flex-col items-center gap-2 trust-group" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="bg-primary/15 rounded-full p-3 text-primary trust-icon-lift">{badge.icon}</div>
                <span className="text-sm font-semibold text-foreground">{badge.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Strip (Slow Marquee) */}
      <section className="bg-accent py-6 md:py-8 overflow-hidden">
        <div className="flex whitespace-nowrap">
          <motion.div 
            className="flex items-center gap-12 md:gap-20 px-6 pr-12 md:pr-20"
            animate={{ x: [0, "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
            style={{ width: "max-content" }}
          >
            {[...content.features, ...content.features, ...content.features, ...content.features, ...content.features, ...content.features].map((f, i) => (
              <span key={i} className="text-accent-foreground/90 font-heading text-xl md:text-3xl italic tracking-wide">
                “{f}”
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us - Best Quality / Online Payment / Fast Delivery */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10 reveal">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Why Choose Us</h2>
            <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {whyChooseUs.map((item, i) => (
              <div key={i} className="card-warm p-8 text-center group transition-all feature-card" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="bg-secondary rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-primary feature-icon-rotate">
                  {item.icon}
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* About Teaser */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <Leaf className="h-10 w-10 text-primary mx-auto mb-6" />
          <p className="font-heading text-2xl md:text-3xl text-foreground leading-relaxed italic">
            "{content.aboutTeaser}"
          </p>
          <div className="w-16 h-0.5 bg-accent mx-auto my-8" />
          <Button variant="heroOutline" asChild>
            <Link to="/about">Read Our Story</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
