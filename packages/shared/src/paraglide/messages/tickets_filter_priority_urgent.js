/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Tickets_Filter_Priority_UrgentInputs */

const en_tickets_filter_priority_urgent = /** @type {(inputs: Tickets_Filter_Priority_UrgentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Urgent`)
};

const es_tickets_filter_priority_urgent = /** @type {(inputs: Tickets_Filter_Priority_UrgentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Urgente`)
};

const en_xa2_tickets_filter_priority_urgent = /** @type {(inputs: Tickets_Filter_Priority_UrgentInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ùrgènt ••⟧`)
};

/**
* | output |
* | --- |
* | "Urgent" |
*
* @param {Tickets_Filter_Priority_UrgentInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const tickets_filter_priority_urgent = /** @type {((inputs?: Tickets_Filter_Priority_UrgentInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Tickets_Filter_Priority_UrgentInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_tickets_filter_priority_urgent(inputs)
	if (locale === "en-XA") return en_xa2_tickets_filter_priority_urgent(inputs)
	return en_tickets_filter_priority_urgent(inputs)
});