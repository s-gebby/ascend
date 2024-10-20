import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { XMarkIcon, Bars3Icon, ChevronDownIcon, ChevronUpIcon, HomeIcon, ChartBarIcon, ClipboardIcon, BookOpenIcon, UserGroupIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline';

export default function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isDashboardExpanded, setIsDashboardExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const handleUpgradeClick = (e) => {
    e.preventDefault();
    setShowModal(true);
  };
  const toggleNestedList = () => {
    setIsDashboardExpanded(!isDashboardExpanded);
  };
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };
  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

    return (
      <>
      <button
        onClick={toggleSidebar}
        className="fixed top-4 right-4 p-2 bg-ascend-black text-white rounded md:hidden z-50"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <Bars3Icon className="h-6 w-6" />
        )}
      </button>
      <div className={`fixed inset-y-0 left-0 z-40 bg-ascend-black text-white w-64 min-h-screen p-4 
      md:relative md:translate-x-0
      transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
      transition-transform duration-300 ease-in-out flex flex-col`}>
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-6">
          <Link to="/" className="text-2xl font-bold font-archivo flex">
            <span className="text-ascend-orange animate-color-change">A</span>
            <span className="text-ascend-pink animate-color-change">S</span>
            <span className="text-ascend-blue animate-color-change">C</span>
            <span className="text-ascend-green animate-color-change">E</span>
            <span className="text-ascend-white animate-color-change">N</span>
            <span className="text-ascend-black animate-color-change">D</span>
          </Link>
            <button onClick={() => setIsOpen(false)} className="text-white md:hidden">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav>
            <ul>
              <li className="mb-4">
                <div className="flex items-center justify-between py-2 px-4 hover:bg-ascend-blue rounded cursor-pointer text-sm">
                  <span onClick={handleDashboardClick} className="flex items-center">
                    <HomeIcon className="h-5 w-5 mr-2" />
                    Dashboard
                  </span>
                  <button onClick={toggleNestedList} className="ml-2">
                    {isDashboardExpanded ? (
                      <ChevronUpIcon className="h-4 w-4" />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {isDashboardExpanded && (
                  <ul className="ml-2 mt-2">
                    <li className="mb-2">
                      <Link to="/stats" className="flex items-center hover:bg-ascend-blue py-1 px-4 rounded text-sm">
                        <ChartBarIcon className="h-4 w-4 mr-2" />
                        Stats
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
              <li className="mb-4">
                <Link to="/goals" className="flex items-center py-2 px-4 hover:bg-ascend-blue rounded text-sm">
                  <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                  Goals
                </Link>
              </li>
              <li className="mb-4">
                <Link to="/journal" className="flex items-center py-2 px-4 hover:bg-ascend-blue rounded text-sm">
                  <BookOpenIcon className="h-5 w-5 mr-2" />
                  Journal
                </Link>
              </li>
              <li className="mb-4">
                <Link to="/tasklist" className="flex items-center py-2 px-4 hover:bg-ascend-blue rounded text-sm">
                  <ClipboardIcon className="h-4 w-4 mr-2" />
                  Tasks
                </Link>
              </li>
              <li className="mb-4">
                <Link to="/community" className="flex items-center py-2 px-4 hover:bg-ascend-blue rounded text-sm">
                  <UserGroupIcon className="h-5 w-5 mr-2" />
                  Community
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="mt-auto">
          <button onClick={handleUpgradeClick} className="block w-full bg-ascend-blue text-white py-2 px-4 rounded hover:text-gray-300 transition duration-300 mb-2 text-center text-sm">
            Upgrade
          </button>
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Coming Soon!</h2>
            <p className="mb-4">A paid version will be launched soon. If you are currently a member, it will be a free rollout for you.</p>
            <button onClick={() => setShowModal(false)} className="bg-ascend-black text-xs text-white py-2 px-4 rounded hover:bg-red-600">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
