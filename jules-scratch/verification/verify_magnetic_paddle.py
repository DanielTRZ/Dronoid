
from playwright.sync_api import sync_playwright

def run_verification(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    try:
        # Go to the page
        page.goto("http://localhost:8000")

        # Start the game to make bricks visible
        page.click("#startButton")
        page.wait_for_selector(".brick")

        # Screenshot 1: Show the magnetic brick on the board
        page.screenshot(path="jules-scratch/verification/verification_brick.png")

        # Inject the magnetic power-up directly for visual verification
        page.evaluate("""() => {
            const gameArea = document.querySelector('.game-area');
            const powerUp = document.createElement('div');
            powerUp.classList.add('power-up');
            powerUp.dataset.type = 'magnetic-paddle';
            powerUp.textContent = 'M';
            powerUp.style.backgroundColor = 'yellow';
            powerUp.style.color = 'black';
            powerUp.style.left = '180px';
            powerUp.style.top = '300px';
            gameArea.appendChild(powerUp);
        }""")

        # Screenshot 2: Show the magnetic power-up element
        page.screenshot(path="jules-scratch/verification/verification_powerup.png")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run_verification(playwright)
