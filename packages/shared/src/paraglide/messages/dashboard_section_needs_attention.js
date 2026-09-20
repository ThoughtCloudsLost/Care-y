/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Dashboard_Section_Needs_AttentionInputs */

const en_dashboard_section_needs_attention = /** @type {(inputs: Dashboard_Section_Needs_AttentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Needs Attention`)
};

const es_dashboard_section_needs_attention = /** @type {(inputs: Dashboard_Section_Needs_AttentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Necesita atención`)
};

const en_xa2_dashboard_section_needs_attention = /** @type {(inputs: Dashboard_Section_Needs_AttentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèèds Àttèntìòn •••••⟧`)
};

/**
* | output |
* | --- |
* | "Needs Attention" |
*
* @param {Dashboard_Section_Needs_AttentionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const dashboard_section_needs_attention = /** @type {((inputs?: Dashboard_Section_Needs_AttentionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Dashboard_Section_Needs_AttentionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_dashboard_section_needs_attention(inputs)
	if (locale === "en-XA") return en_xa2_dashboard_section_needs_attention(inputs)
	return en_dashboard_section_needs_attention(inputs)
});