import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Patient {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  date_of_birth: string | null;
  age_group: string | null;
  gender: string | null;
}

export function usePatients() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['patients', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('patients')
        .select('id, full_name, phone, email, date_of_birth, age_group, gender')
        .eq('therapist_id', user.id)
        .order('full_name');

      if (error) throw error;
      return data as Patient[];
    },
    enabled: !!user?.id,
  });
}
