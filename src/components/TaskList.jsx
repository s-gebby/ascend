import { useState, useEffect, useCallback } from 'react';
import { getAuth } from 'firebase/auth';
import { readTasks, createTask, updateTask, deleteTask, readGoals } from '../utils/database';
import { TextInput, Button, Select, Textarea, Modal, Checkbox, Paper, Group, Text, Badge, Progress } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import { BellIcon, UserCircleIcon, TrashIcon, PencilIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', goalId: null, dueDate: null });
  const [opened, { open, close }] = useDisclosure(false);
  const [user, setUser] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [sortBy, setSortBy] = useState('createdAt');
  const [filterCompleted, setFilterCompleted] = useState('active');
  const completedTasksCount = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length
  const pendingTasks = totalTasks - completedTasksCount

  const auth = getAuth();
  const navigate = useNavigate();

  const fetchTasks = useCallback(async () => {
    if (auth.currentUser) {
      try {
        const fetchedTasks = await readTasks(auth.currentUser.uid);
        setTasks(fetchedTasks || []);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        setTasks([]);
      }
    } else {
      setTasks([]);
    }
  }, [auth.currentUser]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchTasks();
      }
    });

    return () => unsubscribe();
  }, [auth, fetchTasks]);

  useEffect(() => {
    const fetchGoals = async () => {
      if (auth.currentUser) {
        try {
          const fetchedGoals = await readGoals(auth.currentUser.uid);
          setGoals(fetchedGoals || []);
        } catch (error) {
          console.error("Error fetching goals:", error);
        }
      }
    };
    fetchGoals();
  }, [auth.currentUser]);

  const handleAddTask = async () => {
    if (newTask.title && newTask.goalId && auth.currentUser) {
      try {
        const taskData = {
          ...newTask,
          completed: false,
          createdAt: new Date().toISOString()
        };
        await createTask(auth.currentUser.uid, taskData);
        setNewTask({ title: '', description: '', goalId: null, dueDate: null });
        close();
        fetchTasks();
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };
const [showCompletionModal, setShowCompletionModal] = useState(false);
const [taskToComplete, setTaskToComplete] = useState(null);

const handleToggleTask = async (taskId) => {
  if (auth.currentUser) {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (taskToUpdate) {
      const updatedTask = { 
        ...taskToUpdate, 
        completed: !taskToUpdate.completed,
        completedAt: !taskToUpdate.completed ? new Date().toISOString() : null
      };
      await updateTask(auth.currentUser.uid, taskId, updatedTask);
      await fetchTasks();
    }
  }
};
const moveTaskToCompleted = () => {
  if (taskToComplete) {
    setCompletedTasks([...completedTasks, {...taskToComplete, completed: true}]);
    setTasks(tasks.filter(t => t.id !== taskToComplete.id));
    setShowCompletionModal(false);
    setTaskToComplete(null);
  }
};

const moveTaskToActive = (taskId) => {
  const task = completedTasks.find(t => t.id === taskId);
  if (task) {
    setTasks([...tasks, {...task, completed: false}]);
    setCompletedTasks(completedTasks.filter(t => t.id !== taskId));
  }
};

  const handleDeleteTask = async (taskId) => {
    await deleteTask(auth.currentUser.uid, taskId);
    fetchTasks();
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    open();
  };

  const handleUpdateTask = async () => {
    if (editingTask && auth.currentUser) {
      try {
        await updateTask(auth.currentUser.uid, editingTask.id, editingTask);
        close();
        setEditingTask(null);
        fetchTasks();
      } catch (error) {
        console.error("Error updating task:", error);
      }
    }
  };
    const sortedAndFilteredTasks = tasks
    .filter(task => {
      if (filterCompleted === 'all') {
        return true;
      }
      return filterCompleted === 'completed' ? task.completed : !task.completed;
    })
    .sort((a, b) => {
      if (sortBy === 'createdAt') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0;
    });
  const calculateCountdown = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const difference = due - now;
  
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    const isLessThan3Days = days < 3;
  
    return {
      text: `${days}d ${hours}h ${minutes}m ${seconds}s`,
      isUrgent: isLessThan3Days
    };
  };

  const [countdown, setCountdown] = useState({});
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateCountdown(tasks.dueDate));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  <Badge 
    leftSection={<CalendarIcon className="h-3 w-3" />} 
    color={countdown.isUrgent ? "red" : "ascend-green"} 
    size="sm"
  >
    Due in {countdown.text}
  </Badge>
  const getUpcomingDeadlines = (tasks) => {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  
    return {
      "Due 24 Hours": tasks.filter(task => new Date(task.dueDate) <= in24Hours).length,
      "Next 3 Days": tasks.filter(task => new Date(task.dueDate) <= in3Days).length,
    };
  };
  
  const getRecentCompletedTasks = (tasks) => {
    return tasks
      .filter(task => task.completed)
      .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
      .slice(0, 3);
  };

  return (
    <div className="flex flex-col h-screen bg-ascend-white md:flex-row">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white z-10 p-4 shadow-md">
        <div className="flex flex-col space-y-2 sm:flex-row sm:justify-between sm:items-center">
          <h2 className="text-2xl font-semibold text-ascend-black">Tasks</h2>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 items-center">
            <div className="w-full sm:w-auto">
              <input
                type="text"
                placeholder="Find..."
                className="w-full sm:w-auto pl-2 pr-8 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ascend-green focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-4">
              {user && (
                <p className="text-xs font-bold text-ascend-black">
                  Welcome, {user.displayName || 'Goal Ascender'}!
                </p>
              )}
              {user && user.photoURL ? (
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
              <BellIcon className="h-6 w-6 text-gray-600 duration-1000"/>
            </div>
          </div>
        </div>
      </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6">
          <Paper className="mb-6 text-ascend-black max-w-4xl mx-auto">
            <h1 className="text-2xl mb-2 text-center text-ascend-black">
              Why Tasks?
            </h1>
            <div className="p-1 rounded-lg">
              <p className="mb-2 text-center text-md text-ascend-black"> 
                Breaking down your goals into manageable tasks is a proven strategy for success!
              </p>
              <div className="flex items-center justify-center mb-2">
                <div className="w-16 h-1 mt-2 bg-ascend-black rounded"></div>
              </div>
            </div>
          </Paper>


          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6 mt-2">
  
            {/* Task Statistics */}
            <Paper p="md" withBorder className="flex-1 bg-white shadow-sm rounded-lg">
              <Text size="lg" weight={700} className="mb-6 text-center text-ascend-black">Task Overview</Text>
              <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <Text size="2xl" weight={700} color="ascend-blue">{totalTasks}</Text>
                  <Text size="sm" color="dimmed">Total Tasks</Text>
                </div>
                <div className="text-center">
                  <Text size="2xl" weight={700} color="ascend-green">{completedTasksCount}</Text>
                  <Text size="sm" color="dimmed">Completed</Text>
                </div>
                <div className="text-center">
                  <Text size="2xl" weight={700} color="ascend-pink">{pendingTasks}</Text>
                  <Text size="sm" color="dimmed">Pending</Text>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="mb-6">
                <Text size="md" weight={600} p="md" className="text-ascend-black text-center">Progress</Text>
                <div className="w-5/6 mx-auto">
                  <Progress
                    sections={[
                      { value: (completedTasksCount / totalTasks) * 100, color: 'ascend-green' },
                      { value: (pendingTasks / totalTasks) * 100, color: 'ascend-orange' },
                    ]}
                    size="xl"
                  />
                </div>
              </div>
            </Paper>

            {/* Upcoming Deadlines */}
            <Paper p="md" withBorder className="flex-1 bg-white shadow-sm rounded-lg">
              <Text size="lg" color="red" weight={700} className="mb-6 text-center">Upcoming Deadlines</Text>
              <Text size="xs" color="dimmed" className="text-center">
                  Make sure to attack these tasks! They're due soon!
              </Text>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {Object.entries(getUpcomingDeadlines(tasks)).map(([period, count]) => (
                  <div key={period} className="text-center bg-red-100 p-8 rounded-lg shadow-inner">
                    <Text size="xl" weight={700} color="red">{count}</Text>
                    <Text size="xs" color="dimmed">{period}</Text>
                  </div>
                ))}
              </div>
            </Paper>

            {/* Recently Completed Tasks */}
            <Paper p="md" withBorder className="flex-1 bg-white shadow-sm rounded-lg">
              <Text size="lg" weight={700} className="mb-6 text-center text-ascend-black">Recently Completed</Text>
              <div className="space-y-2">
                {getRecentCompletedTasks(tasks).length > 0 ? (
                  getRecentCompletedTasks(tasks).map(task => (
                    <div key={task.id} className="flex items-center bg-gray-50 p-2 rounded-lg">
                      <div className="w-2 h-2 bg-ascend-green rounded-full mr-2"></div>
                      <Text size="sm" className="text-ascend-black">{task.title}</Text>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-32">
                    <Text size="md" color='ascend-blue' className="text-center italic">
                      Work and complete tasks, you'll find them here!
                    </Text>
                  </div>
                )}
              </div>
            </Paper>
          </div>

            {/* Buttons and Filters for Tasks */}
            <Group position="apart" className="mb-6 mt-6 flex-col md:flex-row w-full">
              <Button onClick={open} className="w-full md:w-auto mb-2 md:mb-0">
                Add New Task
              </Button>
              <Group className="flex-col md:flex-row w-full md:w-auto space-y-2 md:space-y-0">
                <Select
                  placeholder="Sort by"
                  data={[
                    { value: 'createdAt', label: 'Date Created' },
                    { value: 'title', label: 'Title' },
                  ]}
                  value={sortBy}
                  onChange={setSortBy}
                  className="w-full md:w-auto"
                />
                <Select
                  placeholder="Filter"
                  data={[
                    { value: 'active', label: 'Active Tasks' },
                    { value: 'all', label: 'All Tasks' },
                    { value: 'completed', label: 'Completed Tasks' },
                  ]}
                  value={filterCompleted}
                  onChange={setFilterCompleted}
                  className="w-full md:w-auto"
                />
              </Group>
            </Group>
            {/* Task List */}
            <AnimatePresence>
              {sortedAndFilteredTasks.map(task => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Paper p="sm" withBorder className="mb-4 transition-all duration-300 hover:shadow-md">
                    <div className="flex justify-between items-start">
                      <Group>
                        <Checkbox
                          checked={task.completed}
                          onChange={() => handleToggleTask(task.id)}
                          className="cursor-pointer"
                        />
                        <div>
                          <Text size="sm">{task.title}</Text>
                          <Text size="xs" color="dimmed">{task.description}</Text>
                          <Group mt="xs">
                            <Badge color="ascend-blue" size="sm">
                              {goals && goals[task.goalId] ? goals[task.goalId].title : 'No associated goal'}
                            </Badge>
                            <Badge 
                              leftSection={<CalendarIcon className="h-3 w-3" />} 
                              color={calculateCountdown(task.dueDate).isUrgent ? "red" : "ascend-green"} 
                              size="sm"
                            >
                              Due in {calculateCountdown(task.dueDate).text}
                            </Badge>
                          </Group>
                        </div>
                      </Group>
                      <Group>
                        <button onClick={() => handleEditTask(task)} size="xs"><PencilIcon className="h-4 w-4 text-ascend-orange" /></button>
                        <button onClick={() => handleDeleteTask(task.id)} size="xs"><TrashIcon className="h-4 w-4 text-red-500" /></button>
                      </Group>
                    </div>
                  </Paper>
                </motion.div>
              ))}
            </AnimatePresence>
          </main>

      <Modal opened={opened} onClose={close} title={editingTask ? "Edit Task" : "Add New Task"}>
        <TextInput
          label="Task Title"
          value={editingTask ? editingTask.title : newTask.title}
          onChange={(e) => editingTask ? setEditingTask({...editingTask, title: e.target.value}) : setNewTask({...newTask, title: e.target.value})}
          className="mb-4"
        />
        <Textarea
          label="Task Description"
          value={editingTask ? editingTask.description : newTask.description}
          onChange={(e) => editingTask ? setEditingTask({...editingTask, description: e.target.value}) : setNewTask({...newTask, description: e.target.value})}
          className="mb-4"
        />
        <Select
          label="Associated Goal"
          data={Object.entries(goals).map(([id, goal]) => ({ value: id, label: goal.title }))}
          value={editingTask ? editingTask.goalId : newTask.goalId}
          onChange={(value) => editingTask ? setEditingTask({...editingTask, goalId: value}) : setNewTask({...newTask, goalId: value})}
          className="mb-4"
        />
        <TextInput
          label="Due Date"
          type="date"
          value={editingTask ? editingTask.dueDate || '' : newTask.dueDate || ''}
          onChange={(e) => editingTask ? setEditingTask({...editingTask, dueDate: e.target.value}) : setNewTask({...newTask, dueDate: e.target.value})}
          className="mb-4"
        />
        <Button 
          onClick={editingTask ? handleUpdateTask : handleAddTask}
          className="bg-ascend-green hover:bg-ascend-green-dark transition-colors duration-300"
          fullWidth
        >
          {editingTask ? "Update Task" : "Add Task"}
        </Button>
      </Modal>

      <Modal
        opened={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        title="Complete Task"
      >
        <Text>Are you sure you want to move this task to the completed section?</Text>
        <Group position="right" mt="md">
          <Button onClick={() => setShowCompletionModal(false)}>Cancel</Button>
          <Button color="green" onClick={moveTaskToCompleted}>Confirm</Button>
        </Group>
      </Modal>
    </div>
    </div>
  );
}
