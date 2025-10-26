
from playwright.sync_api import sync_playwright

def run_verification():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the local game file
        page.goto(f"file://{os.path.abspath('index.html')}")

        # Wait for the start button to be visible
        start_button = page.locator("#startButton")
        start_button.wait_for(state="visible")

        # Click the start button
        start_button.click()

        # Wait a moment for the game to initialize and UI elements to appear
        page.wait_for_timeout(500)

        # Take a screenshot
        page.screenshot(path="jules-scratch/verification/game_start_verification.png")

        browser.close()

if __name__ == "__main__":
    import os
    run_verification()
