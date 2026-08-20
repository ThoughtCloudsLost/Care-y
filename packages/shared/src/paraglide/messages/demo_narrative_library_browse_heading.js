/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Library_Browse_HeadingInputs */

const en_demo_narrative_library_browse_heading = /** @type {(inputs: Demo_Narrative_Library_Browse_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Browsing articles`)
};

const es_demo_narrative_library_browse_heading = /** @type {(inputs: Demo_Narrative_Library_Browse_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Navegar artículos`)
};

/**
* | output |
* | --- |
* | "Browsing articles" |
*
* @param {Demo_Narrative_Library_Browse_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_browse_heading = /** @type {((inputs?: Demo_Narrative_Library_Browse_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Library_Browse_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_library_browse_heading(inputs)
	return es_demo_narrative_library_browse_heading(inputs)
});