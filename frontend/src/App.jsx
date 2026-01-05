import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, HelpCircle } from 'lucide-react';
import AgentModal from './AgentModal';

// Simple function to format text with markdown-like syntax
const formatMessage = (text) => {
  // Replace **bold** with <strong>
  let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Replace *italic* or single asterisks with emphasis (but not already in bold)
  formatted = formatted.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
  
  // Replace line breaks with <br>
  formatted = formatted.replace(/\n/g, '<br>');
  
  return formatted;
};

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I am Reliance Support Assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agentForm, setAgentForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    category: '',
    timeSlot: '',
    issue: '' 
  });
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
      // Build conversation history (last 10 messages for context)
      const conversationHistory = messages
        .slice(-10)
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      const response = await fetch('http://localhost:3000/query/request_query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: trimmedMessage,
          history: conversationHistory
        })
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

  const handleAgentRequest = () => {
    const confirmMessage = {
      id: Date.now(),
      text: `Thank you ${agentForm.name}! Your request has been received.\n\nCategory: ${agentForm.category}\nPreferred Contact Time: ${agentForm.timeSlot}\n\nA human agent will contact you at ${agentForm.email} or ${agentForm.phone} during your preferred time regarding: "${agentForm.issue}".`,
      sender: 'bot',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, confirmMessage]);
    setShowAgentModal(false);
    setAgentForm({ name: '', email: '', phone: '', category: '', timeSlot: '', issue: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-100 flex">
      {/* FAQ Section */}
      <div className="w-80 bg-white border-r border-gray-200 shadow-xl flex flex-col">
        <div className="p-6 bg-gradient-to-r from-teal-600 to-cyan-600 text-white">
          <div className="flex items-center gap-3 mb-2">
            <HelpCircle size={28} />
            <h2 className="text-2xl font-bold">FAQs</h2>
          </div>
          <p className="text-teal-100 text-sm">Quick answers to common questions</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {faqs.map((faq, index) => (
            <button
              key={index}
              onClick={() => handleFaqClick(faq)}
              className="w-full text-left p-4 bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 rounded-xl border border-teal-200 hover:border-teal-300 transition-all duration-200 shadow-sm hover:shadow-md group"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-teal-500 group-hover:bg-cyan-500 transition-colors"></div>
                <span className="text-gray-700 text-sm leading-relaxed group-hover:text-gray-900 transition-colors">
                  {faq}
                </span>
              </div>
            </button>
          ))}
        </div>
        
        <div className="p-4 bg-gradient-to-r from-gray-50 to-teal-50 border-t border-gray-200">
          <button
            onClick={() => setShowAgentModal(true)}
            className="w-full py-3 px-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200"
          >
            Talk to Human Agent
          </button>
          <div className="text-xs text-gray-600 text-center mt-3">
            <p className="font-semibold mb-1">Need more help?</p>
            <p>Click any question to get started</p>
          </div>
        </div>
      </div>

      {/* Chatbot Section */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <MessageCircle size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Reliance Support Assistant</h1>
              <p className="text-teal-100 text-sm mt-1">We're here to help you 24/7</p>
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
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-br-sm'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                }`}
              >
                <div 
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }}
                />
                <p
                  className={`text-xs mt-2 ${
                    message.sender === 'user' ? 'text-teal-200' : 'text-gray-400'
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
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-teal-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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
              className="flex-1 px-5 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-800"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:from-teal-700 hover:to-cyan-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold"
            >
              <Send size={20} />
              Send
            </button>
          </div>
        </div>
      </div>


      <AgentModal
        isOpen={showAgentModal}
        onClose={() => setShowAgentModal(false)}
        onSubmit={handleAgentRequest}
        formData={agentForm}
        setFormData={setAgentForm}
      />
    </div>
  );
}