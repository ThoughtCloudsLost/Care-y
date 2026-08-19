/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Sort_BodyInputs */

const en_demo_narrative_topic_sort_body = /** @type {(inputs: Demo_Narrative_Topic_Sort_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sort options reorder the ticket list by priority, date, last activity, queue, status, title, assignee, or client.
**Server side fields.** Priority, date, last activity, queue, and message count are sorted on the server using plaintext metadata columns. The server returns rows in the requested order without accessing encrypted content.
**Client side fields.** Title, assignee, status, and client are sorted in the browser after decryption because these values are only readable on the device.
**New replies first.** A toggle in the sort options pins tickets with unread replies to the top of the list, regardless of the primary sort order. Read state is encrypted per volunteer, so the server cannot sort by it and this sort happens entirely in the browser.`)
};

const es_demo_narrative_topic_sort_body = /** @type {(inputs: Demo_Narrative_Topic_Sort_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las opciones de orden reorganizan la lista de tickets por prioridad, fecha, última actividad, cola, estado, título, asignado o cliente.
**Campos del servidor.** Prioridad, fecha, última actividad, cola y cantidad de mensajes se ordenan en el servidor usando columnas de metadatos en texto plano. El servidor devuelve las filas en el orden solicitado sin acceder al contenido cifrado.
**Campos del cliente.** Título, asignado, estado y cliente se ordenan en el navegador después del descifrado porque estos valores solo son legibles en el dispositivo.
**Nuevas respuestas primero.** Un interruptor en las opciones de orden fija los tickets con respuestas no leídas en la parte superior de la lista, independientemente del orden principal. El estado de lectura está cifrado por voluntario, por lo que el servidor no puede ordenar por él y este ordenamiento ocurre completamente en el navegador.`)
};

/**
* | output |
* | --- |
* | "Sort options reorder the ticket list by priority, date, last activity, queue, status, title, assignee, or client. **Server side fields.** Priority, date, las..." |
*
* @param {Demo_Narrative_Topic_Sort_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_sort_body = /** @type {((inputs?: Demo_Narrative_Topic_Sort_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Sort_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_sort_body(inputs)
	return es_demo_narrative_topic_sort_body(inputs)
});