import { ArrowRight, Calculator, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TokenCalculator } from "@/components/pricing/TokenCalculator";
import { ClinicROICalculator } from "@/components/roi/ClinicROICalculator";

const SimulationCalculators = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-jade/20" dir="rtl">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <Link to="/gate">
            <Button 
              variant="ghost" 
              className="text-white hover:text-jade hover:bg-white/10 gap-2"
            >
              <ArrowRight className="h-5 w-5" />
              חזרה לבחירת חבילה
            </Button>
          </Link>
        </div>
      </div>

      {/* Page Title */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            מחשבון סימולציה להכנסות, הוצאות ועלויות טוקנים
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto">
            השתמשו במחשבונים כדי לתכנן את ההוצאות וההכנסות שלכם ולבחור את החבילה המתאימה ביותר
          </p>
        </motion.div>

        {/* Calculators Grid */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Token Calculator Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-jade/20">
                <Calculator className="h-6 w-6 text-jade" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">מחשבון טוקנים</h2>
                <p className="text-sm text-white/60">חשבו כמה טוקנים תצטרכו בחודש</p>
              </div>
            </div>
            <TokenCalculator />
          </motion.div>

          {/* ROI Calculator Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-amber-500/20">
                <TrendingUp className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">מחשבון ROI - החזר השקעה</h2>
                <p className="text-sm text-white/60">חשבו את הרווחיות והחזר ההשקעה</p>
              </div>
            </div>
            <ClinicROICalculator isEmbedded />
          </motion.div>
        </div>

        {/* Back to Tiers CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <Link to="/gate">
            <Button 
              size="lg"
              className="bg-jade hover:bg-jade/90 text-white gap-2 px-8"
            >
              <ArrowRight className="h-5 w-5" />
              חזרה לבחירת חבילה
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default SimulationCalculators;
