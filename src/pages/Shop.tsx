import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { useApp } from "@/context/AppContext";
import { store } from "@/lib/store";

const ShopPage = () => {
  const { products: cloudProducts } = useApp();
  
  // Robust fallback: if cloud is empty AND local is empty, use defaultProducts from store
  let products = cloudProducts.length > 0 ? cloudProducts : store.getProducts();
  if (products.length === 0) {
    // If somehow local is also empty, use the built-in defaults explicitly
    products = store.getProducts(); 
  }

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl font-bold text-foreground">Our Products</h1>
            <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full" />
            <p className="text-muted-foreground mt-4 max-w-md mx-auto">
              Every product is crafted with care, using only the purest natural ingredients.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ShopPage;
