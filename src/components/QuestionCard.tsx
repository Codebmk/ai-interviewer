import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Sparkles, Lightbulb, Eye, EyeOff, Send, MessageSquare, ListChecks, Loader2, AlertCircle, TrendingUp } from 'lucide-react';
import { InterviewQuestion, InterviewFeedback, getFeedbackForAnswer } from '../services/aiService';

interface QuestionCardProps {
  question: InterviewQuestion;
  index: number;
  answer: string;
  onAnswerChange: (val: string) => void;
  hideGuidance?: boolean;
}

export const QuestionCard = ({ question, index, answer, onAnswerChange, hideGuidance }: QuestionCardProps) => {
  const [showHint, setShowHint] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wordCount = answer.trim() ? answer.trim().split(/\s+/).length : 0;

  const handleGetFeedback = async () => {
    if (!answer.trim()) return;
    
    setLoadingFeedback(true);
    setError(null);
    try {
      const result = await getFeedbackForAnswer(question.question, answer);
      setFeedback(result);
    } catch (err) {
      setError('Could not get feedback. Please try again.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  const renderFeedbackHighlights = () => {
    if (!feedback?.weakSentence || !answer) return <p className="text-slate-700 text-sm leading-relaxed">{answer}</p>;

    const parts = answer.split(feedback.weakSentence);
    if (parts.length === 1) return <p className="text-slate-700 text-sm leading-relaxed">{answer}</p>;

    return (
      <p className="text-slate-700 text-sm leading-relaxed">
        {parts[0]}
        <mark className="bg-red-100 text-red-900 px-1 rounded border-b-2 border-red-300 font-medium cursor-help" title="Weak point identified by AI">
          {feedback.weakSentence}
        </mark>
        {parts[1]}
      </p>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="material-paper p-8 sm:p-12 shadow-2xl bg-white ring-1 ring-slate-100 relative overflow-hidden">
        {/* Progress Background Accent */}
        <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/10" />

        <div className="flex justify-between items-start mb-6">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em]">Question {index + 1} of 3</span>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
            <span className={wordCount > 50 ? 'text-blue-600' : ''}>{wordCount} words</span>
          </div>
        </div>

        <h3 className="text-3xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight">
          {question.question}
        </h3>
        
        <div className="space-y-6">
          <div className="relative">
            <label htmlFor={`answer-input-${index}`} className="block text-sm font-semibold text-slate-700 mb-2">Prepare your response:</label>
            <textarea
              id={`answer-input-${index}`}
              rows={6}
              className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-700 bg-slate-50/50 text-lg leading-relaxed placeholder:text-slate-300 placeholder:font-light mb-2"
              placeholder="Start typing your answer here..."
              value={answer}
              onChange={(e) => {
                onAnswerChange(e.target.value);
                if (feedback) setFeedback(null);
              }}
            />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <button
                onClick={handleGetFeedback}
                disabled={loadingFeedback || !answer.trim()}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg"
              >
                {loadingFeedback ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing Honestly...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
                    Get Brutal Feedback
                  </>
                )}
              </button>

              {error && <span className="text-red-500 text-xs font-medium bg-red-50 px-3 py-1 rounded-full border border-red-100">{error}</span>}
            </div>
          </div>

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                {/* Highlighted Answer View */}
                {feedback.weakSentence && (
                  <div className="bg-slate-50 border border-slate-100 p-6 rounded-xl">
                    <div className="flex items-center gap-2 mb-3 text-slate-500">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-bold text-[10px] uppercase tracking-widest">Analysis Preview</span>
                    </div>
                    {renderFeedbackHighlights()}
                  </div>
                )}

                {/* Observations */}
                <div className="bg-red-50 border border-red-100 p-6 rounded-xl">
                  <div className="flex items-center gap-2 mb-3 text-red-700">
                    <ListChecks className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-wider">The Critique</span>
                  </div>
                  <p className="text-slate-700 text-sm font-medium leading-relaxed">
                    {feedback.observations}
                  </p>
                </div>

                {/* Pro Tip */}
                <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl">
                  <div className="flex items-center gap-2 mb-3 text-emerald-700">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-wider">Pro-Tip for Success</span>
                  </div>
                  <p className="text-slate-800 text-sm leading-relaxed">
                    {feedback.improvementTip}
                  </p>
                </div>

                {/* Follow-up Question */}
                <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl">
                  <div className="flex items-center gap-2 mb-3 text-amber-700">
                    <MessageSquare className="w-5 h-5" />
                    <span className="font-bold text-sm uppercase tracking-wider">Difficult Follow-up</span>
                  </div>
                  <p className="text-slate-900 font-bold text-md leading-relaxed">
                    "{feedback.followUp}"
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
            {/* rationale card */}
            {!hideGuidance && (
              <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 flex gap-4">
                <div className="text-blue-500 flex-shrink-0">
                  <Sparkles className="w-5 h-5 mt-1" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-700/70 mb-1">Why this matters</span>
                  <p className="text-slate-600 text-sm leading-relaxed italic">
                    "{question.rationale}"
                  </p>
                </div>
              </div>
            )}

            {/* Hint Section */}
            {!hideGuidance && (
              <div className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                <button 
                  onClick={() => setShowHint(!showHint)}
                  className="w-full p-4 flex items-center justify-between text-slate-500 hover:bg-slate-50 transition-colors"
                  id="hint-toggle-button"
                >
                  <div className="flex items-center gap-2">
                    <Lightbulb className={`w-4 h-4 ${showHint ? 'text-amber-500' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold uppercase tracking-widest">Mastery Framework</span>
                  </div>
                  {showHint ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                
                <AnimatePresence>
                  {showHint && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 pt-0 border-t border-slate-50">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                            {question.framework}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
