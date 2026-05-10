import { useState, FormEvent, useEffect } from 'react';
import { generateInterviewQuestions, InterviewQuestion } from './services/aiService';
import { SearchSection } from './components/SearchSection';
import { InterviewModal } from './components/InterviewModal';

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

  const handleSubmit = async (e?: FormEvent) => {
    e?.preventDefault();
    
    if (!jobTitle.trim()) {
      setError('Please enter a job title to begin your preparation.');
      return;
    }

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

  const handleReset = () => {
    setCurrentIdx(0);
    setAnswers(['', '', '']);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[var(--color-background)]">
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <header className="text-center mb-10 w-full">
          <h1 className="text-5xl sm:text-6xl font-bold text-slate-900 mb-4 tracking-tight">
            Interview Warmup Buddy
          </h1>
          <p className="text-xl text-slate-500 max-w-xl mx-auto font-light">
            Practice for your dream role with interactive, AI-generated interview simulations.
          </p>
        </header>

        <SearchSection 
          jobTitle={jobTitle} 
          setJobTitle={setJobTitle} 
          handleSubmit={handleSubmit} 
          loading={loading} 
        />

        <InterviewModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          loading={loading}
          loadingStep={loadingStep}
          error={error}
          questions={questions}
          currentIdx={currentIdx}
          onNext={handleNext}
          onPrev={handlePrev}
          answers={answers}
          setAnswers={setAnswers}
          onReset={handleReset}
          jobTitle={jobTitle}
        />
      </main>

      <footer className="w-full py-8 text-center text-slate-400 text-sm">
        <p>
          Built with ❤️ by {' '}
          <a 
            href="https://github.com/Codebmk" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline font-medium"
          >
            Codebmk
          </a>
        </p>
      </footer>
    </div>
  );
}


