import { Link, useNavigate } from "react-router-dom";
import { Leaf, ShoppingCart, Menu, X, User, LogOut, Package, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { useState } from "react";

const Navbar = () => {
  const { user, cartCount, logout } = useApp();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initials = user ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "";

  const links = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Leaf className="h-7 w-7 text-primary transition-transform group-hover:rotate-12" />
          <span className="font-heading text-xl font-bold text-foreground">Vinika Food Thoughts</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <Link key={l.to} to={l.to} className="font-body text-sm font-medium text-foreground/70 hover:text-primary transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/cart")} className="relative p-2 hover:bg-secondary rounded-full transition-colors">
            <ShoppingCart className="h-5 w-5 text-foreground" />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1.5 p-1"
              >
                <div className="h-9 w-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">
                  {initials}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground hidden sm:block" />
              </button>
              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-card rounded-2xl shadow-warm-lg border border-border z-50 py-2 animate-scale-in">
                    <Link to="/my-profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                      <User className="h-4 w-4" /> My Profile
                    </Link>
                    <Link to="/my-orders" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-colors">
                      <Package className="h-4 w-4" /> My Orders
                    </Link>
                    <button onClick={() => { logout(); setDropdownOpen(false); }} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-secondary transition-colors w-full text-left text-destructive">
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Button variant="default" size="sm" onClick={() => navigate("/login")}>Login</Button>
          )}

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-t border-border animate-fade-in">
          <div className="flex flex-col py-4 px-4 gap-1">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="py-3 px-4 rounded-xl text-sm font-medium hover:bg-secondary transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
