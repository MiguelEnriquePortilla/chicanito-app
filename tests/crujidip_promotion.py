from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
with sync_playwright() as p:
    browser = p.chromium.launch(channel='msedge', headless=True)
    page = browser.new_page()
    page.add_script_tag(content=(ROOT / 'js/menu.js').read_text(encoding='utf8'))
    page.add_script_tag(content=(ROOT / 'js/promotions.js').read_text(encoding='utf8'))
    print(page.evaluate('''() => {
      const assert = (ok, message) => { if (!ok) throw Error(message); };
      const date = new Date('2026-11-17T18:00:00Z');
      const item = (id, cantidad=1, dip='Diablo Chicanito') => ({
        uid:id+dip, tipo:'paquete', refId:id, cantidad, precioUnitario:254,
        nombre:'Cruji Doce', crujiDip:dip, detalleVariantes:'Salsa: Verde'
      });
      assert(isCrujiDipPromotion(date), 'Falta vigencia CrujiDip');
      refreshSeasonalProducts(date);
      const product = PAQUETES.find(p=>p.id==='paquete-4');
      assert(product.precio===254, 'Cambió el precio');
      assert(product.variantes.find(g=>g.id==='crujiDip').opciones.length===7, 'Faltan sabores');
      const cart = [item('paquete-4',2),item('paquete-4',1,'Miel Picante'),item('paquete-3')];
      const result = applyPromotion(cart,date);
      const gifts = result.filter(i=>i.refId==='crujidip-noviembre-2026');
      assert(gifts.length===2 && gifts.reduce((s,i)=>s+i.cantidad,0)===3, 'Regalo por sabor/cantidad incorrecto');
      assert(gifts.every(i=>i.precioUnitario===0), 'Se cobró dip');
      assert(applyPromotion(result,date).filter(i=>i.refId==='crujidip-noviembre-2026').length===2, 'Regalos duplicados');
      assert(!applyPromotion([item('paquete-3')],date).some(i=>i.refId==='crujidip-noviembre-2026'), 'Paquete no elegible');
      assert(!applyPromotion([item('paquete-4',1,'Inventado')],date).some(i=>i.tipo==='promocion'), 'Sabor inválido');
      const previousBravas = [
        item('bravas-cruji-noviembre-2026'),
        item('bravas-rosti-noviembre-2026'),
        {...item('paquete-3'), precioUnitario:229},
        {...item('paquete-4'), precioUnitario:229},
        {tipo:'promocion', refId:'noviembre-2026'}
      ];
      assert(applyPromotion(previousBravas,date).length===0, 'Quedaron Bravas en el carrito');
      assert(!PAQUETES.some(p=>p.id.startsWith('bravas-')), 'Quedaron fichas Bravas');
      for(const at of ['2026-11-01T05:59:59Z','2026-12-01T06:00:00Z','2027-11-17T18:00:00Z']) {
        const expired=applyPromotion(result,new Date(at));
        assert(!expired.some(i=>i.refId==='crujidip-noviembre-2026'), 'Regalo fuera de vigencia');
        refreshSeasonalProducts(new Date(at));
        assert(!product.variantes.some(g=>g.id==='crujiDip'), 'Selector fuera de vigencia');
      }
      for(const at of ['2026-11-01T06:00:00Z','2026-12-01T05:59:59Z'])
        assert(applyPromotion([item('paquete-4')],new Date(at)).some(i=>i.refId==='crujidip-noviembre-2026'), 'Límite CDMX incorrecto');
      return 'PASS CrujiDip: sabores, cantidad, cero costo, idempotencia, exclusión, retiro de Bravas y vigencia CDMX';
    }'''))
    browser.close()
