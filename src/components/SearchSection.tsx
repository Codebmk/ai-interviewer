import { FormEvent, useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Loader2, ArrowUp, Search } from 'lucide-react';
import rolesData from '../data/roles.json';

const SUGGESTIONS = rolesData.tech;

interface SearchSectionProps {
  jobTitle: string;
  setJobTitle: (title: string) => void;
  handleSubmit: (e: FormEvent | null) => void;
  loading: boolean;
}

export const SearchSection = ({ jobTitle, setJobTitle, handleSubmit, loading }: SearchSectionProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredSuggestions = useMemo(() => {
    if (!jobTitle.trim() || jobTitle.length < 2) return [];
    return SUGGESTIONS.filter(s => 
      s.toLowerCase().includes(jobTitle.toLowerCase()) && 
      s.toLowerCase() !== jobTitle.toLowerCase()
    ).slice(0, 5);
  }, [jobTitle]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (suggestion: string) => {
    setJobTitle(suggestion);
    setShowSuggestions(false);
    // Use setTimeout to ensure state is updated before submit
    setTimeout(() => {
      const fakeEvent = { preventDefault: () => {} } as FormEvent;
      handleSubmit(fakeEvent);
    }, 0);
  };

  return (
    <section id="search-section" className="max-w-2xl mx-auto relative" ref={containerRef}>
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-center">
          <Briefcase className="absolute left-6 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search roles (e.g. Data Scientist)"
            className="w-full pl-14 pr-16 py-5 rounded-full bg-white border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-lg shadow-sm group-hover:shadow-md"
            value={jobTitle}
            onChange={(e) => {
              setJobTitle(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            disabled={loading}
            id="job-title-input"
            aria-label="Job title"
            autoComplete="off"
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

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {showSuggestions && filteredSuggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-20 w-full mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSelect(suggestion)}
                className="w-full px-6 py-4 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-50 last:border-b-0"
              >
                <Search className="w-4 h-4 text-slate-400" />
                <span className="text-slate-700 font-medium">{suggestion}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-6 text-sm text-slate-400 text-center">
        Try these: 
        <button type="button" onClick={() => handleSelect('Software Engineer')} className="text-blue-500 hover:underline px-1">Software Engineer</button>, 
        <button type="button" onClick={() => handleSelect('Data Scientist')} className="text-blue-500 hover:underline px-1">Data Scientist</button>
      </p>
    </section>
  );
};
