
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Go to the local game file and wait for it to load
        await page.goto('file://' + __file__.replace('verify_ball_bounce.py', 'index.html'), wait_until='domcontentloaded')

        # Click the game area to start the game
        await page.click('.game-area', position={'x': 200, 'y': 350})

        # Wait for a moment to let the ball travel and hit a brick
        await page.wait_for_timeout(1000)  # 1 second should be enough for the ball to hit the first row

        # Take a screenshot
        await page.screenshot(path='screenshot_ball_bounce.png')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(main())
