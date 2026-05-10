import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
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
  const [sessionTime, setSessionTime] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentIdx]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && !loading && questions.length > 0) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, loading, questions.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isCurrentAnswerEmpty = !answers[currentIdx]?.trim();

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
          {/* Modal Header */}
          <div className="px-6 py-4 flex justify-between items-center bg-white border-b border-slate-50">
            <div className="flex items-center gap-2 text-slate-400 font-mono text-sm bg-slate-50 px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4" />
              <span>{formatTime(sessionTime)}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
              aria-label="Exit prep"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50" ref={scrollContainerRef}>
            <div className="min-h-full flex flex-col items-center pt-8 pb-12 px-6">
              <div className="w-full max-w-3xl">
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
                          disabled={isCurrentAnswerEmpty}
                          className="material-button px-10 py-4 shadow-blue-200/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                        >
                          Finish Prep
                          <CheckCircle2 className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={onNext}
                          disabled={isCurrentAnswerEmpty}
                          className="material-button px-10 py-4 shadow-blue-200/50 group disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
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
