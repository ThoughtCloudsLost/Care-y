/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Dashboard_Queues_HeadingInputs */

const en_demo_narrative_topic_dashboard_queues_heading = /** @type {(inputs: Demo_Narrative_Topic_Dashboard_Queues_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queue overview`)
};

const es_demo_narrative_topic_dashboard_queues_heading = /** @type {(inputs: Demo_Narrative_Topic_Dashboard_Queues_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vista general de colas`)
};

/**
* | output |
* | --- |
* | "Queue overview" |
*
* @param {Demo_Narrative_Topic_Dashboard_Queues_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_dashboard_queues_heading = /** @type {((inputs?: Demo_Narrative_Topic_Dashboard_Queues_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Dashboard_Queues_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_dashboard_queues_heading(inputs)
	return es_demo_narrative_topic_dashboard_queues_heading(inputs)
});