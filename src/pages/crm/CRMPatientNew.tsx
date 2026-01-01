import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { PatientIntakeForm } from '@/components/crm/PatientIntakeForm';
import { ArrowLeft, Calendar, Video, FlaskConical } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function CRMPatientNew() {
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const isFromVideoSession = returnTo === '/video-session';
  const initialTestMode = searchParams.get('testMode') === 'true';
  const [testMode, setTestMode] = useState(initialTestMode);

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isFromVideoSession ? (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/video-session">
                    <Video className="h-4 w-4 mr-1" />
                    Back to Session
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/crm/calendar">
                      <Calendar className="h-4 w-4 mr-1" />
                      Calendar
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/crm/patients">
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Patients
                    </Link>
                  </Button>
                </>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-display font-semibold">
                {isFromVideoSession ? 'הוספת מטופל חדש / New Patient' : 'New Patient Intake'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isFromVideoSession 
                  ? 'Complete intake and return to session' 
                  : 'Complete the intake form for a new patient'}
              </p>
            </div>
          </div>

          {/* Test Mode Toggle */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/50">
            <FlaskConical className="h-4 w-4 text-amber-600" />
            <Label htmlFor="test-mode" className="text-sm font-medium cursor-pointer">
              Test Mode
            </Label>
            <Switch
              id="test-mode"
              checked={testMode}
              onCheckedChange={setTestMode}
            />
          </div>
        </div>

        {/* Form */}
        <PatientIntakeForm returnTo={returnTo || undefined} testMode={testMode} />
      </div>
    </CRMLayout>
  );
}
