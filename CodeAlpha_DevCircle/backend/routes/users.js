const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const Notification = require('../models/Notification');

// Get user profile by username
router.get('/:username', auth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'name username avatar')
      .populate('following', 'name username avatar');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const posts = await Post.find({ author: user._id })
      .sort({ createdAt: -1 })
      .populate('author', 'name username avatar');

    res.json({ user, posts });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile (bio + avatar)
router.put('/update/profile', auth, upload.single('avatar'), async (req, res) => {
  try {
    const { bio, name } = req.body;

    const updateData = {};
    if (bio !== undefined) {
      const cleanBio = bio.split('\n').slice(0, 5).join('\n').substring(0, 300);
      updateData.bio = cleanBio;
    }
    if (name !== undefined) updateData.name = name;
    if (req.file) updateData.avatar = req.file.path;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-password');

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Follow / Unfollow user
router.put('/follow/:id', auth, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isFollowing = userToFollow.followers.includes(req.user.id);

    if (isFollowing) {
      await User.findByIdAndUpdate(req.params.id, {
        $pull: { followers: req.user.id }
      });
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { following: req.params.id }
      });
      // Remove follow notification
      await Notification.findOneAndDelete({
        recipient: req.params.id,
        sender: req.user.id,
        type: 'follow'
      });
      res.json({ message: 'Unfollowed successfully' });
    } else {
      await User.findByIdAndUpdate(req.params.id, {
        $push: { followers: req.user.id }
      });
      await User.findByIdAndUpdate(req.user.id, {
        $push: { following: req.params.id }
      });
      // Create follow notification
      await Notification.create({
        recipient: req.params.id,
        sender: req.user.id,
        type: 'follow'
      });
      res.json({ message: 'Followed successfully' });
    }

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search users
router.get('/search/users', auth, async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.find({
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } }
      ]
    }).select('name username avatar bio').limit(10);

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add link
router.post('/links/add', auth, async (req, res) => {
  try {
    const { name, url } = req.body;

    if (!name || !url) {
      return res.status(400).json({ message: 'Name and URL are required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { links: { name, url } } },
      { new: true }
    ).select('-password');

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete link
router.delete('/links/:linkId', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { links: { _id: req.params.linkId } } },
      { new: true }
    ).select('-password');

    res.json(user);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;