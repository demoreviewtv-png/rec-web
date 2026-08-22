// MakerPen: the player's build tool. Shared by the hub (index.html) and the
// dedicated Studio page. Everything the player spawns lives in #build-container,
// kept separate from the room geometry in #world-container so switching rooms
// never wipes (or ink-counts) a player's own creations.
const MakerPen = {
  activeTool: 'grab',
  entities: {},
  heldId: null,
  wireSource: null,
  MAX_INK: 40,
  GRAVITY: -9.8,

  init() {
    this.enforcePCOnly();
    this.loadBuild();
    this.startLoop();
  },

  enforcePCOnly() {
    const block = document.getElementById('pc-only-block');
    if (!block) return; // only present on the Studio page
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isMobileUA || (isTouch && window.innerWidth < 1024)) {
      block.style.display = 'flex';
    }
  },

  setTool(tool) {
    if (this.heldId) this.dropObject();
    this.wireSource = null;
    this.activeTool = tool;
    document.querySelectorAll('.btn-tool').forEach((btn) => btn.classList.remove('active'));
    const btn = document.getElementById(`tool-${tool}`);
    if (btn) btn.classList.add('active');
  },

  updateInk() {
    const count = Object.keys(this.entities).length;
    const pct = Math.min(100, Math.round((count / this.MAX_INK) * 100));
    const val = document.getElementById('ink-val');
    const fill = document.getElementById('ink-fill');
    if (val) val.innerText = `${pct}%`;
    if (fill) fill.style.width = `${pct}%`;
  },

  getBuildContainer() {
    let c = document.getElementById('build-container');
    if (!c) {
      c = document.createElement('a-entity');
      c.setAttribute('id', 'build-container');
      document.querySelector('a-scene').appendChild(c);
    }
    return c;
  },

  getSpawnPosition() {
    const cam = document.getElementById('camera');
    const pos = new THREE.Vector3();
    const dir = new THREE.Vector3();
    cam.object3D.getWorldPosition(pos);
    cam.object3D.getWorldDirection(dir);
    const spawn = pos.add(dir.multiplyScalar(2.5));
    return `${spawn.x.toFixed(2)} ${Math.max(0.5, spawn.y).toFixed(2)} ${spawn.z.toFixed(2)}`;
  },

  spawnShape() {
    if (Object.keys(this.entities).length >= this.MAX_INK) {
      this.notify('Room ink is full — delete something to make room.');
      return;
    }
    const type = document.getElementById('shape-select').value;
    const color = document.getElementById('color-select').value;
    const id = 'obj_' + Date.now();
    this.instantiate({ id, type, color, position: this.getSpawnPosition(), kind: 'prop' });
  },

  spawnGizmo(gizmoType) {
    if (Object.keys(this.entities).length >= this.MAX_INK) {
      this.notify('Room ink is full — delete something to make room.');
      return;
    }
    const id = 'gizmo_' + Date.now();
    const position = this.getSpawnPosition();
    if (gizmoType === 'rotator') {
      this.instantiate({ id, type: 'cylinder', color: '#0284c7', position, kind: 'rotator', speed: 45 });
    } else {
      this.instantiate({ id, type: 'box', color: '#38bdf8', position, kind: 'trigger', opacity: 0.4 });
    }
  },

  instantiate(data) {
    const container = this.getBuildContainer();
    const el = document.createElement(`a-${data.type}`);
    el.setAttribute('id', data.id);
    el.setAttribute('class', 'selectable buildable');
    el.setAttribute('position', data.position);
    el.setAttribute('color', data.color);

    if (data.kind === 'trigger') {
      el.setAttribute('width', 1.2);
      el.setAttribute('height', 1.2);
      el.setAttribute('depth', 1.2);
      el.setAttribute('transparent', true);
      el.setAttribute('opacity', data.opacity);
    } else if (data.kind === 'rotator') {
      el.setAttribute('radius', 0.3);
      el.setAttribute('height', 0.35);
      const pin = document.createElement('a-box');
      pin.setAttribute('position', '0 0.22 0.15');
      pin.setAttribute('width', 0.08);
      pin.setAttribute('height', 0.08);
      pin.setAttribute('depth', 0.25);
      pin.setAttribute('color', '#facc15');
      el.appendChild(pin);
    } else {
      el.setAttribute('scale', '0.55 0.55 0.55');
      data.velocityY = 0;
    }

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.handleInteraction(data.id);
    });

    container.appendChild(el);
    this.entities[data.id] = data;
    this.updateInk();
  },

  handleInteraction(id) {
    const el = document.getElementById(id);
    if (!el) return;

    switch (this.activeTool) {
      case 'grab':
        if (this.heldId === id) this.dropObject();
        else this.grabObject(id);
        break;
      case 'delete':
        if (this.heldId === id) this.heldId = null;
        el.remove();
        delete this.entities[id];
        this.publishSilently();
        this.updateInk();
        break;
      case 'recolor': {
        const color = document.getElementById('color-select').value;
        el.setAttribute('color', color);
        if (this.entities[id]) this.entities[id].color = color;
        break;
      }
      case 'wire':
        this.wireCircuit(id);
        break;
    }
  },

  grabObject(id) {
    if (this.heldId) this.dropObject();
    const el = document.getElementById(id);
    const hold = document.getElementById('hold-node');
    if (!el || !hold) return;
    this.heldId = id;
    this.entities[id].isHeld = true;
    hold.appendChild(el);
    el.setAttribute('position', '0 0 0');
  },

  dropObject() {
    if (!this.heldId) return;
    const id = this.heldId;
    const el = document.getElementById(id);
    const container = this.getBuildContainer();
    if (el && container) {
      const world = new THREE.Vector3();
      el.object3D.getWorldPosition(world);
      container.appendChild(el);
      el.setAttribute('position', `${world.x} ${world.y} ${world.z}`);
      if (this.entities[id]) {
        this.entities[id].isHeld = false;
        this.entities[id].velocityY = 0;
      }
      this.publishSilently();
    }
    this.heldId = null;
  },

  wireCircuit(targetId) {
    if (!this.wireSource) {
      this.wireSource = targetId;
      this.notify('Wire source selected — now click a second object to link it.');
    } else if (this.wireSource !== targetId) {
      const sourceEl = document.getElementById(this.wireSource);
      const targetEl = document.getElementById(targetId);
      if (sourceEl && targetEl) {
        sourceEl.appendChild(targetEl);
        targetEl.setAttribute('position', '0 0.6 0');
        this.notify('Wired! The two objects are now linked together.');
      }
      this.wireSource = null;
    } else {
      this.wireSource = null;
    }
  },

  clearRoom() { this.clearBuild(); },

  clearBuild() {
    const c = document.getElementById('build-container');
    if (c) c.innerHTML = '';
    this.entities = {};
    this.heldId = null;
    this.wireSource = null;
    try { localStorage.removeItem('rec_room_my_build'); } catch (_) {}
    this.updateInk();
  },


  loadBuild() {
    try {
      const raw = localStorage.getItem('rec_room_my_build');
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (!Array.isArray(saved)) return;
      saved.slice(0, this.MAX_INK).forEach(data => this.instantiate(data));
    } catch (_) {
      localStorage.removeItem('rec_room_my_build');
    }
  },

  publishRoom() {
    const payload = JSON.stringify(Object.values(this.entities));
    try {
      localStorage.setItem('rec_room_my_build', payload);
      this.notify('Build saved locally.');
    } catch (err) {
      this.notify('Could not save — your browser storage may be full or blocked.');
    }
  },

  publishSilently() {
    try { localStorage.setItem('rec_room_my_build', JSON.stringify(Object.values(this.entities))); } catch (_) {}
  },

  notify(msg) {
    const toast = document.getElementById('rro-toast');
    if (!toast) { console.log(msg); return; }
    toast.innerText = msg;
    toast.classList.add('visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => toast.classList.remove('visible'), 2400);
  },

  startLoop() {
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;

      let playerPos = null;
      const cam = document.getElementById('camera');
      if (cam) {
        playerPos = new THREE.Vector3();
        cam.object3D.getWorldPosition(playerPos);
      }

      Object.values(this.entities).forEach((data) => {
        const el = document.getElementById(data.id);
        if (!el) return;

        if (data.kind === 'prop' && !data.isHeld) {
          const pos = el.object3D.position;
          const minY = 0.3;
          if (pos.y > minY) {
            data.velocityY = (data.velocityY || 0) + this.GRAVITY * dt;
            let newY = pos.y + data.velocityY * dt;
            if (newY <= minY) { newY = minY; data.velocityY = 0; }
            el.setAttribute('position', `${pos.x} ${newY} ${pos.z}`);
          }
        }

        if (data.kind === 'rotator') {
          const rot = el.getAttribute('rotation') || { x: 0, y: 0, z: 0 };
          el.setAttribute('rotation', `${rot.x} ${(rot.y + data.speed * dt) % 360} ${rot.z}`);
        }

        if (data.kind === 'trigger' && playerPos) {
          const tp = new THREE.Vector3();
          el.object3D.getWorldPosition(tp);
          const near = playerPos.distanceTo(tp) < 1.4;
          el.setAttribute('opacity', near ? 0.65 : data.opacity);
          el.setAttribute('color', near ? '#ef4444' : data.color);
        }
      });

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
};

window.addEventListener('DOMContentLoaded', () => MakerPen.init());
