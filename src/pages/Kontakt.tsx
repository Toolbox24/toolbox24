import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, MapPin } from 'lucide-react';

const Kontakt = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In einer echten Anwendung würden hier die Daten an einen Server gesendet
    toast({
      title: "Nachricht gesendet",
      description: "Vielen Dank für Ihre Nachricht. Wir melden uns bald bei Ihnen.",
    });

    // Formular zurücksetzen
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="page-header">
          <h1 className="page-title">Kontakt</h1>
          <p className="page-description">
            Haben Sie Fragen oder Anregungen? Wir freuen uns auf Ihre Nachricht!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Kontaktinformationen */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Kontaktinformationen</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">E-Mail</h3>
                  <p className="text-muted-foreground">info@toolbox24.ch</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Telefon</h3>
                  <p className="text-muted-foreground">+49 (0) XXX XXXXXXX</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Adresse</h3>
                  <p className="text-muted-foreground">
                    [Ihre Adresse]<br/>
                    [PLZ und Ort]<br/>
                    Deutschland
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 p-6 bg-muted/30 rounded-lg">
              <h3 className="font-medium mb-3">Häufige Fragen</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Technische Probleme mit den Tools</li>
                <li>• Funktionsanfragen und Verbesserungsvorschläge</li>
                <li>• Rechtliche Fragen zu Vorlagen</li>
                <li>• Allgemeine Fragen zu Toolbox24</li>
              </ul>
            </div>
          </div>

          {/* Kontaktformular */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Nachricht senden</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Name *
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ihr vollständiger Name"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    E-Mail *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ihre@email.de"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                  Betreff *
                </label>
                <Input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Worum geht es?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                  Nachricht *
                </label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Ihre Nachricht an uns..."
                  rows={6}
                />
              </div>

              <Button type="submit" size="lg" className="w-full">
                Nachricht senden
              </Button>
              
              <p className="text-xs text-muted-foreground">
                * Pflichtfelder. Ihre Daten werden vertraulich behandelt und nicht an Dritte weitergegeben.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kontakt;