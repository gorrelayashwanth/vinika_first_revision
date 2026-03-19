import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { store } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { User, Package, IndianRupee } from "lucide-react";

const MyProfilePage = () => {
  const { user, updateUser } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [pw, setPw] = useState({ old: "", new_: "", confirm: "" });

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    setForm({ name: user.name, phone: user.phone, address: user.address || "" });
  }, [user, navigate]);

  if (!user) return null;

  const orders = store.getOrders().filter(o => o.userId === user.id);
  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const initials = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ ...user, ...form });
    toast({ title: "Profile updated!" });
  };

  const handlePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.old !== user.password) { toast({ title: "Wrong current password", variant: "destructive" }); return; }
    if (pw.new_.length < 8) { toast({ title: "Min 8 characters", variant: "destructive" }); return; }
    if (pw.new_ !== pw.confirm) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    updateUser({ ...user, password: pw.new_ });
    setPw({ old: "", new_: "", confirm: "" });
    toast({ title: "Password changed!" });
  };

  return (
    <Layout>
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-8">
            <div className="h-20 w-20 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
              {initials}
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground">{user.name}</h1>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="card-warm p-4 text-center">
              <Package className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="font-bold text-foreground">{orders.length}</p>
              <p className="text-xs text-muted-foreground">Orders</p>
            </div>
            <div className="card-warm p-4 text-center">
              <IndianRupee className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="font-bold text-foreground">₹{totalSpent}</p>
              <p className="text-xs text-muted-foreground">Total Spent</p>
            </div>
          </div>

          <form onSubmit={handleProfile} className="card-warm p-6 mb-6">
            <h2 className="font-heading text-lg font-bold text-foreground mb-4">Edit Profile</h2>
            <div className="space-y-4">
              {[
                { k: "name", l: "Full Name", t: "text" },
                { k: "phone", l: "Phone", t: "tel" },
                { k: "address", l: "Address", t: "text" },
              ].map(f => (
                <div key={f.k}>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">{f.l}</label>
                  <input
                    type={f.t} value={(form as any)[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              ))}
            </div>
            <Button type="submit" variant="default" size="default" className="mt-4">Save Changes</Button>
          </form>

          <form onSubmit={handlePassword} className="card-warm p-6">
            <h2 className="font-heading text-lg font-bold text-foreground mb-4">Change Password</h2>
            <div className="space-y-4">
              {[
                { k: "old", l: "Current Password" },
                { k: "new_", l: "New Password" },
                { k: "confirm", l: "Confirm Password" },
              ].map(f => (
                <div key={f.k}>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">{f.l}</label>
                  <input
                    type="password" required value={(pw as any)[f.k]} onChange={e => setPw(p => ({ ...p, [f.k]: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              ))}
            </div>
            <Button type="submit" variant="default" size="default" className="mt-4">Update Password</Button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default MyProfilePage;
