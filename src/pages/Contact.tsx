import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { store } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";

const ContactPage = () => {
  const settings = store.getSettings();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const messages = store.getMessages();
    messages.push({ id: crypto.randomUUID(), ...form, date: new Date().toISOString() });
    store.setMessages(messages);
    setForm({ name: "", email: "", message: "" });
    toast({ title: "Message sent!", description: "We'll get back to you soon." });
  };

  const info = [
    { icon: <MapPin className="h-5 w-5" />, label: "Address", value: settings.contactAddress },
    { icon: <Phone className="h-5 w-5" />, label: "Phone", value: settings.contactPhone },
    { icon: <Mail className="h-5 w-5" />, label: "Email", value: settings.contactEmail },
    { icon: <Clock className="h-5 w-5" />, label: "Hours", value: settings.contactHours },
  ];

  return (
    <Layout>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-heading text-4xl font-bold text-foreground">Get in Touch</h1>
            <div className="w-20 h-1 bg-accent mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Info */}
            <div>
              <div className="space-y-6 mb-8">
                {info.map((i, idx) => (
                  <div key={idx} className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary">{i.icon}</div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{i.label}</p>
                      <p className="text-foreground">{i.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <a
                href="https://meesho.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-full font-medium hover:bg-accent/90 transition-colors"
              >
                <ExternalLink className="h-4 w-4" /> Shop on Meesho
              </a>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="card-warm p-6 space-y-4">
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">Send us a message</h2>
              {[
                { k: "name", l: "Name", t: "text" },
                { k: "email", l: "Email", t: "email" },
              ].map(f => (
                <div key={f.k}>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">{f.l}</label>
                  <input
                    type={f.t} required value={(form as any)[f.k]} onChange={e => setForm(p => ({ ...p, [f.k]: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Message</label>
                <textarea
                  required rows={4} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-input bg-background text-foreground text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full">Send Message</Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ContactPage;
