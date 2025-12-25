import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, Clock, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { WhatsAppReminderButton } from '@/components/crm/WhatsAppReminderButton';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { CRMLayout } from '@/components/crm/CRMLayout';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  upcomingAppointments: number;
  weeklyVisits: number;
}

export default function CRMDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    weeklyVisits: 0,
  });
  const [todayAppts, setTodayAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
    const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    try {
      // Get patient count
      const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      // Get today's appointments
      const { data: todayData, count: todayCount } = await supabase
        .from('appointments')
        .select('*, patients(full_name, phone)', { count: 'exact' })
        .gte('start_time', startOfDay)
        .lte('start_time', endOfDay)
        .order('start_time', { ascending: true });

      // Get upcoming appointments
      const { count: upcomingCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('start_time', new Date().toISOString())
        .eq('status', 'scheduled');

      // Get weekly visits
      const { count: weeklyCount } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .gte('visit_date', weekAgo);

      setStats({
        totalPatients: patientCount || 0,
        todayAppointments: todayCount || 0,
        upcomingAppointments: upcomingCount || 0,
        weeklyVisits: weeklyCount || 0,
      });
      setTodayAppts(todayData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { title: "Today's Appointments", value: stats.todayAppointments, icon: Calendar, color: 'text-jade', bg: 'bg-jade/10' },
    { title: 'Upcoming', value: stats.upcomingAppointments, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { title: 'Weekly Visits', value: stats.weeklyVisits, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  ];

  return (
    <CRMLayout>
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-display font-semibold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back! Here's your clinic overview for {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1 sm:flex-none">
              <Link to="/crm/patients/new">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">New</span> Patient
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-jade hover:bg-jade/90 flex-1 sm:flex-none">
              <Link to="/crm/calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {statCards.map((stat) => (
            <Card key={stat.title} className="border-border/50">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs md:text-sm text-muted-foreground truncate">{stat.title}</p>
                    <p className="text-2xl md:text-3xl font-semibold mt-1">
                      {loading ? '—' : stat.value}
                    </p>
                  </div>
                  <div className={`p-2 md:p-3 rounded-xl ${stat.bg} shrink-0`}>
                    <stat.icon className={`h-4 w-4 md:h-6 md:w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Today's Schedule & Quick Actions */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          <Card className="border-border/50">
            <CardHeader className="pb-3 px-4 md:px-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base md:text-lg">Today's Schedule</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/crm/calendar" className="text-xs md:text-sm">
                    View all <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-muted/50 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : todayAppts.length === 0 ? (
                <div className="text-center py-6 md:py-8 text-muted-foreground">
                  <Calendar className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No appointments scheduled for today</p>
                  <Button variant="link" asChild className="mt-2 text-sm">
                    <Link to="/crm/calendar">Schedule an appointment</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppts.slice(0, 5).map((appt) => (
                    <div
                      key={appt.id}
                      className="flex items-center gap-3 md:gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-1 h-10 md:h-12 rounded-full bg-jade shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm md:text-base truncate">
                          {appt.patients?.full_name || appt.title}
                        </p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                          {format(new Date(appt.start_time), 'h:mm a')} -{' '}
                          {format(new Date(appt.end_time), 'h:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <WhatsAppReminderButton
                          patientName={appt.patients?.full_name || 'Patient'}
                          patientPhone={appt.patients?.phone}
                          appointmentId={appt.id}
                          appointmentDate={appt.start_time}
                          appointmentTime={format(new Date(appt.start_time), 'HH:mm')}
                        />
                        <span
                          className={`px-2 py-1 text-xs rounded-full hidden sm:inline-block ${
                            appt.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : appt.status === 'confirmed'
                              ? 'bg-jade/20 text-jade border border-jade/30'
                              : appt.status === 'cancelled'
                              ? 'bg-red-500/10 text-red-500'
                              : 'bg-blue-500/10 text-blue-500'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-border/50">
            <CardHeader className="pb-3 px-4 md:px-6">
              <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <div className="grid grid-cols-2 gap-2 md:gap-3">
                <Button variant="outline" className="h-16 md:h-20 flex-col gap-1 md:gap-2 text-xs md:text-sm" asChild>
                  <Link to="/crm/patients/new">
                    <Users className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Add Patient</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-16 md:h-20 flex-col gap-1 md:gap-2 text-xs md:text-sm" asChild>
                  <Link to="/crm/calendar">
                    <Calendar className="h-4 w-4 md:h-5 md:w-5" />
                    <span>New Appointment</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-16 md:h-20 flex-col gap-1 md:gap-2 text-xs md:text-sm" asChild>
                  <Link to="/crm/rooms">
                    <Clock className="h-4 w-4 md:h-5 md:w-5" />
                    <span>Manage Rooms</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-16 md:h-20 flex-col gap-1 md:gap-2 text-xs md:text-sm" asChild>
                  <Link to="/tcm-brain">
                    <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                    <span>TCM Brain</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CRMLayout>
  );
}