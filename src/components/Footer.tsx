import { Link } from "react-router-dom";
import { Mail, Phone, MapPin } from "lucide-react";
import logoImg from "@/assets/vinika-logo.jpg";
import { store } from "@/lib/store";

const Footer = () => {
  const settings = store.getSettings();

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="mb-4 bg-white rounded-xl p-2 inline-block">
              <img src={logoImg} alt="Vinika Food Thoughts" className="h-16 md:h-20 w-auto object-contain" />
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Handcrafted health foods made with love, sourced from nature's finest ingredients.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[{ to: "/", label: "Home" }, { to: "/shop", label: "Shop" }, { to: "/about", label: "About Us" }, { to: "/contact", label: "Contact" }].map(l => (
                <Link key={l.to} to={l.to} className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Policies */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Policies</h4>
            <div className="flex flex-col gap-2">
              {["Privacy Policy", "Shipping Policy", "Return & Refund", "Terms & Conditions"].map(p => (
                <span key={p} className="text-sm text-primary-foreground/70 cursor-pointer hover:text-primary-foreground transition-colors">{p}</span>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4">Contact Info</h4>
            <div className="flex flex-col gap-3 text-sm text-primary-foreground/70">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{settings.contactAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{settings.contactPhone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>{settings.contactEmail}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-12 pt-8 text-center text-sm text-primary-foreground/50">
          © 2025 Vinika Food Thoughts. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
