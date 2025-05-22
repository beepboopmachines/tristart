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

// Turn on all LEDs when the page loads (instead of turning them off)
window.addEventListener('load', () => {
    // Turn on all LEDs with white color
    for (let i = 1; i <= 5; i++) {
        db.ref(`leds/led${i}`).set({ r: 255, g: 255, b: 255 }); // White color for all LEDs
    }
    console.log("All LEDs turned on with white color on page load");
});

// Handle wall navigation
const wall1 = document.getElementById('wall1');
const wall2 = document.getElementById('wall2');
const navButton = document.getElementById('navButton');
const backButton = document.getElementById('backButton');
const dot1 = document.getElementById('dot1');
const dot2 = document.getElementById('dot2');
let currentWall = 1;

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
        // Apply sliding animation
        wall1.classList.remove('slide-center'); // Remove any previous center position
        wall1.classList.add('slide-left');
        wall2.classList.remove('slide-right'); // Remove any previous right slide
        wall2.classList.add('slide-center');

        // Update navigation after animation completes
        setTimeout(() => {
            navButton.style.display = 'none';
            backButton.style.display = 'flex';
            dot1.classList.remove('active');
            dot2.classList.add('active');
            currentWall = 2;
        }, 500); // Match this to the transition duration in CSS
    }
});

// Back navigation (to wall 1)
backButton.addEventListener('click', () => {
    if (currentWall === 2) {
        // Apply sliding animation
        wall2.classList.remove('slide-center'); // Remove center position
        wall2.classList.add('slide-right');
        wall1.classList.remove('slide-left'); // Remove left position
        wall1.classList.add('slide-center');

        // Update navigation after animation completes
        setTimeout(() => {
            backButton.style.display = 'none';
            navButton.style.display = 'flex';
            dot2.classList.remove('active');
            dot1.classList.add('active');
            currentWall = 1;
        }, 500); // Match this to the transition duration in CSS
    }
});

// Track currently active LED
let activeLedId = null;

// Handle paintings
for (let i = 1; i <= 5; i++) {
    const painting = document.getElementById(`painting${i}`);
    const innerFrame = painting.querySelector('.painting-inner-frame');
    // Remove color picker elements if they exist
    const colorPicker = painting.querySelector('.color-picker');
    if (colorPicker) {
        colorPicker.remove();
    }

    // Set initial color from Firebase (just for display)
    db.ref(`leds/led${i}`).once('value').then((snapshot) => {
        if (snapshot.exists()) {
            const { r, g, b } = snapshot.val();
            // Don't set the background color here to keep it transparent
            // innerFrame.style.backgroundColor = hex;
        }
    });

    // Update when Firebase changes
    db.ref(`leds/led${i}`).on('value', (snapshot) => {
        if (snapshot.exists()) {
            const { r, g, b } = snapshot.val();
            // Don't set the background color here to keep it transparent
            // innerFrame.style.backgroundColor = hex;
        }
    });

    // Handle painting click to turn on LED and show focused view
    painting.addEventListener('click', (event) => {
        event.stopPropagation();

        // Turn off ALL LEDs first
        for (let j = 1; j <= 5; j++) {
            db.ref(`leds/led${j}`).set({ r: 0, g: 0, b: 0 });
        }

        // Turn on this LED with a color
        const colors = [
            { r: 255, g: 255, b: 255 }, // Pink
            { r: 255, g: 255, b: 255 }, // Blue
            { r: 255, g: 255, b: 255 }, // Pink
            { r: 255, g: 255, b: 255 }, // Blue
            { r: 255, g: 255, b: 255 }, // Pink
        ];

        const ledColor = colors[(i - 1) % colors.length];
        db.ref(`leds/led${i}`).set(ledColor);
        activeLedId = i;

        // Clear any existing focused paintings
        overlay.innerHTML = '';

        // Create container for focused painting and info
        const container = document.createElement('div');
        container.className = 'focused-painting-container';

        // Create a clone of the painting for the focused view
        const paintingClone = painting.cloneNode(true);
        paintingClone.classList.add('focused-painting');

        // Remove the label from the clone
        const labelElement = paintingClone.querySelector('.painting-label');
        if (labelElement) {
            labelElement.remove();
        }

        // Replace SVG with PNG in the focused view
        const innerFrameClone = paintingClone.querySelector('.painting-inner-frame');
        innerFrameClone.innerHTML = '';
        innerFrameClone.classList.add('png-container'); // Add a class for PNG-specific styling

        const pngImage = document.createElement('img');
        pngImage.src = `PNG/png${i}.png`;
        pngImage.className = 'png-content'; // Use a different class for PNG images
        pngImage.alt = `Painting ${i}`;
        innerFrameClone.appendChild(pngImage);
        container.appendChild(paintingClone);

        // Add painting information
        const infoDiv = document.createElement('div');
        infoDiv.className = 'painting-info';
        const titleElement = document.createElement('h2');
        titleElement.className = 'painting-title';
        titleElement.textContent = paintingInfo[i - 1].title;
        infoDiv.appendChild(titleElement);
        const descElement = document.createElement('p');
        descElement.className = 'painting-description';
        descElement.textContent = paintingInfo[i - 1].description;
        infoDiv.appendChild(descElement);

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button';
        closeButton.innerHTML = '&times;';
        closeButton.addEventListener('click', (e) => {
            e.stopPropagation()
            overlay.classList.remove('active');
            setTimeout(() => {
                overlay.style.display = 'none';
                overlay.innerHTML = '';
            }, 300);

            // Turn on all LEDs with white color when closing
            for (let i = 1; i <= 5; i++) {
                db.ref(`leds/led${i}`).set({ r: 255, g: 255, b: 255 }); // White color
            }
            activeLedId = null; // Reset the active LED ID
        });

        container.appendChild(closeButton);
        container.appendChild(infoDiv);
        overlay.appendChild(container);

        // Show the overlay
        overlay.style.display = 'flex';
        setTimeout(() => {
            overlay.classList.add('active');
        }, 10);

        // Add keyboard navigation for focus mode
        const handleKeyNavigation = (event) => {
            if (!overlay.classList.contains('active')) return;
            let nextPaintingId = null;
            if (event.key === 'ArrowRight') {
                // Navigate to next painting
                nextPaintingId = activeLedId < 5 ? activeLedId + 1 : null;
                // If we're at the end of wall1 and wall2 exists, move to wall2
                if (activeLedId === 3 && currentWall === 1) {
                    // Simulate click on navigation button to wall2
                    navButton.click();
                    nextPaintingId = 4;
                }
            } else if (event.key === 'ArrowLeft') {
                // Navigate to previous painting
                nextPaintingId = activeLedId > 1 ? activeLedId - 1 : null;
                // If we're at the start of wall2 and wall1 exists, move to wall1
                if (activeLedId === 4 && currentWall === 2) {
                    // Simulate click on back button to wall1
                    backButton.click();
                    nextPaintingId = 3;
                }
            }

            // If we have a valid next painting, simulate a click on it
            if (nextPaintingId) {
                // Turn off ALL LEDs first
                for (let j = 1; j <= 5; j++) {
                    db.ref(`leds/led${j}`).set({ r: 0, g: 0, b: 0 });
                }

                // Turn on the next LED directly without animation
                const colors = [
                    { r: 255, g: 255, b: 255 }, // Pink
                    { r: 255, g: 255, b: 255 }, // Blue
                    { r: 255, g: 255, b: 255 }, // Pink
                    { r: 255, g: 255, b: 255 }, // Blue
                    { r: 255, g: 255, b: 255 }, // Pink
                ];

                const ledColor = colors[(nextPaintingId - 1) % colors.length];
                db.ref(`leds/led${nextPaintingId}`).set(ledColor);
                activeLedId = nextPaintingId;
                // Update the overlay content directly without animation
                const nextPainting = document.getElementById(`painting${nextPaintingId}`);
                // Clear existing content
                overlay.innerHTML = '';
                // Create new container
                const container = document.createElement('div');
                container.className = 'focused-painting-container';
                // Create a clone of the painting for the focused view
                const paintingClone = nextPainting.cloneNode(true);
                paintingClone.classList.add('focused-painting');
                paintingClone.classList.add('no-animation'); // Add class to disable animation
                // Remove the label from the clone
                const labelElement = paintingClone.querySelector('.painting-label');
                if (labelElement) {
                    labelElement.remove();
                }

                // Replace SVG with PNG in the focused view
                const innerFrameClone = paintingClone.querySelector('.painting-inner-frame');
                innerFrameClone.innerHTML = '';
                innerFrameClone.classList.add('png-container');
                const pngImage = document.createElement('img');
                pngImage.src = `PNG/png${nextPaintingId}.png`;
                pngImage.className = 'png-content';
                pngImage.alt = `Painting ${nextPaintingId}`;
                innerFrameClone.appendChild(pngImage);
                container.appendChild(paintingClone);

                // Add painting information
                const infoDiv = document.createElement('div');
                infoDiv.className = 'painting-info';
                const titleElement = document.createElement('h2');
                titleElement.className = 'painting-title';
                titleElement.textContent = paintingInfo[nextPaintingId - 1].title;
                infoDiv.appendChild(titleElement);
                const descElement = document.createElement('p');
                descElement.className = 'painting-description';
                descElement.textContent = paintingInfo[nextPaintingId - 1].description;
                infoDiv.appendChild(descElement);

                // Add close button
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

                    // Turn off LED when closing
                    if (activeLedId !== null) {
                        db.ref(`leds/led${activeLedId}`).set({ r: 0, g: 0, b: 0 });
                        activeLedId = null;
                    }

                    // Remove keyboard event listener
                    document.removeEventListener('keydown', handleKeyNavigation);
                });

                container.appendChild(closeButton);
                container.appendChild(infoDiv);
                overlay.appendChild(container);
            }
        };

        // Add event listener for keyboard navigation
        document.addEventListener('keydown', handleKeyNavigation);

        // Remove event listener when overlay is closed
        closeButton.addEventListener('click', () => {
            document.removeEventListener('keydown', handleKeyNavigation);
        });
    });
};

// Close focused view when clicking outside the painting
overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
        overlay.classList.remove('active');
        // Turn on all LEDs with white color when exiting focus mode
        for (let i = 1; i <= 5; i++) {
            db.ref(`leds/led${i}`).set({ r: 255, g: 255, b: 255 }); // White color
        }
        console.log("All LEDs turned on with white color when exiting focus mode");
        activeLedId = null; // Reset the active LED ID

        // Show the appropriate navigation button based on current wall
        if (currentWall === 1) {
            navButton.style.display = 'flex';
        } else {
            backButton.style.display = 'flex';
        }
    }
});

// Helper function to convert RGB to HEX
function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Ensure the gallery fits the 1920x1080 aspect ratio
function adjustGallerySize() {
    const container = document.querySelector('.gallery-container');
    const windowRatio = window.innerWidth / window.innerHeight;
    const targetRatio = 16 / 9; // 1920/1080
    if (windowRatio > targetRatio) {
        // Window is wider than 16:9
        const width = window.innerHeight * targetRatio;
        container.style.width = `${width}px`;
        container.style.height = '100vh';
        container.style.margin = '0 auto';
    } else {
        // Window is taller than 16:9
        const height = window.innerWidth / targetRatio;
        container.style.width = '100vw';
        container.style.height = `${height}px`;
        container.style.margin = `${(window.innerHeight - height) / 2}px 0`;
    }
}

// Adjust size on load and resize
window.addEventListener('load', adjustGallerySize);
window.addEventListener('resize', adjustGallerySize);

// Settings panel functionality
const settingsIcon = document.getElementById('settings-icon');
const settingsPanel = document.getElementById('settings-panel');
const closeSettings = document.getElementById('close-settings');
const visualAlerts = document.getElementById('visual-alerts');
const colorBlindMode = document.getElementById('color-blind-mode');
const highContrast = document.getElementById('high-contrast');
const adminPassword = document.getElementById('admin-password');
const adminSubmit = document.getElementById('admin-submit');
const adminPanel = document.getElementById('admin-panel');

// Add SVG filters for color blindness
const svgFilters = document.createElement('div');
svgFilters.style.height = '0';
svgFilters.style.width = '0';
svgFilters.style.position = 'absolute';
svgFilters.style.overflow = 'hidden';

svgFilters.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
    <filter id="protanopia-filter">
    <feColorMatrix type="matrix" values="0.567, 0.433, 0, 0, 0, 0.558, 0.442, 0, 0, 0, 0, 0.242, 0.758, 0, 0, 0, 0, 0, 1, 0"/>
    </filter>
    <filter id="deuteranopia-filter">
    <feColorMatrix type="matrix" values="0.625, 0.375, 0, 0, 0, 0.7, 0.3, 0, 0, 0, 0, 0.3, 0.7, 0, 0, 0, 0, 0, 1, 0"/>
    </filter>
    <filter id="tritanopia-filter">
    <feColorMatrix type="matrix" values="0.95, 0.05, 0, 0, 0, 0, 0.433, 0.567, 0, 0, 0, 0.475, 0.525, 0, 0, 0, 0, 0, 1, 0"/>
    </filter>
    </svg>
    `;

document.body.appendChild(svgFilters);

// Toggle settings panel
settingsIcon.addEventListener('click', () => {
    settingsPanel.classList.add('active');
});

closeSettings.addEventListener('click', () => {
    settingsPanel.classList.remove('active');
});

// Visual alerts for deaf users
visualAlerts.addEventListener('change', () => {
    if (visualAlerts.checked) {
        // Enable visual alerts
        localStorage.setItem('visualAlerts', 'true');
    } else {
        // Disable visual alerts
        localStorage.setItem('visualAlerts', 'false');
    }
});

// Color blind mode
colorBlindMode.addEventListener('change', () => {
    // Remove all color blind classes
    document.body.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    // Add selected class if not normal
    if (colorBlindMode.value !== 'normal') {
        document.body.classList.add(colorBlindMode.value);
    }

    // Save preference
    localStorage.setItem('colorBlindMode', colorBlindMode.value);
});

// High contrast mode
highContrast.addEventListener('change', () => {
    if (highContrast.checked) {
        document.body.classList.add('high-contrast');
        localStorage.setItem('highContrast', 'true');
    } else {
        document.body.classList.remove('high-contrast');
        localStorage.setItem('highContrast', 'false');
    }
});

// Admin login

adminSubmit.addEventListener('click', () => {
    // Simple password check - in a real app, use proper authentication
    if (adminPassword.value === 'admin123') {
        adminPanel.style.display = 'block';
        adminPassword.value = '';
        // Add admin controls

        adminPanel.innerHTML = `
    <div class="admin-controls">
    <h4>LED Controls</h4>
    <button id="reset-all-leds">Reset All LEDs</button>
    <button id="test-all-leds">Test All LEDs</button>
    <h4>Gallery Settings</h4>
    <button id="reset-settings">Reset All Settings</button>
    </div>
    `;
        // Add functionality to admin buttons
        document.getElementById('reset-all-leds').addEventListener('click', () => {
            // Turn on all LEDs with their respective colors
            const colors = [
                { r: 255, g: 255, b: 255 }, // Pink
                { r: 255, g: 255, b: 255 }, // Blue
                { r: 255, g: 255, b: 255 }, // Pink
                { r: 255, g: 255, b: 255 }, // Blue
                { r: 255, g: 255, b: 255 }, // Pink
            ];

            for (let i = 1; i <= 5; i++) {
                const ledColor = colors[(i - 1) % colors.length];
                db.ref(`leds/led${i}`).set(ledColor);
            }
            alert('All LEDs have been reset to their default colors.');
        });

        document.getElementById('test-all-leds').addEventListener('click', () => {
            // Test all LEDs in sequence
            testLEDs();
        });

        document.getElementById('reset-settings').addEventListener('click', () => {
            // Reset all settings
            localStorage.clear();
            visualAlerts.checked = false;
            colorBlindMode.value = 'normal';
            highContrast.checked = false;
            document.body.classList.remove('protanopia', 'deuteranopia', 'tritanopia', 'high-contrast');
            alert('All settings have been reset.');
        });

    } else {
        alert('Incorrect password. Please try again.');
    }
});

// Function to test LEDs in sequence
function testLEDs() {
    const colors = [
        { r: 255, g: 255, b: 255 }, // Pink
        { r: 255, g: 255, b: 255 }, // Blue
        { r: 255, g: 255, b: 255 }, // Pink
        { r: 255, g: 255, b: 255 }, // Blue
        { r: 255, g: 255, b: 255 }, // Pink
    ];
    // Turn on each LED for 1 second
    let i = 1;
    const testInterval = setInterval(() => {
        if (i <= 5) {
            // Turn on current LED
            db.ref(`leds/led${i}`).set(colors[i - 1]);
            // Turn off previous LED
            if (i > 1) {
                db.ref(`leds/led${i - 1}`).set({ r: 0, g: 0, b: 0 });
            }
            i++;
        } else {

            // Turn off the last LED and clear interval
            db.ref(`leds/led5`).set({ r: 0, g: 0, b: 0 });
            clearInterval(testInterval);
        }
    }, 1000);
}

// Load saved settings on page load
window.addEventListener('DOMContentLoaded', () => {
    // Load visual alerts setting
    if (localStorage.getItem('visualAlerts') === 'true') {
        visualAlerts.checked = true;
    }
    // Load color blind mode
    const savedColorMode = localStorage.getItem('colorBlindMode');
    if (savedColorMode) {
        colorBlindMode.value = savedColorMode;
        if (savedColorMode !== 'normal') {
            document.body.classList.add(savedColorMode);
        }
    }
    // Load high contrast setting
    if (localStorage.getItem('highContrast') === 'true') {
        highContrast.checked = true;
        document.body.classList.add('high-contrast');
    }
});
