import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from '../../store/toastStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const EXAMPLE_QUERIES = [
  'How many leave days do I have left?',
  'When is the next payroll?',
  'How do I apply for sick leave?',
];

/**
 * Floating chatbot widget for employee portal
 *
 * Features:
 * - Floating button in bottom-right corner
 * - Expandable chat window (400px x 600px)
 * - Message history with user and bot messages
 * - Input field with send button
 * - Typing indicator when bot is responding
 * - Auto-scroll to latest message
 * - Minimize/maximize functionality
 * - Keyboard support (Escape to close)
 * - Responsive and accessible
 */
export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard support: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputValue.trim();
    if (!messageContent) return;

    // Create user message
    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      // Call chatbot API
      const response = await api.post('/chatbot/query', {
        query: messageContent,
      });

      // Create bot response message
      const botMessage: Message = {
        id: `msg-${Date.now()}-bot`,
        role: 'assistant',
        content: response.data.response || 'I apologize, I could not process your request.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error: any) {
      // Error handling
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again later.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);

      toast.error(
        error.response?.data?.message ||
        'Failed to get chatbot response. Please try again.'
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleExampleClick = (query: string) => {
    handleSendMessage(query);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
          style={{
            backgroundColor: '#1E40AF', // blue-800
            color: 'white',
            fontFamily: '"Fira Sans", sans-serif',
          }}
          aria-label="Open chatbot"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl shadow-2xl animate-fade-in"
          style={{
            width: '400px',
            height: '600px',
            backgroundColor: 'white',
            fontFamily: '"Fira Sans", sans-serif',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 rounded-t-2xl"
            style={{ backgroundColor: '#1E40AF', color: 'white' }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              <h3 className="font-semibold text-sm">HR Assistant</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label="Minimize chat"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
            style={{ backgroundColor: '#F8FAFC' }}
          >
            {messages.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div
                  className="flex items-center justify-center w-16 h-16 rounded-full"
                  style={{ backgroundColor: '#DBEAFE' }}
                >
                  <MessageCircle
                    className="w-8 h-8"
                    style={{ color: '#1E40AF' }}
                  />
                </div>
                <div className="text-center space-y-2">
                  <h4
                    className="font-semibold text-sm"
                    style={{ color: '#1E3A8A' }}
                  >
                    How can I help you today?
                  </h4>
                  <p className="text-xs" style={{ color: '#64748B' }}>
                    Try asking one of these questions:
                  </p>
                </div>
                <div className="space-y-2 w-full">
                  {EXAMPLE_QUERIES.map((query, index) => (
                    <button
                      key={index}
                      onClick={() => handleExampleClick(query)}
                      className="w-full px-3 py-2 text-left text-xs rounded-lg border transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{
                        backgroundColor: 'white',
                        borderColor: '#E2E8F0',
                        color: '#1E3A8A',
                      }}
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Messages
              <>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'rounded-br-none'
                          : 'rounded-bl-none'
                      }`}
                      style={{
                        backgroundColor:
                          message.role === 'user' ? '#1E40AF' : 'white',
                        color: message.role === 'user' ? 'white' : '#1E3A8A',
                        border:
                          message.role === 'assistant'
                            ? '1px solid #E2E8F0'
                            : 'none',
                      }}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div
                      className="px-4 py-2 rounded-lg rounded-bl-none"
                      style={{
                        backgroundColor: 'white',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{
                            backgroundColor: '#64748B',
                            animationDelay: '0ms',
                          }}
                        />
                        <div
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{
                            backgroundColor: '#64748B',
                            animationDelay: '150ms',
                          }}
                        />
                        <div
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{
                            backgroundColor: '#64748B',
                            animationDelay: '300ms',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-4 py-3 border-t"
            style={{ borderColor: '#E2E8F0', backgroundColor: 'white' }}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your question..."
              disabled={isTyping}
              className="flex-1 px-3 py-2 text-sm rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: '#E2E8F0',
                backgroundColor: '#F8FAFC',
                color: '#1E3A8A',
              }}
              aria-label="Chat message input"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="p-2 rounded-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{
                backgroundColor: '#F59E0B', // amber-500
                color: 'white',
              }}
              aria-label="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* Backdrop blur when open (subtle overlay) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 transition-opacity"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.05)',
            backdropFilter: 'blur(2px)',
          }}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};
