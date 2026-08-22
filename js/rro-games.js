const RROGames = {
  clearCurrentRoom() {
    const world = document.getElementById('world-container');
    if (world) world.innerHTML = '';
  },

  // Build Rec Room "Bean" Avatar Dummy
  createBeanDummy(id, position, name, bodyColor = "#e53e3e") {
    const bean = document.createElement('a-entity');
    bean.setAttribute('id', id);
    bean.setAttribute('position', position);
    
    bean.innerHTML = `
      <a-sphere position="0 1.4 0" radius="0.28" color="#ffe0bd">
        <a-capsule position="-0.08 0.05 -0.25" radius="0.03" length="0.08" color="#1a202c"></a-capsule>
        <a-capsule position="0.08 0.05 -0.25" radius="0.03" length="0.08" color="#1a202c"></a-capsule>
      </a-sphere>
      <a-cone position="0 0.8 0" radius-bottom="0.25" radius-top="0.15" height="0.7" color="${bodyColor}"></a-cone>
      <a-sphere position="-0.38 0.8 -0.1" radius="0.09" color="${bodyColor}"></a-sphere>
      <a-sphere position="0.38 0.8 -0.1" radius="0.09" color="${bodyColor}"></a-sphere>
      <a-text value="${name}" position="0 1.9 0" align="center" scale="0.5 0.5 0.5" color="#ffffff" side="double"></a-text>
    `;
    return bean;
  },

  // 1. Dodgeball
  loadDodgeball() {
    this.clearCurrentRoom();
    const world = document.getElementById('world-container');

    world.innerHTML = `
      <a-plane position="0 0.01 -6" rotation="-90 0 0" width="14" height="20" color="#1e293b" static-body></a-plane>
      <a-plane position="-3.5 0.02 -6" rotation="-90 0 0" width="6.5" height="19" color="#0284c7"></a-plane>
      <a-plane position="3.5 0.02 -6" rotation="-90 0 0" width="6.5" height="19" color="#ea580c"></a-plane>
      <a-plane position="0 0.03 -6" rotation="-90 0 0" width="0.3" height="19" color="#ffffff"></a-plane>

      <a-sphere id="ball-1" class="dodgeball selectable" position="-1.5 0.3 -6" radius="0.3" color="#dc2626"></a-sphere>
      <a-sphere id="ball-2" class="dodgeball selectable" position="0 0.3 -6" radius="0.3" color="#dc2626"></a-sphere>
      <a-sphere id="ball-3" class="dodgeball selectable" position="1.5 0.3 -6" radius="0.3" color="#dc2626"></a-sphere>

      <a-box position="0 3.5 -13" width="4" height="1.8" depth="0.2" color="#0f172a">
        <a-text value="^DODGEBALL" position="0 0.5 0.12" align="center" color="#ff5722" scale="0.8 0.8 0.8"></a-text>
        <a-text id="score-text" value="OUT: 0/1" position="0 -0.1 0.12" align="center" color="#4ade80" scale="0.7 0.7 0.7"></a-text>
      </a-box>
    `;

    const enemy = this.createBeanDummy('enemy-target', '0 0 -11', '^CoachDummy', '#ea580c');
    world.appendChild(enemy);

    setTimeout(() => {
      document.querySelectorAll('.dodgeball').forEach(ball => {
        ball.addEventListener('click', () => {
          ball.setAttribute('animation', 'property: position; to: 0 1.2 -11; dur: 350; easing: easeOutQuad;');
          setTimeout(() => {
            const target = document.getElementById('enemy-target');
            if (target) {
              target.setAttribute('animation', 'property: rotation; to: 90 0 0; dur: 300;');
              const txt = document.getElementById('score-text');
              if (txt) txt.setAttribute('value', 'OUT: 1/1 - WIN!');
            }
          }, 350);
        });
      });
    }, 100);
  },

  // 2. Paintball
  loadPaintball() {
    this.clearCurrentRoom();
    const world = document.getElementById('world-container');

    world.innerHTML = `
      <a-plane position="0 0.01 -8" rotation="-90 0 0" width="24" height="24" color="#334155" static-body></a-plane>
      <a-cylinder position="-3 1 -6" radius="0.8" height="2" color="#f97316" radius-top="0.6"></a-cylinder>
      <a-cylinder position="3 1 -6" radius="0.8" height="2" color="#0284c7" radius-top="0.6"></a-cylinder>
      <a-box position="0 1.2 -9" width="3" height="2.4" depth="0.4" color="#f97316"></a-box>

      <a-box id="paintball-gun" class="selectable" position="0.3 1 -1" width="0.12" height="0.2" depth="0.5" color="#ff5722">
        <a-text value="CLICK TO FIRE" position="0 0.25 0" scale="0.3 0.3 0.3" align="center" color="#ffffff" side="double"></a-text>
      </a-box>
    `;

    const bot = this.createBeanDummy('paintball-target', '-3 0 -6', 'RedPlayer', '#ef4444');
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

  // 3. Golden Trophy
  loadGoldenTrophy() {
    this.clearCurrentRoom();
    const world = document.getElementById('world-container');

    world.innerHTML = `
      <a-plane position="0 0.01 -8" rotation="-90 0 0" width="16" height="20" color="#1e293b" static-body></a-plane>
      <a-box position="0 3 -15" width="16" height="6" depth="0.4" color="#0f172a"></a-box>

      <a-cylinder position="0 0.5 -13" radius="0.8" height="1" color="#eab308">
        <a-torus id="golden-trophy" position="0 1.2 0" radius="0.4" radius-tubular="0.08" color="#facc15" animation="property: rotation; to: 0 360 0; loop: true; dur: 3000; easing: linear;"></a-torus>
      </a-cylinder>

      <a-box position="0 4.5 -14.7" width="5" height="1.2" depth="0.1" color="#475569">
        <a-text id="goblin-hp" value="GOBLIN HP: 3" position="0 0 0.1" align="center" color="#22c55e" scale="0.8 0.8 0.8"></a-text>
      </a-box>
    `;

    const goblin = this.createBeanDummy('goblin-enemy', '0 0 -8', 'JumboTron Goblin', '#22c55e');
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
