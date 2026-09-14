/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ count: NonNullable<unknown>, tickets: NonNullable<unknown> }} Ticket_Toast_Bulk_QueueInputs */

const en_ticket_toast_bulk_queue = /** @type {(inputs: Ticket_Toast_Bulk_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Queue updated on ${i?.count} ${i?.tickets}`)
};

const es_ticket_toast_bulk_queue = /** @type {(inputs: Ticket_Toast_Bulk_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cola actualizada en ${i?.count} ${i?.tickets}`)
};

/**
* | output |
* | --- |
* | "Queue updated on {count} {tickets}" |
*
* @param {Ticket_Toast_Bulk_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_bulk_queue = /** @type {((inputs: Ticket_Toast_Bulk_QueueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_Bulk_QueueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_toast_bulk_queue(inputs)
	return en_ticket_toast_bulk_queue(inputs)
});