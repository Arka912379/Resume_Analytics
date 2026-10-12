import React from 'react'
import ScoreCard from '../components/ScoreCard'
import Suggestions from '../components/Suggestions'
import AreasToImprove from '../components/AreasToImprove'
import WorkingWell from '../components/WorkingWell'
import { useLocation } from 'react-router-dom'

const providedAnalysis = {
  title: 'Programmer Analyst Intern',
  company: 'Amazon',
  matchScore: 92,
  summary: 'Your resume presents a highly relevant profile for the Programmer Analyst Intern role, showcasing strong foundational computer science knowledge, diverse programming language proficiency, and practical experience in building software applications.',
  matchedKeywords: [
    { title: 'Education & CS Fundamentals', description: 'Your Bachelor of Computer Applications degree and coursework in Data Structures, Algorithms, and Operating Systems align perfectly with the foundational requirements.' },
    { title: 'Programming Proficiency', description: 'You demonstrate strong proficiency in Java, C++, Python, SQL, JavaScript, and TypeScript, covering the preferred and required programming languages.' },
    { title: 'Software Development Experience', description: 'Your Backend Developer Intern role and multiple impactful projects showcase hands-on experience in building and deploying software applications.' },
    { title: 'Cloud & Web Technologies', description: 'Your experience with AWS, EC2, DigitalOcean S3, Node.js, Spring Boot, and React.js directly matches the job\'s emphasis on cloud and web technologies.' },
    { title: 'Database Expertise', description: 'You have practical experience with MongoDB, PostgreSQL, and Redis, which are valuable for developing scalable applications.' },
    { title: 'Engineering Best Practices', description: 'Your use of Git/GitHub for version control, Docker for deployment, and focus on DSA problems reflect an understanding of software engineering best practices.' },
    { title: 'Problem Solving & Initiative', description: 'Your LeetCode achievements and successful hackathon projects demonstrate strong problem-solving skills and the ability to take initiative.' },
  ],
  missingKeywords: [
    { title: 'Specific AWS Services', description: 'While you list AWS and EC2, explicit experience with DynamoDB as mentioned in the job description is not clearly detailed.' },
    { title: 'Advanced System Concepts', description: 'The resume could more explicitly highlight exposure to concepts like schedulers, workflows, state machines, or multi-threading, which are preferred qualifications.' },
    { title: 'Documentation & Stakeholder Liaison', description: 'The job description mentions documentation and acting as a liaison between business and technical stakeholders, which are not explicitly detailed in your experience.' },
  ],
  suggestions: [
    { title: 'Detail AWS Experience', description: 'If you have any experience with DynamoDB, explicitly mention it in your skills or project descriptions to directly address a preferred qualification.' },
    { title: 'Elaborate on System Design', description: 'Enhance project descriptions to highlight instances where you dealt with schedulers, workflows, state machines, or multi-threading to showcase advanced system design exposure.' },
    { title: 'Showcase Communication & Documentation', description: 'Add bullet points to your experience or project descriptions that demonstrate your ability to document code or communicate technical requirements to non-technical stakeholders.' },
    { title: 'Emphasize Debugging Skills', description: 'Provide a specific example in your experience or projects where you debugged and troubleshot complex application-level issues with minimal guidance.' },
  ],
}

const JDAnalysis = () => {
  const { state } = useLocation()
  const routeData = state?.jobDescriptionAnalysis || state?.data?.jobDescriptionAnalysis || state?.data || state
  const analysis = routeData?.jobDescriptionAnalysis || routeData || providedAnalysis

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1700px] flex-col gap-4 px-5 pb-3 pt-28 text-[#111] sm:px-6 lg:px-7 max-lg:pt-32 max-sm:px-4 max-sm:pb-6">
      <div className="h-32 shrink-0 max-lg:h-auto">
        <ScoreCard analysis={analysis} />
      </div>
      <div className="flex h-[15.8rem] mt-[1.7rem] shrink-0 gap-4 max-lg:h-auto max-lg:flex-col">
        <AreasToImprove items={analysis.missingKeywords || []} />
        <WorkingWell items={analysis.matchedKeywords || []} />
      </div>
      <div className="h-[15.8rem] shrink-0 [&>section]:h-full max-lg:h-auto max-lg:min-h-[15.8rem]">
        <Suggestions suggestions={analysis.suggestions || []} />
      </div>
    </div>
  )
}

export default JDAnalysis
