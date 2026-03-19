import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Leaf, ArrowRight, Loader2 } from "lucide-react";
import { registerWithEmail } from "@/lib/firebaseAuth";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });

  const set = (key: keyof typeof form, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    if (form.password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(form.email, form.password, form.name, form.phone);
      toast({ title: "Account created!", description: "Welcome to Vinika Food Thoughts 🌿" });
      navigate("/");
    } catch (err: any) {
      toast({ title: "Registration failed", description: err.message || "Please try again", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center bg-primary/10 rounded-full p-4 mb-4">
              <Leaf className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Create Account</h1>
            <p className="text-muted-foreground mt-1">Join Vinika Food Thoughts today</p>
          </div>

          <form onSubmit={handleSubmit} className="card-warm p-8 space-y-4">
            <div>
              <label className="text-xs text-muted-foreground font-medium">Full Name</label>
              <Input placeholder="Your full name" value={form.name} onChange={e => set("name", e.target.value)} required className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium">Email Address</label>
              <Input type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} required className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium">Phone Number</label>
              <div className="flex gap-2 mt-1">
                <div className="flex items-center px-3 bg-secondary rounded-lg border border-border text-sm font-medium text-muted-foreground">+91</div>
                <Input type="tel" placeholder="9876543210" value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))} />
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium">Password</label>
              <Input type="password" placeholder="At least 6 characters" value={form.password} onChange={e => set("password", e.target.value)} required className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-medium">Confirm Password</label>
              <Input type="password" placeholder="Repeat password" value={form.confirm} onChange={e => set("confirm", e.target.value)} required className="mt-1" />
            </div>
            <Button type="submit" className="w-full" variant="hero" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ArrowRight className="h-4 w-4" /> Create Account</>}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default RegisterPage;
