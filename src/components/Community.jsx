import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { readPosts, createPost, encouragePost, readUserData, deletePost, addComment, getComments, deleteComment, getNewestMembers } from '../utils/database.js'
import { Avatar, TextInput, Button, Paper, Text, Menu } from '@mantine/core'

import { motion } from 'framer-motion'
import { HeartIcon, TrashIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';




export default function Community() {
  const [posts, setPosts] = useState([])
  const [newPostContent, setNewPostContent] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [isUserDataLoaded, setIsUserDataLoaded] = useState(false);
  const auth = getAuth()
  const [newestMembers, setNewestMembers] = useState([]);
  const [comments, setComments] = useState({});
  const [newComments, setNewComments] = useState({});



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userData = await readUserData(currentUser.uid);
        if (userData && userData.username) {
          setIsUserDataLoaded(true);
        }
        fetchPosts();
      } else {
        setPosts([]);
        setComments({});
        setIsUserDataLoaded(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchNewestMembers = async () => {
      if (user) {
        const members = await getNewestMembers();
        setNewestMembers(members);
      }
    };
    fetchNewestMembers();
  }, [user]);
  
  const fetchPosts = async () => {
    try {
      const fetchedPosts = await readPosts()
      setPosts(fetchedPosts || [])
      
      // Fetch comments for each post
      const commentsPromises = fetchedPosts.map(post => getComments(post.id))
      const fetchedComments = await Promise.all(commentsPromises)
      
      const commentsObject = fetchedPosts.reduce((acc, post, index) => {
        acc[post.id] = fetchedComments[index]
        return acc
      }, {})
      
      setComments(commentsObject)
    } catch (error) {
      console.error('Error fetching posts:', error)
      setPosts([])
    }
  }

  const handleCreatePost = async () => {
    if (newPostContent.trim() !== '' && user) {
      try {
        await createPost(user, newPostContent);
        setNewPostContent('');
        fetchPosts();
      } catch (error) {
        console.error('Error creating post:', error);
      }
    }
  }
  
  const handleEncourage = async (postId) => {
    if (user) {
      await encouragePost(postId, user.uid);
      fetchPosts();
    }
  }

  const handleDeletePost = async (postId, authorId) => {
    if (user && user.uid === authorId) {
      try {
        await deletePost(postId);
        fetchPosts();
      } catch (error) {
        console.error('Error deleting post:', error);
      }
    }
  }

  const fetchComments = async (postId) => {
    const fetchedComments = await getComments(postId);
    setComments(prevComments => ({
      ...prevComments,
      [postId]: fetchedComments || {}
    }));
  };

  const handleAddComment = async (postId) => {
    if (newComments[postId]?.trim() && user) {
      await addComment(postId, user, newComments[postId]);
      setNewComments(prev => ({ ...prev, [postId]: '' }));
      fetchComments(postId);
    }
  };

  const handleDeleteComment = async (postId, commentId, commentUserId) => {
    if (user && (user.uid === commentUserId || user.uid === posts.find(p => p.id === postId).authorId)) {
      await deleteComment(postId, commentId);
      fetchComments(postId);
    }
  };

  return (
    <div className="flex h-screen bg-ascend-white">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row">
            {/* Sidebar for mobile */}
            <div className="md:hidden mb-6">
              {/* Community Guidelines and Trending Topics */}
              <div className="space-y-4">
                {/* Community Guidelines */}
                <div className="bg-white rounded-lg shadow p-4">
                  <h2 className="text-lg font-bold text-ascend-black mb-2">Community Guidelines</h2>
                  <p className="text-sm text-gray-700">
                  The community is your interactive space designed to foster connection and positivity. Our unique encourage feature empowers you to uplift and support fellow members, creating an environment where meaningful interactions thrive. Share your insights, experiences, and goals, and watch as the community rallies around you.<br></br><br></br>
                  Together, we're building a platform that doesn't just connect - it elevates.
                  </p>
                </div>
    
                {/* Trending Topics */}
                <div className="bg-white rounded-lg shadow p-4">
                  <h2 className="text-lg font-bold text-ascend-black mb-2">Trending Topics (not active)</h2>
                  <ul className="space-y-2">
                    <li className="text-sm text-ascend-blue">#GoalSetting</li>
                    <li className="text-sm text-ascend-blue">#PersonalGrowth</li>
                    <li className="text-sm text-ascend-blue">#Motivation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-grow space-y-6">
              {/* Create Post section */}
              <div className="bg-white border border-gray-300 rounded-md p-6">
                <h3 className="text-lg font-semibold text-ascend-black mb-2">Share Your Thoughts</h3>
                <div className="flex flex-col sm:flex-row items-start space-y-2 sm:space-y-0 sm:space-x-4">
                  <Avatar src={user?.photoURL} alt={user?.displayName} radius="xl" size="lg" />
                  <TextInput
                    placeholder="What's on your mind?"
                    value={newPostContent}
                    onChange={(event) => setNewPostContent(event.currentTarget.value)}
                    className="flex-grow w-full sm:w-auto"
                  />
                  <Button onClick={handleCreatePost} color="ascend-blue" className="w-full sm:w-auto">Post</Button>
                </div>
              </div>
  
              {/* Posts */}
              {posts && posts.length > 0 ? (
                posts.map((post) => (
                  <Paper key={post.id} p="md" className="mb-4 border border-gray-300 rounded-xl">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex"
                    >
                      {/* Encourage button */}
                      <div className="flex flex-col items-center mr-4">
                        <Button 
                          variant="light" 
                          color="ascend-green" 
                          onClick={() => handleEncourage(post.id)}
                          className="p-1"
                        >
                          <HeartIcon className="h-5 w-5" />
                        </Button>
                        <span className="text-sm">{post.encouragements ? Object.keys(post.encouragements).length : 0}</span>
                      </div>
    
                      {/* Post content */}
                      <div className="flex-grow relative">
                        <div className="flex items-center mb-2">
                          <Avatar src={post.authorPhotoURL} alt={post.authorName} radius="xl" size="sm" />
                          <span className="ml-2 font-bold text-ascend-blue">{post.authorName}</span>
                          <span className="ml-2 text-sm text-gray-500">{new Date(post.timestamp).toLocaleString()}</span>
                        </div>
                        {user && user.uid === post.authorId && (
                          <div className="absolute top-0 right-0">
                            <Menu>
                              <Menu.Target>
                                <Button variant="subtle" size="xs">
                                  <EllipsisVerticalIcon className="h-5 w-5" />
                                </Button>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item 
                                  color="red" 
                                  icon={<TrashIcon className="h-4 w-4" />}
                                  onClick={() => handleDeletePost(post.id, post.authorId)}
                                >
                                  Delete
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </div>
                        )}
                        <p className="text-gray-700">{post.content}</p>
                      </div>
                    </motion.div>
                    
                    {/* Comments section */}
                    <div className="mt-4">
                      <Text weight={700} size="sm" className="mb-2">Comments</Text>
                      {comments[post.id] && Object.entries(comments[post.id]).map(([commentId, comment]) => (
                        <div key={commentId} className="mb-2 p-2 border border-gray-200 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div>
                              <Text size="sm" weight={500} color="ascend-blue">{comment.userName}</Text>
                              <Text size="sm">{comment.content}</Text>
                            </div>
                            {user && (user.uid === comment.userId || user.uid === post.authorId) && (
                              <Button
                                variant="subtle"
                                color="red"
                                size="xs"
                                onClick={() => handleDeleteComment(post.id, commentId, comment.userId)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="flex items-center mt-2">
                      <TextInput
                        placeholder="Add a comment..."
                        value={newComments[post.id] || ''}
                        onChange={(event) => setNewComments(prev => ({
                          ...prev,
                          [post.id]: event?.target?.value || ''
                        }))}
                        className="flex-grow mr-2"
                      />
                        <Button onClick={() => handleAddComment(post.id)} size="sm">
                          Comment
                        </Button>
                      </div>
                    </div>
                  </Paper>
                ))
              ) : (
                <div className="bg-white rounded-lg p-4 text-center">
                  <p className="text-gray-700">No posts yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>

            {/* Sidebar for desktop */}
            <div className="hidden md:block md:w-80 md:ml-6 bg-ascend-white border border-gray-300 rounded-md">
              {/* Community Guidelines */}
              <div className="p-4">
                <h2 className="text-lg font-bold text-ascend-black mb-2">Community Guidelines</h2>
                <p className="text-sm text-gray-700">
                The community is your interactive space designed to foster connection and positivity. Our unique encourage feature empowers you to uplift and support fellow members, creating an environment where meaningful interactions thrive. Share your insights, experiences, and goals, and watch as the community rallies around you.<br></br><br></br>
                Together, we're building a platform that doesn't just connect - it elevates.
                </p>
              </div>
  
              {/* Trending Topics */}
              <div className="p-4 mt-4">
                <h2 className="text-lg font-bold text-ascend-black mb-2">Trending Topics (not active)</h2>
                <ul className="space-y-2">
                  <li className="text-sm text-ascend-blue">#GoalSetting</li>
                  <li className="text-sm text-ascend-blue">#PersonalGrowth</li>
                  <li className="text-sm text-ascend-blue">#Motivation</li>
                </ul>
              </div>

              {/* Featured Members */}  
              <div className='p-4 mt-4'>
              <h2 className="text-lg font-bold text-ascend-black mb-2">Newest Members</h2>
              {newestMembers && newestMembers.length > 0 ? (
                <div className="flex flex-wrap">
                  {newestMembers.map((member) => (
                    <div key={member.id} className="w-1/3 p-2">
                      <div className="bg-white rounded-lg p-2 border border-gray-300">
                        <div className="flex items-center">
                          <Avatar src={member.photoURL} alt={member.username} size="sm" />
                          <Text size="xs" weight={500} color="ascend-blue" className="ml-2 truncate">
                            {member.username}
                          </Text>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
              <p>No new members to display at the moment.</p>
              )}
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
