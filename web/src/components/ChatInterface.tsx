import React, { useRef, useEffect, useState } from 'react';
import { useSessionStore } from '../store/sessionStore';
import './ChatInterface.css';

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
}

export default function ChatInterface({ onSendMessage, isLoading }: ChatInterfaceProps) {
  const { messages } = useSessionStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    await onSendMessage(userMessage);
  };

  return (
    <div className="chat-interface">
      <div className="messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h2>Welcome to OpenMux</h2>
            <p>Type a message to get started!</p>
            <div className="suggestions">
              <button onClick={() => setInput('Hello, what can you do?')}>
                Hello, what can you do?
              </button>
              <button onClick={() => setInput('Show me available tools')}>
                Show me available tools
              </button>
              <button onClick={() => setInput('Help me with a file operation')}>
                Help me with a file operation
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <p>{msg.content}</p>
                <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <p>Processing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="input-area" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !input.trim()}>
          {isLoading ? '⏳' : '📤'} Send
        </button>
      </form>
    </div>
  );
}
