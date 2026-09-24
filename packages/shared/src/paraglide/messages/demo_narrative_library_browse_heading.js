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

const en_xa2_demo_narrative_library_browse_heading = /** @type {(inputs: Demo_Narrative_Library_Browse_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bròwsìng àrtìclès ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Browsing articles" |
*
* @param {Demo_Narrative_Library_Browse_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_browse_heading = /** @type {((inputs?: Demo_Narrative_Library_Browse_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Library_Browse_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_library_browse_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_library_browse_heading(inputs)
	return en_demo_narrative_library_browse_heading(inputs)
});