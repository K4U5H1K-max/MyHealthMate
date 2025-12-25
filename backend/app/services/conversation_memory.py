"""
Conversation memory management for chat sessions.
Stores conversation history temporarily in memory for context-aware responses.
"""
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import uuid

class ConversationMemory:
    """Manages conversation history for chat sessions"""
    
    def __init__(self, max_history: int = 10, session_timeout_minutes: int = 60):
        """
        Initialize conversation memory.
        
        Args:
            max_history: Maximum number of message pairs to keep in history
            session_timeout_minutes: How long to keep session data before cleanup
        """
        self.sessions: Dict[str, Dict] = {}
        self.max_history = max_history
        self.session_timeout = timedelta(minutes=session_timeout_minutes)
    
    def create_session(self) -> str:
        """Create a new conversation session and return session ID"""
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "messages": [],
            "created_at": datetime.now(),
            "last_accessed": datetime.now()
        }
        return session_id
    
    def add_message(self, session_id: str, role: str, content: str):
        """
        Add a message to the conversation history.
        
        Args:
            session_id: The session identifier
            role: Either "user" or "assistant"
            content: The message content
        """
        if session_id not in self.sessions:
            # Auto-create session if it doesn't exist
            self.sessions[session_id] = {
                "messages": [],
                "created_at": datetime.now(),
                "last_accessed": datetime.now()
            }
        
        session = self.sessions[session_id]
        session["messages"].append({
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat()
        })
        session["last_accessed"] = datetime.now()
        
        # Keep only the last N message pairs
        if len(session["messages"]) > self.max_history * 2:
            session["messages"] = session["messages"][-(self.max_history * 2):]
    
    def get_history(self, session_id: str) -> List[Dict[str, str]]:
        """
        Get conversation history for a session.
        
        Args:
            session_id: The session identifier
            
        Returns:
            List of message dictionaries with role and content
        """
        if session_id not in self.sessions:
            return []
        
        self.sessions[session_id]["last_accessed"] = datetime.now()
        return self.sessions[session_id]["messages"]
    
    def clear_session(self, session_id: str):
        """Clear conversation history for a specific session"""
        if session_id in self.sessions:
            del self.sessions[session_id]
    
    def cleanup_old_sessions(self):
        """Remove sessions that haven't been accessed recently"""
        now = datetime.now()
        expired_sessions = [
            sid for sid, data in self.sessions.items()
            if now - data["last_accessed"] > self.session_timeout
        ]
        for sid in expired_sessions:
            del self.sessions[sid]
    
    def get_context_messages(self, session_id: str, max_pairs: int = 5) -> List[Dict[str, str]]:
        """
        Get recent conversation history formatted for LLM context.
        
        Args:
            session_id: The session identifier
            max_pairs: Maximum number of user-assistant message pairs to return
            
        Returns:
            List of messages formatted for LLM (with role and content keys only)
        """
        history = self.get_history(session_id)
        # Get the last N message pairs (each pair is user + assistant)
        recent_messages = history[-(max_pairs * 2):]
        
        # Format for LLM (remove timestamp, keep only role and content)
        return [
            {"role": msg["role"], "content": msg["content"]}
            for msg in recent_messages
        ]

# Global conversation memory instance
conversation_memory = ConversationMemory(max_history=10, session_timeout_minutes=60)
