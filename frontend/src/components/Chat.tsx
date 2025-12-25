import { useState, useRef, useEffect } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { 
  Send, 
  Stethoscope, 
  User, 
  FileUp, 
  LogOut,
  Plus,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const API_BASE_URL = "http://localhost:8000";

interface ChatProps {
  username: string;
  isGuest: boolean;
  onLogout: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestedTests?: string[];
  possibleDiseases?: { name: string; confidence: number; triageLevel: string }[];
  isError?: boolean;
}

const messageVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

export function Chat({ username, isGuest, onLogout }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm MyHealthMate AI, your health companion. I can help you with:\n\n• Analyzing your symptoms and suggesting possible conditions\n• Recommending medical tests based on your symptoms\n• Summarizing your test reports in simple terms\n\n**Example symptom queries:**\n• \"I have chest pain and shortness of breath\"\n• \"I'm experiencing fever, cough, and headache\"\n• \"I have stomach pain and nausea\"\n\nHow can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const analyzeSymptomsAPI = async (symptomsText: string) => {
    try {
      // Use the new natural language endpoint with LLM extraction
      const response = await fetch(`${API_BASE_URL}/symptoms/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: symptomsText,
          session_id: sessionId || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Store session ID if returned
      if (data.session_id) {
        setSessionId(data.session_id);
      }
      
      let content = "Based on your description, here's my analysis:\n\n";
      
      // Show extracted information
      if (data.extracted_info) {
        content += "**Extracted Information:**\n";
        if (data.extracted_info.symptoms && data.extracted_info.symptoms.length > 0) {
          content += `• Symptoms: ${data.extracted_info.symptoms.join(", ")}\n`;
        }
        if (data.extracted_info.age) {
          content += `• Age: ${data.extracted_info.age}\n`;
        }
        if (data.extracted_info.sex) {
          content += `• Sex: ${data.extracted_info.sex}\n`;
        }
        if (data.extracted_info.duration) {
          content += `• Duration: ${data.extracted_info.duration}\n`;
        }
        content += "\n";
      }
      
      if (data.warnings && data.warnings.length > 0) {
        content += "⚠️ **Important Warnings:**\n";
        data.warnings.forEach((warning: string) => {
          content += `• ${warning}\n`;
        });
        content += "\n";
      }

      if (data.causes && data.causes.length > 0) {
        content += "**Possible Conditions:**\n";
        data.causes.forEach((cause: any, idx: number) => {
          content += `${idx + 1}. ${cause.name} (${(cause.confidence * 100).toFixed(1)}% confidence)\n`;
          content += `   Triage Level: ${cause.triage_level}\n`;
        });
      } else {
        content += "I couldn't identify specific conditions based on the provided symptoms.";
      }

      return {
        content,
        possibleDiseases: data.causes?.map((c: any) => ({
          name: c.name,
          confidence: c.confidence,
          triageLevel: c.triage_level,
        })) || [],
        suggestedTests: data.causes?.[0]?.tests || [],
      };
    } catch (error: any) {
      console.error("Error analyzing symptoms:", error);
      return {
        content: error.message || "I encountered an error while analyzing your symptoms. Please make sure the backend server is running and try again.",
        isError: true,
      };
    }
  };

  const summarizeReportAPI = async (file?: File, text?: string) => {
    try {
      const formData = new FormData();
      
      if (file) {
        formData.append("pdf", file);
      } else if (text) {
        formData.append("text", text);
      }
      
      // Add session ID if available
      if (sessionId) {
        formData.append("session_id", sessionId);
      }

      const response = await fetch(`${API_BASE_URL}/summarize`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Store session ID if returned
      if (data.session_id) {
        setSessionId(data.session_id);
      }
      
      let content = "📄 **Report Summary**\n\n";
      
      if (data.abstract) {
        content += `**Abstract:**\n${data.abstract}\n\n`;
      }

      if (data.bullet_points && data.bullet_points.length > 0) {
        content += "**Key Points:**\n";
        data.bullet_points.forEach((point: string) => {
          content += `• ${point}\n`;
        });
        content += "\n";
      }

      if (data.follow_up_questions && data.follow_up_questions.length > 0) {
        content += "**Follow-up Questions:**\n";
        data.follow_up_questions.forEach((question: string, idx: number) => {
          content += `${idx + 1}. ${question}\n`;
        });
      }

      return { content };
    } catch (error) {
      console.error("Error summarizing report:", error);
      return {
        content: "I encountered an error while processing your report. Please make sure the backend server is running and try again.",
        isError: true,
      };
    }
  };

  const chatAPI = async (message: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          session_id: sessionId || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Store session ID if returned
      if (data.session_id) {
        setSessionId(data.session_id);
      }

      return {
        content: data.response,
      };
    } catch (error: any) {
      console.error("Error in chat:", error);
      return {
        content: error.message || "I encountered an error. Please try again.",
        isError: true,
      };
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() && !selectedFile) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: selectedFile 
        ? `[Uploaded file: ${selectedFile.name}] ${inputValue.trim() || "Please summarize this report."}` 
        : inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputValue;
    const currentFile = selectedFile;
    setInputValue("");
    setSelectedFile(null);
    setIsTyping(true);

    try {
      let aiResponse;
      
      if (currentFile) {
        // Handle PDF summarization
        aiResponse = await summarizeReportAPI(currentFile);
      } else {
        // Check if it's a symptom analysis request
        const lowerMessage = currentInput.toLowerCase();
        if (
          lowerMessage.includes("symptom") ||
          lowerMessage.includes("feel") ||
          lowerMessage.includes("pain") ||
          lowerMessage.includes("fever") ||
          lowerMessage.includes("headache") ||
          lowerMessage.includes("cough") ||
          lowerMessage.includes("ache") ||
          lowerMessage.includes("hurt") ||
          lowerMessage.includes("sick") ||
          lowerMessage.includes("tired") ||
          lowerMessage.includes("dizzy")
        ) {
          aiResponse = await analyzeSymptomsAPI(currentInput);
        } else {
          // Use general chat API for conversational queries with memory
          aiResponse = await chatAPI(currentInput);
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse.content,
        timestamp: new Date(),
        possibleDiseases: aiResponse.possibleDiseases,
        suggestedTests: aiResponse.suggestedTests,
        isError: aiResponse.isError,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error in handleSend:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an unexpected error. Please try again.",
        timestamp: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Please select a PDF file.");
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        role: "assistant",
        content: "Hello! I'm MyHealthMate AI, your health companion. How can I assist you today?",
        timestamp: new Date(),
      },
    ]);
    setSelectedFile(null);
    setSessionId(""); // Reset session for new conversation
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30 flex flex-col">
      {/* Header */}
      <motion.div 
        className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-4 py-3 flex items-center justify-between shadow-sm"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-md opacity-50" />
            <div className="relative bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full p-2">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
          </motion.div>
          <div>
            <h1 className="text-lg text-gray-900 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              MyHealthMate
            </h1>
            <div className="flex items-center gap-1.5">
              <motion.div
                className="w-2 h-2 bg-emerald-500 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <p className="text-xs text-gray-500">Online • Ready to help</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleNewChat}
              variant="outline"
              size="sm"
              className="gap-2 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-300"
            >
              <Plus className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
          </motion.div>
          <motion.div 
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100"
            whileHover={{ scale: 1.05 }}
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span className="text-sm text-gray-700 hidden sm:inline">{username}</span>
            {isGuest && (
              <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-200">
                Guest
              </Badge>
            )}
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onLogout}
              variant="ghost"
              size="sm"
              className="text-gray-600 hover:text-gray-900 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-6 pb-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className={`flex gap-3 ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Avatar className="w-10 h-10 flex-shrink-0 shadow-md">
                    <div
                      className={`w-full h-full flex items-center justify-center ${
                        message.role === "assistant"
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600"
                          : "bg-gradient-to-br from-gray-600 to-gray-700"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <Sparkles className="w-5 h-5 text-white" />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </Avatar>
                </motion.div>

                <div
                  className={`flex-1 ${
                    message.role === "user" ? "flex justify-end" : ""
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card
                      className={`p-4 inline-block max-w-2xl shadow-lg ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0"
                          : message.isError
                          ? "bg-red-50/80 backdrop-blur-sm border-red-200"
                          : "bg-white/80 backdrop-blur-sm border-gray-100"
                      }`}
                    >
                      <p className={`whitespace-pre-wrap leading-relaxed ${message.isError ? "text-red-800" : ""}`}>
                        {message.content}
                      </p>

                      {message.possibleDiseases && message.possibleDiseases.length > 0 && (
                        <motion.div 
                          className="mt-4 p-3 bg-emerald-50 rounded-lg"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ delay: 0.3 }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-emerald-600" />
                            <p className="text-sm text-emerald-900">Possible Conditions:</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {message.possibleDiseases.map((disease, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.4 + idx * 0.1 }}
                                whileHover={{ scale: 1.05 }}
                              >
                                <Badge 
                                  variant="secondary" 
                                  className="bg-white border border-emerald-200 text-emerald-800 shadow-sm"
                                >
                                  {disease.name} ({(disease.confidence * 100).toFixed(0)}%)
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {message.suggestedTests && message.suggestedTests.length > 0 && (
                        <motion.div 
                          className="mt-4 p-3 bg-teal-50 rounded-lg"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ delay: 0.5 }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <FileUp className="w-4 h-4 text-teal-600" />
                            <p className="text-sm text-teal-900">Recommended Tests:</p>
                          </div>
                          <ul className="space-y-1.5">
                            {message.suggestedTests.map((test, idx) => (
                              <motion.li 
                                key={idx} 
                                className="text-sm flex items-start gap-2 text-teal-800"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 + idx * 0.1 }}
                              >
                                <span className="text-teal-600 mt-0.5">•</span>
                                <span>{test}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}

                      <p className={`text-xs mt-3 ${message.role === "user" ? "text-white/70" : "text-gray-500"}`}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              className="flex gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Avatar className="w-10 h-10 shadow-md">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-teal-600">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </Avatar>
              <Card className="p-4 bg-white/80 backdrop-blur-sm shadow-lg">
                <div className="flex gap-1.5">
                  <motion.div
                    className="w-2.5 h-2.5 bg-emerald-400 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2.5 h-2.5 bg-teal-400 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2.5 h-2.5 bg-cyan-400 rounded-full"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <motion.div 
        className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50 p-4 shadow-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="application/pdf"
              className="hidden"
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                size="icon"
                className={`flex-shrink-0 border-2 transition-all duration-300 ${
                  selectedFile
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-emerald-400 hover:bg-emerald-50"
                }`}
                title={selectedFile ? `Selected: ${selectedFile.name}` : "Upload test report (PDF)"}
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className={`w-5 h-5 ${selectedFile ? "text-emerald-600" : "text-gray-600"}`} />
              </Button>
            </motion.div>
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                selectedFile
                  ? `File selected: ${selectedFile.name}. Add comments or press send...`
                  : "Describe your symptoms or ask about test reports..."
              }
              className="flex-1 border-2 border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 bg-white/50 transition-all duration-300"
            />
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={handleSend}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white flex-shrink-0 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={!inputValue.trim() && !selectedFile}
              >
                <Send className="w-5 h-5" />
              </Button>
            </motion.div>
          </div>
          <motion.p 
            className="text-xs text-gray-500 mt-2 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            AI-generated responses are for informational purposes only. Consult a healthcare professional for medical advice.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
