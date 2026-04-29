import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CreatePostForm from '../components/community/CreatePostForm';
import PostCard from '../components/community/PostCard';
import Navbar from '../components/navigation';
import Footer from '../components/footer';

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);
    fetchApprovedPosts();
  }, []);

  const fetchApprovedPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/community/posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching community posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/community/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(postData)
      });
      
      const result = await response.json();
      
      if (result.post.status === 'pending') {
        alert('Thank you! Your post contains medical terms and has been sent to our admins for review to ensure community safety.');
      } else {
        // Optimistically add the approved post to the top of the feed
        setPosts([result.post, ...posts]);
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('An error occurred while posting.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter posts based on the search query
  const filteredPosts = posts.filter(post => 
    post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    post.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Pet Lovers Community</h1>
            <p className="text-lg text-gray-600">Connect, share experiences, and support fellow animal advocates.</p>
          </div>

          {/* Creation Form */}
          {isLoggedIn ? (
            <CreatePostForm onSubmit={handleCreatePost} isSubmitting={isSubmitting} />
          ) : (
            <div className="bg-teal-50 border border-teal-100 rounded-3xl p-8 text-center mb-12 shadow-sm">
              <p className="text-teal-800 font-medium mb-4">Please log in to start a conversation with the community.</p>
              <Link to="/login" className="inline-block bg-teal-600 text-white font-semibold px-8 py-3 rounded-full hover:bg-teal-700 transition-colors shadow-sm">
                Log In Now
              </Link>
            </div>
          )}

          {/* Feed Section */}
          <div className="mt-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                Recent Discussions
                <span className="ml-3 bg-green-100 text-green-800 text-sm py-1 px-3 rounded-full">
                  {filteredPosts.length}
                </span>
              </h2>

              {/* Search Bar */}
              <div className="w-full sm:w-72 flex items-center bg-white rounded-full border border-gray-200 px-4 py-2.5 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 transition-all shadow-sm">
                <svg className="w-4 h-4 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Search discussions..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent outline-none text-gray-700 text-sm"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="text-gray-400 mb-4 text-6xl">💬</div>
                <h3 className="text-xl font-medium text-gray-800">No discussions yet</h3>
                <p className="text-gray-500 mt-2">Be the first to start a conversation with the community!</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="text-gray-400 mb-4 text-6xl">🔍</div>
                <h3 className="text-xl font-medium text-gray-800">No matches found</h3>
                <p className="text-gray-500 mt-2">We couldn't find any discussions matching "{searchQuery}".</p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredPosts.map(post => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Community;