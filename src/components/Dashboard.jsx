import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import { getAuth } from 'firebase/auth';
import { readGoals, getRecentPosts } from '../utils/database';
import { BellIcon, UserCircleIcon, BookOpenIcon, PencilSquareIcon, ClipboardDocumentListIcon, UserGroupIcon, VideoCameraIcon, SparklesIcon, ClipboardIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import MotivationalVideo from './MotivationalVideo';
import { readTasks, updateTask } from '../utils/database';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [goals, setGoals] = useState([])
  const [recentPosts, setRecentPosts] = useState([]);
  const [currentGoals, setCurrentGoals] = useState([]);
  const auth = getAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);{/* Switch to "true" to show under construction modal on login */}
  const handleJournalPromptClick = () => {
    navigate('/journal');
  };
  const [randomPrompt, setRandomPrompt] = useState('');
  const [recentTasks, setRecentTasks] = useState([]);


  useEffect(() => {
    setRandomPrompt(journalPrompts[Math.floor(Math.random() * journalPrompts.length)]);
  }, []);

  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        fetchGoals(user.uid);
      }
    });

    const fetchRecentPosts = async () => {
      const posts = await getRecentPosts();
      setRecentPosts(posts);
    };

    fetchRecentPosts();

    return () => unsubscribe();
  }, []);


  useEffect(() => {
    const fetchRecentTasks = async () => {
      if (auth.currentUser) {
        const fetchedTasks = await readTasks(auth.currentUser.uid);
        const activeTasks = fetchedTasks.filter(task => !task.completed);
        setRecentTasks(activeTasks.slice(0, 5)); // Get the 5 most recent active tasks
      }
    };
  
    fetchRecentTasks();
  }, [auth.currentUser]);

  useEffect(() => {
    if (auth.currentUser) {
      fetchGoals();
    }
  }, [auth.currentUser]);

  const handleAddGoal = async (goalData) => {
    if (auth.currentUser) {
      const newGoalId = await createGoal(auth.currentUser.uid, goalData);
      setGoals(prevGoals => [...prevGoals, { id: newGoalId, ...goalData }]);
    }
  };

  useEffect(() => {
    const fetchGoals = async () => {
      if (auth.currentUser) {
        const fetchedGoals = await readGoals(auth.currentUser.uid);
        if (fetchedGoals) {
          const goalsArray = Object.entries(fetchedGoals)
            .map(([id, goal]) => ({ id, ...goal }))
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 4);
          setCurrentGoals(goalsArray);
        }
      }
    };
    fetchGoals();
  }, [auth.currentUser]);

  const fetchGoals = async () => {
    if (auth.currentUser) {
      const fetchedGoals = await readGoals(auth.currentUser.uid);
      setGoals(fetchedGoals || []);
    }
  };
  const journalPrompts = [
    "What's one small step you can take today towards your biggest goal?",
    "Reflect on a recent challenge you overcame. What did you learn?",
    "Describe your ideal day. How does it align with your current goals?",
    "What's a skill you'd like to develop this month? Why is it important to you?",
    "Write about a person who inspires you. How can you embody their qualities?",
    "What are three things you're grateful for today?",
    "If you could give advice to your younger self, what would it be?",
    "Describe a recent accomplishment. How did it make you feel?",
    "What's a fear you'd like to overcome? What's one step you can take towards facing it?",
    "Imagine your life in 5 years. What do you hope to have achieved?"
  ];
  const [newsDropdownOpen, setNewsDropdownOpen] = useState(false);
  const [dailyQuote, setDailyQuote] = useState('');
  const quotes = [
  "Success is not final, failure is not fatal: It is the courage to continue that counts. – Winston Churchill",
  "The only way to do great work is to love what you do. – Steve Jobs",
  "Don’t count the days; make the days count. – Muhammad Ali",
  "Discipline is the bridge between goals and accomplishment. – Jim Rohn",
  "The harder the battle, the sweeter the victory. – Les Brown",
  "Do something today that your future self will thank you for. – Sean Patrick Flanery",
  "You miss 100% of the shots you don’t take. – Wayne Gretzky",
  "Perseverance is not a long race; it’s many short races one after the other. – Walter Elliot",
  "It always seems impossible until it's done. – Nelson Mandela",
  "Champions keep playing until they get it right. – Billie Jean King",
  "Tough times never last, but tough people do. – Robert H. Schuller",
  "Believe you can and you’re halfway there. – Theodore Roosevelt",
  "The only limit to our realization of tomorrow is our doubts of today. – Franklin D. Roosevelt",
  "What lies behind us and what lies before us are tiny matters compared to what lies within us. – Ralph Waldo Emerson",
  "Dream big and dare to fail. – Norman Vaughan",
  "Success is walking from failure to failure with no loss of enthusiasm. – Winston Churchill",
  "Action is the foundational key to all success. – Pablo Picasso",
  "Your time is limited, don’t waste it living someone else’s life. – Steve Jobs",
  "The best way to predict your future is to create it. – Abraham Lincoln",
  "Pain is temporary. Quitting lasts forever. – Lance Armstrong",
  "The more you sweat in training, the less you bleed in combat. – Richard Marcinko",
  "He who dares, wins. – SAS motto",
  "Fortune favors the bold. – Virgil",
  "Never let the fear of striking out keep you from playing the game. – Babe Ruth",
  "The man who moves a mountain begins by carrying away small stones. – Confucius",
  "Failure is simply the opportunity to begin again, this time more intelligently. – Henry Ford",
  "What you get by achieving your goals is not as important as what you become by achieving them. – Zig Ziglar",
  "Courage is being scared to death but saddling up anyway. – John Wayne",
  "It’s not whether you get knocked down, it’s whether you get up. – Vince Lombardi",
  "If you want to fly, you have to give up the things that weigh you down. – Toni Morrison"
];
  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setDailyQuote(randomQuote);
  }, []);


  return (
    <div className="flex h-screen bg-ascend-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white z-10 p-4 shadow-md">
          <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center">
            <h2 className="text-2xl font-semibold text-ascend-black">Dashboard</h2>
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 items-center">
              <div className="w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Find..."
                  className="w-full sm:w-auto pl-2 pr-2 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ascend-green focus:border-transparent"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button
                    className="flex items-center text-sm font-medium text-gray-600 hover:text-ascend-green focus:outline-none"
                    onClick={() => setNewsDropdownOpen(!newsDropdownOpen)}
                  >
                    <span>News</span>
                    <svg className="ml-1 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  {/* News dropdown content */}
                {newsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-ascend-white border border-ascend-black rounded-2xl shadow-lg py-2 px-6 z-10">
              <h3 className="text-md mb-2 text-center text-ascend-green">Latest Updates</h3>
              <p className="text-xs text-ascend-black text-center mb-2 leading-snug tracking-snug">
                We've implemented significant improvements to the Journal page, making it more user-friendly and efficient. We also made some adjustments to the account page, as well as the sidebar, to enhance the overall user experience. We hope you enjoy the updates!
              </p>
              {/* THIS IS FOR WHEN YOU TO EXPRESS MORE INFORMATION ABOUT THE UPDATES */}
              {/*
              <ul className="list-disc list-inside text-xs text-ascend-black mt-2 mb-2 text-justify">
                <li className='mb-2'>Improved the export functionality for Journal entries.</li>
                <li className='mb-2'>Enhanced the layout of journal entries for a more user-friendly experience.
                </li>
                <li className='mb-2'>Refined the design of the account page to align with the updated layout.</li>
                <li className='mb-2'>Fixed the sidebar dropdown menu for smoother navigation.</li>
              </ul>
              */}
              <p className="text-xs mb-2 text-center">Questions? <a href="mailto:silasgebhart12@gmail.com" className="text-md font-bold text-ascend-blue hover:underline">
                Email me!</a>
              </p>
              
              
              <h3 className="text-md mb-2 text-center text-ascend-orange">Feature Announcement</h3>
              <p className="text-xs mb-2 text-center">Coming soon: Artificial Intelligence Accountability Buddy!</p>
              
              <h3 className="text-md mb-2 text-center text-ascend-pink">Community Highlight</h3>
              <p className="text-xs text-center">We'll be launching to the public here within a couple of days!</p>
            </div>
          )}
                </div>
                {user && (
                  <div className="flex items-center space-x-2 group relative">
                    <p className="text-xs font-bold text-ascend-black">
                      Welcome, {user.displayName || 'Goal Ascender'}!
                    </p>
                    <div className="flex items-center">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt="Profile" 
                          className="h-8 w-8 rounded-full cursor-pointer transition-all duration-300 hover:ring-2 hover:ring-ascend-green"
                          onClick={() => navigate('/account')}
                        />
                      ) : (
                        <UserCircleIcon 
                          className="h-8 w-8 text-gray-600 cursor-pointer transition-all duration-300 hover:ring-2 hover:ring-ascend-green rounded-full" 
                          onClick={() => navigate('/account')}
                        />
                      )}
                    </div>
                    <span className="absolute top-full left-3/4 transform -translate-x-1/4 translate-y-1/4 bg-ascend-green text-ascend-black text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Account
                    </span>
                  </div>
                )}
                
                <BellIcon className="h-6 w-6 text-gray-600 duration-1000"/>
              </div>
            </div>
          </div>
          <p className="text-xs italic text-gray-600 mt-2 text-center sm:text-left">"{dailyQuote}"</p>
        </header>
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex-1 overflow-x-hidden overflow-y-auto bg-ascend-white p-4"
        >
        
              {/* Under Construction Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
              <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2 text-center">🚨Important🚨</h3>
              {user && (
                <p className="text-sm text-center m-4 font-bold text-ascend-black">
                  Hello, {user.displayName || 'Ascender'}!
                </p>
              )}
              <p className="mb-4 text-sm text-center">This application is currently under construction. Some features may not be fully functional.</p>
              <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 bg-ascend-blue text-xs text-white rounded hover:bg-ascend-blue-dark mx-auto block"
              >
              Understood
            </button>
          </div>
        </div>
      )}
          
          <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Current goals table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 md:col-span-1 bg-white rounded-sm border border-gray-300 p-4"
            >
              <h4 className="text-lg text-ascend-black mb-4 flex items-center">
                <ClipboardDocumentListIcon className="w-6 h-6 mr-2 text-ascend-black" />
                Current Goals
              </h4>
              <div className="overflow-x-auto max-h-64">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b pb-1">Goal</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b pb-1">Progress</th>
                      <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b pb-1">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGoals.map((goal) => (
                      <tr key={goal.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{goal.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {goal.progress ? `${goal.progress}%` : 'Not set'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            goal.completed ? 'bg-green-100 text-green-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {goal.completed ? 'Completed' : 'In Progress'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
            
            {/* Recent Posts */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1 md:col-span-1 bg-white rounded-sm p-4 border border-gray-300"
            >
              <h4 className="text-lg text-ascend-black mb-4 flex items-center">
                <UserGroupIcon className="w-6 h-6 mr-2 text-ascend-black" />
                Recent Posts
              </h4>
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <div key={post.id} className="border-b pb-1">
                    <div className="flex items-center text-sm">
                      <img 
                        src={post.authorPhotoURL || ' https://t3.ftcdn.net/jpg/06/33/54/78/360_F_633547842_AugYzexTpMJ9z1YcpTKUBoqBF0CUCk10.jpg'} 
                        alt={post.authorName} 
                        className="w-5 h-5 rounded-full mr-2"
                      />
                      <p className="font-semibold">{post.authorName}</p>
                    </div>
                    <p className="text-xs text-gray-600">
                      {post.content.length > 50 ? post.content.substring(0, 50) + '...' : post.content}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(post.timestamp).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Daily Prompt */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1 md:col-span-1 bg-white rounded-sm p-4 border border-gray-300"
            >
              <h4 className="text-base sm:text-lg text-ascend-black mb-2 sm:mb-4 flex items-center">
                <BookOpenIcon className="w-6 h-6 mr-2 text-ascend-black" />
                Daily Prompt
              </h4>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">Reflect on your journey and learn from your experiences:</p>
              <div className="bg-white p-6 rounded-md shadow-sm">
                <p className="text-sm text-ascend-black italic leading-relaxed">
                  "{randomPrompt}"
                </p>
              </div>
              <button 
                onClick={handleJournalPromptClick}
                className="mt-4 sm:mt-6 w-full bg-ascend-black text-white py-1 sm:py-2 px-2 sm:px-4 rounded-md text-xs sm:text-sm flex items-center justify-center"
              >
                <PencilSquareIcon className="w-5 h-5 mr-2" />
                Start Writing
              </button>
            </motion.div>
            
            {/* Active Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-1 md:col-span-1 bg-white rounded-xs p-4 border border-gray-300"
            >
              <h4 className="text-xl text-ascend-black mb-4 flex items-center">
                <ClipboardIcon className="w-6 h-6 mr-2 text-ascend-black" />
                Active Tasks
              </h4>
              <div className="overflow-y-auto max-h-64 text-xs space-y-3">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between py-3 px-4 border-t rounded-sm transition-colors">
                    <div className="flex flex-row items-center space-x-3">
                      <span className="font-medium text-ascend-black">
                        {task.title}
                      </span>
                    </div>
                    <span className="text-xs text-ascend-blue font-semibold py-1 px-2 rounded-full">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate('/tasklist')}
                className="mt-6 w-full bg-ascend-black text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center hover:bg-ascend-blue transition-colors duration-200"
              >
                <span>View All Tasks</span>
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            </motion.div>
            
            {/* Spotlight Member */}
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1 md:col-span-1 bg-white rounded-sm p-4 border border-gray-300"
            >
              <h4 className="text-lg text-ascend-black mb-4 flex items-center">
                <SparklesIcon className="w-6 h-6 mr-2 text-ascend-black" />
                Monthly Spotlight
              </h4>
              <div className='flex flex-col items-center'>
                {/* Replace with actual spotlight member data */}
                <span className="text-lg font-semibold text-center mt-4 uppercase">Coming Soon!</span>
                <br></br>
                <p className="text-sm text-ascend-black text-center leading-relaxed">
                We are excited to introduce a new feature that celebrates our members' dedication and perseverance in achieving their goals. As part of this initiative, members will have the opportunity to share their personal stories detailing their journey to success.<br></br><br></br> Our team will anonymously review and select one member to be featured as the spotlight of the month. This initiative is designed to inspire and motivate others to continue striving toward their aspirations.
                </p>  
              </div>
            </motion.div>
      
            {/* Motivational Video */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 md:col-span-2 bg-white rounded-sm p-4 border border-gray-300"
            >
              <div className="flex flex-col space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl text-ascend-black flex items-center">
                    <VideoCameraIcon className="w-6 h-6 mr-2 text-ascend-black" />
                    Daily Motivation
                  </h4>
                  <p className="text-xs text-ascend-blue leading-tight mr-1">
                    Updated <span className='italic'>weekly</span> with new motivational content!
                  </p>
                </div>
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                  <div className="w-full md:w-2/3">
                    <MotivationalVideo />
                  </div>
                  <div className="w-full md:w-1/3">
                    <p className="text-sm text-ascend-black leading-relaxed text-justify mt-4">
                      This powerful tool for personal growth offers inspiration, fresh perspectives, and emotional boosts. These videos reinforce goals, provide valuable insights, and cultivate a positive mindset. By triggering immediate action and fostering a sense of community, they significantly enhance your journey towards achieving your aspirations. Watch this week's video to ignite your motivation and stay focused on your path to success!
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.main>
        <footer className="bg-ascend-black text-white px-6">
          <div className="container mx-auto flex justify-between items-center">
            <p className="text-sm">&copy; 2023 Ascend. All rights reserved.</p>
            <nav>
              <ul className="flex space-x-4">
                <li><a href="/account" className="hover:text-ascend-green font-archivo-black">About</a></li>
                <li><a href="/account" className="hover:text-ascend-blue font-archivo-black">Privacy</a></li>
                <li><a href="/account" className="hover:text-ascend-pink font-archivo-black">Terms</a></li>
              </ul>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
