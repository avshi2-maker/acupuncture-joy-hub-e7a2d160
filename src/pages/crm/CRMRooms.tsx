import { useEffect, useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, DoorOpen, Edit, Trash2, FileText, Settings2 } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  description: string | null;
  capacity: number;
  color: string;
  is_active: boolean;
  special_instructions: string | null;
}

interface Clinic {
  id: string;
  name: string;
  general_instructions: string | null;
}

const ROOM_COLORS = [
  '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16',
];

export default function CRMRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showGeneralInstructions, setShowGeneralInstructions] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [generalInstructions, setGeneralInstructions] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 1,
    color: '#10B981',
    special_instructions: '',
  });

  useEffect(() => {
    fetchRooms();
    fetchClinic();
  }, []);

  const fetchClinic = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('id, name, general_instructions')
        .limit(1)
        .single();
      
      if (!error && data) {
        setClinic(data);
        setGeneralInstructions(data.general_instructions || '');
      }
    } catch (error) {
      console.error('Error fetching clinic:', error);
    }
  };

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name');

      if (error) throw error;
      setRooms(data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneralInstructions = async () => {
    if (!clinic) return;
    try {
      const { error } = await supabase
        .from('clinics')
        .update({ general_instructions: generalInstructions })
        .eq('id', clinic.id);
      
      if (error) throw error;
      toast.success('General instructions saved');
      setShowGeneralInstructions(false);
    } catch (error) {
      console.error('Error saving instructions:', error);
      toast.error('Failed to save instructions');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error('Room name is required');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        capacity: formData.capacity,
        color: formData.color,
        special_instructions: formData.special_instructions || null,
        is_active: true,
      };

      if (editingRoom) {
        const { error } = await supabase
          .from('rooms')
          .update(payload)
          .eq('id', editingRoom.id);
        if (error) throw error;
        toast.success('Room updated');
      } else {
        // For now, we need a clinic_id - let's check if one exists or create a default
        const { data: clinics } = await supabase.from('clinics').select('id').limit(1);
        
        if (!clinics || clinics.length === 0) {
          // Create a default clinic
          const user = (await supabase.auth.getUser()).data.user;
          if (!user) {
            toast.error('Please log in first');
            return;
          }
          
          const { data: newClinic, error: clinicError } = await supabase
            .from('clinics')
            .insert({ name: 'My Clinic', owner_id: user.id })
            .select()
            .single();
          
          if (clinicError) throw clinicError;
          
          const { error } = await supabase
            .from('rooms')
            .insert({ ...payload, clinic_id: newClinic.id });
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('rooms')
            .insert({ ...payload, clinic_id: clinics[0].id });
          if (error) throw error;
        }
        toast.success('Room created');
      }

      setShowForm(false);
      setEditingRoom(null);
      setFormData({ name: '', description: '', capacity: 1, color: '#10B981', special_instructions: '' });
      fetchRooms();
    } catch (error) {
      console.error('Error saving room:', error);
      toast.error('Failed to save room');
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      name: room.name,
      description: room.description || '',
      capacity: room.capacity,
      color: room.color,
      special_instructions: room.special_instructions || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const { error } = await supabase.from('rooms').delete().eq('id', roomId);
      if (error) throw error;
      toast.success('Room deleted');
      fetchRooms();
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room');
    }
  };

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-display font-semibold">Treatment Rooms</h1>
            <p className="text-sm text-muted-foreground">
              Manage your clinic's treatment rooms for scheduling
            </p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showGeneralInstructions} onOpenChange={setShowGeneralInstructions}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Settings2 className="h-4 w-4" />
                  General Instructions
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>General Instructions</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-sm text-muted-foreground">
                    These instructions apply to all rooms and will be shown to staff.
                  </p>
                  <Textarea
                    value={generalInstructions}
                    onChange={(e) => setGeneralInstructions(e.target.value)}
                    placeholder="Enter general clinic instructions..."
                    rows={6}
                  />
                  <Button onClick={handleSaveGeneralInstructions} className="w-full bg-jade hover:bg-jade/90">
                    Save Instructions
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button
                className="bg-jade hover:bg-jade/90"
                onClick={() => {
                  setEditingRoom(null);
                  setFormData({ name: '', description: '', capacity: 1, color: '#10B981', special_instructions: '' });
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingRoom ? 'Edit Room' : 'New Room'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Room Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Treatment Room 1"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description..."
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    min={1}
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Calendar Color</Label>
                  <div className="flex gap-2 flex-wrap">
                    {ROOM_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          formData.color === color ? 'border-foreground scale-110' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Special Instructions</Label>
                  <Textarea
                    value={formData.special_instructions}
                    onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                    placeholder="Any special instructions for this room..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleSubmit} className="w-full bg-jade hover:bg-jade/90">
                  {editingRoom ? 'Update Room' : 'Create Room'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* General Instructions Card */}
        {clinic?.general_instructions && (
          <Card className="border-jade/30 bg-jade/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-jade mt-0.5" />
                <div>
                  <h3 className="font-medium text-sm text-foreground">General Instructions</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">
                    {clinic.general_instructions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Rooms Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted/50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="py-12 text-center">
              <DoorOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No rooms configured yet</p>
              <p className="text-sm text-muted-foreground">
                Add treatment rooms to enable room-based scheduling
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room) => (
              <Card key={room.id} className="border-border/50 overflow-hidden">
                <div className="h-2" style={{ backgroundColor: room.color }} />
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${room.color}20` }}
                      >
                        <DoorOpen className="h-5 w-5" style={{ color: room.color }} />
                      </div>
                      <div>
                        <h3 className="font-medium">{room.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Capacity: {room.capacity}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(room)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(room.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {room.description && (
                    <p className="text-sm text-muted-foreground mt-3">{room.description}</p>
                  )}
                  {room.special_instructions && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-jade mt-0.5 shrink-0" />
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {room.special_instructions}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CRMLayout>
  );
}
