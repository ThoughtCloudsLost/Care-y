/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown>, queue: NonNullable<unknown> }} Ticket_Filter_Type_QueueInputs */

const en_ticket_filter_type_queue = /** @type {(inputs: Ticket_Filter_Type_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} Changes`)
};

const es_ticket_filter_type_queue = /** @type {(inputs: Ticket_Filter_Type_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cambios de ${i?.queue}`)
};

const en_xa2_ticket_filter_type_queue = /** @type {(inputs: Ticket_Filter_Type_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue} Chàngès •••⟧`)
};

/**
* | output |
* | --- |
* | "{Queue} Changes" |
*
* @param {Ticket_Filter_Type_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_filter_type_queue = /** @type {((inputs: Ticket_Filter_Type_QueueInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Filter_Type_QueueInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_filter_type_queue(inputs)
	if (locale === "en-XA") return en_xa2_ticket_filter_type_queue(inputs)
	return en_ticket_filter_type_queue(inputs)
});