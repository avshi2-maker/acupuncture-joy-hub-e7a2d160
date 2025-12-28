import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Moon, 
  Brain, 
  Activity, 
  Stethoscope, 
  Heart, 
  Leaf, 
  Pill,
  FileText,
  ChevronRight
} from 'lucide-react';

export interface SessionTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: string;
  questions: string[];
}

export const sessionTemplates: SessionTemplate[] = [
  {
    id: 'insomnia',
    name: 'Insomnia Assessment',
    description: 'Complete sleep disorder evaluation',
    icon: Moon,
    category: 'Sleep',
    questions: [
      'Any difficulty falling asleep?',
      'Any night wakings?',
      'Any excessive dreams?',
      'Sleep quality assessment?',
      'What time do you go to bed?',
      'How many hours of sleep per night?',
      'Any Heart Yin deficiency?',
      'Any Blood deficiency present?',
      'Any anxiety or excessive worry?',
      'Current stress level?',
      'What is the main treatment principle?',
      'What acupuncture points recommended?',
      'Should moxibustion be used?',
      'Any sleep recommendations?',
      'Any meditation recommendations?'
    ]
  },
  {
    id: 'anxiety',
    name: 'Anxiety & Stress',
    description: 'Mental health and emotional assessment',
    icon: Brain,
    category: 'Mental',
    questions: [
      'Any anxiety or excessive worry?',
      'Any depression symptoms?',
      'Current emotional state?',
      'Current stress level?',
      'Any irritability present?',
      'Any palpitations or chest tightness?',
      'Any Qi stagnation?',
      'What is Liver condition?',
      'What is Heart condition?',
      'Any emotional treatment needed?',
      'Any breathing exercises recommended?',
      'Any Qi Gong exercises recommended?',
      'What acupuncture points recommended?',
      'Any meditation recommendations?',
      'Any stress management tips?'
    ]
  },
  {
    id: 'chronic-pain',
    name: 'Chronic Pain',
    description: 'Pain management and assessment',
    icon: Activity,
    category: 'Pain',
    questions: [
      'Any pain present? Where?',
      'Is the pain constant or intermittent?',
      'Pain character? (sharp, dull, stabbing)',
      'What aggravates the pain?',
      'What relieves the pain?',
      'When did symptoms begin?',
      'Any Blood stagnation?',
      'Any Qi stagnation?',
      'Any Cold pathogen present?',
      'Any Dampness pathogen?',
      'Which meridian is involved?',
      'What acupuncture points recommended?',
      'Should cupping be used?',
      'Should Gua Sha be used?',
      'Should electro-acupuncture be used?'
    ]
  },
  {
    id: 'digestive',
    name: 'Digestive Issues',
    description: 'GI and digestion assessment',
    icon: Stethoscope,
    category: 'Digestion',
    questions: [
      'How is the appetite?',
      'Any bloating or swelling?',
      'Any constipation or diarrhea?',
      'Any nausea present?',
      'Any excessive thirst?',
      'Stool frequency and quality?',
      'Eating habits and patterns?',
      'What is Spleen condition?',
      'Any Dampness pathogen?',
      'Any Qi deficiency present?',
      'Any foods to avoid?',
      'Any foods to add?',
      'What acupuncture points recommended?',
      'Recommended herbal formula?',
      'Any tea or soup recommendations?'
    ]
  },
  {
    id: 'womens-health',
    name: "Women's Health",
    description: 'Menstrual and reproductive assessment',
    icon: Heart,
    category: 'Women',
    questions: [
      'Any menstrual cycle issues? (women)',
      'Any menstrual pain? (women)',
      'Any discharge present? (women)',
      'Any Blood deficiency present?',
      'Any Blood stagnation?',
      'What is Liver condition?',
      'What is Kidney condition?',
      'Any Cold pathogen present?',
      'Any Qi stagnation?',
      'What is the main treatment principle?',
      'What acupuncture points recommended?',
      'Should moxibustion be used?',
      'Recommended herbal formula?',
      'Any lifestyle recommendations?',
      'Any foods to add?'
    ]
  },
  {
    id: 'fatigue',
    name: 'Fatigue & Energy',
    description: 'Energy deficiency assessment',
    icon: Leaf,
    category: 'Energy',
    questions: [
      'Any chronic fatigue present?',
      'What is the energy level?',
      'What time of day is fatigue worse?',
      'Sleep quality assessment?',
      'How is the appetite?',
      'Any Qi deficiency present?',
      'Any Yang deficiency?',
      'Any Blood deficiency present?',
      'What is Spleen condition?',
      'What is Kidney condition?',
      'Tonify or disperse approach?',
      'Warm or cool approach?',
      'What acupuncture points recommended?',
      'Recommended herbal formula?',
      'Any exercise recommendations?'
    ]
  },
  {
    id: 'headache',
    name: 'Headache & Migraine',
    description: 'Head pain assessment',
    icon: Pill,
    category: 'Head',
    questions: [
      'Any headaches present?',
      'Where is the headache located?',
      'Is the pain constant or intermittent?',
      'Pain character? (sharp, dull, stabbing)',
      'What aggravates the pain?',
      'What relieves the pain?',
      'Any dizziness or vertigo?',
      'Any vision problems?',
      'Any Wind pathogen?',
      'What is Liver condition?',
      'Any Blood stagnation?',
      'Which meridian is involved?',
      'What acupuncture points recommended?',
      'Any scalp points recommended?',
      'Any preventive treatment available?'
    ]
  },
  {
    id: 'initial-intake',
    name: 'Initial Intake',
    description: 'Comprehensive first visit assessment',
    icon: FileText,
    category: 'General',
    questions: [
      'What is the main symptom?',
      'When did symptoms begin?',
      'Any pre-existing conditions?',
      'Current medication use?',
      'Any allergies present?',
      'Pulse quality? (fast, slow, weak)',
      'Tongue condition? (color, coating)',
      'Current stress level?',
      'Sleep quality assessment?',
      'How is the appetite?',
      'Any physical exercise routine?',
      'What is the main imbalance pattern?',
      'Which organ is primarily affected?',
      'What is the main treatment principle?',
      'Expected treatment duration?'
    ]
  }
];

interface SessionTemplatesProps {
  onApplyTemplate: (template: SessionTemplate) => void;
  trigger?: React.ReactNode;
}

export const SessionTemplates: React.FC<SessionTemplatesProps> = ({ 
  onApplyTemplate,
  trigger 
}) => {
  const [open, setOpen] = React.useState(false);
  const categories = [...new Set(sessionTemplates.map(t => t.category))];

  const handleApply = (template: SessionTemplate) => {
    onApplyTemplate(template);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-jade" />
            Session Templates
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {categories.map(category => (
              <div key={category}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {category}
                </h3>
                <div className="grid gap-3">
                  {sessionTemplates
                    .filter(t => t.category === category)
                    .map(template => (
                      <Card 
                        key={template.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleApply(template)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-jade/10">
                                <template.icon className="h-5 w-5 text-jade" />
                              </div>
                              <div>
                                <CardTitle className="text-base mb-1">
                                  {template.name}
                                </CardTitle>
                                <CardDescription className="text-sm">
                                  {template.description}
                                </CardDescription>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {template.questions.length} questions
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
