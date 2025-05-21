// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZk10z5LS74wqzZBurrhZtZj-8nONheyQ",
  authDomain: "downsups-16929.firebaseapp.com",
  databaseURL: "https://downsups-16929-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "downsups-16929",
  storageBucket: "downsups-16929.firebasestorage.app",
  messagingSenderId: "866781219435",
  appId: "1:866781219435:web:160633215e96d5812d7f2e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Define startup colors globally
const startupColors = [
  { r: 255, g: 0,   b: 0   }, // Red
  { r: 255, g: 255, b: 0   }, // Yellow
  { r: 0,   g: 255, b: 0   }, // Green
  { r: 0,   g: 0,   b: 255 }, // Blue
  { r: 255, g: 0,   b: 255 }  // Purple
];

// Turn ON all LEDs when the page loads
window.addEventListener('load', () => {
  for (let i = 1; i <= 5; i++) {
    db.ref(`leds/led${i}`).set(startupColors[i - 1]);
  }
  console.log("All LEDs turned ON on page load");
});

// Handle wall navigation
const wall1     = document.getElementById('wall1');
const wall2     = document.getElementById('wall2');
const navButton = document.getElementById('navButton');
const backButton= document.getElementById('backButton');
const dot1      = document.getElementById('dot1');
const dot2      = document.getElementById('dot2');
let currentWall = 1;

// Create overlay for focused painting view
const overlay = document.createElement('div');
overlay.className = 'overlay';
document.querySelector('.gallery-container').appendChild(overlay);

// Painting information
const paintingInfo = [
  {
    title: "O que é a síndrome de Down?",
    description: "A síndrome de Down é uma condição genética causada pela presença de três cópias do cromossomo 21 (em vez de duas)..."
  },
  {
    title: "Capacidades",
    description: "This yellow-green composition represents growth and renewal..."
  },
  {
    title: "Dificuldades",
    description: "A meditation on harmony and balance through various shades of green..."
  },
  {
    title: "Azure Depths",
    description: "This blue composition explores themes of tranquility and introspection..."
  },
  {
    title: "Violet Whispers",
    description: "A delicate study of purple tones that bridges the gap between warm and cool colors..."
  }
];

// Forward navigation (to wall 2)
navButton.addEventListener('click', () => {
  if (currentWall === 1) {
    wall1.classList.remove('slide-center');
    wall1.classList.add('slide-left');
    wall2.classList.remove('slide-right');
    wall2.classList.add('slide-center');
    setTimeout(() => {
      navButton.style.display = 'none';
      backButton.style.display = 'flex';
      dot1.classList.remove('active');
      dot2.classList.add('active');
      currentWall = 2;
    }, 500);
  }
});

// Back navigation (to wall 1)
backButton.addEventListener('click', () => {
  if (currentWall === 2) {
    wall2.classList.remove('slide-center');
    wall2.classList.add('slide-right');
    wall1.classList.remove('slide-left');
    wall1.classList.add('slide-center');
    setTimeout(() => {
      backButton.style.display = 'none';
      navButton.style.display = 'flex';
      dot2.classList.remove('active');
      dot1.classList.add('active');
      currentWall = 1;
    }, 500);
  }
});

// Track currently active LED
let activeLedId = null;

// Handle paintings
for (let i = 1; i <= 5; i++) {
  const painting = document.getElementById(`painting${i}`);

  // Remove any old color-picker (if present)
  painting.querySelector('.color-picker')?.remove();

  // Sync initial & live updates (no visual change here)
  db.ref(`leds/led${i}`).once('value');
  db.ref(`leds/led${i}`).on('value');

  // Painting click: turn on this LED & show focus
  painting.addEventListener('click', (event) => {
    event.stopPropagation();

    // Turn off previously active LED (only that one)
    if (activeLedId !== null) {
      db.ref(`leds/led${activeLedId}`).set({ r: 0, g: 0, b: 0 });
    }

    // Turn on this LED
    const ledColor = startupColors[(i - 1) % startupColors.length];
    db.ref(`leds/led${i}`).set(ledColor);
    activeLedId = i;

    // Build focused view
    overlay.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'focused-painting-container';

    const paintingClone = painting.cloneNode(true);
    paintingClone.classList.add('focused-painting');
    paintingClone.querySelector('.painting-label')?.remove();

    // Swap SVG for PNG
    const innerFrameClone = paintingClone.querySelector('.painting-inner-frame');
    innerFrameClone.innerHTML = '';
    innerFrameClone.classList.add('png-container');
    const pngImage = document.createElement('img');
    pngImage.src = `PNG/png${i}.png`;
    pngImage.alt = `Painting ${i}`;
    pngImage.className = 'png-content';
    innerFrameClone.appendChild(pngImage);

    container.appendChild(paintingClone);

    // Painting info
    const infoDiv = document.createElement('div');
    infoDiv.className = 'painting-info';
    const titleEl = document.createElement('h2');
    titleEl.className = 'painting-title';
    titleEl.textContent = paintingInfo[i - 1].title;
    const descEl  = document.createElement('p');
    descEl.className = 'painting-description';
    descEl.textContent = paintingInfo[i - 1].description;
    infoDiv.append(titleEl, descEl);

    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', (e) => {
      e.stopPropagation();
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.style.display = 'none';
        overlay.innerHTML = '';
      }, 300);

      // Turn off the selected LED
      if (activeLedId !== null) {
        db.ref(`leds/led${activeLedId}`).set({ r: 0, g: 0, b: 0 });
        activeLedId = null;
      }

      // Restore all LEDs to startup colors
      for (let j = 1; j <= 5; j++) {
        db.ref(`leds/led${j}`).set(startupColors[j - 1]);
      }

      document.removeEventListener('keydown', handleKeyNavigation);
    });

    container.append(closeButton, infoDiv);
    overlay.appendChild(container);

    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('active'), 10);

    // Keyboard nav
    const handleKeyNavigation = (event) => {
      if (!overlay.classList.contains('active')) return;
      let nextId = null;
      if (event.key === 'ArrowRight') {
        nextId = activeLedId < 5 ? activeLedId + 1 : null;
        if (activeLedId === 3 && currentWall === 1) {
          navButton.click();
          nextId = 4;
        }
      } else if (event.key === 'ArrowLeft') {
        nextId = activeLedId > 1 ? activeLedId - 1 : null;
        if (activeLedId === 4 && currentWall === 2) {
          backButton.click();
          nextId = 3;
        }
      }
      if (nextId !== null) {
        // Turn off current
        db.ref(`leds/led${activeLedId}`).set({ r: 0, g: 0, b: 0 });
        // Turn on next
        const color = startupColors[(nextId - 1) % startupColors.length];
        db.ref(`leds/led${nextId}`).set(color);
        activeLedId = nextId;
        // Rebuild overlay content for nextId...
        // (You can refactor into a helper to avoid duplication)
      }
    };
    document.addEventListener('keydown', handleKeyNavigation);
  });
}

// Close focused view when clicking outside
overlay.addEventListener('click', (event) => {
  if (event.target === overlay) {
    overlay.classList.remove('active');
    if (activeLedId !== null) {
      db.ref(`leds/led${activeLedId}`).set({ r: 0, g: 0, b: 0 });
      activeLedId = null;
    }
    // Restore all LEDs
    for (let j = 1; j <= 5; j++) {
      db.ref(`leds/led${j}`).set(startupColors[j - 1]);
    }
    (currentWall === 1 ? navButton : backButton).style.display = 'flex';
  }
});

// Helper: RGB to HEX (unused currently)
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Responsive gallery sizing
function adjustGallerySize() {
  const container = document.querySelector('.gallery-container');
  const windowRatio = window.innerWidth / window.innerHeight;
  const targetRatio = 16 / 9;
  if (windowRatio > targetRatio) {
    const width = window.innerHeight * targetRatio;
    container.style.width  = `${width}px`;
    container.style.height = '100vh';
    container.style.margin = '0 auto';
  } else {
    const height = window.innerWidth / targetRatio;
    container.style.width  = '100vw';
    container.style.height = `${height}px`;
    container.style.margin = `${(window.innerHeight - height)/2}px 0`;
  }
}
window.addEventListener('load', adjustGallerySize);
window.addEventListener('resize', adjustGallerySize);

// Settings panel & admin
const settingsIcon   = document.getElementById('settings-icon');
const settingsPanel  = document.getElementById('settings-panel');
const closeSettings  = document.getElementById('close-settings');
const visualAlerts   = document.getElementById('visual-alerts');
const colorBlindMode = document.getElementById('color-blind-mode');
const highContrast   = document.getElementById('high-contrast');
const adminPassword  = document.getElementById('admin-password');
const adminSubmit    = document.getElementById('admin-submit');
const adminPanel     = document.getElementById('admin-panel');

// SVG filters for color-blind modes
const svgFilters = document.createElement('div');
svgFilters.style.cssText = 'position:absolute;overflow:hidden;width:0;height:0;';
svgFilters.innerHTML = `
<svg xmlns="http://www.w3.org/2000/svg" style="display:none">
  <filter id="protanopia-filter">
    <feColorMatrix type="matrix" values="0.567,0.433,0,0,0,0.558,0.442,0,0,0,0,0.242,0.758,0,0,0,0,0,1,0"/>
  </filter>
  <filter id="deuteranopia-filter">
    <feColorMatrix type="matrix" values="0.625,0.375,0,0,0,0.7,0.3,0,0,0,0,0.3,0.7,0,0,0,0,0,1,0"/>
  </filter>
  <filter id="tritanopia-filter">
    <feColorMatrix type="matrix" values="0.95,0.05,0,0,0,0,0.433,0.567,0,0,0,0.475,0.525,0,0,0,0,0,1,0"/>
  </filter>
</svg>`;
document.body.appendChild(svgFilters);

// Toggle settings panel
settingsIcon.addEventListener('click', () => settingsPanel.classList.add('active'));
closeSettings.addEventListener('click', () => settingsPanel.classList.remove('active'));

// Visual alerts toggle
visualAlerts.addEventListener('change', () => {
  localStorage.setItem('visualAlerts', visualAlerts.checked);
});

// Color-blind modes
colorBlindMode.addEventListener('change', () => {
  document.body.classList.remove('protanopia','deuteranopia','tritanopia');
  if (colorBlindMode.value !== 'normal') {
    document.body.classList.add(colorBlindMode.value);
  }
  localStorage.setItem('colorBlindMode', colorBlindMode.value);
});

// High-contrast toggle
highContrast.addEventListener('change', () => {
  document.body.classList.toggle('high-contrast', highContrast.checked);
  localStorage.setItem('highContrast', highContrast.checked);
});

// Admin login & controls
adminSubmit.addEventListener('click', () => {
  if (adminPassword.value === 'admin123') {
    adminPassword.value = '';
    adminPanel.style.display = 'block';
    adminPanel.innerHTML = `
      <div class="admin-controls">
        <h4>LED Controls</h4>
        <button id="reset-all-leds">Reset All LEDs</button>
        <button id="test-all-leds">Test All LEDs</button>
        <h4>Gallery Settings</h4>
        <button id="reset-settings">Reset All Settings</button>
      </div>
    `;
    document.getElementById('reset-all-leds').addEventListener('click', () => {
      for (let j = 1; j <= 5; j++) {
        db.ref(`leds/led${j}`).set(startupColors[j - 1]);
      }
      alert('All LEDs have been turned ON.');
    });
    document.getElementById('test-all-leds').addEventListener('click', testLEDs);
    document.getElementById('reset-settings').addEventListener('click', () => {
      localStorage.clear();
      visualAlerts.checked   = false;
      colorBlindMode.value   = 'normal';
      highContrast.checked   = false;
      document.body.classList.remove('protanopia','deuteranopia','tritanopia','high-contrast');
      alert('All settings have been reset.');
    });
  } else {
    alert('Incorrect password. Please try again.');
  }
});

// Function to test LEDs in sequence
function testLEDs() {
  let i = 1;
  const interval = setInterval(() => {
    if (i <= 5) {
      // Turn on current LED
      db.ref(`leds/led${i}`).set(startupColors[i - 1]);
      // Turn off previous LED
      if (i > 1) {
        db.ref(`leds/led${i-1}`).set({ r:0, g:0, b:0 });
      }
      i++;
    } else {
      db.ref(`leds/led5`).set({ r:0, g:0, b:0 });
      clearInterval(interval);
    }
  }, 1000);
}

// Load saved settings on page load
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('visualAlerts') === 'true') {
    visualAlerts.checked = true;
  }
  const savedMode = localStorage.getItem('colorBlindMode');
  if (savedMode) {
    colorBlindMode.value = savedMode;
    if (savedMode !== 'normal') {
      document.body.classList.add(savedMode);
    }
  }
  if (localStorage.getItem('highContrast') === 'true') {
    highContrast.checked = true;
    document.body.classList.add('high-contrast');
  }
});
