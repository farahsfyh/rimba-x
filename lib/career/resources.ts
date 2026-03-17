import type { LearningResource } from '@/types'

/** Curated free learning resources keyed by skill name (case-insensitive match) */
export const FREE_RESOURCES: Record<string, LearningResource[]> = {
  Python: [
    { title: 'CS50P – Python (Harvard, Free)', url: 'https://cs50.harvard.edu/python', type: 'course', free: true },
    { title: 'Python for Everybody – Coursera (Audit Free)', url: 'https://www.coursera.org/specializations/python', type: 'course', free: true },
    { title: 'Automate the Boring Stuff with Python', url: 'https://automatetheboringstuff.com', type: 'article', free: true },
  ],
  SQL: [
    { title: 'SQLZoo – Interactive SQL Tutorial', url: 'https://sqlzoo.net', type: 'course', free: true },
    { title: 'Mode Analytics SQL Tutorial', url: 'https://mode.com/sql-tutorial', type: 'article', free: true },
  ],
  Excel: [
    { title: 'Microsoft Excel Free Training', url: 'https://support.microsoft.com/en-us/office/excel-training', type: 'course', free: true },
    { title: 'Excel Skills for Business – Coursera Audit', url: 'https://www.coursera.org/specializations/excel', type: 'course', free: true },
  ],
  'Data Analysis': [
    { title: 'Google Data Analytics Certificate (Audit)', url: 'https://www.coursera.org/google-certificates/data-analytics-certificate', type: 'course', free: true },
    { title: 'Khan Academy Statistics', url: 'https://www.khanacademy.org/math/statistics-probability', type: 'course', free: true },
  ],
  'Machine Learning': [
    { title: 'Machine Learning Specialization – Coursera Audit', url: 'https://www.coursera.org/specializations/machine-learning-introduction', type: 'course', free: true },
    { title: 'fast.ai Practical Deep Learning', url: 'https://course.fast.ai', type: 'course', free: true },
  ],
  'Power BI': [
    { title: 'Microsoft Power BI Learning Path (Free)', url: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi', type: 'course', free: true },
  ],
  Tableau: [
    { title: 'Tableau Public Free Training Videos', url: 'https://www.tableau.com/learn/training', type: 'video', free: true },
  ],
  JavaScript: [
    { title: 'The Odin Project – Full Stack JavaScript', url: 'https://www.theodinproject.com', type: 'course', free: true },
    { title: 'freeCodeCamp JavaScript Algorithms', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures', type: 'course', free: true },
  ],
  React: [
    { title: 'React Official Docs (react.dev)', url: 'https://react.dev/learn', type: 'article', free: true },
    { title: 'freeCodeCamp React Course', url: 'https://www.freecodecamp.org/learn/front-end-development-libraries', type: 'course', free: true },
  ],
  'Node.js': [
    { title: 'The Odin Project – NodeJS Path', url: 'https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs', type: 'course', free: true },
  ],
  Java: [
    { title: 'CS50x – Intro to Computer Science', url: 'https://cs50.harvard.edu/x', type: 'course', free: true },
    { title: 'MOOC.fi Java Programming (University of Helsinki)', url: 'https://java-programming.mooc.fi', type: 'course', free: true },
  ],
  'Digital Marketing': [
    { title: 'Google Digital Marketing & E-commerce Certificate (Audit)', url: 'https://www.coursera.org/google-certificates/digital-marketing-ecommerce', type: 'course', free: true },
    { title: 'HubSpot Academy – Free Marketing Certifications', url: 'https://academy.hubspot.com', type: 'course', free: true },
  ],
  'Project Management': [
    { title: 'Google Project Management Certificate (Audit)', url: 'https://www.coursera.org/google-certificates/project-management', type: 'course', free: true },
    { title: 'PMI Free Resources', url: 'https://www.pmi.org/learning/library', type: 'article', free: true },
  ],
  Communication: [
    { title: 'Effective Communication – Coursera Audit', url: 'https://www.coursera.org/learn/wharton-communication-skills', type: 'course', free: true },
  ],
  Leadership: [
    { title: 'Inspiring and Motivating Individuals – Coursera Audit', url: 'https://www.coursera.org/learn/motivate-people-teams', type: 'course', free: true },
  ],
  Accounting: [
    { title: 'Accounting Fundamentals – Coursera Audit', url: 'https://www.coursera.org/learn/uva-darden-getting-started-agile', type: 'course', free: true },
    { title: 'Khan Academy Finance & Capital Markets', url: 'https://www.khanacademy.org/economics-finance-domain/core-finance', type: 'course', free: true },
  ],
  Finance: [
    { title: 'Financial Markets – Yale Coursera Audit', url: 'https://www.coursera.org/learn/financial-markets-global', type: 'course', free: true },
    { title: 'Khan Academy Personal Finance', url: 'https://www.khanacademy.org/college-careers-more/personal-finance', type: 'course', free: true },
  ],
  'Public Speaking': [
    { title: 'Introduction to Public Speaking – Coursera Audit', url: 'https://www.coursera.org/learn/public-speaking', type: 'course', free: true },
  ],
  'Critical Thinking': [
    { title: 'Critical Thinking & Problem Solving – Coursera Audit', url: 'https://www.coursera.org/learn/critical-thinking-problem-solving', type: 'course', free: true },
  ],
  'Cloud Computing': [
    { title: 'AWS Cloud Practitioner Essentials (Free)', url: 'https://explore.skillbuilder.aws/learn/course/134', type: 'course', free: true },
    { title: 'Google Cloud Skills Boost (Free Tier)', url: 'https://cloudskillsboost.google', type: 'course', free: true },
  ],
  Cybersecurity: [
    { title: 'Google Cybersecurity Certificate (Audit)', url: 'https://www.coursera.org/google-certificates/cybersecurity-certificate', type: 'course', free: true },
    { title: 'TryHackMe – Free Cybersecurity Learning', url: 'https://tryhackme.com', type: 'course', free: true },
  ],
  'UI/UX Design': [
    { title: 'Google UX Design Certificate (Audit)', url: 'https://www.coursera.org/google-certificates/ux-design-certificate', type: 'course', free: true },
    { title: 'Figma Beginner Tutorials (YouTube)', url: 'https://www.youtube.com/c/Figma', type: 'video', free: true },
  ],
  'Business Communication': [
    { title: 'Business Communication – edX Audit', url: 'https://www.edx.org/learn/business-communications', type: 'course', free: true },
  ],
}

/** Get curated resources for a skill, falling back to empty array */
export function getResourcesForSkill(skill: string): LearningResource[] {
  const key = Object.keys(FREE_RESOURCES).find(k => k.toLowerCase() === skill.toLowerCase())
  return key ? FREE_RESOURCES[key] : []
}
