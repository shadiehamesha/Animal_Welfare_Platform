import express from 'express';
import { getApprovedPosts, getPostWithComments, createPost, createComment } from '../controllers/community.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/posts')
  .get(getApprovedPosts)
  .post(protect, createPost);

router.route('/posts/:id')
  .get(getPostWithComments);

router.route('/posts/:id/comments')
  .post(protect, createComment);

export default router;