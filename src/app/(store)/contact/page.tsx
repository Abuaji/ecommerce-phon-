import { getPublicSettings } from "@/actions/admin/settings.actions";
import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicSettings();
  const getSetting = (key: string) => settings.find(s => s.key === key)?.value || "";
  
  return {
    title: "Contact Us | " + (getSetting("store_name") || "Mobile Accessories"),
    description: getSetting("contact_description"),
  };
}

export default async function ContactPage() {
  const settings = await getPublicSettings();
  const getSetting = (key: string) => settings.find(s => s.key === key)?.value || "";

  const heroHeadline = getSetting("contact_hero_headline");
  const description = getSetting("contact_description");
  const phone = getSetting("contact_phone");
  const email = getSetting("contact_email");
  const address = getSetting("contact_address");
  const businessHours = getSetting("contact_business_hours");

  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-foreground">
          {heroHeadline || "Contact Us"}
        </h1>
        {description && (
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
        
        {/* Contact Info */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
          
          <div className="space-y-6">
            {phone && (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Phone</h3>
                  <a href={`tel:${phone}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {phone}
                  </a>
                </div>
              </div>
            )}

            {email && (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Email</h3>
                  <a href={`mailto:${email}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {email}
                  </a>
                </div>
              </div>
            )}

            {address && (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Address</h3>
                  <p className="text-muted-foreground whitespace-pre-line">
                    {address}
                  </p>
                </div>
              </div>
            )}

            {businessHours && (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">Business Hours</h3>
                  <p className="text-muted-foreground">
                    {businessHours}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Form Placeholder */}
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-sm border border-border">
          <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
          <form className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">Name</label>
              <input 
                id="name" 
                type="text" 
                placeholder="Your Name" 
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input 
                id="email" 
                type="email" 
                placeholder="your.email@example.com" 
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">Message</label>
              <textarea 
                id="message" 
                rows={4} 
                placeholder="How can we help you?" 
                className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow resize-none"
              ></textarea>
            </div>
            <button 
              type="button" 
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors shadow-sm mt-2"
            >
              Send Message
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
