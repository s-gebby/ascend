import { getDatabase, ref, set, get, update, remove, push, child } from "firebase/database";
import { database } from "../firebaseConfig";
export const writeUserData = (userId, name, email) => {
  set(ref(database, 'users/' + userId), {
    username: name,
    email: email,
    createdAt: Date.now()
  });
};

export const readUserData = async (userId) => {
  const snapshot = await get(ref(database, 'users/' + userId));
  if (snapshot.exists()) {
    return snapshot.val();
  } else {
    return null;
  }
};

export const updateUserData = (userId, updates) => {
  update(ref(database, 'users/' + userId), updates);
};

export const deleteUserData = (userId) => {
  remove(ref(database, 'users/' + userId));
};

export const createGoal = (userId, goalData) => {
  const newGoalKey = push(ref(database, `users/${userId}/goals`)).key;
  set(ref(database, `users/${userId}/goals/${newGoalKey}`), goalData);
  return newGoalKey;
};

export const readGoals = async (userId) => {
  const goalsRef = ref(database, `users/${userId}/goals`);
  try {
    const snapshot = await get(goalsRef);
    if (snapshot.exists()) {
      const goalsData = snapshot.val();
      console.log("Goals data:", JSON.stringify(goalsData, null, 2));
      return snapshot.val();
    } else {
      console.log("No goals found for user:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error reading goals:", error);
    throw error;
  }
};
export const deleteGoal = (userId, goalId) => {
  return remove(ref(database, `users/${userId}/goals/${goalId}`));
};

export const updateGoal = (userId, goalId, updates) => {
  if (updates.completed) {
    updates.completedAt = new Date().toISOString();
  }
  return update(ref(database, `users/${userId}/goals/${goalId}`), updates);
};

export const createPost = async (user, content) => {
  const db = getDatabase();
  const postRef = ref(db, 'posts');
  const newPostRef = push(postRef);
  
  await set(newPostRef, {
    authorId: user.uid,
    authorName: user.displayName || 'Anonymous',
    authorPhotoURL: user.photoURL || '',
    content,
    timestamp: Date.now(),
    encouragements: {}
  });
};
export const readPosts = async () => {
  const db = getDatabase();
  const postsRef = ref(db, 'posts');
  const snapshot = await get(postsRef);
  
  if (snapshot.exists()) {
    const posts = [];
    snapshot.forEach((childSnapshot) => {
      posts.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    return posts.sort((a, b) => b.timestamp - a.timestamp);
  }
  
  return [];
};

// Implement updatePost and deletePost functions similarly

export const encouragePost = async (postId, userId) => {
  const db = getDatabase();
  const postRef = ref(db, `posts/${postId}/encouragements/${userId}`);
  const snapshot = await get(postRef);

  if (snapshot.exists()) {
    // If user has already encouraged, remove the encouragement
    await set(postRef, null);
  } else {
    // If user hasn't encouraged, add the encouragement
    await set(postRef, true);
  }
};

export const deletePost = (postId) => {
  return remove(ref(database, `posts/${postId}`));
};

export const createJournalEntry = async (userId, entryData) => {
  const entriesRef = ref(database, `users/${userId}/journal`);
  const newEntryRef = push(entriesRef);
  const entry = {
    title: entryData.title,
    text: entryData.text,
    date: new Date().toISOString(),
    category: entryData.category || '',
    tags: entryData.tags || [],
  };
  await set(newEntryRef, entry);
  return newEntryRef.key;
}

export const updateJournalEntry = async (userId, entryId, updates) => {
  const entryRef = ref(database, `users/${userId}/journal/${entryId}`);
  await update(entryRef, updates);
};

export const getJournalEntries = async (userId) => {
  const entriesRef = ref(database, `users/${userId}/journal`);
  const snapshot = await get(entriesRef);
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([id, entry]) => ({
      id,
      ...entry
    }));
  }
  return [];
};

export const deleteJournalEntry = async (userId, entryId) => {
  const entryRef = ref(database, `users/${userId}/journal/${entryId}`);
  await remove(entryRef);
};

export const moveGoalToCompleted = async (userId, goalId) => {
  const goalRef = ref(database, `users/${userId}/goals/${goalId}`);
  const completedGoalsRef = ref(database, `users/${userId}/completedGoals/${goalId}`);
  
  const snapshot = await get(goalRef);
  if (snapshot.exists()) {
    const goalData = snapshot.val();
    goalData.completedAt = new Date().toISOString();
    
    await set(completedGoalsRef, goalData);
    await remove(goalRef);
  }
};

export const getCompletedGoals = async (userId) => {
  const completedGoalsRef = ref(database, `users/${userId}/completedGoals`);
  const snapshot = await get(completedGoalsRef);
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};
export const createTask = (userId, taskData) => {
  const newTaskKey = push(ref(database, `users/${userId}/tasks`)).key;
  set(ref(database, `users/${userId}/tasks/${newTaskKey}`), {
    ...taskData,
    createdAt: new Date().toISOString(),
  });
  return newTaskKey;
};

export const readTasks = async (userId) => {
  const tasksRef = ref(database, `users/${userId}/tasks`);
  try {
    const snapshot = await get(tasksRef);
    if (snapshot.exists()) {
      const tasks = Object.entries(snapshot.val()).map(([id, task]) => ({ id, ...task }));
      return tasks.sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
      });
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error reading tasks:", error);
    throw error;
  }
};

export const readTasksForGoal = async (userId, goalId) => {
  const tasksRef = ref(database, `users/${userId}/tasks`);
  try {
    const snapshot = await get(tasksRef);
    if (snapshot.exists()) {
      const allTasks = Object.entries(snapshot.val()).map(([id, task]) => ({ id, ...task }));
      return allTasks.filter(task => task.goalId === goalId);
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error reading tasks for goal:", error);
    throw error;
  }
};
export const updateTask = (userId, taskId, updates) => {
  return update(ref(database, `users/${userId}/tasks/${taskId}`), updates);
};

export const deleteTask = (userId, taskId) => {
  return remove(ref(database, `users/${userId}/tasks/${taskId}`));
};

export const createSubtask = (userId, taskId, subtaskData) => {
  const newSubtaskKey = push(ref(database, `users/${userId}/tasks/${taskId}/subtasks`)).key;
  set(ref(database, `users/${userId}/tasks/${taskId}/subtasks/${newSubtaskKey}`), subtaskData);
  return newSubtaskKey;
};

export const updateSubtask = (userId, taskId, subtaskId, updates) => {
  return update(ref(database, `users/${userId}/tasks/${taskId}/subtasks/${subtaskId}`), updates);
};

export const deleteSubtask = (userId, taskId, subtaskId) => {
  return remove(ref(database, `users/${userId}/tasks/${taskId}/subtasks/${subtaskId}`));
};

export const getTaskStats = async (userId) => {
  const tasksRef = ref(database, `users/${userId}/tasks`);
  const snapshot = await get(tasksRef);
  if (snapshot.exists()) {
    const tasks = snapshot.val();
    const totalTasks = Object.keys(tasks).length;
    const completedTasks = Object.values(tasks).filter(task => task.completed).length;
    const incompleteTasks = totalTasks - completedTasks;
    return { totalTasks, completedTasks, incompleteTasks };
  }
  return { totalTasks: 0, completedTasks: 0, incompleteTasks: 0 };
};

// Add these functions to your existing database.js file

export const addComment = async (postId, user, content) => {
  const db = getDatabase();
  const commentRef = push(ref(db, `posts/${postId}/comments`));
  const commentData = {
    userId: user.uid,
    userName: user.displayName || 'Anonymous',
    content,
    timestamp: Date.now(),
  };
  await set(commentRef, commentData);
};
export const getComments = async (postId) => {
  const db = getDatabase();
  const commentsRef = ref(db, `posts/${postId}/comments`);
  const snapshot = await get(commentsRef);
  return snapshot.val();
};

export const deleteComment = async (postId, commentId) => {
  const db = getDatabase();
  await remove(ref(db, `posts/${postId}/comments/${commentId}`));
};

const handleToggleTask = async (taskId) => {
  if (auth.currentUser) {
    const taskToUpdate = tasks.find(task => task.id === taskId)
    if (taskToUpdate) {
      const updatedTask = { ...taskToUpdate, completed: !taskToUpdate.completed }
      await updateTask(auth.currentUser.uid, taskId, updatedTask)
      await fetchTasks()
    }
  }
}

import { getAuth } from "firebase/auth";

export const getNewestMembers = async (limit = 3) => {
  const auth = getAuth();
  if (!auth.currentUser) {
    console.log("User not authenticated");
    return [];
  }

  const usersRef = ref(database, 'users');
  try {
    const snapshot = await get(usersRef);
    if (snapshot.exists()) {
      const users = Object.entries(snapshot.val())
        .map(([id, user]) => ({ id, ...user }))
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
      return users;
    }
  } catch (error) {
    console.error("Error fetching newest members:", error);
  }
  return [];
};

export const getRecentPosts = async (limit = 3) => {
  const db = getDatabase();
  const postsRef = ref(db, 'posts');
  const snapshot = await get(postsRef);
  
  if (snapshot.exists()) {
    const posts = [];
    snapshot.forEach((childSnapshot) => {
      posts.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    return posts.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }
  
  return [];
};