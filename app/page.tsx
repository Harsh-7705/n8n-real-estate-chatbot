'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';

type ChatMessage = {
  role: 'user' | 'bot';
  message: string;
};

type UserInfo = {
  name: string;
  email: string;
  phone: string;
};

export default function Chatbot() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo>({ name: '', email: '', phone: '' });
  const [userInfoSubmitted, setUserInfoSubmitted] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let storedSessionId = localStorage.getItem('sessionId');
    if (!storedSessionId) {
      storedSessionId = uuidv4();
      localStorage.setItem('sessionId', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.email || !userInfo.phone) {
      alert('Please fill in all fields.');
      return;
    }

    const res = await fetch('https://aiginno-agentic.onrender.com/webhook-test/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...userInfo, session_id: sessionId }),
    });

    if (res.ok) {
      setUserInfoSubmitted(true);
      alert('Thank you! You can now ask your real estate questions.');
    } else {
      alert('Failed to save info. Please try again.');
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const question = input.trim();
    setChatHistory((prev) => [...prev, { role: 'user', message: question }]);
    setInput('');
    setLoading(true);

    const res = await fetch('https://aiginno-agentic.onrender.com/webhook-test/ai-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, session_id: sessionId }),
    });

    if (res.ok) {
      const data = await res.json();
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'bot',
          message: data.answer || 'Sorry, I couldn’t understand that.',
        },
      ]);
    } else {
      setChatHistory((prev) => [
        ...prev,
        {
          role: 'bot',
          message: '❌ Something went wrong while processing your question.',
        },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-4 flex flex-col h-screen bg-background text-text-primary">
      <h1 className="text-3xl font-bold mb-4 text-primary">🏡 Real Estate AI Chatbot</h1>

      {!userInfoSubmitted ? (
        <form onSubmit={handleUserInfoSubmit} className="space-y-4 bg-surface p-6 rounded-xl shadow-bubble border border-border">
          <input
            type="text"
            placeholder="Your Name"
            className="w-full border border-border p-3 rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition"
            value={userInfo.name}
            onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
            required
            aria-label="Your Name"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-border p-3 rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition"
            value={userInfo.email}
            onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
            required
            aria-label="Email"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full border border-border p-3 rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition"
            value={userInfo.phone}
            onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
            required
            aria-label="Phone Number"
          />
          <button
            type="submit"
            className="bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition disabled:bg-border"
          >
            Submit
          </button>
        </form>
      ) : (
        <>
          <div className="flex-1 overflow-auto mb-4 border border-border rounded-xl p-4 bg-surface shadow-bubble flex flex-col gap-2">
            {chatHistory.map((chat, idx) => (
              <div
                key={idx}
                className={`max-w-[75%] px-4 py-3 rounded-bubble shadow-bubble text-base whitespace-pre-line break-words transition
                  ${chat.role === 'user'
                    ? 'ml-auto bg-primary text-white rounded-tr-none'
                    : 'mr-auto bg-background text-text-primary border border-border rounded-tl-none'}`}
                style={{ alignSelf: chat.role === 'user' ? 'flex-end' : 'flex-start' }}
                aria-live={chat.role === 'bot' ? 'polite' : undefined}
              >
              // <span style={{ whiteSpace: 'pre-wrap' }}>{chat.message}</span>
               <div
                  key={idx}
                  className="mr-auto bg-background text-text-primary border border-border rounded-bubble rounded-tl-none shadow-bubble px-4 py-3 max-w-[75%]"
                  style={{ alignSelf: 'flex-start' }}
                >
                  <div className="prose prose-sm max-w-full text-text-primary">
                    <ReactMarkdown>{chat.message}</ReactMarkdown>
                  </div>
                </div>

              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
            <input
              type="text"
              className="flex-grow border border-border p-3 rounded-lg bg-background text-text-primary focus:outline-none focus:ring-2 focus:ring-primary transition"
              placeholder="Ask anything about our real estate listings..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={loading}
              aria-label="Chat input"
            />
            <button
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition disabled:bg-border"
              disabled={loading}
              aria-label="Send message"
            >
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
