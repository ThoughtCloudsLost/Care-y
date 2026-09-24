/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_PriorityInputs */

const en_tickets_filter_priority = /** @type {(inputs: Tickets_Filter_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Priority`)
};

const es_tickets_filter_priority = /** @type {(inputs: Tickets_Filter_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Prioridad`)
};

const en_xa2_tickets_filter_priority = /** @type {(inputs: Tickets_Filter_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Prìòrìty •••⟧`)
};

/**
* | output |
* | --- |
* | "Priority" |
*
* @param {Tickets_Filter_PriorityInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_priority = /** @type {((inputs?: Tickets_Filter_PriorityInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_PriorityInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter_priority(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter_priority(inputs)
	return en_tickets_filter_priority(inputs)
});