/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Twofa_Push_HeadingInputs */

const en_demo_narrative_topic_twofa_push_heading = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Push approval`)
};

const es_demo_narrative_topic_twofa_push_heading = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aprobación push`)
};

const en_xa2_demo_narrative_topic_twofa_push_heading = /** @type {(inputs: Demo_Narrative_Topic_Twofa_Push_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Pùsh àppròvàl ••••⟧`)
};

/**
* | output |
* | --- |
* | "Push approval" |
*
* @param {Demo_Narrative_Topic_Twofa_Push_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_twofa_push_heading = /** @type {((inputs?: Demo_Narrative_Topic_Twofa_Push_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Twofa_Push_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_twofa_push_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_twofa_push_heading(inputs)
	return en_demo_narrative_topic_twofa_push_heading(inputs)
});