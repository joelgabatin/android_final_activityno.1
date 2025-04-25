// Game state variables
let currentLevel = 1;
let levelScore = 0;
let globalScore = 0; // Total taps
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

function startGame() {
  // ... existing start game logic ...
  
  // Update the page title to reflect the current level
  document.title = `Level ${level}`;
}

function endGame() {
  // ... existing end game logic ...
  
  // Revert the page title to the default
  document.title = 'Tap the Button Game';
}

function levelUp() {
  level++;
  // ... existing level-up logic ...
  
  // Update the page title to reflect the new level
  document.title = `Level ${level}`;
}


// Start a level with adjusted time based on level.
// Level 1: 10 seconds; Level 2: 9 seconds; ... minimum of 5 seconds.
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
  tapButton.hidden = false; // Show tap button during game
  
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

// End the level; if failed, update leaderboard.
function endLevel() {
  const levelTarget = 10 * currentLevel;
  tapButton.hidden = true;
  
  if (levelScore >= levelTarget) {
    alert(`Level ${currentLevel} completed with ${levelScore} taps!`);
    currentLevel++;
    startGameButton.hidden = false;
  } else {
    alert(`Game Over! You achieved ${levelScore} taps on level ${currentLevel}. Total taps: ${globalScore}`);
    updateHighScores(globalScore, currentLevel);
    restartButton.hidden = false;
  }
}

// Update high scores in localStorage.
function updateHighScores(score, level) {
  let highScores = JSON.parse(localStorage.getItem('highScores')) || [];
  const newRecord = {
    score,
    level,
    date: new Date().toLocaleString()
  };
  highScores.push(newRecord);
  highScores.sort((a, b) => b.score - a.score);
  highScores = highScores.slice(0, 10); // Keep top 10
  localStorage.setItem('highScores', JSON.stringify(highScores));
}

// Tap button event increases tap counts and repositions the target.
tapButton.addEventListener("click", () => {
  if (timeLeft > 0) {
    levelScore++;
    globalScore++;
    scoreDisplay.textContent = globalScore;
    repositionTarget();
    tapButton.classList.add("tapped");
    setTimeout(() => tapButton.classList.remove("tapped"), 100);
  }
});

// Start game button event.
startGameButton.addEventListener("click", () => {
  startGameButton.hidden = true;
  startLevel();
});

// Restart game resets state.
restartButton.addEventListener("click", () => {
  currentLevel = 1;
  globalScore = 0;
  scoreDisplay.textContent = globalScore;
  clearInterval(timerInterval);
  timerInterval = null;
  tapButton.style.position = "static";
  startGameButton.hidden = false;
});

// Reposition the tap button randomly within the container.
function repositionTarget() {
  const containerRect = gameContainer.getBoundingClientRect();
  const buttonRect = tapButton.getBoundingClientRect();
  const maxLeft = containerRect.width - buttonRect.width;
  const maxTop = containerRect.height - buttonRect.height;
  const randomLeft = Math.random() * maxLeft;
  const randomTop = Math.random() * maxTop;
  tapButton.style.position = "absolute";
  tapButton.style.left = randomLeft + "px";
  tapButton.style.top = randomTop + "px";
}
