/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Search_Overlay_HeadingInputs */

const en_demo_narrative_search_overlay_heading = /** @type {(inputs: Demo_Narrative_Search_Overlay_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Opening search`)
};

const es_demo_narrative_search_overlay_heading = /** @type {(inputs: Demo_Narrative_Search_Overlay_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abrir la busqueda`)
};

/**
* | output |
* | --- |
* | "Opening search" |
*
* @param {Demo_Narrative_Search_Overlay_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_overlay_heading = /** @type {((inputs?: Demo_Narrative_Search_Overlay_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Search_Overlay_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_search_overlay_heading(inputs)
	return es_demo_narrative_search_overlay_heading(inputs)
});