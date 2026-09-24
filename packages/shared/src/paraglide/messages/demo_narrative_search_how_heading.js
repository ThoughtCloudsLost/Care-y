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

const en_xa2_demo_narrative_search_how_heading = /** @type {(inputs: Demo_Narrative_Search_How_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hòw glòbàl sèàrch wòrks •••••••⟧`)
};

/**
* | output |
* | --- |
* | "How global search works" |
*
* @param {Demo_Narrative_Search_How_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_how_heading = /** @type {((inputs?: Demo_Narrative_Search_How_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Search_How_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_search_how_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_search_how_heading(inputs)
	return en_demo_narrative_search_how_heading(inputs)
});