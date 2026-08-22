const RROGames = {
  // Clear scene before loading new room content
  clearCurrentRoom() {
    const world = document.getElementById('world-container');
    if (world) world.innerHTML = '';
  },

  // Helper: Create Rec Room "Bean" Avatar AI
  createBeanDummy(id, position, name, bodyColor = "#e53e3e") {
    const bean = document.createElement('a-entity');
    bean.setAttribute('id', id);
    bean.setAttribute('position', position);
    
    bean.innerHTML = `
      <!-- Floating Head -->
      <a-sphere position="0 1.4 0" radius="0.28" color="#ffe0bd">
        <a-capsule position="-0.08 0.05 -0.25" radius="0.03" length="0.08" color="#1a202c"></a-capsule>
        <a-capsule position="0.08 0.05 -0.25" radius="0.03" length="0.08" color="#1a202c"></a-capsule>
      </a-sphere>

      <!-- Floating Torso -->
      <a-cone position="0 0.8 0" radius-bottom="0.25" radius-top="0.15" height="0.7" color="${bodyColor}"></a-cone>

      <!-- Floating Hands -->
      <a-sphere position="-0.38 0.8 -0.1" radius="0.09" color="${bodyColor}"></a-sphere>
      <a-sphere position="0.38 0.8 -0.1" radius="0.09" color="${bodyColor}"></a-sphere>

      <!-- Name Tag -->
      <a-text value="${name}" position="0 1.9 0" align="center" scale="0.5 0.5 0.5" color="#ffffff" side="double"></a-text>
    `;
    return bean;
  },

  // 1. Dodgeball RRO Game Logic
  loadDodgeball() {
    this.clearCurrentRoom();
    const world = document.getElementById('world-container');

    world.innerHTML = `
      <!-- Rec Room Blue/Orange Court Floor -->
      <a-plane position="0 0.01 -6" rotation="-90 0 0" width="14" height="20" color="#1e293b"></a-plane>
      <a-plane position="-3.5 0.02 -6" rotation="-90 0 0" width="6.5" height="19" color="#0284c7"></a-plane>
      <a-plane position="3.5 0.02 -6" rotation="-90 0 0" width="6.5" height="19" color="#ea580c"></a-plane>
      
      <!-- Court Center Boundary Line -->
      <a-plane position="0 0.03 -6" rotation="-90 0 0" width="0.3" height="19" color="#ffffff"></a-plane>

      <!-- Interactive Red Rec Room Dodgeballs -->
      <a-sphere id="ball-1" class="dodgeball" position="-1.5 0.3 -6" radius="0.3" color="#dc2626" animation="property: scale; to: 1.1 1.1 1.1; dir: alternate; loop: true; dur: 800;"></a-sphere>
      <a-sphere id="ball-2" class="dodgeball" position="0 0.3 -6" radius="0.3" color="#dc2626" animation="property: scale; to: 1.1 1.1 1.1; dir: alternate; loop: true; dur: 800; startEvents: 200;"></a-sphere>
      <a-sphere id="ball-3" class="dodgeball" position="1.5 0.3 -6" radius="0.3" color="#dc2626" animation="property: scale; to: 1.1 1.1 1.1; dir: alternate; loop: true; dur: 800; startEvents: 400;"></a-sphere>

      <!-- Scoreboard Billboard -->
      <a-box position="0 3.5 -13" width="4" height="1.8" depth="0.2" color="#0f172a">
        <a-text value="^DODGEBALL" position="0 0.5 0.12" align="center" color="#ff5722" scale="0.8 0.8 0.8"></a-text>
        <a-text id="score-text" value="OUT: 0/1" position="0 -0.1 0.12" align="center" color="#4ade80" scale="0.7 0.7 0.7"></a-text>
      </a-box>
    `;

    // Add Enemy Target Dummy
    const enemy = this.createBeanDummy('enemy-target', '0 0 -11', '^CoachDummy', '#ea580c');
    world.appendChild(enemy);

    // Throwing mechanism
    setTimeout(() => {
      document.querySelectorAll('.dodgeball').forEach(ball => {
        ball.addEventListener('click', () => {
          ball.removeAttribute('animation');
          ball.setAttribute('animation', 'property: position; to: 0 1.2 -11; dur: 350; easing: easeOutQuad;');
          
          setTimeout(() => {
            const target = document.getElementById('enemy-target');
            if (target) {
              target.setAttribute('animation', 'property: rotation; to: 90 0 0; dur: 300;');
              document.getElementById('score-text').setAttribute('value', 'OUT: 1/1 - WIN!');
            }
          }, 350);
        });
      });
    }, 100);
  },

  // 2. Paintball RRO Game Logic
  loadPaintball() {
    this.clearCurrentRoom();
    const world = document.getElementById('world-container');

    world.innerHTML = `
      <!-- Arena Floor & Cover Bunkers -->
      <a-plane position="0 0.01 -8" rotation="-90 0 0" width="24" height="24" color="#334155"></a-plane>
      
      <!-- Inflatable Orange/Blue Bunkers -->
      <a-cylinder position="-3 1 -6" radius="0.8" height="2" color="#f97316" radius-top="0.6"></a-cylinder>
      <a-cylinder position="3 1 -6" radius="0.8" height="2" color="#0284c7" radius-top="0.6"></a-cylinder>
      <a-box position="0 1.2 -9" width="3" height="2.4" depth="0.4" color="#f97316"></a-box>

      <!-- Capture Flag Stand -->
      <a-cylinder position="0 0.2 -13" radius="1" height="0.4" color="#eab308">
        <a-text value="RED FLAG" position="0 1.5 0" align="center" color="#ef4444" scale="0.8 0.8 0.8" side="double"></a-text>
      </a-cylinder>

      <!-- Rec Room Paintball Blaster GUI -->
      <a-box id="paintball-gun" position="0.3 1 -1" width="0.12" height="0.2" depth="0.5" color="#ff5722">
        <a-text value="PULL TRIGGER" position="0 0.25 0" scale="0.3 0.3 0.3" align="center" color="#ffffff" side="double"></a-text>
      </a-box>
    `;

    // Add Target Bot
    const bot = this.createBeanDummy('paintball-target', '-3 0 -6', 'RedPlayer', '#ef4444');
    world.appendChild(bot);

    // Blaster shooting animation
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

  // 3. Quest: Golden Trophy Game Logic
  loadGoldenTrophy() {
    this.clearCurrentRoom();
    const world = document.getElementById('world-container');

    world.innerHTML = `
      <!-- Dungeon Room Scene -->
      <a-plane position="0 0.01 -8" rotation="-90 0 0" width="16" height="20" color="#1e293b"></a-plane>
      <a-box position="0 3 -15" width="16" height="6" depth="0.4" color="#0f172a"></a-box>
      <a-box position="-8 3 -8" rotation="0 90 0" width="16" height="6" depth="0.4" color="#0f172a"></a-box>
      <a-box position="8 3 -8" rotation="0 90 0" width="16" height="6" depth="0.4" color="#0f172a"></a-box>

      <!-- Golden Trophy Base & Award Model -->
      <a-cylinder position="0 0.5 -13" radius="0.8" height="1" color="#eab308">
        <a-torus id="golden-trophy" position="0 1.2 0" radius="0.4" radius-tubular="0.08" color="#facc15" animation="property: rotation; to: 0 360 0; loop: true; dur: 3000; easing: linear;"></a-torus>
      </a-cylinder>

      <!-- Quest Health Counter -->
      <a-box position="0 4.5 -14.7" width="5" height="1.2" depth="0.1" color="#475569">
        <a-text id="goblin-hp" value="GOBLIN HP: 3" position="0 0 0.1" align="center" color="#22c55e" scale="0.8 0.8 0.8"></a-text>
      </a-box>
    `;

    // Spawn Quest Goblin Enemy
    const goblin = this.createBeanDummy('goblin-enemy', '0 0 -8', 'JumboTron Goblin', '#22c55e');
    world.appendChild(goblin);

    let hp = 3;
    setTimeout(() => {
      const g = document.getElementById('goblin-enemy');
      if (!g) return;

      g.addEventListener('click', () => {
        hp -= 1;
        if (hp > 0) {
          document.getElementById('goblin-hp').setAttribute('value', `GOBLIN HP: ${hp}`);
          g.setAttribute('animation', 'property: position; to: 0 0.2 -8; dir: alternate; dur: 100; loop: 2;');
        } else {
          g.remove();
          document.getElementById('goblin-hp').setAttribute('value', 'STAGE CLEAR!');
          document.getElementById('goblin-hp').setAttribute('color', '#facc15');
        }
      });
    }, 100);
  },

  // Load user JSON rooms published from JR Studio
  loadCustomJSONMap(jsonString) {
    this.clearCurrentRoom();
    const world = document.getElementById('world-container');
    
    try {
      const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      
      if (data.skyColor) {
        const sky = document.querySelector('a-sky');
        if (sky) sky.setAttribute('color', data.skyColor);
      }

      if (Array.isArray(data.objects)) {
        data.objects.forEach(obj => {
          const el = document.createElement(`a-${obj.type}`);
          el.setAttribute('position', obj.position);
          el.setAttribute('color', obj.color);
          if (obj.type === 'plane') el.setAttribute('rotation', '-90 0 0');
          world.appendChild(el);
        });
      }
    } catch (err) {
      console.error("Failed to parse custom studio map:", err);
    }
  }
};
