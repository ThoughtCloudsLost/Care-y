/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Library_Detail_HeadingInputs */

const en_demo_narrative_library_detail_heading = /** @type {(inputs: Demo_Narrative_Library_Detail_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Article detail view`)
};

const es_demo_narrative_library_detail_heading = /** @type {(inputs: Demo_Narrative_Library_Detail_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Vista detallada del artículo`)
};

/**
* | output |
* | --- |
* | "Article detail view" |
*
* @param {Demo_Narrative_Library_Detail_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_detail_heading = /** @type {((inputs?: Demo_Narrative_Library_Detail_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Library_Detail_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_library_detail_heading(inputs)
	return es_demo_narrative_library_detail_heading(inputs)
});