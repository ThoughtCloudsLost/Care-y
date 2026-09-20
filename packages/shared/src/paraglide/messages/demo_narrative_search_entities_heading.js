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

const en_xa2_demo_narrative_search_entities_heading = /** @type {(inputs: Demo_Narrative_Search_Entities_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whàt glòbàl sèàrch còvèrs ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "What global search covers" |
*
* @param {Demo_Narrative_Search_Entities_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_entities_heading = /** @type {((inputs?: Demo_Narrative_Search_Entities_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Search_Entities_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_search_entities_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_search_entities_heading(inputs)
	return en_demo_narrative_search_entities_heading(inputs)
});