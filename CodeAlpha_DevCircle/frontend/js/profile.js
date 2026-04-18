requireAuth();

const currentUser = getUser();
const params = new URLSearchParams(window.location.search);
const username = params.get('username') || currentUser.username;

document.getElementById('profileLink').href = `profile.html?username=${currentUser.username}`;
document.getElementById('navAvatar').src = (currentUser.avatar || '').trim() ? currentUser.avatar :
  `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(currentUser.name)}`;

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  logout();
});

const loadProfile = async () => {
  document.getElementById('editProfileSection').style.display = 'none';
  const { user, posts } = await getProfile(username);

  if (!user) {
    document.getElementById('profileHeader').innerHTML = `
      <div class="empty-state"><p>User not found.</p></div>`;
    return;
  }

  const isOwn = user._id.toString() === currentUser.id.toString();
  const isFollowing = user.followers.some(f => f._id === currentUser.id);
  const avatar = (user.avatar || '').trim() ? user.avatar :
    `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(user.name)}`;

  document.getElementById('profileHeader').innerHTML = `
    <img src="${avatar}" alt="avatar" class="profile-avatar"
      onerror="this.src='https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(user.name)}'" />
    <div style="flex: 1; min-width: 0; max-width: calc(100% - 100px); overflow: hidden;">
      <div class="profile-name" style="word-break: break-word;">${user.name}</div>
      <div class="profile-username">@${user.username}</div>
      <div class="profile-bio" id="profileBio" style="margin-top: 0.5rem;"></div>
      <div class="profile-stats" style="margin-top: 1rem;">
        <div class="stat"><strong>${posts.length}</strong>Posts</div>
        <div class="stat"><strong>${user.followers.length}</strong>Followers</div>
        <div class="stat"><strong>${user.following.length}</strong>Following</div>
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

  const bioEl = document.getElementById('profileBio');
  bioEl.textContent = user.bio || 'No bio yet.';
  bioEl.style.whiteSpace = 'pre-wrap';
  bioEl.style.wordBreak = 'break-word';
  bioEl.style.overflowWrap = 'break-word';
  bioEl.style.maxWidth = '100%';

  if (isOwn) {
    document.getElementById('editProfileBtn').addEventListener('click', () => {
      const section = document.getElementById('editProfileSection');
      section.style.display = section.style.display === 'none' ? 'block' : 'none';
      document.getElementById('editName').value = user.name;
      const bioTextarea = document.getElementById('editBio');
      bioTextarea.value = user.bio || '';
      const bioCharCount = document.getElementById('bioCharCount');
      if (bioCharCount) bioCharCount.textContent = `(${bioTextarea.value.length}/300)`;
      bioTextarea.oninput = () => {
        const lines = bioTextarea.value.split('\n');
        if (lines.length > 5) {
          bioTextarea.value = lines.slice(0, 5).join('\n');
        }
        if (bioCharCount) bioCharCount.textContent = `(${bioTextarea.value.length}/300)`;
      };
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
        saveAuth(localStorage.getItem('token'), {
          ...currentUser,
          name: res.name,
          avatar: res.avatar,
          bio: res.bio
        });
        document.getElementById('editProfileSection').style.display = 'none';
        loadProfile();
      } else {
        errorEl.textContent = res.message || 'Update failed';
        errorEl.style.display = 'block';
      }
    });
  }

  document.getElementById('followBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('followBtn');
    await followUser(btn.dataset.id);
    loadProfile();
  });

  const postsContainer = document.getElementById('profilePosts');
  const postCountEl = document.getElementById('postCount');
  if (postCountEl) postCountEl.textContent = `${posts.length} post${posts.length !== 1 ? 's' : ''}`;

  if (!posts.length) {
    postsContainer.innerHTML = `
      <div class="empty-state">
        <div style="font-size: 2rem;">👨‍💻</div>
        <p>No posts yet.</p>
      </div>`;
  } else {
    postsContainer.innerHTML = posts.map(post => {
      const isOwner = post.author._id === currentUser.id;
      const isLiked = post.likes.includes(currentUser.id);
      const postAvatar = (post.author.avatar || '').trim() ? post.author.avatar :
        `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(post.author.name)}`;
      const time = new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric'
      });

      return `
        <div class="post-card" data-id="${post._id}">
          <div class="post-header">
            <img src="${postAvatar}" alt="avatar" class="post-avatar"
              onerror="this.src='https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(post.author.name)}'" />
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
            <a href="post.html?id=${post._id}" class="action-btn">💬 Comment</a>
            ${isOwner ? `
              <button class="action-btn delete-btn" data-id="${post._id}" style="margin-left:auto; color:var(--red);">
                🗑 Delete
              </button>` : ''}
          </div>
        </div>`;
    }).join('');

    document.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        await likePost(btn.dataset.id);
        loadProfile();
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (confirm('Delete this post?')) {
          await deletePost(btn.dataset.id);
          loadProfile();
        }
      });
    });
  }

  loadLinks(user, isOwn);
};

const loadLinks = (user, isOwn) => {
  const toggleBtn = document.getElementById('toggleAddLink');
  const addLinkForm = document.getElementById('addLinkForm');

  if (isOwn) {
    toggleBtn.style.display = 'block';

    toggleBtn.addEventListener('click', () => {
      const isVisible = addLinkForm.style.display === 'block';
      addLinkForm.style.display = isVisible ? 'none' : 'block';
      toggleBtn.textContent = isVisible ? '+ Add Link' : '− Cancel';
    });

    document.getElementById('submitLink').addEventListener('click', async () => {
      const name = document.getElementById('linkName').value.trim();
      const url = document.getElementById('linkUrl').value.trim();
      if (!name || !url) return;

      const res = await addLink(name, url);
      if (res._id) {
        document.getElementById('linkName').value = '';
        document.getElementById('linkUrl').value = '';
        addLinkForm.style.display = 'none';
        toggleBtn.textContent = '+ Add Link';
        renderLinks(res.links, isOwn);
      }
    });
  }

  renderLinks(user.links || [], isOwn);
};

const renderLinks = (links, isOwn) => {
  const linksList = document.getElementById('linksList');

  if (!links.length) {
    linksList.innerHTML = `
      <p style="font-size: 0.82rem; color: var(--text-muted);">
        ${isOwn ? 'No links yet. Add one below.' : 'No links added.'}
      </p>`;
    return;
  }

  linksList.innerHTML = links.map(link => `
    <div style="display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0; border-bottom: 1px solid var(--border-subtle);">
      <a href="${link.url}" target="_blank" rel="noopener noreferrer" style="
        flex: 1;
        font-size: 0.875rem;
        color: var(--accent);
        text-decoration: none;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      ">🔗 ${link.name}</a>
      ${isOwn ? `
        <button class="action-btn delete-link-btn" data-id="${link._id}"
          style="color: var(--red); font-size: 0.75rem; padding: 0.2rem 0.4rem;">
          🗑
        </button>` : ''}
    </div>
  `).join('');

  document.querySelectorAll('.delete-link-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const res = await deleteLink(btn.dataset.id);
      if (res._id) renderLinks(res.links, isOwn);
    });
  });
};

loadProfile();