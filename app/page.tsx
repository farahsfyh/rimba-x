'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-orange-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-indigo-600">RimbaX</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/login"
                className="text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Personal AI Tutor,
            <span className="text-indigo-600"> Completely Free</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your study materials into personalized, conversational tutoring sessions.
            Designed for ASEAN youth who deserve world-class education.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              Start Learning Free
            </Link>
            <Link
              href="#features"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transform transition-all duration-200"
            >
              Learn More
            </Link>
          </div>
        </motion.div>

        {/* Feature Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto"
        >
          <div className="aspect-video bg-gradient-to-br from-indigo-100 to-orange-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-600 text-lg">AI Avatar Preview - Coming Soon</p>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h3 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Excel
            </h3>
            <p className="text-xl text-gray-600">
              Powerful features designed for effective learning
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-4xl font-bold text-white mb-6">
              Ready to Transform Your Learning?
            </h3>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of students across ASEAN who are learning smarter with AI
            </p>
            <Link
              href="/signup"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transform transition-all duration-200 hover:scale-105 inline-block"
            >
              Get Started Now - It's Free
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h4 className="text-2xl font-bold mb-4">RimbaX AI Tutor</h4>
            <p className="text-gray-400 mb-4">
              Empowering ASEAN youth with free, accessible, AI-powered education
            </p>
            <p className="text-gray-500 text-sm">
              © 2026 RimbaX. Built with ❤️ for students across Southeast Asia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    icon: '📚',
    title: 'Upload Any Material',
    description: 'PDF, Word, Excel, or text files - we support them all. Your materials become your personalized curriculum.',
  },
  {
    icon: '🤖',
    title: 'AI-Powered Learning',
    description: 'Google Gemini AI understands your materials and provides intelligent, context-aware tutoring.',
  },
  {
    icon: '🎤',
    title: 'Voice Interaction',
    description: 'Speak naturally in English, Malay, Indonesian, Vietnamese, or Thai. Learn the way that suits you.',
  },
  {
    icon: '🎭',
    title: '3D Avatar Tutor',
    description: 'Engaging 3D avatar that responds with emotions and gestures, making learning feel human.',
  },
  {
    icon: '🎮',
    title: 'Gamified Progress',
    description: 'Earn XP, unlock achievements, and maintain streaks. Stay motivated with every study session.',
  },
  {
    icon: '🔒',
    title: 'Secure & Private',
    description: 'Your data is encrypted and private. We take security seriously so you can focus on learning.',
  },
];
