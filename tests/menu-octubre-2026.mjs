import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root = new URL('../', import.meta.url);
const storage = new Map();
const context = vm.createContext({ Date, Intl, localStorage: {
  getItem: key => storage.get(key) ?? null,
  setItem: (key,value) => storage.set(key,value),
}});
for (const name of ['menu','promotions','cart']) {
  vm.runInContext(await fs.readFile(new URL(`js/${name}.js`,root),'utf8'),context);
}
const evaluate = code => vm.runInContext(code,context);
assert.equal(evaluate('PAQUETES.filter(p=>p.arteMenu).length'),20);
assert.equal(evaluate("PAQUETES.find(p=>p.id==='paquete-9').precio"),89);
assert.equal(evaluate("PAQUETES.find(p=>p.id==='paquete-8-cuarto').precio"),129);
assert.equal(evaluate("PAQUETES.find(p=>p.id==='paquete-8-medio').precio"),249);
assert.equal(evaluate("PAQUETES.find(p=>p.id==='paquete-8-kilo').precio"),459);
assert.equal(evaluate("precioSeleccion(PAQUETES.find(p=>p.id==='crujipieza'),{pieza:'Pechuga'})"),30);
assert.equal(evaluate("precioSeleccion(PAQUETES.find(p=>p.id==='cuarto-rosti-solo'),{corte:'Pechuga y ala'})"),60);
assert.equal(evaluate("productoDisponible(PAQUETES.find(p=>p.id==='cruji-jueves'),new Date('2026-10-16T18:00:00Z'))"),false);
assert.equal(evaluate("productoDisponible(PAQUETES.find(p=>p.id==='cruji-jueves'),new Date('2026-10-15T18:00:00Z'))"),true);
assert.equal(evaluate("A_LA_CARTA.some(p=>/pure|mango|ensalada de col/i.test(p.nombre))"),false);
evaluate("addToCart({tipo:'paquete',refId:'paquete-9',precioUnitario:89});updateCantidad(getCart()[0].uid,2)");
assert.equal(evaluate('getSubtotal(getCart())'),178);
storage.set('chicanito_cart_v1',JSON.stringify([{refId:'paquete-9',precioUnitario:85}]));
assert.equal(evaluate('getCart().length'),0);
assert.equal(storage.get('chicanito_menu_changed'),'1');
const october=evaluate("applyPromotion([{refId:'cruji-pilon-octubre-2026',cantidad:2}],new Date('2026-10-16T18:00:00Z'))");
assert.equal(october[0].precioUnitario,229);
assert.equal(october[0].cantidad,2);
assert.equal(evaluate("applyPromotion([{refId:'cruji-pilon-octubre-2026'}],new Date('2026-11-01T18:00:00Z')).length"),0);
for (const asset of JSON.parse(await fs.readFile(new URL('docs/menu-assets.json',root),'utf8'))) {
  const crypto = await import('node:crypto');
  assert.equal(crypto.createHash('sha256').update(await fs.readFile(new URL(asset.asset,root))).digest('hex'),asset.sha256);
}
console.log('PASS: approved catalog, surcharges, Thursday, old carts, October promotion and 20 original image hashes');
