// RROGames: builds the Rec Center hub plaza and the mini-games, and dispatches
// between them. Room geometry lives in #world-container, which is fully replaced
// on every room change (player-built objects live elsewhere, in #build-container,
// and are untouched by this).
const RROGames = {
  current: 'hub',

  roomNames: {
    hub: 'Rec Center Plaza',
    dodgeball: 'Dodgeball Arena',
    paintball: 'Splat Zone',
    goldentrophy: 'Temple of Gold'
  },

  loadGame(name) {
    this.current = name;

    const label = document.getElementById('current-room-label');
    if (label) label.innerText = this.roomNames[name] || name;

    const backBtn = document.getElementById('return-hub-btn');
    if (backBtn) backBtn.classList.toggle('hidden', name === 'hub');

    const hint = document.getElementById('hud-hint');
    if (hint) {
      hint.innerText = name === 'hub'
        ? 'Walk into a glowing portal to play · Press T for your Watch'
        : 'Click to play · Press T for your Watch';
    }

    this.clearWorld();
    switch (name) {
      case 'dodgeball': this.loadDodgeball(); break;
      case 'paintball': this.loadPaintball(); break;
      case 'goldentrophy': this.loadGoldenTrophy(); break;
      default: this.loadHub();
    }
  },

  clearWorld() {
    const world = document.getElementById('world-container');
    if (world) world.innerHTML = '';
  },

  openStudio() {
    window.open('studio/studio.html', '_blank');
  },

  // ---- Shared bean-shaped Rec Room avatar dummy ----
  createBeanDummy(id, position, name, bodyColor = '#e53e3e') {
    const bean = document.createElement('a-entity');
    bean.setAttribute('id', id);
    bean.setAttribute('position', position);

    bean.innerHTML = `
      <a-sphere position="0 1.4 0" radius="0.28" color="#ffe0bd">
        <a-sphere position="-0.09 0.03 -0.24" radius="0.045" color="#1a202c"></a-sphere>
        <a-sphere position="0.09 0.03 -0.24" radius="0.045" color="#1a202c"></a-sphere>
      </a-sphere>
      <a-cone position="0 0.8 0" radius-bottom="0.25" radius-top="0.15" height="0.7" color="${bodyColor}"></a-cone>
      <a-sphere position="-0.38 0.8 -0.1" radius="0.09" color="${bodyColor}"></a-sphere>
      <a-sphere position="0.38 0.8 -0.1" radius="0.09" color="${bodyColor}"></a-sphere>
      <a-text value="${name}" position="0 1.95 0" align="center" scale="0.5 0.5 0.5" color="#ffffff" side="double"></a-text>
    `;
    return bean;
  },

  // ---- Hub portal builder ----
  portalHTML({ x, z, rotY, color, label, icon, game }) {
    return `
      <a-entity position="${x} 0 ${z}" rotation="0 ${rotY} 0">
        <a-cylinder position="-1.7 1.6 0" radius="0.16" height="3.2" color="#0f172a"></a-cylinder>
        <a-cylinder position="1.7 1.6 0" radius="0.16" height="3.2" color="#0f172a"></a-cylinder>
        <a-box position="0 3.3 0" width="3.7" height="0.3" depth="0.4" color="${color}"></a-box>
        <a-torus class="selectable portal-hit" data-game="${game}" position="0 1.6 0" radius="1.3" radius-tubular="0.09"
          color="${color}" material="shader: standard; emissive: ${color}; emissiveIntensity: 0.6"
          animation="property: rotation; to: 0 0 360; loop: true; dur: 7000; easing: linear;"></a-torus>
        <a-circle class="selectable portal-hit" data-game="${game}" position="0 0.02 0" rotation="-90 0 0"
          radius="1.7" color="${color}" opacity="0.32" transparent="true"
          animation="property: opacity; to: 0.55; dir: alternate; loop: true; dur: 1400;"></a-circle>
        <a-text value="${icon} ${label}" position="0 3.95 0" align="center" color="#ffffff" scale="0.9 0.9 0.9" side="double"></a-text>
      </a-entity>
    `;
  },

  loadHub() {
    const world = document.getElementById('world-container');

    const lampHTML = (x, z) => `
      <a-cylinder position="${x} 1.4 ${z}" radius="0.06" height="2.8" color="#1e293b"></a-cylinder>
      <a-sphere position="${x} 2.85 ${z}" radius="0.16" color="#fde68a"
        material="shader: standard; emissive: #fde68a; emissiveIntensity: 0.9"></a-sphere>
    `;

    let lamps = '';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      lamps += lampHTML((Math.sin(a) * 15).toFixed(2), (Math.cos(a) * 15).toFixed(2));
    }

    let bunting = '';
    const buntColors = ['#ff5722', '#0284c7', '#facc15', '#22c55e'];
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const c = buntColors[i % buntColors.length];
      bunting += `<a-box position="${(Math.sin(a) * 16.4).toFixed(2)} 3.4 ${(Math.cos(a) * 16.4).toFixed(2)}"
        rotation="0 ${(-a * 180 / Math.PI).toFixed(1)} 0" width="0.5" height="0.7" depth="0.05" color="${c}"></a-box>`;
    }

    world.innerHTML = `
      <!-- Plaza floor -->
      <a-cylinder position="0 0.01 0" radius="17" height="0.05" color="${'#e64a19'}"></a-cylinder>
      <a-cylinder position="0 0.03 0" radius="15.5" height="0.05" color="#e2e8f0"></a-cylinder>
      <a-cylinder position="0 0.05 0" radius="6" height="0.05" color="#0284c7"></a-cylinder>
      <a-ring position="0 0.06 0" radius-inner="5.8" radius-outer="6.1" rotation="-90 0 0" color="#38bdf8"></a-ring>

      <!-- Central rotunda / fountain -->
      <a-cylinder position="0 0.8 0" radius="1.6" height="1.6" color="${'#0f172a'}"></a-cylinder>
      <a-cylinder position="0 1.65 0" radius="1.75" height="0.1" color="#facc15"></a-cylinder>
      <a-torus id="hub-ring" position="0 2.5 0" radius="1.1" radius-tubular="0.14" color="#facc15"
        material="shader: standard; emissive: #facc15; emissiveIntensity: 0.5"
        animation="property: rotation; to: 0 360 0; loop: true; dur: 5000; easing: linear;"></a-torus>
      <a-text value="REC CENTER" position="0 4.1 0" rotation="0 0 0" align="center" color="#ffffff" scale="1.4 1.4 1.4" side="double"></a-text>
      <a-text value="REC CENTER" position="0 4.1 0" rotation="0 180 0" align="center" color="#ffffff" scale="1.4 1.4 1.4" side="double"></a-text>
      <a-text value="REC CENTER" position="0 4.1 0" rotation="0 90 0" align="center" color="#ffffff" scale="1.4 1.4 1.4" side="double"></a-text>
      <a-text value="REC CENTER" position="0 4.1 0" rotation="0 -90 0" align="center" color="#ffffff" scale="1.4 1.4 1.4" side="double"></a-text>

      ${lamps}
      ${bunting}

      ${this.portalHTML({ x: 0, z: -13, rotY: 0, color: '#0284c7', label: 'DODGEBALL', icon: '🔴', game: 'dodgeball' })}
      ${this.portalHTML({ x: -12, z: -5, rotY: 55, color: '#ec4899', label: 'PAINTBALL', icon: '🎨', game: 'paintball' })}
      ${this.portalHTML({ x: 12, z: -5, rotY: -55, color: '#facc15', label: 'GOLD RUN', icon: '🏆', game: 'goldentrophy' })}
      ${this.portalHTML({ x: -7, z: 7, rotY: 145, color: '#22c55e', label: 'STUDIO', icon: '🛠️', game: 'studio' })}
    `;

    setTimeout(() => {
      document.querySelectorAll('.portal-hit').forEach((hit) => {
        hit.addEventListener('click', () => {
          const game = hit.getAttribute('data-game');
          if (game === 'studio') this.openStudio();
          else this.loadGame(game);
        });
      });
    }, 50);
  },

  // ---- 1. Dodgeball ----
  loadDodgeball() {
    const world = document.getElementById('world-container');

    world.innerHTML = `
      <a-plane position="0 0.01 -6" rotation="-90 0 0" width="14" height="20" color="#1e293b"></a-plane>
      <a-plane position="-3.5 0.02 -6" rotation="-90 0 0" width="6.5" height="19" color="#0284c7"></a-plane>
      <a-plane position="3.5 0.02 -6" rotation="-90 0 0" width="6.5" height="19" color="#ea580c"></a-plane>
      <a-plane position="0 0.03 -6" rotation="-90 0 0" width="0.3" height="19" color="#ffffff"></a-plane>
      <a-box position="-7 3 -6" width="0.4" height="6" depth="20" color="#0f172a"></a-box>
      <a-box position="7 3 -6" width="0.4" height="6" depth="20" color="#0f172a"></a-box>

      <a-sphere id="ball-1" class="dodgeball selectable" position="-1.5 0.3 -6" radius="0.3" color="#dc2626"></a-sphere>
      <a-sphere id="ball-2" class="dodgeball selectable" position="0 0.3 -6" radius="0.3" color="#dc2626"></a-sphere>
      <a-sphere id="ball-3" class="dodgeball selectable" position="1.5 0.3 -6" radius="0.3" color="#dc2626"></a-sphere>

      <a-box position="0 3.5 -13" width="4" height="1.8" depth="0.2" color="#0f172a">
        <a-text value="DODGEBALL" position="0 0.5 0.12" align="center" color="#ff5722" scale="0.8 0.8 0.8"></a-text>
        <a-text id="score-text" value="OUT: 0/1" position="0 -0.1 0.12" align="center" color="#4ade80" scale="0.7 0.7 0.7"></a-text>
      </a-box>
    `;

    const enemy = this.createBeanDummy('enemy-target', '0 0 -11', 'Coach Dummy', '#ea580c');
    world.appendChild(enemy);

    setTimeout(() => {
      document.querySelectorAll('.dodgeball').forEach((ball) => {
        const home = ball.getAttribute('position');
        ball.addEventListener('click', () => {
          ball.setAttribute('animation', 'property: position; to: 0 1.2 -11; dur: 350; easing: easeOutQuad;');
          setTimeout(() => {
            const target = document.getElementById('enemy-target');
            if (target) {
              target.setAttribute('animation', 'property: rotation; to: 90 0 0; dur: 300;');
              const txt = document.getElementById('score-text');
              if (txt) txt.setAttribute('value', 'OUT: 1/1 — WIN!');
            }
            ball.setAttribute('animation', `property: position; to: ${home.x} ${home.y} ${home.z}; dur: 500; delay: 400; easing: easeInQuad;`);
          }, 350);
        });
      });
    }, 100);
  },

  // ---- 2. Paintball ----
  loadPaintball() {
    const world = document.getElementById('world-container');

    world.innerHTML = `
      <a-plane position="0 0.01 -8" rotation="-90 0 0" width="24" height="24" color="#334155"></a-plane>
      <a-cylinder position="-3 1 -6" radius="0.8" height="2" color="#f97316" radius-top="0.6"></a-cylinder>
      <a-cylinder position="3 1 -6" radius="0.8" height="2" color="#0284c7" radius-top="0.6"></a-cylinder>
      <a-box position="0 1.2 -9" width="3" height="2.4" depth="0.4" color="#f97316"></a-box>

      <a-box id="paintball-gun" class="selectable" position="0.3 1 -1" width="0.12" height="0.2" depth="0.5" color="#ff5722">
        <a-text value="CLICK TO FIRE" position="0 0.25 0" scale="0.3 0.3 0.3" align="center" color="#ffffff" side="double"></a-text>
      </a-box>
    `;

    const bot = this.createBeanDummy('paintball-target', '-3 0 -6', 'Red Team', '#ef4444');
    world.appendChild(bot);

    setTimeout(() => {
      const gun = document.getElementById('paintball-gun');
      if (!gun) return;

      gun.addEventListener('click', () => {
        const splat = document.createElement('a-sphere');
        splat.setAttribute('radius', '0.09');
        splat.setAttribute('color', '#ec4899');
        splat.setAttribute('position', '0.3 1 -1.2');
        world.appendChild(splat);

        splat.setAttribute('animation', 'property: position; to: -3 1.2 -6; dur: 250; easing: linear;');
        setTimeout(() => {
          splat.setAttribute('radius', '0.3');
          splat.setAttribute('opacity', '0.8');
          setTimeout(() => splat.remove(), 1000);
        }, 250);
      });
    }, 100);
  },

  // ---- 3. Golden Trophy ----
  loadGoldenTrophy() {
    const world = document.getElementById('world-container');

    world.innerHTML = `
      <a-plane position="0 0.01 -8" rotation="-90 0 0" width="16" height="20" color="#1e293b"></a-plane>
      <a-box position="0 3 -15" width="16" height="6" depth="0.4" color="#0f172a"></a-box>

      <a-cylinder position="0 0.5 -13" radius="0.8" height="1" color="#eab308">
        <a-torus id="golden-trophy" position="0 1.2 0" radius="0.4" radius-tubular="0.08" color="#facc15"
          animation="property: rotation; to: 0 360 0; loop: true; dur: 3000; easing: linear;"></a-torus>
      </a-cylinder>

      <a-box position="0 4.5 -14.7" width="5" height="1.2" depth="0.1" color="#475569">
        <a-text id="goblin-hp" value="GOBLIN HP: 3" position="0 0 0.1" align="center" color="#22c55e" scale="0.8 0.8 0.8"></a-text>
      </a-box>
    `;

    const goblin = this.createBeanDummy('goblin-enemy', '0 0 -8', 'Jumbotron Goblin', '#22c55e');
    goblin.setAttribute('class', 'selectable');
    world.appendChild(goblin);

    let hp = 3;
    setTimeout(() => {
      const g = document.getElementById('goblin-enemy');
      if (!g) return;

      g.addEventListener('click', () => {
        hp -= 1;
        if (hp > 0) {
          const txt = document.getElementById('goblin-hp');
          if (txt) txt.setAttribute('value', `GOBLIN HP: ${hp}`);
          g.setAttribute('animation', 'property: position; to: 0 0.2 -8; dir: alternate; dur: 100; loop: 2;');
        } else {
          g.remove();
          const txt = document.getElementById('goblin-hp');
          if (txt) {
            txt.setAttribute('value', 'STAGE CLEAR!');
            txt.setAttribute('color', '#facc15');
          }
        }
      });
    }, 100);
  }
};

window.addEventListener('DOMContentLoaded', () => RROGames.loadGame('hub'));
