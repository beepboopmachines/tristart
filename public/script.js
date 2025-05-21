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

// Define startup colors globally (1: pink, 2: blue, 3: pink, 4: blue, 5: pink)
const startupColors = [
    { r: 255, g: 192, b: 203 }, // Pink
    { r:   0, g:   0, b: 255 }, // Blue
    { r: 255, g: 192, b: 203 }, // Pink
    { r:   0, g:   0, b: 255 }, // Blue
    { r: 255, g: 192, b: 203 }  // Pink
];

// Helper to set all LEDs to startupColors
function restoreAll() {
    for (let i = 1; i <= 5; i++) {
        db.ref(`leds/led${i}`).set(startupColors[i - 1]);
    }
}

// Turn ON all LEDs when the page loads
window.addEventListener('load', () => {
    restoreAll();
    console.log("All LEDs turned ON on page load");
});

// Handle wall navigation
const wall1      = document.getElementById('wall1');
const wall2      = document.getElementById('wall2');
const navButton  = document.getElementById('navButton');
const backButton = document.getElementById('backButton');
const dot1       = document.getElementById('dot1');
const dot2       = document.getElementById('dot2');
let currentWall  = 1;

// Create overlay for focused painting view
const overlay = document.createElement('div');
overlay.className = 'overlay';
document.querySelector('.gallery-container').appendChild(overlay);

// Painting information
const paintingInfo = [
    {
        title: "O que é a síndrome de Down?",
        description: "A síndrome de Down é uma condição genética causada pela presença de três cópias do cromossomo 21 (em vez de duas). Sendo assim conhecida como trissomia 21. Ela ocorre de forma natural, geralmente no momento da concepção, e não é causada por nada que os pais tenham feito ou deixado de fazer."
    },
    {
        title: "Capacidades",
        description: "This yellow-green composition represents growth and renewal. Inspired by spring meadows, it captures the essence of new beginnings and the gentle awakening of nature."
    },
    {
        title: "Dificuldades",
        description: "A meditation on harmony and balance through various shades of green. This work connects viewers to the calming influence of nature and the restorative power of verdant landscapes."
    },
    {
        title: "Azure Depths",
        description: "This blue composition explores themes of tranquility and introspection. Like gazing into deep waters, it invites the viewer to look inward and find moments of peace."
    },
    {
        title: "Violet Whispers",
        description: "A delicate study of purple tones that bridges the gap between warm and cool colors. This piece represents the mystical and the transformative aspects of artistic expression."
    }
];

// Forward navigation (to wall 2)
navButton.addEventListener('click', () => {
    if (currentWall === 1) {
        wall1.classList.replace('slide-center', 'slide-left');
        wall2.classList.replace('slide-right', 'slide-center');
        setTimeout(() => {
            navButton.style.display  = 'none';
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
        wall2.classList.replace('slide-center', 'slide-right');
        wall1.classList.replace('slide-left', 'slide-center');
        setTimeout(() => {
            backButton.style.display = 'none';
            navButton.style.display  = 'flex';
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

    // Remove color picker elements if they exist
    painting.querySelector('.color-picker')?.remove();

    // Sync initial & live updates (no visual inline styling)
    db.ref(`leds/led${i}`).once('value');
    db.ref(`leds/led${i}`).on('value');

    // Handle painting click to turn on LED and show focused view
    painting.addEventListener('click', (event) => {
        event.stopPropagation();

        // Turn off previously active LED if any
        if (activeLedId !== null) {
            db.ref(`leds/led${activeLedId}`).set({ r: 0, g: 0, b: 0 });
        }

        // Turn on this LED with the startup color
        db.ref(`leds/led${i}`).set(startupColors[i - 1]);
        activeLedId = i;

        // Clear any existing focused paintings
        overlay.innerHTML = '';

        // Create container for focused painting and info
        const container = document.createElement('div');
        container.className = 'focused-painting-container';

        // Create a clone of the painting for the focused view
        const paintingClone = painting.cloneNode(true);
        paintingClone.classList.add('focused-painting');
        paintingClone.querySelector('.painting-label')?.remove();

        // Replace SVG with PNG in the focused view
        const innerFrameClone = paintingClone.querySelector('.painting-inner-frame');
        innerFrameClone.innerHTML = '';
        innerFrameClone.classList.add('png-container');
        const pngImage = document.createElement('img');
        pngImage.src = `PNG/png${i}.png`;
        pngImage.alt = `Painting ${i}`;
        pngImage.className = 'png-content';
        innerFrameClone.appendChild(pngImage);

        container.appendChild(paintingClone);

        // Add painting information
        const infoDiv = document.createElement('div');
        infoDiv.className = 'painting-info';
        const titleElement = document.createElement('h2');
        titleElement.className = 'painting-title';
        titleElement.textContent = paintingInfo[i - 1].title;
        const descElement = document.createElement('p');
        descElement.className = 'painting-description';
        descElement.textContent = paintingInfo[i - 1].description;
        infoDiv.append(titleElement, descElement);

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.innerHTML    = '';
            }, 300);

            // Turn off LED when closing
            if (activeLedId !== null) {
                db.ref(`leds/led${activeLedId}`).set({ r: 0, g: 0, b: 0 });
                activeLedId = null;
            }

            // Restore all LEDs to startup colors
            restoreAll();

            document.removeEventListener('keydown', handleKeyNavigation);
        });

        container.append(closeButton, infoDiv);
        overlay.appendChild(container);

        // Show the overlay
        overlay.style.display = 'flex';
        setTimeout(() => overlay.classList.add('active'), 10);

        // Add keyboard navigation for focus mode
        function handleKeyNavigation(event) {
            if (!overlay.classList.contains('active')) return;
            let nextPaintingId = null;

            if (event.key === 'ArrowRight') {
                nextPaintingId = activeLedId < 5 ? activeLedId + 1 : null;
                if (activeLedId === 3 && currentWall === 1) {
                    navButton.click();
                    nextPaintingId = 4;
                }
            } else if (event.key === 'ArrowLeft') {
                nextPaintingId = activeLedId > 1 ? activeLedId - 1 : null;
                if (activeLedId === 4 && currentWall === 2) {
                    backButton.click();
                    nextPaintingId = 3;
                }
            }

            if (nextPaintingId) {
                // Turn off current LED
                db.ref(`leds/led${activeLedId}`).set({ r: 0, g: 0, b: 0 });
                // Turn on the next LED
                db.ref(`leds/led${nextPaintingId}`).set(startupColors[nextPaintingId - 1]);
                activeLedId = nextPaintingId;
                // (Optionally, rebuild overlay for nextPaintingId)
            }
        }
        document.addEventListener('keydown', handleKeyNavigation);
    });
}

// Close focused view when clicking outside the painting
overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
        overlay.classList.remove('active');

        // Turn off the active LED when exiting focus mode
        if (activeLedId !== null) {
            db.ref(`leds/led${activeLedId}`).set({ r: 0, g: 0, b: 0 });
            activeLedId = null;
        }

        // Restore all LEDs to startup colors
        restoreAll();

        // Show the appropriate navigation button
        if (currentWall === 1) {
            navButton.style.display = 'flex';
        } else {
            backButton.style.display = 'flex';
        }
    }
});

// Helper function to convert RGB to HEX (unused here)
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Ensure the gallery fits the 1920x1080 aspect ratio
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
        container.style.margin = `${(window.innerHeight - height) / 2}px 0`;
    }
}
window.addEventListener('load', adjustGallerySize);
window.addEventListener('resize', adjustGallerySize);

// Settings panel functionality
const settingsIcon   = document.getElementById('settings-icon');
const settingsPanel  = document.getElementById('settings-panel');
const closeSettings  = document.getElementById('close-settings');
const visualAlerts   = document.getElementById('visual-alerts');
const colorBlindMode = document.getElementById('color-blind-mode');
const highContrast   = document.getElementById('high-contrast');
const adminPassword  = document.getElementById('admin-password');
const adminSubmit    = document.getElementById('admin-submit');
const adminPanel     = document.getElementById('admin-panel');

// Add SVG filters for color blindness
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

// Visual alerts for deaf users
visualAlerts.addEventListener('change', () => {
    localStorage.setItem('visualAlerts', visualAlerts.checked);
});

// Color blind mode
colorBlindMode.addEventListener('change', () => {
    document.body.classList.remove('protanopia','deuteranopia','tritanopia');
    if (colorBlindMode.value !== 'normal') {
        document.body.classList.add(colorBlindMode.value);
    }
    localStorage.setItem('colorBlindMode', colorBlindMode.value);
});

// High contrast mode
highContrast.addEventListener('change', () => {
    document.body.classList.toggle('high-contrast', highContrast.checked);
    localStorage.setItem('highContrast', highContrast.checked);
});

// Admin login
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
</div>`;
        document.getElementById('reset-all-leds').addEventListener('click', () => {
            restoreAll();
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
