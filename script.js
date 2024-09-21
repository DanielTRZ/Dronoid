

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

    let paddlePosition = (gameArea.clientWidth / 2) - (paddle.clientWidth / 2);
    let ballPosition = { x: gameArea.clientWidth / 2 - 7.5, y: gameArea.clientHeight - 50 };
    let ballSpeed = { x: 2, y: -4 };
    let gameInterval;
    let score = 0;
    let gameActive = false;

    const colors = ['#FF5733', '#33FF57', '#3357FF', '#F0FF33', '#FF33A8']; // Dodaj kolory, które chcesz użyć
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
        pointsMessage.textContent = `Pierwsza liczba punktów: ${score}`;
        pointsMessage.style.display = 'block';

        setTimeout(() => {
            pointsMessage.style.display = 'none';
        }, 2000);
    }

    // Funkcja do zmiany koloru tła
    function changeBackgroundColor() {
        currentColorIndex = (currentColorIndex + 1) % colors.length; // Zmiana koloru
        gameArea.style.transition = 'background-color 1s'; // Płynne przejście
        gameArea.style.backgroundColor = colors[currentColorIndex];
    }

    function updateGame() {
        ballPosition.x += ballSpeed.x;
        ballPosition.y += ballSpeed.y;

        if (ballPosition.x <= 0 || ballPosition.x >= gameArea.clientWidth - 15) {
            ballSpeed.x = -ballSpeed.x;
        }

        if (ballPosition.y <= 0) {
            ballSpeed.y = -ballSpeed.y;
        }

        if (ballPosition.y >= gameArea.clientHeight - 10) {
            clearInterval(gameInterval);
            gameActive = false;
            gameOverDisplay.style.display = 'block';

            const finalScoreDisplay = document.getElementById('finalScore');
            const scoreCount = document.getElementById('scoreCount');
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
            ballPosition.y = paddleRect.top - 150;
            score++;
            scoreDisplay.textContent = "Licznik odbić: " + score;

            triggerExplosion(ballRect.left + ballRect.width / 2, ballRect.top + ballRect.height / 2);

            // Wyświetl komunikat i zmień kolor co 10 punktów
            if (score % 10 === 0 && score > 0) {
                showPointsMessage(score);
                changeBackgroundColor(); // Zmiana koloru tła
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

    paddle.style.top = gameArea.clientHeight - 60 + 'px';
});
