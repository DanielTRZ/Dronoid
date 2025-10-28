
import asyncio
from playwright.async_api import async_playwright
import os

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Użyj pełnej ścieżki do pliku index.html
        file_path = "file://" + os.path.abspath("index.html")
        await page.goto(file_path)

        # Poczekaj, aż gra się załaduje
        await page.wait_for_selector("#startButton")

        # Kliknij przycisk start
        await page.click("#startButton")

        # Poczekaj na aktywację obszaru gry
        await page.wait_for_selector(".game-area.game-active")

        # Kliknij, aby wystrzelić piłkę
        await page.click(".game-area")

        # Poczekaj chwilę, aby piłka uderzyła w klocek
        await page.wait_for_timeout(1000) # 1 sekunda

        # Zrób zrzut ekranu
        await page.screenshot(path="jules-scratch/verification/verification.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
