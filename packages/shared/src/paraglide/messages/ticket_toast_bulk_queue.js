/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown>, count: NonNullable<unknown>, tickets: NonNullable<unknown> }} Ticket_Toast_Bulk_QueueInputs */

const en_ticket_toast_bulk_queue = /** @type {(inputs: Ticket_Toast_Bulk_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} updated on ${i?.count} ${i?.tickets}`)
};

const es_ticket_toast_bulk_queue = /** @type {(inputs: Ticket_Toast_Bulk_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} actualizada en ${i?.count} ${i?.tickets}`)
};

const en_xa2_ticket_toast_bulk_queue = /** @type {(inputs: Ticket_Toast_Bulk_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue} ùpdàtèd òn  ••••${i?.count}  •${i?.tickets}⟧`)
};

/**
* | output |
* | --- |
* | "{Queue} updated on {count} {tickets}" |
*
* @param {Ticket_Toast_Bulk_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_toast_bulk_queue = /** @type {((inputs: Ticket_Toast_Bulk_QueueInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Toast_Bulk_QueueInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_toast_bulk_queue(inputs)
	if (locale === "en-XA") return en_xa2_ticket_toast_bulk_queue(inputs)
	return en_ticket_toast_bulk_queue(inputs)
});