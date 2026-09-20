/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Bulk_PriorityInputs */

const en_ticket_bulk_priority = /** @type {(inputs: Ticket_Bulk_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Priority`)
};

const es_ticket_bulk_priority = /** @type {(inputs: Ticket_Bulk_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Prioridad`)
};

const en_xa2_ticket_bulk_priority = /** @type {(inputs: Ticket_Bulk_PriorityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Prìòrìty •••⟧`)
};

/**
* | output |
* | --- |
* | "Priority" |
*
* @param {Ticket_Bulk_PriorityInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_bulk_priority = /** @type {((inputs?: Ticket_Bulk_PriorityInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Bulk_PriorityInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_bulk_priority(inputs)
	if (locale === "en-XA") return en_xa2_ticket_bulk_priority(inputs)
	return en_ticket_bulk_priority(inputs)
});