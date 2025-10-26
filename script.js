
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const paddle = document.getElementById('paddle');
    const ball = document.getElementById('ball');
    const gameArea = document.querySelector('.game-area');
    const scoreDisplay = document.getElementById('score');
    const bouncesDisplay = document.getElementById('bounces'); // Nowy element
    const livesDisplay = document.getElementById('lives');
    const levelDisplay = document.getElementById('level');
    const startButton = document.getElementById('startButton');
    const infinityModeButton = document.getElementById('infinityModeButton');
    const gameOverDisplay = document.getElementById('gameOver');
    const restartButton = document.getElementById('restartButton');
    const bricksContainer = document.getElementById('bricks-container');
    const powerUpMessage = document.getElementById('powerUpMessage');
    const bumElement = document.getElementById('bum');
    const nextLevelMessage = document.getElementById('nextLevelMessage'); // Nowy element

    // --- Game State ---
    let paddlePosition = (gameArea.clientWidth / 2) - (paddle.clientWidth / 2);
    let ballPosition = { x: gameArea.clientWidth / 2 - 7.5, y: gameArea.clientHeight / 2 };
    let ballSpeed = { x: 2, y: -4 };
    let gameInterval;
    let score = 0;
    let bounces = 0; // Nowa zmienna
    let lives = 3;
    let level = 1;
    let gameActive = false;
    let infinityMode = false;
    let bricks = [];
    let powerUps = [];

    // --- Constants ---
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF0000', '#FF33A8', '#7FFFD4', '#556B2F', '#708090'];
    let currentColorIndex = 0;

    const levelLayouts = [
        [ // Level 1
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 0, 0, 1, 1, 0],
            [0, 0, 1, 0, 0, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1]
        ],
        [ // Level 2
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0]
        ],
        [ // Level 3
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1]
        ]
    ];

    // --- Game Flow Functions ---
    function startActualGame(isInfinityMode = false) {
        infinityMode = isInfinityMode;
        startButton.style.display = 'none';
        infinityModeButton.style.display = 'none';
        gameOverDisplay.style.display = 'none';
        gameArea.classList.add('game-active'); // Ukryj kursor

        resetGame();
        if (infinityMode) {
            levelDisplay.textContent = 'Poziom: ∞';
            generateRandomBricks();
        } else {
            createBricksForLevel(level);
        }

        gameActive = true;
        gameInterval = setInterval(updateGame, 10);
    }

    function resetGame() {
        score = 0;
        bounces = 0; // Resetuj odbicia
        lives = 3;
        level = 1;
        updateStats();
        resetBall();
        clearBricks();
        clearPowerUps();
    }

    function endGame() {
        gameActive = false;
        clearInterval(gameInterval);
        gameOverDisplay.style.display = 'block';
        gameArea.classList.remove('game-active'); // Pokaż kursor
    }

    function proceedToNextLevel() {
        ballSpeed = { x: 0, y: 0 }; // Zatrzymaj piłkę
        nextLevelMessage.style.display = 'block';

        setTimeout(() => {
            nextLevelMessage.style.display = 'none';
            level++;
            createBricksForLevel(level);
            resetBall();
            updateStats();
        }, 2000); // Czekaj 2 sekundy
    }

    // --- Update Functions ---
    function updateStats() {
        scoreDisplay.textContent = "Punkty: " + score;
        bouncesDisplay.textContent = "Odbicia: " + bounces; // Aktualizuj licznik odbić
        livesDisplay.textContent = "Życia: " + lives;
        if (!infinityMode) {
            levelDisplay.textContent = "Poziom: " + level;
        }
    }

    function updateGame() {
        if (!gameActive) return;

        ballPosition.x += ballSpeed.x;
        ballPosition.y += ballSpeed.y;

        // Wall collision
        if (ballPosition.x <= 0 || ballPosition.x >= gameArea.clientWidth - 15) {
            ballSpeed.x = -ballSpeed.x;
        }
        if (ballPosition.y <= 0) {
            ballSpeed.y = -ballSpeed.y;
        }

        // Paddle collision
        const paddleRect = paddle.getBoundingClientRect();
        const ballRect = ball.getBoundingClientRect();
        if (
            ballRect.bottom >= paddleRect.top &&
            ballRect.top <= paddleRect.bottom &&
            ballRect.right >= paddleRect.left &&
            ballRect.left <= paddleRect.right &&
            ballSpeed.y > 0
        ) {
            ballSpeed.y = -ballSpeed.y;
            bounces++; // Zliczaj odbicia
            updateStats();
            paddle.style.backgroundColor = 'yellow';
            showBumEffect();
            setTimeout(() => paddle.style.backgroundColor = '#333', 100);
        }

        // Brick collision
        let bricksLeft = false;
        bricks.forEach((brick) => {
             if (brick.offsetParent !== null) {
                bricksLeft = true;
                const brickRect = brick.getBoundingClientRect();
                if (
                    ballRect.bottom >= brickRect.top &&
                    ballRect.top <= brickRect.bottom &&
                    ballRect.right >= brickRect.left &&
                    ballRect.left <= brickRect.right
                ) {
                    ballSpeed.y = -ballSpeed.y;
                    handleBrickRemoval(brick);
                    score += 10;
                    updateStats();
                }
            }
        });

        if (!bricksLeft && !infinityMode) {
            proceedToNextLevel();
        }

        updatePowerUps();

        // Bottom wall collision (lose life)
        if (ballPosition.y >= gameArea.clientHeight - 15) {
            lives--;
            updateStats();
            if (lives <= 0) {
                endGame();
            } else {
                resetBall();
            }
        }

        ball.style.left = ballPosition.x + 'px';
        ball.style.top = ballPosition.y + 'px';
    }

    // --- Helper Functions ---
    function resetBall() {
        ballPosition = { x: gameArea.clientWidth / 2 - 7.5, y: gameArea.clientHeight / 2 };
        // Losowy kierunek startowy
        let angle = (Math.random() * Math.PI / 2) + Math.PI / 4;
        ballSpeed = { x: 4 * Math.cos(angle), y: -4 * Math.sin(angle) };
        if (Math.random() > 0.5) ballSpeed.x = -ballSpeed.x;

        ball.style.left = ballPosition.x + 'px';
        ball.style.top = ballPosition.y + 'px';
    }

    function handleBrickRemoval(brick) {
        const brickRect = brick.getBoundingClientRect();
        createExplosion(brickRect.left + brickRect.width / 2, brickRect.top + brickRect.height / 2);
        brick.classList.add('blinking');

        setTimeout(() => {
            if (brick.parentNode) {
                brick.remove(); // Usunięcie z DOM
            }
            if (Math.random() < 0.3) createPowerUp(brickRect.left, brickRect.top);
        }, 300);
    }

    function showBumEffect() {
        // Pozycja BUM jest teraz nieco wyżej nad paletką
        bumElement.style.left = (paddle.offsetLeft + paddle.offsetWidth / 2 - bumElement.offsetWidth / 2) + 'px';
        bumElement.style.top = (paddle.offsetTop - bumElement.offsetHeight - 10) + 'px'; // 10px wyżej
        bumElement.style.display = 'block';
        setTimeout(() => {
            bumElement.style.display = 'none';
        }, 300);
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', () => startActualGame(false));
    infinityModeButton.addEventListener('click', () => startActualGame(true));
    restartButton.addEventListener('click', () => {
        gameOverDisplay.style.display = 'none';
        startButton.style.display = 'block';
        infinityModeButton.style.display = 'block';
    });

    document.addEventListener('mousemove', (event) => {
        if (!gameActive) return; // Paletka aktywna tylko w trakcie gry
        const gameAreaRect = gameArea.getBoundingClientRect();
        paddlePosition = event.clientX - gameAreaRect.left - paddle.clientWidth / 2;
        paddlePosition = Math.max(0, Math.min(gameArea.clientWidth - paddle.clientWidth, paddlePosition));
        paddle.style.left = paddlePosition + 'px';
    });

    document.addEventListener('touchmove', (event) => {
        if (!gameActive) return; // Paletka aktywna tylko w trakcie gry
        const gameAreaRect = gameArea.getBoundingClientRect();
        const touch = event.touches[0];
        paddlePosition = touch.clientX - gameAreaRect.left - paddle.clientWidth / 2;
        paddlePosition = Math.max(0, Math.min(gameArea.clientWidth - paddle.clientWidth, paddlePosition));
        paddle.style.left = paddlePosition + 'px';
    });

    // --- Utility Functions (Bricks, PowerUps, etc. - bez większych zmian) ---
    function createBricksForLevel(level) {
        clearBricks();
        const layout = levelLayouts[(level - 1) % levelLayouts.length];
        for (let row = 0; row < layout.length; row++) {
            for (let col = 0; col < layout[row].length; col++) {
                if (layout[row][col] === 1) {
                    const brick = document.createElement('div');
                    brick.classList.add('brick');
                    brick.style.gridRowStart = row + 1;
                    brick.style.gridColumnStart = col + 1;
                    bricksContainer.appendChild(brick);
                    bricks.push(brick);
                }
            }
        }
    }

    function generateRandomBricks() {
        clearBricks();
        const brickCount = Math.floor(Math.random() * 20) + 10;
        for (let i = 0; i < brickCount; i++) {
            const brick = document.createElement('div');
            brick.classList.add('brick');
            brick.style.gridColumnStart = Math.floor(Math.random() * 8) + 1;
            brick.style.gridRowStart = Math.floor(Math.random() * 5) + 1;
            bricksContainer.appendChild(brick);
            bricks.push(brick);
        }
    }

    function clearBricks() {
        bricksContainer.innerHTML = '';
        bricks = [];
    }

    function createPowerUp(x, y) {
        const powerUp = document.createElement('div');
        powerUp.classList.add('power-up');
        powerUp.style.left = x + 'px';
        powerUp.style.top = y + 'px';
        const powerUpType = Math.random() < 0.5 ? 'slow-ball' : 'large-paddle';
        powerUp.dataset.type = powerUpType;
        powerUp.textContent = powerUpType === 'slow-ball' ? 'S' : 'L';
        gameArea.appendChild(powerUp);
        powerUps.push(powerUp);
    }

    function updatePowerUps() {
        const paddleRect = paddle.getBoundingClientRect();
        powerUps.forEach((powerUp, index) => {
            const powerUpRect = powerUp.getBoundingClientRect();
            powerUp.style.top = (powerUp.offsetTop + 2) + 'px';

            if (powerUpRect.top > gameArea.clientHeight) {
                powerUp.remove();
                powerUps.splice(index, 1);
            }

            if (powerUpRect.bottom >= paddleRect.top && powerUpRect.top <= paddleRect.bottom && powerUpRect.right >= paddleRect.left && powerUpRect.left <= paddleRect.right) {
                activatePowerUp(powerUp.dataset.type);
                powerUp.remove();
                powerUps.splice(index, 1);
            }
        });
    }

    function activatePowerUp(type) {
        showPowerUpMessage(type === 'slow-ball' ? 'Slow Ball!' : 'Large Paddle!');
        if (type === 'slow-ball') {
            ballSpeed.x /= 2;
            ballSpeed.y /= 2;
            setTimeout(() => {
                ballSpeed.x *= 2;
                ballSpeed.y *= 2;
            }, 5000);
        } else if (type === 'large-paddle') {
            paddle.style.width = '150px';
            setTimeout(() => {
                paddle.style.width = '100px';
            }, 5000);
        }
    }

    function clearPowerUps() {
        powerUps.forEach(powerUp => powerUp.remove());
        powerUps = [];
    }

    function showPowerUpMessage(message) {
        powerUpMessage.textContent = message;
        powerUpMessage.style.display = 'block';
        setTimeout(() => {
            powerUpMessage.style.display = 'none';
        }, 2000);
    }

    function createExplosion(x, y) {
        const particleCount = 8;
        const gameAreaRect = gameArea.getBoundingClientRect();
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('brick-explosion-particle');
            gameArea.appendChild(particle);

            const angle = (i / particleCount) * 2 * Math.PI;
            const speed = Math.random() * 2 + 1;
            let particleX = x - gameAreaRect.left;
            let particleY = y - gameAreaRect.top;
            const dx = Math.cos(angle) * speed;
            const dy = Math.sin(angle) * speed;

            particle.style.left = particleX + 'px';
            particle.style.top = particleY + 'px';

            let life = 100;
            const animateParticle = () => {
                if (life <= 0) {
                    if (particle.parentNode) particle.remove();
                    return;
                }
                life -= 4;
                particleX += dx;
                particleY += dy;
                particle.style.left = particleX + 'px';
                particle.style.top = particleY + 'px';
                particle.style.opacity = life / 100;
                requestAnimationFrame(animateParticle);
            };
            animateParticle();
        }
    }
});
