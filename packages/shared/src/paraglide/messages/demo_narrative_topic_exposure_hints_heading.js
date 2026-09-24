/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Exposure_Hints_HeadingInputs */

const en_demo_narrative_topic_exposure_hints_heading = /** @type {(inputs: Demo_Narrative_Topic_Exposure_Hints_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Channel warnings`)
};

const es_demo_narrative_topic_exposure_hints_heading = /** @type {(inputs: Demo_Narrative_Topic_Exposure_Hints_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Avisos de canal`)
};

const en_xa2_demo_narrative_topic_exposure_hints_heading = /** @type {(inputs: Demo_Narrative_Topic_Exposure_Hints_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chànnèl wàrnìngs •••••⟧`)
};

/**
* | output |
* | --- |
* | "Channel warnings" |
*
* @param {Demo_Narrative_Topic_Exposure_Hints_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_exposure_hints_heading = /** @type {((inputs?: Demo_Narrative_Topic_Exposure_Hints_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Exposure_Hints_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_exposure_hints_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_exposure_hints_heading(inputs)
	return en_demo_narrative_topic_exposure_hints_heading(inputs)
});