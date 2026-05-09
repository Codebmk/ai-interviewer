import { FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Loader2, ArrowUp } from 'lucide-react';

interface SearchSectionProps {
  jobTitle: string;
  setJobTitle: (title: string) => void;
  handleSubmit: (e: FormEvent) => void;
  loading: boolean;
}

export const SearchSection = ({ jobTitle, setJobTitle, handleSubmit, loading }: SearchSectionProps) => {
  return (
    <section id="search-section" className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center">
          <Briefcase className="absolute left-6 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Job title (e.g. Customer Success Manager)"
            className="w-full pl-14 pr-16 py-5 rounded-full bg-white border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-lg shadow-sm group-hover:shadow-md"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            disabled={loading}
            id="job-title-input"
            aria-label="Job title"
          />
          <AnimatePresence>
            {jobTitle.length >= 3 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8, x: 10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 10 }}
                type="submit"
                disabled={loading}
                className="absolute right-3 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg disabled:bg-slate-300"
                id="generate-button"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <ArrowUp className="w-6 h-6" />
                )}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </form>
      <p className="mt-6 text-sm text-slate-400 text-center">
        Common roles: 
        <button onClick={() => setJobTitle('Customer Success Manager')} className="text-blue-500 hover:underline px-1">Customer Success Manager</button>, 
        <button onClick={() => setJobTitle('Product Manager')} className="text-blue-500 hover:underline px-1">Product Manager</button>
      </p>
    </section>
  );
};
