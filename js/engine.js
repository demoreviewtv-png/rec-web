const RROEngine = {
  isVR: false,

  init() {
    this.setupPointerLock();
    this.setupVRWatch();
    this.checkVRMode();
  },

  // Lock pointer for PC Mouse looking
  setupPointerLock() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    scene.addEventListener('click', () => {
      if (!document.pointerLockElement && !this.isVR) {
        scene.requestPointerLock();
      }
    });
  },

  // Check VR state
  checkVRMode() {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    scene.addEventListener('enter-vr', () => {
      this.isVR = true;
      const watch = document.getElementById('vr-watch-wrist');
      if (watch) watch.setAttribute('visible', 'true');
    });

    scene.addEventListener('exit-vr', () => {
      this.isVR = false;
      const watch = document.getElementById('vr-watch-wrist');
      if (watch) watch.setAttribute('visible', 'false');
    });
  },

  // Setup interactive Rec Room Watch on the player's left hand
  setupVRWatch() {
    const leftHand = document.getElementById('left-hand');
    if (!leftHand) return;

    const watch = document.createElement('a-entity');
    watch.setAttribute('id', 'vr-watch-wrist');
    watch.setAttribute('position', '0.05 0.02 0.08');
    watch.setAttribute('rotation', '-90 90 0');
    watch.setAttribute('visible', 'false');

    watch.innerHTML = `
      <!-- Strap & Bezel -->
      <a-cylinder radius="0.05" height="0.02" color="#0f172a" rotation="90 0 0"></a-cylinder>
      <a-plane position="0 0 0.011" width="0.09" height="0.09" color="#1e293b"></a-plane>

      <!-- UI Display -->
      <a-text value="^REC ROOM" position="0 0.03 0.012" align="center" scale="0.15 0.15 0.15" color="#ff5722"></a-text>
      
      <!-- Interactive Watch Buttons -->
      <a-box id="watch-btn-games" class="selectable" position="-0.02 -0.01 0.015" width="0.035" height="0.02" depth="0.005" color="#0284c7">
        <a-text value="GAMES" position="0 0 0.004" align="center" scale="0.08 0.08 0.08" color="#fff"></a-text>
      </a-box>

      <a-box id="watch-btn-studio" class="selectable" position="0.02 -0.01 0.015" width="0.035" height="0.02" depth="0.005" color="#ff5722">
        <a-text value="STUDIO" position="0 0 0.004" align="center" scale="0.08 0.08 0.08" color="#fff"></a-text>
      </a-box>
    `;

    leftHand.appendChild(watch);

    // Watch Navigation Listeners
    setTimeout(() => {
      const btnGames = document.getElementById('watch-btn-games');
      const btnStudio = document.getElementById('watch-btn-studio');

      if (btnGames) {
        btnGames.addEventListener('click', () => {
          if (typeof RROGames !== 'undefined') RROGames.loadDodgeball();
        });
      }

      if (btnStudio) {
        btnStudio.addEventListener('click', () => {
          window.location.href = 'studio.html';
        });
      }
    }, 500);
  }
};

window.addEventListener('DOMContentLoaded', () => RROEngine.init());
