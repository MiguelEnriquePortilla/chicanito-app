"""Pruebas locales: python tests/promotion_flow.py (requiere Playwright y Edge).
No envía WhatsApp ni guarda pedidos reales; intercepta la API local.
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
url = f'http://127.0.0.1:{server.server_port}'
artifacts = ROOT / 'docs' / 'promo-septiembre'
artifacts.mkdir(exist_ok=True)

try:
    with sync_playwright() as pw:
        browser = pw.chromium.launch(channel='msedge', headless=True)
        for eligible in [True, False]:
            context = browser.new_context(viewport={'width': 390, 'height': 844}, reduced_motion='reduce')
            context.add_init_script("""{
              const RealDate = Date;
              window.Date = class extends RealDate {
                constructor(...args) { super(...(args.length ? args : ['2026-09-10T18:00:00Z'])); }
                static now() { return new RealDate('2026-09-10T18:00:00Z').getTime(); }
              };
            }""")
            page = context.new_page()
            errors, saved = [], []
            page.on('pageerror', lambda error: errors.append(str(error)))
            def save(route):
                saved.append(route.request.post_data_json)
                route.fulfill(json={'saved': True})
            page.route('**/api/crear-pedido', save)
            page.goto(url)
            expect(page.locator('#seasonal-banner')).to_be_visible()
            page.locator('#splash').wait_for(state='detached')
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            if eligible:
                page.screenshot(path=str(artifacts / 'inicio.png'))
                page.locator('#seasonal-cta').click()
            product = 'paquete-9' if eligible else 'paquete-10'
            page.locator(f'.heart-btn[data-id="{product}"]').click()
            for group in page.locator('.variant-group').all():
                group.locator('.variant-option').first.click()
            page.locator('#modal-add-btn').click()
            page.locator('#open-cart-btn').click()
            expect(page.locator('.promo-gift')).to_have_count(1 if eligible else 0)
            expect(page.locator('#cart-subtotal')).to_have_text('$85' if eligible else '$99')
            if eligible:
                # Varias unidades no multiplican el regalo; recarga tampoco.
                page.locator('.qty-btn[data-delta="1"]').click()
                expect(page.locator('.promo-gift')).to_have_count(1)
                expect(page.locator('#cart-subtotal')).to_have_text('$170')
                page.reload()
                page.locator('#open-cart-btn').click()
                expect(page.locator('.promo-gift')).to_have_count(1)
                page.locator('.qty-btn[data-delta="-1"]').click()
                page.screenshot(path=str(artifacts / 'carrito.png'))
            page.locator('#checkout-btn').click()
            page.wait_for_url('**/checkout.html')
            expect(page.locator('#summary-subtotal')).to_have_text('$85' if eligible else '$99')
            assert ('Pieza crujiente gratis' in page.locator('#order-summary').inner_text()) == eligible
            page.locator('#nombre').fill('Prueba local')
            page.locator('#telefono').fill('5555555555')
            page.locator('#opt-recoger').click()
            if eligible:
                page.screenshot(path=str(artifacts / 'checkout.png'), full_page=True)
            page.locator('#confirm-btn').click()
            page.wait_for_url('**/confirmacion.html')
            expect(page.locator('#summary-total')).to_have_text('$85' if eligible else '$99')
            href = page.locator('#send-whatsapp-btn').get_attribute('href')
            message = parse_qs(urlparse(href).query)['text'][0]
            assert ('Pieza crujiente gratis' in message) == eligible
            assert saved and sum(i['tipo'] == 'promocion' for i in saved[0]['cart']) == int(eligible)
            if eligible:
                page.screenshot(path=str(artifacts / 'confirmacion.png'), full_page=True)
                result = page.evaluate("""() => {
                  const item = {tipo:'paquete', refId:'paquete-9', cantidad:1, precioUnitario:85};
                  const at = (date) => applyPromotion([item], new Date(date)).length;
                  return [at('2026-09-01T05:59:59Z'), at('2026-09-01T06:00:00Z'),
                    at('2026-10-01T05:59:59Z'), at('2026-10-01T06:00:00Z'),
                    at('2027-09-10T18:00:00Z'), applyPromotion([item,item]).length];
                }""")
                assert result == [1, 2, 2, 1, 1, 3], result
                page.goto(url)
                page.locator('#open-cart-btn').click()
                page.locator('.remove-btn').click()
                expect(page.locator('.promo-gift')).to_have_count(0)
                expect(page.locator('#cart-subtotal')).to_have_text('$0')
                page.evaluate("CAMPAIGNS[0].endsOn = '2026-09-09'; renderSeasonalBanner()")
                expect(page.locator('#seasonal-banner')).to_be_hidden()
            assert not errors, errors
            print(('ELEGIBLE' if eligible else 'NO ELEGIBLE') + ': OK')
            context.close()
        browser.close()
finally:
    server.shutdown()
