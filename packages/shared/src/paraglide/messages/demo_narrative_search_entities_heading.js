/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Search_Entities_HeadingInputs */

const en_demo_narrative_search_entities_heading = /** @type {(inputs: Demo_Narrative_Search_Entities_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`What global search covers`)
};

const es_demo_narrative_search_entities_heading = /** @type {(inputs: Demo_Narrative_Search_Entities_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Qué cubre la búsqueda global`)
};

/**
* | output |
* | --- |
* | "What global search covers" |
*
* @param {Demo_Narrative_Search_Entities_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_entities_heading = /** @type {((inputs?: Demo_Narrative_Search_Entities_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Search_Entities_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_search_entities_heading(inputs)
	return es_demo_narrative_search_entities_heading(inputs)
});