import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { FaTrash, FaChevronDown, FaChevronUp, FaCommentAlt, FaSearch } from 'react-icons/fa';
import AdminSidebar from '../../components/AdminSidebar';
import ModerationReviewModal from '../../components/ModerationReviewModal';

const AdminCommunityModeration = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userName, setUserName] = useState('Admin');
  const role = localStorage.getItem('role') || 'system admin';

  // Tabs: 'pending' or 'all'
  const [activeTab, setActiveTab] = useState('pending');

  // Pending Queue States
  const [queue, setQueue] = useState({ posts: [], comments: [] });
  const [loadingPending, setLoadingPending] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  // All Discussions States
  const [allPosts, setAllPosts] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [postComments, setPostComments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAdminData();
    fetchPendingQueue();
  }, []);

  // Fetch All Posts when switching to the 'all' tab
  useEffect(() => {
    if (activeTab === 'all' && allPosts.length === 0) {
      fetchAllPosts();
    }
  }, [activeTab]);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const res = await fetch(`http://localhost:5000/api/users/${decoded.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserName(data.name);
        }
      } catch (error) {
        console.error("Failed to fetch admin data", error);
      }
    }
  };

  // --- PENDING QUEUE LOGIC ---
  const fetchPendingQueue = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/moderation/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setQueue({ posts: data.posts || [], comments: data.comments || [] });
    } catch (error) {
      console.error("Failed to fetch moderation queue", error);
    } finally {
      setLoadingPending(false);
    }
  };

  const openReview = (item, type) => {
    setSelectedItem(item);
    setSelectedType(type);
    setModalOpen(true);
  };

  const handleAction = async (id, type, action) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'post' ? `/api/moderation/posts/${id}` : `/api/moderation/comments/${id}`;
      
      await fetch(`http://localhost:5000${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      setQueue(prev => ({
        ...prev,
        [type + 's']: prev[type + 's'].filter(item => item._id !== id)
      }));
      setModalOpen(false);
    } catch (error) {
      console.error(`Failed to ${action} item`, error);
    }
  };

  // --- ALL DISCUSSIONS LOGIC ---
  const fetchAllPosts = async () => {
    setLoadingAll(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/community/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAllPosts(data);
    } catch (error) {
      console.error("Failed to fetch all active posts", error);
    } finally {
      setLoadingAll(false);
    }
  };

  const loadComments = async (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/community/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setPostComments(data.comments || []);
      setExpandedPostId(postId);
    } catch (error) {
      console.error("Failed to fetch comments for post", error);
    }
  };

  const handleDeleteContent = async (id, type) => {
    if (!window.confirm(`Are you sure you want to permanently delete this ${type}?`)) return;
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = type === 'post' 
        ? `http://localhost:5000/api/moderation/posts/${id}` 
        : `http://localhost:5000/api/moderation/comments/${id}`;
      
      await fetch(endpoint, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (type === 'post') {
        setAllPosts(prev => prev.filter(post => post._id !== id));
        if (expandedPostId === id) setExpandedPostId(null);
      } else {
        setPostComments(prev => prev.filter(comment => comment._id !== id));
      }
    } catch (error) {
      console.error(`Failed to delete ${type}`, error);
    }
  };

  // Search Filter Logic
  const filteredAllPosts = allPosts.filter(post => {
    const query = searchQuery.toLowerCase();
    return (
      post.title?.toLowerCase().includes(query) ||
      post.content?.toLowerCase().includes(query) ||
      post.author?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex h-screen bg-[#f9fdfc] font-sans overflow-hidden">
      
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Topbar */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-10 shrink-0">
          <button className="md:hidden p-2 text-slate-500 hover:bg-gray-50 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
          
          <div className="flex-1"></div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{userName}</p>
              <p className="text-xs font-medium text-teal-600 capitalize">{role}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg border-2 border-white shadow-sm">
              {userName.charAt(0)}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            
            <header>
              <h1 className="text-3xl font-bold text-slate-900">Community Moderation</h1>
              <p className="text-slate-500 mt-1">Review flagged content or manage all active community discussions.</p>
            </header>

            {/* Navigation Tabs */}
            <div className="flex gap-4 border-b border-gray-200">
              <button 
                onClick={() => setActiveTab('pending')}
                className={`py-3 px-6 font-bold text-sm transition-colors border-b-2 ${activeTab === 'pending' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Pending Queue
              </button>
              <button 
                onClick={() => setActiveTab('all')}
                className={`py-3 px-6 font-bold text-sm transition-colors border-b-2 ${activeTab === 'all' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                All Discussions
              </button>
            </div>

            {/* TAB: PENDING QUEUE */}
            {activeTab === 'pending' && (
              <>
                {loadingPending ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Pending Posts Column */}
                    <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100">
                      <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4 flex justify-between items-center">
                        Pending Posts
                        <span className="bg-yellow-100 text-yellow-800 text-sm py-1 px-3 rounded-full">
                          {queue.posts.length}
                        </span>
                      </h2>
                      <div className="space-y-4">
                        {queue.posts.length === 0 ? (
                          <p className="text-gray-400 text-center py-8">No pending posts.</p>
                        ) : (
                          queue.posts.map(post => (
                            <div key={post._id} className="p-5 border border-gray-100 rounded-2xl hover:border-yellow-400 transition-colors flex justify-between items-center bg-gray-50">
                              <div className="truncate pr-4 flex-1">
                                <strong className="block text-gray-800 truncate mb-1">{post.title}</strong>
                                <span className="text-xs font-medium text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                              </div>
                              <button 
                                onClick={() => openReview(post, 'post')}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors shadow-sm shrink-0"
                              >
                                Review
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Pending Comments Column */}
                    <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100">
                      <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4 flex justify-between items-center">
                        Pending Comments
                        <span className="bg-yellow-100 text-yellow-800 text-sm py-1 px-3 rounded-full">
                          {queue.comments.length}
                        </span>
                      </h2>
                      <div className="space-y-4">
                        {queue.comments.length === 0 ? (
                          <p className="text-gray-400 text-center py-8">No pending comments.</p>
                        ) : (
                          queue.comments.map(comment => (
                            <div key={comment._id} className="p-5 border border-gray-100 rounded-2xl hover:border-yellow-400 transition-colors flex justify-between items-center bg-gray-50">
                              <div className="truncate pr-4 flex-1">
                                <span className="block text-gray-800 text-sm truncate mb-1">{comment.content}</span>
                                <span className="text-xs font-medium text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                              </div>
                              <button 
                                onClick={() => openReview(comment, 'comment')}
                                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition-colors shadow-sm shrink-0"
                              >
                                Review
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* TAB: ALL DISCUSSIONS */}
            {activeTab === 'all' && (
              <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 border-b pb-4">
                  <h2 className="text-xl font-bold text-gray-800 flex items-center">
                    All Active Discussions
                    <span className="bg-teal-100 text-teal-800 text-sm py-1 px-3 rounded-full ml-3">
                      {filteredAllPosts.length}
                    </span>
                  </h2>
                  
                  {/* Search Bar */}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all w-full sm:w-80">
                    <FaSearch className="text-slate-400 mr-3 shrink-0" />
                    <input 
                      type="text"
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent focus:outline-none text-slate-700 text-sm"
                    />
                  </div>
                </div>
                
                {loadingAll ? (
                   <div className="flex justify-center items-center py-12">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                   </div>
                ) : filteredAllPosts.length === 0 ? (
                   <p className="text-gray-400 text-center py-8">
                     {searchQuery ? 'No posts match your search.' : 'No active discussions found.'}
                   </p>
                ) : (
                   <div className="space-y-6">
                     {filteredAllPosts.map(post => (
                       <div key={post._id} className="border border-gray-100 rounded-2xl bg-gray-50 overflow-hidden">
                         
                         {/* Post Header */}
                         <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                           <div className="flex-1">
                             <h3 className="font-bold text-lg text-gray-800 mb-1">{post.title}</h3>
                             <p className="text-sm text-gray-600 line-clamp-2 mb-2">{post.content}</p>
                             <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                               <span>By: {post.author?.name || 'Unknown'}</span>
                               <span>•</span>
                               <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                             </div>
                           </div>
                           <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
                             <button 
                               onClick={() => loadComments(post._id)}
                               className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-slate-700 rounded-xl hover:bg-gray-100 transition-colors text-sm font-semibold shadow-sm"
                             >
                               <FaCommentAlt className="text-teal-600" />
                               Comments
                               {expandedPostId === post._id ? <FaChevronUp /> : <FaChevronDown />}
                             </button>
                             <button 
                               onClick={() => handleDeleteContent(post._id, 'post')}
                               className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-semibold shadow-sm"
                             >
                               <FaTrash /> Delete
                             </button>
                           </div>
                         </div>

                         {/* Comments Dropdown */}
                         {expandedPostId === post._id && (
                           <div className="bg-white border-t border-gray-100 p-5">
                             <h4 className="font-bold text-sm text-gray-700 mb-4">Post Comments</h4>
                             {postComments.length === 0 ? (
                               <p className="text-sm text-gray-400">No comments on this post.</p>
                             ) : (
                               <div className="space-y-3">
                                 {postComments.map(comment => (
                                   <div key={comment._id} className="flex justify-between items-start gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                     <div className="flex-1">
                                       <p className="text-sm text-gray-700">{comment.content}</p>
                                       <div className="flex items-center gap-2 mt-1 text-xs font-medium text-gray-500">
                                         <span>{comment.author?.name || 'Unknown'}</span>
                                         <span>•</span>
                                         <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                       </div>
                                     </div>
                                     <button 
                                       onClick={() => handleDeleteContent(comment._id, 'comment')}
                                       className="p-2 text-red-500 bg-white hover:bg-red-50 border border-red-100 rounded-lg transition-colors shrink-0"
                                       title="Delete Comment"
                                     >
                                       <FaTrash size={14} />
                                     </button>
                                   </div>
                                 ))}
                               </div>
                             )}
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>

      <ModerationReviewModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        item={selectedItem} 
        type={selectedType}
        onAction={handleAction}
      />

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}} />
    </div>
  );
};

export default AdminCommunityModeration;