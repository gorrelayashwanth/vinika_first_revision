import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { store } from "@/lib/store";
import { setSettings, setContent, saveCoupon } from "@/lib/firestore";
import { setDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const MigrateDB = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleMigrate = async () => {
    setLoading(true);
    try {
      // Migrate Products (keeping their existing IDs)
      const products = store.getProducts();
      for (const p of products) {
        await setDoc(doc(db, "products", p.id), p);
      }

      // Migrate Settings
      const settings = store.getSettings();
      await setSettings(settings);

      // Migrate Content
      const content = store.getContent();
      await setContent(content);

      // Migrate Coupons
      const coupons = store.getCoupons();
      for (const c of coupons) {
        // The saveCoupon helper handles creates/updates
        await saveCoupon(c);
      }

      toast({ title: "Migration Complete!", description: "All local data has been pushed to your real Firebase Database!" });
    } catch (e: any) {
      toast({ title: "Migration Failed", description: e.message, variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center card-warm p-10 max-w-md w-full">
        <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Initialize Live Database</h1>
        <p className="text-muted-foreground text-sm mb-6">
          This will take your local products, store settings, about page content, and coupons, and permanently push them up to your live Firebase Cloud database.
        </p>
        <Button onClick={handleMigrate} disabled={loading} variant="hero" className="w-full">
          {loading ? "Uploading to Cloud..." : "Push Data to Firebase"}
        </Button>
      </div>
    </div>
  );
};

export default MigrateDB;
