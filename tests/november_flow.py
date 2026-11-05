from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT)))
Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(channel='msedge',headless=True)
  for width,product in [(390,'bravas-rosti-noviembre-2026'),(1280,'bravas-cruji-noviembre-2026')]:
   context=browser.new_context(viewport={'width':width,'height':844},reduced_motion='reduce')
   context.add_init_script("{const D=Date;window.Date=class extends D{constructor(...a){super(...(a.length?a:['2026-11-02T18:00:00Z']));}static now(){return new D('2026-11-02T18:00:00Z').getTime();}};}")
   page=context.new_page();saved=[];errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   def capture(route):
    saved.append(route.request.post_data_json);route.fulfill(json={'saved':True})
   page.route('**/api/crear-pedido',capture)
   page.goto(f'http://127.0.0.1:{server.server_port}')
   page.locator('#splash').wait_for(state='detached')
   expect(page.locator('#seasonal-banner')).to_be_hidden()
   expect(page.locator('.november-promo-copy')).to_contain_text('Bravas Habaneras')
   expect(page.locator('#feed-noviembre-2026')).to_be_visible()
   assert page.locator('.november-promo-art').evaluate('(im)=>im.complete&&im.naturalWidth>0')
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   assert page.locator('.november-promo-options').evaluate('(el)=>el.getBoundingClientRect().bottom<=innerHeight')
   artifacts=ROOT/'docs/promo-noviembre';artifacts.mkdir(exist_ok=True)
   page.screenshot(path=str(artifacts/f'inicio-{width}.png'))
   expect(page.locator('.november-promo-options')).not_to_contain_text('$254')
   assert page.evaluate("PAQUETES.filter(p=>['paquete-3','paquete-4'].includes(p.id)).every(p=>p.precio===254&&p.variantes.length>0)")
   page.locator(f'[data-promo-choice="{product}"]').click()
   expect(page.locator('#variant-modal')).to_be_hidden()
   page.locator('#open-cart-btn').click()
   expect(page.locator('.promo-gift')).to_contain_text('Bravas Habaneras')
   expect(page.locator('#cart-subtotal')).to_have_text('$229')
   page.locator('.qty-btn[data-delta="1"]').click()
   expect(page.locator('#cart-subtotal')).to_have_text('$458')
   page.reload();page.locator('#open-cart-btn').click()
   expect(page.locator('.promo-gift')).to_have_count(1)
   page.locator('#checkout-btn').click();page.wait_for_url('**/checkout.html')
   expect(page.locator('#order-summary')).to_contain_text('Bravas Habaneras')
   page.locator('#nombre').fill('Prueba local noviembre');page.locator('#telefono').fill('5555555555')
   page.locator('#opt-recoger').click();page.locator('#confirm-btn').click()
   page.wait_for_url('**/confirmacion.html')
   expect(page.locator('#summary-total')).to_have_text('$458')
   message=parse_qs(urlparse(page.locator('#send-whatsapp-btn').get_attribute('href')).query)['text'][0]
   assert 'Bravas Habaneras' in message
   assert all(word not in message.lower() for word in ['arroz', 'adobo', 'salsa'])
   paid=next(i for i in saved[0]['cart'] if i['tipo']=='paquete')
   assert paid['detalleVariantes']=='Solo 12 piezas.'
   assert saved and next(i for i in saved[0]['cart'] if i['tipo']=='promocion')['cantidad']==2
   assert not errors,errors
   print(f'OK {width}: arte, seleccion, carrito, checkout, regalo x2 y WhatsApp; API interceptada')
   context.close()
  browser.close()
finally:server.shutdown()
