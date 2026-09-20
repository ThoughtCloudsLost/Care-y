/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_Priority_NormalInputs */

const en_tickets_filter_priority_normal = /** @type {(inputs: Tickets_Filter_Priority_NormalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Normal`)
};

const es_tickets_filter_priority_normal = /** @type {(inputs: Tickets_Filter_Priority_NormalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Normal`)
};

const en_xa2_tickets_filter_priority_normal = /** @type {(inputs: Tickets_Filter_Priority_NormalInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nòrmàl ••⟧`)
};

/**
* | output |
* | --- |
* | "Normal" |
*
* @param {Tickets_Filter_Priority_NormalInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_priority_normal = /** @type {((inputs?: Tickets_Filter_Priority_NormalInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_Priority_NormalInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter_priority_normal(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter_priority_normal(inputs)
	return en_tickets_filter_priority_normal(inputs)
});