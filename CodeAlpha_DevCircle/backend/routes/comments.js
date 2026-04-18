const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

// Add comment
router.post('/:postId', auth, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = new Comment({
      post: req.params.postId,
      author: req.user.id,
      content
    });

    await comment.save();
    // Notify post author
    if (post.author.toString() !== req.user.id) {
      await Notification.create({
        recipient: post.author,
        sender: req.user.id,
        type: 'comment',
        post: post._id
      });
    }

    // Detect mentions in comment
    const mentionRegex = /@(\w+)/g;
    const mentions = [...content.matchAll(mentionRegex)].map(m => m[1]);
    if (mentions.length) {
      const User = require('../models/User');
      for (const username of mentions) {
        const mentioned = await User.findOne({ username: username.toLowerCase() });
        if (mentioned && mentioned._id.toString() !== req.user.id && mentioned._id.toString() !== post.author.toString()) {
          await Notification.create({
            recipient: mentioned._id,
            sender: req.user.id,
            type: 'mention',
            post: post._id
          });
        }
      }
    }
    await comment.populate('author', 'name username avatar');

    res.status(201).json(comment);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all comments for a post
router.get('/:postId', auth, async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .sort({ createdAt: 1 })
      .populate('author', 'name username avatar');

    res.json(comments);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;