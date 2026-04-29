import React from 'react';

const ModerationReviewModal = ({ isOpen, onClose, item, type, onAction }) => {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-yellow-500 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-yellow-900">
            Review Pending {type === 'post' ? 'Post' : 'Comment'}
          </h2>
          <button onClick={onClose} className="text-yellow-900 hover:text-black font-bold text-xl">&times;</button>
        </div>

        {/* Content Body */}
        <div className="p-8">
          <div className="mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 block">
              Flagged Content
            </span>
            {type === 'post' && (
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{item.title}</h3>
            )}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <p className="text-gray-700 whitespace-pre-wrap">{item.content}</p>
            </div>
            <div className="mt-4 text-xs text-gray-500 text-right">
              Submitted: {new Date(item.createdAt).toLocaleString()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 border-t pt-6">
            <button
              onClick={() => onAction(item._id, type, 'rejected')}
              className="px-6 py-3 rounded-full font-bold border-2 border-red-500 text-red-500 hover:bg-red-50 transition-colors"
            >
              Reject & Delete
            </button>
            <button
              onClick={() => onAction(item._id, type, 'approved')}
              className="px-6 py-3 rounded-full font-bold bg-green-600 hover:bg-green-700 text-white transition-colors shadow-md"
            >
              Approve Content
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModerationReviewModal;