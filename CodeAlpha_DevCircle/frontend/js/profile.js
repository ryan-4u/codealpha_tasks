requireAuth();

const currentUser = getUser();
const params = new URLSearchParams(window.location.search);
const username = params.get('username') || currentUser.username;

// Set navbar
document.getElementById('profileLink').href = `/profile.html?username=${currentUser.username}`;
document.getElementById('navAvatar').src = currentUser.avatar ||
  `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${currentUser.name}`;

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  logout();
});

// Load profile
const loadProfile = async () => {
  const { user, posts } = await getProfile(username);

  if (!user) {
    document.getElementById('profileHeader').innerHTML = `
      <div class="empty-state"><p>User not found.</p></div>`;
    return;
  }

  const isOwn = user._id === currentUser.id;
  const isFollowing = user.followers.some(f => f._id === currentUser.id);
  const avatar = user.avatar ||
    `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${user.name}`;

  // Render profile header
  document.getElementById('profileHeader').innerHTML = `
    <img src="${avatar}" alt="avatar" class="profile-avatar"
      onerror="this.src='https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${user.name}'" />
    <div style="flex: 1;">
      <div class="profile-name">${user.name}</div>
      <div class="profile-username">@${user.username}</div>
      <div class="profile-bio">${user.bio || 'No bio yet.'}</div>
      <div class="profile-stats">
        <div class="stat">
          <strong>${posts.length}</strong>
          Posts
        </div>
        <div class="stat">
          <strong>${user.followers.length}</strong>
          Followers
        </div>
        <div class="stat">
          <strong>${user.following.length}</strong>
          Following
        </div>
      </div>
      <div style="margin-top: 1rem; display: flex; gap: 0.75rem;">
        ${isOwn ? `
          <button class="btn btn-outline btn-sm" id="editProfileBtn">Edit Profile</button>
        ` : `
          <button class="btn ${isFollowing ? 'btn-outline' : 'btn-primary'} btn-sm" id="followBtn" data-id="${user._id}">
            ${isFollowing ? 'Unfollow' : 'Follow'}
          </button>
        `}
      </div>
    </div>`;

  // Edit profile toggle
  if (isOwn) {
    document.getElementById('editProfileBtn').addEventListener('click', () => {
      const section = document.getElementById('editProfileSection');
      section.style.display = section.style.display === 'none' ? 'block' : 'none';
      document.getElementById('editName').value = user.name;
      document.getElementById('editBio').value = user.bio || '';
    });

    document.getElementById('cancelEdit').addEventListener('click', () => {
      document.getElementById('editProfileSection').style.display = 'none';
    });

    document.getElementById('saveProfile').addEventListener('click', async () => {
      const formData = new FormData();
      formData.append('name', document.getElementById('editName').value);
      formData.append('bio', document.getElementById('editBio').value);
      const avatarFile = document.getElementById('editAvatar').files[0];
      if (avatarFile) formData.append('avatar', avatarFile);

      const errorEl = document.getElementById('editError');
      const successEl = document.getElementById('editSuccess');
      errorEl.style.display = 'none';
      successEl.style.display = 'none';

      const res = await updateProfile(formData);

      if (res._id) {
        // Update localStorage with new user info
        saveAuth(localStorage.getItem('token'), {
          ...currentUser,
          name: res.name,
          avatar: res.avatar,
          bio: res.bio
        });
        successEl.textContent = 'Profile updated!';
        successEl.style.display = 'block';
        setTimeout(() => loadProfile(), 1000);
      } else {
        errorEl.textContent = res.message || 'Update failed';
        errorEl.style.display = 'block';
      }
    });
  }

  // Follow / Unfollow
  document.getElementById('followBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('followBtn');
    const id = btn.dataset.id;
    await followUser(id);
    loadProfile();
  });

  // Render posts
  const postsContainer = document.getElementById('profilePosts');

  if (!posts.length) {
    postsContainer.innerHTML = `
      <div class="empty-state">
        <div style="font-size: 2rem;">👨‍💻</div>
        <p>No posts yet.</p>
      </div>`;
    return;
  }

  postsContainer.innerHTML = posts.map(post => {
    const isOwner = post.author._id === currentUser.id;
    const isLiked = post.likes.includes(currentUser.id);
    const postAvatar = post.author.avatar ||
      `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${post.author.name}`;
    const time = new Date(post.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });

    return `
      <div class="post-card" data-id="${post._id}">
        <div class="post-header">
          <img src="${postAvatar}" alt="avatar" class="post-avatar"
            onerror="this.src='https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${post.author.name}'" />
          <div>
            <div class="post-author-name">${post.author.name}</div>
            <div class="post-author-username">@${post.author.username}</div>
          </div>
          <span class="post-time">${time}</span>
        </div>
        <div class="post-content">${post.content}</div>
        ${post.image ? `<img src="${post.image}" alt="post" class="post-image" />` : ''}
        <div class="post-actions">
          <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" data-id="${post._id}">
            ${isLiked ? '💚' : '🤍'} <span>${post.likes.length}</span>
          </button>
          <a href="/post.html?id=${post._id}" class="action-btn">💬 Comment</a>
          ${isOwner ? `
            <button class="action-btn delete-btn" data-id="${post._id}" style="margin-left:auto; color:var(--red);">
              🗑 Delete
            </button>` : ''}
        </div>
      </div>`;
  }).join('');

  // Like buttons
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      await likePost(btn.dataset.id);
      loadProfile();
    });
  });

  // Delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Delete this post?')) {
        await deletePost(btn.dataset.id);
        loadProfile();
      }
    });
  });
};

loadProfile();