/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Filter_Type_PriorityInputs */

const en_ticket_filter_type_priority = /** @type {(inputs: Ticket_Filter_Type_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Priority Changes`)
};

const es_ticket_filter_type_priority = /** @type {(inputs: Ticket_Filter_Type_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cambios de prioridad`)
};

const en_xa2_ticket_filter_type_priority = /** @type {(inputs: Ticket_Filter_Type_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Prìòrìty Chàngès •••••⟧`)
};

/**
* | output |
* | --- |
* | "Priority Changes" |
*
* @param {Ticket_Filter_Type_PriorityInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_priority = /** @type {((inputs?: Ticket_Filter_Type_PriorityInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Type_PriorityInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_filter_type_priority(inputs)
	if (locale === "en-XA") return en_xa2_ticket_filter_type_priority(inputs)
	return en_ticket_filter_type_priority(inputs)
});