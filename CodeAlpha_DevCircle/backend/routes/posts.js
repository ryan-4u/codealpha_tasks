const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const Notification = require('../models/Notification');

// Create post
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const post = new Post({
      author: req.user.id,
      content,
      image: req.file ? req.file.path : ''
    });

    await post.save();
    // Detect mentions
    const mentionRegex = /@(\w+)/g;
    const mentions = [...content.matchAll(mentionRegex)].map(m => m[1]);
    if (mentions.length) {
      const User = require('../models/User');
      for (const username of mentions) {
        const mentioned = await User.findOne({ username: username.toLowerCase() });
        if (mentioned && mentioned._id.toString() !== req.user.id) {
          await Notification.create({
            recipient: mentioned._id,
            sender: req.user.id,
            type: 'mention',
            post: post._id
          });
        }
      }
    }
    await post.populate('author', 'name username avatar');

    res.status(201).json(post);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all posts (feed)
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name username avatar');

    res.json(posts);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single post
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name username avatar');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json(post);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
      await Post.findByIdAndUpdate(req.params.id, {
        $pull: { likes: req.user.id }
      });
      // Remove like notification
      await Notification.findOneAndDelete({
        recipient: post.author,
        sender: req.user.id,
        type: 'like',
        post: post._id
      });
      res.json({ message: 'Post unliked' });
    } else {
      await Post.findByIdAndUpdate(req.params.id, {
        $push: { likes: req.user.id }
      });
      // Create like notification (not for own post)
      if (post.author.toString() !== req.user.id) {
        await Notification.create({
          recipient: post.author,
          sender: req.user.id,
          type: 'like',
          post: post._id
        });
      }
      res.json({ message: 'Post liked' });
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;