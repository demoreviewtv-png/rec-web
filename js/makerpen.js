const MakerPen = {
  activeTool: 'create',
  mapEntities: {},
  circuits: {},
  MAX_INK: 50,

  init() {
    this.enforcePCOnly();
    this.startCircuitLoop();
  },

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

  // Calculate spawn position 2.5m in front of camera
  getSpawnPosition() {
    const cameraEl = document.getElementById('camera');
    const worldPos = new THREE.Vector3();
    cameraEl.object3D.getWorldPosition(worldPos);

    const worldDir = new THREE.Vector3();
    cameraEl.object3D.getWorldDirection(worldDir);

    const spawnPos = worldPos.add(worldDir.multiplyScalar(-2.5));
    return `${spawnPos.x.toFixed(2)} ${Math.max(0.5, spawnPos.y).toFixed(2)} ${spawnPos.z.toFixed(2)}`;
  },

  // Spawn standard geometric shapes
  spawnShape() {
    if (Object.keys(this.mapEntities).length >= this.MAX_INK) {
      alert("Room Ink Limit Reached!");
      return;
    }

    const type = document.getElementById('shape-select').value;
    const color = document.getElementById('color-select').value;
    const id = 'obj_' + Date.now();
    const position = this.getSpawnPosition();

    this.instantiateEntity({ id, type, color, position, entityType: 'prop' });
  },

  // Spawn Rec Room Gizmos & Circuit Chips
  spawnGizmo(gizmoType) {
    if (Object.keys(this.mapEntities).length >= this.MAX_INK) {
      alert("Room Ink Limit Reached!");
      return;
    }

    const id = 'gizmo_' + Date.now();
    const position = this.getSpawnPosition();

    if (gizmoType === 'rotator') {
      this.instantiateEntity({
        id,
        type: 'cylinder',
        color: '#0284c7',
        position,
        entityType: 'rotator',
        speed: 45 // Degrees per second
      });
    } else if (gizmoType === 'trigger') {
      this.instantiateEntity({
        id,
        type: 'box',
        color: '#38bdf8',
        position,
        entityType: 'trigger',
        opacity: 0.4
      });
    }
  },

  instantiateEntity(data) {
    const container = document.getElementById('world-container');
    if (!container) return;

    const el = document.createElement(`a-${data.type}`);
    el.setAttribute('id', data.id);
    el.setAttribute('class', 'selectable');
    el.setAttribute('position', data.position);
    el.setAttribute('color', data.color);

    if (data.entityType === 'trigger') {
      el.setAttribute('material', `color: ${data.color}; transparent: true; opacity: ${data.opacity}`);
      el.setAttribute('geometry', 'width: 2; height: 2; depth: 2');
    } else if (data.entityType === 'rotator') {
      el.setAttribute('geometry', 'radius: 0.3; height: 0.4');
      
      // Visual indicator arrow on rotator gizmo
      const pin = document.createElement('a-box');
      pin.setAttribute('position', '0 0.25 0.2');
      pin.setAttribute('width', '0.1');
      pin.setAttribute('height', '0.1');
      pin.setAttribute('depth', '0.3');
      pin.setAttribute('color', '#facc15');
      el.appendChild(pin);
    } else {
      el.setAttribute('dynamic-body', 'shape: auto');
    }

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
    } else if (this.activeTool === 'wire') {
      this.wireCircuit(id);
    }
  },

  // Wire Gizmo logic linking
  wireCircuit(targetId) {
    if (!this.selectedWireSource) {
      this.selectedWireSource = targetId;
      alert(`Wire Source Selected: [${targetId}]. Now click another object to wire as child target!`);
    } else {
      const sourceEl = document.getElementById(this.selectedWireSource);
      const targetEl = document.getElementById(targetId);

      if (sourceEl && targetEl && this.selectedWireSource !== targetId) {
        // Attach target element as child of Rotator/Gizmo source
        sourceEl.appendChild(targetEl);
        targetEl.setAttribute('position', '0 1 0'); // Offset on top of gizmo
        alert(`Successfully wired ${targetId} to ${this.selectedWireSource}!`);
      }
      this.selectedWireSource = null;
    }
  },

  // Execution engine loop for Rotators and Trigger Volume detection
  startCircuitLoop() {
    let lastTime = performance.now();

    const tick = (now) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      const playerCam = document.getElementById('camera');
      let playerPos = null;
      if (playerCam) {
        playerPos = new THREE.Vector3();
        playerCam.object3D.getWorldPosition(playerPos);
      }

      Object.values(this.mapEntities).forEach(entity => {
        const el = document.getElementById(entity.id);
        if (!el) return;

        // Rotator Gizmo Rotation Logic
        if (entity.entityType === 'rotator') {
          const currentRot = el.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
          el.setAttribute('rotation', `${currentRot.x} ${(currentRot.y + entity.speed * dt) % 360} ${currentRot.z}`);
        }

        // Trigger Zone Detection Logic
        if (entity.entityType === 'trigger' && playerPos) {
          const triggerPos = new THREE.Vector3();
          el.object3D.getWorldPosition(triggerPos);

          const distance = playerPos.distanceTo(triggerPos);
          if (distance < 1.5) {
            el.setAttribute('material', 'color: #ef4444; transparent: true; opacity: 0.6');
          } else {
            el.setAttribute('material', `color: ${entity.color}; transparent: true; opacity: 0.4`);
          }
        }
      });

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  },

  publishRoom() {
    const payload = JSON.stringify(Object.values(this.mapEntities));
    localStorage.setItem('my_custom_room', payload);
    alert('Room & Circuits saved! Launching Main Game...');
    window.location.href = `index.html?room=${encodeURIComponent(payload)}`;
  }
};

window.addEventListener('DOMContentLoaded', () => MakerPen.init());
