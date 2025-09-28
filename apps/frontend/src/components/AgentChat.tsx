import React, { useState, useEffect, useRef } from 'react';
import {
  agentApi,
  conversationApi,
  type User,
  type Conversation,
  type AgentResponse,
} from '../services/api';

interface AgentChatProps {
  user: User;
  onLogout: () => void;
}

export default function AgentChat({ user, onLogout }: AgentChatProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ question: string; answer: string }[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadConversations();
  }, [user._id]);

  const loadConversations = async () => {
    try {
      const convs = await agentApi.getConversations(user._id);
      setConversations(convs);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    const currentQuestion = question;
    setQuestion('');
    setMessages((prev) => [...prev, { question: currentQuestion, answer: '' }]);
    setLoading(true);

    try {
      const response: AgentResponse = await agentApi.ask({
        userId: user._id,
        conversationId: currentConversationId || undefined,
        question: currentQuestion,
      });

      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 ? { ...msg, answer: response.answer } : msg,
        ),
      );
      setCurrentConversationId(response.conversationId);
      await loadConversations();
    } catch (error) {
      console.error('Failed to ask agent:', error);
      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1
            ? { ...msg, answer: 'Sorry, I encountered an error. Please try again.' }
            : msg,
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = async (actionType: 'weather' | 'info', param?: string) => {
    setLoading(true);
    const actionQuestion =
      actionType === 'weather'
        ? `What's the weather in ${param || 'Paris'}?`
        : `Find information about ${param || 'Alice'}`;

    setMessages((prev) => [...prev, { question: actionQuestion, answer: '' }]);

    try {
      let response: AgentResponse;
      if (actionType === 'weather') {
        response = await agentApi.getWeather(param || 'Paris', user._id);
      } else {
        response = await agentApi.getLocalInfo(param || 'Alice', user._id);
      }

      setMessages((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1 ? { ...msg, answer: response.answer } : msg,
        ),
      );
      setCurrentConversationId(response.conversationId);
      await loadConversations();
    } catch (error) {
      console.error('Failed to execute quick action:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setCurrentConversationId(conversation._id);
    setMessages(conversation.messages);
  };

  const startNewConversation = async () => {
    try {
      const { conversationId } = await conversationApi.create(user._id);
      setCurrentConversationId(conversationId);
      setMessages([]);
      await loadConversations();
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  return (
    <div className="h-screen flex" style={{ backgroundColor: 'var(--color-background)' }}>
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden flex flex-col glass-effect border-r`}
        style={{ borderColor: 'var(--color-border)' }}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {user.email.split('@')[0]}
                </h3>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  AI Assistant
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg transition-colors hover:bg-red-500/10 text-red-400 hover:text-red-300"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={startNewConversation}
            className="w-full py-3 px-4 rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 hover-lift btn-animate"
          >
            <svg
              className="w-5 h-5 inline mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            New Conversation
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv._id}
              onClick={() => selectConversation(conv)}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 hover-lift ${
                currentConversationId === conv._id
                  ? 'bg-blue-600/20 border border-blue-500/30'
                  : 'hover:bg-white/5'
              }`}
              style={{
                backgroundColor:
                  currentConversationId === conv._id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
              }}
            >
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium truncate"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {conv.summary || 'New Conversation'}
                  </p>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
                    {conv.messages.length} messages
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div
          className="px-6 py-4 border-b glass-effect"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg transition-colors hover:bg-white/5"
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: 'var(--color-text-primary)' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <div>
                <h1
                  className="text-xl font-semibold"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  AI Assistant
                </h1>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Powered by OpenAI GPT-4o-mini
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleQuickAction('weather', 'Tokyo')}
                disabled={loading}
                className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover-lift disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                ☀️ Weather
              </button>
              <button
                onClick={() => handleQuickAction('info', 'Bob')}
                disabled={loading}
                className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover-lift disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                👤 User Info
              </button>
              <a
                href="http://localhost:3000/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 hover-lift text-blue-400 hover:text-blue-300"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                }}
              >
                📚 API Docs
              </a>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3
                className="text-xl font-semibold mb-2"
                style={{ color: 'var(--color-text-primary)' }}
              >
                Welcome to your AI Assistant
              </h3>
              <p className="text-base mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                Ask me anything! I can help with weather, user information, and general questions.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  "What's the weather like today?",
                  'Tell me about Alice',
                  'Help me with my project',
                  'Explain machine learning',
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setQuestion(suggestion)}
                    className="px-4 py-2 text-sm rounded-lg transition-all duration-200 hover-lift"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      color: 'var(--color-text-secondary)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index} className="space-y-4 fade-in">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="max-w-2xl">
                  <div className="flex items-end space-x-2">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl rounded-br-md px-6 py-3 shadow-lg">
                      <p className="whitespace-pre-wrap">{msg.question}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex justify-start">
                <div className="max-w-2xl">
                  <div className="flex items-end space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <div
                      className="rounded-2xl rounded-bl-md px-6 py-3 shadow-lg"
                      style={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                      }}
                    >
                      {msg.answer ? (
                        <p
                          className="whitespace-pre-wrap"
                          style={{ color: 'var(--color-text-primary)' }}
                        >
                          {msg.answer}
                        </p>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                            <div
                              className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                              style={{ animationDelay: '0.2s' }}
                            ></div>
                            <div
                              className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                              style={{ animationDelay: '0.4s' }}
                            ></div>
                          </div>
                          <span
                            className="text-sm"
                            style={{ color: 'var(--color-text-secondary)' }}
                          >
                            AI is thinking...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 border-t glass-effect" style={{ borderColor: 'var(--color-border)' }}>
          <form onSubmit={handleSubmit} className="flex items-end space-x-4">
            <div className="flex-1">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask your AI assistant anything..."
                className="w-full px-4 py-3 rounded-xl border resize-none transition-all duration-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text-primary)',
                  minHeight: '48px',
                  maxHeight: '120px',
                }}
                rows={1}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-6 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 btn-animate hover-lift flex items-center space-x-2"
            >
              {loading ? (
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
              <span>{loading ? 'Sending' : 'Send'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
