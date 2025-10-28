
import asyncio
from playwright.async_api import async_playwright
import http.server
import socketserver
import threading
import os

PORT = 8000
SCREENSHOT_PATH = "verification.png"

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=".", **kwargs)

def run_server():
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

async def main():
    server_thread = threading.Thread(target=run_server)
    server_thread.daemon = True
    server_thread.start()

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        try:
            await page.goto(f"http://localhost:{PORT}/index.html")

            # Poczekaj, aż gra będzie gotowa
            await page.wait_for_selector('.game-area')

            # Kliknij przycisk start, aby aktywować grę
            await page.click('#startButton')
            await page.wait_for_timeout(500) # Daj grze chwilę na aktywację

            # Uzyskaj wymiary obszaru gry
            game_area_box = await page.locator('.game-area').bounding_box()

            # Przesuń mysz na skrajną lewą pozycję
            await page.mouse.move(game_area_box['x'] + 1, game_area_box['y'] + game_area_box['height'] / 2)
            await page.wait_for_timeout(500) # Poczekaj na ruch paletki

            # Zrób zrzut ekranu
            await page.screenshot(path=SCREENSHOT_PATH)
            print(f"Screenshot saved to {SCREENSHOT_PATH}")

            # Przesuń mysz na skrajną prawą pozycję
            await page.mouse.move(game_area_box['x'] + game_area_box['width'] - 1, game_area_box['y'] + game_area_box['height'] / 2)
            await page.wait_for_timeout(500) # Poczekaj na ruch paletki

            # Zaktualizuj zrzut ekranu
            await page.screenshot(path=SCREENSHOT_PATH)
            print(f"Screenshot updated for right side at {SCREENSHOT_PATH}")

        except Exception as e:
            print(f"An error occurred: {e}")
        finally:
            await browser.close()
            # Serwer zostanie zatrzymany, gdy główny wątek się zakończy

if __name__ == "__main__":
    asyncio.run(main())
