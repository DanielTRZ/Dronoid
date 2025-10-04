
document.addEventListener('DOMContentLoaded', () => {
    const paddle = document.getElementById('paddle');
    const ball = document.getElementById('ball');
    const explosion = document.getElementById('explosion');
    const gameArea = document.querySelector('.game-area');
    const scoreDisplay = document.getElementById('score');
    const startButton = document.getElementById('startButton');
    const gameOverDisplay = document.getElementById('gameOver');
    const restartButton = document.getElementById('restartButton');
    const dronoidTitle = document.getElementById('dronoidTitle');
    const pointsMessage = document.getElementById('pointsMessage');
    const finalScoreDisplay = document.getElementById('finalScore');
    const scoreCount = document.getElementById('scoreCount');

    let paddlePosition = (gameArea.clientWidth / 2) - (paddle.clientWidth / 2);
    let ballPosition = { x: gameArea.clientWidth / 2 - 7.5, y: gameArea.clientHeight - 50 };
    let ballSpeed = { x: 2, y: -4 };
    let gameInterval;
    let score = 0;
    let gameActive = false;
    let originalPaddleWidth = paddle.clientWidth;
    let powerUpActive = false;
    let powerUpTimeout;
    let lastPowerUpTime = 0; // Zmienna do przechowywania ostatniego czasu aktywacji power-upu

    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF0000', '#FF33A8','#7FFFD4','#556B2F','#708090'];
    let currentColorIndex = 0;

    function showDronoidTitle() {
        dronoidTitle.style.display = 'block';
        setTimeout(() => {
            dronoidTitle.style.display = 'none';
            startActualGame();
        }, 2500);
    }

    function startActualGame() {
        startButton.style.display = 'none';
        score = 0;
        scoreDisplay.textContent = "Licznik odbić: " + score;
        ballPosition = { x: gameArea.clientWidth / 2 - 7.5, y: gameArea.clientHeight - 50 };
        ball.style.left = ballPosition.x + 'px';
        ball.style.top = ballPosition.y + 'px';
        ballSpeed = { x: 2, y: -4 };
        gameOverDisplay.style.display = 'none';
        gameActive = true;
        paddle.style.width = originalPaddleWidth + 'px';
        clearTimeout(powerUpTimeout); // Resetuje ewentualny poprzedni power-up
        gameInterval = setInterval(updateGame, 10);
    }

    function triggerExplosion(x, y) {
        explosion.style.left = `${x - 50}px`;
        explosion.style.top = `${y - 140}px`;
        explosion.classList.add('active');

        setTimeout(() => {
            explosion.classList.remove('active');
            explosion.classList.add('fade-out');

            setTimeout(() => {
                explosion.classList.remove('fade-out');
            }, 500);
        }, 500);
    }

    function showPointsMessage(score) {
        pointsMessage.textContent = `Gościu zbobyłeś: ${score} odbić`;
        pointsMessage.style.display = 'block';

        setTimeout(() => {
            pointsMessage.style.display = 'none';
        }, 2000);
    }

    function showPowerUpMessage() {
        pointsMessage.textContent = 'Gościu powiększenie!';
        pointsMessage.style.display = 'block';

        setTimeout(() => {
            pointsMessage.style.display = 'none';
        }, 2000);
    }

    function activatePaddlePowerUp() {
        // Zwiększa szerokość paletki
        const newPaddleWidth = originalPaddleWidth * 7.5;
        paddle.style.width = newPaddleWidth + 'px'; 

        // Oblicz nową pozycję
        const gameAreaWidth = gameArea.clientWidth;
        let newRightPosition = (gameAreaWidth / 2) - (newPaddleWidth / 2);
        const maxRightPosition = gameAreaWidth - newPaddleWidth;
        newRightPosition = Math.max(0, Math.min(newRightPosition, maxRightPosition));

        // Ustaw położenie paletki z uwzględnieniem prawa
        paddle.style.right = (gameAreaWidth - newRightPosition) + '0px'; 

        showPowerUpMessage();
        powerUpActive = true;

        powerUpTimeout = setTimeout(() => {
            // Przywraca oryginalny rozmiar paletki i pozycję
            paddle.style.width = originalPaddleWidth + 'px'; 
            paddle.style.right = (gameAreaWidth - ((gameAreaWidth / 2) - (paddle.clientWidth / 2))) + 'px'; // Centruje paletkę ponownie
            powerUpActive = false;
        }, 3000);
    }

    function changeBackgroundColor() {
        currentColorIndex = (currentColorIndex + 1) % colors.length;
        gameArea.style.transition = 'background-color 1s';
        gameArea.style.backgroundColor = colors[currentColorIndex];
    }

    function updateGame() {
        ballPosition.x += ballSpeed.x;
        ballPosition.y += ballSpeed.y;

        if (ballPosition.x <= 0 || ballPosition.x >= gameArea.clientWidth - 50) {
            ballSpeed.x = -ballSpeed.x;
        }

        if (ballPosition.y <= 0) {
            ballSpeed.y = -ballSpeed.y;
        }

        if (ballPosition.y >= gameArea.clientHeight - 10) {
            clearInterval(gameInterval);
            gameActive = false;
            gameOverDisplay.style.display = 'block';
            scoreCount.textContent = score;
            finalScoreDisplay.style.display = 'block';
            finalScoreDisplay.style.opacity = 1;

            setTimeout(() => {
                finalScoreDisplay.style.opacity = 0;
                setTimeout(() => {
                    finalScoreDisplay.style.display = 'none';
                }, 900);
            }, 5000);

            return;
        }

        const paddleRect = paddle.getBoundingClientRect();
        const ballRect = ball.getBoundingClientRect();

        if (
            ballRect.bottom >= paddleRect.top &&
            ballRect.top <= paddleRect.bottom &&
            ballRect.right >= paddleRect.left &&
            ballRect.left <= paddleRect.right &&
            ballSpeed.y > 0
        ) {
            ballSpeed.y = -Math.abs(ballSpeed.y);
            ballPosition.y = paddleRect.top - 200;
            score++;
            scoreDisplay.textContent = "Licznik odbić: " + score;

            triggerExplosion(ballRect.left + ballRect.width / 2, ballRect.top + ballRect.height / 2);

            if (score % 10 === 0 && score > 0) {
                showPointsMessage(score);
                changeBackgroundColor();
            }

            // Sprawdź, czy powiększenie może być aktywowane
            const currentTime = Date.now();
            if (score % 2 === 1 && (currentTime - lastPowerUpTime >= 35000)) { // Nieparzysty licznik i min. 25 sekund
                activatePaddlePowerUp();
                lastPowerUpTime = currentTime; // Ustaw czas aktywacji
            }
        }

        ball.style.left = ballPosition.x + 'px';
        ball.style.top = ballPosition.y + 'px';
    }

    startButton.addEventListener('click', showDronoidTitle);
    restartButton.addEventListener('click', showDronoidTitle);

    document.addEventListener('mousemove', (event) => {
        if (gameActive) {
            const gameAreaRect = gameArea.getBoundingClientRect();
            paddlePosition = event.clientX - gameAreaRect.left - paddle.clientWidth / 2;
            paddlePosition = Math.max(0, Math.min(gameArea.clientWidth - paddle.clientWidth, paddlePosition));
            paddle.style.left = paddlePosition + 'px';
            paddle.style.top = gameArea.clientHeight - 60 + 'px';
        }
    });

    // Obsługa panelu dotykowego
    function handleTouchMove(event) {
        if (gameActive) {
            const gameAreaRect = gameArea.getBoundingClientRect();
            const touch = event.touches[0];
            paddlePosition = touch.clientX - gameAreaRect.left - paddle.clientWidth / 2;
            paddlePosition = Math.max(0, Math.min(gameArea.clientWidth - paddle.clientWidth, paddlePosition));
            paddle.style.left = paddlePosition + 'px';
            paddle.style.top = gameArea.clientHeight - 60 + 'px';
        }
    }

    document.addEventListener('touchmove', handleTouchMove);

    // Gra startuje tylko po wciśnięciu przycisku start
    paddle.style.top = gameArea.clientHeight - 60 + 'px';
});


















