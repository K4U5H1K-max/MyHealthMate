import { useState } from "react";
import { Welcome } from "./components/Welcome";
import { Login } from "./components/Login";
import { Chat } from "./components/Chat";
import { AnimatePresence, motion } from "motion/react";

type Screen = "welcome" | "login" | "chat";

interface User {
  username: string;
  isGuest: boolean;
}

const pageVariants = {
  initial: { 
    opacity: 0,
    scale: 0.98,
  },
  animate: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: { 
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [user, setUser] = useState<User | null>(null);

  const handleGetStarted = () => {
    setCurrentScreen("login");
  };

  const handleLogin = (username: string, isGuest: boolean) => {
    setUser({ username, isGuest });
    setCurrentScreen("chat");
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen("welcome");
  };

  const handleBack = () => {
    setCurrentScreen("welcome");
  };

  return (
    <AnimatePresence mode="wait">
      {currentScreen === "welcome" && (
        <motion.div
          key="welcome"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Welcome onGetStarted={handleGetStarted} />
        </motion.div>
      )}
      
      {currentScreen === "login" && (
        <motion.div
          key="login"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Login onLogin={handleLogin} onBack={handleBack} />
        </motion.div>
      )}
      
      {currentScreen === "chat" && user && (
        <motion.div
          key="chat"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Chat 
            username={user.username}
            isGuest={user.isGuest}
            onLogout={handleLogout}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

