import React from 'react';
import { Link } from 'react-router-dom';

const PostCard = ({ post, isDetail = false }) => {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className={`bg-white rounded-2xl border border-green-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden ${isDetail ? 'mb-8' : 'mb-4'}`}>
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className={`${isDetail ? 'text-3xl' : 'text-xl'} font-bold text-gray-800`}>
            {post.title}
          </h2>
          <span className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
            {formattedDate}
          </span>
        </div>
        
        <p className={`text-gray-600 leading-relaxed ${!isDetail && 'line-clamp-3'}`}>
          {post.content}
        </p>

        <div className="mt-6 flex items-center justify-between border-t border-gray-50 pt-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-yellow-900 font-bold">
              {post.author?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {post.author?.name || 'Anonymous'}
            </span>
          </div>
          
          {!isDetail && (
            <Link 
              to={`/community/post/${post._id}`}
              className="text-sm font-semibold text-green-600 hover:text-green-800 transition-colors"
            >
              Read full post &rarr;
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;