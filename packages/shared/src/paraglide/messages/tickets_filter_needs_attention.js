/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_Needs_AttentionInputs */

const en_tickets_filter_needs_attention = /** @type {(inputs: Tickets_Filter_Needs_AttentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Needs attention`)
};

const es_tickets_filter_needs_attention = /** @type {(inputs: Tickets_Filter_Needs_AttentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Necesita atención`)
};

const en_xa2_tickets_filter_needs_attention = /** @type {(inputs: Tickets_Filter_Needs_AttentionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nèèds àttèntìòn •••••⟧`)
};

/**
* | output |
* | --- |
* | "Needs attention" |
*
* @param {Tickets_Filter_Needs_AttentionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_needs_attention = /** @type {((inputs?: Tickets_Filter_Needs_AttentionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_Needs_AttentionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter_needs_attention(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter_needs_attention(inputs)
	return en_tickets_filter_needs_attention(inputs)
});