import { useParams } from 'react-router-dom';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { PatientIntakeForm } from '@/components/crm/PatientIntakeForm';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CRMPatientEdit() {
  const { id } = useParams<{ id: string }>();

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to={`/crm/patients/${id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-display font-semibold">Edit Patient</h1>
            <p className="text-sm text-muted-foreground">
              Update patient information
            </p>
          </div>
        </div>

        {/* Form */}
        <PatientIntakeForm patientId={id} />
      </div>
    </CRMLayout>
  );
}
