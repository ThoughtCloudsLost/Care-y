/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Unread_Badges_BodyInputs */

const en_demo_narrative_topic_unread_badges_body = /** @type {(inputs: Demo_Narrative_Topic_Unread_Badges_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Each ticket in the list shows an unread count when it has messages the volunteer has not yet read. The count reflects new messages since the volunteer last viewed that ticket.
**How read state works.** The server tracks the timestamp of the last message each volunteer has seen. This metadata is not encrypted because it contains no message content. It only records a timestamp per volunteer per ticket.
**Pinned rows.** Tickets with unread messages can be pinned to the top of the list using the new replies first toggle, so the most recently active cases are always visible without scrolling.`)
};

const es_demo_narrative_topic_unread_badges_body = /** @type {(inputs: Demo_Narrative_Topic_Unread_Badges_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cada ticket en la lista muestra un conteo de no leídos cuando tiene mensajes que el voluntario aún no ha visto. El conteo refleja los nuevos mensajes desde la última vez que el voluntario vio ese ticket.
**Cómo funciona el estado de lectura.** El servidor rastrea la marca de tiempo del último mensaje que ha visto cada voluntario. Estos metadatos no están cifrados porque no contienen contenido de mensajes. Solo registran una marca de tiempo por voluntario por ticket.
**Filas fijadas.** Los tickets con mensajes no leídos pueden fijarse en la parte superior de la lista usando el interruptor de nuevas respuestas primero, para que los casos más recientemente activos siempre sean visibles sin desplazarse.`)
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
	if (locale === "en") return en_demo_narrative_topic_unread_badges_body(inputs)
	return es_demo_narrative_topic_unread_badges_body(inputs)
});