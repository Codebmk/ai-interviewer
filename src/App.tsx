import { useState, FormEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Loader2, Sparkles, AlertCircle, Briefcase, ChevronRight, X, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { generateInterviewQuestions, InterviewQuestion } from './services/aiService';

const LOADING_MESSAGES = [
  "Analysing the role…",
  "Thinking like a hiring manager…",
  "Crafting your questions…"
];

export default function App() {
  const [jobTitle, setJobTitle] = useState('');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);

  // Cycle loading messages
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;

    setLoading(true);
    setError(null);
    setQuestions([]);
    setIsModalOpen(true);
    setCurrentIdx(0);
    setAnswers(['', '', '']);

    try {
      const results = await generateInterviewQuestions(jobTitle);
      setQuestions(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* SEO Friendly Header */}
      <header className="text-center mb-12">
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
          Interview Warmup Buddy
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Practice for your dream role with interactive, AI-generated interview simulations.
        </p>
      </header>

      <main>
        {/* Search Section */}
        <section className="material-paper p-6 sm:p-8" id="search-section">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="e.g. Customer Success Manager"
                className="material-input pl-12"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                disabled={loading}
                id="job-title-input"
                aria-label="Job title"
              />
            </div>
            <button
              type="submit"
              className="material-button sm:w-auto w-full"
              disabled={loading || !jobTitle.trim()}
              id="generate-button"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Start Interview Prep
            </button>
          </form>
          <p className="mt-4 text-sm text-slate-400">
            Common roles: <button onClick={() => setJobTitle('Customer Success Manager')} className="text-blue-500 hover:underline">Customer Success Manager</button>, 
            <button onClick={() => setJobTitle('Product Manager')} className="text-blue-500 hover:underline mx-1">Product Manager</button>
          </p>
        </section>

        {/* Global Loading / Results Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-white flex flex-col"
              id="fullscreen-modal"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-900 leading-none">{jobTitle} Interview</h2>
                    <p className="text-xs text-slate-400 mt-1">AI Session Activity</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                  aria-label="Exit prep"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto bg-slate-50/50 flex flex-col items-center justify-center p-6">
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
                        className="material-paper p-8 text-center max-w-md mx-auto border-red-100"
                      >
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Something went wrong</h3>
                        <p className="text-slate-600 mb-6">{error}</p>
                        <button onClick={() => setIsModalOpen(false)} className="material-button w-full">
                          Return to Home
                        </button>
                      </motion.div>
                    ) : questions.length > 0 ? (
                      <motion.div
                        key={`question-${currentIdx}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                      >
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

                        {/* Interactive Question Card */}
                        <div className="material-paper p-8 sm:p-12 shadow-2xl bg-white ring-1 ring-slate-100">
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-[0.2em] mb-4 block">Question {currentIdx + 1} of 3</span>
                          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-8 leading-tight tracking-tight">
                            {questions[currentIdx].question}
                          </h3>
                          
                          <div className="space-y-6">
                            <div>
                              <label htmlFor="answer-input" className="block text-sm font-semibold text-slate-700 mb-2">Prepare your response:</label>
                              <textarea
                                id="answer-input"
                                rows={6}
                                className="w-full px-5 py-4 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-slate-700 bg-slate-50/50 text-lg leading-relaxed placeholder:text-slate-300 placeholder:font-light"
                                placeholder="Type your answer here to refine your thoughts..."
                                value={answers[currentIdx]}
                                onChange={(e) => {
                                  const newAnswers = [...answers];
                                  newAnswers[currentIdx] = e.target.value;
                                  setAnswers(newAnswers);
                                }}
                              />
                            </div>

                            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 flex gap-4">
                              <div className="text-blue-500 flex-shrink-0">
                                <Sparkles className="w-5 h-5 mt-1" />
                              </div>
                              <div>
                                <span className="block text-xs font-bold uppercase tracking-wider text-blue-700/70 mb-1">Coach Note</span>
                                <p className="text-slate-600 text-sm leading-relaxed italic">
                                  "{questions[currentIdx].rationale}"
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="flex justify-between items-center pt-8">
                          <button
                            onClick={handlePrev}
                            disabled={currentIdx === 0}
                            className="flex items-center gap-2 px-6 py-3 text-slate-500 font-medium hover:text-slate-900 transition-colors disabled:opacity-0"
                          >
                            <ChevronLeft className="w-5 h-5" />
                            Previous
                          </button>
                          
                          {currentIdx === questions.length - 1 ? (
                              <button
                                onClick={() => setIsModalOpen(false)}
                                className="material-button px-10 py-4 shadow-blue-200/50"
                              >
                                Finish Prep
                                <CheckCircle2 className="w-5 h-5" />
                              </button>
                            ) : (
                              <button
                                onClick={handleNext}
                                className="material-button px-10 py-4 shadow-blue-200/50 group"
                              >
                                Next Question
                                <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                              </button>
                            )
                          }
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-16 text-center text-slate-400 text-sm">
        <p>&copy; 2026 Interviewer AI. High-performance interview preparation metrics.</p>
      </footer>
    </div>
  );
}

