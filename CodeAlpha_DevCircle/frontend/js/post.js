requireAuth();

const currentUser = getUser();
const params = new URLSearchParams(window.location.search);
const postId = params.get('id');

document.getElementById('profileLink').href = `profile.html?username=${currentUser.username}`;
document.getElementById('navAvatar').src = (currentUser.avatar || '').trim() ? currentUser.avatar :
  `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(currentUser.name)}`;
document.getElementById('commentAvatar').src = (currentUser.avatar || '').trim() ? currentUser.avatar :
  `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(currentUser.name)}`;

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  logout();
});

if (!postId) window.location.href = 'feed.html';

const loadPost = async () => {
  const post = await getPost(postId);

  if (!post || post.message) {
    document.getElementById('postDetail').innerHTML = `<div class="empty-state"><p>Post not found.</p></div>`;
    return;
  }

  const isLiked = post.likes.includes(currentUser.id);
  const isOwner = post.author._id === currentUser.id;
  const avatar = (post.author.avatar || '').trim() ? post.author.avatar :
    `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(post.author.name)}`;
  const time = new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  document.getElementById('postDetail').innerHTML = `
    <div class="post-card">
      <div class="post-header">
        <img src="${avatar}" alt="avatar" class="post-avatar"
          onerror="this.src='https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(post.author.name)}'" />
        <div style="min-width:0;">
          <a href="profile.html?username=${post.author.username}" class="post-author-name">${post.author.name}</a>
          <div class="post-author-username">@${post.author.username}</div>
        </div>
        <span class="post-time">${time}</span>
      </div>
      <div class="post-content" style="font-size: 1.05rem;">${post.content}</div>
      ${post.image ? `<img src="${post.image}" alt="post image" class="post-image" />` : ''}
      <div class="post-actions">
        <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" id="likeBtn">
          ${isLiked ? '💚' : '🤍'} <span id="likeCount">${post.likes.length}</span>
        </button>
        ${isOwner ? `
          <button class="action-btn" id="deleteBtn" style="margin-left:auto; color:var(--red);">🗑 Delete Post</button>` : ''}
      </div>
    </div>`;

  document.getElementById('likeBtn').addEventListener('click', async () => {
    await likePost(postId);
    loadPost();
  });

  document.getElementById('deleteBtn')?.addEventListener('click', async () => {
    if (confirm('Delete this post?')) {
      await deletePost(postId);
      window.location.href = 'feed.html';
    }
  });

  document.getElementById('commentsSection').style.display = 'block';
  loadComments();
};

const loadComments = async () => {
  const comments = await getComments(postId);
  const container = document.getElementById('commentsList');

  if (!comments.length) {
    container.innerHTML = `<div class="empty-state"><p>No comments yet. Start the conversation!</p></div>`;
    return;
  }

  container.innerHTML = comments.map(comment => {
    const isOwner = comment.author._id === currentUser.id;
    const avatar = (comment.author.avatar || '').trim() ? comment.author.avatar :
      `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(comment.author.name)}`;
    const time = new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return `
      <div class="comment">
        <img src="${avatar}" alt="avatar" class="comment-avatar"
          onerror="this.src='https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(comment.author.name)}'" />
        <div class="comment-body">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <a href="profile.html?username=${comment.author.username}" class="comment-author">${comment.author.name}</a>
            <span style="font-size:0.75rem; color:var(--text-muted); font-family:var(--font-mono);">@${comment.author.username}</span>
          </div>
          <div class="comment-text">${comment.content}</div>
          <div class="comment-time">${time}</div>
        </div>
        ${isOwner ? `
          <button class="action-btn delete-comment-btn" data-id="${comment._id}"
            style="color:var(--red); margin-left:auto; align-self:flex-start;">🗑</button>` : ''}
      </div>`;
  }).join('');

  document.querySelectorAll('.delete-comment-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Delete this comment?')) {
        await deleteComment(btn.dataset.id);
        loadComments();
      }
    });
  });
};

// @ mention autocomplete in comment box
const commentInput = document.getElementById('commentInput');
const mentionDropdown = document.createElement('div');
mentionDropdown.id = 'commentMentionDropdown';
mentionDropdown.style.cssText = `
  display: none; position: absolute; background: var(--bg-elevated);
  border: 1px solid var(--border); border-radius: var(--radius);
  z-index: 500; width: 220px; max-height: 200px; overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);`;
commentInput.parentElement.style.position = 'relative';
commentInput.parentElement.appendChild(mentionDropdown);

let mentionTimeout;
commentInput.addEventListener('input', () => {
  clearTimeout(mentionTimeout);
  const val = commentInput.value;
  const cursorPos = commentInput.selectionStart;
  const textBeforeCursor = val.substring(0, cursorPos);
  const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

  if (!mentionMatch) { mentionDropdown.style.display = 'none'; return; }

  const query = mentionMatch[1];
  mentionTimeout = setTimeout(async () => {
    const users = await searchUsers(query);
    if (!users.length) { mentionDropdown.style.display = 'none'; return; }

    mentionDropdown.style.display = 'block';
    mentionDropdown.innerHTML = users.slice(0, 6).map(u => `
      <div class="mention-item" data-username="${u.username}" style="
        display: flex; align-items: center; gap: 0.6rem;
        padding: 0.5rem 0.75rem; cursor: pointer;
        border-bottom: 1px solid var(--border-subtle); transition: background 0.15s;">
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
        commentInput.value = newText;
        mentionDropdown.style.display = 'none';
        commentInput.focus();
      });
    });
  }, 300);
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('#commentInput') && !e.target.closest('#commentMentionDropdown')) {
    mentionDropdown.style.display = 'none';
  }
});

document.getElementById('submitComment').addEventListener('click', async () => {
  const content = commentInput.value.trim();
  if (!content) return;

  const btn = document.getElementById('submitComment');
  btn.textContent = 'Posting...';
  btn.disabled = true;

  await addComment(postId, content);

  commentInput.value = '';
  btn.textContent = 'Comment';
  btn.disabled = false;

  loadComments();
});

loadPost();