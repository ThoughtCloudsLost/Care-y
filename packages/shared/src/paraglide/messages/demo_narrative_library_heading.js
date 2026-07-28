/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Library_HeadingInputs */

const en_demo_narrative_library_heading = /** @type {(inputs: Demo_Narrative_Library_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Shared knowledge base`)
};

const es_demo_narrative_library_heading = /** @type {(inputs: Demo_Narrative_Library_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Base de conocimiento compartida`)
};

/**
* | output |
* | --- |
* | "Shared knowledge base" |
*
* @param {Demo_Narrative_Library_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_heading = /** @type {((inputs?: Demo_Narrative_Library_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Library_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_library_heading(inputs)
	return es_demo_narrative_library_heading(inputs)
});