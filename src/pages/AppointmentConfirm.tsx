import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Loader2, Calendar, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export default function AppointmentConfirm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const responseParam = searchParams.get('response');
  
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    response?: string;
    previousResponse?: string;
    appointment?: {
      title: string;
      start_time: string;
      patients?: { full_name: string };
    };
  } | null>(null);

  useEffect(() => {
    if (token && responseParam) {
      confirmAppointment();
    } else if (token) {
      // Show confirmation options
      fetchAppointmentDetails();
    } else {
      setLoading(false);
      setResult({ error: 'קישור לא תקין' });
    }
  }, [token, responseParam]);

  const fetchAppointmentDetails = async () => {
    try {
      // Use edge function to fetch details securely (bypasses RLS with service role)
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/appointment-confirm?token=${token}&action=details`;
      
      const res = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();

      if (data.error) {
        setResult({ error: data.error });
      } else if (data.previousResponse) {
        setResult({ 
          previousResponse: data.previousResponse,
          appointment: data.appointment
        });
      } else {
        setResult({ appointment: data.appointment });
      }
    } catch (err) {
      setResult({ error: 'שגיאה בטעינת הפרטים' });
    } finally {
      setLoading(false);
    }
  };

  const confirmAppointment = async () => {
    try {
      const response = await supabase.functions.invoke('appointment-confirm', {
        body: {},
        headers: {},
      });
      
      // The function uses query params, so we need to call it directly
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/appointment-confirm?token=${token}&response=${responseParam}`;
      
      const res = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message || 'שגיאה באישור התור' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = (response: 'confirmed' | 'cancelled') => {
    setLoading(true);
    window.location.href = `${window.location.pathname}?token=${token}&response=${response}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-jade/5 to-background flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-jade mb-4" />
            <p className="text-muted-foreground">טוען...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (result?.error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-background flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h1 className="text-xl font-semibold mb-2">שגיאה</h1>
            <p className="text-muted-foreground">{result.error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already responded
  if (result?.previousResponse) {
    const isConfirmed = result.previousResponse === 'confirmed';
    return (
      <div className="min-h-screen bg-gradient-to-b from-jade/5 to-background flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className={`w-16 h-16 ${isConfirmed ? 'bg-jade/20' : 'bg-red-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {isConfirmed ? (
                <CheckCircle className="h-8 w-8 text-jade" />
              ) : (
                <XCircle className="h-8 w-8 text-red-500" />
              )}
            </div>
            <h1 className="text-xl font-semibold mb-2">
              {isConfirmed ? 'התור כבר אושר' : 'התור כבר בוטל'}
            </h1>
            {result.appointment && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg text-right">
                <p className="font-medium">{result.appointment.patients?.full_name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(result.appointment.start_time), 'EEEE, d בMMMM yyyy', { locale: he })}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {format(new Date(result.appointment.start_time), 'HH:mm')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (result?.success) {
    const isConfirmed = result.response === 'confirmed';
    return (
      <div className="min-h-screen bg-gradient-to-b from-jade/5 to-background flex items-center justify-center p-4" dir="rtl">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className={`w-16 h-16 ${isConfirmed ? 'bg-jade/20' : 'bg-orange-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              {isConfirmed ? (
                <CheckCircle className="h-8 w-8 text-jade" />
              ) : (
                <XCircle className="h-8 w-8 text-orange-500" />
              )}
            </div>
            <h1 className="text-xl font-semibold mb-2">
              {isConfirmed ? 'התור אושר!' : 'התור בוטל'}
            </h1>
            <p className="text-muted-foreground">{result.message}</p>
            {result.appointment && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg text-right">
                <p className="font-medium">{result.appointment.patients?.full_name}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(result.appointment.start_time), 'EEEE, d בMMMM yyyy', { locale: he })}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {format(new Date(result.appointment.start_time), 'HH:mm')}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show confirmation options
  return (
    <div className="min-h-screen bg-gradient-to-b from-jade/5 to-background flex items-center justify-center p-4" dir="rtl">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-jade/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-jade" />
            </div>
            <h1 className="text-xl font-semibold mb-2">אישור תור</h1>
            <p className="text-muted-foreground">האם את/ה מגיע/ה לתור?</p>
          </div>

          {result?.appointment && (
            <div className="mb-6 p-4 bg-muted/50 rounded-lg text-right">
              <p className="font-medium">{result.appointment.patients?.full_name}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(result.appointment.start_time), 'EEEE, d בMMMM yyyy', { locale: he })}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {format(new Date(result.appointment.start_time), 'HH:mm')}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => handleConfirm('confirmed')}
              className="bg-jade hover:bg-jade/90 h-16 text-lg"
            >
              <CheckCircle className="h-5 w-5 ml-2" />
              כן, אני מגיע/ה
            </Button>
            <Button
              onClick={() => handleConfirm('cancelled')}
              variant="outline"
              className="h-16 text-lg border-red-200 text-red-600 hover:bg-red-50"
            >
              <XCircle className="h-5 w-5 ml-2" />
              לא, לבטל
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
