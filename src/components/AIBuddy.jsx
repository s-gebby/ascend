import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { readGoals } from '../utils/database';
import openai from '../services/openai';
import { SparklesIcon } from '@heroicons/react/24/outline';
import  { motion } from 'framer-motion';
function AIBuddy() {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadGoals = async () => {
      const userGoals = await readGoals(currentUser.uid);
      setGoals(userGoals || {});
    };
    loadGoals();
  }, [currentUser]);

  const sendMessageToAI = async (message) => {
    setIsLoading(true);
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { 
            role: "system", 
            content: "You are a motivational AI accountability partner. Your role is to help users achieve their goals by providing encouragement, advice, and accountability. Keep responses concise and actionable."
          },
          { role: "user", content: message }
        ],
        model: "gpt-4o-mini",  // This is the correct model identifier
        max_tokens: 150  // Limit response length to reduce costs
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error:', error);
      return "I'm currently unavailable. Please try again shortly.";
    } finally {
      setIsLoading(false);
    }
  };  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    
    // Prevent rapid-fire requests
    if (isLoading) return;
    
    const newUserMessage = { role: 'user', content: userInput };
    setChatMessages(prev => [...prev, newUserMessage]);
    setUserInput('');

    const aiResponse = await sendMessageToAI(userInput);
    const newAiMessage = { role: 'assistant', content: aiResponse };
    setChatMessages(prev => [...prev, newAiMessage]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="lg:col-span-1 md:col-span-1 bg-white rounded-sm p-4 border border-gray-300"
    >
      <h4 className="text-xl text-ascend-black mb-4 flex items-center">
        <SparklesIcon className="w-6 h-6 mr-2 text-ascend-black" />
        AI Accountability Buddy
      </h4>
      <div className="overflow-y-auto max-h-64 text-xs space-y-3">
        {chatMessages.map((message, index) => (
          <div
            key={index}
            className={`p-2 rounded-lg ${
              message.role === 'user'
                ? 'bg-ascend-blue text-white ml-auto max-w-[80%]'
                : 'bg-gray-100 text-ascend-black mr-auto max-w-[80%]'
            }`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 text-ascend-black p-2 rounded-lg mr-auto">
            Thinking...
          </div>
        )}
      </div>
      <div className="flex gap-2 mt-6">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          placeholder="Chat with your AI buddy..."
          className="flex-1 p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ascend-green"
        />
        <button
          onClick={handleSendMessage}
          disabled={isLoading}
          className="bg-ascend-black text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center hover:bg-ascend-blue transition-colors duration-200"
        >
          Send
        </button>
      </div>
    </motion.div>
  );
}

export default AIBuddy;
