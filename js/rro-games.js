const RROGames = {
  // Clear scene before loading new room content
  clearCurrentRoom() {
    const world = document.getElementById('world-container');
    if (world) world.innerHTML = '';
  },

  // 1. Dodgeball RRO Game Logic
  loadDodgeball() {
    this.clearCurrentRoom();
    const world = document.getElementById('world-container');

    world.innerHTML = `
      <!-- Court Floor -->
      <a-plane position="0 0.01 -5" rotation="-90 0 0" width="12" height="18" color="#3182ce"></a-plane>
      <a-plane position="0 0.02 -5" rotation="-90 0 0" width="12" height="0.2" color="#ffffff"></a-plane>

      <!-- 3D Ball Models -->
      <a-entity id="ball-1" class="dodgeball" gltf-model="https://cdn.aframe.io/test-models/models/glTF-2.0/virtualcity/VC.gltf" scale="0.05 0.05 0.05" position="-2 0.5 -5" dynamic-body></a-entity>
      <a-entity id="ball-2" class="dodgeball" gltf-model="https://cdn.aframe.io/test-models/models/glTF-2.0/virtualcity/VC.gltf" scale="0.05 0.05 0.05" position="0 0.5 -5" dynamic-body></a-entity>
      <a-entity id="ball-3" class="dodgeball" gltf-model="https://cdn.aframe.io/test-models/models/glTF-2.0/virtualcity/VC.gltf" scale="0.05 0.05 0.05" position="2 0.5 -5" dynamic-body></a-entity>

      <!-- Target AI Dummy -->
      <a-box id="enemy-target" position="0 1 -10" color="#e53e3e" depth="0.5" height="1.8" width="0.8"></a-box>
    `;

    // Click handler to launch balls at target
    setTimeout(() => {
      document.querySelectorAll('.dodgeball').forEach(ball => {
        ball.addEventListener('click', () => {
          ball.setAttribute('animation', 'property: position; to: 0 1.2 -10; dur: 400; easing: linear;');
          setTimeout(() => {
            const enemy = document.getElementById('enemy-target');
            if (enemy) enemy.setAttribute('color', '#a0aec0');
          }, 400);
        });
      });
    }, 100);
  },

  // 2. Paintball RRO Game Logic
  loadPaintball() {
    this.clearCurrentRoom();
    const world = document.getElementById('world-container');

    world.innerHTML = `
      <!-- Arena Cover Bunkers -->
      <a-box position="-3 1 -6" width="2" height="2" depth="0.5" color="#dd6b20"></a-box>
      <a-box position="3 1 -6" width="2" height="2" depth="0.5" color="#dd6b20"></a-box>
      <a-cylinder position="0 1.2 -8" radius="0.8" height="2.4" color="#319795"></a-cylinder>

      <!-- Flag Base 3D Model -->
      <a-entity gltf-model="https://cdn.aframe.io/test-models/models/glTF-2.0/virtualcity/VC.gltf" scale="0.08 0.08 0.08" position="0 0 -12"></a-entity>

      <!-- Interactive Blaster -->
      <a-box id="paintball-gun" position="0.3 1 -1" width="0.1" height="0.15" depth="0.4" color="#d69e2e">
        <a-text value="CLICK TO FIRE" position="0 0.2 0" scale="0.3 0.3 0.3" align="center" color="#ffffff"></a-text>
      </a-box>
    `;

    // Shooting mechanism
    setTimeout(() => {
      const gun = document.getElementById('paintball-gun');
      if (!gun) return;

      gun.addEventListener('click', () => {
        const pellet = document.createElement('a-sphere');
        pellet.setAttribute('radius', '0.08');
        pellet.setAttribute('color', '#ed64a6');
        pellet.setAttribute('position', '0.3 1 -1.2');
        world.appendChild(pellet);

        pellet.setAttribute('animation', 'property: position; to: 0 1.2 -12; dur: 500; easing: linear;');
        setTimeout(() => pellet.remove(), 550);
      });
    }, 100);
  },

  // 3. Quest: Golden Trophy Game Logic
  loadGoldenTrophy() {
    this.clearCurrentRoom();
    const world = document.getElementById('world-container');

    world.innerHTML = `
      <!-- Castle Dungeon Room -->
      <a-box position="0 2.5 -10" width="10" height="5" depth="0.2" color="#4a5568"></a-box>
      <a-box position="-5 2.5 -5" rotation="0 90 0" width="10" height="5" depth="0.2" color="#4a5568"></a-box>
      <a-box position="5 2.5 -5" rotation="0 90 0" width="10" height="5" depth="0.2" color="#4a5568"></a-box>

      <!-- Golden Trophy Model at End of Room -->
      <a-entity id="trophy" gltf-model="https://cdn.aframe.io/test-models/models/glTF-2.0/virtualcity/VC.gltf" scale="0.1 0.1 0.1" position="0 1 -9" animation="property: rotation; to: 0 360 0; loop: true; dur: 4000; easing: linear;"></a-entity>

      <!-- Goblin AI Enemy -->
      <a-sphere id="goblin" position="0 1 -6" radius="0.6" color="#38a169">
        <a-text value="Goblin Health: 3" position="0 0.8 0" align="center" scale="0.4 0.4 0.4" color="#fff"></a-text>
      </a-sphere>
    `;

    // Attack mechanics
    let hp = 3;
    setTimeout(() => {
      const goblin = document.getElementById('goblin');
      if (!goblin) return;

      goblin.addEventListener('click', () => {
        hp -= 1;
        if (hp > 0) {
          goblin.querySelector('a-text').setAttribute('value', `Goblin Health: ${hp}`);
        } else {
          goblin.remove();
          alert("Goblin Defeated! You reached the Golden Trophy!");
        }
      });
    }, 100);
  },

  // Load user JSON rooms published from Studio
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
