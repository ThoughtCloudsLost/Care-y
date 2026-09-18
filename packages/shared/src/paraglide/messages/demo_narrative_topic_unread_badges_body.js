/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Unread_Badges_BodyInputs */

const en_demo_narrative_topic_unread_badges_body = /** @type {(inputs: Demo_Narrative_Topic_Unread_Badges_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Each ticket in the list shows an unread count when it has messages the volunteer has not yet read. The count reflects new messages since the volunteer last viewed that ticket.
**How read state works.** Each volunteer has an encrypted read cursor per ticket that records how far they have read. A cursor row is created on first open, so the server can see which tickets a volunteer has visited, but the cursor value itself is opaque ciphertext the server cannot read.`)
};

const es_demo_narrative_topic_unread_badges_body = /** @type {(inputs: Demo_Narrative_Topic_Unread_Badges_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada ticket en la lista muestra un conteo de no leídos cuando tiene mensajes que el voluntario aún no ha visto. El conteo refleja los nuevos mensajes desde la última vez que el voluntario vio ese ticket.
**Cómo funciona el estado de lectura.** Cada voluntario tiene un cursor de lectura cifrado por ticket que registra hasta dónde ha leído. Se crea una fila de cursor en la primera apertura, así que el servidor puede ver qué tickets ha visitado un voluntario, pero el valor del cursor en sí es texto cifrado opaco que el servidor no puede leer.`)
};

/**
* | output |
* | --- |
* | "Each ticket in the list shows an unread count when it has messages the volunteer has not yet read. The count reflects new messages since the volunteer last v..." |
*
* @param {Demo_Narrative_Topic_Unread_Badges_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_unread_badges_body = /** @type {((inputs?: Demo_Narrative_Topic_Unread_Badges_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Unread_Badges_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_unread_badges_body(inputs)
	return en_demo_narrative_topic_unread_badges_body(inputs)
});