/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Search_Overlay_HeadingInputs */

const en_demo_narrative_search_overlay_heading = /** @type {(inputs: Demo_Narrative_Search_Overlay_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Opening global search`)
};

const es_demo_narrative_search_overlay_heading = /** @type {(inputs: Demo_Narrative_Search_Overlay_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abrir la búsqueda global`)
};

const en_xa2_demo_narrative_search_overlay_heading = /** @type {(inputs: Demo_Narrative_Search_Overlay_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpènìng glòbàl sèàrch •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Opening global search" |
*
* @param {Demo_Narrative_Search_Overlay_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_overlay_heading = /** @type {((inputs?: Demo_Narrative_Search_Overlay_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Search_Overlay_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_search_overlay_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_search_overlay_heading(inputs)
	return en_demo_narrative_search_overlay_heading(inputs)
});