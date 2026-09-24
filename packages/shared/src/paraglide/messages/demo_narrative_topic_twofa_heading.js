/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_HeadingInputs */

const en_demo_narrative_topic_twofa_heading = /** @type {(inputs: Demo_Narrative_Topic_Twofa_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Two factor authentication`)
};

const es_demo_narrative_topic_twofa_heading = /** @type {(inputs: Demo_Narrative_Topic_Twofa_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Autenticación de dos factores`)
};

const en_xa2_demo_narrative_topic_twofa_heading = /** @type {(inputs: Demo_Narrative_Topic_Twofa_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Twò fàctòr àùthèntìcàtìòn ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Two factor authentication" |
*
* @param {Demo_Narrative_Topic_Twofa_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_heading = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_twofa_heading(inputs)
	return en_demo_narrative_topic_twofa_heading(inputs)
});