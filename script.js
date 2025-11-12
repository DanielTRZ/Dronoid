
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const paddle = document.getElementById('paddle');
    const ball = document.getElementById('ball');
    const gameArea = document.querySelector('.game-area');
    const scoreDisplay = document.getElementById('score');
    const bouncesDisplay = document.getElementById('bounces');
    const livesDisplay = document.getElementById('lives');
    const levelDisplay = document.getElementById('level');
    const startButton = document.getElementById('startButton');
    const infinityModeButton = document.getElementById('infinityModeButton');
    const gameOverDisplay = document.getElementById('gameOver');
    const restartButton = document.getElementById('restartButton'); // Przycisk na ekranie Game Over
    const restartGameButton = document.getElementById('restartGameButton'); // Nowy przycisk "Od początku"
    const bricksContainer = document.getElementById('bricks-container');
    const powerUpMessage = document.getElementById('powerUpMessage');
    const bumElement = document.getElementById('bum');
    const nextLevelMessage = document.getElementById('nextLevelMessage');

    // --- Game State ---
    let paddlePosition = (gameArea.clientWidth / 2) - (paddle.clientWidth / 2);
    let ballPosition = { x: 0, y: 0 }; // Pozycja będzie ustawiana w resetBall
    let ballSpeed = { x: 0, y: 0 };
    let gameInterval;
    let score = 0;
    let bounces = 0;
    let lives = 3;
    let level = 1;
    let gameActive = false;
    let ballIsOnPaddle = true; // Nowa zmienna stanu
    let infinityMode = false;
    let bricks = [];
    let powerUps = [];
    let isPaddleMagnetic = false;
    let isPaddleAttractive = false;
    let defaultPaddleWidth = null; // Zostanie ustawione przy pierwszym użyciu
    let activePaddleWidthTimeout = null;

    const levelLayouts = [
        // Poziom 1
        [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 1, 1, 1, 1, 1, 1],
            [0, 1, 1, 0, 0, 1, 1, 0],
            [0, 0, 1, 0, 0, 1, 0, 0],
            [1, 1, 1, 1, 1, 1, 1, 1]
        ],
        // Poziom 2
        [
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 2, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0]
        ],
        // Poziom 3
        [
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 2, 1, 1, 0, 1],
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
        restartGameButton.style.display = 'block'; // Pokaż przycisk "Od początku"
        gameArea.classList.add('game-active');

        resetGame();
        if (infinityMode) {
            levelDisplay.textContent = 'Poziom: ∞';
            generateRandomBricks();
        } else {
            level = 1; // Zapewnij, że poziom zaczyna się od 1
            createBricksForLevel(level);
        }
        updateStats(); // Zaktualizuj wyświetlanie poziomu od razu

        gameActive = true;
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(updateGame, 10);
    }

    function resetGame() {
        score = 0;
        bounces = 0;
        lives = 3;
        clearBricks();
        clearPowerUps();
        resetBall();
        resetPaddle();
    }

    function resetPaddle() {
        paddlePosition = (gameArea.clientWidth / 2) - (paddle.offsetWidth / 2);
        paddle.style.left = paddlePosition + 'px';
    }

    function endGame() {
        gameActive = false;
        clearInterval(gameInterval);
        gameOverDisplay.style.display = 'block';
        restartGameButton.style.display = 'none';
        gameArea.classList.remove('game-active');
    }

    function proceedToNextLevel() {
        ballIsOnPaddle = true;
        ballSpeed = { x: 0, y: 0 };
        nextLevelMessage.style.display = 'block';

        setTimeout(() => {
            nextLevelMessage.style.display = 'none';
            level++;
            createBricksForLevel(level); // Wczytaj następny zdefiniowany poziom
            resetBall();
            updateStats();
        }, 2000);
    }

    // --- Update Functions ---
    function updateStats() {
        scoreDisplay.textContent = "Punkty: " + score;
        bouncesDisplay.textContent = "Odbicia: " + bounces;
        livesDisplay.textContent = "Życia: " + lives;
        if (!infinityMode) {
            levelDisplay.textContent = "Poziom: " + level;
        }
    }

    function updateGame() {
        if (!gameActive) return;

        if (ballIsOnPaddle) {
            // Piłka podąża za paletką
            ballPosition.x = paddlePosition + (paddle.offsetWidth / 2) - (ball.offsetWidth / 2);
            ballPosition.y = paddle.offsetTop - ball.offsetHeight;
        } else {
            // Normalny ruch piłki
            ballPosition.x += ballSpeed.x;
            ballPosition.y += ballSpeed.y;

            // Kolizje ze ścianami
            if (ballPosition.x <= 0 || ballPosition.x >= gameArea.clientWidth - ball.offsetWidth) {
                ballSpeed.x = -ballSpeed.x;
            }
            if (ballPosition.y <= 0) {
                ballSpeed.y = -ballSpeed.y;
            }

            // Kolizja z paletką
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
                bounces++;
                updateStats();
                showBumEffect();
            }

            // Kolizje z klockami
            let bricksLeft = 0;
            bricks.forEach((brick) => {
                if (brick.offsetParent !== null) {
                    bricksLeft++;
                    const brickRect = brick.getBoundingClientRect();
                    if (
                        ballRect.bottom >= brickRect.top &&
                        ballRect.top <= brickRect.bottom &&
                        ballRect.right >= brickRect.left &&
                        ballRect.left <= brickRect.right
                    ) {
                        // Zmiana kierunku piłki tak, aby zawsze leciała w dół po uderzeniu w klocek
                        ballSpeed.y = Math.abs(ballSpeed.y);
                        handleBrickRemoval(brick);
                        score += 10;
                        updateStats();
                    }
                }
            });

            updatePowerUps();

            // Utrata życia
            if (ballPosition.y >= gameArea.clientHeight - ball.offsetHeight) {
                lives--;
                updateStats();
                if (lives <= 0) {
                    endGame();
                } else {
                    resetBall();
                }
            }
        }

        // Logika magnetycznej paletki
        if (isPaddleMagnetic) {
            const paddleRect = paddle.getBoundingClientRect();
            const ballRect = ball.getBoundingClientRect();
            const paddleCenterX = paddleRect.left + paddleRect.width / 2;
            const ballCenterX = ballRect.left + ballRect.width / 2;
            const distance = Math.sqrt(Math.pow(paddleCenterX - ballCenterX, 2) + Math.pow(paddleRect.top - ballRect.bottom, 2));

            if (distance < 60 && !ballIsOnPaddle) {
                const pullFactor = 0.1;
                ballSpeed.x += (paddleCenterX - ballCenterX) * pullFactor * 0.1;

                // Ograniczenie maksymalnej prędkości w osi X
                ballSpeed.x = Math.max(-5, Math.min(5, ballSpeed.x));
            }
        }

        // Logika przyciągającej paletki
        if (isPaddleAttractive) {
            const paddleRect = paddle.getBoundingClientRect();
            const ballRect = ball.getBoundingClientRect();
            const paddleCenterX = paddleRect.left + paddleRect.width / 2;
            const ballCenterX = ballRect.left + ballRect.width / 2;
            const paddleCenterY = paddleRect.top + paddleRect.height / 2;
            const ballCenterY = ballRect.top + ballRect.height / 2;
            const distance = Math.sqrt(Math.pow(paddleCenterX - ballCenterX, 2) + Math.pow(paddleCenterY - ballCenterY, 2));

            if (distance < 100 && !ballIsOnPaddle) { // 100px zamiast 10px dla lepszego efektu
                const pullFactor = 0.05;
                ballSpeed.x += (paddleCenterX - ballCenterX) * pullFactor;
                ballSpeed.y += (paddleCenterY - ballCenterY) * pullFactor;

                // Ograniczenie maksymalnej prędkości
                ballSpeed.x = Math.max(-5, Math.min(5, ballSpeed.x));
                ballSpeed.y = Math.max(-5, Math.min(5, ballSpeed.y));
            }
        }

        ball.style.left = ballPosition.x + 'px';
        ball.style.top = ballPosition.y + 'px';
    }

    // --- Helper Functions ---
    function resetBall() {
        ballIsOnPaddle = true;
        ballSpeed = { x: 0, y: 0 };
        // Pozycja jest aktualizowana w updateGame, więc nie trzeba jej tu ustawiać
    }

    function launchBall() {
        if (gameActive && ballIsOnPaddle) {
            ballIsOnPaddle = false;
            let angle = (Math.random() * Math.PI / 2) + Math.PI / 4; // Kąt między 45 a 135 stopni
            ballSpeed = { x: 4 * Math.cos(angle), y: -4 * Math.sin(angle) };
            if (Math.random() > 0.5) ballSpeed.x = -ballSpeed.x; // Losowy kierunek w osi X
        }
    }

    function handleBrickRemoval(brick) {
        const brickRect = brick.getBoundingClientRect();
        const gameAreaRect = gameArea.getBoundingClientRect();

        // Oblicz współrzędne względem obszaru gry
        const relativeX = brickRect.left - gameAreaRect.left;
        const relativeY = brickRect.top - gameAreaRect.top;

        createExplosion(relativeX + brickRect.width / 2, relativeY + brickRect.height / 2);
        brick.classList.add('blinking');

        setTimeout(() => {
            if (brick.parentNode) {
                brick.remove();
            }
            const brickIndex = bricks.indexOf(brick);
            if (brickIndex > -1) bricks.splice(brickIndex, 1);

            if (brick.dataset.type === 'magnetic-special') {
                createPowerUp(relativeX, relativeY, 'wide-paddle');
            } else if (Math.random() < 0.3) {
                createPowerUp(relativeX, relativeY);
            }

            // Sprawdź, czy wszystkie klocki zostały zbite
            if (bricksContainer.childElementCount === 0 && !infinityMode) {
                proceedToNextLevel();
            }
        }, 300);
    }

    function showBumEffect() {
        bumElement.style.left = (paddle.offsetLeft + paddle.offsetWidth / 2 - bumElement.offsetWidth / 2) + 'px';
        bumElement.style.top = (paddle.offsetTop - bumElement.offsetHeight - 10) + 'px';
        bumElement.style.display = 'block';
        setTimeout(() => {
            bumElement.style.display = 'none';
        }, 300);
    }

    // --- Event Listeners ---
    startButton.addEventListener('click', () => startActualGame(false));
    infinityModeButton.addEventListener('click', () => startActualGame(true));
    restartGameButton.addEventListener('click', () => startActualGame(false)); // Przycisk "Od początku" restartuje grę
    restartButton.addEventListener('click', () => { // Przycisk na ekranie Game Over
        gameOverDisplay.style.display = 'none';
        startButton.style.display = 'block';
        infinityModeButton.style.display = 'block';
    });

    // Wystrzelenie piłki
    gameArea.addEventListener('click', launchBall);
    gameArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        launchBall();
    });

    // Sterowanie paletką
    const movePaddle = (clientX) => {
        if (!gameActive) return;
        const gameAreaRect = gameArea.getBoundingClientRect();
        paddlePosition = clientX - gameAreaRect.left - paddle.clientWidth / 2;
        paddlePosition = Math.max(0, Math.min(gameArea.clientWidth - paddle.clientWidth, paddlePosition));
        paddle.style.left = paddlePosition + 'px';
    };

    document.addEventListener('mousemove', (e) => movePaddle(e.clientX));
    document.addEventListener('touchmove', (e) => {
        e.preventDefault();
        movePaddle(e.touches[0].clientX)
    });

    // --- Utility Functions ---
    function createBricksForLevel(level) {
        clearBricks();
        const layout = levelLayouts[(level - 1) % levelLayouts.length];
        for (let row = 0; row < layout.length; row++) {
            for (let col = 0; col < layout[row].length; col++) {
                if (layout[row][col] > 0) { // Tworzymy klocek dla wartości > 0
                    const brick = document.createElement('div');
                    brick.classList.add('brick');
                    if (layout[row][col] === 2) {
                        brick.classList.add('magnetic-brick');
                        brick.dataset.type = 'magnetic-special';
                    }
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
        // Upewnij się, że jest jeden magnetyczny klocek
        const allBricks = bricksContainer.querySelectorAll('.brick');
        if (allBricks.length > 0) {
            const randomIndex = Math.floor(Math.random() * allBricks.length);
            allBricks[randomIndex].classList.add('magnetic-brick');
            allBricks[randomIndex].dataset.type = 'magnetic-special';
        }
    }

    function clearBricks() {
        bricksContainer.innerHTML = '';
        bricks = [];
    }

    function createPowerUp(x, y, type) {
        const powerUp = document.createElement('div');
        powerUp.classList.add('power-up');
        powerUp.style.left = x + 'px';
        powerUp.style.top = y + 'px';
        let powerUpType = type;
        if (!powerUpType) {
            powerUpType = Math.random() < 0.5 ? 'slow-ball' : 'large-paddle';
        }
        powerUp.dataset.type = powerUpType;

        if (powerUpType === 'magnetic-paddle') {
            powerUp.textContent = 'M';
            powerUp.style.backgroundColor = 'yellow';
            powerUp.style.color = 'black';
        } else if (powerUpType === 'attractive-paddle') {
            powerUp.textContent = 'K';
            powerUp.style.backgroundColor = 'yellow';
            powerUp.style.color = 'black';
        } else if (powerUpType === 'wide-paddle') {
            powerUp.textContent = 'W';
        } else {
            powerUp.textContent = powerUpType === 'slow-ball' ? 'S' : 'L';
        }

        gameArea.appendChild(powerUp);
        powerUps.push(powerUp);
    }

    function updatePowerUps() {
        powerUps.forEach((powerUp, index) => {
            // Przesuń doładowanie w dół
            powerUp.style.top = (powerUp.offsetTop + 2) + 'px';

            // Usuń, jeśli poza ekranem
            if (powerUp.offsetTop > gameArea.clientHeight) {
                powerUp.remove();
                powerUps.splice(index, 1);
                return; // Przejdź do następnego doładowania
            }

            // Sprawdzenie kolizji przy użyciu właściwości offset
            const paddleLeft = paddle.offsetLeft;
            const paddleRight = paddle.offsetLeft + paddle.offsetWidth;
            const paddleTop = paddle.offsetTop;

            const powerUpLeft = powerUp.offsetLeft;
            const powerUpRight = powerUp.offsetLeft + powerUp.offsetWidth;
            const powerUpBottom = powerUp.offsetTop + powerUp.offsetHeight;

            if (powerUpBottom >= paddleTop &&
                powerUpRight >= paddleLeft &&
                powerUpLeft <= paddleRight) {

                activatePowerUp(powerUp.dataset.type);
                powerUp.remove();
                powerUps.splice(index, 1);
            }
        });
    }

    function activatePowerUp(type) {
        let message = '';
        switch (type) {
            case 'wide-paddle':
                message = 'Szeroka paletka!';
                if (defaultPaddleWidth === null) {
                    defaultPaddleWidth = paddle.offsetWidth;
                }
                if (activePaddleWidthTimeout) {
                    clearTimeout(activePaddleWidthTimeout);
                }
                paddle.style.width = (defaultPaddleWidth + 6) + 'px';
                activePaddleWidthTimeout = setTimeout(() => {
                    paddle.style.width = defaultPaddleWidth + 'px';
                }, 10000);
                break;
            case 'slow-ball':
                message = 'Spowolnienie!';
                ballSpeed.x /= 1.5;
                ballSpeed.y /= 1.5;
                setTimeout(() => {
                    ballSpeed.x *= 1.5;
                    ballSpeed.y *= 1.5;
                }, 5000);
                break;
            case 'large-paddle':
                message = 'Duża paletka!';
                paddle.style.width = '150px';
                setTimeout(() => {
                    paddle.style.width = '100px';
                }, 5000);
                break;
            case 'magnetic-paddle':
                message = 'Magnetyczna paletka!';
                isPaddleMagnetic = true;
                setTimeout(() => {
                    isPaddleMagnetic = false;
                }, 15000); // 15 sekund
                break;
            case 'attractive-paddle':
                message = 'Przyciągająca paletka!';
                isPaddleAttractive = true;
                setTimeout(() => {
                    isPaddleAttractive = false;
                }, 15000); // 15 sekund
                break;
        }
        showPowerUpMessage(message);
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
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('brick-explosion-particle');
            gameArea.appendChild(particle);

            const angle = (i / particleCount) * 2 * Math.PI;
            const speed = Math.random() * 2 + 1;
            let particleX = x;
            let particleY = y;
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
