/** Centralized radio image selection helper
 * Returns a public URL starting with '/img/' or a station-provided imageUrl
 */
export function stripDiacritics(input: string): string {
  if (!input) return '';
  try {
    // Normalize to NFD and remove combining marks
    return input.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  } catch (e) {
    // Fallback replacements for common accented letters
    return input
      .replace(/[áàäâãÁÀÄÂÃ]/g, 'a')
      .replace(/[éèëêÉÈËÊ]/g, 'e')
      .replace(/[íìïîÍÌÏÎ]/g, 'i')
      .replace(/[óòöôõÓÒÖÔÕ]/g, 'o')
      .replace(/[úùüûÚÙÜÛ]/g, 'u')
      .replace(/[ñÑ]/g, 'n');
  }
}

export function getImageSrcForStation(st: any): string {
  if (!st) return '/img/default.webp';

  // Mapping de mount a imagen local
  const mount = (st.mount ?? st.server_name ?? '').toString().toLowerCase();
  const mountToImg: Record<string, string> = {
    cubandjpro: '/img/cubandjpro.webp',
    radio_reloj: '/img/radioreloj.webp',
    radio_reloj2: '/img/radioreloj.webp',
    radio_rebelde: '/img/radiorebelde.webp',
    radio_taino: '/img/radiotaino.webp',
    radio_progreso: '/img/radioprogreso.webp',
    habana_radio: '/img/radiohabana.webp',
    rhc: '/img/radiohabana.webp',
    radio_enciclopedia: '/img/radio-enciclopedia.webp',
    // Agregá más mounts y sus imágenes aquí si aparecen nuevas radios
  };
  if (mountToImg[mount]) return mountToImg[mount];

  // Fallback: intentar heurística por nombre en listenurl
  const listenurl = (st.listenurl ?? '').toString().toLowerCase();
  for (const key in mountToImg) {
    if (listenurl.includes(key)) return mountToImg[key];
  }

  return '/img/default.webp';
}
