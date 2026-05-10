import { motion } from 'motion/react';
import { CheckCircle2, RotateCcw, PlusCircle, Trophy, Target, BookOpen } from 'lucide-react';
import { InterviewQuestion, SessionFeedback } from '../services/aiService';

interface SummaryViewProps {
  questions: InterviewQuestion[];
  answers: string[];
  feedback: SessionFeedback | null;
  onRetry: () => void;
  onNewRole: () => void;
  jobTitle: string;
}

export const SummaryView = ({ questions, answers, feedback, onRetry, onNewRole, jobTitle }: SummaryViewProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl space-y-12"
    >
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-full font-bold text-sm uppercase tracking-wider mb-2">
          <CheckCircle2 className="w-5 h-5" />
          Warmup Complete
        </div>
        <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Great job preparing for {jobTitle}!</h2>
        <p className="text-slate-500 text-lg">Review your practice session and key takeaways below.</p>
      </div>

      {/* Session Note */}
      {feedback && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-emerald-700">
              <Trophy className="w-6 h-6" />
              <h4 className="font-bold uppercase tracking-widest text-xs">Top Strength</h4>
            </div>
            <p className="text-slate-800 font-medium leading-relaxed">
              {feedback.strength}
            </p>
          </div>
          <div className="bg-amber-50 border border-amber-100 p-8 rounded-3xl space-y-4">
            <div className="flex items-center gap-3 text-amber-700">
              <Target className="w-6 h-6" />
              <h4 className="font-bold uppercase tracking-widest text-xs">Growth Area</h4>
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
          Response Review
        </h3>
        
        {questions.map((q, idx) => (
          <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow space-y-6">
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm flex-shrink-0">
                {idx + 1}
              </span>
              <div className="space-y-4 flex-1">
                <h4 className="text-lg font-bold text-slate-900 leading-snug">{q.question}</h4>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Your response</span>
                  <p className="text-slate-700 leading-relaxed italic">
                    "{answers[idx] || 'No response provided.'}"
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-12 border-t border-slate-100">
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all group w-full sm:w-auto justify-center"
        >
          <RotateCcw className="w-5 h-5 transition-transform group-hover:-rotate-45" />
          Retry This Role
        </button>
        <button
          onClick={onNewRole}
          className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all group w-full sm:w-auto justify-center"
        >
          <PlusCircle className="w-5 h-5 transition-transform group-hover:scale-110" />
          Prepare New Role
        </button>
      </div>
    </motion.div>
  );
};
