from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Quiet, directory=str(ROOT)))
Thread(target=server.serve_forever, daemon=True).start()
try:
    with sync_playwright() as p:
        browser = p.chromium.launch(channel='msedge', headless=True)
        for width in [390, 1280]:
            context = browser.new_context(viewport={'width':width, 'height':844}, reduced_motion='reduce')
            context.add_init_script("{const D=Date;window.Date=class extends D{constructor(...a){super(...(a.length?a:['2026-11-17T18:00:00Z']));}static now(){return new D('2026-11-17T18:00:00Z').getTime();}};}")
            page = context.new_page()
            saved, errors = [], []
            page.on('pageerror', lambda e: errors.append(str(e)))
            def capture(route):
                saved.append(route.request.post_data_json)
                route.fulfill(json={'saved':True})
            page.route('**/api/crear-pedido', capture)
            page.goto(f'http://127.0.0.1:{server.server_port}')
            page.locator('#splash').wait_for(state='detached')
            card=page.locator('#feed-paquete-4')
            expect(card).to_contain_text('CrujiDip GRATIS a elegir')
            card.scroll_into_view_if_needed()
            page.wait_for_function("document.querySelector('#feed-paquete-4 img').naturalWidth>0")
            card.locator('.heart-btn').click()
            expect(page.locator('#modal-add-btn')).to_be_disabled()
            page.locator('[data-group="salsa"] [data-value="Verde"]').click()
            expect(page.locator('#modal-add-btn')).to_be_disabled()
            page.locator('[data-group="crujiDip"] [data-value="Miel Picante"]').click()
            expect(page.locator('#modal-item-price')).to_have_text('$254')
            page.locator('#modal-add-btn').click()
            page.locator('#open-cart-btn').click()
            expect(page.locator('.promo-gift')).to_contain_text('Miel Picante')
            page.locator('.qty-btn[data-delta="1"]').click()
            expect(page.locator('.promo-gift')).to_contain_text('2x')
            expect(page.locator('#cart-subtotal')).to_have_text('$508')
            page.reload()
            page.locator('#open-cart-btn').click()
            expect(page.locator('.promo-gift')).to_have_count(1)
            page.locator('.dip-choice-btn').click()
            expect(page.locator('#modal-add-btn')).to_have_text('Guardar elección')
            page.locator('[data-group="salsa"] [data-value="Verde"]').click()
            page.locator('[data-group="crujiDip"] [data-value="Miel Picante"]').click()
            page.locator('#modal-add-btn').click()
            page.locator('#open-cart-btn').click()
            expect(page.locator('.cart-item[data-uid]')).to_have_count(1)
            expect(page.locator('#cart-subtotal')).to_have_text('$508')
            page.locator('#checkout-btn').click()
            page.wait_for_url('**/checkout.html')
            expect(page.locator('#order-summary')).to_contain_text('2x CrujiDip GRATIS · Miel Picante')
            page.locator('#nombre').fill('Prueba local CrujiDip')
            page.locator('#telefono').fill('5555555555')
            page.locator('#opt-recoger').click()
            page.locator('#confirm-btn').click()
            page.wait_for_url('**/confirmacion.html')
            expect(page.locator('#summary-total')).to_have_text('$508')
            message=parse_qs(urlparse(page.locator('#send-whatsapp-btn').get_attribute('href')).query)['text'][0]
            assert '2x CrujiDip GRATIS · Miel Picante ($0 c/u)' in message
            assert 'Salsa: Verde' in message
            assert saved and saved[0]['total']==508
            gift=next(i for i in saved[0]['cart'] if i['tipo']=='promocion')
            assert gift['cantidad']==2 and gift['precioUnitario']==0
            assert not errors, errors
            assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
            print(f'PASS {width}: elección obligatoria, precio, regalo x2, recarga, checkout, WhatsApp y payload; API interceptada')
            context.close()
        browser.close()
finally:
    server.shutdown()
