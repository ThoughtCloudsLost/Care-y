/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_Bulk_QueueInputs */

const en_ticket_bulk_queue = /** @type {(inputs: Ticket_Bulk_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Queue`)
};

const es_ticket_bulk_queue = /** @type {(inputs: Ticket_Bulk_QueueInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cola`)
};

/**
* | output |
* | --- |
* | "Queue" |
*
* @param {Ticket_Bulk_QueueInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_bulk_queue = /** @type {((inputs?: Ticket_Bulk_QueueInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Bulk_QueueInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_bulk_queue(inputs)
	return en_ticket_bulk_queue(inputs)
});