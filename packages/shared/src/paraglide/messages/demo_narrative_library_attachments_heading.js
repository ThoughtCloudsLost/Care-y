/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Library_Attachments_HeadingInputs */

const en_demo_narrative_library_attachments_heading = /** @type {(inputs: Demo_Narrative_Library_Attachments_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`File attachments`)
};

const es_demo_narrative_library_attachments_heading = /** @type {(inputs: Demo_Narrative_Library_Attachments_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Archivos adjuntos`)
};

/**
* | output |
* | --- |
* | "File attachments" |
*
* @param {Demo_Narrative_Library_Attachments_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_attachments_heading = /** @type {((inputs?: Demo_Narrative_Library_Attachments_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Library_Attachments_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_library_attachments_heading(inputs)
	return es_demo_narrative_library_attachments_heading(inputs)
});