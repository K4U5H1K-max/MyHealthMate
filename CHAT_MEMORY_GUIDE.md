# Chat Memory Implementation Guide

## Overview

MyHealthMate now includes **conversation memory** that allows the chatbot to remember previous messages in the conversation and provide context-aware responses. This enables more natural, flowing conversations where users can ask follow-up questions without repeating context.

## Features

### 1. **Session-Based Memory**
- Each chat session gets a unique session ID
- Conversation history is maintained for the duration of the session
- Session expires after 60 minutes of inactivity
- "New Chat" button starts a fresh session with cleared memory

### 2. **Context-Aware Responses**
- The AI remembers up to 10 message pairs (user + assistant)
- Follow-up questions are answered with previous context in mind
- All endpoints (symptoms, summarize, general chat) support memory

### 3. **Automatic Session Management**
- Sessions are created automatically on first message
- Session ID is maintained throughout the conversation
- No manual session management required

## How It Works

### Backend Architecture

#### 1. **Conversation Memory Service** (`conversation_memory.py`)
```python
# Manages session-based conversation history
- create_session(): Creates new session with unique ID
- add_message(): Stores user/assistant messages
- get_history(): Retrieves conversation history
- get_context_messages(): Formats history for LLM
```

#### 2. **Updated LLM Service** (`llama3_groq.py`)
- `llama3_summarize()`: Now accepts conversation_history parameter
- `chat_with_context()`: New function for conversational queries with memory

#### 3. **Enhanced API Endpoints**

**Symptom Analysis** (`/symptoms/analyze`)
```json
{
  "text": "I have a headache",
  "session_id": "optional-session-id"
}
```

**Report Summarization** (`/summarize`)
```
FormData:
- text or pdf: Report content
- session_id: Optional session ID
```

**General Chat** (`/chat`) - NEW!
```json
{
  "message": "What should I do about it?",
  "session_id": "session-id-from-previous-response"
}
```

### Frontend Integration

#### Session State Management
```typescript
const [sessionId, setSessionId] = useState<string>("");

// Session ID is automatically:
// 1. Created on first message
// 2. Stored in state
// 3. Sent with subsequent requests
// 4. Reset on "New Chat"
```

#### API Calls with Memory
All API calls now include the session ID:
```typescript
fetch(`${API_BASE_URL}/symptoms/analyze`, {
  body: JSON.stringify({
    text: symptomsText,
    session_id: sessionId || undefined,
  })
})
```

## Usage Examples

### Example 1: Follow-up Questions
```
User: "I have chest pain and shortness of breath"
AI: [Analyzes symptoms, suggests possible conditions]

User: "What tests should I get?"
AI: [Remembers previous symptoms, suggests relevant tests]

User: "Are these symptoms serious?"
AI: [Provides context-aware response based on previous discussion]
```

### Example 2: Clarification Questions
```
User: "I'm not feeling well"
AI: "Can you describe your symptoms in more detail?"

User: "I have a fever and cough"
AI: [Remembers the initial complaint and provides analysis]
```

### Example 3: Report Discussion
```
User: [Uploads blood test report]
AI: [Summarizes the report]

User: "What does the high cholesterol mean?"
AI: [Remembers the report context and explains]

User: "Should I be concerned?"
AI: [Provides context-aware guidance]
```

## Configuration

### Memory Settings
Located in `conversation_memory.py`:
```python
ConversationMemory(
    max_history=10,              # Keep last 10 message pairs
    session_timeout_minutes=60   # Session expires after 60 min
)
```

### Adjust Memory Depth
To change how many messages the LLM considers:
```python
# In endpoints (symptoms.py, summarize.py)
context = conversation_memory.get_context_messages(
    session_id, 
    max_pairs=5  # Adjust this number
)
```

## Technical Details

### Session Storage
- **Location**: In-memory dictionary (backend)
- **Structure**: 
  ```python
  {
    "session_id": {
      "messages": [{"role": "user", "content": "...", "timestamp": "..."}],
      "created_at": datetime,
      "last_accessed": datetime
    }
  }
  ```
- **Cleanup**: Automatic removal of expired sessions

### Context Window
- **Default**: Last 5 message pairs (10 messages total)
- **Configurable per endpoint**
- **Token-efficient**: Only recent messages sent to LLM

### Memory Persistence
- **Current**: In-memory (resets on server restart)
- **Future**: Can be extended to use Redis, database, or file storage

## Benefits

1. **Natural Conversations**: Users can ask follow-up questions naturally
2. **Better Context**: AI understands the full conversation flow
3. **Improved UX**: No need to repeat information
4. **Efficient**: Only relevant history is sent to LLM
5. **Privacy**: Sessions expire automatically

## Limitations

1. **Temporary Storage**: Memory is lost on server restart
2. **Session Timeout**: 60-minute inactivity limit
3. **No Cross-Session Memory**: Each "New Chat" starts fresh
4. **No User-Specific Memory**: Sessions are anonymous

## Future Enhancements

- [ ] Persistent storage (database/Redis)
- [ ] User-specific conversation history
- [ ] Conversation export/import
- [ ] Summary of long conversations
- [ ] Cross-session learning (with user permission)

## Testing

To test the chat memory:

1. **Start Backend**
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```

2. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Scenarios**
   - Ask about symptoms, then follow up with questions
   - Upload a report, then ask questions about it
   - Start a conversation, click "New Chat", verify memory is cleared
   - Wait 60 minutes, verify session expires

## Troubleshooting

### Session Not Persisting
- Check that `sessionId` state is being set in frontend
- Verify session_id is included in API requests
- Check backend logs for session creation/updates

### Memory Not Working
- Verify conversation_memory is imported correctly
- Check that conversation_history is passed to LLM functions
- Ensure GROQ_API_KEY is set in environment

### Session Expires Too Quickly
- Adjust `session_timeout_minutes` in `conversation_memory.py`
- Check server time vs client time

## API Documentation

See the interactive API docs at `http://localhost:8000/docs` for:
- Request/response schemas
- Try out endpoints with session management
- View all available parameters

---

**Note**: This implementation provides temporary chat memory for the duration of a session. For production use, consider implementing persistent storage and user authentication for longer-term memory.
