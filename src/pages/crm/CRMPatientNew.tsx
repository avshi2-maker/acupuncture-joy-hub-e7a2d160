import { CRMLayout } from '@/components/crm/CRMLayout';
import { PatientIntakeForm } from '@/components/crm/PatientIntakeForm';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CRMPatientNew() {
  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/crm/patients">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-display font-semibold">New Patient Intake</h1>
            <p className="text-sm text-muted-foreground">
              Complete the intake form for a new patient
            </p>
          </div>
        </div>

        {/* Form */}
        <PatientIntakeForm />
      </div>
    </CRMLayout>
  );
}
