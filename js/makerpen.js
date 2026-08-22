const MakerPen = {
  activeTool: 'create',
  mapEntities: {},
  MAX_INK: 50,

  init() {
    this.enforcePCOnly();
  },

  // Check PC Desktop platform constraint
  enforcePCOnly() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isMobile || (hasTouch && window.innerWidth < 1024)) {
      const block = document.getElementById('pc-only-block');
      if (block) block.style.display = 'flex';
    }
  },

  setTool(toolName) {
    this.activeTool = toolName;
    document.querySelectorAll('.btn-tool').forEach(btn => btn.classList.remove('active'));
    const targetBtn = document.getElementById(`tool-${toolName}`);
    if (targetBtn) targetBtn.classList.add('active');
  },

  updateInkMeter() {
    const count = Object.keys(this.mapEntities).length;
    const pct = Math.min(100, Math.round((count / this.MAX_INK) * 100));
    const valText = document.getElementById('ink-val');
    const fillBar = document.getElementById('ink-fill');

    if (valText) valText.innerText = `${pct}%`;
    if (fillBar) fillBar.style.width = `${pct}%`;
  },

  spawnShape() {
    if (Object.keys(this.mapEntities).length >= this.MAX_INK) {
      alert("Room Ink Limit Reached! Delete shapes to free up ink.");
      return;
    }

    const type = document.getElementById('shape-select').value;
    const color = document.getElementById('color-select').value;
    const id = 'obj_' + Date.now();

    // Spawn shape in front of the camera crosshair
    const cameraEl = document.getElementById('camera');
    const worldPos = new THREE.Vector3();
    cameraEl.object3D.getWorldPosition(worldPos);

    const worldDir = new THREE.Vector3();
    cameraEl.object3D.getWorldDirection(worldDir);

    const spawnPos = worldPos.add(worldDir.multiplyScalar(-2.5));

    const entityData = {
      id, type, color,
      position: `${spawnPos.x.toFixed(2)} ${Math.max(0.5, spawnPos.y).toFixed(2)} ${spawnPos.z.toFixed(2)}`
    };

    this.instantiateEntity(entityData);
  },

  instantiateEntity(data) {
    const container = document.getElementById('world-container');
    if (!container) return;

    const el = document.createElement(`a-${data.type}`);
    el.setAttribute('id', data.id);
    el.setAttribute('class', 'selectable');
    el.setAttribute('position', data.position);
    el.setAttribute('color', data.color);
    el.setAttribute('dynamic-body', 'shape: auto');

    el.addEventListener('click', () => this.handleInteraction(data.id));

    container.appendChild(el);
    this.mapEntities[data.id] = data;
    this.updateInkMeter();
  },

  handleInteraction(id) {
    const el = document.getElementById(id);
    if (!el) return;

    if (this.activeTool === 'delete') {
      el.remove();
      delete this.mapEntities[id];
      this.updateInkMeter();
    } else if (this.activeTool === 'recolor') {
      const newColor = document.getElementById('color-select').value;
      el.setAttribute('color', newColor);
      this.mapEntities[id].color = newColor;
    } else if (this.activeTool === 'move') {
      const currentPos = el.getAttribute('position');
      el.setAttribute('position', `${currentPos.x} ${currentPos.y + 0.5} ${currentPos.z - 0.5}`);
    }
  },

  publishRoom() {
    const payload = JSON.stringify(Object.values(this.mapEntities));
    localStorage.setItem('my_custom_room', payload);
    alert('Room successfully saved to local watch memory! Launching Main Game...');
    window.location.href = `index.html?room=${encodeURIComponent(payload)}`;
  }
};

window.addEventListener('DOMContentLoaded', () => MakerPen.init());
