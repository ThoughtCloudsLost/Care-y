/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Filters_BodyInputs */

const en_demo_narrative_topic_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filter by status, queue, priority, assignee, or date range. The server evaluates filters against encrypted metadata indexes. It returns matching rows without learning what the ticket content says.`)
};

const es_demo_narrative_topic_filters_body = /** @type {(inputs: Demo_Narrative_Topic_Filters_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtra por estado, cola, prioridad, asignado o rango de fechas. El servidor evalua los filtros contra indices de metadatos cifrados. Devuelve las filas coincidentes sin saber lo que dice el contenido del ticket.`)
};

/**
* | output |
* | --- |
* | "Filter by status, queue, priority, assignee, or date range. The server evaluates filters against encrypted metadata indexes. It returns matching rows without..." |
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