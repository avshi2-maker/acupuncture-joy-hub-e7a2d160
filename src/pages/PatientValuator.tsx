import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Mic, Shield, Zap, AlertTriangle, Gem, Star, User, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLongPressTimer } from '@/hooks/useLongPressTimer';
import vaultBg from '@/assets/vault-bg.png';

const VAULT_PASSWORD = '1234';

type TimeRespect = 'punctual' | 'mixed' | 'late' | 'ghost';
type Commitment = 'warrior' | 'standard' | 'chaos' | 'sos';

interface EvaluationResult {
  score: number;
  tier: string;
  emoji: string;
  color: string;
  recommendation: string;
}

const calculateScore = (
  sessions: number,
  months: number,
  timeRespect: TimeRespect,
  commitment: Commitment,
  energyDrain: number
): EvaluationResult => {
  // Base score from sessions and consistency
  let score = 0;
  
  // Sessions weight (max 25 points)
  const sessionScore = Math.min(sessions / 20, 1) * 25;
  score += sessionScore;
  
  // Duration loyalty (max 15 points)
  const durationScore = Math.min(months / 12, 1) * 15;
  score += durationScore;
  
  // Time respect (max 20 points)
  const timeScores: Record<TimeRespect, number> = {
    punctual: 20,
    mixed: 12,
    late: 5,
    ghost: 0
  };
  score += timeScores[timeRespect];
  
  // Commitment (max 20 points)
  const commitmentScores: Record<Commitment, number> = {
    warrior: 20,
    standard: 12,
    chaos: 5,
    sos: 2
  };
  score += commitmentScores[commitment];
  
  // Energy drain/gain (max 20 points, can be negative)
  // -50 to +50 maps to -20 to +20
  const energyScore = (energyDrain / 50) * 20;
  score += energyScore;
  
  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));
  
  // Determine tier
  if (score >= 85) {
    return {
      score,
      tier: 'Diamond Client',
      emoji: '💎',
      color: '#00e5ff',
      recommendation: 'Protect this relationship. Prioritize scheduling. Consider referral bonus.'
    };
  } else if (score >= 70) {
    return {
      score,
      tier: 'Platinum Partner',
      emoji: '⭐',
      color: '#e0e0e0',
      recommendation: 'Solid investment. Standard priority. Good energy exchange.'
    };
  } else if (score >= 50) {
    return {
      score,
      tier: 'Standard Client',
      emoji: '🔄',
      color: '#ffc107',
      recommendation: 'Neutral ROI. Consider setting clearer boundaries.'
    };
  } else if (score >= 30) {
    return {
      score,
      tier: 'Energy Drain',
      emoji: '⚠️',
      color: '#ff9800',
      recommendation: 'Monitor closely. High emotional labor. Set firm limits.'
    };
  } else {
    return {
      score,
      tier: 'SOS Vampire',
      emoji: '🧛',
      color: '#ff5252',
      recommendation: 'Consider referral out. Protect your energy. Review therapeutic contract.'
    };
  }
};

export default function PatientValuator() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);
  
  // Form state
  const [patientName, setPatientName] = useState('');
  const [sessions, setSessions] = useState(0);
  const [months, setMonths] = useState(0);
  const [timeRespect, setTimeRespect] = useState<TimeRespect>('punctual');
  const [commitment, setCommitment] = useState<Commitment>('standard');
  const [energyDrain, setEnergyDrain] = useState([0]);
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecording, setHasRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Result
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handlePasswordSubmit = () => {
    if (password === VAULT_PASSWORD) {
      setIsUnlocked(true);
      setShowError(false);
    } else {
      setShowError(true);
      setPassword('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePasswordSubmit();
    }
  };

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setRecordingDuration(0);
    recordingInterval.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }
    if (recordingDuration > 0) {
      setHasRecording(true);
    }
  }, [recordingDuration]);

  const { handlers: longPressHandlers } = useLongPressTimer({
    onLongPress: startRecording,
    delay: 300
  });

  const handleCalculate = () => {
    setIsCalculating(true);
    setResult(null);
    
    setTimeout(() => {
      const evaluation = calculateScore(
        sessions,
        months,
        timeRespect,
        commitment,
        energyDrain[0]
      );
      setResult(evaluation);
      setIsCalculating(false);
    }, 1500);
  };

  const resetForm = () => {
    setPatientName('');
    setSessions(0);
    setMonths(0);
    setTimeRespect('punctual');
    setCommitment('standard');
    setEnergyDrain([0]);
    setHasRecording(false);
    setRecordingDuration(0);
    setResult(null);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: '#121212',
        backgroundImage: `url(${vaultBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Login Gate */}
      <AnimatePresence>
        {!isUnlocked && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ backgroundColor: '#000' }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <Lock className="w-16 h-16 text-cyan-400 mb-8" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="••••"
                className="w-48 text-center text-2xl tracking-[0.5em] bg-transparent border-cyan-400 text-cyan-400 placeholder:text-cyan-400/30"
                autoFocus
              />
              {showError && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 mt-4 text-sm"
                >
                  Access Denied
                </motion.p>
              )}
              <p className="text-gray-600 mt-6 text-sm">SECURE THERAPIST ACCESS</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main App */}
      <AnimatePresence>
        {isUnlocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl rounded-2xl p-6 md:p-8"
            style={{
              backgroundColor: 'rgba(30, 30, 30, 0.95)',
              border: '1px solid #333',
              boxShadow: '0 0 50px rgba(0, 188, 212, 0.1)'
            }}
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-700">
              <Shield className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-light tracking-wide text-cyan-400">
                Patient Evaluator
              </h2>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Patient Name */}
              <div>
                <Label className="text-gray-400 text-sm flex items-center gap-2 mb-2">
                  <User className="w-4 h-4" /> PATIENT ID / NAME
                </Label>
                <Input
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Enter identifier..."
                  className="bg-[#2c2c2c] border-[#444] text-white"
                />
              </div>

              {/* Sessions & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-sm mb-2 block">SESSIONS COMPLETED</Label>
                  <Input
                    type="number"
                    value={sessions}
                    onChange={(e) => setSessions(Number(e.target.value))}
                    min={0}
                    className="bg-[#2c2c2c] border-[#444] text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-400 text-sm mb-2 block">DURATION (MONTHS)</Label>
                  <Input
                    type="number"
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    min={0}
                    className="bg-[#2c2c2c] border-[#444] text-white"
                  />
                </div>
              </div>

              {/* Time Respect */}
              <div>
                <Label className="text-gray-400 text-sm flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" /> TIME RESPECT (Punctuality)
                </Label>
                <Select value={timeRespect} onValueChange={(v) => setTimeRespect(v as TimeRespect)}>
                  <SelectTrigger className="bg-[#2c2c2c] border-[#444] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2c2c2c] border-[#444]">
                    <SelectItem value="punctual">🕐 On the Dot (Respectful)</SelectItem>
                    <SelectItem value="mixed">🏃 Mixed / Occasionally Late</SelectItem>
                    <SelectItem value="late">🐌 Chronically Late (Disruptive)</SelectItem>
                    <SelectItem value="ghost">👻 No Show / Ghosting</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Commitment */}
              <div>
                <Label className="text-gray-400 text-sm flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4" /> PROCESS COMMITMENT (Compliance)
                </Label>
                <Select value={commitment} onValueChange={(v) => setCommitment(v as Commitment)}>
                  <SelectTrigger className="bg-[#2c2c2c] border-[#444] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#2c2c2c] border-[#444]">
                    <SelectItem value="warrior">🔥 Warrior (Does homework, committed)</SelectItem>
                    <SelectItem value="standard">⚖️ Standard (Shows up, passive)</SelectItem>
                    <SelectItem value="chaos">🌪️ Chaos (Resistant / Complaining)</SelectItem>
                    <SelectItem value="sos">🚑 SOS Only (Crisis Driven)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Energy Drain Slider */}
              <div>
                <Label className="text-gray-400 text-sm flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4" /> THERAPIST ENERGY EXCHANGE
                </Label>
                <p className="text-xs text-gray-500 mb-3">How do you feel after the session?</p>
                <Slider
                  value={energyDrain}
                  onValueChange={setEnergyDrain}
                  min={-50}
                  max={50}
                  step={5}
                  className="[&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-cyan-400"
                />
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Drained 😫</span>
                  <span className="text-cyan-400">{energyDrain[0] > 0 ? '+' : ''}{energyDrain[0]}</span>
                  <span>Energized ⚡</span>
                </div>
              </div>

              {/* Voice Recording */}
              <div>
                <Label className="text-gray-400 text-sm mb-2 block">PRIVATE AUDIO NOTE</Label>
                <Button
                  variant="outline"
                  className={`w-full transition-all ${
                    isRecording 
                      ? 'bg-red-500 border-red-500 text-white animate-pulse' 
                      : 'bg-[#333] border-[#555] text-gray-300 hover:bg-[#444]'
                  }`}
                  {...longPressHandlers}
                  onMouseUp={stopRecording}
                  onTouchEnd={stopRecording}
                >
                  <Mic className="w-5 h-5 mr-2" />
                  {isRecording ? `Recording... ${recordingDuration}s` : '🎤 Hold to Record Comment'}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  {hasRecording 
                    ? `✅ Voice note recorded (${recordingDuration}s) - local only` 
                    : 'No recording yet'}
                </p>
              </div>

              {/* Submit Button */}
              <Button
                onClick={handleCalculate}
                disabled={isCalculating}
                className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold py-6 text-lg tracking-wide mt-6"
              >
                {isCalculating ? 'Calculating...' : 'Generate Secret Report'}
              </Button>

              {/* Result Card */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-6 p-5 rounded-xl"
                    style={{
                      backgroundColor: '#252525',
                      borderLeft: `5px solid ${result.color}`
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{result.emoji}</span>
                      <div>
                        <p className="text-2xl font-bold" style={{ color: result.color }}>
                          {result.tier}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {patientName || 'Anonymous Patient'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 my-4">
                      <div 
                        className="text-4xl font-bold"
                        style={{ color: result.color }}
                      >
                        {Math.round(result.score)}
                      </div>
                      <div className="flex-1">
                        <div className="h-3 rounded-full bg-[#333] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${result.score}%` }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: result.color }}
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm leading-relaxed">
                      <strong className="text-cyan-400">Recommendation:</strong> {result.recommendation}
                    </p>

                    <Button
                      variant="ghost"
                      onClick={resetForm}
                      className="w-full mt-4 text-gray-400 hover:text-white"
                    >
                      Evaluate Another Patient
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
