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

const en_xa2_demo_narrative_library_attachments_heading = /** @type {(inputs: Demo_Narrative_Library_Attachments_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fìlè àttàchmènts •••••⟧`)
};

/**
* | output |
* | --- |
* | "File attachments" |
*
* @param {Demo_Narrative_Library_Attachments_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_attachments_heading = /** @type {((inputs?: Demo_Narrative_Library_Attachments_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Library_Attachments_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_library_attachments_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_library_attachments_heading(inputs)
	return en_demo_narrative_library_attachments_heading(inputs)
});