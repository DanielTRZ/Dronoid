document.addEventListener('DOMContentLoaded', () => {
    const paddle = document.getElementById('paddle');
    const ball = document.getElementById('ball');
    const gameArea = document.querySelector('.game-area');
    const scoreDisplay = document.getElementById('score');
    const startButton = document.getElementById('startButton');
    const gameOverDisplay = document.getElementById('gameOver');
    const restartButton = document.getElementById('restartButton');
    const dronoidTitle = document.getElementById('dronoidTitle');

    let paddlePosition = (gameArea.clientWidth / 2) - (paddle.clientWidth / 2);
    let ballPosition = { x: gameArea.clientWidth / 2 - 7.5, y: gameArea.clientHeight - 50 };
    let ballSpeed = { x: 2, y: -4 };
    let gameInterval;
    let score = 0;
    let gameActive = false;

    // Pokaż animację tytułu "Dronoid" przed rozpoczęciem gry
    function showDronoidTitle() {
        dronoidTitle.style.display = 'block'; // Pokaż tytuł
        setTimeout(() => {
            dronoidTitle.style.display = 'none'; // Schowaj tytuł po 3 sekundach
            startActualGame(); // Uruchom właściwą grę po animacji
        },3000); // Czas trwania animacji
    }

    // Funkcja uruchamiająca właściwą grę
    function startActualGame() {
        score = 0;
        scoreDisplay.textContent = "Licznik odbić: " + score;
        ballPosition = { x: gameArea.clientWidth / 2 - 7.5, y: gameArea.clientHeight - 50 };
        ball.style.left = ballPosition.x + 'px';
        ball.style.top = ballPosition.y + 'px';
        ballSpeed = { x: 2, y: -4 };
        gameOverDisplay.style.display = 'none';
        gameActive = true;
        gameInterval = setInterval(updateGame, 10); // Rozpocznij aktualizację gry
    }

    function updateGame() {
        ballPosition.x += ballSpeed.x;
        ballPosition.y += ballSpeed.y;

        // Odbicie od lewej i prawej ściany
        if (ballPosition.x <= 0 || ballPosition.x >= gameArea.clientWidth - 15) {
            ballSpeed.x = -ballSpeed.x;
        }

        // Odbicie od górnej ściany
        if (ballPosition.y <= 0) {
            ballSpeed.y = -ballSpeed.y;
        }

        // Jeśli piłka spadnie poniżej paletki (przegrana)
        if (ballPosition.y >= gameArea.clientHeight - 10) {
            clearInterval(gameInterval);
            gameActive = false;
            gameOverDisplay.style.display = 'block';
            return; // Zakończ dalsze przetwarzanie, bo gra jest zakończona
        }

        const paddleRect = paddle.getBoundingClientRect();
        const ballRect = ball.getBoundingClientRect();

        // Sprawdzenie kolizji z paletką, ale tylko gdy piłka się porusza w dół
        if (
            ballRect.bottom >= paddleRect.top &&  // Piłka dotyka górnej części paletki
            ballRect.top <= paddleRect.bottom &&  // Piłka nie przenika przez paletkę pionowo
            ballRect.right >= paddleRect.left &&  // Piłka nie przenika przez lewą stronę paletki
            ballRect.left <= paddleRect.right &&  // Piłka nie przenika przez prawą stronę paletki
            ballSpeed.y > 0 // Piłka porusza się w dół
        ) {
            // Odbicie piłki od paletki
            ballSpeed.y = -Math.abs(ballSpeed.y); // Odbicie piłki w górę
            ballPosition.y = paddleRect.top - 60; // Ustaw piłkę tuż nad paletką, aby nie przeniknęła
            score++;
            scoreDisplay.textContent = "Licznik odbić: " + score;
        }

        // Aktualizacja pozycji piłki
        ball.style.left = ballPosition.x + 'px';
        ball.style.top = ballPosition.y + 'px';
    }

    startButton.addEventListener('click', showDronoidTitle); // Rozpocznij od pokazania tytułu
    restartButton.addEventListener('click', showDronoidTitle); // To samo dla restartu gry

    document.addEventListener('mousemove', (event) => {
        if (gameActive) {
            const gameAreaRect = gameArea.getBoundingClientRect();
            paddlePosition = event.clientX - gameAreaRect.left - paddle.clientWidth / 2;
            paddlePosition = Math.max(0, Math.min(gameArea.clientWidth - paddle.clientWidth, paddlePosition));
            paddle.style.left = paddlePosition + 'px';
            paddle.style.top = gameArea.clientHeight - 60 + 'px'; // Ustawienie paletki wyżej
        }
    });

    // Ustawienie początkowej pozycji paletki
    paddle.style.top = gameArea.clientHeight - 60 + 'px'; // Podnieś paletkę o 60 pikseli
});
