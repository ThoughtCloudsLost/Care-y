/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Dashboard_Queues_BodyInputs */

const en_demo_narrative_topic_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Topic_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tickets are grouped by queue, with live open and urgent counts for each. The numbers come from real queries against the in-browser database and update when you create, close, or reassign a ticket elsewhere in the demo.`)
};

const es_demo_narrative_topic_dashboard_queues_body = /** @type {(inputs: Demo_Narrative_Topic_Dashboard_Queues_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los tickets se agrupan por cola, con conteos de abiertos y urgentes en tiempo real. Los numeros provienen de consultas reales contra la base de datos del navegador y se actualizan al crear, cerrar o reasignar un ticket en otra parte del demo.`)
};

/**
* | output |
* | --- |
* | "Tickets are grouped by queue, with live open and urgent counts for each. The numbers come from real queries against the in-browser database and update when y..." |
*
* @param {Demo_Narrative_Topic_Dashboard_Queues_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_dashboard_queues_body = /** @type {((inputs?: Demo_Narrative_Topic_Dashboard_Queues_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Dashboard_Queues_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_dashboard_queues_body(inputs)
	return es_demo_narrative_topic_dashboard_queues_body(inputs)
});