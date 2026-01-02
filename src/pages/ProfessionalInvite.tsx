import { motion } from 'framer-motion';
import { Brain, Bot, BarChart3, Shield, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async';
import inviteBg from '@/assets/invite-landing-bg.png';

const WHATSAPP_NUMBER = '972544990945';

const features = [
  {
    icon: Brain,
    title: 'Encyclopedia of Knowledge',
    description: 'Access a curated TCM database that synthesizes classical texts with modern clinical protocols. Not a search engine—a clinical partner.',
  },
  {
    icon: Bot,
    title: 'AI Multi-Query Engine',
    description: 'Input complex syndromes and get instant cross-referenced formula suggestions and acupoint combinations.',
  },
  {
    icon: BarChart3,
    title: 'Micro-CRM Architecture',
    description: 'A lightweight patient management system built for therapists who value privacy and efficiency over commercial bloat.',
  },
];

export default function ProfessionalInvite() {
  const handleRequestAccess = () => {
    const message = `Hi Dr. Sapir, I received the invite regarding the Smart Clinic system. I am a therapist and interested in learning more about the AI tools and Knowledge Base. Please send details.`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <Helmet>
        <title>The Smart Clinic | Professional Invite</title>
        <meta name="description" content="Exclusive access to AI-powered clinical tools for TCM practitioners. Founded by Dr. Ron Sapir, PhD." />
      </Helmet>

      <div 
        className="min-h-screen flex items-center justify-center p-4 md:p-8"
        style={{
          backgroundImage: `url(${inviteBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        {/* Overlay for better readability */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-900/40 via-transparent to-slate-900/60 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-md"
        >
          {/* The Glass Invitation Card */}
          <div className="bg-white/92 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-slate-700/50 overflow-hidden">
            
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-8 text-center relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl" />
              
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="relative z-10"
              >
                <span className="inline-flex items-center gap-1.5 bg-amber-600/90 text-amber-50 text-xs font-bold px-4 py-1.5 rounded-full tracking-wider uppercase mb-4">
                  <Shield className="h-3.5 w-3.5" />
                  Professional Invite
                </span>
                
                <h1 className="text-2xl md:text-3xl font-light tracking-wide mb-2">
                  The Smart Clinic
                </h1>
                
                <p className="text-sm text-slate-300 font-light">
                  Founded by <span className="text-amber-400 font-medium">Dr. Ron Sapir, PhD</span>
                </p>
              </motion.div>
            </div>

            {/* Features */}
            <div className="p-6 md:p-8 space-y-6">
              {features.map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + idx * 0.15, duration: 0.5 }}
                  className="flex gap-4"
                >
                  <div className="shrink-0 w-11 h-11 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <feature.icon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Footer */}
            <div className="px-6 md:px-8 pb-8 pt-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 text-center border border-slate-100 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  We are currently opening access to select colleagues.
                </p>
                
                <Button
                  onClick={handleRequestAccess}
                  className="w-full bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Request Professional Access
                </Button>
                
                <p className="text-xs text-slate-400 mt-4 italic">
                  No spam. Strictly professional correspondence.
                </p>
              </div>
            </div>
          </div>

          {/* Subtle branding */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            className="text-center text-xs text-white/60 mt-4"
          >
            AI-Powered Clinical Intelligence
          </motion.p>
        </motion.div>
      </div>
    </>
  );
}
