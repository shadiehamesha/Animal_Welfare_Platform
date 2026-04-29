import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';

// @desc    Get all pending posts and comments for admin review
// @route   GET /api/moderation/pending
export const getPendingContent = async (req, res) => {
  try {
    const pendingPosts = await Post.find({ status: 'pending' })
      .select('title content createdAt status') 
      .sort({ createdAt: -1 });

    const pendingComments = await Comment.find({ status: 'pending' })
      .select('content post createdAt status')
      .sort({ createdAt: -1 });

    res.status(200).json({ posts: pendingPosts, comments: pendingComments });
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching moderation queue' });
  }
};

// @desc    Update status of a post (Approve/Reject)
// @route   PUT /api/moderation/posts/:id
export const reviewPost = async (req, res) => {
  try {
    const { action } = req.body; // 'approved' or 'rejected'
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const post = await Post.findByIdAndUpdate(req.params.id, { status: action }, { new: true });
    res.status(200).json({ message: `Post ${action} successfully`, post });
  } catch (error) {
    res.status(500).json({ message: 'Error reviewing post' });
  }
};

// @desc    Update status of a comment (Approve/Reject)
// @route   PUT /api/moderation/comments/:id
export const reviewComment = async (req, res) => {
  try {
    const { action } = req.body; 
    if (!['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const comment = await Comment.findByIdAndUpdate(req.params.id, { status: action }, { new: true });
    res.status(200).json({ message: `Comment ${action} successfully`, comment });
  } catch (error) {
    res.status(500).json({ message: 'Error reviewing comment' });
  }
};

// @desc    Permanently delete a post and its associated comments
// @route   DELETE /api/moderation/posts/:id
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Delete all comments associated with this post to prevent orphaned records
    await Comment.deleteMany({ post: req.params.id });
    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Post and associated comments deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting post' });
  }
};

// @desc    Permanently delete a specific comment
// @route   DELETE /api/moderation/comments/:id
export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting comment' });
  }
};