/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Case_Header_HeadingInputs */

const en_demo_narrative_topic_case_header_heading = /** @type {(inputs: Demo_Narrative_Topic_Case_Header_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Case header`)
};

const es_demo_narrative_topic_case_header_heading = /** @type {(inputs: Demo_Narrative_Topic_Case_Header_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Encabezado del caso`)
};

/**
* | output |
* | --- |
* | "Case header" |
*
* @param {Demo_Narrative_Topic_Case_Header_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_header_heading = /** @type {((inputs?: Demo_Narrative_Topic_Case_Header_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Case_Header_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_case_header_heading(inputs)
	return es_demo_narrative_topic_case_header_heading(inputs)
});