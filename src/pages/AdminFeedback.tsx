import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Star, 
  Trash2, 
  Search, 
  Filter,
  ArrowUpDown,
  MessageSquare,
  Calendar,
  User,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Feedback {
  id: string;
  page_url: string;
  page_name: string | null;
  feedback_text: string;
  visitor_name: string | null;
  visitor_email: string | null;
  rating: number | null;
  created_at: string;
}

type SortField = 'created_at' | 'rating' | 'page_url';
type SortOrder = 'asc' | 'desc';

const AdminFeedback = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!isAdmin) {
      toast.error('Access denied. Admin only.');
      navigate('/');
      return;
    }
    fetchFeedback();
  }, [user, isAdmin, navigate]);

  const fetchFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('page_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFeedback(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('page_feedback')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setFeedback(prev => prev.filter(f => f.id !== id));
      toast.success('Feedback deleted');
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast.error('Failed to delete feedback');
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Filter and sort feedback
  const filteredFeedback = feedback
    .filter(f => {
      const matchesSearch = 
        f.feedback_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.visitor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (f.visitor_email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        f.page_url.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesRating = ratingFilter === 'all' || 
        (ratingFilter === 'none' && !f.rating) ||
        f.rating?.toString() === ratingFilter;

      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'created_at') {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      } else if (sortField === 'rating') {
        comparison = (a.rating || 0) - (b.rating || 0);
      } else if (sortField === 'page_url') {
        comparison = a.page_url.localeCompare(b.page_url);
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const renderStars = (rating: number | null) => {
    if (!rating) return <span className="text-muted-foreground text-sm">No rating</span>;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={cn(
              "w-4 h-4",
              star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
    );
  };

  const stats = {
    total: feedback.length,
    withRating: feedback.filter(f => f.rating).length,
    avgRating: feedback.filter(f => f.rating).length > 0
      ? (feedback.filter(f => f.rating).reduce((sum, f) => sum + (f.rating || 0), 0) / 
         feedback.filter(f => f.rating).length).toFixed(1)
      : 'N/A',
    uniquePages: new Set(feedback.map(f => f.page_url)).size
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Feedback Management | Admin</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/admin')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground">
                  Feedback Management
                </h1>
                <p className="text-sm text-muted-foreground">
                  View and manage visitor feedback
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs text-muted-foreground">Total Feedback</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Star className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.avgRating}</p>
                    <p className="text-xs text-muted-foreground">Avg Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <User className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.withRating}</p>
                    <p className="text-xs text-muted-foreground">With Ratings</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Globe className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.uniquePages}</p>
                    <p className="text-xs text-muted-foreground">Unique Pages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search feedback, name, email, or page..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={ratingFilter} onValueChange={setRatingFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="none">No Rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Feedback ({filteredFeedback.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredFeedback.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No feedback found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead 
                          className="cursor-pointer hover:text-foreground"
                          onClick={() => toggleSort('created_at')}
                        >
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Date
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="cursor-pointer hover:text-foreground"
                          onClick={() => toggleSort('page_url')}
                        >
                          <div className="flex items-center gap-1">
                            <Globe className="w-4 h-4" />
                            Page
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead>Feedback</TableHead>
                        <TableHead>Visitor</TableHead>
                        <TableHead 
                          className="cursor-pointer hover:text-foreground"
                          onClick={() => toggleSort('rating')}
                        >
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            Rating
                            <ArrowUpDown className="w-3 h-3" />
                          </div>
                        </TableHead>
                        <TableHead className="w-16">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredFeedback.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="whitespace-nowrap">
                            {format(new Date(item.created_at), 'MMM d, yyyy')}
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(item.created_at), 'HH:mm')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-mono text-xs">
                              {item.page_url}
                            </Badge>
                            {item.page_name && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.page_name}
                              </p>
                            )}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <p className="line-clamp-3 text-sm">
                              {item.feedback_text}
                            </p>
                          </TableCell>
                          <TableCell>
                            {item.visitor_name && (
                              <p className="font-medium text-sm">{item.visitor_name}</p>
                            )}
                            {item.visitor_email && (
                              <a 
                                href={`mailto:${item.visitor_email}`}
                                className="text-xs text-primary hover:underline"
                              >
                                {item.visitor_email}
                              </a>
                            )}
                            {!item.visitor_name && !item.visitor_email && (
                              <span className="text-muted-foreground text-sm">Anonymous</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {renderStars(item.rating)}
                          </TableCell>
                          <TableCell>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Feedback?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete this feedback.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(item.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default AdminFeedback;
