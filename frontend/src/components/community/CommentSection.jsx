import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CommentSection = ({ comments, onAddComment, isLoggedIn }) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    await onAddComment(newComment);
    setNewComment('');
    setIsSubmitting(false);
  };

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">
        Comments ({comments.length})
      </h3>

      {/* Add Comment Form */}
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="mb-8 flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add to the discussion... (No medical advice permitted)"
              className="w-full rounded-full border border-gray-300 px-6 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all bg-gray-50 hover:bg-white"
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting || !newComment.trim()}
            className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900 font-bold py-3 px-6 rounded-full transition-colors disabled:opacity-50"
          >
            Reply
          </button>
        </form>
      ) : (
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 text-center mb-8">
          <p className="text-teal-800 font-medium mb-3">Please log in to join the discussion.</p>
          <Link to="/login" className="inline-block bg-teal-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-teal-700 transition-colors shadow-sm">
            Log In to Reply
          </Link>
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment._id} className="flex gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
            <div className="w-10 h-10 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center text-green-800 font-bold">
              {comment.author?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-800">{comment.author?.name || 'Anonymous'}</span>
                <span className="text-xs text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700">{comment.content}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && (
          <p className="text-center text-gray-500 py-8">No comments yet. Be the first to start the discussion!</p>
        )}
      </div>
    </div>
  );
};

export default CommentSection;