'use client';

import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Brain,
  Mic,
  ArrowRight,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Menu,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    checkUser();
  }, [supabase]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-light overflow-x-hidden">
      {/* Navigation */}
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              R
            </div>
            <span className="text-2xl font-bold text-secondary tracking-tight">
              Rimba<span className="text-primary">X</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-muted hover:text-primary transition-colors font-medium"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-muted hover:text-primary transition-colors font-medium"
            >
              How it Works
            </a>
            {user ? (
              <Link
                href="/dashboard"
                className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center gap-2"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 flex items-center gap-2"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-secondary"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-100 p-4 flex flex-col gap-4 shadow-lg">
            <a
              href="#features"
              className="text-text-muted font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-muted font-medium py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              How it Works
            </a>
            {user ? (
              <Link
                href="/dashboard"
                className="bg-primary text-white px-5 py-3 rounded-lg font-medium w-full flex items-center justify-center gap-2"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="bg-primary text-white px-5 py-3 rounded-lg font-medium w-full flex items-center justify-center gap-2"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-bl from-primary/5 to-transparent -z-10 rounded-bl-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl -z-10" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold border border-primary/20">
              <Sparkles size={14} />
              <span>AI-Powered Learning Revolution</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight text-secondary">
              Your Personal AI Tutor, <br />
              <span className="text-primary relative inline-block">
                Completely Free
                <svg
                  className="absolute w-full h-3 -bottom-1 left-0 text-accent/30"
                  viewBox="0 0 100 10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 5 Q 50 10 100 5"
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                  />
                </svg>
              </span>
            </h1>

            <p className="text-xl text-muted max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Transform your study materials into personalized, conversational
              tutoring sessions. Designed for ASEAN youth who deserve
              world-class education.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {user ? (
                <Link
                  href="/dashboard"
                  className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight size={20} />
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Start Learning Free
                  <ArrowRight size={20} />
                </Link>
              )}
              <a
                href="#features"
                className="bg-white hover:bg-gray-50 text-secondary border-2 border-gray-200 hover:border-primary/30 px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Learn More
              </a>
            </div>

            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-sm text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-success" />
                <span>No Credit Card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-success" />
                <span>Always Free</span>
              </div>
            </div>
          </motion.div>

          {/* Hero Visual - Mock Chat UI */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mx-auto w-full max-w-md lg:max-w-full perspective-1000"
          >
            <div className="relative bg-surface-dark rounded-2xl shadow-soft-lg border border-gray-800 overflow-hidden transform rotate-y-12 hover:rotate-0 transition-transform duration-500 ease-out">
              {/* Mock Header */}
              <div className="bg-[#252525] p-4 flex items-center gap-3 border-b border-gray-800">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="ml-4 flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] text-white font-bold">
                    AI
                  </div>
                  <span className="text-gray-300 text-sm font-medium">
                    RimbaX Tutor
                  </span>
                </div>
              </div>

              {/* Mock Chat Content */}
              <div className="p-6 space-y-4 h-[400px] bg-[#1E1E1E]">
                {/* AI Message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white mt-1">
                    <Brain size={16} />
                  </div>
                  <div className="bg-[#2D2D2D] p-4 rounded-2xl rounded-tl-none text-gray-200 text-sm shadow-sm max-w-[85%] border border-gray-700">
                    <p>
                      Hello! I've analyzed your uploaded PDF on
                      "Photosynthesis". Would you like a summary or should we
                      start a quiz?
                    </p>
                  </div>
                </div>

                {/* User Message */}
                <div className="flex gap-3 justify-end">
                  <div className="bg-primary/10 p-4 rounded-2xl rounded-tr-none text-primary text-sm shadow-sm max-w-[85%] border border-primary/20">
                    <p>
                      Let's start with a quick quiz to test my understanding!
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-white mt-1">
                    <span className="text-xs font-bold">ME</span>
                  </div>
                </div>

                {/* AI Message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white mt-1">
                    <Brain size={16} />
                  </div>
                  <div className="bg-[#2D2D2D] p-4 rounded-2xl rounded-tl-none text-gray-200 text-sm shadow-sm max-w-[85%] border border-gray-700">
                    <p>
                      Great! Question 1: What is the primary pigment used in
                      photosynthesis to absorb light energy?
                    </p>
                    <div className="mt-3 grid gap-2">
                      <button className="w-full text-left px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition-colors border border-gray-700">
                        A. Chlorophyll
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 transition-colors border border-gray-700">
                        B. Mitochondria
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mock Input Area */}
              <div className="p-4 bg-[#252525] border-t border-gray-800 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-gray-400">
                  <Mic size={14} />
                </div>
                <div className="flex-1 h-10 bg-[#1E1E1E] rounded-full border border-gray-700 flex items-center px-4 text-sm text-gray-500">
                  Type your answer...
                </div>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -right-4 top-20 bg-white p-3 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3 animate-bounce duration-[3000ms]">
              <div className="bg-green-100 p-2 rounded-lg text-green-600">
                <FileText size={20} />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">
                  File Uploaded
                </p>
                <p className="text-sm font-bold text-gray-800">
                  Biology_Notes.pdf
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
              Everything You Need to Excel
            </h2>
            <p className="text-muted max-w-2xl mx-auto text-lg">
              Powerful features designed for effective learning, powered by
              advanced AI.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group p-8 rounded-2xl bg-light border border-transparent hover:border-primary/20 hover:bg-white hover:shadow-soft-lg transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-bottom" />
                <div className={`w-14 h-14 ${feature.bg} rounded-xl flex items-center justify-center ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-secondary mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-dark relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent rounded-full blur-[120px] translate-y-1/3 -translate-x-1/3" />
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Join thousands of students across ASEAN who are learning smarter
            with AI. No credit card required.
          </p>
          {user ? (
            <Link
              href="/dashboard"
              className="bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 flex items-center justify-center gap-3 mx-auto"
            >
              Open Dashboard
              <ArrowRight size={20} />
            </Link>
          ) : (
            <Link
              href="/signup"
              className="bg-primary hover:bg-primary-hover text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 flex items-center justify-center gap-3 mx-auto"
            >
              Get Started Now
              <ArrowRight size={20} />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0A0A0A] py-12 border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center text-white text-xs font-bold">
                  R
                </div>
                <span className="text-xl font-bold text-white">
                  Rimba<span className="text-primary">X</span> AI Tutor
                </span>
              </div>
              <p className="text-gray-500 text-sm">
                Empowering ASEAN youth with free, accessible, AI-powered
                education
              </p>
            </div>

            <div className="flex gap-6 text-gray-400">
              <a href="#" className="hover:text-primary transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-primary transition-colors">
                Contact
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-900 text-center text-gray-600 text-sm">
            <p>
              © 2026 RimbaX. Built with{' '}
              <span className="text-primary">♥</span> for students across
              Southeast Asia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: <FileText size={28} />,
    title: 'Upload Any Material',
    description: 'PDF, Word, Excel, or text files - we support them all. Your materials become your personalized curriculum instantly.',
    bg: 'bg-blue-100',
    color: 'text-blue-600'
  },
  {
    icon: <Brain size={28} />,
    title: 'AI-Powered Learning',
    description: 'Google Gemini AI understands your materials and provides intelligent, context-aware tutoring tailored to you.',
    bg: 'bg-primary/10',
    color: 'text-primary'
  },
  {
    icon: <Mic size={28} />,
    title: 'Voice Interaction',
    description: 'Speak naturally in English, Malay, Indonesian, Vietnamese, or Thai. Learn the way that suits you best.',
    bg: 'bg-accent/10',
    color: 'text-accent'
  }
];
