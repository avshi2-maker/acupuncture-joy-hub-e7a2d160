import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Baby, ChevronDown, Check } from 'lucide-react';

// Pregnancy history options
const gravidaParaOptions = [
  'G1P0 (First pregnancy)',
  'G1P1 (1 pregnancy, 1 birth)',
  'G2P1 (2 pregnancies, 1 birth)',
  'G2P2 (2 pregnancies, 2 births)',
  'G3P1 (3 pregnancies, 1 birth)',
  'G3P2 (3 pregnancies, 2 births)',
  'G3P3 (3 pregnancies, 3 births)',
  'Multiple pregnancies (G4+)',
];

const prenatalCareOptions = [
  'OB/GYN - Private clinic',
  'OB/GYN - Hospital',
  'Midwife care',
  'Maternal-Fetal Medicine specialist',
  'High-risk pregnancy unit',
  'No current prenatal care',
];

const complicationOptions = [
  'Gestational diabetes',
  'Preeclampsia',
  'Placenta previa',
  'Hyperemesis gravidarum (severe nausea)',
  'Anemia',
  'High blood pressure',
  'Low amniotic fluid',
  'Cervical insufficiency',
  'Gestational hypertension',
  'Multiple pregnancy (twins/triplets)',
  'No complications',
];

const previousOutcomeOptions = [
  'Previous vaginal birth',
  'Previous C-section',
  'Previous miscarriage (1st trimester)',
  'Previous miscarriage (2nd trimester)',
  'Previous ectopic pregnancy',
  'Previous stillbirth',
  'Previous preterm birth',
  'No previous pregnancies',
];

const currentSymptomOptions = [
  'Morning sickness/nausea',
  'Back pain',
  'Pelvic pain',
  'Leg cramps',
  'Swelling (edema)',
  'Heartburn/reflux',
  'Fatigue',
  'Insomnia',
  'Constipation',
  'Headaches',
  'Shortness of breath',
  'Sciatica',
  'Carpal tunnel symptoms',
  'Braxton Hicks contractions',
];

const herbsSupplementsOptions = [
  'Prenatal vitamins',
  'Folic acid',
  'Iron supplement',
  'Calcium/Vitamin D',
  'Omega-3/DHA',
  'Ginger (for nausea)',
  'Vitamin B6',
  'Probiotics',
  'Magnesium',
  'No supplements',
];

interface CategoryData {
  key: string;
  label: string;
  options: string[];
}

const pregnancyCategories: CategoryData[] = [
  { key: 'gravida_para', label: 'Gravida/Para History', options: gravidaParaOptions },
  { key: 'prenatal_care', label: 'Prenatal Care', options: prenatalCareOptions },
  { key: 'complications', label: 'Current Complications', options: complicationOptions },
  { key: 'previous_outcomes', label: 'Previous Pregnancies', options: previousOutcomeOptions },
  { key: 'current_symptoms', label: 'Current Symptoms', options: currentSymptomOptions },
  { key: 'herbs_supplements', label: 'Herbs & Supplements', options: herbsSupplementsOptions },
];

interface PregnancyQuestionSelectProps {
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

export function PregnancyQuestionSelect({ values, onChange }: PregnancyQuestionSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Record<string, string[]>>(() => {
    // Parse initial values
    const parsed: Record<string, string[]> = {};
    pregnancyCategories.forEach(cat => {
      const val = values[cat.key];
      if (val) {
        parsed[cat.key] = val.split('; ').filter(Boolean);
      } else {
        parsed[cat.key] = [];
      }
    });
    return parsed;
  });

  const handleToggleItem = (categoryKey: string, item: string) => {
    setSelectedItems(prev => {
      const current = prev[categoryKey] || [];
      const newItems = current.includes(item)
        ? current.filter(i => i !== item)
        : [...current, item];
      
      const updated = { ...prev, [categoryKey]: newItems };
      
      // Update parent with all values
      const newValues: Record<string, string> = {};
      pregnancyCategories.forEach(cat => {
        newValues[cat.key] = (updated[cat.key] || []).join('; ');
      });
      onChange(newValues);
      
      return updated;
    });
  };

  const totalSelected = Object.values(selectedItems).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[44px] bg-pink-50/50 dark:bg-pink-950/20 border-pink-200 dark:border-pink-800 hover:bg-pink-100 dark:hover:bg-pink-900/30"
        >
          <div className="flex items-center gap-2 flex-wrap">
            <Baby className="h-4 w-4 text-pink-500 shrink-0" />
            {totalSelected > 0 ? (
              <span className="text-sm">
                {totalSelected} item{totalSelected !== 1 ? 's' : ''} selected
              </span>
            ) : (
              <span className="text-muted-foreground">Select pregnancy details...</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] max-h-[400px] overflow-auto p-0 bg-background border shadow-lg z-50" align="start">
        <div className="p-2 border-b bg-muted/30">
          <p className="text-xs text-muted-foreground">Select relevant pregnancy information</p>
        </div>
        <Accordion type="multiple" className="w-full">
          {pregnancyCategories.map((category) => (
            <AccordionItem key={category.key} value={category.key} className="border-b last:border-b-0">
              <AccordionTrigger className="px-3 py-2 hover:no-underline hover:bg-muted/50 text-sm">
                <div className="flex items-center justify-between w-full pr-2">
                  <span>{category.label}</span>
                  {(selectedItems[category.key]?.length || 0) > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300">
                      {selectedItems[category.key].length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-0">
                <div className="space-y-1 p-2 bg-muted/20">
                  {category.options.map((option) => {
                    const isSelected = selectedItems[category.key]?.includes(option);
                    return (
                      <label
                        key={option}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors text-sm ${
                          isSelected 
                            ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-900 dark:text-pink-100' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleItem(category.key, option)}
                          className="border-pink-400 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                        />
                        <span className="flex-1">{option}</span>
                        {isSelected && <Check className="h-3 w-3 text-pink-600" />}
                      </label>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        
        {totalSelected > 0 && (
          <div className="p-2 border-t bg-muted/30">
            <div className="flex flex-wrap gap-1">
              {Object.entries(selectedItems).flatMap(([catKey, items]) =>
                items.slice(0, 3).map(item => (
                  <Badge 
                    key={`${catKey}-${item}`} 
                    variant="outline" 
                    className="text-xs bg-pink-50 border-pink-200 dark:bg-pink-950 dark:border-pink-800"
                  >
                    {item.length > 25 ? item.substring(0, 25) + '...' : item}
                  </Badge>
                ))
              )}
              {totalSelected > 6 && (
                <Badge variant="secondary" className="text-xs">
                  +{totalSelected - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
