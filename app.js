(function () {
  const App = {
    peer: null,
    connections: [],
    avatarColor: localStorage.getItem('rec_avatar_color') || '#ff5722',

    init() {
      this.bindWatch();
      this.bindTabs();
      this.bindGames();
      this.bindAvatar();
      this.bindButtons();
      this.updateClock();
      setInterval(() => this.updateClock(), 1000);
      this.initPeer();
      this.updateAvatarPreview();
      RROGames.loadGame('hub');
    },

    bindWatch() {
      const toggle = document.getElementById('watch-toggle-btn');
      const watch = document.getElementById('watch-interface');
      const toggleWatch = () => { watch.classList.toggle('open'); };
      toggle.addEventListener('click', toggleWatch);
      window.addEventListener('keydown', (e) => {
        if (e.key.toLowerCase() === 't' && !['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) toggleWatch();
        if (e.key === 'Escape') watch.classList.remove('open');
      });
    },

    bindTabs() {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tab = document.getElementById('tab-' + btn.dataset.tab);
        if (tab) tab.classList.add('active');
      }));
    },

    bindGames() {
      document.querySelectorAll('.rro-card').forEach(card => card.addEventListener('click', () => {
        RROGames.loadGame(card.dataset.game);
        document.getElementById('watch-interface').classList.remove('open');
      }));
    },

    bindAvatar() {
      document.querySelectorAll('.color-swatch').forEach(btn => btn.addEventListener('click', () => {
        this.avatarColor = btn.dataset.color;
        localStorage.setItem('rec_avatar_color', this.avatarColor);
        this.updateAvatarPreview();
        const avatar = document.getElementById('local-avatar');
        if (avatar) avatar.setAttribute('color', this.avatarColor);
        this.toast('Avatar color updated.');
      }));
    },

    bindButtons() {
      document.getElementById('open-pen-btn').onclick = () => document.getElementById('maker-pen-ui').classList.add('open');
      document.getElementById('close-pen-btn').onclick = () => document.getElementById('maker-pen-ui').classList.remove('open');
      document.getElementById('clear-build-btn').onclick = () => MakerPen.clearBuild();
      document.getElementById('spawn-shape-btn').onclick = () => MakerPen.spawnShape();
      document.getElementById('home-reset-btn').onclick = () => RROEngine.resetPosition();
      document.getElementById('return-hub-btn').onclick = () => RROGames.loadGame('hub');
      ['grab','create','wire','recolor','delete'].forEach(tool => {
        const btn = document.getElementById('tool-' + tool);
        if (btn) btn.onclick = () => MakerPen.setTool(tool);
      });
    },

    updateClock() {
      const el = document.getElementById('clock-display');
      if (el) el.textContent = new Date().toLocaleTimeString();
    },

    updateAvatarPreview() {
      const el = document.getElementById('avatar-preview');
      if (el) el.style.background = this.avatarColor;
    },

    toast(message) {
      const el = document.getElementById('rro-toast');
      if (!el) return;
      el.textContent = message;
      el.classList.add('visible');
      clearTimeout(this.toastTimer);
      this.toastTimer = setTimeout(() => el.classList.remove('visible'), 2200);
    },

    initPeer() {
      if (typeof Peer === 'undefined') {
        document.getElementById('my-peer-id').textContent = 'Peer service unavailable';
        return;
      }
      try {
        this.peer = new Peer();
        this.peer.on('open', id => document.getElementById('my-peer-id').textContent = id);
        this.peer.on('connection', conn => this.acceptConnection(conn));
        this.peer.on('error', err => this.toast('Peer connection error: ' + (err.type || 'unknown')));
        document.getElementById('connect-friend-btn').onclick = () => {
          const id = document.getElementById('friend-id-input').value.trim();
          if (!id) return this.toast('Enter a peer ID first.');
          this.acceptConnection(this.peer.connect(id));
        };
      } catch (_) {
        document.getElementById('my-peer-id').textContent = 'Peer unavailable';
      }
    },

    acceptConnection(conn) {
      conn.on('open', () => {
        if (!this.connections.includes(conn)) this.connections.push(conn);
        this.updatePlayerCount();
        this.toast('Friend connected.');
      });
      conn.on('close', () => {
        this.connections = this.connections.filter(c => c !== conn);
        this.updatePlayerCount();
      });
    },

    updatePlayerCount() {
      document.getElementById('player-count').textContent = String(this.connections.length + 1);
    }
  };

  window.RROApp = App;
  window.addEventListener('DOMContentLoaded', () => App.init());
})();
