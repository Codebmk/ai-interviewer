import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Loader2, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { InterviewQuestion } from '../services/aiService';
import { QuestionCard } from './QuestionCard';

const LOADING_MESSAGES = [
  "Analysing the role…",
  "Thinking like a hiring manager…",
  "Crafting your questions…"
];

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  loadingStep: number;
  error: string | null;
  questions: InterviewQuestion[];
  currentIdx: number;
  onNext: () => void;
  onPrev: () => void;
  answers: string[];
  setAnswers: (answers: string[]) => void;
  jobTitle: string;
}

export const InterviewModal = ({
  isOpen,
  onClose,
  loading,
  loadingStep,
  error,
  questions,
  currentIdx,
  onNext,
  onPrev,
  answers,
  setAnswers,
  jobTitle
}: InterviewModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-white flex flex-col font-sans"
          id="fullscreen-modal"
        >
          {/* Modal Header - Only Close Button on Right */}
          <div className="px-6 py-4 flex justify-end bg-white">
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              aria-label="Exit prep"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50">
            <div className="min-h-full flex flex-col items-center justify-center p-6 sm:p-12">
              <div className="w-full max-w-3xl py-8">
                <AnimatePresence mode="wait">
                {loading ? (
                  <motion.div
                    key="loading-state"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center"
                  >
                    <div className="mb-8 relative flex justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="w-24 h-24 rounded-full border-4 border-slate-200 border-t-blue-600"
                      />
                      <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-600" />
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={loadingStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-2xl font-medium text-slate-800"
                      >
                        {LOADING_MESSAGES[loadingStep]}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-slate-400 mt-2">Setting up your professional sandbox...</p>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error-state"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="material-paper p-8 text-center max-w-md mx-auto border-red-100 bg-white"
                  >
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h3>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <button onClick={onClose} className="material-button w-full">
                      Return to Home
                    </button>
                  </motion.div>
                ) : questions.length > 0 ? (
                  <div className="space-y-8">
                    {/* Progress Stepper */}
                    <div className="flex justify-between items-center mb-12">
                      {questions.map((_, i) => (
                        <div key={i} className="flex flex-1 items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                            i <= currentIdx ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-200 text-slate-400'
                          }`}>
                            {i < currentIdx ? <CheckCircle2 className="w-6 h-6" /> : i + 1}
                          </div>
                          {i < questions.length - 1 && (
                            <div className={`flex-1 h-1 mx-2 rounded ${i < currentIdx ? 'bg-blue-600' : 'bg-slate-200'}`} />
                          )}
                        </div>
                      ))}
                    </div>

                    <QuestionCard 
                      question={questions[currentIdx]} 
                      index={currentIdx} 
                      answer={answers[currentIdx]}
                      onAnswerChange={(val) => {
                        const newAnswers = [...answers];
                        newAnswers[currentIdx] = val;
                        setAnswers(newAnswers);
                      }}
                    />

                    {/* Navigation Footer */}
                    <div className="flex justify-between items-center pt-8">
                      <button
                        onClick={onPrev}
                        disabled={currentIdx === 0}
                        className="flex items-center gap-2 px-6 py-3 text-slate-500 font-medium hover:text-slate-900 transition-colors disabled:opacity-0"
                      >
                        <ChevronLeft className="w-5 h-5" />
                        Previous
                      </button>
                      
                      {currentIdx === questions.length - 1 ? (
                        <button
                          onClick={onClose}
                          className="material-button px-10 py-4 shadow-blue-200/50"
                        >
                          Finish Prep
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={onNext}
                          className="material-button px-10 py-4 shadow-blue-200/50 group"
                        >
                          Next Question
                          <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};
