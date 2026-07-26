/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Filters_HeadingInputs */

const en_demo_narrative_topic_filters_heading = /** @type {(inputs: Demo_Narrative_Topic_Filters_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtering the ticket list`)
};

const es_demo_narrative_topic_filters_heading = /** @type {(inputs: Demo_Narrative_Topic_Filters_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Filtrando la lista de tickets`)
};

/**
* | output |
* | --- |
* | "Filtering the ticket list" |
*
* @param {Demo_Narrative_Topic_Filters_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_filters_heading = /** @type {((inputs?: Demo_Narrative_Topic_Filters_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Filters_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_filters_heading(inputs)
	return es_demo_narrative_topic_filters_heading(inputs)
});