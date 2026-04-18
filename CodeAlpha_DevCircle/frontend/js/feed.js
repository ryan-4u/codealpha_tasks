requireAuth();

const user = getUser();

document.getElementById('profileLink').href = `profile.html?username=${user.username}`;
document.getElementById('navAvatar').src = user.avatar && user.avatar !== '' ? user.avatar : `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(user.name)}`;
document.getElementById('createAvatar').src = user.avatar && user.avatar !== '' ? user.avatar : `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(user.name)}`;

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  logout();
});

document.getElementById('postImage').addEventListener('change', (e) => {
  const file = e.target.files[0];
  document.getElementById('fileName').textContent = file ? file.name : '';
});

// Load sidebar links
const loadSidebarLinks = async () => {
  const { user: freshUser } = await getProfile(user.username);
  const container = document.getElementById('sidebarLinks');

  if (!freshUser.links || !freshUser.links.length) {
    container.innerHTML = `
      <p style="font-size: 0.82rem; color: var(--text-muted);">
        No links yet. Add them on your <a href="profile.html?username=${user.username}">profile</a>.
      </p>`;
    return;
  }

  container.innerHTML = freshUser.links.slice(0, 5).map(link => `
    <a href="${link.url}" target="_blank" rel="noopener noreferrer" style="
      display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0;
      font-size: 0.875rem; color: var(--accent); border-bottom: 1px solid var(--border-subtle);
      text-decoration: none; transition: color 0.2s;">
      🔗 ${link.name}
    </a>`).join('');
};

// Load suggestions
const loadSuggestions = async () => {
  const container = document.getElementById('suggestions');
  const { user: freshUser } = await getProfile(user.username);
  const allUsers = await getSuggestions();

  const followingIds = freshUser.following.map(f => f._id || f);
  const suggestions = allUsers
    .filter(u => u._id !== user.id && !followingIds.includes(u._id))
    .slice(0, 5);

  if (!suggestions.length) {
    container.innerHTML = `<p style="font-size: 0.82rem; color: var(--text-muted);">No suggestions right now.</p>`;
    return;
  }

  container.innerHTML = suggestions.map(u => `
    <div class="user-suggestion">
      <img src="${(u.avatar || '').trim() ? u.avatar : `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(u.name)}`}"
        alt="avatar" class="suggestion-avatar"
        onerror="this.src='https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(u.name)}'" />
      <div style="flex: 1; min-width: 0;">
        <a href="profile.html?username=${u.username}" class="suggestion-name" style="color: var(--text-primary); display: block; font-weight: 600; font-size: 0.875rem;">
          ${u.name}
        </a>
        <div class="suggestion-username">@${u.username}</div>
      </div>
      <button class="btn btn-outline btn-sm follow-suggestion-btn" data-id="${u._id}">Follow</button>
    </div>`).join('');

  document.querySelectorAll('.follow-suggestion-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await followUser(btn.dataset.id);
      btn.textContent = 'Following';
      btn.disabled = true;
      loadSuggestions();
    });
  });
};

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

const renderPost = (post) => {
  const isLiked = post.likes.includes(user.id);
  const isOwner = post.author._id === user.id;
  const avatar = (post.author.avatar || '').trim() ? post.author.avatar :
    `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(post.author.name)}`;
  const time = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return `
    <div class="post-card" data-id="${post._id}">
      <div class="post-header">
        <img src="${avatar}" alt="avatar" class="post-avatar"
          onerror="this.src='https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(post.author.name)}'" />
        <div style="min-width:0;">
          <a href="profile.html?username=${post.author.username}" class="post-author-name">${post.author.name}</a>
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
        <a href="post.html?id=${post._id}" class="action-btn">💬 Comment</a>
        ${isOwner ? `
          <button class="action-btn delete-btn" data-id="${post._id}" style="margin-left:auto; color:var(--red);">🗑 Delete</button>` : ''}
      </div>
    </div>`;
};

const attachPostEvents = () => {
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await likePost(btn.dataset.id);
      loadFeed();
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Delete this post?')) {
        await deletePost(btn.dataset.id);
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

// @ mention autocomplete
const postContent = document.getElementById('postContent');
const mentionDropdown = document.createElement('div');
mentionDropdown.id = 'mentionDropdown';
mentionDropdown.style.cssText = `
  display: none; position: absolute; background: var(--bg-elevated);
  border: 1px solid var(--border); border-radius: var(--radius);
  z-index: 500; width: 220px; max-height: 200px; overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);`;
postContent.parentElement.style.position = 'relative';
postContent.parentElement.appendChild(mentionDropdown);

let mentionTimeout;
postContent.addEventListener('input', (e) => {
  clearTimeout(mentionTimeout);
  const val = postContent.value;
  const cursorPos = postContent.selectionStart;
  const textBeforeCursor = val.substring(0, cursorPos);
  const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

  if (!mentionMatch) {
    mentionDropdown.style.display = 'none';
    return;
  }

  const query = mentionMatch[1];
  mentionTimeout = setTimeout(async () => {
    const users = await searchUsers(query);
    if (!users.length) {
      mentionDropdown.style.display = 'none';
      return;
    }

    mentionDropdown.style.display = 'block';
    mentionDropdown.innerHTML = users.slice(0, 6).map(u => `
      <div class="mention-item" data-username="${u.username}" style="
        display: flex; align-items: center; gap: 0.6rem;
        padding: 0.5rem 0.75rem; cursor: pointer;
        border-bottom: 1px solid var(--border-subtle);
        transition: background 0.15s;">
        <img src="${(u.avatar || '').trim() ? u.avatar : `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(u.name)}`}"
          style="width:28px; height:28px; border-radius:50%; object-fit:cover;" />
        <div>
          <div style="font-weight:600; font-size:0.825rem;">${u.name}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">@${u.username}</div>
        </div>
      </div>`).join('');

    mentionDropdown.querySelectorAll('.mention-item').forEach(item => {
      item.addEventListener('mouseenter', () => item.style.background = 'rgba(88,166,255,0.08)');
      item.addEventListener('mouseleave', () => item.style.background = 'transparent');
      item.addEventListener('click', () => {
        const username = item.dataset.username;
        const newText = val.substring(0, cursorPos).replace(/@(\w*)$/, `@${username} `) + val.substring(cursorPos);
        postContent.value = newText;
        mentionDropdown.style.display = 'none';
        postContent.focus();
      });
    });
  }, 300);
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('#postContent') && !e.target.closest('#mentionDropdown')) {
    mentionDropdown.style.display = 'none';
  }
});

// Search users
let searchTimeout;
document.getElementById('searchInput').addEventListener('input', (e) => {
  clearTimeout(searchTimeout);
  const q = e.target.value.trim();
  const resultsEl = document.getElementById('searchResults');

  if (!q) { resultsEl.style.display = 'none'; return; }

  searchTimeout = setTimeout(async () => {
    const users = await searchUsers(q);
    if (!users.length) { resultsEl.style.display = 'none'; return; }

    resultsEl.style.display = 'block';
    resultsEl.innerHTML = users.map(u => `
      <a href="profile.html?username=${u.username}" style="
        display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem;
        border-radius: var(--radius); color: var(--text-primary); text-decoration: none;">
        <img src="${(u.avatar || '').trim() ? u.avatar : `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(u.name)}`}"
          style="width:32px; height:32px; border-radius:50%; object-fit:cover;" />
        <div>
          <div style="font-weight:600; font-size:0.875rem;">${u.name}</div>
          <div style="font-size:0.78rem; color:var(--text-muted);">@${u.username}</div>
        </div>
      </a>`).join('');
  }, 400);
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('#searchInput') && !e.target.closest('#searchResults')) {
    document.getElementById('searchResults').style.display = 'none';
  }
});

loadFeed();
loadSidebarLinks();
loadSuggestions();