const API_URL = 'http://localhost:5000/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Save auth data
const saveAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Get current user
const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Logout
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
};

// Check if logged in — redirect to login if not
const requireAuth = () => {
  if (!getToken()) {
    window.location.href = '/index.html';
  }
};

// Check if already logged in — redirect to feed if yes
const redirectIfAuth = () => {
  if (getToken()) {
    window.location.href = '/feed.html';
  }
};

// ── API Calls ──

// Auth
const register = (data) =>
  fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json());

const login = (data) =>
  fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(res => res.json());

// Posts
const getFeed = () =>
  fetch(`${API_URL}/posts`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  }).then(res => res.json());

const createPost = (formData) =>
  fetch(`${API_URL}/posts`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData
  }).then(res => res.json());

const getPost = (id) =>
  fetch(`${API_URL}/posts/${id}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  }).then(res => res.json());

const deletePost = (id) =>
  fetch(`${API_URL}/posts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  }).then(res => res.json());

const likePost = (id) =>
  fetch(`${API_URL}/posts/like/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${getToken()}` }
  }).then(res => res.json());

// Comments
const getComments = (postId) =>
  fetch(`${API_URL}/comments/${postId}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  }).then(res => res.json());

const addComment = (postId, content) =>
  fetch(`${API_URL}/comments/${postId}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content })
  }).then(res => res.json());

const deleteComment = (id) =>
  fetch(`${API_URL}/comments/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  }).then(res => res.json());

// Users
const getProfile = (username) =>
  fetch(`${API_URL}/users/${username}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  }).then(res => res.json());

const followUser = (id) =>
  fetch(`${API_URL}/users/follow/${id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${getToken()}` }
  }).then(res => res.json());

const updateProfile = (formData) =>
  fetch(`${API_URL}/users/update/profile`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData
  }).then(res => res.json());

const searchUsers = (q) =>
  fetch(`${API_URL}/users/search/users?q=${q}`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  }).then(res => res.json());

// Links
const addLink = (name, url) =>
  fetch(`${API_URL}/users/links/add`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name, url })
  }).then(res => res.json());

const deleteLink = (linkId) =>
  fetch(`${API_URL}/users/links/${linkId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  }).then(res => res.json());

// Get all users (for suggestions)
const getSuggestions = () =>
  fetch(`${API_URL}/users/search/users?q=`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  }).then(res => res.json());

// Notifications
const getNotifications = () =>
  fetch(`${API_URL}/notifications`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  }).then(res => res.json());

const markNotificationsRead = () =>
  fetch(`${API_URL}/notifications/read`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${getToken()}` }
  }).then(res => res.json());

const deleteNotification = (id) =>
  fetch(`${API_URL}/notifications/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${getToken()}` }
  }).then(res => res.json());