import { motion } from 'motion/react';
import { CheckCircle2, RotateCcw, PlusCircle, Trophy, Target, BookOpen, Sparkles, AlertTriangle, Quote, TrendingUp, Info, ArrowRight, Zap } from 'lucide-react';
import { InterviewQuestion, SessionFeedback } from '../services/aiService';

interface SummaryViewProps {
  questions: InterviewQuestion[];
  answers: string[];
  feedback: SessionFeedback | null;
  onRetryRound: () => void;
  onContinue: () => void;
  onNewRole: () => void;
  jobTitle: string;
  currentRound: number;
}

export const SummaryView = ({ 
  questions, 
  answers, 
  feedback, 
  onRetryRound, 
  onContinue,
  onNewRole, 
  jobTitle,
  currentRound 
}: SummaryViewProps) => {
  const isFinalRound = currentRound === 3;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl space-y-12"
    >
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider mb-2">
          <CheckCircle2 className="w-5 h-5" />
          Round {currentRound} Complete
        </div>
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          {isFinalRound ? 'Interview Complete!' : `Great momentum in Round ${currentRound}!`}
        </h2>
        <p className="text-slate-500 text-lg">
          {isFinalRound 
            ? "You've finished all rounds. Review your final performance below."
            : "Review your performance and decide your next move."}
        </p>
      </div>

      {/* Session Note */}
      {feedback && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <Trophy className="w-6 h-6" />
              <h4 className="font-bold uppercase tracking-widest text-[10px]">Top Strength</h4>
            </div>
            <p className="text-slate-800 font-medium leading-relaxed">
              {feedback.strength}
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-amber-700">
              <Target className="w-6 h-6" />
              <h4 className="font-bold uppercase tracking-widest text-[10px]">Growth Area</h4>
            </div>
            <p className="text-slate-800 font-medium leading-relaxed">
              {feedback.improvement}
            </p>
          </div>
        </div>
      )}

      {/* Recap List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-8">
          <BookOpen className="w-5 h-5 text-blue-600" />
          Detailed Performance Review
        </h3>
        
        {questions.map((q, idx) => {
          const analysis = feedback?.detailedAnalysis?.[idx];
          return (
            <div key={idx} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-12 shadow-sm hover:shadow-md transition-shadow space-y-8">
              <div className="flex items-start gap-6">
                <span className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="space-y-8 flex-1">
                  <h4 className="text-2xl font-bold text-slate-900 leading-tight">{q.question}</h4>
                  
                  {/* Side by Side Benchmarking */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Quote className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Your Practice Response</span>
                      </div>
                      <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 min-h-[150px]">
                        <p className="text-slate-700 leading-relaxed italic text-sm">
                          "{answers[idx] || 'No response provided.'}"
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-blue-500">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">"Gold Standard" Benchmark</span>
                      </div>
                      <div className="bg-blue-50/30 p-6 rounded-2xl border border-blue-100 min-h-[150px]">
                        <p className="text-slate-800 leading-relaxed text-sm">
                          {analysis?.benchmarkedAnswer || 'Generating benchmark...'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tone Analysis Section */}
                  {analysis && (
                    <div className="mt-8 pt-8 border-t border-slate-50 space-y-6">
                      <div className="flex items-center gap-2 text-slate-800">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <h5 className="font-bold text-sm uppercase tracking-widest">Tone & Clarity Analysis</h5>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-6 rounded-2xl">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3">Clarity Assessment</span>
                          <p className="text-slate-700 text-sm leading-relaxed">
                            {analysis.toneCritique}
                          </p>
                        </div>

                        <div className="space-y-4">
                          {/* Weak Claims Flags */}
                          {analysis.vagueClaims.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {analysis.vagueClaims.map((claim, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-xs font-medium">
                                  <AlertTriangle className="w-3 h-3" />
                                  Vague: "{claim}"
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Passive Language Flags */}
                          {analysis.passiveLanguage.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {analysis.passiveLanguage.map((lang, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 border border-red-100 rounded-lg text-xs font-medium">
                                  <Info className="w-3 h-3" />
                                  Passive: "{lang}"
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-12 border-t border-slate-100">
        <button
          onClick={onRetryRound}
          className="flex flex-col items-center justify-center gap-3 p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-slate-200 hover:bg-slate-50 transition-all group"
        >
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 transition-transform group-hover:scale-110">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div className="text-left w-full text-center">
            <span className="block font-bold text-slate-900">Practice Round {currentRound} Again</span>
            <span className="block text-xs text-slate-400 mt-1">Regenerate questions and try again</span>
          </div>
        </button>

        {!isFinalRound ? (
          <button
            onClick={onContinue}
            className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-transparent rounded-3xl shadow-xl transition-all group text-white ${currentRound === 1 ? 'bg-blue-600 shadow-blue-200 hover:bg-blue-700' : 'bg-rose-600 shadow-rose-200 hover:bg-rose-700'}`}
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white transition-transform group-hover:scale-110">
              {currentRound === 1 ? <ArrowRight className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
            </div>
            <div className="text-left w-full text-center">
              <span className="block font-bold">Continue to Round {currentRound + 1}</span>
              <span className="block text-xs text-white/70 mt-1">
                {currentRound === 1 ? "Targeted follow-ups based on your answers" : "Test your reflexes with an unexpected curveball"}
              </span>
            </div>
          </button>
        ) : (
          <button
            onClick={onNewRole}
            className="flex flex-col items-center justify-center gap-3 p-8 bg-slate-900 border-2 border-transparent rounded-3xl shadow-xl hover:bg-slate-800 transition-all group text-white"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white transition-transform group-hover:scale-110">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div className="text-left w-full text-center">
              <span className="block font-bold">Prepare New Role</span>
              <span className="block text-xs text-white/50 mt-1">Start fresh with a different job title</span>
            </div>
          </button>
        )}
      </div>
    </motion.div>
  );
};

