/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, tickets: NonNullable<unknown> }} Ticket_Toast_Bulk_PriorityInputs */

const en_ticket_toast_bulk_priority = /** @type {(inputs: Ticket_Toast_Bulk_PriorityInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Priority updated on ${i?.count} ${i?.tickets}`)
};

const es_ticket_toast_bulk_priority = /** @type {(inputs: Ticket_Toast_Bulk_PriorityInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Prioridad actualizada en ${i?.count} ${i?.tickets}`)
};

const en_xa2_ticket_toast_bulk_priority = /** @type {(inputs: Ticket_Toast_Bulk_PriorityInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Prìòrìty ùpdàtèd òn  ••••••${i?.count}  •${i?.tickets}⟧`)
};

/**
* | output |
* | --- |
* | "Priority updated on {count} {tickets}" |
*
* @param {Ticket_Toast_Bulk_PriorityInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_bulk_priority = /** @type {((inputs: Ticket_Toast_Bulk_PriorityInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_Bulk_PriorityInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_toast_bulk_priority(inputs)
	if (locale === "en-XA") return en_xa2_ticket_toast_bulk_priority(inputs)
	return en_ticket_toast_bulk_priority(inputs)
});