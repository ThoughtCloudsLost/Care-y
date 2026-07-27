/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Sms_HeadingInputs */

const en_demo_narrative_topic_twofa_sms_heading = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Sms_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Text message codes`)
};

const es_demo_narrative_topic_twofa_sms_heading = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Sms_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Codigos por mensaje de texto`)
};

/**
* | output |
* | --- |
* | "Text message codes" |
*
* @param {Demo_Narrative_Topic_Twofa_Sms_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_sms_heading = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Sms_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Sms_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_twofa_sms_heading(inputs)
	return es_demo_narrative_topic_twofa_sms_heading(inputs)
});