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

const en_xa2_demo_narrative_topic_case_header_heading = /** @type {(inputs: Demo_Narrative_Topic_Case_Header_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càsè hèàdèr ••••⟧`)
};

/**
* | output |
* | --- |
* | "Case header" |
*
* @param {Demo_Narrative_Topic_Case_Header_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_header_heading = /** @type {((inputs?: Demo_Narrative_Topic_Case_Header_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Case_Header_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_case_header_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_case_header_heading(inputs)
	return en_demo_narrative_topic_case_header_heading(inputs)
});