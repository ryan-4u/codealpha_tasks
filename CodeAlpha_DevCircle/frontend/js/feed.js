requireAuth();

const user = getUser();

// Set user info in UI
document.getElementById('profileLink').href = `/profile.html?username=${user.username}`;
document.getElementById('navAvatar').src = user.avatar || `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${user.name}`;
document.getElementById('createAvatar').src = user.avatar || `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${user.name}`;
document.getElementById('sidebarName').textContent = user.name;
document.getElementById('sidebarUsername').textContent = `@${user.username}`;
document.getElementById('sidebarAvatar').src = user.avatar || `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${user.name}`;

// Logout
document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  logout();
});

// File input label
document.getElementById('postImage').addEventListener('change', (e) => {
  const file = e.target.files[0];
  document.getElementById('fileName').textContent = file ? file.name : '';
});

// Load feed
const loadFeed = async () => {
  const container = document.getElementById('feedContainer');
  const posts = await getFeed();

  if (!posts.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div style="font-size: 2rem;">👨‍💻</div>
        <p>No posts yet. Be the first to share something!</p>
      </div>`;
    return;
  }

  container.innerHTML = posts.map(post => renderPost(post)).join('');
  attachPostEvents();
};

// Render a single post
const renderPost = (post) => {
  const isLiked = post.likes.includes(user.id);
  const isOwner = post.author._id === user.id;
  const avatar = post.author.avatar ||
    `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${post.author.name}`;
  const time = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric'
  });

  return `
    <div class="post-card" data-id="${post._id}">
      <div class="post-header">
        <img src="${avatar}" alt="avatar" class="post-avatar"
          onerror="this.src='https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${post.author.name}'" />
        <div>
          <a href="/profile.html?username=${post.author.username}" class="post-author-name">
            ${post.author.name}
          </a>
          <div class="post-author-username">@${post.author.username}</div>
        </div>
        <span class="post-time">${time}</span>
      </div>

      <div class="post-content">${post.content}</div>

      ${post.image ? `<img src="${post.image}" alt="post image" class="post-image" />` : ''}

      <div class="post-actions">
        <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-id="${post._id}">
          ${isLiked ? '💚' : '🤍'} <span class="like-count">${post.likes.length}</span>
        </button>
        <a href="/post.html?id=${post._id}" class="action-btn">
          💬 Comment
        </a>
        ${isOwner ? `
          <button class="action-btn delete-btn" data-id="${post._id}" style="margin-left: auto; color: var(--red);">
            🗑 Delete
          </button>` : ''}
      </div>
    </div>`;
};

// Attach events to post buttons
const attachPostEvents = () => {
  // Like buttons
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      await likePost(id);
      loadFeed();
    });
  });

  // Delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (confirm('Delete this post?')) {
        await deletePost(id);
        loadFeed();
      }
    });
  });
};

// Submit post
document.getElementById('submitPost').addEventListener('click', async () => {
  const content = document.getElementById('postContent').value.trim();
  const imageFile = document.getElementById('postImage').files[0];

  if (!content) return;

  const formData = new FormData();
  formData.append('content', content);
  if (imageFile) formData.append('image', imageFile);

  const btn = document.getElementById('submitPost');
  btn.textContent = 'Posting...';
  btn.disabled = true;

  await createPost(formData);

  document.getElementById('postContent').value = '';
  document.getElementById('postImage').value = '';
  document.getElementById('fileName').textContent = '';
  btn.textContent = 'Post';
  btn.disabled = false;

  loadFeed();
});

// Search users
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  const q = e.target.value.trim();
  const resultsEl = document.getElementById('searchResults');

  if (!q) {
    resultsEl.style.display = 'none';
    return;
  }

  searchTimeout = setTimeout(async () => {
    const users = await searchUsers(q);
    if (!users.length) {
      resultsEl.style.display = 'none';
      return;
    }

    resultsEl.style.display = 'block';
    resultsEl.innerHTML = users.map(u => `
      <a href="/profile.html?username=${u.username}" style="
        display: flex;
        align-items: center;
        gap: 0.6rem;
        padding: 0.5rem;
        border-radius: var(--radius);
        color: var(--text-primary);
        text-decoration: none;
      ">
        <img src="${u.avatar || `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${u.name}`}"
          style="width:32px; height:32px; border-radius:50%; object-fit:cover;" />
        <div>
          <div style="font-weight:600; font-size:0.875rem;">${u.name}</div>
          <div style="font-size:0.78rem; color:var(--text-muted);">@${u.username}</div>
        </div>
      </a>
    `).join('');
  }, 400);
});

// Close search on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('#searchInput') && !e.target.closest('#searchResults')) {
    document.getElementById('searchResults').style.display = 'none';
  }
});

// Init
loadFeed();