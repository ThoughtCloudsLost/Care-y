/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Field_Queue_PlaceholderInputs */

const en_ticket_new_field_queue_placeholder = /** @type {(inputs: Ticket_New_Field_Queue_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select a queue`)
};

const es_ticket_new_field_queue_placeholder = /** @type {(inputs: Ticket_New_Field_Queue_PlaceholderInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Seleccionar una cola`)
};

/**
* | output |
* | --- |
* | "Select a queue" |
*
* @param {Ticket_New_Field_Queue_PlaceholderInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_field_queue_placeholder = /** @type {((inputs?: Ticket_New_Field_Queue_PlaceholderInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Field_Queue_PlaceholderInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_field_queue_placeholder(inputs)
	return es_ticket_new_field_queue_placeholder(inputs)
});