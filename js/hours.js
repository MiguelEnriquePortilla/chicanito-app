// Horario de servicio de la app: 9:00 a 18:00, hora de Ciudad de México.
const HORA_APERTURA = 9;
const HORA_CIERRE = 18;

function horaActualCDMX() {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Mexico_City',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const hora = Number(partes.find((p) => p.type === 'hour').value);
  const minuto = Number(partes.find((p) => p.type === 'minute').value);
  return hora + minuto / 60;
}

function estaAbierto() {
  const hora = horaActualCDMX();
  return hora >= HORA_APERTURA && hora < HORA_CIERRE;
}
