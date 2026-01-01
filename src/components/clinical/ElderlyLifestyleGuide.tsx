import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Printer, Mail, Share2, Brain, Apple, Heart, Dumbbell, Users, DollarSign, Stethoscope, Palette, Home, Droplets, User, FileText, Pill, Smile, Footprints, HeartHandshake, Shield, Moon, MessageCircle, Sparkles, Smartphone, Car, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface CategorySection {
  id: string;
  icon: React.ReactNode;
  emoji: string;
  title: string;
  recommendations: {
    title: string;
    description: string;
    tips: string[];
    warning?: { title: string; text: string };
  }[];
}

const CATEGORIES: CategorySection[] = [
  {
    id: 'cognitive',
    icon: <Brain className="h-6 w-6" />,
    emoji: '🧠',
    title: 'Cognitive Health & Brain Fitness',
    recommendations: [
      {
        title: '🎯 Mental Stimulation Activities',
        description: 'Engage your brain daily with activities that challenge memory, problem-solving, and learning. Regular mental exercise helps maintain cognitive function and may reduce dementia risk.',
        tips: [
          'Puzzles: crosswords, Sudoku, jigsaw puzzles (30+ minutes daily)',
          'Learn something new: language, instrument, craft, or technology skill',
          'Read books, newspapers, or articles daily',
          'Play strategy games: chess, cards, board games with family',
          'Write: journals, memoirs, letters to family'
        ],
      },
      {
        title: '🎓 Lifelong Learning',
        description: 'Continue education through community colleges, online courses, library programs, or senior centers.',
        tips: [
          'Community college senior programs (often discounted or free)',
          'Online courses: Coursera, Khan Academy, YouTube tutorials',
          'Library lecture series and book clubs',
          'Museum docent training programs'
        ],
      },
      {
        title: '🧩 Memory Strategies',
        description: 'Use practical techniques to compensate for normal age-related memory changes.',
        tips: [
          'Keep calendars, to-do lists, and reminder notes visible',
          'Establish consistent routines for medications, keys, glasses',
          'Use smartphone alarms and reminders',
          'Create associations and mnemonics for important information'
        ],
        warning: {
          title: '⚠️ When to seek help:',
          text: 'Consult a doctor if you experience: getting lost in familiar places, difficulty with familiar tasks, repeating questions frequently, poor judgment, mood/personality changes, or confusion about time/place.'
        }
      }
    ]
  },
  {
    id: 'diet',
    icon: <Apple className="h-6 w-6" />,
    emoji: '🥗',
    title: 'Diet & Nutrition',
    recommendations: [
      {
        title: '🍽️ Balanced Mediterranean-Style Diet',
        description: 'Follow a Mediterranean or MIND diet pattern, proven to support heart health, brain function, and longevity.',
        tips: [
          'Vegetables: 3-5 servings (prioritize leafy greens, colorful varieties)',
          'Fruits: 2-3 servings (berries excellent for brain health)',
          'Whole grains: brown rice, oats, whole wheat bread',
          'Lean protein: fish 2-3x/week, chicken, eggs, legumes, nuts',
          'Healthy fats: olive oil, avocados, nuts, seeds'
        ],
      },
      {
        title: '🥛 Adequate Protein & Calcium',
        description: 'Older adults need MORE protein than younger people to prevent muscle loss (sarcopenia).',
        tips: [
          'Aim for 1.0-1.2g protein per kg body weight daily',
          'Include protein at every meal: eggs, Greek yogurt, fish, chicken, beans',
          'Calcium: 1200mg daily (dairy, fortified foods, supplements if needed)',
          'Vitamin D: 800-1000 IU daily (supplements usually necessary)'
        ],
      },
      {
        title: '🍲 Practical Meal Planning',
        description: 'Prepare nutritious meals efficiently with batch cooking and meal services.',
        tips: [
          'Batch cook and freeze portions for easy reheating',
          'Use slow cookers or Instant Pots for effortless meals',
          'Consider Meals on Wheels or senior meal delivery services',
          'Keep easy, nutritious snacks accessible: nuts, fruits, yogurt'
        ],
      }
    ]
  },
  {
    id: 'emotional',
    icon: <Heart className="h-6 w-6" />,
    emoji: '💚',
    title: 'Emotional Health & Mental Wellness',
    recommendations: [
      {
        title: '😊 Managing Depression & Anxiety',
        description: 'Depression and anxiety are NOT normal parts of aging. They are treatable conditions.',
        tips: [
          'Maintain daily routines and structure',
          'Exercise regularly (proven antidepressant effect)',
          'Stay socially connected (isolation worsens depression)',
          'Practice gratitude journaling or positive reflection',
          'Consider therapy: CBT effective for older adults'
        ],
        warning: {
          title: '⚠️ Seek immediate help for:',
          text: 'Thoughts of self-harm, persistent hopelessness lasting 2+ weeks, inability to care for yourself. Contact: doctor, therapist, 988 Suicide & Crisis Lifeline, or emergency services.'
        }
      },
      {
        title: '😌 Stress Management',
        description: 'Chronic stress accelerates aging and disease. Develop healthy coping mechanisms.',
        tips: [
          'Deep breathing exercises: 4-7-8 technique, box breathing',
          'Gentle meditation or mindfulness (apps: Calm, Headspace)',
          'Spend time in nature: parks, gardens, walking trails',
          'Limit news consumption if it increases anxiety'
        ],
      },
      {
        title: '🌈 Finding Joy & Purpose',
        description: 'Retirement and aging bring opportunities to explore passions and find new sources of meaning.',
        tips: [
          'Volunteer: libraries, hospitals, schools, animal shelters',
          'Mentor younger people in your area of expertise',
          'Pursue creative hobbies: art, music, writing, crafts',
          'Document family history and pass on traditions'
        ],
      }
    ]
  },
  {
    id: 'exercise',
    icon: <Dumbbell className="h-6 w-6" />,
    emoji: '🏃',
    title: 'Exercise & Physical Activity',
    recommendations: [
      {
        title: '🚶 Aerobic Exercise',
        description: 'Aim for 150 minutes of moderate aerobic activity weekly. Supports heart health, brain function, and independence.',
        tips: [
          'Walking: 30 minutes most days (use assistive devices if needed)',
          'Swimming or water aerobics: excellent for arthritis',
          'Stationary cycling: safe indoor option',
          'Dancing: social and physically beneficial',
          'Chair exercises: if standing is difficult'
        ],
      },
      {
        title: '💪 Strength Training',
        description: 'Strength training 2-3 times weekly prevents muscle loss and maintains bone density.',
        tips: [
          'Resistance bands: safe, affordable, portable',
          'Light dumbbells: 2-5 lbs sufficient for many exercises',
          'Body weight: chair stands, wall push-ups, heel raises',
          'Start with 1 set of 10-15 reps, gradually increase'
        ],
      },
      {
        title: '🧘 Balance & Flexibility',
        description: 'Balance exercises reduce fall risk. Flexibility maintains range of motion for daily activities.',
        tips: [
          'Tai Chi: proven fall prevention, improves balance',
          'Yoga: gentle/senior classes adapt poses for safety',
          'Standing balance: heel-to-toe walk, single leg stand',
          'Stretch daily: gentle stretches for legs, back, shoulders'
        ],
        warning: {
          title: '⚠️ Safety precautions:',
          text: 'Always have stable support nearby during balance exercises. Consult doctor before starting new exercise programs. Stop if you feel pain, dizziness, or shortness of breath.'
        }
      }
    ]
  },
  {
    id: 'family',
    icon: <Users className="h-6 w-6" />,
    emoji: '👨‍👩‍👧‍👦',
    title: 'Family Relations',
    recommendations: [
      {
        title: '❤️ Maintaining Strong Family Bonds',
        description: 'Regular family contact provides emotional support and reduces isolation.',
        tips: [
          'Schedule regular phone/video calls with distant family',
          'Learn video calling: FaceTime, Zoom, WhatsApp',
          'Attend family events when possible',
          'Share family stories, photos, and history with younger generations'
        ],
      },
      {
        title: '👶 Grandparenting & Legacy',
        description: 'Build meaningful relationships while respecting parents\' rules and boundaries.',
        tips: [
          'Respect parents\' parenting choices',
          'Create special traditions: cooking together, stories, crafts',
          'Teach skills: woodworking, sewing, gardening, cooking',
          'Record stories and memories for future generations'
        ],
      },
      {
        title: '🤝 Adult Children Relationships',
        description: 'Navigate changing dynamics as roles shift. Balance independence with accepting help.',
        tips: [
          'Maintain independence as long as safely possible',
          'Discuss health and care preferences before crisis occurs',
          'Accept help graciously when truly needed',
          'Share important legal/financial information with trusted family'
        ],
      }
    ]
  },
  {
    id: 'financial',
    icon: <DollarSign className="h-6 w-6" />,
    emoji: '💰',
    title: 'Financial Security',
    recommendations: [
      {
        title: '💵 Budget Management',
        description: 'Create and maintain a realistic budget on fixed income.',
        tips: [
          'Track all sources: Social Security, pensions, savings',
          'List fixed expenses: housing, utilities, insurance, medications',
          'Look for senior discounts: groceries, entertainment, services',
          'Consider downsizing if home costs strain budget'
        ],
      },
      {
        title: '🛡️ Fraud Prevention',
        description: 'Seniors are frequent targets of financial scams. Stay vigilant.',
        tips: [
          'NEVER give Social Security, bank, or credit card numbers over phone',
          'Hang up on "IRS," "Medicare," or "tech support" scam calls',
          'Be skeptical of "too good to be true" offers',
          'Tell trusted family member if someone pressures you for money'
        ],
        warning: {
          title: '⚠️ Common scams:',
          text: 'Grandparent scam ("I\'m in trouble, send money"), Medicare scams, romance scams, fake charities, home repair scams. Report fraud to police and Adult Protective Services.'
        }
      },
      {
        title: '📊 Assistance Programs',
        description: 'Many programs help seniors with limited income. Access earned benefits.',
        tips: [
          'Medicare Extra Help: prescription drug cost assistance',
          'SNAP (food stamps): many seniors qualify but don\'t apply',
          'Low-Income Home Energy Assistance Program (LIHEAP)',
          'Property tax relief programs for seniors'
        ],
      }
    ]
  },
  {
    id: 'healthcare',
    icon: <Stethoscope className="h-6 w-6" />,
    emoji: '⚕️',
    title: 'Healthcare Management',
    recommendations: [
      {
        title: '🏥 Regular Preventive Care',
        description: 'Maintain regular doctor visits and age-appropriate screenings.',
        tips: [
          'Annual physical exam with primary care doctor',
          'Blood pressure check at every visit',
          'Diabetes screening (A1C or fasting glucose annually)',
          'Vision and hearing tests annually',
          'Dental cleaning every 6 months'
        ],
      },
      {
        title: '💉 Vaccinations',
        description: 'Stay current on vaccines. Seniors have weaker immune systems.',
        tips: [
          'Influenza (flu): EVERY YEAR (high-dose version for 65+)',
          'COVID-19: stay current with boosters as recommended',
          'Shingles (Shingrix): 2-dose series at 50+',
          'RSV vaccine: newly recommended for 60+ (one-time)'
        ],
      },
      {
        title: '📋 Chronic Disease Management',
        description: 'Most people 70+ have at least one chronic condition. Active management is key.',
        tips: [
          'Track vitals at home: blood pressure, blood sugar, weight',
          'Learn about your conditions (reliable sources only)',
          'Keep updated list of all medications and dosages',
          'Prepare questions before doctor appointments'
        ],
      }
    ]
  },
  {
    id: 'home',
    icon: <Home className="h-6 w-6" />,
    emoji: '🏡',
    title: 'Home Safety',
    recommendations: [
      {
        title: '🚨 Fall Prevention',
        description: 'Falls are the leading cause of injury for older adults. Modify home for safety.',
        tips: [
          'Remove throw rugs and clutter from walkways',
          'Install grab bars in bathroom (near toilet and shower)',
          'Ensure adequate lighting throughout home',
          'Secure loose carpeting and repair uneven flooring',
          'Use non-slip mats in shower and bathtub'
        ],
        warning: {
          title: '⚠️ After a fall:',
          text: 'Report ALL falls to your doctor, even if not injured. Falls can signal underlying health issues and predict future falls.'
        }
      },
      {
        title: '🔥 Emergency Preparedness',
        description: 'Prepare for emergencies with proper safety measures.',
        tips: [
          'Install smoke and carbon monoxide detectors on every floor',
          'Keep flashlight and battery radio for power outages',
          'Consider medical alert system for living alone',
          'Keep emergency contact list by phone'
        ],
      }
    ]
  },
  {
    id: 'hydration',
    icon: <Droplets className="h-6 w-6" />,
    emoji: '💧',
    title: 'Hydration',
    recommendations: [
      {
        title: '💧 Adequate Fluid Intake',
        description: 'Older adults have reduced thirst sensation. Dehydration causes serious problems.',
        tips: [
          'Aim for 6-8 glasses of fluid daily (water, tea, juice)',
          'Drink water with medications and meals',
          'Keep water bottle visible as reminder',
          'Eat water-rich foods: soups, fruits, vegetables'
        ],
        warning: {
          title: '⚠️ Dehydration signs:',
          text: 'Dark urine, dizziness, confusion, dry mouth, fatigue. Seek medical attention for severe symptoms, especially in hot weather.'
        }
      }
    ]
  },
  {
    id: 'sleep',
    icon: <Moon className="h-6 w-6" />,
    emoji: '😴',
    title: 'Sleep & Rest',
    recommendations: [
      {
        title: '🛏️ Sleep Hygiene',
        description: 'Sleep patterns change with age, but 7-8 hours remains important.',
        tips: [
          'Maintain consistent sleep and wake times (even weekends)',
          'Create dark, quiet, cool bedroom environment',
          'Limit screens 1 hour before bed',
          'Avoid caffeine after noon, alcohol before bed'
        ],
      },
      {
        title: '😴 Sleep Disorders',
        description: 'Common sleep problems are treatable. Don\'t accept poor sleep as inevitable.',
        tips: [
          'Report snoring, gasping, or breathing pauses (sleep apnea)',
          'Discuss restless legs or frequent nighttime urination',
          'Avoid relying on sleep medications long-term',
          'Consider cognitive behavioral therapy for insomnia'
        ],
        warning: {
          title: '⚠️ See doctor for:',
          text: 'Persistent insomnia (3+ weeks), excessive daytime sleepiness, snoring with breathing pauses, acting out dreams (REM behavior disorder).'
        }
      }
    ]
  },
  {
    id: 'social',
    icon: <MessageCircle className="h-6 w-6" />,
    emoji: '👥',
    title: 'Social Life',
    recommendations: [
      {
        title: '🤝 Community Engagement',
        description: 'Social isolation is as harmful as smoking. Stay connected for health and longevity.',
        tips: [
          'Attend senior center activities and classes',
          'Join clubs based on interests: gardening, books, crafts',
          'Volunteer regularly for meaningful connection',
          'Attend religious or spiritual community events'
        ],
      },
      {
        title: '💕 Preventing Isolation',
        description: 'Recognize and combat isolation before it impacts health.',
        tips: [
          'Schedule at least one social interaction daily',
          'Accept invitations even when not feeling motivated',
          'Use technology to connect with distant friends/family',
          'Consider a pet for companionship (if able to care for one)'
        ],
      }
    ]
  },
  {
    id: 'technology',
    icon: <Smartphone className="h-6 w-6" />,
    emoji: '📱',
    title: 'Technology & Digital Literacy',
    recommendations: [
      {
        title: '📱 Essential Smartphone Skills',
        description: 'Smartphones enable independence, safety, and connection. Worth learning!',
        tips: [
          'Video calling: FaceTime, Zoom, WhatsApp for family',
          'Medication reminders and health tracking apps',
          'Ride services: Uber, Lyft for transportation independence',
          'Online shopping and delivery services'
        ],
      },
      {
        title: '🔒 Internet Safety',
        description: 'Protect yourself online from scams and privacy threats.',
        tips: [
          'Use strong, unique passwords for each account',
          'Never click links in suspicious emails',
          'Verify websites before entering payment information',
          'Ask family for help with unfamiliar technology'
        ],
      }
    ]
  },
  {
    id: 'spiritual',
    icon: <Sparkles className="h-6 w-6" />,
    emoji: '✨',
    title: 'Spiritual Life',
    recommendations: [
      {
        title: '🙏 Faith & Spiritual Practice',
        description: 'Spirituality provides comfort, community, and meaning. Nurture this dimension.',
        tips: [
          'Maintain religious practices that bring comfort',
          'Explore meditation, prayer, or contemplative practices',
          'Connect with spiritual community for support',
          'Find peace through nature, music, or art'
        ],
      },
      {
        title: '📖 Legacy & Life Review',
        description: 'Reflecting on life and creating legacy is natural and meaningful.',
        tips: [
          'Write or record your life story for future generations',
          'Create memory books, photo albums, or videos',
          'Share wisdom and lessons learned with family',
          'Consider ethical will (letter of values to loved ones)'
        ],
      }
    ]
  }
];

const NAV_ITEMS = CATEGORIES.map(c => ({ id: c.id, emoji: c.emoji, title: c.title.split(' ')[0] + (c.title.split(' ')[1]?.includes('&') ? ' & ' + c.title.split(' ')[2] : '') }));

export function ElderlyLifestyleGuide() {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
    toast.success('Print dialog opened');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent('Healthy Lifestyle Guide for Adults 70+');
    const body = encodeURIComponent('I wanted to share this comprehensive healthy lifestyle guide with you. It covers cognitive health, nutrition, exercise, family relations, and much more.\n\nPlease visit the app to view the full guide.');
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    toast.success('Email client opened');
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Healthy Lifestyle Guide for Adults 70+',
      text: 'Comprehensive daily living recommendations for healthy aging',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully');
      } catch {
        toast.info('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard');
    }
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(`elderly-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 text-center print:static">
        <div className="text-5xl mb-3">🌟</div>
        <h1 className="text-2xl font-bold mb-2">Healthy Lifestyle Guide for Adults 70+</h1>
        <p className="text-emerald-100 text-sm">Comprehensive Daily Living Recommendations</p>
      </div>

      {/* Quick Navigation */}
      <div className="bg-muted/50 p-4 border-b print:hidden">
        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">📑 Quick Navigation (A-Z)</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className="px-2 py-1.5 bg-background border rounded-lg text-xs font-medium hover:border-primary hover:text-primary transition-all text-center truncate"
            >
              {item.emoji} {item.title}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1" ref={contentRef}>
        <div className="p-4 space-y-6">
          {/* Introduction */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-l-4 border-blue-500 p-5 rounded-xl">
            <h2 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-2">🎯 Welcome to Your Healthy Aging Guide</h2>
            <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
              This comprehensive guide provides evidence-based recommendations for maintaining physical health, 
              mental wellness, social connections, and overall quality of life for adults aged 70 and above. 
              Each section offers practical, actionable advice organized alphabetically for easy reference.
            </p>
          </div>

          {/* Category Sections */}
          {CATEGORIES.map((category) => (
            <motion.div
              key={category.id}
              id={`elderly-${category.id}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="scroll-mt-48"
            >
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 rounded-t-xl flex items-center gap-3">
                <span className="text-2xl">{category.emoji}</span>
                <h2 className="text-lg font-bold">{category.title}</h2>
              </div>
              <div className="bg-card border border-t-0 rounded-b-xl p-4 space-y-4">
                {category.recommendations.map((rec, idx) => (
                  <div 
                    key={idx} 
                    className={`${idx !== category.recommendations.length - 1 ? 'pb-4 border-b' : ''}`}
                  >
                    <h3 className="font-bold text-foreground mb-2">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>
                    
                    <div className="bg-emerald-50 dark:bg-emerald-950/30 border-l-3 border-emerald-500 p-3 rounded-lg">
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2 uppercase">✓ Practical Tips:</p>
                      <ul className="space-y-1">
                        {rec.tips.map((tip, tipIdx) => (
                          <li key={tipIdx} className="text-sm text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
                            <span className="mt-1.5 w-1 h-1 bg-emerald-500 rounded-full flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {rec.warning && (
                      <div className="bg-red-50 dark:bg-red-950/30 border-l-3 border-red-500 p-3 rounded-lg mt-3">
                        <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1">{rec.warning.title}</p>
                        <p className="text-sm text-red-600 dark:text-red-400">{rec.warning.text}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground py-6 border-t">
            <p>This guide is for informational purposes only. Always consult healthcare professionals for medical advice.</p>
            <p className="mt-2 font-medium">🌟 Wishing you health, happiness, and vibrant aging! 🌟</p>
          </div>
        </div>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="p-4 border-t bg-background grid grid-cols-3 gap-3 print:hidden">
        <Button onClick={handlePrint} variant="outline" className="flex flex-col items-center gap-1 h-auto py-3">
          <Printer className="h-5 w-5 text-blue-500" />
          <span className="text-xs">Print</span>
        </Button>
        <Button onClick={handleEmail} variant="outline" className="flex flex-col items-center gap-1 h-auto py-3">
          <Mail className="h-5 w-5 text-purple-500" />
          <span className="text-xs">Email</span>
        </Button>
        <Button onClick={handleShare} variant="outline" className="flex flex-col items-center gap-1 h-auto py-3">
          <Share2 className="h-5 w-5 text-emerald-500" />
          <span className="text-xs">Share</span>
        </Button>
      </div>
    </div>
  );
}
