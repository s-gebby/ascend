import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { readGoals, readTasks, getJournalEntries, readUserData } from '../utils/database';
import openai from '../services/openai';
import { SparklesIcon } from '@heroicons/react/24/outline';
import  { motion } from 'framer-motion';
function AIBuddy() {
  const { currentUser } = useAuth();
  const [goals, setGoals] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const aggregateUserContext = async (userId) => {
    const goals = await readGoals(userId);
    const tasks = await readTasks(userId);
    const journalEntries = await getJournalEntries(userId);
    const stats = await readUserData(userId);
    
    return {
      goals,
      tasks,
      journalEntries,
      stats,
      lastActivity: new Date().toISOString()
    };
  };

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
      const systemMessage = {
        role: "system",
        content: `You are Cindy, an advanced AI accountability partner integrated throughout the Ascend platform. You have access to:
          - Goals and progress tracking
          - Journal entries and reflections
          - Task management and completion status
          - Community interactions and encouragement
          - Statistical performance data
          - Account information and preferences

          Your capabilities include:
          - Analyzing goal progress and providing actionable feedback
          - Suggesting journal prompts based on user's goals
          - Prioritizing tasks and recommending time management strategies
          - Offering motivation based on community engagement
          - Interpreting performance statistics to guide improvement
          - Personalizing advice based on user preferences and history`
      };

      const userContext = await aggregateUserContext(currentUser.uid);
  
      const completion = await openai.chat.completions.create({
        messages: [
          systemMessage,
          {
            role: "system",
            content: `Current user context: ${JSON.stringify(userContext)}`
          },
          { role: "user", content: message }
        ],
        model: "gpt-3.5-turbo-16k",
        max_tokens: 500,
        temperature: 0.7
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
        Cindy the AI Buddy
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
          placeholder="Chat with your Cindy..."
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
