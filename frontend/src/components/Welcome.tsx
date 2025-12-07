import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Activity, FileText, MessageSquare, Stethoscope, Sparkles, Shield, Clock } from "lucide-react";
import { motion } from "motion/react";

interface WelcomeProps {
  onGetStarted: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

export function Welcome({ onGetStarted }: WelcomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <motion.div
        className="max-w-5xl w-full relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center mb-12" variants={itemVariants}>
          <motion.div
            className="flex justify-center mb-6"
            variants={floatingVariants}
            animate="animate"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-xl opacity-50" />
              <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full p-5 shadow-2xl">
                <Stethoscope className="w-14 h-14 text-white" />
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <h1 className="text-5xl md:text-6xl mb-4 text-gray-900 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              MyHealthMate
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto">
              Your intelligent health companion for symptom analysis and test report interpretation
            </p>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-8 md:p-10 mb-6 bg-white/80 backdrop-blur-xl shadow-2xl border border-white/20">
            <div className="grid md:grid-cols-3 gap-8 mb-10">
              {[
                {
                  icon: MessageSquare,
                  title: "Describe Symptoms",
                  description: "Share your symptoms in natural language and get instant analysis",
                  gradient: "from-emerald-500 to-teal-500",
                  bgGradient: "from-emerald-50 to-teal-50",
                },
                {
                  icon: Activity,
                  title: "Disease Prediction",
                  description: "Get possible diagnoses and recommended medical tests",
                  gradient: "from-teal-500 to-cyan-500",
                  bgGradient: "from-teal-50 to-cyan-50",
                },
                {
                  icon: FileText,
                  title: "Report Summary",
                  description: "Upload test reports and receive easy-to-understand summaries",
                  gradient: "from-cyan-500 to-blue-500",
                  bgGradient: "from-cyan-50 to-blue-50",
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="text-center p-6 rounded-2xl hover:bg-gradient-to-br hover:from-white/50 hover:to-transparent transition-all duration-300 group"
                  whileHover={{ scale: 1.05, y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className={`bg-gradient-to-br ${feature.bgGradient} rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-shadow duration-300`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className={`w-10 h-10 bg-gradient-to-br ${feature.gradient} bg-clip-text text-transparent`} style={{ filter: 'drop-shadow(0 0 20px currentColor)' }} />
                  </motion.div>
                  <h3 className="mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {[
                { icon: Sparkles, text: "AI-Powered Analysis" },
                { icon: Shield, text: "Private & Secure" },
                { icon: Clock, text: "24/7 Available" },
              ].map((badge, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100"
                  whileHover={{ scale: 1.05 }}
                >
                  <badge.icon className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-700">{badge.text}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-5 mb-8 backdrop-blur-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-sm text-amber-900 leading-relaxed">
                <strong className="text-amber-800">Disclaimer:</strong> This tool is for informational purposes only and should not replace professional medical advice. 
                Always consult with a qualified healthcare provider for medical diagnosis and treatment.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-10 py-6 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
              >
                Get Started
                <motion.span
                  className="ml-2 inline-block"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Button>
            </motion.div>
          </Card>
        </motion.div>

        <motion.p
          className="text-center text-sm text-gray-600"
          variants={itemVariants}
        >
          By using MyHealthMate, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
}
