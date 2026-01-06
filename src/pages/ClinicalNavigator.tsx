import { ClinicalNavigatorAdvanced } from '@/components/clinical-navigator/ClinicalNavigatorAdvanced';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function ClinicalNavigator() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-background">
        <ClinicalNavigatorAdvanced />
      </div>
    </LanguageProvider>
  );
}
