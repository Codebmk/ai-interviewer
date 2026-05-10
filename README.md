# AI Professional Interview Sandbox

A high-performance, AI-driven interview preparation platform designed to help candidates master their behavioral and technical interview skills through progressive difficulty rounds and behavioral psychological feedback.

## 🚀 The User Journey

1. **Role Selection**: Enter any job title (e.g., "Senior Product Manager", "Staff Software Engineer").
2. **Round 1 (Warmup)**: Answer 3 standard interview questions tailored to the role. Get real-time "Brutal Feedback" on any answer.
3. **Analytics & Decision**: Review your performance with an AI-generated **Interview Readiness Report**. Decide to practice Round 1 again or advance.
4. **Round 2 (Deep Dive)**: Face 2 challenging follow-up questions generated specifically from your Round 1 answers, targeting your two weakest dimensions.
5. **Round 3 (The Curveball)**: One high-stakes unexpected question with no hints, frameworks, or guidance—simulating the pressure of a real interview.
6. **Final Mastery**: Review your cumulative score, sharing your "Exceptionally Prepared" status with a screenshot-ready headline statement.

## 🧠 Core Features

- **Progressive Difficulty**: Three distinct rounds that evolve based on user performance.
- **Brutal Feedback & Mastery Frameworks**: Real-time analysis of answers with "Mastery Frameworks" (STAR method and more) provided for guidance.
- **Readiness Report**: A 5-dimension scoring system (Clarity, Specificity, Structure, Ownership, Conciseness) with historical deltas.
- **Dynamic Content Generation**: Questions and feedback are contextually aware of both the role and the specific user responses.

## 📂 Project Structure

```text
src/
├── components/          # Reusable UI Components
│   ├── InterviewModal.tsx   # Core interview flow & state management
│   ├── QuestionCard.tsx     # Specialized question & feedback interface
│   ├── SummaryView.tsx      # Multi-round feedback & Readiness Report
│   └── ...
├── services/            # Backend Integrations
│   └── aiService.ts         # Gemini AI API wrapper & prompt engineering
├── App.tsx              # Main entry point & landing page
└── main.tsx             # Vite bootstrap
```

## 🛠️ Technology Stack

- **React 18** & **Vite**
- **Tailwind CSS** for polished, responsive UI
- **Motion (framer-motion)** for smooth layout transitions
- **Lucide React** for consistent iconography
- **Google Gemini API** (via `@google/genai`) for advanced logic and analysis

## ⚙️ Installation & Development

### Prerequisites
- Node.js (Latest LTS recommended)
- Gemini API Key

### Setup
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment:
   Create a `.env` file and add:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🛡️ Design Principles

- **Architectural Honesty**: No fake loading bars; real AI processing with informative status updates.
- **Typography & Rhythm**: Intentional font pairings using Inter and specialized weights for technical weight.
- **Focus Mode**: Clean, distraction-free interview interface that mimics high-stakes environments.
