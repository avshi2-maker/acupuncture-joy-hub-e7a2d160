import { useState } from 'react';
import { MessageSquarePlus, X, Send, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FeedbackWidgetProps {
  pageName?: string;
}

export const FeedbackWidget = ({ pageName }: FeedbackWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedback.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('page_feedback').insert({
        page_url: window.location.pathname,
        page_name: pageName || document.title,
        feedback_text: feedback.trim(),
        visitor_name: name.trim() || null,
        visitor_email: email.trim() || null,
        rating: rating || null,
      });

      if (error) throw error;

      toast.success('Thank you for your feedback!');
      setIsOpen(false);
      setFeedback('');
      setName('');
      setEmail('');
      setRating(0);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full",
          "bg-primary text-primary-foreground shadow-lg",
          "hover:bg-primary/90 transition-all duration-300",
          "hover:scale-105 hover:shadow-xl",
          isOpen && "hidden"
        )}
        aria-label="Leave feedback"
      >
        <MessageSquarePlus className="w-5 h-5" />
        <span className="font-medium text-sm">Feedback</span>
      </button>

      {/* Feedback Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-card border border-border rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-display font-semibold text-foreground">Leave Feedback</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close feedback panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Star Rating */}
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground mr-2">Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      "w-5 h-5 transition-colors",
                      (hoverRating || rating) >= star
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/40"
                    )}
                  />
                </button>
              ))}
            </div>

            {/* Feedback Text */}
            <Textarea
              placeholder="Share your thoughts about this page..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[100px] resize-none"
              required
            />

            {/* Optional Name */}
            <Input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {/* Optional Email */}
            <Input
              type="email"
              placeholder="Your email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !feedback.trim()}
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Feedback
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Page: {pageName || window.location.pathname}
            </p>
          </form>
        </div>
      )}
    </>
  );
};
