import { useState } from "react";
import { CRMLayout } from "@/components/crm/CRMLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Plus, MapPin, Phone, Mail, Settings, User, Image, ParkingCircle, Map, ExternalLink, Bell, MessageSquare } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function CRMClinics() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClinic, setEditingClinic] = useState<any>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newClinic, setNewClinic] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    booking_contact_name: '',
    booking_contact_phone: '',
  });
  const [landingSettings, setLandingSettings] = useState({
    landing_page_bg_url: '',
    parking_instructions: '',
    map_embed_url: '',
  });
  const [reminderSettings, setReminderSettings] = useState({
    reminder_enabled: false,
    reminder_timing: ['24h'] as string[],
    reminder_channel: 'whatsapp',
  });

  const { data: clinics, isLoading } = useQuery({
    queryKey: ['clinics', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const createClinicMutation = useMutation({
    mutationFn: async (clinicData: typeof newClinic) => {
      const { data, error } = await supabase
        .from('clinics')
        .insert({
          ...clinicData,
          owner_id: user!.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      setIsDialogOpen(false);
      setNewClinic({ name: '', address: '', phone: '', email: '', booking_contact_name: '', booking_contact_phone: '' });
      toast.success('Clinic created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create clinic: ' + error.message);
    },
  });

  const updateLandingMutation = useMutation({
    mutationFn: async ({ clinicId, settings, reminders }: { clinicId: string; settings: typeof landingSettings; reminders: typeof reminderSettings }) => {
      const { data, error } = await supabase
        .from('clinics')
        .update({
          landing_page_bg_url: settings.landing_page_bg_url || null,
          parking_instructions: settings.parking_instructions || null,
          map_embed_url: settings.map_embed_url || null,
          reminder_enabled: reminders.reminder_enabled,
          reminder_timing: reminders.reminder_timing,
          reminder_channel: reminders.reminder_channel,
        })
        .eq('id', clinicId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clinics'] });
      setIsSettingsOpen(false);
      setEditingClinic(null);
      toast.success('Clinic settings updated');
    },
    onError: (error) => {
      toast.error('Failed to update settings: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClinic.name.trim()) {
      toast.error('Clinic name is required');
      return;
    }
    createClinicMutation.mutate(newClinic);
  };

  const openLandingSettings = (clinic: any) => {
    setEditingClinic(clinic);
    setLandingSettings({
      landing_page_bg_url: clinic.landing_page_bg_url || '',
      parking_instructions: clinic.parking_instructions || '',
      map_embed_url: clinic.map_embed_url || '',
    });
    setReminderSettings({
      reminder_enabled: clinic.reminder_enabled || false,
      reminder_timing: clinic.reminder_timing || ['24h'],
      reminder_channel: clinic.reminder_channel || 'whatsapp',
    });
    setIsSettingsOpen(true);
  };

  const toggleReminderTiming = (timing: string) => {
    setReminderSettings(prev => ({
      ...prev,
      reminder_timing: prev.reminder_timing.includes(timing)
        ? prev.reminder_timing.filter(t => t !== timing)
        : [...prev.reminder_timing, timing]
    }));
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClinic) {
      updateLandingMutation.mutate({ clinicId: editingClinic.id, settings: landingSettings, reminders: reminderSettings });
    }
  };

  return (
    <CRMLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6 text-jade" />
              Clinics
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your clinic locations and settings
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Clinic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Clinic</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Clinic Name *</Label>
                  <Input
                    id="name"
                    value={newClinic.name}
                    onChange={(e) => setNewClinic({ ...newClinic, name: e.target.value })}
                    placeholder="Enter clinic name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newClinic.address}
                    onChange={(e) => setNewClinic({ ...newClinic, address: e.target.value })}
                    placeholder="Enter clinic address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newClinic.phone}
                    onChange={(e) => setNewClinic({ ...newClinic, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClinic.email}
                    onChange={(e) => setNewClinic({ ...newClinic, email: e.target.value })}
                    placeholder="Enter email address"
                  />
                </div>
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium text-foreground mb-3">Booking Contact</p>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="booking_contact_name">Contact Name</Label>
                      <Input
                        id="booking_contact_name"
                        value={newClinic.booking_contact_name}
                        onChange={(e) => setNewClinic({ ...newClinic, booking_contact_name: e.target.value })}
                        placeholder="Main contact for bookings"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="booking_contact_phone">Contact Phone</Label>
                      <Input
                        id="booking_contact_phone"
                        value={newClinic.booking_contact_phone}
                        onChange={(e) => setNewClinic({ ...newClinic, booking_contact_phone: e.target.value })}
                        placeholder="Booking contact phone"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createClinicMutation.isPending}>
                    {createClinicMutation.isPending ? 'Creating...' : 'Create Clinic'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-48" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : clinics && clinics.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clinics.map((clinic: any) => (
              <Card key={clinic.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{clinic.name}</CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => openLandingSettings(clinic)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {clinic.address && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {clinic.address}
                    </div>
                  )}
                  {clinic.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {clinic.phone}
                    </div>
                  )}
                  {clinic.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {clinic.email}
                    </div>
                  )}
                  {(clinic.booking_contact_name || clinic.booking_contact_phone) && (
                    <div className="border-t pt-2 mt-2">
                      <p className="text-xs font-medium text-foreground mb-1">Booking Contact</p>
                      {clinic.booking_contact_name && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          {clinic.booking_contact_name}
                        </div>
                      )}
                      {clinic.booking_contact_phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {clinic.booking_contact_phone}
                        </div>
                      )}
                    </div>
                  )}
                  {(clinic.landing_page_bg_url || clinic.parking_instructions) && (
                    <div className="border-t pt-2 mt-2">
                      <p className="text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        Landing Page Configured
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Clinics Yet
              </h3>
              <p className="text-muted-foreground mb-4">
                Create your first clinic to start managing locations and staff.
              </p>
              <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Create First Clinic
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Landing Page Settings Dialog */}
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {editingClinic?.name} - Landing Page Settings
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="landing_bg" className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Background Image URL
                </Label>
                <Input
                  id="landing_bg"
                  value={landingSettings.landing_page_bg_url}
                  onChange={(e) => setLandingSettings({ ...landingSettings, landing_page_bg_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-muted-foreground">Custom background for appointment confirmation page</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="parking" className="flex items-center gap-2">
                  <ParkingCircle className="h-4 w-4" />
                  Parking Instructions
                </Label>
                <Textarea
                  id="parking"
                  value={landingSettings.parking_instructions}
                  onChange={(e) => setLandingSettings({ ...landingSettings, parking_instructions: e.target.value })}
                  placeholder="Free parking available behind building..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="map_embed" className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Google Maps Embed URL
                </Label>
                <Input
                  id="map_embed"
                  value={landingSettings.map_embed_url}
                  onChange={(e) => setLandingSettings({ ...landingSettings, map_embed_url: e.target.value })}
                  placeholder="https://www.google.com/maps/embed?..."
                />
                <p className="text-xs text-muted-foreground">
                  Get embed URL from Google Maps → Share → Embed a map
                </p>
              </div>

              {/* Patient Reminder Settings */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-primary" />
                    <Label htmlFor="reminder_enabled" className="font-medium">Patient Reminders</Label>
                  </div>
                  <Switch
                    id="reminder_enabled"
                    checked={reminderSettings.reminder_enabled}
                    onCheckedChange={(checked) => setReminderSettings({ ...reminderSettings, reminder_enabled: checked })}
                  />
                </div>

                {reminderSettings.reminder_enabled && (
                  <div className="space-y-4 pl-6">
                    <div className="space-y-2">
                      <Label className="text-sm">Reminder Timing</Label>
                      <div className="flex flex-wrap gap-3">
                        {['24h', '2h', '1h'].map((timing) => (
                          <div key={timing} className="flex items-center gap-2">
                            <Checkbox
                              id={`timing-${timing}`}
                              checked={reminderSettings.reminder_timing.includes(timing)}
                              onCheckedChange={() => toggleReminderTiming(timing)}
                            />
                            <Label htmlFor={`timing-${timing}`} className="text-sm font-normal cursor-pointer">
                              {timing === '24h' ? '24 hours before' : timing === '2h' ? '2 hours before' : '1 hour before'}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Notification Channel
                      </Label>
                      <div className="flex gap-4">
                        {[
                          { value: 'whatsapp', label: 'WhatsApp' },
                          { value: 'sms', label: 'SMS' },
                          { value: 'both', label: 'Both' },
                        ].map((channel) => (
                          <div key={channel.value} className="flex items-center gap-2">
                            <input
                              type="radio"
                              id={`channel-${channel.value}`}
                              name="reminder_channel"
                              value={channel.value}
                              checked={reminderSettings.reminder_channel === channel.value}
                              onChange={(e) => setReminderSettings({ ...reminderSettings, reminder_channel: e.target.value })}
                              className="h-4 w-4 text-primary"
                            />
                            <Label htmlFor={`channel-${channel.value}`} className="text-sm font-normal cursor-pointer">
                              {channel.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsSettingsOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateLandingMutation.isPending}>
                  {updateLandingMutation.isPending ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </CRMLayout>
  );
}
