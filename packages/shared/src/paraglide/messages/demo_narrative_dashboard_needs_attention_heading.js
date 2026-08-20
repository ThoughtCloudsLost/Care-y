/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Dashboard_Needs_Attention_HeadingInputs */

const en_demo_narrative_dashboard_needs_attention_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Needs_Attention_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Needs attention`)
};

const es_demo_narrative_dashboard_needs_attention_heading = /** @type {(inputs: Demo_Narrative_Dashboard_Needs_Attention_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Necesita atención`)
};

/**
* | output |
* | --- |
* | "Needs attention" |
*
* @param {Demo_Narrative_Dashboard_Needs_Attention_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_dashboard_needs_attention_heading = /** @type {((inputs?: Demo_Narrative_Dashboard_Needs_Attention_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Dashboard_Needs_Attention_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_dashboard_needs_attention_heading(inputs)
	return es_demo_narrative_dashboard_needs_attention_heading(inputs)
});