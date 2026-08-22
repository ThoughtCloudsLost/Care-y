/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Search_How_HeadingInputs */

const en_demo_narrative_search_how_heading = /** @type {(inputs: Demo_Narrative_Search_How_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`How global search works`)
};

const es_demo_narrative_search_how_heading = /** @type {(inputs: Demo_Narrative_Search_How_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cómo funciona la búsqueda global`)
};

/**
* | output |
* | --- |
* | "How global search works" |
*
* @param {Demo_Narrative_Search_How_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_how_heading = /** @type {((inputs?: Demo_Narrative_Search_How_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Search_How_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_search_how_heading(inputs)
	return es_demo_narrative_search_how_heading(inputs)
});