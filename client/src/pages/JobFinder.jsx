import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Calendar,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  MapPin,
  UserRound,
  X,
} from 'lucide-react'

// ===========================================================================
// JobFinder.jsx - the whole "Job Finder" page in ONE file (React + Tailwind).
//
// Front end only: no API, no .js files. Needs only react, react-dom,
// lucide-react (already in your project) and Tailwind.
// Route:  <Route path="/job-finder" element={<JobFinder />} />
//
// The "WELCOME BACK, JOB FINDER" heading, bell and user chip come from the
// existing fixed <Navbar />, so this file only draws the content below them.
// The whole page scrolls as one: the green banner and the job cards move
// together, nothing in this file is fixed to the screen. "Read More" opens the
// full details over a lightly blurred background.
//
// Sections in this file (top to bottom):
//   1. Page content (data)   2. ProfileSummaryBanner   3. JobCard
//   4. JobDetailsModal       5. Decorations + JobFinder page
// ===========================================================================

// ---------------------------------------------------------------------------
// 1. PAGE CONTENT (plain data, edit freely)
//   profile : shown in the green banner at the top
//   jobs    : one card each. The card shows matchReason + description; "Read More"
//             opens the full details (fullDescription, responsibilities, requirements,
//             skills, salary ...). `applyUrl` is where the Apply button links to.
//   profile.avatarUrl : put an image path here (e.g. '/images/me.jpg'); empty shows a default icon
// ---------------------------------------------------------------------------
const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

const jobFinderData = {
  profile: {
    avatarUrl: '', // put an image path here (e.g. '/images/me.jpg'); empty shows a default icon
    level: 'Fresher',
    experience: '0 Years',
    roles: ['Backend Developer', 'Agent Developer'],
    summary:
      'Tarapada is a highly promising fresher with strong backend development skills, demonstrated through impressive projects utilizing Java, Spring Boot, Node.js, and various databases. They show a particular aptitude for AI/Agent development, having built a RAG service and integrated Gemini AI. Their hackathon achievements and future backend internship further highlight their practical experience and strong potential.',
  },

  jobs: [
    {
      id: 'job-1',
      company: 'QA Roast',
      title: 'Strong Junior Full-Stack JavaScript developer',
      location: 'Remote',
      workType: 'Remote',
      employmentType: 'Full-time',
      experience: '0-2 years',
      salary: '$60k - $80k a year',
      logo: { letter: 'Q', color: '#7b2ff0' },
      matchReason:
        'Directly targets junior developers to build production React and Node.js applications alongside AI/LLM integrations.',
      description:
        "We're expanding our engineering team and looking for developers who are comfortable building production-grade features end to end, from the React front end to the Node.js services behind it.",
      fullDescription:
        "We're expanding our engineering team and looking for developers who are comfortable building production-grade features end to end, from the React front end to the Node.js services behind it. You will pair with senior engineers, ship weekly, and help us add AI/LLM-powered features to our testing products.",
      responsibilities: [
        'Build and maintain React components and Node.js REST APIs',
        'Integrate LLM-powered features into existing product flows',
        'Write unit and integration tests for the code you ship',
        'Take part in code reviews and weekly planning',
      ],
      requirements: [
        'Solid JavaScript fundamentals (ES6+), React and Node.js',
        'Experience with at least one SQL or NoSQL database',
        'A portfolio or projects that show you can finish what you start',
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'REST APIs', 'LLM APIs'],
      postedAt: daysAgo(1),
      applyUrl: 'https://example.com/careers/qa-roast/junior-fullstack',
    },
    {
      id: 'job-2',
      company: 'Capgemini',
      title: 'Full Stack Developer - Node/ React/ AWS',
      location: 'Dallas, TX',
      workType: 'Hybrid',
      employmentType: 'Full-time',
      experience: '0-2 years',
      salary: 'Not disclosed',
      logo: { letter: 'C', color: '#1e90ff' },
      matchReason:
        "Fits the candidate's fullstack background, focusing on building web applications with Node.js and React.js.",
      description:
        "Choosing Capgemini means choosing a company where you will be empowered to shape your career in the way you'd like, supported by a collaborative global community of colleagues.",
      fullDescription:
        "Choosing Capgemini means choosing a company where you will be empowered to shape your career in the way you'd like, supported by a collaborative global community of colleagues. In this role you will design and build cloud-hosted web applications for enterprise clients using Node.js, React and AWS services.",
      responsibilities: [
        'Develop responsive front ends in React and back-end services in Node.js',
        'Deploy and monitor applications on AWS',
        'Work with client teams to turn requirements into working software',
      ],
      requirements: [
        'Hands-on knowledge of React, Node.js and REST design',
        'Familiarity with AWS basics such as S3, Lambda or EC2',
        'Good written and spoken communication',
      ],
      skills: ['Node.js', 'React', 'AWS', 'TypeScript', 'CI/CD'],
      postedAt: daysAgo(2),
      applyUrl: 'https://example.com/careers/capgemini/fullstack-node-react-aws',
    },
    {
      id: 'job-3',
      company: 'Northstar Labs',
      title: 'Backend Engineer (Java / Spring Boot)',
      location: 'Bengaluru, India',
      workType: 'Hybrid',
      employmentType: 'Full-time',
      experience: '0-2 years',
      salary: 'INR 6L - 9L per year',
      logo: { letter: 'N', color: '#ff6b57' },
      matchReason:
        "Matches the candidate's Java and Spring Boot project work and interest in building scalable backend services.",
      description:
        'Join a small platform team that ships REST APIs for logistics customers. You will design endpoints, write tests and help improve reliability across our services.',
      fullDescription:
        'Join a small platform team that ships REST APIs for logistics customers. You will design endpoints, write tests and help improve reliability across our services, with real ownership from your first month.',
      responsibilities: [
        'Design and implement REST APIs with Spring Boot',
        'Model data and write efficient queries in PostgreSQL',
        'Add logging, metrics and alerts to the services you own',
      ],
      requirements: [
        'Good understanding of Java and object-oriented design',
        'Experience with Spring Boot or a similar framework',
        'Comfort with Git and basic Linux tools',
      ],
      skills: ['Java', 'Spring Boot', 'PostgreSQL', 'REST', 'JUnit'],
      postedAt: daysAgo(2),
      applyUrl: 'https://example.com/careers/northstar-labs/backend-engineer',
    },
    {
      id: 'job-4',
      company: 'Brightwave Systems',
      title: 'Junior AI Agent Developer',
      location: 'Remote',
      workType: 'Remote',
      employmentType: 'Full-time',
      experience: '0-1 years',
      salary: '$55k - $75k a year',
      logo: { letter: 'B', color: '#16a34a' },
      matchReason:
        "Aligns with the candidate's RAG service and Gemini AI integration experience for agent-style products.",
      description:
        'Help us build tool-using AI agents that automate support and internal workflows. You will prototype prompts, wire up tools and measure how well the agents actually perform.',
      fullDescription:
        'Help us build tool-using AI agents that automate support and internal workflows. You will prototype prompts, wire up tools and data sources, and measure how well the agents actually perform before they reach customers.',
      responsibilities: [
        'Build agent workflows that call internal and third-party tools',
        'Create retrieval pipelines (RAG) over company documents',
        'Evaluate agent quality and iterate on prompts and tooling',
        'Document designs so others can extend them',
      ],
      requirements: [
        'Experience calling LLM APIs such as Gemini or OpenAI',
        'Python or Node.js proficiency',
        'Curiosity about evaluation, safety and reliability of AI systems',
      ],
      skills: ['LLM APIs', 'RAG', 'Python', 'Node.js', 'Vector databases'],
      postedAt: daysAgo(3),
      applyUrl: 'https://example.com/careers/brightwave/junior-ai-agent-developer',
    },
    {
      id: 'job-5',
      company: 'Kiln Analytics',
      title: 'Node.js API Developer',
      location: 'Pune, India',
      workType: 'Hybrid',
      employmentType: 'Full-time',
      experience: '0-2 years',
      salary: 'INR 5L - 8L per year',
      logo: { letter: 'K', color: '#f59e0b' },
      matchReason:
        "Uses the candidate's Node.js and database experience to build fast APIs that power analytics dashboards.",
      description:
        'We are looking for an API developer to build and optimise the services behind our customer-facing analytics dashboards, working closely with data and front-end engineers.',
      fullDescription:
        'We are looking for an API developer to build and optimise the services behind our customer-facing analytics dashboards. You will work closely with data and front-end engineers to keep responses fast and results accurate.',
      responsibilities: [
        'Build Node.js and Express APIs that serve aggregated data',
        'Optimise slow queries and add caching where it helps',
        'Write API documentation and automated tests',
      ],
      requirements: [
        'Working knowledge of Node.js, Express and SQL',
        'Understanding of authentication and API security basics',
        'Willingness to learn data modelling',
      ],
      skills: ['Node.js', 'Express', 'MongoDB', 'SQL', 'Redis'],
      postedAt: daysAgo(4),
      applyUrl: 'https://example.com/careers/kiln-analytics/nodejs-api-developer',
    },
    {
      id: 'job-6',
      company: 'Orbit Cloud',
      title: 'Associate Software Engineer - Backend',
      location: 'Hyderabad, India',
      workType: 'On-site',
      employmentType: 'Full-time',
      experience: '0-1 years',
      salary: 'INR 6L - 10L per year',
      logo: { letter: 'O', color: '#4f46e5' },
      matchReason:
        'A structured graduate program for backend engineers, a strong fit for a fresher with Java and hackathon experience.',
      description:
        'Our associate program pairs new engineers with mentors and rotates them through core cloud services in the first six months before they pick a team.',
      fullDescription:
        'Our associate program pairs new engineers with mentors and rotates them through core cloud services in the first six months before they pick a team. Expect formal training, real tickets and regular feedback.',
      responsibilities: [
        'Fix bugs and ship small features in backend services',
        'Learn our deployment, monitoring and on-call practices',
        'Present a small project to the team at the end of each rotation',
      ],
      requirements: [
        'Degree in computer science or a related field (or equivalent projects)',
        'Strong grasp of data structures and algorithms',
        'Experience with Java, Go or Node.js',
      ],
      skills: ['Java', 'Data Structures', 'Docker', 'Kubernetes basics', 'SQL'],
      postedAt: daysAgo(5),
      applyUrl: 'https://example.com/careers/orbit-cloud/associate-backend',
    },
    {
      id: 'job-7',
      company: 'Pixelforge Studio',
      title: 'Full-Stack Developer (React + Node)',
      location: 'Remote',
      workType: 'Remote',
      employmentType: 'Full-time',
      experience: '0-2 years',
      salary: '$50k - $70k a year',
      logo: { letter: 'P', color: '#ec4899' },
      matchReason:
        "Rewards the candidate's React and Node.js skills with a role shipping customer-facing web apps for creative clients.",
      description:
        'We build web apps and interactive sites for design-led brands. You will own features from API to interface and collaborate directly with designers.',
      fullDescription:
        'We build web apps and interactive sites for design-led brands. You will own features from API to interface and collaborate directly with designers, so attention to detail and clean code matter as much as speed.',
      responsibilities: [
        'Turn designs into accessible, responsive React interfaces',
        'Build supporting Node.js services and database schemas',
        'Review pull requests and help keep the codebase tidy',
      ],
      requirements: [
        'Experience with React and a CSS framework such as Tailwind',
        'Basic Node.js and database skills',
        'An eye for UI detail and a habit of testing your work',
      ],
      skills: ['React', 'Tailwind CSS', 'Node.js', 'MongoDB', 'Figma handoff'],
      postedAt: daysAgo(5),
      applyUrl: 'https://example.com/careers/pixelforge/fullstack-react-node',
    },
    {
      id: 'job-8',
      company: 'Lumen Health',
      title: 'RAG / LLM Application Developer',
      location: 'Remote',
      workType: 'Remote',
      employmentType: 'Full-time',
      experience: '0-2 years',
      salary: 'Competitive',
      logo: { letter: 'L', color: '#0891b2' },
      matchReason:
        "Directly relevant to the candidate's RAG service and Gemini AI work, applied to a real documentation search product.",
      description:
        'Build retrieval-augmented generation features that help clinicians find answers in long internal guidelines, with strong focus on accuracy and traceable sources.',
      fullDescription:
        'Build retrieval-augmented generation features that help clinicians find answers in long internal guidelines, with strong focus on accuracy and traceable sources. You will own the pipeline from document ingestion to the answer a user sees.',
      responsibilities: [
        'Implement document ingestion, chunking and embedding pipelines',
        'Tune retrieval and prompts, and add citations to every answer',
        'Create evaluation sets to catch regressions before release',
      ],
      requirements: [
        'Prior hands-on work with a RAG or semantic search project',
        'Python or TypeScript proficiency',
        'Care for correctness in sensitive domains',
      ],
      skills: ['RAG', 'Embeddings', 'Vector search', 'Python', 'Gemini API'],
      postedAt: daysAgo(6),
      applyUrl: 'https://example.com/careers/lumen-health/rag-llm-developer',
    },
    {
      id: 'job-9',
      company: 'Stackyard',
      title: 'Backend Developer Intern (Pre-placement offer)',
      location: 'Chennai, India',
      workType: 'On-site',
      employmentType: 'Internship',
      experience: '0 years',
      salary: 'INR 25k - 35k per month',
      logo: { letter: 'S', color: '#111111' },
      matchReason:
        "A six-month internship with a full-time path, matching the candidate's plan to start a backend internship.",
      description:
        'Spend six months on our backend team building internal tools and customer APIs, with a clear route to a full-time offer based on your performance.',
      fullDescription:
        'Spend six months on our backend team building internal tools and customer APIs, with a clear route to a full-time offer based on your performance. You will be assigned a mentor and a real project from day one.',
      responsibilities: [
        'Implement API endpoints and background jobs',
        'Write tests and documentation for your features',
        'Demo your work to the wider team every two weeks',
      ],
      requirements: [
        'Final-year student or recent graduate',
        'Projects in Java, Node.js or Python',
        'Strong communication and a willingness to ask questions',
      ],
      skills: ['Java', 'Node.js', 'Git', 'REST', 'MySQL'],
      postedAt: daysAgo(7),
      applyUrl: 'https://example.com/careers/stackyard/backend-intern',
    },
    {
      id: 'job-10',
      company: 'Vantage Fintech',
      title: 'Junior Java Developer',
      location: 'Mumbai, India',
      workType: 'Hybrid',
      employmentType: 'Full-time',
      experience: '0-2 years',
      salary: 'INR 5L - 7.5L per year',
      logo: { letter: 'V', color: '#dc2626' },
      matchReason:
        "Builds on the candidate's Java, Spring Boot and database projects in a regulated payments environment.",
      description:
        'Work on the services that move money for thousands of small businesses. You will write well-tested Java code and learn how secure, auditable systems are built.',
      fullDescription:
        'Work on the services that move money for thousands of small businesses. You will write well-tested Java code and learn how secure, auditable systems are built, supported by a team that values careful engineering.',
      responsibilities: [
        'Develop and test Spring Boot services for payments and reporting',
        'Investigate production issues with senior engineers',
        'Follow secure coding and audit practices',
      ],
      requirements: [
        'Good knowledge of Java, Spring Boot and SQL',
        'Understanding of unit testing and CI pipelines',
        'Attention to detail and a sense of ownership',
      ],
      skills: ['Java', 'Spring Boot', 'SQL', 'JUnit', 'Kafka basics'],
      postedAt: daysAgo(9),
      applyUrl: 'https://example.com/careers/vantage-fintech/junior-java-developer',
    },
  ],
}

// ---------------------------------------------------------------------------
// 2. ProfileSummaryBanner  (green card at the top)
// ---------------------------------------------------------------------------
// "</>" icon (drawn inline so it works on any lucide-react version)
function CodeSlashIcon({ className = 'h-7 w-7' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
      <line x1="14" y1="4" x2="10" y2="20" />
    </svg>
  )
}

const CHIP_TONES = ['bg-[#b290ff]', 'bg-[#ffe74a]'] // lavender, yellow, alternating like the reference

function ProfileSummaryBanner({ profile, avatarUrl, className = '' }) {
  const chips = [
    { label: profile.level, icon: GraduationCap },
    { label: profile.experience, icon: Calendar },
    ...(profile.roles || []).map((role) => ({ label: role, icon: CodeSlashIcon })),
  ].filter((chip) => chip.label)

  const photo = avatarUrl || profile.avatarUrl

  return (
    <section
      aria-label="Your profile summary"
      className={`flex flex-col gap-5 border-2 border-[#111] bg-[#5fdc98] p-5 shadow-[10px_10px_0_#111] sm:flex-row sm:items-stretch sm:gap-0 sm:p-6 ${className}`}
    >
      <div className="flex shrink-0 items-center justify-center sm:pr-6">
        <div className="grid h-28 w-28 place-items-center overflow-hidden rounded-full border-[3px] border-[#111] bg-[#b290ff] sm:h-32 sm:w-32 lg:h-[clamp(7rem,9vw,9.5rem)] lg:w-[clamp(7rem,9vw,9.5rem)]">
          {photo ? (
            <img src={photo} alt="Your profile" className="h-full w-full object-cover" />
          ) : (
            <UserRound aria-hidden="true" className="h-1/2 w-1/2 text-[#111]" />
          )}
        </div>
      </div>

      <span aria-hidden="true" className="hidden w-0.5 shrink-0 bg-[#111] sm:block" />

      <div className="min-w-0 flex-1 sm:pl-6">
        <ul className="flex flex-wrap gap-3">
          {chips.map(({ label, icon: Icon }, index) => (
            <li
              key={`${label}-${index}`}
              className={`flex items-center gap-2.5 rounded-full px-4 py-1.5 text-base font-extrabold leading-tight tracking-tight sm:px-5 sm:py-2 sm:text-lg lg:text-[clamp(1rem,1.6vw,1.625rem)] ${CHIP_TONES[index % CHIP_TONES.length]}`}
            >
              <Icon aria-hidden="true" className="h-6 w-6 shrink-0 stroke-[2.5] lg:h-7 lg:w-7" />
              {label}
            </li>
          ))}
        </ul>

        <p className="mt-3 text-base leading-snug sm:text-lg lg:text-[clamp(1rem,1.5vw,1.5rem)]">
          <span className="font-extrabold text-[#6b2bf0]">Resume Summary:</span>{' '}
          <span aria-hidden="true">|</span> {profile.summary}
        </p>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// 3. JobCard  (one job recommendation)
// ---------------------------------------------------------------------------
// Coloured square with the company letter (also used in the details dialog)
function JobLogo({ logo, className = 'h-[72px] w-[72px] text-[40px]' }) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-lg font-extrabold leading-none text-white ${className}`}
      style={{ backgroundColor: logo?.color || '#7b2ff0' }}
    >
      {logo?.letter}
    </span>
  )
}

const LABEL = 'font-extrabold text-[#6b2bf0]'
const BODY = 'text-sm leading-snug tracking-tight sm:text-base lg:text-[clamp(0.875rem,1.2vw,1.25rem)]'

function JobCard({ job, onReadMore }) {
  return (
    <article className="flex w-full flex-col border-2 border-[#111] bg-white p-5 shadow-[8px_8px_0_#111] sm:p-6">
      <div className="flex items-center gap-4">
        <JobLogo logo={job.logo} className="h-16 w-16 text-4xl sm:h-[72px] sm:w-[72px] sm:text-[40px]" />
        <div className="min-w-0">
          <h3 className="text-base font-extrabold leading-tight tracking-tight sm:text-lg lg:text-[clamp(1rem,1.35vw,1.375rem)]">
            {job.title}
          </h3>
          <p className={`mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 ${BODY}`}>
            <span>{job.company}</span>
            <span aria-hidden="true">|</span>
            <span className="inline-flex items-center gap-1">
              <MapPin aria-hidden="true" className="h-4 w-4 shrink-0 stroke-[2.5]" />
              {job.location}
            </span>
          </p>
        </div>
      </div>

      <p className={`mt-5 line-clamp-3 ${BODY}`}>
        <span className={LABEL}>Match Reason:</span> {job.matchReason}
      </p>
      <p className={`mt-2 line-clamp-2 ${BODY}`}>
        <span className={LABEL}>Job Description:</span> {job.description}
      </p>

      <button
        type="button"
        onClick={() => onReadMore(job)}
        aria-haspopup="dialog"
        aria-label={`Read more about ${job.title} at ${job.company}`}
        className={`mt-3 inline-flex w-fit items-center gap-1.5 font-extrabold text-[#6b2bf0] hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#6b2bf0]/40 ${BODY}`}
      >
        Read More
        <ChevronDown aria-hidden="true" className="h-5 w-5 stroke-[3]" />
      </button>

      <div className="mt-auto pt-5">
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Apply for ${job.title} at ${job.company} (opens in a new tab)`}
          className="flex w-full items-center justify-center gap-3 border-2 border-[#111] bg-[#6b2bf0] py-2.5 text-2xl font-extrabold tracking-tight text-white shadow-[6px_6px_0_#111] transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/40 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none lg:text-[clamp(1.25rem,2vw,2rem)]"
        >
          Apply
          <ExternalLink aria-hidden="true" className="h-6 w-6 stroke-[2.5]" />
        </a>
      </div>
    </article>
  )
}

// ---------------------------------------------------------------------------
// 4. JobDetailsModal  (expanded job, light blurred background)
// ---------------------------------------------------------------------------
// Expanded view of one job. It opens over the page with a light blurred
// background (rendered in a portal so it also covers the sidebar and navbar).
// Closes with the X button, the Escape key, or a click on the blurred area.

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

function postedLabel(iso) {
  const days = Math.round((Date.now() - new Date(iso).getTime()) / 86400000)
  if (Number.isNaN(days)) return ''
  if (days <= 0) return 'Posted today'
  if (days === 1) return 'Posted 1 day ago'
  return `Posted ${days} days ago`
}

const TAG_TONES = ['bg-[#b290ff]', 'bg-[#ffe74a]']

function Section({ title, children }) {
  return (
    <section className="mt-6">
      <h3 className="mb-2 text-lg font-black uppercase leading-none tracking-tight text-[#6b2bf0]">{title}</h3>
      {children}
    </section>
  )
}

function BulletList({ items }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-base leading-snug marker:text-[#6b2bf0]">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

function JobDetailsModal({ job, onClose }) {
  const dialogRef = useRef(null)
  const [entered, setEntered] = useState(false)

  useEffect(() => {
    const previouslyFocused = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialogRef.current?.focus()
    const frame = requestAnimationFrame(() => setEntered(true))
    return () => {
      cancelAnimationFrame(frame)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus?.()
    }
  }, [])

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key !== 'Tab') return

    // keep keyboard focus inside the dialog
    const items = dialogRef.current?.querySelectorAll(FOCUSABLE)
    if (!items?.length) return
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === dialogRef.current)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const tags = [job.workType, job.employmentType, job.experience, job.salary].filter(Boolean)

  return createPortal(
    <div
      onKeyDown={handleKeyDown}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-white/30 p-4 backdrop-blur-sm transition-opacity duration-200 motion-reduce:transition-none ${
        entered ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="job-details-title"
        tabIndex={-1}
        className={`flex max-h-[90vh] w-full max-w-3xl flex-col border-2 border-[#111] bg-white text-[#111] shadow-[10px_10px_0_#111] outline-none transition-[transform,opacity] duration-200 motion-reduce:transition-none ${
          entered ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* header */}
        <header className="flex items-start gap-4 border-b-2 border-[#111] bg-[#5fdc98] p-5">
          <JobLogo logo={job.logo} className="h-16 w-16 text-4xl sm:h-[72px] sm:w-[72px] sm:text-[40px]" />
          <div className="min-w-0 flex-1">
            <h2 id="job-details-title" className="text-xl font-black leading-tight tracking-tight sm:text-2xl">
              {job.title}
            </h2>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-base font-semibold">
              <span>{job.company}</span>
              <span aria-hidden="true">|</span>
              <span className="inline-flex items-center gap-1">
                <MapPin aria-hidden="true" className="h-4 w-4 stroke-[2.5]" />
                {job.location}
              </span>
            </p>
            {job.postedAt && <p className="mt-1 text-sm">{postedLabel(job.postedAt)}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close job details"
            className="grid h-10 w-10 shrink-0 place-items-center border-2 border-[#111] bg-white transition-colors hover:bg-[#ffe74a] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/40"
          >
            <X aria-hidden="true" className="h-6 w-6 stroke-[3]" />
          </button>
        </header>

        {/* scrollable details */}
        <div className="min-h-0 flex-1 overflow-y-auto p-5 [scrollbar-color:#111_#efefef] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2.5 [&::-webkit-scrollbar-thumb]:bg-[#111] [&::-webkit-scrollbar-track]:bg-[#efefef] sm:p-6">
          {tags.length > 0 && (
            <ul className="flex flex-wrap gap-2.5">
              {tags.map((tag, index) => (
                <li
                  key={tag}
                  className={`rounded-full px-4 py-1.5 text-sm font-extrabold tracking-tight sm:text-base ${TAG_TONES[index % TAG_TONES.length]}`}
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}

          <Section title="Match Reason">
            <p className="text-base leading-snug">{job.matchReason}</p>
          </Section>

          <Section title="Job Description">
            <p className="text-base leading-snug">{job.fullDescription || job.description}</p>
          </Section>

          {job.responsibilities?.length > 0 && (
            <Section title="Responsibilities">
              <BulletList items={job.responsibilities} />
            </Section>
          )}

          {job.requirements?.length > 0 && (
            <Section title="Requirements">
              <BulletList items={job.requirements} />
            </Section>
          )}

          {job.skills?.length > 0 && (
            <Section title="Skills">
              <ul className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <li
                    key={skill}
                    className="border-2 border-[#111] bg-white px-3 py-1 text-sm font-bold shadow-[2px_2px_0_#111]"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        {/* footer */}
        <footer className="border-t-2 border-[#111] p-5">
          <a
            href={job.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Apply for ${job.title} at ${job.company} (opens in a new tab)`}
            className="flex w-full items-center justify-center gap-3 border-2 border-[#111] bg-[#6b2bf0] py-3 text-2xl font-extrabold tracking-tight text-white shadow-[6px_6px_0_#111] transition-[transform,box-shadow] duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[8px_8px_0_#111] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/40 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
          >
            Apply
            <ExternalLink aria-hidden="true" className="h-6 w-6 stroke-[2.5]" />
          </a>
        </footer>
      </div>
    </div>,
    document.body
  )
}

// ---------------------------------------------------------------------------
// 5. Page
// ---------------------------------------------------------------------------
// dot grid + staircase from the reference (desktop only, purely decorative)
// They sit at the top of the page and scroll away with it.
function Decorations() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[700px] top-[25px] hidden h-[110px] w-[170px] bg-[radial-gradient(circle,#111_1.8px,transparent_2.2px)] [background-size:20px_20px] 2xl:block"
      />
      {/* the lavender block continues behind the banner and shows past its right edge */}
      <svg
        aria-hidden="true"
        viewBox="0 0 170 113"
        className="pointer-events-none absolute right-0 top-[93px] hidden h-[113px] w-[170px] xl:block"
      >
        <rect x="73" y="0" width="97" height="113" fill="#b290ff" />
        <rect x="67" y="0" width="6" height="67" fill="#111" />
        <rect x="33" y="20" width="34" height="47" fill="#111" />
        <rect x="0" y="45" width="33" height="22" fill="#111" />
      </svg>
    </>
  )
}

// The whole page scrolls as one piece: there is no fixed height and no inner
// scroll area. (overflow-x-clip only hides sideways overflow of the decorations,
// it does not create a scroll container.)
export default function JobFinder() {
  const { profile, jobs } = jobFinderData
  const [selectedJob, setSelectedJob] = useState(null)

  return (
    <div className="relative isolate flex min-h-screen w-full min-w-0 flex-1 flex-col overflow-x-clip bg-[#f7f7f7] px-4 pb-12 pt-36 text-[#111] sm:px-6 lg:pt-[160px]">
      <Decorations />

      <div className="relative z-10 flex flex-col gap-10 lg:gap-12">
        <ProfileSummaryBanner profile={profile} />

        <section aria-label="Job recommendations" className="pb-2 pr-2 pt-1">
          {jobs.length === 0 ? (
            <p className="border-2 border-[#111] bg-white p-6 text-center font-bold shadow-[8px_8px_0_#111]">
              No job recommendations yet.
            </p>
          ) : (
            <ul className="grid grid-cols-1 gap-[21px] lg:grid-cols-2">
              {jobs.map((job) => (
                <li key={job.id} className="flex">
                  <JobCard job={job} onReadMore={setSelectedJob} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {selectedJob && <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />}
    </div>
  )
}