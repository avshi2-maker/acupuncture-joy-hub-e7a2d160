import { Mail, MessageCircle, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  // Clinic location - update these values with actual address
  const [clinicAddress, setClinicAddress] = useState("Tel Aviv, Israel");
  const [businessHours, setBusinessHours] = useState([
    { day: "Sunday - Thursday", hours: "9:00 AM - 7:00 PM" },
    { day: "Friday", hours: "9:00 AM - 2:00 PM" },
    { day: "Saturday", hours: "Closed" },
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const whatsappNumber = "972544634923";
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  // Google Maps embed URL - update with actual clinic coordinates
  const googleMapsEmbedUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3381.0!2d34.78!3d32.08!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzLCsDA0JzQ4LjAiTiAzNMKwNDYnNDguMCJF!5e0!3m2!1sen!2sil!4v1`;

  const contactInfo = [
    {
      icon: MessageCircle,
      title: "WhatsApp Only",
      lines: ["054-4634923", "Messages only - No phone calls please"],
      isWhatsApp: true,
    },
    {
      icon: Mail,
      title: "Email Us",
      lines: ["ronisapir61@gmail.com"],
      isWhatsApp: false,
    },
  ];

  return (
    <section id="contact" className="py-24 bg-card">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-jade-light text-jade text-sm font-medium rounded-full mb-4">
            Get In Touch
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-6">
            Ready to Start <span className="text-jade">Your Healing?</span>
          </h2>
          <p className="font-body text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
            Have questions about our treatments or want to schedule a consultation? 
            Contact us via WhatsApp for the fastest response.
          </p>
        </div>

        {/* Contact Cards Row */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* WhatsApp Card */}
          <div className="bg-background rounded-xl p-5 shadow-soft ring-2 ring-green-500/30">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-green-500/10">
              <MessageCircle className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              WhatsApp Only
            </h3>
            <p className="font-body text-sm text-muted-foreground">054-4634923</p>
            <p className="font-body text-sm text-amber-600 font-medium">Messages only - No calls</p>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Send Message
            </a>
          </div>

          {/* Email Card */}
          <div className="bg-background rounded-xl p-5 shadow-soft">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-jade/10">
              <Mail className="w-5 h-5 text-jade" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Email Us
            </h3>
            <a 
              href="mailto:ronisapir61@gmail.com"
              className="font-body text-sm text-jade hover:underline"
            >
              ronisapir61@gmail.com
            </a>
          </div>

          {/* Location Card */}
          <div className="bg-background rounded-xl p-5 shadow-soft">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-jade/10">
              <MapPin className="w-5 h-5 text-jade" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Location
            </h3>
            <p className="font-body text-sm text-muted-foreground">{clinicAddress}</p>
            <p className="font-body text-xs text-muted-foreground mt-1">Contact us for exact address</p>
          </div>

          {/* Hours Card */}
          <div className="bg-background rounded-xl p-5 shadow-soft">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3 bg-jade/10">
              <Clock className="w-5 h-5 text-jade" />
            </div>
            <h3 className="font-display text-lg font-semibold text-foreground mb-2">
              Business Hours
            </h3>
            {businessHours.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="font-body text-muted-foreground">{item.day}</span>
                <span className="font-body text-foreground font-medium">{item.hours}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Map and Form Section */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Google Map */}
          <div className="bg-background rounded-2xl overflow-hidden shadow-elevated">
            <div className="p-4 border-b border-border">
              <h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-jade" />
                Find Us
              </h3>
            </div>
            <div className="aspect-video w-full bg-muted flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="w-12 h-12 text-jade mx-auto mb-4" />
                <p className="font-body text-muted-foreground mb-2">Clinic Location</p>
                <p className="font-display text-lg font-semibold text-foreground">{clinicAddress}</p>
                <p className="font-body text-sm text-muted-foreground mt-2">
                  Contact us via WhatsApp for exact directions
                </p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-jade text-white rounded-lg text-sm font-medium hover:bg-jade/90 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-background rounded-2xl p-8 shadow-elevated">
            <h3 className="font-display text-2xl font-semibold text-foreground mb-6">
              Send Us a Message
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block font-body text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-jade/50 transition-all"
                  placeholder="Your name"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className="block font-body text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-jade/50 transition-all"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block font-body text-sm font-medium text-foreground mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-muted border border-border rounded-lg font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-jade/50 transition-all"
                    placeholder="054-XXX-XXXX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block font-body text-sm font-medium text-foreground mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-lg font-body text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-jade/50 transition-all resize-none"
                  placeholder="Tell us about your health concerns..."
                />
              </div>

              <Button type="submit" variant="jade" size="lg" className="w-full">
                <Send className="w-5 h-5" />
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;