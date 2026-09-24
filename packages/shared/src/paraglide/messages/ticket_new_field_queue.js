/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown> }} Ticket_New_Field_QueueInputs */

const en_ticket_new_field_queue = /** @type {(inputs: Ticket_New_Field_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue}`)
};

const es_ticket_new_field_queue = /** @type {(inputs: Ticket_New_Field_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue}`)
};

const en_xa2_ticket_new_field_queue = /** @type {(inputs: Ticket_New_Field_QueueInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Queue}⟧`)
};

/**
* | output |
* | --- |
* | "{Queue}" |
*
* @param {Ticket_New_Field_QueueInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_queue = /** @type {((inputs: Ticket_New_Field_QueueInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Field_QueueInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_field_queue(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_field_queue(inputs)
	return en_ticket_new_field_queue(inputs)
});