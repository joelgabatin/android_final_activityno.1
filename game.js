// Game state variables
let currentLevel = 1;
let levelScore = 0;
let globalScore = 0;
let timeLeft;
let timerInterval;

// UI Elements
const levelDisplay = document.getElementById("level");
const levelRequirementDisplay = document.getElementById("levelRequirement");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");
const tapButton = document.getElementById("tapButton");
const startGameButton = document.getElementById("startGameButton");
const restartButton = document.getElementById("restartButton");
const installBtn = document.getElementById("installButton");
const gameContainer = document.getElementById("gameContainer");

// PWA Install Button Logic
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('[DEBUG] beforeinstallprompt fired');
  e.preventDefault();
  deferredPrompt = e;
  installBtn.hidden = false;
  
  installBtn.addEventListener('click', () => {
    console.log('[DEBUG] Install button clicked');
    installBtn.hidden = true;
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(choiceResult => {
      console.log('[DEBUG] User choice:', choiceResult);
      deferredPrompt = null;
    });
  });
});

// Start a level with adjusted time based on the level.
// For level 1: 10 seconds, level 2: 9 seconds, etc., with a minimum of 5 seconds.
function startLevel() {
  levelDisplay.textContent = currentLevel;
  levelScore = 0;
  const levelTime = Math.max(10 - (currentLevel - 1), 5);
  timeLeft = levelTime;
  timerDisplay.textContent = timeLeft;
  
  // Level target is 10 taps multiplied by the current level.
  const levelTarget = 10 * currentLevel;
  levelRequirementDisplay.textContent = levelTarget;
  
  restartButton.hidden = true;
  tapButton.hidden = false;  // Show tap button during game
  
  // Clear any old interval before starting a new one
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endLevel();
    }
  }, 1000);
}

// End the current level, check if target is met, and then progress or end game
function endLevel() {
  const levelTarget = 10 * currentLevel;
  // Hide the tap button since the time is up
  tapButton.hidden = true;
  
  if (levelScore >= levelTarget) {
    alert(`Level ${currentLevel} completed with ${levelScore} taps!`);
    currentLevel++;
    // After level completion, show Start Game again so player manually starts next level
    startGameButton.hidden = false;
  } else {
    alert(`Game Over! You achieved ${levelScore} taps on level ${currentLevel}. Total score: ${globalScore}`);
    restartButton.hidden = false;
  }
}

// Tap button event: increase the score, update UI, reposition target, and provide feedback.
tapButton.addEventListener("click", () => {
  if (timeLeft > 0) {
    levelScore++;
    globalScore++;
    scoreDisplay.textContent = globalScore;
    
    // Reposition the tap button randomly inside the container.
    repositionTarget();
    
    // Visual feedback animation.
    tapButton.classList.add("tapped");
    setTimeout(() => tapButton.classList.remove("tapped"), 100);
  }
});

// Start game button event: hides itself and starts the level.
startGameButton.addEventListener("click", () => {
  startGameButton.hidden = true;
  startLevel();
});

// Restart game resets level and global score, and shows the start button.
restartButton.addEventListener("click", () => {
  currentLevel = 1;
  globalScore = 0;
  scoreDisplay.textContent = globalScore;
  clearInterval(timerInterval);
  timerInterval = null;
  tapButton.style.position = "static";
  // Show the start button so the player can begin again.
  startGameButton.hidden = false;
});

// Repositions the tap button randomly within the game container boundaries.
function repositionTarget() {
  const containerRect = gameContainer.getBoundingClientRect();
  const buttonRect = tapButton.getBoundingClientRect();
  
  // Calculate maximum left and top values within the container.
  const maxLeft = containerRect.width - buttonRect.width;
  const maxTop = containerRect.height - buttonRect.height;
  
  const randomLeft = Math.random() * maxLeft;
  const randomTop = Math.random() * maxTop;
  
  // Position the button absolutely.
  tapButton.style.position = "absolute";
  tapButton.style.left = randomLeft + "px";
  tapButton.style.top = randomTop + "px";
}
