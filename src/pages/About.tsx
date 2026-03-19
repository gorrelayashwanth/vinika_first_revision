import Layout from "@/components/Layout";
import { store } from "@/lib/store";
import { Leaf, Heart, Sparkles, Shield, Home, Clock, CheckCircle2, Flame, Droplets, Zap } from "lucide-react";

// 5 icons for the 5 values
const icons = [
  <Leaf key="l" className="h-8 w-8" />,
  <Sparkles key="s" className="h-8 w-8" />,
  <Clock key="c" className="h-8 w-8" />,
  <Shield key="sh" className="h-8 w-8" />,
  <Home key="ho" className="h-8 w-8" />,
];

const productFeaturesIcons = [
  <Leaf key="f1" className="h-5 w-5" />,
  <CheckCircle2 key="f2" className="h-5 w-5" />,
  <Shield key="f3" className="h-5 w-5" />,
  <Sparkles key="f4" className="h-5 w-5" />,
  <Droplets key="f5" className="h-5 w-5" />,
  <Zap key="f6" className="h-5 w-5" />,
];

const AboutPage = () => {
  const content = store.getContent();
  const products = store.getProducts();

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary py-20">
        <div className="container mx-auto px-4 text-center">
          <Leaf className="h-12 w-12 text-primary-foreground/50 mx-auto mb-6" />
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-primary-foreground max-w-3xl mx-auto leading-tight">
            {content.aboutHero.split(".")[0]}.
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-lg text-foreground/80 leading-relaxed text-center">{content.aboutHero}</p>
          <div className="w-16 h-0.5 bg-accent mx-auto my-10" />
          <p className="text-xl font-heading text-primary leading-relaxed text-center italic">"{content.aboutTeaser}"</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-secondary/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <div className="card-warm p-8 text-center bg-card">
              <h3 className="font-heading text-2xl font-bold text-primary mb-4">Our Mission</h3>
              <p className="text-muted-foreground leading-relaxed">{content.brandMission}</p>
            </div>
            <div className="card-warm p-8 text-center bg-card">
              <h3 className="font-heading text-2xl font-bold text-accent mb-4">Our Vision</h3>
              <p className="text-muted-foreground leading-relaxed">{content.brandVision}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Products Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Our Products</h2>
            <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full" />
          </div>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mt-4 mb-14 leading-relaxed whitespace-pre-line">
            {content.aboutProductsIntro}
          </p>

          <div className="space-y-10 max-w-5xl mx-auto">
            {products.map((product, idx) => {
              const bgClass = idx % 2 === 0 ? "bg-primary/10" : "bg-accent/10";
              const borderClass = idx % 2 === 0 ? "border-primary/20" : "border-accent/20";
              const textClass = idx % 2 === 0 ? "text-primary" : "text-accent";
              const dotClass = idx % 2 === 0 ? "bg-primary" : "bg-accent";

              return (
                <div key={product.id} className={`card-warm p-0 overflow-hidden border ${borderClass}`}>
                  {/* Product Header */}
                  <div className={`${bgClass} px-8 py-6`}>
                    <h3 className="font-heading text-2xl font-bold text-foreground">{product.name}</h3>
                    <p className={`text-sm font-medium mt-1 ${textClass}`}>{product.category}</p>
                  </div>

                  <div className="p-8">
                    <p className="text-muted-foreground leading-relaxed mb-8">{product.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Ingredients */}
                      {product.ingredients?.length > 0 && (
                        <div>
                          <h4 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                            <Leaf className={`h-4 w-4 ${textClass}`} />
                            Ingredients:
                          </h4>
                          <ul className="space-y-2">
                            {product.ingredients.map((ing, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                                {ing}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Benefits */}
                      {product.benefits?.length > 0 && (
                        <div>
                          <h4 className="font-heading font-bold text-foreground mb-4 flex items-center gap-2">
                            <Zap className={`h-4 w-4 ${textClass}`} />
                            Benefits:
                          </h4>
                          <ul className="space-y-2">
                            {product.benefits.map((ben, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className={`h-4 w-4 mt-0.5 shrink-0 ${textClass}`} />
                                {ben}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Product Features */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl font-bold text-foreground">Product Features</h2>
            <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {content.productFeatures.map((feature, i) => (
              <div key={i} className="card-warm p-4 text-center">
                <div className="text-primary mb-2 flex justify-center">
                  {productFeaturesIcons[i % productFeaturesIcons.length]}
                </div>
                <p className="text-xs font-medium text-foreground leading-tight">{feature}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8 max-w-xl mx-auto">
            {content.productFeaturesFooter}
          </p>
        </div>
      </section>

      {/* How to Prepare */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl font-bold text-foreground">How to Prepare</h2>
            <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full" />
          </div>
          <div className="space-y-4">
            {content.preparationSteps.map((stepText, i) => (
              <div key={i} className="flex items-start gap-4 card-warm p-5">
                <div className="h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-heading font-bold text-sm shrink-0">
                  {i + 1}
                </div>
                <p className="text-foreground/80 leading-relaxed pt-1.5">{stepText}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-accent/10 rounded-2xl p-5 text-center border border-accent/20">
            <Flame className="h-5 w-5 text-accent mx-auto mb-2" />
            <p className="text-sm font-medium text-foreground">
              Serve hot with coconut chutney or sambar for the best experience!
            </p>
          </div>
        </div>
      </section>

      {/* Founder Message */}
      <section className="bg-secondary/50 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card rounded-2xl p-8 md:p-12 border border-border shadow-warm">
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">A Letter from our Founder</h2>
            <p className="text-lg text-foreground/80 leading-relaxed italic mb-6">
              "{content.founderMessage}"
            </p>
            <div className="border-t border-border pt-4">
              <h4 className="font-heading font-bold text-lg text-primary">{content.founderName}</h4>
              <span className="text-sm text-muted-foreground uppercase tracking-wider">{content.founderTitle}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl font-bold text-foreground text-center mb-12">Our Values</h2>
          <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
            {content.values.map((v, i) => (
              <div key={i} className="min-w-[160px] flex-1 card-warm p-6 text-center hover:-translate-y-1 transition-all duration-300">
                <div className="text-primary mb-4 flex justify-center">{icons[i % icons.length]}</div>
                <h3 className="font-heading text-base font-semibold text-foreground">{v}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AboutPage;
