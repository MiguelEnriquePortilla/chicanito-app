"""Prueba local del pedido: API interceptada, sin envíos reales."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse, parse_qs
from playwright.sync_api import sync_playwright, expect
ROOT = Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}'
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(channel='msedge',headless=True)
        for width in [390,1280]:
            context=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce')
            context.add_init_script("""{const D=Date; window.Date=class extends D {constructor(...a){super(...(a.length?a:['2026-10-08T18:00:00Z']));} static now(){return new D('2026-10-08T18:00:00Z').getTime();}};}""")
            page=context.new_page(); saved=[]; errors=[]
            page.on('pageerror',lambda e:errors.append(str(e)))
            def capture(route):
                saved.append(route.request.post_data_json)
                route.fulfill(json={'saved':True})
            page.route('**/api/crear-pedido',capture)
            page.goto(url)
            page.locator('#splash').wait_for(state='detached')
            expect(page.locator('#seasonal-banner')).to_contain_text('$229')
            assert page.evaluate('PAQUETES[0].precio')==229
            assert page.evaluate("PAQUETES.find(p=>p.id==='paquete-4').precio")==254
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            page.locator('#seasonal-cta').click()
            page.locator('.heart-btn[data-id="cruji-pilon-octubre-2026"]').click()
            page.locator('#open-cart-btn').click()
            expect(page.locator('#cart-subtotal')).to_have_text('$229')
            expect(page.locator('#cart-items')).to_contain_text('250 g de papas gajo GRATIS')
            page.locator('.qty-btn[data-delta="1"]').click()
            expect(page.locator('#cart-subtotal')).to_have_text('$458')
            page.reload(); page.locator('#open-cart-btn').click()
            expect(page.locator('#cart-subtotal')).to_have_text('$458')
            page.locator('#checkout-btn').click(); page.wait_for_url('**/checkout.html')
            page.locator('#nombre').fill('Prueba local octubre'); page.locator('#telefono').fill('5555555555')
            page.locator('#opt-recoger').click(); page.locator('#confirm-btn').click()
            page.wait_for_url('**/confirmacion.html')
            expect(page.locator('#summary-total')).to_have_text('$458')
            message=parse_qs(urlparse(page.locator('#send-whatsapp-btn').get_attribute('href')).query)['text'][0]
            assert '250 g de papas gajo GRATIS por paquete' in message and '$458' in message
            assert saved[0]['cart'][0]['precioUnitario']==229
            assert saved[0]['cart'][0]['cantidad']==2
            assert page.evaluate("applyPromotion(getCart(),new Date('2026-11-01T06:00:00Z')).length")==0
            assert page.evaluate("activeCampaign(new Date('2026-11-01T05:59:59Z')).id")== 'octubre-2026'
            page.goto(url); page.locator('#splash').wait_for(state='detached')
            target=ROOT/'docs'/'promo-octubre';target.mkdir(exist_ok=True)
            page.screenshot(path=str(target/f'inicio-{width}.png'))
            assert not errors,errors
            context.close(); print(f'OK {width}: catálogo, carrito, pedido, WhatsApp y vencimiento')
        browser.close()
finally: server.shutdown()
