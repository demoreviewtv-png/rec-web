let peer = null;
let connections = {};
let currentWeapon = null;
let enemyCount = 0;
let goblinInterval = null;

function equipWeapon(type) {
  currentWeapon = type;
  const hand = document.getElementById("held-weapon");
  hand.innerHTML = "";

  if (type === "sword") {
    const blade = document.createElement("a-box");
    blade.setAttribute("width", "0.08");
    blade.setAttribute("height", "0.7");
    blade.setAttribute("depth", "0.08");
    blade.setAttribute("color", "#40e0d0");
    hand.appendChild(blade);
  } else if (type === "bow") {
    const bow = document.createElement("a-torus");
    bow.setAttribute("radius", "0.25");
    bow.setAttribute("radius-tubular", "0.02");
    bow.setAttribute("arc", "180");
    bow.setAttribute("color", "#8b4513");
    hand.appendChild(bow);
  }
}

function shootWeapon() {
  if (currentWeapon !== "bow") return;

  const cam = document.getElementById("camera");
  const container = document.getElementById("projectiles-container");
  
  const arrow = document.createElement("a-cylinder");
  arrow.setAttribute("radius", "0.02");
  arrow.setAttribute("height", "0.6");
  arrow.setAttribute("color", "#ffd700");
  arrow.setAttribute("rotation", "90 0 0");

  const pos = cam.getAttribute("position");
  arrow.setAttribute("position", `${pos.x} ${pos.y} ${pos.z - 0.5}`);
  arrow.setAttribute("animation", `property: position; to: ${pos.x} ${pos.y} ${pos.z - 15}; dur: 1000; easing: linear`);

  container.appendChild(arrow);
  setTimeout(() => arrow.parentNode && arrow.parentNode.removeChild(arrow), 1000);
}

function startQuestStage() {
  const container = document.getElementById("enemies-container");
  container.innerHTML = "";
  enemyCount = 3;
  document.getElementById("enemy-count").innerText = enemyCount;

  for (let i = 0; i < enemyCount; i++) {
    spawnGoblin(i);
  }

  if (goblinInterval) clearInterval(goblinInterval);
  goblinInterval = setInterval(goblinAttack, 3000);
}

function spawnGoblin(id) {
  const container = document.getElementById("enemies-container");
  const goblin = document.createElement("a-entity");
  goblin.setAttribute("id", "goblin-" + id);
  
  const x = (Math.random() - 0.5) * 10;
  const z = -10 - (Math.random() * 8);
  goblin.setAttribute("position", `${x} 1 ${z}`);

  const body = document.createElement("a-sphere");
  body.setAttribute("radius", "0.4");
  body.setAttribute("color", "#2e7d32");
  body.setAttribute("class", "clickable");
  
  body.addEventListener("click", () => hitGoblin("goblin-" + id));

  goblin.appendChild(body);
  container.appendChild(goblin);
}

function goblinAttack() {
  const container = document.getElementById("projectiles-container");
  const goblins = document.querySelectorAll("[id^='goblin-']");
  
  goblins.forEach(g => {
    const pos = g.getAttribute("position");
    const fireball = document.createElement("a-sphere");
    fireball.setAttribute("radius", "0.15");
    fireball.setAttribute("color", "#ff3d00");
    fireball.setAttribute("position", `${pos.x} ${pos.y} ${pos.z}`);
    fireball.setAttribute("animation", "property: position; to: 0 1.6 0; dur: 2000; easing: linear");
    container.appendChild(fireball);

    setTimeout(() => fireball.parentNode && fireball.parentNode.removeChild(fireball), 2000);
  });
}

function hitGoblin(goblinId) {
  if (!currentWeapon) {
    alert("Pick up a weapon first!");
    return;
  }

  const g = document.getElementById(goblinId);
  if (g) {
    g.parentNode.removeChild(g);
    enemyCount--;
    document.getElementById("enemy-count").innerText = enemyCount;

    if (window.addGold) window.addGold(25);

    if (enemyCount <= 0) {
      clearInterval(goblinInterval);
      document.getElementById("zone-gate").setAttribute("color", "#00ff00");
      alert("Stage Cleared! Gate opened.");
    }
  }
}

function initWebRTC() {
  const myId = "gt-player-" + Math.floor(Math.random() * 1000);
  peer = new Peer(myId);

  peer.on("open", (id) => {
    document.getElementById("status").innerText = "Hero Online: " + id;
    for (let i = 0; i < 4; i++) {
      const target = "gt-player-" + i;
      if (target !== id) {
        const conn = peer.connect(target);
        if (conn) setupConn(conn);
      }
    }
  });

  peer.on("connection", setupConn);
}

function setupConn(conn) {
  conn.on("open", () => {
    connections[conn.peer] = conn;
    createPeerAvatar(conn.peer);
  });

  conn.on("data", (data) => {
    if (data.type === "pose") {
      const avatar = document.getElementById("avatar-" + conn.peer);
      if (avatar) {
        avatar.setAttribute("position", `${data.pos.x} ${data.pos.y} ${data.pos.z}`);
        avatar.setAttribute("rotation", `${data.rot.x} ${data.rot.y} ${data.rot.z}`);
      }
    }
  });

  conn.on("close", () => {
    const el = document.getElementById("avatar-" + conn.peer);
    if (el) el.parentNode.removeChild(el);
  });
}

function createPeerAvatar(id) {
  if (document.getElementById("avatar-" + id)) return;
  const avatar = document.createElement("a-sphere");
  avatar.setAttribute("id", "avatar-" + id);
  avatar.setAttribute("radius", "0.3");
  avatar.setAttribute("color", "#ff9800");
  document.getElementById("players-container").appendChild(avatar);
}

setInterval(() => {
  const cam = document.getElementById("camera");
  if (cam && peer) {
    const pos = cam.getAttribute("position");
    const rot = cam.getAttribute("rotation");
    Object.values(connections).forEach(c => {
      if (c.open) c.send({ type: "pose", pos: pos, rot: rot });
    });
  }
}, 50);

window.addEventListener("load", initWebRTC);
