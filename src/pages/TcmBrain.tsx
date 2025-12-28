import { useState, useRef, useEffect } from 'react';
import { BodyFigureSelector, parsePointReferences } from '@/components/acupuncture/BodyFigureSelector';
import { AIResponseDisplay } from '@/components/tcm/AIResponseDisplay';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTier } from '@/hooks/useTier';
import { TierBadge } from '@/components/layout/TierBadge';
import { ChatMessage, ChatTypingIndicator } from '@/components/chat/ChatMessage';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  Brain, 
  Send, 
  Loader2, 
  Leaf, 
  MapPin, 
  Stethoscope,
  ArrowRight,
  Sparkles,
  LogOut,
  Apple,
  Heart,
  Moon,
  Briefcase,
  Compass,
  Activity,
  Dumbbell,
  Star,
  Mic,
  MicOff,
  FileText,
  ClipboardList,
  Pill,
  Trash2,
  User,
  MessageCircle,
  History,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ElevenLabsWidget } from '@/components/ui/ElevenLabsWidget';
import {
  herbsQuestions,
  pointsQuestions,
  conditionsQuestions,
  nutritionQuestions,
  mentalQuestions,
  sleepQuestions,
  worklifeQuestions,
  baziQuestions,
  wellnessQuestions,
  sportsQuestions,
  astroQuestions
} from '@/data/tcmBrainQuestions';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tcm-chat`;

// Feature tabs configuration (excluding symptoms/diagnosis/treatment which are on main page)
const featureTabs = [
  { id: 'chat', icon: Sparkles, label: 'Ask AI' },
  { id: 'symptom-checker', icon: Stethoscope, label: 'AI Symptom Checker', isLink: true, href: '/symptom-checker' },
  { id: 'treatment-planner', icon: ClipboardList, label: 'AI Treatment Planner', isLink: true, href: '/treatment-planner' },
  { id: 'bodymap', icon: User, label: 'Body Map' },
  { id: 'herbs', icon: Leaf, label: 'Herbs' },
  { id: 'points', icon: MapPin, label: 'Points' },
  { id: 'conditions', icon: Stethoscope, label: 'Conditions' },
  { id: 'nutrition', icon: Apple, label: 'Nutrition' },
  { id: 'mental', icon: Heart, label: 'Mental' },
  { id: 'sleep', icon: Moon, label: 'Sleep' },
  { id: 'worklife', icon: Briefcase, label: 'Balance' },
  { id: 'bazi', icon: Compass, label: 'Bazi' },
  { id: 'wellness', icon: Activity, label: 'Wellness' },
  { id: 'sports', icon: Dumbbell, label: 'Sports' },
  { id: 'astro', icon: Star, label: 'Astrology' },
];

// Symptom Analysis Questions (50)
const symptomQuestions = [
  { id: 's1', question: 'Any allergies present?', category: 'Medical' },
  { id: 's2', question: 'Any anxiety or excessive worry?', category: 'Emotions' },
  { id: 's3', question: 'Any back pain present?', category: 'Body' },
  { id: 's4', question: 'Any bloating or swelling?', category: 'Body' },
  { id: 's5', question: 'Any chronic fatigue present?', category: 'Energy' },
  { id: 's6', question: 'Any cold extremities?', category: 'Heat/Cold' },
  { id: 's7', question: 'Any constipation or diarrhea?', category: 'Digestion' },
  { id: 's8', question: 'Any depression symptoms?', category: 'Emotions' },
  { id: 's9', question: 'Any difficulty falling asleep?', category: 'Sleep' },
  { id: 's10', question: 'Any discharge present? (women)', category: 'Women' },
  { id: 's11', question: 'Any dizziness or vertigo?', category: 'Head' },
  { id: 's12', question: 'Any excessive dreams?', category: 'Sleep' },
  { id: 's13', question: 'Any excessive sweating?', category: 'Heat/Cold' },
  { id: 's14', question: 'Any excessive thirst?', category: 'Digestion' },
  { id: 's15', question: 'Any feeling of cold?', category: 'Heat/Cold' },
  { id: 's16', question: 'Any fever or heat sensation?', category: 'Heat/Cold' },
  { id: 's17', question: 'Any headaches present?', category: 'Head' },
  { id: 's18', question: 'Any irritability present?', category: 'Emotions' },
  { id: 's19', question: 'Any joint pain?', category: 'Body' },
  { id: 's20', question: 'Any menstrual cycle issues? (women)', category: 'Women' },
  { id: 's21', question: 'Any menstrual pain? (women)', category: 'Women' },
  { id: 's22', question: 'Any nausea present?', category: 'Digestion' },
  { id: 's23', question: 'Any night wakings?', category: 'Sleep' },
  { id: 's24', question: 'Any pain during urination?', category: 'Urination' },
  { id: 's25', question: 'Any pain present? Where?', category: 'Pain' },
  { id: 's26', question: 'Any physical exercise routine?', category: 'Lifestyle' },
  { id: 's27', question: 'Any pre-existing conditions?', category: 'Medical' },
  { id: 's28', question: 'Any skin problems?', category: 'Body' },
  { id: 's29', question: 'Any tinnitus or ear ringing?', category: 'Head' },
  { id: 's30', question: 'Any vision problems?', category: 'Head' },
  { id: 's31', question: 'Current emotional state?', category: 'Emotions' },
  { id: 's32', question: 'Current medication use?', category: 'Medical' },
  { id: 's33', question: 'Current stress level?', category: 'Lifestyle' },
  { id: 's34', question: 'Eating habits and patterns?', category: 'Lifestyle' },
  { id: 's35', question: 'How is the appetite?', category: 'Digestion' },
  { id: 's36', question: 'Is the pain constant or intermittent?', category: 'Pain' },
  { id: 's37', question: 'Pain character? (sharp, dull, stabbing)', category: 'Pain' },
  { id: 's38', question: 'Pulse quality? (fast, slow, weak)', category: 'Diagnosis' },
  { id: 's39', question: 'Sleep quality assessment?', category: 'Sleep' },
  { id: 's40', question: 'Stool frequency and quality?', category: 'Digestion' },
  { id: 's41', question: 'Tongue condition? (color, coating)', category: 'Diagnosis' },
  { id: 's42', question: 'Urination frequency?', category: 'Urination' },
  { id: 's43', question: 'Urine color assessment?', category: 'Urination' },
  { id: 's44', question: 'What aggravates the pain?', category: 'Pain' },
  { id: 's45', question: 'What is the energy level?', category: 'Energy' },
  { id: 's46', question: 'What is the main symptom?', category: 'General' },
  { id: 's47', question: 'What relieves the pain?', category: 'Pain' },
  { id: 's48', question: 'What time of day is fatigue worse?', category: 'Energy' },
  { id: 's49', question: 'When did symptoms begin?', category: 'General' },
  { id: 's50', question: 'Where is the headache located?', category: 'Head' },
];

// Diagnosis Questions (26)
const diagnosisQuestions = [
  { id: 'd1', question: 'Any Blood deficiency present?', category: 'Qi/Blood' },
  { id: 'd2', question: 'Any Blood stagnation?', category: 'Qi/Blood' },
  { id: 'd3', question: 'Any Cold pathogen present?', category: 'Pathogens' },
  { id: 'd4', question: 'Any Dampness pathogen?', category: 'Pathogens' },
  { id: 'd5', question: 'Any Heat pathogen present?', category: 'Pathogens' },
  { id: 'd6', question: 'Any Phlegm accumulation?', category: 'Pathogens' },
  { id: 'd7', question: 'Any Qi deficiency present?', category: 'Qi/Blood' },
  { id: 'd8', question: 'Any Qi stagnation?', category: 'Qi/Blood' },
  { id: 'd9', question: 'Any Wind pathogen?', category: 'Pathogens' },
  { id: 'd10', question: 'Any Yang deficiency?', category: 'Yin/Yang' },
  { id: 'd11', question: 'Any Yang excess?', category: 'Yin/Yang' },
  { id: 'd12', question: 'Any Yin deficiency?', category: 'Yin/Yang' },
  { id: 'd13', question: 'Condition severity level?', category: 'Assessment' },
  { id: 'd14', question: 'Deficiency or excess pattern?', category: 'Pattern' },
  { id: 'd15', question: 'Heat or Cold pattern?', category: 'Pattern' },
  { id: 'd16', question: 'Is condition acute or chronic?', category: 'Assessment' },
  { id: 'd17', question: 'Moisture or Dryness pattern?', category: 'Pattern' },
  { id: 'd18', question: 'What is Heart condition?', category: 'Organs' },
  { id: 'd19', question: 'What is Kidney condition?', category: 'Organs' },
  { id: 'd20', question: 'What is Liver condition?', category: 'Organs' },
  { id: 'd21', question: 'What is Lung condition?', category: 'Organs' },
  { id: 'd22', question: 'What is Spleen condition?', category: 'Organs' },
  { id: 'd23', question: 'What is the main imbalance pattern?', category: 'Pattern' },
  { id: 'd24', question: 'What is the treatment principle?', category: 'Treatment' },
  { id: 'd25', question: 'Which meridian is involved?', category: 'Meridians' },
  { id: 'd26', question: 'Which organ is primarily affected?', category: 'Organs' },
];

// Treatment Questions (50)
const treatmentQuestions = [
  { id: 't1', question: 'Any additional tests needed?', category: 'Planning' },
  { id: 't2', question: 'Any breathing exercises recommended?', category: 'Practice' },
  { id: 't3', question: 'Any circadian rhythm considerations?', category: 'Seasonal' },
  { id: 't4', question: 'Any contraindications present?', category: 'Herbs' },
  { id: 't5', question: 'Any crystal therapy use?', category: 'Complementary' },
  { id: 't6', question: 'Any ear points recommended?', category: 'Ear' },
  { id: 't7', question: 'Any ear seed application?', category: 'Ear' },
  { id: 't8', question: 'Any emotional treatment needed?', category: 'Emotional' },
  { id: 't9', question: 'Any essential oil use?', category: 'Complementary' },
  { id: 't10', question: 'Any exercise recommendations?', category: 'Lifestyle' },
  { id: 't11', question: 'Any foods to add?', category: 'Nutrition' },
  { id: 't12', question: 'Any foods to avoid?', category: 'Nutrition' },
  { id: 't13', question: 'Any meditation recommendations?', category: 'Emotional' },
  { id: 't14', question: 'Any possible reactions?', category: 'Safety' },
  { id: 't15', question: 'Any preventive treatment available?', category: 'Prevention' },
  { id: 't16', question: 'Any Qi Gong exercises recommended?', category: 'Practice' },
  { id: 't17', question: 'Any reflexology recommendations?', category: 'Reflexology' },
  { id: 't18', question: 'Any safety precautions?', category: 'Safety' },
  { id: 't19', question: 'Any scalp points recommended?', category: 'Scalp' },
  { id: 't20', question: 'Any sleep recommendations?', category: 'Lifestyle' },
  { id: 't21', question: 'Any stress management tips?', category: 'Lifestyle' },
  { id: 't22', question: 'Any stretching exercises recommended?', category: 'Practice' },
  { id: 't23', question: 'Any Tai Chi recommendations?', category: 'Practice' },
  { id: 't24', question: 'Any tea or soup recommendations?', category: 'Nutrition' },
  { id: 't25', question: 'Expected treatment duration?', category: 'Planning' },
  { id: 't26', question: 'Five Element approach recommended?', category: 'Elements' },
  { id: 't27', question: 'How many acupuncture sessions needed?', category: 'Acupuncture' },
  { id: 't28', question: 'How long to take herbs?', category: 'Herbs' },
  { id: 't29', question: 'Lifestyle recommendations?', category: 'Lifestyle' },
  { id: 't30', question: 'Nutrition recommendations?', category: 'Nutrition' },
  { id: 't31', question: 'Recommended herb dosage?', category: 'Herbs' },
  { id: 't32', question: 'Recommended herbal formula?', category: 'Herbs' },
  { id: 't33', question: 'Seasonal treatment recommended?', category: 'Seasonal' },
  { id: 't34', question: 'Should cupping be used?', category: 'Techniques' },
  { id: 't35', question: 'Should electro-acupuncture be used?', category: 'Techniques' },
  { id: 't36', question: 'Should Gua Sha be used?', category: 'Techniques' },
  { id: 't37', question: 'Should moxibustion be used?', category: 'Techniques' },
  { id: 't38', question: 'Signs of expected improvement?', category: 'Planning' },
  { id: 't39', question: 'Tonify or disperse approach?', category: 'Principles' },
  { id: 't40', question: 'Treatment frequency recommended?', category: 'Acupuncture' },
  { id: 't41', question: 'Warm or cool approach?', category: 'Principles' },
  { id: 't42', question: 'What acupuncture points recommended?', category: 'Acupuncture' },
  { id: 't43', question: 'What acupuncture technique to use?', category: 'Acupuncture' },
  { id: 't44', question: 'What element to calm?', category: 'Elements' },
  { id: 't45', question: 'What element to strengthen?', category: 'Elements' },
  { id: 't46', question: 'What is the main treatment principle?', category: 'Principles' },
  { id: 't47', question: 'What is the prognosis?', category: 'Prognosis' },
  { id: 't48', question: 'When to follow up?', category: 'Planning' },
  { id: 't49', question: 'When to refer to physician?', category: 'Safety' },
  { id: 't50', question: 'Moisten or dry approach?', category: 'Principles' },
];

// Quick Questions moved to detailed view
const quickQuestions = [
  { icon: Leaf, text: 'Best herbs for Spleen Qi deficiency?' },
  { icon: MapPin, text: 'Points for Shao Yang headache?' },
  { icon: Stethoscope, text: 'TCM patterns for insomnia?' },
];

// Main query categories for first page
const mainQueryCategories = [
  { 
    id: 'symptoms', 
    icon: FileText, 
    title: 'Symptoms Analysis', 
    description: 'Analyze patient symptoms and complaints',
    questions: symptomQuestions
  },
  { 
    id: 'diagnosis', 
    icon: ClipboardList, 
    title: 'TCM Diagnosis', 
    description: 'Pattern identification and assessment',
    questions: diagnosisQuestions
  },
  { 
    id: 'treatment', 
    icon: Pill, 
    title: 'Treatment Planning', 
    description: 'Treatment principles and protocols',
    questions: treatmentQuestions
  },
];

const DISCLAIMER_STORAGE_KEY = 'tcm_therapist_disclaimer_signed';

export default function TcmBrain() {
  const navigate = useNavigate();
  const { tier, hasFeature } = useTier();
  const { session } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [highlightedPoints, setHighlightedPoints] = useState<string[]>([]);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const [activeFeatureTab, setActiveFeatureTab] = useState<string>('chat');
  
  // Selected question states for all tabs
  const [selectedSymptomQuestion, setSelectedSymptomQuestion] = useState('');
  const [selectedDiagnosisQuestion, setSelectedDiagnosisQuestion] = useState('');
  const [selectedTreatmentQuestion, setSelectedTreatmentQuestion] = useState('');
  const [selectedHerbsQuestion, setSelectedHerbsQuestion] = useState('');
  const [selectedPointsQuestion, setSelectedPointsQuestion] = useState('');
  const [selectedConditionsQuestion, setSelectedConditionsQuestion] = useState('');
  const [selectedNutritionQuestion, setSelectedNutritionQuestion] = useState('');
  const [selectedMentalQuestion, setSelectedMentalQuestion] = useState('');
  const [selectedSleepQuestion, setSelectedSleepQuestion] = useState('');
  const [selectedWorklifeQuestion, setSelectedWorklifeQuestion] = useState('');
  const [selectedBaziQuestion, setSelectedBaziQuestion] = useState('');
  const [selectedWellnessQuestion, setSelectedWellnessQuestion] = useState('');
  const [selectedSportsQuestion, setSelectedSportsQuestion] = useState('');
  const [selectedAstroQuestion, setSelectedAstroQuestion] = useState('');
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const aiResponseRef = useRef<HTMLDivElement>(null);

  // Check if therapist has signed disclaimer
  useEffect(() => {
    const checkDisclaimer = () => {
      const signed = localStorage.getItem(DISCLAIMER_STORAGE_KEY);
      if (!signed) {
        navigate('/therapist-disclaimer');
        return;
      }
      
      try {
        const signedData = JSON.parse(signed);
        const signedDate = new Date(signedData.signedAt);
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        
        if (signedDate < oneYearAgo) {
          // Disclaimer expired, need to re-sign
          localStorage.removeItem(DISCLAIMER_STORAGE_KEY);
          navigate('/therapist-disclaimer');
        }
      } catch {
        // Invalid data, redirect to sign
        localStorage.removeItem(DISCLAIMER_STORAGE_KEY);
        navigate('/therapist-disclaimer');
      }
    };
    
    checkDisclaimer();
  }, [navigate]);

  // Ensure we scroll to the AI response panel as soon as loading starts
  useEffect(() => {
    if (!isLoading) return;
    requestAnimationFrame(() => {
      aiResponseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [isLoading]);

  useEffect(() => {
    if (!tier) {
      navigate('/gate');
    }
  }, [tier, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Parse highlighted points from last assistant message
  useEffect(() => {
    const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMsg) {
      const points = parsePointReferences(lastAssistantMsg.content);
      setHighlightedPoints(points);
    }
  }, [messages]);

  const handleLogout = () => {
    localStorage.removeItem('therapist_tier');
    localStorage.removeItem('therapist_expires_at');
    navigate('/');
  };

  const streamChat = async (userMessage: string) => {
    const userMsg: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setLoadingStartTime(Date.now());
    setCurrentQuery(userMessage);

    // Check for authentication
    if (!session?.access_token) {
      toast.error('Please log in to use TCM Brain');
      setIsLoading(false);
      return;
    }

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast.error('Session expired. Please log in again.');
        } else if (response.status === 429) {
          toast.error('Too many requests. Try again in a minute.');
        } else if (response.status === 402) {
          toast.error('Credits exhausted. Please add credits.');
        } else {
          toast.error('AI service error');
        }
        setIsLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let buffer = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = { role: 'assistant', content: assistantContent };
                return newMessages;
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Chat error');
    } finally {
      setIsLoading(false);
      setLoadingStartTime(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input.trim();
    setInput('');
    streamChat(message);
  };

  const scrollToAiResponse = () => {
    requestAnimationFrame(() => {
      aiResponseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleCustomPromptSubmit = () => {
    if (!customPrompt.trim() || isLoading) return;
    const message = customPrompt.trim();
    setCustomPrompt('');
    streamChat(message);
    scrollToAiResponse();
  };

  const handleQuickQuestion = (question: string) => {
    if (isLoading) return;
    streamChat(question);
    scrollToAiResponse();
  };

  const handleQAQuestionSelect = (question: string) => {
    if (!question || isLoading) return;
    streamChat(question);
    scrollToAiResponse();
  };

  // Voice recording functionality
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          try {
            // Use supabase.functions.invoke which auto-passes the session JWT
            const { data, error } = await supabase.functions.invoke('voice-to-text', {
              body: { audio: base64Audio },
            });
            
            if (error) {
              console.error('Transcription error:', error);
              toast.error('Transcription error');
            } else if (data?.text) {
              setInput(data.text);
              toast.success('Recording transcribed');
            }
          } catch (error) {
            console.error('Transcription error:', error);
            toast.error('Transcription error');
          }
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording... Click again to stop');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Cannot access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  if (!tier || !hasFeature('tcm_brain')) return null;

  const renderQASection = (
    title: string,
    questions: typeof symptomQuestions,
    selectedValue: string,
    onSelect: (value: string) => void
  ) => {
    const categories = [...new Set(questions.map(q => q.category))];
    
    return (
      <div className="space-y-6 p-4">
        <div className="text-left">
          <h3 className="font-display text-xl mb-2">{title}</h3>
          <p className="text-muted-foreground text-sm">Select a question from the list or write your own</p>
        </div>
        
        <div className="grid gap-4">
          {categories.map(category => (
            <Card key={category} className="bg-card">
              <CardHeader className="py-3">
                <CardTitle className="text-sm font-medium text-jade text-left">{category}</CardTitle>
              </CardHeader>
              <CardContent className="py-2">
                <Select
                  value={selectedValue}
                  onValueChange={(value) => {
                    onSelect(value);
                    handleQAQuestionSelect(value);
                  }}
                >
                  <SelectTrigger className="text-left">
                    <SelectValue placeholder="Select a question..." />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50 max-h-60">
                    {questions
                      .filter(q => q.category === category)
                      .map(q => (
                        <SelectItem key={q.id} value={q.question} className="text-left">
                          {q.question}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Prompt Section */}
        <Card className="bg-jade-light/20 border-jade/30">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-left">
              <FileText className="h-4 w-4" />
              Write your own question
            </CardTitle>
          </CardHeader>
          <CardContent className="py-2 space-y-3">
            <Textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Type your question here..."
              className="min-h-[100px] text-left"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleCustomPromptSubmit}
                disabled={!customPrompt.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Send Question
              </Button>
              <Button
                variant="outline"
                onClick={toggleRecording}
                className={isRecording ? 'bg-red-500/10 border-red-500 text-red-500' : ''}
              >
                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <>
      <Helmet>
        <title>TCM Brain | TCM Clinic</title>
        <meta name="description" content="Comprehensive TCM knowledge base with AI" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        {/* Minimal Header */}
        <header className="bg-card border-b border-border sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-2 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Link 
                to="/dashboard" 
                className="group flex items-center gap-1.5 text-xs font-medium py-1 px-2 rounded-lg
                           bg-gradient-to-r from-jade-600/10 to-jade-500/5
                           text-jade-700 dark:text-jade-300
                           hover:from-jade-600/20 hover:to-jade-500/10
                           transition-all duration-300 hover:-translate-x-1"
              >
                <ArrowRight className="h-3 w-3 rotate-180 animate-pulse-arrow" />
                <span className="animate-bounce-subtle">🏠</span>
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <div className="h-3 w-px bg-border" />
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 bg-jade-light rounded-full flex items-center justify-center">
                  <Brain className="h-3 w-3 text-jade" />
                </div>
                <span className="font-display text-sm">TCM Brain</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={showDetailedView ? "default" : "outline"}
                size="sm"
                onClick={() => setShowDetailedView(!showDetailedView)}
                className="text-xs gap-1 h-7 px-2"
              >
                {showDetailedView ? (
                  <>
                    <ClipboardList className="h-3 w-3" />
                    Main
                  </>
                ) : (
                  <>
                    <Leaf className="h-3 w-3" />
                    All
                  </>
                )}
              </Button>
              <TierBadge />
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={handleLogout}>
                <LogOut className="h-3.5 w-3.5" />
              </Button>
              {/* Right Sidebar Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              >
                <Menu className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content with Right Sidebar */}
        <div className="flex-1 flex relative">
          {/* Main Area */}
          <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full">
            {/* Feature tabs header */}
            {!showDetailedView && (
              <div className="px-4 pt-4 overflow-x-auto border-b border-border/30 pb-3">
                <div className="flex gap-1 w-max min-w-full">
                  {featureTabs.map((tab) => (
                    tab.isLink ? (
                      <Button
                        key={tab.id}
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs px-2 whitespace-nowrap bg-jade/10 text-jade hover:bg-jade/20 border border-jade/30"
                        asChild
                      >
                        <Link to={tab.href}>
                          <tab.icon className="h-3 w-3" />
                          {tab.label}
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        key={tab.id}
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-xs px-2 whitespace-nowrap hover:bg-jade-light/50 hover:text-jade"
                        onClick={() => {
                          setShowDetailedView(true);
                          setActiveFeatureTab(tab.id);
                        }}
                      >
                        <tab.icon className="h-3 w-3" />
                        {tab.label}
                      </Button>
                    )
                  ))}
                </div>
              </div>
            )}

            {!showDetailedView ? (
              /* Main Queries View - First Page (No Quick Questions) */
              <div className="flex-1 p-4 space-y-4">

                {/* 3 Main Query Categories */}
                <div className="grid md:grid-cols-3 gap-4">
                  {mainQueryCategories.map((category) => {
                    const categories = [...new Set(category.questions.map(q => q.category))].sort();
                    const isExpanded = expandedCategory === category.id;
                    return (
                      <Card key={category.id} className={`bg-card border-border hover:border-jade/50 transition-colors ${isExpanded ? 'md:col-span-3' : ''}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-jade-light flex items-center justify-center">
                              <category.icon className="h-5 w-5 text-jade" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{category.title}</CardTitle>
                              <p className="text-xs text-muted-foreground">{category.description}</p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          {isExpanded ? (
                            <div className="grid md:grid-cols-3 gap-3">
                              {categories.map(cat => (
                                <div key={cat} className="space-y-1">
                                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{cat}</h4>
                                  <div className="space-y-1 max-h-48 overflow-y-auto">
                                    {category.questions
                                      .filter(q => q.category === cat)
                                      .sort((a, b) => a.question.localeCompare(b.question))
                                      .map(q => (
                                        <button
                                          key={q.id}
                                          onClick={() => handleQAQuestionSelect(q.question)}
                                          className="w-full text-left text-xs p-2 rounded hover:bg-jade/20 hover:pl-4 transition-all duration-200 group flex items-center gap-2 border border-transparent hover:border-jade/30"
                                        >
                                          <Send className="h-3 w-3 opacity-0 group-hover:opacity-100 text-jade transition-opacity shrink-0" />
                                          <span className="flex-1">{q.question}</span>
                                          <span className="text-[10px] text-jade opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Click to ask</span>
                                        </button>
                                      ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            categories.slice(0, 3).map(cat => (
                              <Select
                                key={cat}
                                onValueChange={(value) => handleQAQuestionSelect(value)}
                              >
                                <SelectTrigger className="text-left text-sm h-8">
                                  <SelectValue placeholder={cat} />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border z-50 max-h-60">
                                  {category.questions
                                    .filter(q => q.category === cat)
                                    .sort((a, b) => a.question.localeCompare(b.question))
                                    .map(q => (
                                      <SelectItem key={q.id} value={q.question} className="text-left text-sm cursor-pointer">
                                        <span className="flex items-center gap-2">
                                          <Send className="h-3 w-3 text-jade" />
                                          {q.question}
                                        </span>
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            ))
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-jade hover:text-jade-dark text-xs h-7"
                            onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                          >
                            {isExpanded ? '← Collapse' : `View all ${category.questions.length} questions →`}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* AI Response Display - Shows loading animation and organized results */}
                {(isLoading || messages.length > 0) && (
                  <div ref={aiResponseRef}>
                    <AIResponseDisplay
                      isLoading={isLoading}
                      content={messages.filter(m => m.role === 'assistant').pop()?.content || ''}
                      query={currentQuery || messages.filter(m => m.role === 'user').pop()?.content || ''}
                      loadingStartTime={loadingStartTime || undefined}
                      onViewBodyMap={(points) => {
                        setHighlightedPoints(points);
                        setShowDetailedView(true);
                        setActiveFeatureTab('bodymap');
                      }}
                    />
                  </div>
                )}

                {/* Chat Input at bottom */}
                <div className="pt-4 border-t border-border/50">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        ref={chatInputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask any TCM question..."
                        disabled={isLoading}
                        className="text-left pr-12 h-12 rounded-xl border-border/80 focus:border-jade transition-colors"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={toggleRecording}
                        className={`absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg ${
                          isRecording ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button 
                      type="submit" 
                      disabled={isLoading || !input.trim()}
                      className="h-12 w-12 rounded-xl bg-jade hover:bg-jade/90"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </form>
                </div>

                {/* Clear Chat Button */}
                {messages.length > 0 && !isLoading && (
                  <div className="flex justify-end pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMessages([]);
                        setHighlightedPoints([]);
                        setCurrentQuery('');
                      }}
                      className="text-muted-foreground hover:text-destructive text-xs gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear & start new query
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Detailed View - All Topics Tabs (includes Quick Questions) */
              <Tabs value={activeFeatureTab} onValueChange={setActiveFeatureTab} className="flex-1 flex flex-col">
                <div className="px-4 pt-4 overflow-x-auto">
                  <TabsList className="w-max min-w-full justify-start gap-1">
                    {featureTabs.map(tab => (
                      <TabsTrigger key={tab.id} value={tab.id} className="gap-1 text-xs px-2 whitespace-nowrap">
                        <tab.icon className="h-3 w-3" />
                        {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

              {/* Chat Tab */}
              <TabsContent value="chat" className="flex-1 flex flex-col p-4 pt-2">
                {/* Chat Header with Clear */}
                {messages.length > 0 && (
                  <div className="flex items-center justify-between pb-3 border-b border-border/50 mb-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMessages([]);
                        setHighlightedPoints([]);
                      }}
                      className="text-muted-foreground hover:text-destructive text-xs gap-1"
                    >
                      <Trash2 className="h-3 w-3" />
                      Clear chat
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      {messages.length} messages
                    </span>
                  </div>
                )}

                <ScrollArea className="flex-1 pl-4" ref={scrollRef}>
                  <div className="space-y-4 pb-4">
                    {messages.length === 0 && (
                      <div className="text-center py-12">
                        <div className="relative w-24 h-24 mx-auto mb-6">
                          <div className="absolute inset-0 bg-jade/20 rounded-full animate-pulse-soft" />
                          <div className="absolute inset-2 bg-gradient-to-br from-jade-light to-gold-light rounded-full flex items-center justify-center border-2 border-jade/30">
                            <Brain className="h-10 w-10 text-jade" />
                          </div>
                        </div>
                        <h2 className="font-display text-3xl mb-3 text-center bg-gradient-to-r from-jade to-jade-dark bg-clip-text text-transparent">
                          Welcome to TCM Brain
                        </h2>
                        <p className="text-muted-foreground mb-8 text-center max-w-md mx-auto">
                          Your personal assistant for Traditional Chinese Medicine. Ask any question about herbs, acupuncture points, diagnosis, and more.
                        </p>
                        
                        {/* Quick Questions in detailed view */}
                        <div className="grid sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
                          {quickQuestions.map((q, i) => (
                            <button
                              key={i}
                              onClick={() => handleQuickQuestion(q.text)}
                              className="p-5 bg-gradient-to-br from-card to-card/80 border border-border/80 rounded-xl text-left hover:border-jade hover:shadow-elevated transition-all group relative overflow-hidden"
                            >
                              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-jade/0 via-jade/50 to-jade/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                              <div className="w-10 h-10 rounded-lg bg-jade-light flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                <q.icon className="h-5 w-5 text-jade" />
                              </div>
                              <p className="text-sm font-medium leading-relaxed">{q.text}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {messages.map((msg, i) => {
                      const userMessage = msg.role === 'assistant' && i > 0 
                        ? messages.slice(0, i).reverse().find(m => m.role === 'user')?.content
                        : undefined;
                      return (
                        <ChatMessage 
                          key={i} 
                          role={msg.role} 
                          content={msg.content} 
                          userMessage={userMessage}
                        />
                      );
                    })}

                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                      <ChatTypingIndicator />
                    )}
                  </div>
                </ScrollArea>

                {/* Enhanced Input */}
                <form onSubmit={handleSubmit} className="flex gap-2 pt-4 border-t border-border/50 bg-background/50 backdrop-blur-sm -mx-4 px-4 -mb-4 pb-4">
                  <div className="flex-1 relative">
                    <Input
                      ref={chatInputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask a TCM question..."
                      disabled={isLoading}
                      className="text-left pr-12 h-12 rounded-xl border-border/80 focus:border-jade transition-colors"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={toggleRecording}
                      className={`absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-lg ${
                        isRecording ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLoading || !input.trim()}
                    className="h-12 w-12 rounded-xl bg-jade hover:bg-jade/90"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Body Map Tab */}
              <TabsContent value="bodymap" className="flex-1 overflow-auto p-4">
                <BodyFigureSelector 
                  highlightedPoints={highlightedPoints} 
                  onGenerateProtocol={(points) => {
                    const prompt = `Generate a detailed TCM treatment protocol for the following acupuncture points: ${points.join(', ')}. 

Include:
1. Treatment principle and therapeutic goal
2. Point combination analysis - why these points work together
3. Needling technique recommendations (depth, angle, stimulation)
4. Order of point insertion
5. Recommended needle retention time
6. Contraindications and precautions
7. Expected therapeutic effects
8. Complementary techniques (moxa, cupping, electroacupuncture if applicable)
9. Treatment frequency and course recommendation`;
                    streamChat(prompt);
                    // Switch to chat tab to see the response
                    setActiveFeatureTab('chat');
                  }}
                />
              </TabsContent>

              {/* Herbs Tab */}
              <TabsContent value="herbs" className="flex-1 overflow-auto">
                {renderQASection(
                  'Chinese Herbal Medicine',
                  herbsQuestions,
                  selectedHerbsQuestion,
                  setSelectedHerbsQuestion
                )}
              </TabsContent>

              {/* Points Tab */}
              <TabsContent value="points" className="flex-1 overflow-auto">
                {renderQASection(
                  'Acupuncture Points',
                  pointsQuestions,
                  selectedPointsQuestion,
                  setSelectedPointsQuestion
                )}
              </TabsContent>

              {/* Conditions Tab */}
              <TabsContent value="conditions" className="flex-1 overflow-auto">
                {renderQASection(
                  'TCM Conditions & Patterns',
                  conditionsQuestions,
                  selectedConditionsQuestion,
                  setSelectedConditionsQuestion
                )}
              </TabsContent>

              {/* Nutrition Tab */}
              <TabsContent value="nutrition" className="flex-1 overflow-auto">
                {renderQASection(
                  'TCM Nutrition',
                  nutritionQuestions,
                  selectedNutritionQuestion,
                  setSelectedNutritionQuestion
                )}
              </TabsContent>

              {/* Mental Tab */}
              <TabsContent value="mental" className="flex-1 overflow-auto">
                {renderQASection(
                  'Mental Health in TCM',
                  mentalQuestions,
                  selectedMentalQuestion,
                  setSelectedMentalQuestion
                )}
              </TabsContent>

              {/* Sleep Tab */}
              <TabsContent value="sleep" className="flex-1 overflow-auto">
                {renderQASection(
                  'Sleep Quality in TCM',
                  sleepQuestions,
                  selectedSleepQuestion,
                  setSelectedSleepQuestion
                )}
              </TabsContent>

              {/* Work-Life Tab */}
              <TabsContent value="worklife" className="flex-1 overflow-auto">
                {renderQASection(
                  'Work-Life Balance',
                  worklifeQuestions,
                  selectedWorklifeQuestion,
                  setSelectedWorklifeQuestion
                )}
              </TabsContent>

              {/* Bazi Tab */}
              <TabsContent value="bazi" className="flex-1 overflow-auto">
                {renderQASection(
                  'Bazi - Four Pillars',
                  baziQuestions,
                  selectedBaziQuestion,
                  setSelectedBaziQuestion
                )}
              </TabsContent>

              {/* Wellness Tab */}
              <TabsContent value="wellness" className="flex-1 overflow-auto">
                {renderQASection(
                  'General Wellness',
                  wellnessQuestions,
                  selectedWellnessQuestion,
                  setSelectedWellnessQuestion
                )}
              </TabsContent>

              {/* Sports Tab */}
              <TabsContent value="sports" className="flex-1 overflow-auto">
                {renderQASection(
                  'Chinese Sports Medicine',
                  sportsQuestions,
                  selectedSportsQuestion,
                  setSelectedSportsQuestion
                )}
              </TabsContent>

              {/* Astrology Tab */}
              <TabsContent value="astro" className="flex-1 overflow-auto">
                {renderQASection(
                  'Chinese Astrology',
                  astroQuestions,
                  selectedAstroQuestion,
                  setSelectedAstroQuestion
                )}
              </TabsContent>
              </Tabs>
            )}
          </main>

          {/* Right Sidebar */}
          <aside 
            className={`fixed right-0 top-[52px] bottom-0 w-64 bg-card border-l border-border z-40 transition-transform duration-300 ${
              rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="p-4 h-full flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm">Quick Actions</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setRightSidebarOpen(false)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-sm"
                  onClick={() => {
                    chatInputRef.current?.focus();
                    setRightSidebarOpen(false);
                  }}
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-sm"
                  onClick={() => {
                    toggleRecording();
                    setRightSidebarOpen(false);
                  }}
                >
                  {isRecording ? <MicOff className="h-4 w-4 text-red-500" /> : <Mic className="h-4 w-4" />}
                  {isRecording ? 'Stop Recording' : 'Voice Input'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-sm"
                  onClick={() => {
                    const historySection = document.querySelector('[data-section="chat-history-section"]');
                    historySection?.scrollIntoView({ behavior: 'smooth' });
                    setRightSidebarOpen(false);
                  }}
                >
                  <History className="h-4 w-4" />
                  History
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-sm"
                  asChild
                >
                  <Link to="/feedback">
                    <MessageSquare className="h-4 w-4" />
                    Feedback
                  </Link>
                </Button>
              </div>

              {/* Highlighted Points in Sidebar */}
              {highlightedPoints.length > 0 && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2">
                    Recommended Points
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {highlightedPoints.map(point => (
                      <Button
                        key={point}
                        variant="outline"
                        size="sm"
                        className="h-6 text-xs bg-jade/10 border-jade/30 text-jade"
                        onClick={() => {
                          setShowDetailedView(true);
                          setRightSidebarOpen(false);
                          setTimeout(() => {
                            const tabsList = document.querySelector('[role="tablist"]');
                            const bodyMapTab = tabsList?.querySelector('[value="bodymap"]') as HTMLButtonElement;
                            bodyMapTab?.click();
                          }, 50);
                        }}
                      >
                        {point}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Sidebar Overlay */}
          {rightSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/20 z-30 lg:hidden"
              onClick={() => setRightSidebarOpen(false)}
            />
          )}
        </div>
      </div>

      {/* ElevenLabs Voice Agent Widget */}
      <ElevenLabsWidget agentId="agent_9301kdj55g7ef3tadnchsm54vxwt" />
    </>
  );
}
