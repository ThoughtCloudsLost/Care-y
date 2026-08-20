/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Search_HeadingInputs */

const en_demo_narrative_topic_library_search_heading = /** @type {(inputs: Demo_Narrative_Topic_Library_Search_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search within library`)
};

const es_demo_narrative_topic_library_search_heading = /** @type {(inputs: Demo_Narrative_Topic_Library_Search_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Búsqueda dentro de la biblioteca`)
};

/**
* | output |
* | --- |
* | "Search within library" |
*
* @param {Demo_Narrative_Topic_Library_Search_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_search_heading = /** @type {((inputs?: Demo_Narrative_Topic_Library_Search_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Library_Search_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_library_search_heading(inputs)
	return es_demo_narrative_topic_library_search_heading(inputs)
});