import { AlertTriangle } from "lucide-react";

export const Disclaimer = () => {
  return (
    <div className="bg-muted/50 border-t border-border py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-start gap-3 text-xs text-muted-foreground">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="leading-relaxed">
            <strong>Disclaimer:</strong> This practice offers Traditional Chinese Medicine (TCM) and complementary/alternative therapies only. 
            These services are not a substitute for conventional medical diagnosis, treatment, or advice from a licensed physician. 
            TCM and acupuncture are alternative wellness modalities and are not regulated as medical care. 
            Always consult with a qualified healthcare provider for medical conditions. 
            By using our services, you acknowledge that this is a complementary wellness practice.
          </p>
        </div>
      </div>
    </div>
  );
};
