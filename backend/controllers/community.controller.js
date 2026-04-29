import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';
import { checkContentForMedicalAdvice } from '../utils/contentFilter.util.js';

// @desc    Get all approved community posts
// @route   GET /api/community/posts
export const getApprovedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ status: 'approved' })
      .populate('author', 'name') // Only fetching name, no sensitive data
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching posts' });
  }
};

// @desc    Get single post and its approved comments
// @route   GET /api/community/posts/:id
export const getPostWithComments = async (req, res) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, status: 'approved' })
      .populate('author', 'name');
    
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comments = await Comment.find({ post: req.params.id, status: 'approved' })
      .populate('author', 'name')
      .sort({ createdAt: 1 });

    res.status(200).json({ post, comments });
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching post details' });
  }
};

// @desc    Create a new post
// @route   POST /api/community/posts
export const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    
    // Auto-flag content if it contains medical/dosing keywords
    const isFlagged = checkContentForMedicalAdvice(title) || checkContentForMedicalAdvice(content);
    const status = isFlagged ? 'pending' : 'approved';

    const newPost = await Post.create({
      title,
      content,
      author: req.user._id, // Assumes req.user is set by authentication middleware
      status
    });

    res.status(201).json({ 
      message: isFlagged ? 'Post submitted and pending moderator review.' : 'Post created successfully.',
      post: newPost 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating post' });
  }
};

// @desc    Add a comment to a post
// @route   POST /api/community/posts/:id/comments
export const createComment = async (req, res) => {
  try {
    const { content } = req.body;
    
    const isFlagged = checkContentForMedicalAdvice(content);
    const status = isFlagged ? 'pending' : 'approved';

    const newComment = await Comment.create({
      post: req.params.id,
      content,
      author: req.user._id,
      status
    });

    res.status(201).json({
      message: isFlagged ? 'Comment pending moderator review.' : 'Comment added.',
      comment: newComment
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating comment' });
  }
};