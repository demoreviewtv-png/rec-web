document.addEventListener('DOMContentLoaded', () => {
  let peer;
  let connections = [];
  let myColor = '#ff5722';

  // Load default room map
  RROGames.loadGame('default');

  // Watch Toggle
  const watchBtn = document.getElementById('watch-toggle-btn');
  const watchUI = document.getElementById('watch-interface');
  
  watchBtn.addEventListener('click', () => {
    const isVisible = watchUI.style.display === 'flex';
    watchUI.style.display = isVisible ? 'none' : 'flex';
  });

  // Tab Switcher
  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      e.target.classList.add('active');
      const targetTab = e.target.getAttribute('data-tab');
      document.getElementById(`tab-${targetTab}`).classList.add('active');
    });
  });

  // RRO Game Card Clicks
  const rroCards = document.querySelectorAll('.rro-card');
  rroCards.forEach(card => {
    card.addEventListener('click', () => {
      const game = card.getAttribute('data-game');
      RROGames.loadGame(game);
      watchUI.style.display = 'none'; // Close watch after selecting
    });
  });

  // Avatar Customizer
  const swatches = document.querySelectorAll('.color-swatch');
  swatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
      myColor = swatch.getAttribute('data-color');
      alert(`Avatar color set to ${myColor}`);
    });
  });

  // Initialize PeerJS Networking
  peer = new Peer();

  peer.on('open', (id) => {
    document.getElementById('my-peer-id').innerText = id;
  });

  // Connect to Friends
  document.getElementById('connect-friend-btn').addEventListener('click', () => {
    const friendId = document.getElementById('friend-id-input').value.trim();
    if (friendId) {
      const conn = peer.connect(friendId);
      conn.on('open', () => {
        connections.push(conn);
        document.getElementById('player-count').innerText = connections.length + 1;
        alert("Connected to friend!");
      });
    }
  });
});
