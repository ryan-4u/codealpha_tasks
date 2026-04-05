requireAuth();

const currentUser = getUser();
const params = new URLSearchParams(window.location.search);
const postId = params.get('id');

// Set navbar
document.getElementById('profileLink').href = `/profile.html?username=${currentUser.username}`;
document.getElementById('navAvatar').src = currentUser.avatar ||
  `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${currentUser.name}`;
document.getElementById('commentAvatar').src = currentUser.avatar ||
  `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${currentUser.name}`;

document.getElementById('logoutBtn').addEventListener('click', (e) => {
  e.preventDefault();
  logout();
});

if (!postId) {
  window.location.href = '/feed.html';
}

// Load post
const loadPost = async () => {
  const post = await getPost(postId);

  if (!post || post.message) {
    document.getElementById('postDetail').innerHTML = `
      <div class="empty-state"><p>Post not found.</p></div>`;
    return;
  }

  const isLiked = post.likes.includes(currentUser.id);
  const isOwner = post.author._id === currentUser.id;
  const avatar = post.author.avatar ||
    `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${post.author.name}`;
  const time = new Date(post.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  document.getElementById('postDetail').innerHTML = `
    <div class="post-card">
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

      <div class="post-content" style="font-size: 1.05rem;">${post.content}</div>

      ${post.image ? `<img src="${post.image}" alt="post image" class="post-image" />` : ''}

      <div class="post-actions">
        <button class="action-btn like-btn ${isLiked ? 'liked' : ''}" id="likeBtn">
          ${isLiked ? '💚' : '🤍'} <span id="likeCount">${post.likes.length}</span>
        </button>
        ${isOwner ? `
          <button class="action-btn" id="deleteBtn" style="margin-left:auto; color:var(--red);">
            🗑 Delete Post
          </button>` : ''}
      </div>
    </div>`;

  // Like button
  document.getElementById('likeBtn').addEventListener('click', async () => {
    await likePost(postId);
    loadPost();
  });

  // Delete button
  document.getElementById('deleteBtn')?.addEventListener('click', async () => {
    if (confirm('Delete this post?')) {
      await deletePost(postId);
      window.location.href = '/feed.html';
    }
  });

  // Show comments section
  document.getElementById('commentsSection').style.display = 'block';
  loadComments();
};

// Load comments
const loadComments = async () => {
  const comments = await getComments(postId);
  const container = document.getElementById('commentsList');

  if (!comments.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No comments yet. Start the conversation!</p>
      </div>`;
    return;
  }

  container.innerHTML = comments.map(comment => {
    const isOwner = comment.author._id === currentUser.id;
    const avatar = comment.author.avatar ||
      `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${comment.author.name}`;
    const time = new Date(comment.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });

    return `
      <div class="comment">
        <img src="${avatar}" alt="avatar" class="comment-avatar"
          onerror="this.src='https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${comment.author.name}'" />
        <div class="comment-body">
          <a href="/profile.html?username=${comment.author.username}" class="comment-author">
            ${comment.author.name}
          </a>
          <div class="comment-text">${comment.content}</div>
          <div class="comment-time">${time}</div>
        </div>
        ${isOwner ? `
          <button class="action-btn delete-comment-btn" data-id="${comment._id}"
            style="color:var(--red); margin-left:auto; align-self:flex-start;">
            🗑
          </button>` : ''}
      </div>`;
  }).join('');

  // Delete comment buttons
  document.querySelectorAll('.delete-comment-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (confirm('Delete this comment?')) {
        await deleteComment(btn.dataset.id);
        loadComments();
      }
    });
  });
};

// Submit comment
document.getElementById('submitComment').addEventListener('click', async () => {
  const content = document.getElementById('commentInput').value.trim();
  if (!content) return;

  const btn = document.getElementById('submitComment');
  btn.textContent = 'Posting...';
  btn.disabled = true;

  await addComment(postId, content);

  document.getElementById('commentInput').value = '';
  btn.textContent = 'Comment';
  btn.disabled = false;

  loadComments();
});

// Init
loadPost();