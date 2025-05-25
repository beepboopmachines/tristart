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

// Get the 'Modo Sonoro' checkbox
const modoSonoroCheckbox = document.getElementById('visual-alerts'); // Consider renaming this ID to something like 'audio-mode-checkbox' in your HTML for clarity

// Create an Audio element for playing sounds
// const audioPlayer = new Audio();

// Turn on all LEDs when the page loads (instead of turning them off)
// Cover page functionality
window.addEventListener('load', () => {
    const coverPage = document.getElementById('cover-page');
    const mainGallery = document.getElementById('main-gallery');

    // Add click event to cover page
    coverPage.addEventListener('click', () => {
        // Fade out cover page
        coverPage.classList.add('fade-out');

        // Show main gallery after fade out completes
        setTimeout(() => {
            coverPage.style.display = 'none';
            mainGallery.style.display = 'flex';
        }, 800); // Match the CSS transition duration
    });

    // Turn on all LEDs with white color (existing functionality)
    for (let i = 1; i <= 5; i++) {
        db.ref(`leds/led${i}`).set({ r: 255, g: 255, b: 255 });
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

// Variable to keep track of the currently playing audio for a painting
let currentPaintingAudio = null;

// Painting information
const paintingInfo = [
    {
        title: "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0O que é a síndrome de Down?",
        description: "A síndrome de Down é uma condição genética causada pela presença de três cópias do cromossomo 21 (em vez de duas). Sendo assim conhecida como trissomia 21. Ela ocorre de forma natural, geralmente no momento da concepção, e não é causada por nada que os pais tenham feito ou deixado de fazer."
    },
    {
        title: "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Capacidades",
        description: "Cognitivas e de aprendizagem: Aprendem por meio de experiências concretas e repetição.///SPLIT/// Sociais e emocionais: São muito sociáveis e afetuosas. ///SPLIT/// Criatividade e talentos: Muitos têm talentos artísticos: dança teatro, música e desenho. ///SPLIT/// Vida prática: Conseguem tomar decisões sobre sua vida com orientação."
    },

    {
        title: "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Dificuldades",
        description: "As dificuldades existem, mas não definem a pessoa. Elas podem ser enfrentadas com apoio médico, terapias e inclusão. ///SPLIT/// Desenvolvimento motor:<br>• Atraso para sentar, andar ou correr.<br>• Tônus muscular mais baixo (hipotonia).<br>• Necessidade de fisioterapia nos primeiros anos. ///SPLIT///Fala e comunicação:<br>• Dificuldade na articulação de palavras. ///SPLIT/// Cognitivas:<br>• Aprendizagem mais lenta.///SPLIT///Saúde:<br>• Pode haver dificuldade de audição e visão."
    },

    {
        title: "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Características",
        description: "Olhos amendoados.///SPLIT///Tônus muscular mais baixo ao nascer.///SPLIT///Estatura mais baixa.///SPLIT///Desenvolvimento motor e cognitivo mais lento."
    },

    {
        title: "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0Mitos e Verdades",
        description: "Mito 1: “Pessoas com síndrome de Down são sempre felizes.”<br>Elas têm sentimentos como qualquer pessoa - ficam tristes, frustradas, apaixonadas, com raiva. Reduzir suas emoções a “felicidade constante” é desumanizador.///SPLIT///Mito 2: “Todos são iguais.”<br> Pessoas com síndrome de Down têm personalidades, talentos e dificuldades únicas, como qualquer outra pessoa.///SPLIT///Mito 3: “Não vivem muito.” <br>Com cuidados médicos adequados, podem ter uma vida longa, produtiva e cheia de realizações.///SPLIT///Mito 4: “São eternas crianças.”<br>Crescem, tornam-se adultos, têm desejos, sexualidade, autonomia e devem ser tratados com respeito às suas fases da vida.///SPLIT///Mito 5: “São um fardo para a família.”<br> Famílias que recebem apoio vivem com amor, aprendizados e momentos intensos como qualquer outra. Muitos pais relatam que seus filhos com SD mudaram suas vidas para melhor.///SPLIT///Mito 6: “Pessoas com síndrome de Down não podem trabalhar ou ser independentes.”<br> Muitas pessoas com síndrome de Down estudam, trabalham, têm relacionamentos, vivem de forma semiautónoma e contribuem para suas comunidades."
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

        // Stop any currently playing painting audio
        if (currentPaintingAudio && !currentPaintingAudio.paused) {
            currentPaintingAudio.pause();
            currentPaintingAudio.currentTime = 0; // Reset audio to the beginning
        }

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

        // Play audio if 'Modo Sonoro' is checked
        if (modoSonoroCheckbox.checked) {
            currentPaintingAudio = new Audio(`AUDIO/Quadro${i}.mp3`);
            currentPaintingAudio.play().catch(error => console.error("Error playing audio:", error));
        }

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
        pngImage.src = `PNG/png${i}.png`; // Path to your PNG images
        pngImage.alt = `Painting ${i} - Focused View`;
        pngImage.style.width = '100%'; // Ensure the image fits within the container
        pngImage.style.height = 'auto'; // Maintain aspect ratio
        innerFrameClone.appendChild(pngImage);

        container.appendChild(paintingClone);

        // Add painting information (title and description)
        const infoDiv = document.createElement('div');
        infoDiv.className = 'painting-info-focused';

        const titleElement = document.createElement('h3');
        titleElement.textContent = paintingInfo[i - 1].title;
        infoDiv.appendChild(titleElement);

        // Description pagination logic
        const descriptionParts = paintingInfo[i - 1].description.split('///SPLIT///');
        let currentPartIndex = 0;

        const descriptionContainer = document.createElement('div');
        descriptionContainer.className = 'description-pagination-container';

        const descriptionTextElement = document.createElement('p');
        descriptionTextElement.className = 'painting-description'; // Keep this class for styling

        const prevButton = document.createElement('button');
        prevButton.className = 'description-nav-button prev-button';
        prevButton.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="17" stroke="white" stroke-width="1.6" fill="none"/>
            <polyline points="21,10 11,18 21,26" stroke="white" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        `;

        const nextButton = document.createElement('button');
        nextButton.className = 'description-nav-button next-button';
        nextButton.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="17" stroke="white" stroke-width="1.6" fill="none"/>
            <polyline points="14,10 25,18 14,26" stroke="white" stroke-width="1.9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        `;

        function updateDescription() {
            descriptionTextElement.innerHTML = descriptionParts[currentPartIndex];
            prevButton.style.display = currentPartIndex > 0 ? 'inline-block' : 'none';
            nextButton.style.display = currentPartIndex < descriptionParts.length - 1 ? 'inline-block' : 'none';
        }

        prevButton.addEventListener('click', () => {
            if (currentPartIndex > 0) {
                currentPartIndex--;
                updateDescription();
            }
        });

        nextButton.addEventListener('click', () => {
            if (currentPartIndex < descriptionParts.length - 1) {
                currentPartIndex++;
                updateDescription();
            }
        });

        descriptionContainer.appendChild(prevButton);
        descriptionContainer.appendChild(descriptionTextElement);
        descriptionContainer.appendChild(nextButton);

        infoDiv.appendChild(descriptionContainer);
        updateDescription(); // Initial display

        container.appendChild(infoDiv);

        // Add close button
        const closeButton = document.createElement('button');
        closeButton.className = 'close-button'; // Changed from 'close-focused-view' to 'close-button'
        closeButton.innerHTML = '&times;'; // '×' character
        closeButton.addEventListener('click', () => {
            overlay.style.display = 'none';
            overlay.innerHTML = ''; // Clear content
            // Turn off the active LED when closing the focused view
            if (activeLedId !== null) {
                db.ref(`leds/led${activeLedId}`).set({ r: 0, g: 0, b: 0 });
                activeLedId = null;
            }
            // Stop audio when closing focused view
            if (currentPaintingAudio && !currentPaintingAudio.paused) {
                currentPaintingAudio.pause();
                currentPaintingAudio.currentTime = 0;
            }
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
                // === THIS IS WHERE THE PREVIOUS AUDIO IS STOPPED ===
                if (currentPaintingAudio && !currentPaintingAudio.paused) {
                    currentPaintingAudio.pause();
                    currentPaintingAudio.currentTime = 0; // Reset audio to the beginning
                }
                // === END OF AUDIO STOP LOGIC ===

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

                // Play audio for the new painting if 'Modo Sonoro' is checked
                if (modoSonoroCheckbox.checked) {
                    currentPaintingAudio = new Audio(`AUDIO/Quadro${nextPaintingId}.mp3`);
                    currentPaintingAudio.play().catch(error => console.error("Error playing audio for next painting:", error));
                }

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
                const title = document.createElement('h2');
                title.style.position = 'relative';
                title.style.left = '50px';
                title.textContent = 'Capacidades';
                // or, if you prefer using a class:
                title.classList.add('painting-description-title');
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

                    // Stop audio when closing focused view from close button
                    if (currentPaintingAudio && !currentPaintingAudio.paused) {
                        currentPaintingAudio.pause();
                        currentPaintingAudio.currentTime = 0;
                    }

                    // Remove keyboard event listener
                    document.removeEventListener('keydown', handleKeyNavigation);
                });

                container.appendChild(closeButton);
                container.appendChild(infoDiv);
                overlay.appendChild(container);
            }
        };


        // Remove event listener when overlay is closed
        closeButton.addEventListener('click', () => {
            document.removeEventListener('keydown', handleKeyNavigation);
            // Stop audio if the close button on the painting info is clicked
            if (currentPaintingAudio && !currentPaintingAudio.paused) {
                currentPaintingAudio.pause();
                currentPaintingAudio.currentTime = 0;
            }
        });
    });
};

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
