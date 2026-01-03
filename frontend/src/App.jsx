import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, HelpCircle } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I am Croma Support Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const faqs = [
    "How can I check my product warranty?",
    "How do I raise a service request?",
    "Is installation provided for ACs and TVs?",
    "What is the return policy?",
    "How long does delivery take?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (message = inputValue) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: trimmedMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/query/request_query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: trimmedMessage })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      const botMessage = {
        id: Date.now() + 1,
        text: data.response || data.reply || "I'm sorry, I couldn't process your request.",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaqClick = (faq) => {
    setInputValue(faq);
    handleSend(faq);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex">
      {/* FAQ Section */}
      <div className="w-80 bg-white border-r border-gray-200 shadow-xl flex flex-col">
        <div className="p-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle size={28} />
            <h2 className="text-2xl font-bold">FAQs</h2>
          </div>
          <p className="text-purple-100 text-sm">Quick answers to common questions</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {faqs.map((faq, index) => (
            <button
              key={index}
              onClick={() => handleFaqClick(faq)}
              className="w-full text-left p-4 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 rounded-xl border border-purple-200 hover:border-purple-300 transition-all duration-200 shadow-sm hover:shadow-md group"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-purple-500 group-hover:bg-indigo-500 transition-colors"></div>
                <span className="text-gray-700 text-sm leading-relaxed group-hover:text-gray-900 transition-colors">
                  {faq}
                </span>
              </div>
            </button>
          ))}
        </div>
        
        <div className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 border-t border-gray-200">
          <div className="text-xs text-gray-600 text-center">
            <p className="font-semibold mb-1">Need more help?</p>
            <p>Click any question to get started</p>
          </div>
        </div>
      </div>

      {/* Chatbot Section */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <MessageCircle size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Croma Support Assistant</h1>
              <p className="text-purple-100 text-sm mt-1">We're here to help you 24/7</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md px-5 py-3 rounded-2xl shadow-md ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <p
                  className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-purple-200' : 'text-gray-400'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 px-5 py-3 rounded-2xl rounded-bl-sm shadow-md">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-gray-200 shadow-2xl">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              disabled={isLoading}
              className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold"
            >
              <Send size={20} />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}