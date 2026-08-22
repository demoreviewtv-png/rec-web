// Map Loader for Rec Room Originals
const RROGames = {
  loadGame: function(gameKey) {
    const env = document.getElementById('environment');
    const roomName = document.getElementById('current-room-name');
    const sky = document.getElementById('sky');

    // Clear active map
    env.innerHTML = '';

    switch(gameKey) {
      case 'paintball':
        roomName.innerText = "Paintball: Drive-In";
        sky.setAttribute('color', '#87CEEB');
        env.innerHTML = `
          <a-plane position="0 0 0" rotation="-90 0 0" width="60" height="60" color="#38a169"></a-plane>
          <!-- Red Base -->
          <a-box position="-10 1.5 -15" width="6" height="3" depth="4" color="#e53e3e"></a-box>
          <!-- Blue Base -->
          <a-box position="10 1.5 -15" width="6" height="3" depth="4" color="#3182ce"></a-box>
          <!-- Cover Obstacles -->
          <a-box position="0 1 -8" width="2" height="2" depth="2" color="#718096"></a-box>
        `;
        break;

      case 'golden-trophy':
        roomName.innerText = "Quest: Golden Trophy";
        sky.setAttribute('color', '#2c5282');
        env.innerHTML = `
          <a-plane position="0 0 0" rotation="-90 0 0" width="40" height="40" color="#742a2a"></a-plane>
          <a-cylinder position="0 2 -10" radius="3" height="4" color="#d69e2e"></a-cylinder>
        `;
        break;

      case 'lost-skulls':
        roomName.innerText = "Quest: Isle of Lost Skulls";
        sky.setAttribute('color', '#1a202c');
        env.innerHTML = `
          <a-plane position="0 0 0" rotation="-90 0 0" width="50" height="50" color="#d69e2e"></a-plane>
          <a-box position="0 1 -10" width="8" height="2" depth="12" color="#742a2a"></a-box>
        `;
        break;

      case 'dodgeball':
        roomName.innerText = "Dodgeball Gym";
        sky.setAttribute('color', '#edf2f7');
        env.innerHTML = `
          <a-plane position="0 0 0" rotation="-90 0 0" width="20" height="30" color="#dd6b20"></a-plane>
          <a-box position="0 0.1 0" width="20" height="0.05" depth="0.5" color="#ffffff"></a-box>
        `;
        break;

      default:
        roomName.innerText = "Dorm Room";
        sky.setAttribute('color', '#87CEEB');
        env.innerHTML = `
          <a-plane position="0 0 0" rotation="-90 0 0" width="30" height="30" color="#2d3748"></a-plane>
          <a-box position="0 0.5 -4" width="3" height="0.8" depth="1.2" color="#e53e3e"></a-box>
        `;
        break;
    }
  }
};
