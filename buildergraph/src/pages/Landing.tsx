import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import { Container } from '../components/ui/Container';
import { Button } from '../components/ui/Button';
import {
  IoShieldCheckmark,
  IoGitBranch,
  IoLockClosed,
  IoGlobe,
  IoRocket,
  IoCheckmarkCircle,
  IoTrendingUp,
  IoPeople,
  IoStar,
  IoArrowForward
} from 'react-icons/io5';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const stats = [
    { value: '27M+', label: 'Developers Globally', icon: <IoPeople /> },
    { value: '59%', label: 'Resume Fraud Rate', icon: <IoShieldCheckmark /> },
    { value: '$50B+', label: 'Tech Hiring Market', icon: <IoTrendingUp /> },
    { value: '1 in 4', label: 'Fake Candidates by 2028', icon: <IoStar /> },
  ];

  const features = [
    {
      icon: <IoGitBranch />,
      title: 'Immutable Commit History',
      description: 'Blockchain timestamps prove when you wrote code—no more backdating or falsifying contributions.',
      gradient: 'from-violet-500 to-purple-600',
    },
    {
      icon: <IoGlobe />,
      title: 'Cross-Platform Integration',
      description: 'Link GitHub, GitLab, Bitbucket commits into one verifiable portfolio. Your work, unified.',
      gradient: 'from-cyan-500 to-blue-600',
    },
    {
      icon: <IoPeople />,
      title: 'Peer Validation',
      description: 'Other developers cryptographically sign code quality assessments. Trust built on proof.',
      gradient: 'from-pink-500 to-rose-600',
    },
    {
      icon: <IoLockClosed />,
      title: 'Privacy-Preserving',
      description: 'Prove private repo contributions via zero-knowledge without exposing your code.',
      gradient: 'from-emerald-500 to-teal-600',
    },
  ];

  const benefits = [
    'No more resume fraud—59% of hiring managers suspect AI-enhanced resumes',
    'Portable credentials you own, not GitHub',
    'Eliminate $50+ background checks that take days',
    'Stop GitHub green square gaming',
    'Privacy-first: prove work without exposing code',
    'Network effect: share your portfolio on LinkedIn/Twitter',
  ];

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ========================================
          HERO SECTION - Animated Background
      ======================================== */}
      <div className="relative min-h-screen flex items-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background-elevated">
          {/* Animated Orbs */}
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl"
            animate={{
              x: [-100, 100, -100],
              y: [-50, 50, -50],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(123,97,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(123,97,255,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
        </div>

        {/* Content */}
        <Container maxWidth="2xl" className="py-20 relative z-10">
          <div className="text-center">


            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold text-text-primary mb-6 leading-tight"
            >
              Your Developer Identity,{' '}
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Verified & Portable
              </span>
            </motion.h1>

            {/* Typing Animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-accent font-semibold mb-6 h-16"
            >
              <TypeAnimation
                sequence={[
                  'Stop Resume Fraud',
                  2000,
                  'Build Developer Trust',
                  2000,
                  'Own Your Reputation',
                  2000,
                  'Prove Your Contributions',
                  2000,
                ]}
                wrapper="span"
                speed={50}
                repeat={Infinity}
              />
            </motion.div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-lg md:text-xl text-text-secondary mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              A decentralized reputation network linking GitHub commits, PRs, and code reviews into{' '}
              <span className="text-primary font-semibold">verifiable Knowledge Assets</span>.
              Create portable portfolios that prevent resume fraud.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                size="lg"
                onClick={() => navigate('/profile-setup')}
                className="group px-8 py-4 text-lg"
              >
                <span>Create Your Profile</span>
                <IoRocket className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="px-8 py-4 text-lg"
              >
                View Demo Dashboard
              </Button>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-text-secondary"
            >
              <div className="flex items-center gap-2">
                <IoCheckmarkCircle className="text-accent" />
                <span>Built on DKG</span>
              </div>
              <div className="flex items-center gap-2">
                <IoCheckmarkCircle className="text-accent" />
                <span>Immutable Proof</span>
              </div>
              <div className="flex items-center gap-2">
                <IoCheckmarkCircle className="text-accent" />
                <span>Privacy-First</span>
              </div>
            </motion.div>
          </div>
        </Container>
      </div>

      {/* ========================================
          STATS SECTION
      ======================================== */}
      <div className="relative py-20 bg-background-elevated border-y border-white/5">
        <Container maxWidth="2xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
              The Problem Is <span className="text-accent">Massive</span>
            </h2>
            <p className="text-text-secondary max-w-2xl mx-auto">
              By 2028, Gartner predicts 1 in 4 candidates will be "fake" (AI-enhanced/fabricated).
              The tech hiring market needs verifiable proof.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-background-card rounded-xl p-6 border border-white/10 text-center hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-4xl mb-3 text-accent">{stat.icon}</div>
                <div className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-text-secondary">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </Container>
      </div>

      {/* ========================================
          FEATURES SECTION
      ======================================== */}
      <div className="relative py-20">
        <Container maxWidth="2xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-4">
              Why <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">DKG</span> Is Essential
            </h2>
            <p className="text-lg text-text-secondary max-w-2xl mx-auto">
              Decentralized Knowledge Graph technology makes developer reputation verifiable,
              portable, and fraud-proof—for the first time ever.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group relative bg-background-card rounded-2xl p-8 border border-white/10 hover:border-primary/50 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient Glow */}
                <div className={`absolute top - 0 right - 0 w - 32 h - 32 bg - gradient - to - br ${feature.gradient} opacity - 20 blur - 3xl group - hover: opacity - 30 transition - opacity`} />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className={`inline - flex items - center justify - center w - 14 h - 14 rounded - xl bg - gradient - to - br ${feature.gradient} text - white text - 2xl mb - 4`}>
                    {feature.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-text-primary mb-3 group-hover:text-accent transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-text-secondary leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </div>

      {/* ========================================
          BENEFITS SECTION
      ======================================== */}
      <div className="relative py-20 bg-background-elevated border-y border-white/5">
        <Container maxWidth="2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-6">
                Your Reputation, <br />
                <span className="text-accent">Your Asset</span>
              </h2>
              <p className="text-lg text-text-secondary mb-8">
                BuilderGraph creates a portable, verifiable developer profile that you own—not GitHub,
                not any platform. Your work history follows you, proven and immutable.
              </p>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <IoCheckmarkCircle className="text-accent text-xl flex-shrink-0 mt-1" />
                    <span className="text-text-secondary">{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Column - Visual */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative bg-background-card rounded-2xl p-8 border border-white/10">
                {/* Floating Stats */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl p-6 mb-4 border border-primary/30"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-text-secondary mb-1">Reputation Score</div>
                      <div className="text-3xl font-bold text-text-primary">8,547</div>
                    </div>
                    <IoTrendingUp className="text-4xl text-accent" />
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="bg-gradient-to-r from-violet-500/20 to-purple-600/20 rounded-xl p-6 mb-4 border border-violet-500/30"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-text-secondary mb-1">Verified Commits</div>
                      <div className="text-3xl font-bold text-text-primary">1,247</div>
                    </div>
                    <IoGitBranch className="text-4xl text-violet-400" />
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="bg-gradient-to-r from-emerald-500/20 to-teal-600/20 rounded-xl p-6 border border-emerald-500/30"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-text-secondary mb-1">Peer Endorsements</div>
                      <div className="text-3xl font-bold text-text-primary">47</div>
                    </div>
                    <IoStar className="text-4xl text-emerald-400" />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </Container>
      </div>

      {/* ========================================
          CTA SECTION
      ======================================== */}
      <div className="relative py-20">
        <Container maxWidth="2xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-12 md:p-16 border border-primary/30 overflow-hidden"
          >
            {/* Background Animation */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{ backgroundSize: '200% 200%' }}
            />

            <div className="relative z-10 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-text-primary mb-6">
                Ready to Build Your <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Verifiable Reputation?
                </span>
              </h2>
              <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
                Join thousands of developers creating fraud-proof portfolios.
                Your contributions, forever verified on the blockchain.
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/profile-setup')}
                className="group px-10 py-5 text-lg"
              >
                <span>Get Started Now</span>
                <IoArrowForward className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <p className="text-sm text-text-secondary mt-4">
                No credit card required • Free to start • Own your data
              </p>
            </div>
          </motion.div>
        </Container>
      </div>
    </div>
  );
};

export default Landing;
