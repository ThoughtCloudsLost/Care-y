/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Ticket_New_Error_Queue_RequiredInputs */

const en_ticket_new_error_queue_required = /** @type {(inputs: Ticket_New_Error_Queue_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Select a queue`)
};

const es_ticket_new_error_queue_required = /** @type {(inputs: Ticket_New_Error_Queue_RequiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Selecciona una cola`)
};

/**
* | output |
* | --- |
* | "Select a queue" |
*
* @param {Ticket_New_Error_Queue_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_new_error_queue_required = /** @type {((inputs?: Ticket_New_Error_Queue_RequiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Error_Queue_RequiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_new_error_queue_required(inputs)
	return es_ticket_new_error_queue_required(inputs)
});