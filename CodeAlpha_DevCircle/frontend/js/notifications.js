const loadNotifications = async () => {
  const notifications = await getNotifications();
  const badge = document.getElementById('notifBadge');
  const list = document.getElementById('notifList');

  if (!notifications || !Array.isArray(notifications)) return;

  const unread = notifications.filter(n => !n.read).length;

  if (unread > 0) {
    badge.style.display = 'flex';
    badge.textContent = unread > 9 ? '9+' : unread;
  } else {
    badge.style.display = 'none';
  }

  if (!notifications.length) {
    list.innerHTML = `
      <div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.875rem;">
        No notifications yet
      </div>`;
    return;
  }

  list.innerHTML = notifications.map(n => {
    const avatar = (n.sender.avatar || '').trim() ? n.sender.avatar :
      `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(n.sender.name)}`;

    const time = new Date(n.createdAt).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric'
    });

    let message = '';
    let link = '';

    if (n.type === 'like') {
      message = `<strong>${n.sender.name}</strong> liked your post`;
      link = `post.html?id=${n.post?._id}`;
    } else if (n.type === 'comment') {
      message = `<strong>${n.sender.name}</strong> commented on your post`;
      link = `post.html?id=${n.post?._id}`;
    } else if (n.type === 'follow') {
      message = `<strong>${n.sender.name}</strong> followed you`;
      link = `profile.html?username=${n.sender.username}`;
    } else if (n.type === 'mention') {
      message = `<strong>${n.sender.name}</strong> mentioned you in a post`;
      link = `post.html?id=${n.post?._id}`;
    }

    return `
      <a href="${link}" style="
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.9rem 1.25rem;
        border-bottom: 1px solid var(--border-subtle);
        text-decoration: none;
        color: var(--text-primary);
        background: ${n.read ? 'transparent' : 'rgba(88, 166, 255, 0.05)'};
        transition: background 0.2s;
      ">
        <img src="${avatar}" style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          flex-shrink: 0;
          border: 1px solid var(--border);
        " onerror="this.src='https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${encodeURIComponent(n.sender.name)}'" />
        <div style="flex: 1; min-width: 0;">
          <div style="font-size: 0.875rem; line-height: 1.4;">${message}</div>
          <div style="font-size: 0.75rem; color: var(--text-muted); font-family: var(--font-mono); margin-top: 0.2rem;">${time}</div>
        </div>
        ${!n.read ? `<div style="width: 8px; height: 8px; border-radius: 50%; background: var(--accent); flex-shrink: 0;"></div>` : ''}
      </a>`;
  }).join('');
};

// Bell toggle
document.getElementById('bellBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  const popup = document.getElementById('notifPopup');
  const isOpen = popup.style.display === 'block';

  if (isOpen) {
    popup.style.display = 'none';
  } else {
    popup.style.display = 'block';
    await markNotificationsRead();
    await loadNotifications();
  }
});

// Mark all read button
document.getElementById('markReadBtn').addEventListener('click', async () => {
  await markNotificationsRead();
  await loadNotifications();
});

// Close popup on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('#bellBtn') && !e.target.closest('#notifPopup')) {
    document.getElementById('notifPopup').style.display = 'none';
  }
});

// Initial load of badge count
loadNotifications();