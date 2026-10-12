import { AssistantMode } from '../types';

export const ASSISTANT_MODES: Record<string, AssistantMode> = {
  general: {
    id: 'general',
    name: 'General Assistant',
    tagline: 'Everyday inquiries & deep explanations',
    description: 'Versatile, objective, and clear answers across all domains of science, life, and curiosity.',
    icon: 'Sparkles',
    color: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    starterPrompts: [
      {
        title: 'Learn Something',
        description: 'Demystify quantum computing in plain English',
        prompt: 'Explain the core principles of quantum computing to a high schooler, using relatable analogies.',
      },
      {
        title: 'Analyze Ideas',
        description: 'Examine pros & cons of microservices vs monolith',
        prompt: 'Compare microservice architecture vs monolithic architecture. What are the concrete trade-offs in team speed, cost, and complexity?',
      },
      {
        title: 'Deep Dive',
        description: 'How James Webb Space Telescope sees deep time',
        prompt: 'How does the James Webb Space Telescope capture light from the early universe, and why does infrared matter?',
      },
      {
        title: 'Decision Framework',
        description: 'First-principles mental models for hard choices',
        prompt: 'Teach me the top 3 first-principles mental models for making high-stakes decisions under uncertainty.',
      },
    ],
  },
  coding: {
    id: 'coding',
    name: 'Coding Assistant',
    tagline: 'Senior software engineering & debugging mentor',
    description: 'Production-grade code generation, architecture advice, algorithmic problem-solving, and error triage.',
    icon: 'Code2',
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    starterPrompts: [
      {
        title: 'Build Software',
        description: 'Write a robust debounce & throttle TypeScript hook',
        prompt: 'Write a production-ready React hook in TypeScript for debouncing and throttling asynchronous API requests, with unit test examples.',
      },
      {
        title: 'Debug & Optimize',
        description: 'Diagnose memory leaks in Node.js event listeners',
        prompt: 'How do you detect and fix memory leaks caused by lingering event listeners or closures in a long-running Node.js service?',
      },
      {
        title: 'System Design',
        description: 'Architect a real-time collaborative whiteboard',
        prompt: 'Design a scalable real-time collaborative canvas architecture using WebSockets and conflict-free replicated data types (CRDTs).',
      },
      {
        title: 'Refactor Code',
        description: 'Modernize legacy async callbacks to clean promises',
        prompt: 'Provide best practices and examples for refactoring deeply nested callback-based asynchronous flows into clean async/await patterns with error boundaries.',
      },
    ],
  },
  writing: {
    id: 'writing',
    name: 'Writing Assistant',
    tagline: 'World-class editor, ghostwriter & copy strategist',
    description: 'High-impact emails, executive summaries, thought-leadership essays, proposals, and voice polish.',
    icon: 'PenTool',
    color: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    starterPrompts: [
      {
        title: 'Write Content',
        description: 'Draft a high-converting product launch email',
        prompt: 'Draft an executive announcement email introducing NEXUS AI to an enterprise engineering team, highlighting speed and security.',
      },
      {
        title: 'Executive Pitch',
        description: 'Condense a 10-page proposal into a 1-page memo',
        prompt: 'Give me a template and guidelines for summarizing an intricate technical initiative into an Amazon-style 1-page executive memo.',
      },
      {
        title: 'Tone Shift',
        description: 'Transform blunt feedback into constructive diplomacy',
        prompt: 'Rewrite this blunt feedback into diplomatic, constructive, and empowering language: "Your timeline estimate is completely unrealistic and misses half the scope."',
      },
      {
        title: 'Persuasive Op-Ed',
        description: 'Draft an insightful commentary on human-AI synergy',
        prompt: 'Write a captivating 400-word opening for an op-ed about how AI elevates human craft rather than replacing human judgment.',
      },
    ],
  },
  study: {
    id: 'study',
    name: 'Study Assistant',
    tagline: 'Feynman technique tutor & revision coach',
    description: 'Beginner-friendly step-by-step lessons, vivid analogies, structured study guides, and test quizzes.',
    icon: 'GraduationCap',
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    starterPrompts: [
      {
        title: 'Interactive Lesson',
        description: 'Learn Bayesian probability with intuitive visuals',
        prompt: 'Teach me Bayes theorem from scratch using the intuition of medical test results, step-by-step, with a mini quiz at the end.',
      },
      {
        title: 'Feynman Breakdown',
        description: 'Explain General Relativity without jargon',
        prompt: 'Explain Einsteins General Relativity using the Feynman technique so an eight-year-old can explain it to a friend.',
      },
      {
        title: 'Active Recall Quiz',
        description: 'Test my knowledge on machine learning fundamentals',
        prompt: 'Give me a 5-question multiple choice diagnostic quiz on neural network backpropagation, including explanations for each choice.',
      },
      {
        title: 'Study Roadmap',
        description: '4-week syllabus to master distributed systems',
        prompt: 'Create a focused 4-week self-study curriculum to master distributed systems concepts: CAP theorem, Paxos/Raft, replication, and partitioning.',
      },
    ],
  },
  creative: {
    id: 'creative',
    name: 'Creative Assistant',
    tagline: 'Narrative architect & imaginative brainstorming partner',
    description: 'Captivating stories, cinematic world-building, lateral thinking, poetry, and naming ideas.',
    icon: 'Palette',
    color: 'text-fuchsia-400',
    badgeBg: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
    starterPrompts: [
      {
        title: 'World-Building',
        description: 'Create a sci-fi city powered by bioluminescent flora',
        prompt: 'Help me design a floating city on an oceanic exoplanet that derives all light and power from symbiotic genetically-engineered kelp forests.',
      },
      {
        title: 'Plot Twist',
        description: 'Brainstorm 4 unexpected twists for a mystery novel',
        prompt: 'Give me 4 mind-bending, plausible plot twists for a locked-room mystery where the detective himself is the prime suspect.',
      },
      {
        title: 'Brand Naming',
        description: 'Invent evocative names for a supersonic jet brand',
        prompt: 'Brainstorm 15 evocative, sleek brand names for a zero-emission supersonic aerospace startup, with phonetics and brief rationales.',
      },
      {
        title: 'Interactive Story',
        description: 'Begin a cyberpunk detective thriller choosing paths',
        prompt: 'Start an interactive cyberpunk noir thriller set in Neo-Kyoto in 2099. End the first chapter with three distinct choices for what I do next.',
      },
    ],
  },
};
