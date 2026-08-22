let sceneObjects = [];
let selectedObjId = null;

// Google Form Configuration (Replace entry numbers with your Google Form entry IDs)
const GOOGLE_FORM_URL = "https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform";
const FORM_ENTRY_ROOM_JSON = "entry.123456789"; // Input entry ID for JSON map data string
const FORM_ENTRY_ROOM_NAME = "entry.987654321"; // Input entry ID for Room Name

function createPrimitive(type) {
  const id = "node_" + Date.now().toString().substr(-4);
  const scene = document.getElementById("user-scene");

  const entity = document.createElement(`a-${type}`);
  entity.setAttribute("id", id);
  entity.setAttribute("position", "0 1 0");
  entity.setAttribute("color", "#4CC3D9");

  scene.appendChild(entity);

  sceneObjects.push({ id: id, type: type, entity: entity });
  updateHierarchy();
  selectObject(id);
}

function updateHierarchy() {
  const root = document.getElementById("tree-root");
  root.innerHTML = "";
  sceneObjects.forEach(obj => {
    const item = document.createElement("div");
    item.className = "tree-item " + (selectedObjId === obj.id ? "selected" : "");
    item.innerText = `📦 ${obj.type} (${obj.id})`;
    item.onclick = () => selectObject(obj.id);
    root.appendChild(item);
  });
}

function selectObject(id) {
  selectedObjId = id;
  updateHierarchy();

  const obj = sceneObjects.find(o => o.id === id);
  if (!obj) return;

  const pos = obj.entity.getAttribute("position") || {x:0, y:1, z:0};
  const rot = obj.entity.getAttribute("rotation") || {x:0, y:0, z:0};
  const scale = obj.entity.getAttribute("scale") || {x:1, y:1, z:1};
  const color = obj.entity.getAttribute("color") || "#ffffff";

  const inspector = document.getElementById("inspector-content");
  inspector.innerHTML = `
    <div class="prop-group">
      <b>Object ID: ${obj.id}</b>
    </div>
    <div class="prop-group">
      <div class="panel-title">Transform</div>
      <div class="prop-row">
        <label>Pos</label>
        <div class="vector3">
          <input type="number" step="0.1" value="${pos.x}" onchange="updateTransform('pos', 'x', this.value)">
          <input type="number" step="0.1" value="${pos.y}" onchange="updateTransform('pos', 'y', this.value)">
          <input type="number" step="0.1" value="${pos.z}" onchange="updateTransform('pos', 'z', this.value)">
        </div>
      </div>
      <div class="prop-row">
        <label>Rot</label>
        <div class="vector3">
          <input type="number" value="${rot.x}" onchange="updateTransform('rot', 'x', this.value)">
          <input type="number" value="${rot.y}" onchange="updateTransform('rot', 'y', this.value)">
          <input type="number" value="${rot.z}" onchange="updateTransform('rot', 'z', this.value)">
        </div>
      </div>
      <div class="prop-row">
        <label>Scale</label>
        <div class="vector3">
          <input type="number" step="0.1" value="${scale.x}" onchange="updateTransform('scale', 'x', this.value)">
          <input type="number" step="0.1" value="${scale.y}" onchange="updateTransform('scale', 'y', this.value)">
          <input type="number" step="0.1" value="${scale.z}" onchange="updateTransform('scale', 'z', this.value)">
        </div>
      </div>
    </div>
    <div class="prop-group">
      <div class="panel-title">Material</div>
      <div class="prop-row">
        <label>Color</label>
        <input type="color" value="${color}" onchange="updateColor(this.value)">
      </div>
    </div>
    <button style="background:#b71c1c; width:100%; margin-top:10px;" onclick="deleteSelected()">Delete Object</button>
  `;
}

function updateTransform(type, axis, val) {
  const obj = sceneObjects.find(o => o.id === selectedObjId);
  if (!obj) return;

  const attrName = type === 'pos' ? 'position' : type === 'rot' ? 'rotation' : 'scale';
  const current = obj.entity.getAttribute(attrName) || {x:0, y:0, z:0};
  current[axis] = parseFloat(val);
  obj.entity.setAttribute(attrName, `${current.x} ${current.y} ${current.z}`);
}

function updateColor(color) {
  const obj = sceneObjects.find(o => o.id === selectedObjId);
  if (obj) obj.entity.setAttribute("color", color);
}

function deleteSelected() {
  const index = sceneObjects.findIndex(o => o.id === selectedObjId);
  if (index !== -1) {
    sceneObjects[index].entity.parentNode.removeChild(sceneObjects[index].entity);
    sceneObjects.splice(index, 1);
    selectedObjId = null;
    updateHierarchy();
    document.getElementById("inspector-content").innerHTML = "<i>Select an object to edit.</i>";
  }
}

// Generates JSON map string, builds room data folder zip, and pre-fills Google Form
async function exportAndSubmitRoom() {
  const name = document.getElementById("room-name").value || "Untitled Room";
  const owner = document.getElementById("room-owner").value || "Anonymous";
  const desc = document.getElementById("room-desc").value || "No description.";

  // Build JSON String from Object Array
  const roomData = {
    metadata: { name, owner, desc, timestamp: new Date().toISOString() },
    entities: sceneObjects.map(obj => ({
      id: obj.id,
      type: obj.type,
      position: obj.entity.getAttribute("position"),
      rotation: obj.entity.getAttribute("rotation"),
      scale: obj.entity.getAttribute("scale"),
      color: obj.entity.getAttribute("color")
    }))
  };

  const jsonString = JSON.stringify(roomData, null, 2);
  document.getElementById("code-output").value = jsonString;

  // Build local folder layout inside ZIP using JSZip
  const zip = new JSZip();
  const roomFolder = zip.folder("room data").folder(name.replace(/[^a-z0-9]/gi, '_').toLowerCase());

  // info.txt (name, owner, description)
  const infoTxtContent = `NAME: ${name}\nOWNER: ${owner}\nDESCRIPTION: ${desc}\nEXPORTED: ${new Date().toLocaleString()}`;
  roomFolder.file("info.txt", infoTxtContent);

  // room.json (map data and code structure)
  roomFolder.file("room.json", jsonString);

  // Download ZIP
  const blob = await zip.generateAsync({ type: "blob" });
  const downloadLink = document.createElement("a");
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = `${name.replace(/[^a-z0-9]/gi, '_')}_room_data.zip`;
  downloadLink.click();

  // Redirect / Pre-fill Google Form with JSON Payload
  const formTargetUrl = `${GOOGLE_FORM_URL}?usp=pp_url&${FORM_ENTRY_ROOM_NAME}=${encodeURIComponent(name)}&${FORM_ENTRY_ROOM_JSON}=${encodeURIComponent(jsonString)}`;
  window.open(formTargetUrl, "_blank");
}
