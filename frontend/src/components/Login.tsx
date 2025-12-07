import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Stethoscope, UserCircle, Mail, Lock, ArrowLeft } from "lucide-react";
import { motion } from "motion/react";

interface LoginProps {
  onLogin: (username: string, isGuest: boolean) => void;
  onBack: () => void;
}

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 },
  },
};

export function Login({ onLogin, onBack }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      onLogin(email, false);
    }
  };

  const handleGuestLogin = () => {
    onLogin("Guest User", true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 right-10 w-72 h-72 bg-emerald-300/20 rounded-full blur-3xl"
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
          className="absolute bottom-20 left-10 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl"
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
        className="max-w-md w-full relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <motion.div
            className="flex justify-center mb-6"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-xl opacity-50" />
              <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full p-5 shadow-2xl">
                <Stethoscope className="w-12 h-12 text-white" />
              </div>
            </div>
          </motion.div>
          <h1 className="text-4xl mb-2 text-gray-900 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-600">Sign in to continue to MyHealthMate</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="p-8 bg-white/80 backdrop-blur-xl shadow-2xl border border-white/20">
            <form onSubmit={handleLogin} className="space-y-5 mb-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 transition-all duration-300"
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="password" className="text-gray-700">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 transition-all duration-300"
                  />
                </div>
              </motion.div>

              <div className="text-right">
                <motion.a
                  href="#"
                  className="text-sm text-emerald-600 hover:text-emerald-700"
                  whileHover={{ x: 5 }}
                >
                  Forgot password?
                </motion.a>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Sign In
                </Button>
              </motion.div>
            </form>

            <div className="relative mb-6">
              <Separator />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-3">
                <span className="text-sm text-gray-500">or</span>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleGuestLogin}
                variant="outline"
                className="w-full border-2 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50 transition-all duration-300"
              >
                <UserCircle className="w-5 h-5 mr-2 text-emerald-600" />
                Continue as Guest
              </Button>
            </motion.div>

            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                  Sign up
                </a>
              </p>
            </motion.div>
          </Card>
        </motion.div>

        <motion.div
          className="text-center mt-6"
          variants={itemVariants}
        >
          <motion.div whileHover={{ x: -5 }}>
            <Button 
              onClick={onBack}
              variant="ghost"
              className="text-gray-600 hover:text-gray-900 hover:bg-white/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
