/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Client_Share_One_Time_BodyInputs */

const en_demo_narrative_client_share_one_time_body = /** @type {(inputs: Demo_Narrative_Client_Share_One_Time_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Each share link works only once. After the content has been shown, the server deletes the ciphertext in the same transaction that records the open, so the encrypted content no longer exists on the server at all.
**Expiry.** Share links carry a 72 hour time window, and a daily cleanup deletes expired entries. If the link is not opened before the window closes, the page shows an expired state instead.
**When it is empty.** Beyond the success case, the page distinguishes four end states. An already opened state means the link has been consumed, whether by the intended reader returning or by someone else. An expired state means the time window closed. A not found state covers both a cleaned up link and an ID that never existed, so probing a share ID reveals nothing. An incomplete link state covers a truncated or corrupted URL, which is the likeliest real failure since these links arrive by SMS and the message may be split, and the page asks the reader to check they opened the complete link.
**Why single use matters.** Single use access means that if the link is intercepted after the intended reader has opened it, the interceptor finds only the consumed state and the ciphertext is gone from the server rather than merely inaccessible. It does not protect against interception before the reader opens it.`)
};

const es_demo_narrative_client_share_one_time_body = /** @type {(inputs: Demo_Narrative_Client_Share_One_Time_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada enlace compartido funciona solo una vez. Después de que el contenido se ha mostrado, el servidor elimina el texto cifrado en la misma transacción que registra la apertura, de modo que el contenido cifrado deja de existir en el servidor por completo.
**Expiración.** Los enlaces compartidos llevan una ventana de tiempo de 72 horas, y una limpieza diaria elimina las entradas expiradas. Si el enlace no se abre antes de que la ventana se cierre, la página muestra un estado de expirado.
**Cuando está vacío.** Además del caso de éxito, la página distingue cuatro estados finales. Un estado de ya abierto significa que el enlace fue consumido, ya sea por el lector previsto que regresó o por otra persona. Un estado de expirado significa que la ventana de tiempo se cerró. Un estado de no encontrado cubre tanto un enlace limpiado como un identificador que nunca existió, de modo que sondear un identificador de enlace no revela nada. Un estado de enlace incompleto cubre una URL truncada o corrupta, que es el fallo más probable en la práctica ya que estos enlaces llegan por SMS y el mensaje puede dividirse, y la página pide al lector que compruebe que abrió el enlace completo.
**Por qué importa el uso único.** El acceso de un solo uso significa que si el enlace es interceptado después de que el lector previsto lo ha abierto, el interceptor encuentra solo el estado de consumido y el texto cifrado ya no está en el servidor en lugar de simplemente ser inaccesible. No protege contra la interceptación antes de que el lector lo abra.`)
};

/**
* | output |
* | --- |
* | "Each share link works only once. After the content has been shown, the server deletes the ciphertext in the same transaction that records the open, so the en..." |
*
* @param {Demo_Narrative_Client_Share_One_Time_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_client_share_one_time_body = /** @type {((inputs?: Demo_Narrative_Client_Share_One_Time_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Client_Share_One_Time_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_client_share_one_time_body(inputs)
	return en_demo_narrative_client_share_one_time_body(inputs)
});