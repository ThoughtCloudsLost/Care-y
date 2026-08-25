/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Case_Panel_HeadingInputs */

const en_demo_narrative_topic_case_panel_heading = /** @type {(inputs: Demo_Narrative_Topic_Case_Panel_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The full case record`)
};

const es_demo_narrative_topic_case_panel_heading = /** @type {(inputs: Demo_Narrative_Topic_Case_Panel_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El expediente completo`)
};

/**
* | output |
* | --- |
* | "The full case record" |
*
* @param {Demo_Narrative_Topic_Case_Panel_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_case_panel_heading = /** @type {((inputs?: Demo_Narrative_Topic_Case_Panel_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Case_Panel_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_case_panel_heading(inputs)
	return es_demo_narrative_topic_case_panel_heading(inputs)
});