// Get references to DOM elements
const gridContainer = document.getElementById('grid-container');
const gridSizeBtn = document.getElementById('grid-size-btn');
const clearBtn = document.getElementById('clear-btn');
const currentSizeDisplay = document.getElementById('current-size');
const currentModeDisplay = document.getElementById('current-mode');

// Mode buttons
const modeBlack = document.getElementById('mode-black');
const modeRandom = document.getElementById('mode-random');
const modeDarken = document.getElementById('mode-darken');
const modeEraser = document.getElementById('mode-eraser');

// Default settings
let gridSize = 16;
let isDrawing = false;
let currentMode = 'black'; // 'black', 'random', 'darken', 'eraser'

// Store original colors for eraser mode
const originalColors = new Map();

// Function to set active mode button
function setActiveMode(mode) {
    // Remove active class from all buttons
    const allModeButtons = document.querySelectorAll('.btn-mode');
    allModeButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to current mode button
    const activeButton = document.querySelector(`[data-mode="${mode}"]`);
    if (activeButton) {
        activeButton.classList.add('active');
    }
    
    // Update mode display
    const modeNames = {
        black: 'Black',
        random: 'Random Colors',
        darken: 'Progressive Darkening',
        eraser: 'Eraser'
    };
    currentModeDisplay.textContent = modeNames[mode];
    currentMode = mode;
}

// Function to create the grid - NO OVERFLOW
function createGrid(size) {
    // Clear existing grid and reset storage
    gridContainer.innerHTML = '';
    originalColors.clear();
    
    // Calculate square size
    const containerSize = 600;
    const squareSize = containerSize / size;
    
    // Create squares
    for (let i = 0; i < size * size; i++) {
        const square = document.createElement('div');
        square.classList.add('grid-square');
        
        // Set size
        square.style.width = `${squareSize}px`;
        square.style.height = `${squareSize}px`;
        
        // Store original background color for eraser mode
        originalColors.set(square, 'white');
        
        // Initialize opacity for darken mode
        square.dataset.opacity = '0';
        
        // Mouse events for drawing
        square.addEventListener('mouseenter', () => {
            if (isDrawing) {
                drawOnSquare(square);
            }
        });
        
        square.addEventListener('mousedown', (e) => {
            e.preventDefault(); // Prevent text selection
            isDrawing = true;
            drawOnSquare(square);
        });
        
        // Add square to container
        gridContainer.appendChild(square);
    }
    
    // Update size display
    currentSizeDisplay.textContent = `${size}×${size}`;
}

// Drawing function based on current mode
function drawOnSquare(square) {
    switch(currentMode) {
        case 'black':
            // Simple black mode
            square.style.backgroundColor = 'black';
            square.style.opacity = '1';
            originalColors.set(square, 'black'); // Update for eraser
            break;
            
        case 'random':
            // Random RGB colors
            const r = Math.floor(Math.random() * 256);
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            const randomColor = `rgb(${r}, ${g}, ${b})`;
            square.style.backgroundColor = randomColor;
            square.style.opacity = '1';
            originalColors.set(square, randomColor); // Update for eraser
            break;
            
        case 'darken':
            // Progressive darkening (10% each time)
            let currentOpacity = parseFloat(square.dataset.opacity);
            
            if (isNaN(currentOpacity)) {
                currentOpacity = 0;
            }
            
            if (currentOpacity < 1) {
                currentOpacity += 0.1;
                currentOpacity = Math.min(currentOpacity, 1); // Cap at 1
                square.dataset.opacity = currentOpacity.toString();
                
                // Store the color if it becomes fully black
                if (currentOpacity >= 1) {
                    originalColors.set(square, 'black');
                }
                
                // Apply the darkening effect
                square.style.backgroundColor = `rgba(0, 0, 0, ${currentOpacity})`;
            }
            break;
            
        case 'eraser':
            // Eraser mode - return to original white
            square.style.backgroundColor = 'white';
            square.style.opacity = '1';
            square.dataset.opacity = '0';
            originalColors.set(square, 'white'); // Reset to white
            break;
    }
}

// Clear grid function
function clearGrid() {
    const squares = document.querySelectorAll('.grid-square');
    squares.forEach(square => {
        square.style.backgroundColor = 'white';
        square.style.opacity = '1';
        square.dataset.opacity = '0';
        originalColors.set(square, 'white');
    });
}

// Initialize grid on page load
createGrid(gridSize);
setActiveMode('black');

// Event listeners for mouse drawing
gridContainer.addEventListener('mouseleave', () => {
    isDrawing = false;
});

document.addEventListener('mouseup', () => {
    isDrawing = false;
});

// Grid size button
gridSizeBtn.addEventListener('click', () => {
    let newSize = prompt('Enter number of squares per side (1-100):');
    newSize = parseInt(newSize);
    
    if (newSize > 0 && newSize <= 100) {
        gridSize = newSize;
        createGrid(gridSize);
    } else if (newSize > 100) {
        alert('⚠️ Maximum size is 100! For better performance.');
    } else if (isNaN(newSize)) {
        alert('❌ Please enter a valid number.');
    } else {
        alert('❌ Please enter a number between 1 and 100.');
    }
});

// Clear button
clearBtn.addEventListener('click', clearGrid);

// Mode buttons
modeBlack.addEventListener('click', () => setActiveMode('black'));
modeRandom.addEventListener('click', () => setActiveMode('random'));
modeDarken.addEventListener('click', () => setActiveMode('darken'));
modeEraser.addEventListener('click', () => setActiveMode('eraser'));

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case '1':
            setActiveMode('black');
            break;
        case '2':
            setActiveMode('random');
            break;
        case '3':
            setActiveMode('darken');
            break;
        case '4':
            setActiveMode('eraser');
            break;
        case 'c':
        case 'C':
            clearGrid();
            break;
        case 'g':
        case 'G':
            gridSizeBtn.click();
            break;
    }
});

// Prevent drag behavior that could cause issues
gridContainer.addEventListener('dragstart', (e) => {
    e.preventDefault();
});

// Add this for better drawing experience
gridContainer.addEventListener('mousedown', (e) => {
    if (e.target.classList.contains('grid-square')) {
        isDrawing = true;
    }
});