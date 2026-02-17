import React, { useState, useEffect } from 'react';
import { useSessionStore } from './store/sessionStore';
import ChatInterface from './components/ChatInterface';
import VNCViewer from './components/VNCViewer';
import ToolsPanel from './components/ToolsPanel';
import './App.css';

function App() {
  const { sessionId, createSession, addMessage } = useSessionStore();
  const [activeTab, setActiveTab] = useState<'chat' | 'browser' | 'tools'>('chat');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Create a new session on app load
    if (!sessionId) {
      createSession();
    }
  }, [sessionId, createSession]);

  const handleSendMessage = async (message: string) => {
    if (!sessionId) return;
    
    setIsLoading(true);
    addMessage('user', message);
    
    try {
      const response = await fetch(`http://localhost:8000/api/sessions/${sessionId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      
      const data = await response.json();
      addMessage('assistant', data.response);
    } catch (error) {
      console.error('Error sending message:', error);
      addMessage('assistant', 'Error: Failed to process message');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 OpenMux</h1>
        <p>The AI that actually does things</p>
      </header>

      <div className="app-container">
        <nav className="tabs">
          <button 
            className={`tab ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            💬 Chat
          </button>
          <button 
            className={`tab ${activeTab === 'browser' ? 'active' : ''}`}
            onClick={() => setActiveTab('browser')}
          >
            🌐 Browser
          </button>
          <button 
            className={`tab ${activeTab === 'tools' ? 'active' : ''}`}
            onClick={() => setActiveTab('tools')}
          >
            🛠️ Tools
          </button>
        </nav>

        <div className="content">
          {activeTab === 'chat' && (
            <ChatInterface 
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          )}
          {activeTab === 'browser' && <VNCViewer sessionId={sessionId} />}
          {activeTab === 'tools' && <ToolsPanel sessionId={sessionId} />}
        </div>
      </div>
    </div>
  );
}

export default App;
