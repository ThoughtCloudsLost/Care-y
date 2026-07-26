/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Search_HeadingInputs */

const en_demo_narrative_search_heading = /** @type {(inputs: Demo_Narrative_Search_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Searching encrypted data`)
};

const es_demo_narrative_search_heading = /** @type {(inputs: Demo_Narrative_Search_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Busqueda en datos cifrados`)
};

/**
* | output |
* | --- |
* | "Searching encrypted data" |
*
* @param {Demo_Narrative_Search_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_heading = /** @type {((inputs?: Demo_Narrative_Search_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Search_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_search_heading(inputs)
	return es_demo_narrative_search_heading(inputs)
});