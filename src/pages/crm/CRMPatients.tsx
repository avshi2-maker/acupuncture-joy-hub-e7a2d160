import { useEffect, useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { format, differenceInYears } from 'date-fns';
import { Link } from 'react-router-dom';
import { Plus, Search, User, Phone, Mail, Calendar, FileText } from 'lucide-react';

interface Patient {
  id: string;
  full_name: string;
  id_number: string | null;
  email: string | null;
  phone: string | null;
  date_of_birth: string | null;
  gender: string | null;
  is_pregnant: boolean | null;
  consent_signed: boolean | null;
  created_at: string;
}

function calculateAge(dob: string | null): number | null {
  if (!dob) return null;
  return differenceInYears(new Date(), new Date(dob));
}

function getAgeGroup(age: number | null): string {
  if (age === null) return 'Unknown';
  if (age < 13) return 'Child';
  if (age < 20) return 'Teen';
  if (age < 65) return 'Adult';
  return 'Senior';
}

export default function CRMPatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, id_number, email, phone, date_of_birth, gender, is_pregnant, consent_signed, created_at')
        .order('full_name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((p) =>
    p.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone?.includes(searchQuery)
  );

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-display font-semibold">Patients</h1>
            <p className="text-sm text-muted-foreground">
              Manage patient records and intake forms
            </p>
          </div>
          <Button asChild className="bg-jade hover:bg-jade/90">
            <Link to="/crm/patients/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Link>
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search patients by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Patient List */}
        <Card className="border-border/50">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading patients...</div>
            ) : filteredPatients.length === 0 ? (
              <div className="p-8 text-center">
                <User className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No patients found matching your search' : 'No patients yet'}
                </p>
                <Button asChild variant="link" className="mt-2">
                  <Link to="/crm/patients/new">Add your first patient</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Age Group</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => {
                    const age = calculateAge(patient.date_of_birth);
                    const ageGroup = getAgeGroup(age);
                    return (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-jade/10 flex items-center justify-center">
                              <User className="h-5 w-5 text-jade" />
                            </div>
                            <div>
                              <p className="font-medium">{patient.full_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {patient.id_number && <span className="font-mono">{patient.id_number} • </span>}
                                {patient.gender || 'Not specified'}
                                {age !== null ? ` • ${age} years` : ''}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {patient.phone && (
                              <div className="flex items-center gap-1 text-sm">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {patient.phone}
                              </div>
                            )}
                            {patient.email && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {patient.email}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              ageGroup === 'Child'
                                ? 'border-blue-500/30 bg-blue-500/10 text-blue-500'
                                : ageGroup === 'Teen'
                                ? 'border-purple-500/30 bg-purple-500/10 text-purple-500'
                                : ageGroup === 'Senior'
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                                : 'border-jade/30 bg-jade/10 text-jade'
                            }
                          >
                            {ageGroup}
                          </Badge>
                          {patient.is_pregnant && (
                            <Badge
                              variant="outline"
                              className="ml-1 border-pink-500/30 bg-pink-500/10 text-pink-500"
                            >
                              Pregnant
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {patient.consent_signed ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Consent signed
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-orange-500/30 bg-orange-500/10 text-orange-500">
                              Pending consent
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(patient.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/crm/patients/${patient.id}`}>View</Link>
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/crm/patients/${patient.id}/edit`}>Edit</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}
