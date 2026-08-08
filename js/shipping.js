// El envío a domicilio es de costo variable según la distancia — ya no hay
// tarifa fija ni envío gratis por monto de compra. El costo real se confirma
// por WhatsApp una vez que se asigna un repartidor. "Recoger en tienda" no
// tiene costo de envío (ver checkout.js, que usa 0 directo para ese caso).
const ENVIO_VARIABLE_MENSAJE = 'Costo variable según la distancia (se confirma por WhatsApp)';

// Devuelve null para representar "costo variable, aún no se sabe".
function calcularEnvio() {
  return null;
}
