/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Filters_BodyInputs */

const en_demo_narrative_topic_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filter pills narrow the ticket list by status, queue, priority, assignee, date range, or unread state. Multiple filters can be active at once.
**Server side filters.** Status, queue, priority, assignee, on hold state, and date range are evaluated on the server using plaintext metadata columns. The server returns matching rows without accessing encrypted ticket content.
**Client side filters.** Unread and needs attention filters run in the browser because read state is per volunteer and not queryable by the server.
**Unread filter.** A dedicated filter shows only tickets with unread messages. Combined with the new replies first sort option, this gives volunteers a focused view of cases that need attention.`)
};

const es_demo_narrative_topic_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las pastillas de filtro reducen la lista de tickets por estado, cola, prioridad, asignado, rango de fechas o estado de lectura. Se pueden activar varios filtros a la vez.
**Filtros del servidor.** Estado, cola, prioridad, asignado, estado de espera y rango de fechas se evalúan en el servidor usando columnas de metadatos en texto plano. El servidor devuelve las filas coincidentes sin acceder al contenido cifrado del ticket.
**Filtros del cliente.** Los filtros de no leídos y necesita atención se ejecutan en el navegador porque el estado de lectura es por voluntario y no puede ser consultado por el servidor.
**Filtro de no leídos.** Un filtro dedicado muestra solo los tickets con mensajes no leídos. Combinado con la opción de nuevas respuestas primero, esto da a los voluntarios una vista enfocada de los casos que necesitan atención.`)
};

/**
* | output |
* | --- |
* | "Filter pills narrow the ticket list by status, queue, priority, assignee, date range, or unread state. Multiple filters can be active at once. **Server side ..." |
*
* @param {Demo_Narrative_Topic_Filters_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_filters_body = /** @type {((inputs?: Demo_Narrative_Topic_Filters_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Filters_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_filters_body(inputs)
	return es_demo_narrative_topic_filters_body(inputs)
});