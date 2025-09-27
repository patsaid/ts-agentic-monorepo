import React, { useState, useEffect } from 'react';
import { agentApi, conversationApi, type User, type Conversation, type AgentResponse } from '../services/api';

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

    setLoading(true);
    try {
      const response: AgentResponse = await agentApi.ask({
        userId: user._id,
        conversationId: currentConversationId || undefined,
        question,
      });

      setMessages(prev => [...prev, { question, answer: response.answer }]);
      setCurrentConversationId(response.conversationId);
      setQuestion('');

      // Reload conversations to update the list
      await loadConversations();
    } catch (error) {
      console.error('Failed to ask agent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWeatherTest = async () => {
    setLoading(true);
    try {
      const response = await agentApi.getWeather('Paris', user._id);
      setMessages(prev => [...prev, {
        question: 'What is the weather in Paris?',
        answer: response.answer
      }]);
      setCurrentConversationId(response.conversationId);
      await loadConversations();
    } catch (error) {
      console.error('Failed to get weather:', error);
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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-white shadow-lg">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Conversations</h2>
            <button
              onClick={onLogout}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </div>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>

        <div className="p-4">
          <button
            onClick={startNewConversation}
            className="w-full mb-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            New Conversation
          </button>

          <div className="space-y-2">
            {conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => selectConversation(conv)}
                className={`p-3 rounded cursor-pointer ${
                  currentConversationId === conv._id
                    ? 'bg-indigo-100 border-indigo-500'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="text-sm font-medium truncate">
                  {conv.summary || 'New Conversation'}
                </div>
                <div className="text-xs text-gray-500">
                  {conv.messages.length} messages
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 border-b">
          <h1 className="text-xl font-semibold">Agentic Orchestration Chat</h1>
          <div className="mt-2 space-x-2">
            <button
              onClick={handleWeatherTest}
              disabled={loading}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
            >
              Test Weather
            </button>
            <a
              href="http://localhost:3000/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            >
              API Docs
            </a>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-end">
                <div className="bg-indigo-600 text-white rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                  {msg.question}
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 max-w-xs lg:max-w-md">
                  {msg.answer}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2">
                Agent is thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="bg-white border-t p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask the agent anything..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}