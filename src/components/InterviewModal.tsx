import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Clock, Loader2, RotateCcw, Target, Zap, ArrowRight, PlusCircle, Brain, Code } from 'lucide-react';
import { InterviewQuestion, SessionFeedback, getSessionFeedback, generateFollowUpQuestions, generateCurveballQuestion, generateInterviewQuestions, InterviewType } from '../services/aiService';
import { QuestionCard } from './QuestionCard';
import { SummaryView } from './SummaryView';

const LOADING_MESSAGES = [
  "Analysing the role…",
  "Thinking like a hiring manager…",
  "Crafting your questions…"
];

const ROUND_INFO = {
  1: { name: "Round 1: Standard Questions", color: "text-blue-600", bg: "bg-blue-50" },
  2: { name: "Round 2: Deep Dive", color: "text-indigo-600", bg: "bg-indigo-50" },
  3: { name: "The Curveball Round", color: "text-rose-600", bg: "bg-rose-50" }
};

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  loadingStep: number;
  error: string | null;
  questions: InterviewQuestion[];
  setQuestions: (questions: InterviewQuestion[]) => void;
  currentIdx: number;
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  answers: string[];
  setAnswers: (answers: string[]) => void;
  jobTitle: string;
  onStartGeneration: (type: InterviewType) => void;
  interviewType: InterviewType | null;
}

export const InterviewModal = ({
  isOpen,
  onClose,
  loading,
  loadingStep,
  error,
  questions,
  setQuestions,
  currentIdx,
  onNext,
  onPrev,
  onReset,
  answers,
  setAnswers,
  jobTitle,
  onStartGeneration,
  interviewType
}: InterviewModalProps) => {
  const [sessionTime, setSessionTime] = useState(0);
  const [selectedType, setSelectedType] = useState<InterviewType | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionFeedback, setSessionFeedback] = useState<SessionFeedback | null>(null);
  const [roundScores, setRoundScores] = useState<Record<number, SessionFeedback['scores']>>({});
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingRoundMessage, setLoadingRoundMessage] = useState<string | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [roundQuestions, setRoundQuestions] = useState<InterviewQuestion[]>([]);
  const [roundAnswers, setRoundAnswers] = useState<string[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsFinished(false);
      setSessionFeedback(null);
      setSessionTime(0);
      setCurrentRound(1);
      setLoadingRoundMessage(null);
      setRoundScores({});
      setSelectedType(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (questions.length > 0 && currentRound === 1) {
      // Initialize Round 1 state from parent
      setRoundQuestions(questions);
      setRoundAnswers(answers);
    }
  }, [questions, answers, currentRound]);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentIdx, isFinished]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isOpen && !loading && !loadingSummary && !isFinished && questions.length > 0) {
      interval = setInterval(() => {
        setSessionTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, loading, loadingSummary, isFinished, questions.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinishRound = async () => {
    setLoadingSummary(true);
    setLoadingRoundMessage(`Analyzing Round ${currentRound} and preparing your feedback...`);
    try {
      const currentSessionData = roundQuestions.map((q, i) => ({
        question: q.question,
        answer: roundAnswers[i]
      }));
      const feedback = await getSessionFeedback(jobTitle, interviewType!, currentSessionData, currentRound);
      setSessionFeedback(feedback);
      setRoundScores(prev => ({ ...prev, [currentRound]: feedback.scores }));
      setIsFinished(true);
    } catch (err) {
      console.error(err);
      setIsFinished(true);
    } finally {
      setLoadingSummary(false);
      setLoadingRoundMessage(null);
    }
  };

  const handleRetryRound = async () => {
    setLoadingSummary(true);
    setLoadingRoundMessage(`Restarting Round ${currentRound} with fresh challenges...`);
    try {
      if (currentRound === 1) {
        const newQuestions = await generateInterviewQuestions(jobTitle, interviewType!);
        setQuestions(newQuestions);
        setRoundQuestions(newQuestions);
        setAnswers(newQuestions.map(() => ''));
        setRoundAnswers(newQuestions.map(() => ''));
        setRoundScores({}); // Clear scores for fresh Round 1
      } else if (currentRound === 2) {
        // Round 2 retry: Use previous dimension feedback if available
        const sessionData = roundQuestions.map((q, i) => ({ question: q.question, answer: roundAnswers[i] }));
        const followUps = await generateFollowUpQuestions(jobTitle, interviewType!, sessionData, sessionFeedback?.weakestDimensions || ["General Effectiveness"]);
        setRoundQuestions(followUps);
        setRoundAnswers(followUps.map(() => ''));
      } else {
        const curveball = await generateCurveballQuestion(jobTitle, interviewType!);
        setRoundQuestions([curveball]);
        setRoundAnswers(['']);
      }
      setIsFinished(false);
      setSessionFeedback(null);
      onReset(); // Reset parent index to 0
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSummary(false);
      setLoadingRoundMessage(null);
    }
  };

  const handleContinueToNextRound = async () => {
    setLoadingSummary(true);
    const nextRound = currentRound + 1;
    setLoadingRoundMessage(`Moving to Round ${nextRound}...`);
    try {
      const sessionData = roundQuestions.map((q, i) => ({ question: q.question, answer: roundAnswers[i] }));
      if (nextRound === 2) {
        const followUps = await generateFollowUpQuestions(jobTitle, interviewType!, sessionData, sessionFeedback?.weakestDimensions || ["Communication"]);
        setRoundQuestions(followUps);
        setRoundAnswers(followUps.map(() => ''));
      } else if (nextRound === 3) {
        const curveball = await generateCurveballQuestion(jobTitle, interviewType!);
        setRoundQuestions([curveball]);
        setRoundAnswers(['']);
      }
      setCurrentRound(nextRound);
      setIsFinished(false);
      setSessionFeedback(null);
      onReset(); // Reset parent index to 0
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSummary(false);
      setLoadingRoundMessage(null);
    }
  };

  const handleRestartPractice = async () => {
    setLoadingSummary(true);
    setLoadingRoundMessage("Going back to Round 1 for more practice...");
    try {
      const newQuestions = await generateInterviewQuestions(jobTitle, interviewType!);
      setQuestions(newQuestions);
      setRoundQuestions(newQuestions);
      setAnswers(newQuestions.map(() => ''));
      setRoundAnswers(newQuestions.map(() => ''));
      setRoundScores({});
      setCurrentRound(1);
      setIsFinished(false);
      setSessionFeedback(null);
      onReset();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSummary(false);
      setLoadingRoundMessage(null);
    }
  };

  const isCurrentAnswerEmpty = !roundAnswers[currentIdx]?.trim();

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
            <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-slate-900"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {interviewType && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 leading-none mb-1">
                    {interviewType} Interview
                  </span>
                  <span className="text-sm font-bold text-slate-900 leading-none truncate max-w-[200px]">
                    {jobTitle}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-slate-400 font-mono text-sm bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <Clock className="w-4 h-4" />
              <span>{formatTime(sessionTime)}</span>
              {isFinished && <span className="ml-2 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold uppercase">Final Time</span>}
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50" ref={scrollContainerRef}>
            <div className="min-h-full flex flex-col items-center pt-8 pb-12 px-6">
              <div className="w-full max-w-4xl">
                <AnimatePresence mode="wait">
                {loading || loadingSummary ? (
                  <motion.div
                    key="loading-state"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="text-center py-20"
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
                        key={loadingSummary ? 'finishing' : loadingStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-2xl font-medium text-slate-800"
                      >
                        {loadingSummary ? (loadingRoundMessage || "Generating your session insights...") : LOADING_MESSAGES[loadingStep]}
                      </motion.p>
                    </AnimatePresence>
                    <p className="text-slate-400 mt-2">
                      {loadingSummary ? "Just a few more seconds to refine your performance data." : "Setting up your professional sandbox..."}
                    </p>
                  </motion.div>
                ) : !interviewType ? (
                  <motion.div
                    key="type-selection"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-3xl mx-auto py-12 space-y-12"
                  >
                    <div className="text-center space-y-4">
                      <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                        Choose your focus
                      </h2>
                      <p className="text-slate-500 text-lg max-w-lg mx-auto">
                        We'll tailor the questions and feedback based on the interview format you want to practice.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <button
                        onClick={() => setSelectedType('Behavioural')}
                        className={`flex flex-col items-center p-10 border-2 rounded-[2.5rem] transition-all group text-center space-y-6 ${
                          selectedType === 'Behavioural' 
                            ? 'border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-500/10' 
                            : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${
                          selectedType === 'Behavioural' ? 'bg-blue-600 text-white translate-y-[-4px]' : 'bg-slate-50 text-slate-400 group-hover:scale-110'
                        }`}>
                          <Brain className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                          <span className={`block text-xl font-black ${selectedType === 'Behavioural' ? 'text-blue-900' : 'text-slate-900'}`}>
                            Behavioural Interview
                          </span>
                          <span className="block text-sm text-slate-500 leading-relaxed">
                            Past experiences, soft skills, and situational judgment.
                          </span>
                        </div>
                      </button>

                      <button
                        onClick={() => setSelectedType('Technical')}
                        className={`flex flex-col items-center p-10 border-2 rounded-[2.5rem] transition-all group text-center space-y-6 ${
                          selectedType === 'Technical' 
                            ? 'border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-500/10' 
                            : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-lg'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${
                          selectedType === 'Technical' ? 'bg-blue-600 text-white translate-y-[-4px]' : 'bg-slate-50 text-slate-400 group-hover:scale-110'
                        }`}>
                          <Code className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                          <span className={`block text-xl font-black ${selectedType === 'Technical' ? 'text-blue-900' : 'text-slate-900'}`}>
                            Technical Interview
                          </span>
                          <span className="block text-sm text-slate-500 leading-relaxed">
                            Concepts, problem solving, and domain knowledge.
                          </span>
                        </div>
                      </button>
                    </div>

                    <div className="flex flex-col items-center gap-6 pt-4">
                      <button
                        onClick={() => selectedType && onStartGeneration(selectedType)}
                        disabled={!selectedType}
                        className="material-button px-16 py-5 text-lg shadow-xl shadow-blue-500/20 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed"
                      >
                        Start Round 1 Practice
                        <ArrowRight className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 font-bold text-sm uppercase tracking-widest"
                      >
                        Change Role Target
                      </button>
                    </div>
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
                ) : isFinished ? (
                  <SummaryView 
                    questions={roundQuestions}
                    answers={roundAnswers}
                    feedback={sessionFeedback}
                    previousFeedback={currentRound > 1 ? roundScores[currentRound - 1] : undefined}
                    onRetryRound={handleRetryRound}
                    onRestartPractice={handleRestartPractice}
                    onContinue={handleContinueToNextRound}
                    onNewRole={onClose}
                    jobTitle={jobTitle}
                    currentRound={currentRound}
                  />
                ) : roundQuestions.length > 0 ? (
                  <div className="space-y-8">
                    {/* Round Indicator */}
                    {!isFinished && (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-100 shadow-sm ${ROUND_INFO[currentRound as keyof typeof ROUND_INFO].bg}`}
                      >
                        <div className={`w-2 h-2 rounded-full animate-pulse ${ROUND_INFO[currentRound as keyof typeof ROUND_INFO].color.replace('text', 'bg')}`} />
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${ROUND_INFO[currentRound as keyof typeof ROUND_INFO].color}`}>
                          {ROUND_INFO[currentRound as keyof typeof ROUND_INFO].name}
                        </span>
                      </motion.div>
                    )}

                    <QuestionCard 
                      question={roundQuestions[currentIdx]} 
                      index={currentIdx} 
                      totalQuestions={roundQuestions.length}
                      answer={roundAnswers[currentIdx]}
                      onAnswerChange={(val) => {
                        const newAnswers = [...roundAnswers];
                        newAnswers[currentIdx] = val;
                        setRoundAnswers(newAnswers);
                      }}
                      hideGuidance={currentRound === 3}
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
                      
                      {currentIdx === roundQuestions.length - 1 ? (
                        <button
                          onClick={handleFinishRound}
                          disabled={isCurrentAnswerEmpty || loadingSummary}
                          className="material-button px-10 py-4 shadow-blue-200/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:grayscale"
                        >
                          {loadingSummary ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              Finish Round {currentRound}
                              <CheckCircle2 className="w-5 h-5" />
                            </>
                          )}
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
