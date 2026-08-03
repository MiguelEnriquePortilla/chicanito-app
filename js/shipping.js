// Reglas de envío: gratis en compras de $250 o más; de lo contrario, $30 fijo.
const ENVIO_GRATIS_DESDE = 250;
const COSTO_ENVIO = 30;

function calcularEnvio(subtotal) {
  return subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO;
}
