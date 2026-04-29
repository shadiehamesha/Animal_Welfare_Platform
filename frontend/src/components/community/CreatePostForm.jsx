import React, { useState } from 'react';

const CreatePostForm = ({ onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && content.trim()) {
      onSubmit({ title, content });
      setTitle('');
      setContent('');
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm mb-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Start a Conversation</h3>
      
      {/* Strict Medical Warning Banner */}
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-r-xl">
        <div className="flex items-start">
          <div className="ml-3">
            <h3 className="text-sm font-bold text-yellow-900">Community Safety Guidelines</h3>
            <div className="mt-2 text-sm text-yellow-800">
              <p>
                To protect animal welfare, <strong>sharing medical dosing, prescriptions, or specific treatment plans is strictly prohibited.</strong> Any content containing medical instructions will be flagged, hidden, and held for admin review. Always consult a certified veterinarian for medical concerns.
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Topic Title</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
            placeholder="What's on your mind?"
            required
            maxLength={150}
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Details</label>
          <textarea
            id="content"
            rows="4"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-xl border-gray-300 border px-4 py-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all resize-none"
            placeholder="Share your experience, ask for general advice, or post a community update..."
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-full transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : 'Post to Community'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePostForm;