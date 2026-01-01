import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { PatientIntakeForm } from '@/components/crm/PatientIntakeForm';
import { ArrowLeft, Calendar, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function CRMPatientEdit() {
  const { id } = useParams<{ id: string }>();
  const [testMode, setTestMode] = useState(false);

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/crm/calendar">
                  <Calendar className="h-4 w-4 mr-1" />
                  Calendar
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/crm/patients/${id}`}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
              </Button>
            </div>
            <div>
              <h1 className="text-2xl font-display font-semibold">Edit Patient</h1>
              <p className="text-sm text-muted-foreground">
                Update patient information
              </p>
            </div>
          </div>

          {/* Test Mode Toggle */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/50">
            <FlaskConical className="h-4 w-4 text-amber-600" />
            <Label htmlFor="test-mode-edit" className="text-sm font-medium cursor-pointer">
              Test Mode
            </Label>
            <Switch
              id="test-mode-edit"
              checked={testMode}
              onCheckedChange={setTestMode}
            />
          </div>
        </div>

        {/* Form */}
        <PatientIntakeForm patientId={id} testMode={testMode} />
      </div>
    </CRMLayout>
  );
}
