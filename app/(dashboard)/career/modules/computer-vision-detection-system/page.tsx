'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, BookOpen, Layers, CheckCircle2, PlayCircle, BarChart, Database,
  Eye, Code, Zap, Target, ArrowRight, Activity, AlertTriangle, Lightbulb, UserCheck, ShieldCheck, BrainCircuit, X, Send, MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import ReactMarkdown from 'react-markdown'

const QUIZ_QUESTIONS = [
  {
    type: 'Concept',
    q: 'What is the primary difference between Image Classification and Object Detection?',
    options: [
      'Classification returns multiple bounding boxes, Detection returns one label.',
      'Classification assigns a single label to an image, Detection finds and localizes multiple objects.',
      'Classification segments pixels, Detection groups them.',
      'They are mathematically identical.'
    ],
    answer: 1
  },
  {
    type: 'Concept',
    q: 'In an object detection pipeline, what does the "Confidence Score" typically represent?',
    options: [
      'The likelihood that a bounding box contains an object of a specific class.',
      'The size area of the bounding box.',
      'How fast the model performed inference.',
      'The accuracy of the ground truth dataset.'
    ],
    answer: 0
  },
  {
    type: 'Scenario',
    q: 'You are designing a system to find early signs of Glaucoma (small lesions). Which approach is best?',
    options: [
      'Image Classification to simply label the image as "Healthy" or "Glaucoma".',
      'Object Detection to localize specific lesions so doctors can inspect the exact problem areas.',
      'Unsupervised clustering to group pixels by color.',
      'Linear regression to predict the patient age.'
    ],
    answer: 1
  },
  {
    type: 'Scenario',
    q: 'Your model is missing many small, faint lesions but successfully finds the obvious, large ones. What is the likely result?',
    options: [
      'High Precision, Low Recall.',
      'High Recall, Low Precision.',
      'It does not affect metrics.',
      'Negative Accuracy.'
    ],
    answer: 0
  },
  {
    type: 'Reasoning',
    q: 'Why are bounding boxes represented as coordinates instead of raw pixel masks?',
    options: [
      'Pixel masks are scientifically inaccurate.',
      'Bounding boxes are computationally cheaper and often sufficient for localizing distinct objects.',
      'Bounding boxes are legally required in medical imaging.',
      'Masks cannot represent overlapping objects.'
    ],
    answer: 1
  },
  {
    type: 'Reasoning',
    q: 'A model flags a healthy retina as having "Glaucoma" because it detected a camera artifact. This is a:',
    options: [
      'False Negative',
      'False Positive',
      'True Negative',
      'True Positive'
    ],
    answer: 1
  },
  {
    type: 'Reasoning',
    q: 'In medical diagnostics like Glaucoma detection, why might you prioritize "Recall" over "Precision"?',
    options: [
      'Because doctors hate false positives.',
      'Because missing a severe disease is usually far more dangerous than over-flagging healthy patients for review.',
      'Because Recall is mathematically easier to calculate.',
      'Precision is actually more important in all medical contexts.'
    ],
    answer: 1
  },
  {
    type: 'Reasoning',
    q: 'If your detection evaluation shows an Intersection over Union (IoU) of 0.1, what does this indicate?',
    options: [
      'The model predicted the box almost perfectly.',
      'The predicted bounding box barely overlaps with the actual object location.',
      'The model found 10 objects.',
      'The prediction is 10% faster than average.'
    ],
    answer: 1
  }
]

export default function ComputerVisionModule() {
  const [activeLevel, setActiveLevel] = useState<number>(1)
  const [quizStarted, setQuizStarted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showAnswer, setShowAnswer] = useState(false)
  const [quizFinished, setQuizFinished] = useState(false)

  // LEVEL 2 STATE
  const [level2Progress, setLevel2Progress] = useState(0)
  const [isSimulating, setIsSimulating] = useState(false)
  const [interpretationText, setInterpretationText] = useState("")
  const [selectedGlaucoma, setSelectedGlaucoma] = useState<number[]>([])
  const [prepChoice, setPrepChoice] = useState<number | null>(null)

  // Learning Assistant Chat State
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [isSimulatingChat, setIsSimulatingChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
    { role: 'assistant', text: "Hi! I'm Teacher Nisa, your AI Learning Coach." }
  ])

  // Contextual Greeting Trigger
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatMessages, isSimulatingChat])

  useEffect(() => {
    let contextMsg = "Hi! I'm Teacher Nisa, your AI Learning Coach. "
    if (activeLevel === 1) contextMsg += "I see we're reviewing the core concepts of Computer Vision. Need help separating classification from detection architectures?"
    else if (activeLevel === 2) {
      if (level2Progress === 0) contextMsg += "I'm monitoring your dataset familiarization. Try spotting the pallor boundaries in the optic disc!"
      else if (level2Progress === 3) contextMsg += "Borderline structural predictions are tricky! Remember neural nets mathematically struggle exactly around 0.50. Tell me if you need help with your interpretation log."
      else contextMsg += "Your pipeline logic execution looks smooth so far. Need any hints?"
    }
    else if (activeLevel === 3) contextMsg += "You're in the final challenge! Let's apply everything. How should we configure the threshold mechanics?"

    setChatMessages([
      { role: 'assistant', text: contextMsg }
    ])
  }, [activeLevel, level2Progress])

  const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }
  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }

  return (
    <div className={`min-h-screen bg-[#F8FAFC] pb-20 transition-all duration-500 ease-in-out ${isChatOpen ? 'lg:pr-96' : ''}`}>
      {/* HEADER */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link href="/career/modules" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-900 mb-6 transition-colors">
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100">
              <ArrowLeft size={14} />
            </div>
            Back to Learning Path
          </Link>

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 bg-amber-100 text-amber-700 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Intermediate
                </span>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-violet-100 text-blue-700 w-fit">
                  In Progress (20%)
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight leading-tight max-w-2xl">
                Computer Vision: Intelligent Detection Systems
              </h1>
              <p className="text-gray-500 text-sm max-w-3xl leading-relaxed mb-6">
                This module follows a competency-based learning approach, where you progress from conceptual understanding to guided application and finally independent problem-solving. Skills are validated through an AI detection system using a standardized dataset, ensuring measurable learning outcomes and real-world readiness.
              </p>

              <div className="mt-4">
                <a href="/reference-notes-cv.html" target="_blank" rel="noreferrer" className="relative inline-block group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-pink-500 to-blue-400 rounded-xl blur-sm opacity-60 group-hover:opacity-100 transition duration-300"></div>
                  <Button className="relative font-bold bg-white hover:bg-gray-50 text-gray-900 px-6 py-3.5 rounded-xl shadow-sm hover:shadow-md flex items-center gap-2 text-sm transition-all duration-300 transform group-hover:scale-[1.03] border border-gray-200/80">
                    <BookOpen size={18} className="text-[#8B5CF6] animate-bounce-subtle" />
                    <span className="font-extrabold tracking-tight text-gray-950">View & Download PDF Notes</span>
                  </Button>
                </a>
              </div>
            </div>

            <div className="shrink-0 bg-gradient-to-br from-white to-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 group min-w-[140px] text-center">
              <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mx-auto mb-2.5 text-[#8B5CF6] shadow-inner group-hover:bg-[#8B5CF6] group-hover:text-white transition-all duration-300 transform group-hover:scale-105">
                <Eye size={22} className="group-hover:animate-pulse" />
              </div>
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-0.5">Estimated Time</p>
              <p className="text-xl font-black text-gray-900 tracking-tight">~12h</p>
            </div>
          </div>

          {/* COURSE VIDEO EMBED */}
          <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-md border border-gray-100 bg-gray-900 relative">
            <iframe
              src="https://www.youtube.com/embed/L23oIHZE14w?rel=0"
              title="Computer Vision Course Intro"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* TABS */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              onClick={() => setActiveLevel(num)}
              className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold transition-all ${activeLevel === num
                ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/10'
                : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 hover:border-gray-300'
                }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${activeLevel === num ? 'bg-white/20' : 'bg-gray-100'}`}>
                {num}
              </div>
              {num === 1 && 'Level 1: Understand'}
              {num === 2 && 'Level 2: Apply'}
              {num === 3 && 'Level 3: Case Study'}
            </button>
          ))}
        </div>

        {/* CONTENT PANELS */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLevel}
            initial="hidden" animate="visible" exit="hidden"
            variants={stagger}
            className="w-full"
          >
            {/* LEVEL 1: UNDERSTAND */}
            {activeLevel === 1 && (
              <div className="space-y-6">
                <motion.div variants={fadeUp} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-violet-50 text-[#8B5CF6] p-2 rounded-xl"><Lightbulb size={24} /></div>
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-900">Concept Mastery</h2>
                      <p className="text-sm text-gray-500">Build your fundamental knowledge before jumping into code.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {['Detection vs Classification', 'Vision Pipeline', 'Features Selection', 'Model Outputs & Evaluation'].map((topic, i) => (
                      <div key={i} className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-violet-200 hover:bg-violet-50/30 transition-colors cursor-pointer group">
                        <div className="w-8 h-8 rounded-full bg-violet-100 text-[#8B5CF6] flex items-center justify-center shrink-0 font-bold text-xs group-hover:bg-[#8B5CF6] group-hover:text-white transition-colors">
                          0{i + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">{topic}</h4>
                          <p className="text-xs text-gray-500 line-clamp-2">Understand the theoretical foundations, outputs, metrics, and core differences required for this level.</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!quizStarted && !quizFinished ? (
                    <div className="bg-gradient-to-br from-violet-900 to-purple-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Target size={120} />
                      </div>
                      <div className="relative z-10 max-w-xl">
                        <h3 style={{ color: 'white' }} className="text-xl font-extrabold border-white mb-2">Level 1 Quiz</h3>
                        <p className="text-violet-200 text-sm mb-6">Test your knowledge with 8 curated questions (2 Concept, 2 Scenario, 4 Reasoning) before advancing.</p>
                        <Button onClick={() => setQuizStarted(true)} className="font-bold bg-white text-violet-900 hover:bg-violet-50">
                          Start Quiz <ArrowRight size={14} className="ml-2" />
                        </Button>
                      </div>
                    </div>
                  ) : quizStarted && !quizFinished ? (
                    <div className="bg-white rounded-2xl p-6 md:p-8 border-2 border-violet-100 relative overflow-hidden">
                      <div className="flex items-center justify-between mb-6">
                        <span className="text-xs font-bold text-[#8B5CF6] bg-violet-50 px-3 py-1 rounded-full uppercase tracking-wider">
                          Question {currentQ + 1} of 8 • {QUIZ_QUESTIONS[currentQ].type}
                        </span>
                        <span className="text-sm font-bold text-gray-400">{Math.round(((currentQ) / 8) * 100)}%</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-6">{QUIZ_QUESTIONS[currentQ].q}</h3>
                      <div className="space-y-3 mb-6">
                        {QUIZ_QUESTIONS[currentQ].options.map((opt, idx) => {
                          const isSelected = selectedOption === idx;
                          const isCorrect = idx === QUIZ_QUESTIONS[currentQ].answer;

                          let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all font-medium text-sm "
                          if (!showAnswer) {
                            btnClass += isSelected ? "border-[#8B5CF6] bg-violet-50" : "border-gray-100 hover:border-violet-200 text-gray-600"
                          } else {
                            if (isCorrect) btnClass += "border-emerald-500 bg-emerald-50 text-emerald-900"
                            else if (isSelected && !isCorrect) btnClass += "border-red-500 bg-red-50 text-red-900"
                            else btnClass += "border-gray-100 opacity-50"
                          }

                          return (
                            <button
                              key={idx}
                              disabled={showAnswer}
                              onClick={() => setSelectedOption(idx)}
                              className={btnClass}
                            >
                              {opt}
                            </button>
                          )
                        })}
                      </div>
                      <div className="flex justify-end">
                        {!showAnswer ? (
                          <Button
                            disabled={selectedOption === null}
                            onClick={() => setShowAnswer(true)}
                            className="bg-[#8B5CF6] hover:bg-violet-700 text-white font-bold"
                          >
                            Submit Answer
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              if (currentQ < 7) {
                                setCurrentQ(q => q + 1);
                                setSelectedOption(null);
                                setShowAnswer(false);
                              } else {
                                setQuizFinished(true);
                              }
                            }}
                            className="bg-gray-900 hover:bg-black text-white font-bold"
                          >
                            {currentQ < 7 ? 'Next Question' : 'Finish Quiz'} <ArrowRight size={14} className="ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 rounded-2xl p-6 md:p-8 text-emerald-900 border border-emerald-200 text-center">
                      <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-4" />
                      <h3 className="text-xl font-extrabold mb-2">Quiz Completed!</h3>
                      <p className="text-emerald-700 text-sm mb-6">Great job. You have demonstrated a solid understanding of the concepts.</p>
                      <Button onClick={() => { setQuizStarted(false); setQuizFinished(false); setCurrentQ(0); setSelectedOption(null); setShowAnswer(false); }} variant="outline" className="font-bold border-emerald-300 text-emerald-700 hover:bg-emerald-100">
                        Retake Quiz
                      </Button>
                    </div>
                  )}
                </motion.div>

                {/* Feedback / Results Output */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Level 1 Output</p>
                    <div className="text-4xl font-extrabold text-[#8B5CF6] mb-2">85%</div>
                    <p className="text-sm font-bold text-gray-900">Understanding Score</p>
                  </div>
                  <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3"><CheckCircle2 size={16} className="text-emerald-500" /> Strengths Breakdown</h4>
                      <ul className="space-y-2">
                        {['Concept Knowledge', 'Process Understanding', 'Evaluation Awareness'].map((s, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3"><AlertTriangle size={16} className="text-amber-500" /> Misconceptions</h4>
                      <ul className="space-y-2">
                        <li className="text-xs text-gray-600 flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1" /> Confusing Precision with Recall</li>
                        <li className="text-xs text-gray-600 flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1" /> Unclear on bounding box logic</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* LEVEL 2: APPLY */}
            {activeLevel === 2 && (
              <div className="space-y-6">
                <motion.div variants={fadeUp} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-violet-50 text-[#8B5CF6] p-2 rounded-xl"><Code size={24} /></div>
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-900">Guided Application</h2>
                      <p className="text-sm text-gray-500">Apply theory to an actual dataset with guided exercises.</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        title: "Dataset Familiarisation",
                        desc: "Inspect the uploaded normal vs glaucoma fundus labels below. Can you visually identify the structural differences in the optic disc?",
                        icon: Database,
                        content: (
                          <div>
                            {level2Progress === 0 && <p className="text-sm text-gray-600 mb-4 font-medium">Click to select the images you believe show positive signs of Glaucoma.</p>}
                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                              {[
                                { src: "/images/retina/media__1773933117854.png", truth: true },
                                { src: "/images/retina/media__1773933117882.png", truth: true },
                                { src: "/images/retina/media__1773933117979.jpg", truth: false },
                                { src: "/images/retina/media__1773933118011.png", truth: true },
                                { src: "/images/retina/media__1773933118023.jpg", truth: false },
                              ].map((img, i) => {
                                const isSelected = selectedGlaucoma.includes(i);
                                const isRevealed = level2Progress > 0;

                                return (
                                  <div key={i}
                                    onClick={() => {
                                      if (level2Progress === 0) {
                                        setSelectedGlaucoma(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])
                                      }
                                    }}
                                    className={`group relative rounded-xl border-2 overflow-hidden transition-all ${level2Progress === 0 ? 'cursor-pointer hover:border-purple-400' : ''
                                      } ${isSelected && level2Progress === 0 ? 'border-[#8B5CF6] ring-2 ring-violet-200' :
                                        isRevealed && img.truth ? 'border-rose-500 ring-2 ring-rose-100 shadow-sm' :
                                          isRevealed && !img.truth ? 'border-emerald-500 ring-2 ring-emerald-100 shadow-sm' :
                                            'border-gray-200 shadow-sm'
                                      }`}>
                                    <img src={img.src} alt={`Retina ${i + 1}`} className={`w-full h-24 object-cover transition-transform ${level2Progress === 0 ? 'group-hover:scale-105' : ''}`} />

                                    {/* Selection Overlay during active phase */}
                                    {isSelected && level2Progress === 0 && (
                                      <div className="absolute inset-0 bg-purple-900/10 flex items-center justify-center pointer-events-none">
                                        <div className="bg-[#8B5CF6] text-white p-1 rounded-full shadow-md"><CheckCircle2 size={16} /></div>
                                      </div>
                                    )}

                                    {/* Revealed Labels */}
                                    {isRevealed && (
                                      <div className={`absolute bottom-0 w-full p-1.5 text-center text-[10px] font-bold text-white tracking-widest uppercase ${img.truth ? 'bg-rose-500' : 'bg-emerald-500'}`}>
                                        {img.truth ? 'Glaucoma' : 'Healthy'}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>

                            {/* Micro Feedback */}
                            {level2Progress > 0 && (() => {
                              const correctSelections = selectedGlaucoma.filter(idx => [0, 1, 3].includes(idx)).length;
                              const falsePositives = selectedGlaucoma.filter(idx => ![0, 1, 3].includes(idx)).length;
                              const missed = 3 - correctSelections;

                              let feedbackTitle = "Perfect Identification";
                              let feedbackText = "You accurately identified all Glaucoma traces without any false positives. The optic disc boundaries inherently present varied pale formations, forcing the CNN model to rely heavily on pixel feature abstractions.";
                              let fbColor = "text-emerald-500";
                              let bgBorder = "bg-emerald-50/50 border-emerald-100";
                              let textHead = "text-emerald-900";
                              let textBody = "text-emerald-800/90";
                              let Icon = CheckCircle2;

                              if (falsePositives > 0 && missed > 0) {
                                feedbackTitle = "Mixed Identifications";
                                feedbackText = `You missed ${missed} actual Glaucoma tracing${missed > 1 ? 's' : ''} and misidentified ${falsePositives} healthy tracings. This perfectly highlights why relying on naked-eye heuristics introduces significant diagnostic liability compared to algorithmic approaches.`;
                                fbColor = "text-amber-500"; bgBorder = "bg-amber-50/50 border-amber-100"; textHead = "text-amber-900"; textBody = "text-amber-800/90"; Icon = AlertTriangle;
                              } else if (falsePositives > 0) {
                                feedbackTitle = "False Positives Detected";
                                feedbackText = `You caught the correct pathologies, but flagged ${falsePositives} healthy image${falsePositives > 1 ? 's' : ''} as pathological. This over-sensitivity is common; a neural network is trained to systematically separate overlapping visual features.`;
                                fbColor = "text-rose-500"; bgBorder = "bg-rose-50/50 border-rose-100"; textHead = "text-rose-900"; textBody = "text-rose-800/90"; Icon = AlertTriangle;
                              } else if (missed > 0) {
                                feedbackTitle = "Pathology Missed";
                                feedbackText = `You correctly ignored the healthy scans, but missed ${missed} positive trace${missed > 1 ? 's' : ''}. The visual pallor boundary is highly subjective, distinguishing this is where standard CNN convolutions excel.`;
                                fbColor = "text-amber-500"; bgBorder = "bg-amber-50/50 border-amber-100"; textHead = "text-amber-900"; textBody = "text-amber-800/90"; Icon = AlertTriangle;
                              }

                              return (
                                <div className={`mt-5 p-4 rounded-xl ${bgBorder} border flex gap-3 text-sm shadow-sm backdrop-blur-sm animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                                  <Icon className={`${fbColor} shrink-0 mt-0.5`} size={18} />
                                  <div>
                                    <span className={`font-bold ${textHead} block mb-1.5 pb-1 border-b border-black/5 uppercase tracking-wide text-[10px]`}>{feedbackTitle}</span>
                                    <span className={`${textBody} leading-relaxed block`}>{feedbackText}</span>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        ),
                        action: <Button onClick={() => setLevel2Progress(1)} size="lg" disabled={level2Progress !== 0} className={`w-full md:w-auto font-bold shadow-md ${level2Progress >= 1 ? 'bg-gray-100 text-gray-400 border-none shadow-none cursor-default hover:bg-gray-100' : 'bg-[#8B5CF6] hover:bg-purple-700 text-white'}`}>{level2Progress >= 1 ? 'Labels Revealed' : 'Submit Classification'}</Button>
                      },
                      {
                        title: "Preprocessing Matrix",
                        desc: "Write scripts to load images, resize/normalize appropriately, and visualize transformations interactively.",
                        icon: Layers,
                        content: (
                          <div className="space-y-4 pt-2">
                            {/* Quiz block */}
                            {level2Progress <= 1 && (
                              <>
                                <p className="text-sm font-medium text-gray-800">Select the necessary preprocessing pipeline to prepare these files for the ResNet architecture:</p>
                                <div className="space-y-2.5">
                                  {["Resize to bounding box only", "Normalize pixel values only", "Resize to 224x224 and Normalize to [0,1]"].map((opt, i) => (
                                    <div key={i} onClick={() => setPrepChoice(i)} className={`p-3.5 rounded-xl border-2 flex items-center gap-3 cursor-pointer transition-all ${prepChoice === i ? 'bg-violet-50 border-violet-500 ring-4 ring-violet-100 shadow-sm' : 'bg-gray-50 border-gray-200 hover:border-purple-300'}`}>
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${prepChoice === i ? 'border-[#8B5CF6] bg-[#8B5CF6]' : 'border-gray-300 bg-white'}`}>
                                        {prepChoice === i && <div className="w-2 h-2 rounded-full bg-white scale-animation" />}
                                      </div>
                                      <span className={`text-sm font-medium ${prepChoice === i ? 'text-purple-900' : 'text-gray-700'}`}>{opt}</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}

                            {/* Micro Feedback + Execution log */}
                            {level2Progress >= 2 && (
                              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className={`p-4 rounded-xl border flex gap-3 text-sm shadow-sm ${prepChoice === 2 ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-rose-50 border-rose-100 text-rose-800'}`}>
                                  {prepChoice === 2 ? <CheckCircle2 className="shrink-0 mt-0.5 text-emerald-600" size={18} /> : <AlertTriangle className="shrink-0 mt-0.5 text-rose-600" size={18} />}
                                  <div>
                                    <span className="font-bold block mb-1.5 pb-1.5 border-b border-black/5 uppercase tracking-wide text-[10px] flex items-center gap-1.5">Feedback</span>
                                    <span className="leading-relaxed">{prepChoice === 2 ? 'Correct! Resizing perfectly ensures uniform tensor dimensions matching ResNet\'s input layer, while normalisation critically stabilizes gradient descent during inference.' : 'Incorrect. Neural networks strictly require standard structural bounds (resize) AND scalar value bounding [0,1] or [-1,1] (normalisation) to prevent gradient explosions.'}</span>
                                  </div>
                                </div>

                                <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-[13px] font-mono text-green-400 leading-relaxed shadow-inner">
                                  &gt; Importing retina images... [OK]<br />
                                  &gt; Applying Resize(224,224)... [OK]<br />
                                  &gt; Normalizing tensors to [0,1]... [OK]<br />
                                  &gt; Batch (5, 3, 224, 224) exported to GPU memory.
                                </div>
                              </div>
                            )}
                          </div>
                        ),
                        action: <Button onClick={() => setLevel2Progress(2)} disabled={prepChoice === null} size="lg" className="w-full md:w-auto font-bold bg-[#8B5CF6] hover:bg-purple-700 text-white shadow-md">Execute Pipeline</Button>
                      },
                      {
                        title: "Model Interaction",
                        desc: "Run inference on a pre-built CNN, observe bounding box logic and probability distributions.",
                        icon: PlayCircle,
                        content: level2Progress >= 3 ? (
                          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-[13px] font-mono text-blue-300 leading-relaxed shadow-inner space-y-2">
                              <div><span className="text-gray-500">Evaluating ResNet152 weights...</span> [100%]</div>
                              <div className="w-full h-px bg-gray-800 my-2"></div>
                              <div><span className="text-gray-500">Img 1:</span> Glaucoma (0.83 confidence)</div>
                              <div><span className="text-gray-500">Img 2:</span> Glaucoma (0.91 confidence)</div>
                              <div><span className="text-gray-500">Img 3:</span> Healthy (0.94 confidence)</div>
                              <div><span className="text-gray-500">Img 4:</span> <span className="text-red-400 bg-red-400/10 px-1 py-0.5 rounded shadow-[0_0_10px_rgba(248,113,113,0.1)]">Glaucoma (0.52 borderline)</span></div>
                              <div><span className="text-gray-500">Img 5:</span> Healthy (0.88 confidence)</div>
                            </div>

                            {level2Progress === 3 && (
                              <div className="pt-2 animate-in fade-in duration-700">
                                <p className="text-sm font-bold text-gray-800 mb-3">Which image prediction is dangerously close to the 0.5 threshold logic boundary and requires human triage?</p>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                  {[1, 2, 3, 4, 5].map((opt) => (
                                    <div key={opt} onClick={() => setPrepChoice(opt + 10)} className={`p-2 rounded-lg border text-center text-sm font-bold cursor-pointer transition-colors ${prepChoice === opt + 10 ? 'bg-violet-50 border-violet-500 text-purple-700 ring-2 ring-violet-100 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-300'}`}>Image {opt}</div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {level2Progress > 3 && (
                              <div className={`p-4 rounded-xl border flex gap-3 text-sm shadow-sm ${prepChoice === 14 ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                                {prepChoice === 14 ? <CheckCircle2 className="shrink-0 mt-0.5 text-emerald-600" size={18} /> : <AlertTriangle className="shrink-0 mt-0.5 text-amber-600" size={18} />}
                                <div>
                                  <span className="font-bold block mb-1.5 pb-1.5 border-b border-black/5 uppercase tracking-wide text-[10px] flex items-center gap-1.5">Model Triage Alert</span>
                                  <span className="leading-relaxed">{prepChoice === 14 ? 'Correct. Image 4 hit exactly 0.52. In medical AI, predictions between 0.40 and 0.60 must always trigger manual clinical review routines.' : 'While that was evaluated, Image 4 uniquely poses a 0.52 clinical gray-zone risk and objectively triggered the triaging circuit.'}</span>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null,
                        action: level2Progress === 2 ? (
                          <Button onClick={() => { setIsSimulating(true); setTimeout(() => { setIsSimulating(false); setLevel2Progress(3); }, 2000) }} disabled={isSimulating} size="lg" className="w-full md:w-auto font-bold bg-[#8B5CF6] hover:bg-purple-700 text-white shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                            {isSimulating ? <span className="flex items-center gap-2.5"><Activity size={18} className="animate-spin" /> Computing Neural Tensors...</span> : 'Run Prediction Model'}
                          </Button>
                        ) : level2Progress === 3 ? (
                          <Button onClick={() => setLevel2Progress(4)} disabled={prepChoice === null || prepChoice < 10} size="lg" className="w-full md:w-auto font-bold bg-[#8B5CF6] hover:bg-purple-700 text-white shadow-md">Confirm Selection</Button>
                        ) : null
                      },
                      {
                        title: "Interpretation Task",
                        desc: "Evaluate raw predictions. Explain correctness, justify reasoning against actual dataset truth labels.",
                        icon: Eye,
                        content: level2Progress >= 3 ? (
                          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="bg-amber-50 rounded-xl p-5 flex gap-5 border border-amber-100 items-start shadow-sm">
                              <img src="/images/retina/media__1773933118011.png" alt="Retina border" className="w-20 h-20 rounded-xl object-cover border border-amber-200 shadow-sm shrink-0" />
                              <div className="flex-1">
                                <h5 className="font-bold text-gray-900 mb-2 flex items-center justify-between">Image 4 Review <AlertTriangle size={18} className="text-amber-500" /></h5>
                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700 uppercase tracking-widest shadow-sm">Predicted: Glaucoma</span>
                                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 uppercase tracking-widest shadow-sm">Confidence: 0.52 (Borderline)</span>
                                </div>
                                <p className="text-sm text-amber-800/90 leading-relaxed font-medium">The model flagged this test sample as positive, but the confidence score is extremely close to the 0.5 threshold boundary. Why might the model be struggling with this specific optic disc structure?</p>
                              </div>
                            </div>

                            {level2Progress === 3 ? (
                              <div className="relative">
                                <textarea value={interpretationText} onChange={(e) => setInterpretationText(e.target.value)} rows={4} placeholder="Explain your clinical reasoning here... e.g., 'The disc pallor is ambiguous...'" className="w-full text-[15px] rounded-2xl border border-gray-200 bg-gray-50 p-5 outline-none focus:border-purple-400 focus:bg-white focus:ring-4 focus:ring-purple-50 transition-all resize-none shadow-inner" />
                                <p className="text-[10px] font-bold text-[#8B5CF6] uppercase tracking-widest mt-3 px-2 flex items-center gap-1.5 opacity-80 animate-pulse"><Zap size={14} /> Base Neural AI will strictly evaluate your reasoning</p>
                              </div>
                            ) : (() => {
                              // Dynamic Grading Logic Simulator
                              const lowerText = interpretationText.toLowerCase();
                              const mentionsThreshold = lowerText.includes("threshold") || lowerText.includes("0.5") || lowerText.includes("confidence") || lowerText.includes("borderline") || lowerText.includes("math") || lowerText.includes("score");
                              const mentionsStructure = lowerText.includes("pallor") || lowerText.includes("cup") || lowerText.includes("disc") || lowerText.includes("ratio") || lowerText.includes("structure") || lowerText.includes("ambiguous") || lowerText.includes("pale");

                              let obsScore = 40;
                              let rsScore = 30;
                              let graspScore = 30;

                              let obsTitle = "Incorrect observation:";
                              let obsDesc = "You did not clearly reference any physical anatomical features in your text.";
                              let obsIcon = <AlertTriangle size={16} className="text-rose-500 mt-0.5 shrink-0" />;

                              let rsTitle = "Missing reasoning:";
                              let rsDesc = "You missed how standard boundary algorithms and confidence limits operate.";
                              let rsIcon = <AlertTriangle size={16} className="text-rose-500 mt-0.5 shrink-0" />;

                              let sgDesc = "Explicitly consider anatomical structures (like cup-to-disc ratio) and correlate them with algorithmic threshold maths.";

                              if (mentionsStructure) {
                                obsScore = Math.floor(Math.random() * 10) + 85;
                                obsTitle = "Correct observation:";
                                obsDesc = "You successfully identified anatomical features like pathological pallor and structural ambiguities.";
                                obsIcon = <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />;
                              } else if (interpretationText.length > 25) {
                                obsScore = 65;
                                obsTitle = "Partial observation:";
                                obsDesc = "You wrote an observation but omitted specific structural identifiers like the optic disc.";
                                obsIcon = <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />;
                              }

                              if (mentionsThreshold) {
                                rsScore = Math.floor(Math.random() * 10) + 85;
                                rsTitle = "Correct reasoning:";
                                rsDesc = "You rightly explained how the neural net's confidence matrix thresholding triggers borderline diagnostic uncertainty.";
                                rsIcon = <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />;
                              } else if (interpretationText.length > 25) {
                                rsScore = 55;
                                rsTitle = "Incomplete reasoning:";
                                rsDesc = "How does this subjective structural issue computationally affect algorithmic edge-detection and probability outputs?";
                                rsIcon = <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />;
                              }

                              if (mentionsStructure && mentionsThreshold) {
                                graspScore = 95;
                                sgDesc = "Excellent clinical synthesis seamlessly merging pathological ambiguity with mathematical neural thresholds!";
                              } else if (mentionsStructure || mentionsThreshold) {
                                graspScore = 65;
                              }

                              return (
                                <div className="space-y-4 relative z-10 animate-in fade-in duration-500">
                                  <div className="bg-violet-50 border border-violet-100 rounded-xl p-5 text-[15px] text-purple-900 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-violet-200/40 rounded-full blur-3xl -mr-6 -mt-6"></div>
                                    <strong className="flex items-center gap-2 mb-2 text-purple-800"><CheckCircle2 size={18} /> Your Interpretation (Evaluated)</strong>
                                    <span className="text-purple-900/80 inline-block leading-relaxed z-10 relative italic">&quot;{interpretationText}&quot;</span>
                                  </div>

                                  <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                                    <h6 className="font-bold flex items-center gap-2 text-gray-900 mb-4 border-b pb-3"><BrainCircuit size={18} className="text-blue-500" /> AI Feedback & Scoring</h6>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center transition-colors hover:border-emerald-200">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Observation</p>
                                        <p className={`text-xl font-black ${obsScore > 75 ? 'text-emerald-600' : obsScore > 50 ? 'text-amber-500' : 'text-rose-500'}`}>{obsScore}%</p>
                                      </div>
                                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center transition-colors hover:border-amber-200">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Reasoning</p>
                                        <p className={`text-xl font-black ${rsScore > 75 ? 'text-emerald-600' : rsScore > 50 ? 'text-amber-500' : 'text-rose-500'}`}>{rsScore}%</p>
                                      </div>
                                      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-center transition-colors hover:border-violet-200">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Clinical Grasp</p>
                                        <p className={`text-xl font-black ${graspScore > 75 ? 'text-emerald-600' : graspScore > 50 ? 'text-amber-500' : 'text-rose-500'}`}>{graspScore}%</p>
                                      </div>
                                    </div>

                                    <div className="space-y-3 text-sm">
                                      <div className="flex gap-2.5 items-start text-gray-700">
                                        {obsIcon}
                                        <p><strong className={obsScore > 75 ? 'text-emerald-700' : obsScore > 50 ? 'text-amber-700' : 'text-rose-700'}>{obsTitle}</strong> {obsDesc}</p>
                                      </div>
                                      <div className="flex gap-2.5 items-start text-gray-700">
                                        {rsIcon}
                                        <p><strong className={rsScore > 75 ? 'text-emerald-700' : rsScore > 50 ? 'text-amber-700' : 'text-rose-700'}>{rsTitle}</strong> {rsDesc}</p>
                                      </div>
                                      <div className="flex gap-2.5 items-start text-blue-800 bg-violet-50/80 p-3 rounded-lg border border-blue-100 mt-2">
                                        <Lightbulb size={16} className="text-[#8B5CF6] mt-0.5 shrink-0" />
                                        <p><strong className="text-blue-700 block mb-0.5">Suggestion:</strong> {sgDesc}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        ) : null,
                        action: <Button onClick={() => setLevel2Progress(4)} size="lg" disabled={interpretationText.trim().length === 0} className="w-full md:w-auto font-bold bg-[#8B5CF6] hover:bg-purple-700 text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed text-[15px] px-8 py-6">Save Clinical Interpretation</Button>
                      },
                      {
                        title: "Evaluation Basics",
                        desc: "Compare all predictions mathematically. Apply accuracy, precision, and recall metrics to real output.",
                        icon: BarChart,
                        content: level2Progress >= 5 ? (
                          <div className="space-y-5 animate-in zoom-in duration-500">
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden group hover:border-emerald-300 transition-colors">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/30 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                                <p className="text-xs text-emerald-600 font-extrabold uppercase tracking-widest mb-2 relative z-10">System Accuracy</p>
                                <p className="text-4xl font-black text-emerald-700 tracking-tight relative z-10">80%</p>
                              </div>
                              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 shadow-sm relative overflow-hidden group hover:border-amber-300 transition-colors">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/30 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-150"></div>
                                <p className="text-xs text-amber-600 font-extrabold uppercase tracking-widest mb-2 relative z-10">Clinical Recall</p>
                                <p className="text-4xl font-black text-amber-700 tracking-tight relative z-10">85%</p>
                              </div>
                            </div>

                            <div className="bg-violet-50 border border-blue-100 rounded-xl p-4 text-sm text-violet-900 flex gap-3 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700 delay-150 fill-mode-backwards">
                              <ShieldCheck className="shrink-0 text-[#8B5CF6] mt-0.5" size={18} />
                              <div>
                                <span className="font-bold block mb-1.5 pb-1 border-b border-blue-200/50">Algorithm Reliability Link</span>
                                <span className="leading-relaxed opacity-90 inline-block">As you noted in your interpretation earlier, standard models genuinely struggle with structural optic disc ambiguity. Your clinical reasoning highlights exactly why boundary-case uncertainty intrinsically constrains diagnostic accuracy below 100%.</span>
                              </div>
                            </div>
                          </div>
                        ) : null,
                        action: <Button onClick={() => setLevel2Progress(5)} size="lg" className="w-full md:w-auto font-bold bg-[#8B5CF6] hover:bg-purple-700 text-white shadow-md text-[15px] px-8 py-6">Calculate Final Metrics</Button>
                      }
                    ].map((step, index) => {
                      const isActive = level2Progress === index;
                      const isCompleted = level2Progress > index;
                      const isLocked = level2Progress < index;

                      return (
                        <div key={index} className={`bg-white border rounded-2xl transition-all duration-300 overflow-hidden ${isActive ? 'border-purple-300 shadow-lg ring-4 ring-purple-50' :
                          isCompleted ? 'border-gray-200 bg-gray-50' :
                            'border-gray-100 opacity-60 bg-gray-50/50'
                          }`}>

                          {/* Header: Always visible */}
                          <div className={`p-6 flex items-center gap-5 ${isCompleted ? 'cursor-pointer hover:bg-gray-100/50' : ''}`} onClick={() => { if (isCompleted) setLevel2Progress(index) }}>
                            <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 shrink-0 transition-all ${isActive ? 'border-violet-500 bg-violet-100 text-[#8B5CF6] font-extrabold scale-105 shadow-md shadow-violet-100' :
                              isCompleted ? 'border-emerald-500 bg-emerald-50 text-emerald-600 font-bold' :
                                'border-gray-200 bg-white text-gray-400 font-bold'
                              }`}>
                              {isCompleted ? <CheckCircle2 size={20} /> : index + 1}
                            </div>

                            <div className="flex-1">
                              <h4 className={`font-bold text-lg ${isActive ? 'text-gray-900' : isCompleted ? 'text-gray-700' : 'text-gray-400'}`}>{step.title}</h4>
                              <p className="text-sm text-gray-500 mt-1 max-w-2xl">{step.desc}</p>
                            </div>

                            <div className="shrink-0 hidden md:flex items-center">
                              {isLocked && <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full"><ShieldCheck size={14} /> Locked</span>}
                              {isActive && <span className="text-xs font-bold text-[#8B5CF6] flex items-center gap-1.5 bg-violet-100 px-3 py-1.5 rounded-full animate-pulse">ACTIVE</span>}
                              {(!isLocked && !isActive && isCompleted) && <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 bg-emerald-100 px-3 py-1.5 rounded-full">Completed</span>}
                            </div>
                          </div>

                          {/* Content Body: Only visible if active or completed */}
                          {(isActive || isCompleted) && (
                            <div className="px-6 pb-6 pt-2">

                              <div className="pl-[4.25rem]">
                                {step.content && <div className="mb-6">{step.content}</div>}

                                {/* The Action Button (Only if Active) */}
                                {isActive && (
                                  <div className="pt-2 border-t border-gray-100 mt-4">
                                    <div className="mt-4">
                                      {step.action}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </motion.div>

                {/* Feedback / Results Output */}
                <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Level 2 Output</p>
                    <div className="text-4xl font-extrabold text-[#8B5CF6] mb-2">72%</div>
                    <p className="text-sm font-bold text-gray-900">Applied Skill Score</p>
                  </div>
                  <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3"><CheckCircle2 size={16} className="text-emerald-500" /> Workflow Mastery</h4>
                      <ul className="space-y-2">
                        {['Task Execution', 'Tool / Workflow Usage', 'Basic Interpretation'].map((s, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3"><AlertTriangle size={16} className="text-amber-500" /> Weaknesses Detected</h4>
                      <ul className="space-y-2">
                        <li className="text-xs text-gray-600 flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1" /> Preprocessing normalization missing step</li>
                        <li className="text-xs text-gray-600 flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1" /> Incorrect reasoning mapping class outputs</li>
                      </ul>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* LEVEL 3: CASE STUDY */}
            {activeLevel === 3 && (
              <div className="space-y-6">
                <motion.div variants={fadeUp} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-violet-50 text-[#8B5CF6] p-2 rounded-xl"><Target size={24} /></div>
                    <div>
                      <h2 className="text-xl font-extrabold text-gray-900">Case Study Challenge</h2>
                      <p className="text-sm text-gray-500">Solve the actual problem completely independently.</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100 mb-8">
                    <h3 className="text-lg font-extrabold text-gray-900 mb-4">Challenge: Glaucoma Detection</h3>
                    <div className="prose prose-sm text-gray-600 max-w-none space-y-4">
                      <p>
                        <strong>You are tasked with developing a detection workflow to identify signs of glaucoma from retinal (fundus) images.</strong>
                      </p>
                      <p>
                        Glaucoma is a progressive eye disease that can lead to vision loss if not detected early. Accurate identification from medical images is critical for timely diagnosis and treatment. In this challenge, you will be given a dataset of labeled fundus images. Your objective is to independently apply a detection pipeline to classify each image as glaucoma or normal.
                      </p>
                      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm my-6">
                        <h4 className="font-bold text-gray-900 mb-3">Your Requirements:</h4>
                        <ul className="list-disc pl-5 space-y-2 font-medium">
                          <li>Preprocess and prepare the image data autonomously</li>
                          <li>Run a detection or classification workflow (build or implement)</li>
                          <li>Evaluate the model&apos;s predictions rigorously</li>
                          <li>Interpret the results and justify your reasoning in a final report</li>
                        </ul>
                      </div>

                      <div className="bg-gradient-to-br from-yellow-50/50 to-white p-4 rounded-xl border border-yellow-100/60 shadow-sm my-6">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-sm">
                          <Lightbulb size={17} className="text-yellow-500" />
                          Suggested Tools & Environments:
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-start gap-2 shadow-sm">
                            <div className="text-xl mt-0.5">🐍</div>
                            <div>
                              <p className="text-xs font-black text-gray-800 mb-0.5">Google Colab & Python</p>
                              <p className="text-[10px] text-gray-500 leading-relaxed">Free online Jupyter Notebook with GPU support. Ideal for running PyTorch models.</p>
                            </div>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-start gap-2 shadow-sm">
                            <div className="text-xl mt-0.5">📷</div>
                            <div>
                              <p className="text-xs font-black text-gray-800 mb-0.5">OpenCV (cv2)</p>
                              <p className="text-[10px] text-gray-500 leading-relaxed">Perfect for loading images, resizing, and applying normalization pipelines.</p>
                            </div>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-start gap-2 shadow-sm">
                            <div className="text-xl mt-0.5">🏷️</div>
                            <div>
                              <p className="text-xs font-black text-gray-800 mb-0.5">Roboflow</p>
                              <p className="text-[10px] text-gray-500 leading-relaxed">No-code web utility to organize, inspect, or augment your image dataset.</p>
                            </div>
                          </div>
                          <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-start gap-2 shadow-sm">
                            <div className="text-xl mt-0.5">🚀</div>
                            <div>
                              <p className="text-xs font-black text-gray-800 mb-0.5">YOLOv8 or TensorFlow</p>
                              <p className="text-[10px] text-gray-500 leading-relaxed">Run state-of-the-art architectures for accurate healthcare prediction logs.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <p className="italic text-gray-500 text-xs">
                        No step-by-step guidance will be provided. You may refer to available resources, but the solution must be developed independently.
                      </p>
                    </div>

                    <div className="mt-8 flex flex-wrap items-center gap-4">
                      <a href="https://drive.google.com/file/d/11bG0i0O34Nn3r8OmNYoWYv32UD8GEUW9/view?usp=drive_link" target="_blank" rel="noreferrer">
                        <Button className="bg-[#8B5CF6] hover:bg-violet-700 text-white font-bold px-6 shadow-md shadow-violet-500/20">
                          Download Challenge Dataset
                        </Button>
                      </a>
                      <Button variant="outline" className="font-bold">
                        Submit Solution
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Final Competency Output */}
                <motion.div variants={fadeUp} className="bg-gradient-to-br from-violet-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg border border-violet-800">
                  <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheck size={140} />
                  </div>
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8">

                    <div className="md:col-span-1 flex flex-col justify-center">
                      <p className="text-xs font-bold text-violet-300 uppercase tracking-widest mb-2">Final Certification</p>
                      <div className="text-5xl font-extrabold text-white mb-2">88%</div>
                      <p className="text-sm font-bold text-violet-100 flex items-center gap-2 mb-4">
                        <UserCheck size={16} /> Intermediate Level
                      </p>
                    </div>

                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <h4 className="text-sm font-bold !text-white mb-3 tracking-wide">Competency Profile</h4>
                        <ul className="space-y-2">
                          {['Data Handling', 'Execution', 'Evaluation', 'Interpretation'].map((s, i) => (
                            <li key={i} className="text-xs text-violet-50 flex items-center justify-between">
                              <span>{s}</span>
                              <span className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                                <span className="block h-full bg-violet-400 rounded-full" style={{ width: `${Math.random() * 40 + 60}%` }} />
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <h4 className="text-sm font-bold !text-amber-200 mb-3 tracking-wide flex items-center gap-2">
                          <Zap size={14} /> AI Coaching Feedback
                        </h4>
                        <ul className="space-y-3">
                          <li className="text-xs text-violet-50/90 leading-tight">
                            <strong className="text-white">Gap:</strong> Deep understanding of evaluation metrics when False Positives are costly.
                          </li>
                          <li className="text-xs text-emerald-50/90 leading-tight">
                            <strong className="text-white">Improvement:</strong> Revisit Precision formulas. Excellent data handling execution overall.
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* AI Learning Assistant */}
      <AnimatePresence>
        {isChatOpen ? (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed top-0 bottom-0 right-0 w-80 lg:w-96 h-screen bg-white border-l border-gray-200 shadow-2xl z-[100] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#8B5CF6] p-4 text-white flex justify-between items-center shadow-md relative group">
              <div className="flex items-center gap-3">
                <div className="bg-white p-0.5 rounded-full shadow-md relative shrink-0">
                  <img src="/images/avatars/teacher_nisa.jpg" alt="Teacher Nisa" className="w-14 h-14 rounded-full object-cover" />
                  <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex flex-col items-start">
                  <h3 style={{ color: 'white' }} className="font-black text-[18px] leading-tight flex items-center gap-2 ml-1">Teacher Nisa <span className="px-1.5 py-0.5 bg-white text-purple-700 rounded-md text-[9px] uppercase tracking-widest font-black shadow-sm">AI</span></h3>
                  <p style={{ color: 'white' }} className="text-[11px] font-medium tracking-wide opacity-90 ml-2">Learning Coach</p>
                </div>
              </div>
              <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition-colors relative z-10">
                <X size={20} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-5 pt-8 overflow-y-auto bg-[#F8FAFC] flex flex-col gap-5">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && idx > 0 && <img src="/images/avatars/teacher_nisa.jpg" alt="Teacher Nisa" className="w-6 h-6 rounded-full mr-2 self-end mb-1 opacity-80 object-cover" />}
                  <div className={`max-w-[85%] p-3.5 rounded-2xl text-[14px] leading-relaxed ${msg.role === 'user' ? 'bg-[#8B5CF6] text-white rounded-br-sm shadow-sm' : 'bg-[#F1F5F9] text-gray-800 rounded-bl-sm'}`}>
                    <div className={`prose prose-sm max-w-none break-words ${msg.role === 'user' ? 'text-white prose-invert' : 'text-gray-800'}`}>
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isSimulatingChat && (
                <div className="flex justify-start">
                  <img src="/images/avatars/teacher_nisa.jpg" alt="Teacher Nisa" className="w-6 h-6 rounded-full self-end mb-1 opacity-80 object-cover" />
                  <div className="max-w-[85%] p-3.5 rounded-2xl rounded-bl-sm bg-[#F1F5F9] flex gap-1.5 items-center">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!chatInput.trim() || isSimulatingChat) return;
                const currentInput = chatInput;
                const currentHistory = [...chatMessages, { role: 'user' as const, text: currentInput }];
                setChatMessages(currentHistory);
                setChatInput("");
                setIsSimulatingChat(true);

                try {
                  const stepNames = ["Dataset Familiarisation", "Preprocessing Matrix", "Model Interaction", "Interpretation Task", "Evaluation Basics"];
                  const currentStepStr = activeLevel === 2 ? stepNames[level2Progress] : activeLevel === 1 ? "Concepts Review" : "Final Case Study";

                  const resp = await fetch('/api/chat/teacher-nisa', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      message: currentInput,
                      history: currentHistory.slice(-10).map(m => ({ role: m.role, text: m.text })),
                      moduleName: "Computer Vision: Intelligent Detection Systems",
                      levelName: `Level ${activeLevel}`,
                      currentStep: currentStepStr,
                      visibleContext: `Level 2 Progress Index: ${level2Progress}. Selected Glaucoma IDs: [${selectedGlaucoma.join(', ')}]. Prep Choice: ${prepChoice ?? 'None'}`
                    })
                  });
                  const data = await resp.json();
                  if (data.text) {
                    setChatMessages(prev => [...prev, { role: 'assistant', text: data.text }]);
                  } else {
                    setChatMessages(prev => [...prev, { role: 'assistant', text: `Connection Issue: ${data.error || 'Response parsed with no text content.'}` }]);
                  }
                } catch (err: any) {
                  setChatMessages(prev => [...prev, { role: 'assistant', text: `Client Connection Error: ${err.message || 'Unknown network error'}` }]);
                } finally {
                  setIsSimulatingChat(false);
                }
              }} className="relative flex items-center">
                <input type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask Teacher Nisa for guidance..." className="w-full pl-5 pr-12 py-3.5 bg-gray-50 border border-gray-200 hover:border-violet-200 rounded-full text-sm focus:outline-none focus:ring-4 focus:ring-purple-50 transition-all shadow-inner" />
                <button type="submit" disabled={isSimulatingChat} className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#8B5CF6] text-white w-10 rounded-full flex items-center justify-center hover:bg-violet-700 transition disabled:opacity-50">
                  <Send size={16} className={isSimulatingChat ? 'animate-pulse' : ''} />
                </button>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 bg-[#8B5CF6] rounded-full shadow-[0_10px_25px_rgba(147,51,234,0.4)] flex items-center justify-center z-[100] border-4 border-white group transition-transform"
          >
            <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            <img src="/images/avatars/teacher_nisa.jpg" alt="Teacher Nisa" className="w-full h-full rounded-full object-cover transition-opacity group-hover:opacity-0" />
            <MessageCircle className="text-white absolute transition-opacity opacity-0 group-hover:opacity-100" size={26} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
