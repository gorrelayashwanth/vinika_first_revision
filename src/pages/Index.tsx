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
  const { products } = useApp();
  const content = store.getContent();
  const featured = products.filter(p => p.featured);

  useScrollAnimation(".reveal", 0.15);
  useScrollAnimation(".trust-group", 0.15);
  useScrollAnimation(".banner-reveal", 0.15);
  useScrollAnimation(".feature-card", 0.15);

  const statIcons = [<Sprout key="s" className="h-8 w-8" />, <Shield key="sh" className="h-8 w-8" />, <Users key="u" className="h-8 w-8" />, <Clock key="c" className="h-8 w-8" />];
  const stats = [content.statsNatural, content.statsAdditives, content.statsOrders, content.statsYears];

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
      <section className="relative min-h-[75vh] md:min-h-[85vh] flex items-start md:items-center overflow-hidden pt-12 md:pt-0">
        <div className="absolute inset-0">
          <img src={heroBg} alt="Vinika Food Thoughts" className="w-full h-full object-cover object-center hero-ken-burns" />
          {/* Fading Overlay - appears much later to preserve image visibility */}
          <div 
            className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-transparent md:bg-gradient-to-r md:from-background/90 md:via-background/70 md:to-background/30 hero-box-reveal" 
            style={{ animationDelay: "1500ms" }}
          />
        </div>
        <div className="absolute top-20 right-20 opacity-20 animate-float hidden lg:block">
          <Leaf className="h-24 w-24 text-primary" />
        </div>
        <div className="absolute bottom-32 right-40 opacity-15 animate-float-delayed hidden lg:block">
          <Leaf className="h-16 w-16 text-primary rotate-45" />
        </div>
        <div className="container mx-auto px-4 relative z-10 mt-6 md:mt-0">
          <div 
            className="max-w-xl bg-white/10 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl md:shadow-none hero-box-reveal" 
            style={{ animationDelay: "1500ms" }}
          >
            <h1 className="font-heading text-2xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight hero-fade-up" style={{ animationDelay: "1850ms" }}>
              {content.heroHeadline}
            </h1>
            <p className="text-xs md:text-xl text-foreground font-semibold md:font-normal md:text-muted-foreground mt-4 md:mt-6 leading-relaxed hero-fade-up" style={{ animationDelay: "2200ms" }}>
              {content.heroSubtext}
            </p>
            <div className="flex flex-wrap gap-3 md:gap-4 mt-6 md:mt-8 hero-fade-up" style={{ animationDelay: "2550ms" }}>
              <Button variant="hero" size="lg" className="btn-shimmer text-xs md:text-base h-10 md:h-12" asChild>
                <Link to="/shop">{content.heroCTA1}</Link>
              </Button>
              <Button variant="heroOutline" size="lg" className="btn-outline-fill text-xs md:text-base h-10 md:h-12" asChild>
                <Link to="/about">{content.heroCTA2}</Link>
              </Button>
            </div>
          </div>
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

      {/* Features Strip */}
      <section className="bg-accent py-6 banner-reveal">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6">
            {content.features.map((f, i) => (
              <span key={i} className="bg-accent-foreground/10 text-accent-foreground px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm pill-hover banner-reveal" style={{ transitionDelay: `${400 + i * 55}ms` }}>
                {f}
              </span>
            ))}
          </div>
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

      {/* Stats */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <div key={i} className="text-center card-warm p-6">
                <div className="text-primary mx-auto mb-3 flex justify-center">{statIcons[i]}</div>
                <p className="font-heading text-lg font-bold text-foreground">{s}</p>
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
