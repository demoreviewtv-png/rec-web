const RROEngine = {
  isVR: false,
  keys: {},
  mobile: { x: 0, y: 0 },

  init() {
    this.setupVR();
    this.setupMobileControls();
    this.setupPointerLockFallback();
  },

  setupVR() {
    const scene = document.getElementById('scene');
    if (!scene) return;
    scene.addEventListener('enter-vr', () => { this.isVR = true; });
    scene.addEventListener('exit-vr', () => { this.isVR = false; });
  },

  setupPointerLockFallback() {
    const scene = document.getElementById('scene');
    if (!scene) return;
    scene.addEventListener('click', () => {
      if (!this.isVR && !document.pointerLockElement && document.activeElement?.tagName === 'BODY') {
        const canvas = scene.canvas;
        if (canvas && canvas.requestPointerLock) canvas.requestPointerLock().catch(() => {});
      }
    });
  },

  resetPosition() {
    const rig = document.getElementById('rig');
    const cam = document.getElementById('camera');
    if (rig) rig.object3D.position.set(0, 0, 0);
    if (cam) cam.object3D.rotation.set(0, 0, 0);
    if (window.RROApp) RROApp.toast('Position reset.');
  },

  setupMobileControls() {
    const root = document.getElementById('mobile-controls');
    const joystick = document.getElementById('joystick');
    const knob = document.getElementById('joystick-knob');
    const jump = document.getElementById('mobile-jump');
    const use = document.getElementById('mobile-use');
    if (!root || !joystick) return;

    const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (!isTouch) return;
    root.classList.add('visible');

    let active = false;
    const update = (clientX, clientY) => {
      const r = joystick.getBoundingClientRect();
      const max = r.width * 0.34;
      let x = clientX - (r.left + r.width / 2);
      let y = clientY - (r.top + r.height / 2);
      const len = Math.hypot(x, y);
      if (len > max) { x *= max / len; y *= max / len; }
      knob.style.transform = `translate(${x}px, ${y}px)`;
      this.mobile.x = x / max;
      this.mobile.y = -y / max;
    };
    const reset = () => { active = false; this.mobile.x = 0; this.mobile.y = 0; knob.style.transform = 'translate(0,0)'; };
    joystick.addEventListener('touchstart', e => { active = true; update(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); }, {passive:false});
    joystick.addEventListener('touchmove', e => { if (active) update(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); }, {passive:false});
    joystick.addEventListener('touchend', reset, {passive:true});
    jump.addEventListener('touchstart', e => { this.jump(); e.preventDefault(); }, {passive:false});
    use.addEventListener('touchstart', e => { this.use(); e.preventDefault(); }, {passive:false});

    const tick = () => {
      const rig = document.getElementById('rig');
      const cam = document.getElementById('camera');
      if (rig && cam && !this.isVR) {
        const speed = 3.5 / 60;
        const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(cam.object3D.quaternion); forward.y = 0; forward.normalize();
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.object3D.quaternion); right.y = 0; right.normalize();
        rig.object3D.position.addScaledVector(forward, this.mobile.y * speed);
        rig.object3D.position.addScaledVector(right, this.mobile.x * speed);
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },

  jump() {
    const rig = document.getElementById('rig');
    if (!rig || rig.dataset.jumping === '1') return;
    rig.dataset.jumping = '1';
    const start = performance.now();
    const animate = now => {
      const t = Math.min(1, (now - start) / 550);
      rig.object3D.position.y = Math.sin(t * Math.PI) * 0.7;
      if (t < 1) requestAnimationFrame(animate);
      else { rig.object3D.position.y = 0; rig.dataset.jumping = '0'; }
    };
    requestAnimationFrame(animate);
  },

  use() {
    const cursor = document.querySelector('#camera [cursor]');
    if (cursor && cursor.components.cursor) cursor.components.cursor.emit('click');
  }
};
window.addEventListener('DOMContentLoaded', () => RROEngine.init());
