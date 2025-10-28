
import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Construct the file path to index.html
        file_path = "file://" + os.path.abspath("index.html")

        # Navigate to the local HTML file
        await page.goto(file_path)

        # Wait for the game area to be visible to ensure the page is fully loaded
        await page.wait_for_selector('.game-area')

        # Take a screenshot and save it
        screenshot_path = "jules-scratch/verification/verification.png"
        await page.screenshot(path=screenshot_path)

        print(f"Screenshot saved to {screenshot_path}")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
