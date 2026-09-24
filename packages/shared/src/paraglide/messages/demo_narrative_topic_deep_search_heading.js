/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Deep_Search_HeadingInputs */

const en_demo_narrative_topic_deep_search_heading = /** @type {(inputs: Demo_Narrative_Topic_Deep_Search_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`In thread search`)
};

const es_demo_narrative_topic_deep_search_heading = /** @type {(inputs: Demo_Narrative_Topic_Deep_Search_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Búsqueda en el hilo`)
};

const en_xa2_demo_narrative_topic_deep_search_heading = /** @type {(inputs: Demo_Narrative_Topic_Deep_Search_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ìn thrèàd sèàrch •••••⟧`)
};

/**
* | output |
* | --- |
* | "In thread search" |
*
* @param {Demo_Narrative_Topic_Deep_Search_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_deep_search_heading = /** @type {((inputs?: Demo_Narrative_Topic_Deep_Search_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Deep_Search_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_deep_search_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_deep_search_heading(inputs)
	return en_demo_narrative_topic_deep_search_heading(inputs)
});