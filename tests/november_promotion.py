from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
with sync_playwright() as p:
 browser=p.chromium.launch(channel='msedge',headless=True)
 page=browser.new_page()
 page.add_script_tag(content=(ROOT/'js/promotions.js').read_text(encoding='utf8'))
 result=page.evaluate("""() => {
 const date=new Date('2026-11-02T18:00:00Z');
 if(activeCampaign(date)?.id!=='noviembre-2026') throw Error('Falta campa?a noviembre');
 const item=(id,n=1)=>({tipo:'paquete',refId:id,cantidad:n,precioUnitario:254});
 const cart=[item('bravas-rosti-noviembre-2026',2),item('bravas-cruji-noviembre-2026'),item('paquete-9')];
 if(applyPromotion([item('bravas-rosti-noviembre-2026')],date)[0].precioUnitario!==229)throw Error('Precio antiguo en carrito');
 if(applyPromotion([{...item('bravas-cruji-noviembre-2026'),precioUnitario:229}],new Date('2026-12-01T06:00:00Z')).length)throw Error('Precio fuera de vigencia');
 const gifted=applyPromotion(cart,date), gift=gifted.find(i=>i.tipo==='promocion');
 if(gift?.cantidad!==3||!gift.nombre.includes('Bravas Habaneras'))throw Error('Regalo o cantidad incorrecta');
 if(applyPromotion(gifted,date).filter(i=>i.tipo==='promocion').length!==1)throw Error('Regalo duplicado');
 if(applyPromotion([item('paquete-9')],date).length!==1)throw Error('Producto no elegible');
 for(const at of ['2026-11-01T05:59:59Z','2026-12-01T06:00:00Z','2027-11-02T18:00:00Z'])
 if(applyPromotion([item('bravas-rosti-noviembre-2026')],new Date(at)).some(i=>i.tipo==='promocion'))throw Error('Fuera de vigencia');
 for(const at of ['2026-11-01T06:00:00Z','2026-12-01T05:59:59Z'])
 if(!applyPromotion([item('bravas-rosti-noviembre-2026')],new Date(at)).some(i=>i.tipo==='promocion'))throw Error('Limite de vigencia');
 if(applyPromotion([item('paquete-3'),item('paquete-4'),item('cruji-jueves')],date).some(i=>i.tipo==='promocion'))throw Error('Paquete regular confundido con promo');
 const legacy=applyPromotion([{...item('paquete-3'),precioUnitario:229,detalleVariantes:'Arroz: Rojo - Adobo: BBQ'}],date)[0];
 if(legacy.refId!=='bravas-rosti-noviembre-2026'||legacy.detalleVariantes!=='Solo 12 piezas.')throw Error('Opciones antiguas conservadas');
 return 'Noviembre: elegibilidad, cantidades, no duplicados y vigencia CDMX OK';
 }""")
 print(result)
 browser.close()
