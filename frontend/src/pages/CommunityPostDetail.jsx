import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostCard from '../components/community/PostCard';
import CommentSection from '../components/community/CommentSection';
import Navbar from '../components/navigation';
import Footer from '../components/footer';

const CommunityPostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsLoggedIn(true);

    const fetchPostDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/community/posts/${id}`);
        if (!response.ok) throw new Error('Post not found');
        const data = await response.json();
        setPostData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetails();
  }, [id]);

  const handleAddComment = async (content) => {
    try {
      const token = localStorage.getItem('token'); 
      const response = await fetch(`http://localhost:5000/api/community/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content })
      });
      
      const data = await response.json();
      
      if (data.comment.status === 'pending') {
        alert('Your comment contains flagged keywords and is pending admin review.');
      } else {
        setPostData(prev => ({
          ...prev,
          comments: [...prev.comments, data.comment]
        }));
      }
    } catch (error) {
      console.error('Failed to post comment', error);
    }
  };

  if (loading) return (
      <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <main className="flex-grow p-8 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </main>
        <Footer />
      </div>
  );

  if (!postData) return (
      <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <main className="flex-grow p-8 text-center text-red-500 font-medium">Post not found.</main>
        <Footer />
      </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <Navbar />
      
      <main className="flex-grow py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button 
            onClick={() => navigate('/community')}
            className="mb-6 text-sm font-medium text-gray-500 hover:text-green-600 transition-colors flex items-center"
          >
            &larr; Back to Community
          </button>
          
          <PostCard post={postData.post} isDetail={true} />
          
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <CommentSection 
              comments={postData.comments} 
              onAddComment={handleAddComment} 
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityPostDetail;