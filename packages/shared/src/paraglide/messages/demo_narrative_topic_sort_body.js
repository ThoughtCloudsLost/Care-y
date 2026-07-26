/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Sort_BodyInputs */

const en_demo_narrative_topic_sort_body = /** @type {(inputs: Demo_Narrative_Topic_Sort_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Sort options reorder tickets by priority, date, activity, or queue. Sorting operates on metadata the server can compare without decrypting content, so the server never sees what is inside each ticket.`)
};

const es_demo_narrative_topic_sort_body = /** @type {(inputs: Demo_Narrative_Topic_Sort_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Las opciones de orden reorganizan los tickets por prioridad, fecha, actividad o cola. El ordenamiento opera sobre metadatos que el servidor puede comparar sin descifrar el contenido, por lo que nunca ve lo que hay dentro de cada ticket.`)
};

/**
* | output |
* | --- |
* | "Sort options reorder tickets by priority, date, activity, or queue. Sorting operates on metadata the server can compare without decrypting content, so the se..." |
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