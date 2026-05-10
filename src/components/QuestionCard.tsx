import { motion } from 'motion/react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { InterviewQuestion } from '../services/aiService';

interface QuestionCardProps {
  question: InterviewQuestion;
  index: number;
  answer: string;
  onAnswerChange: (val: string) => void;
}

export const QuestionCard = ({ question, index, answer, onAnswerChange }: QuestionCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="material-paper p-8 sm:p-12 shadow-2xl bg-white ring-1 ring-slate-100">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em] mb-4 block">Question {index + 1} of 3</span>
        <h3 className="text-3xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight">
          {question.question}
        </h3>
        
        <div className="space-y-6">
          <div className="relative">
            <label htmlFor={`answer-input-${index}`} className="block text-sm font-semibold text-slate-700 mb-2">Prepare your response:</label>
            <textarea
              id={`answer-input-${index}`}
              rows={6}
              className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-700 bg-slate-50/50 text-lg leading-relaxed placeholder:text-slate-300 placeholder:font-light"
              placeholder="Type your answer here to refine your thoughts..."
              value={answer}
              onChange={(e) => onAnswerChange(e.target.value)}
            />
          </div>

          <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 flex gap-4">
            <div className="text-blue-500 flex-shrink-0">
              <Sparkles className="w-5 h-5 mt-1" />
            </div>
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-blue-700/70 mb-1">Coach Note</span>
              <p className="text-slate-600 text-sm leading-relaxed italic">
                "{question.rationale}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
