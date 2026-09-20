/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ queue: NonNullable<unknown> }} Ticket_New_Error_Queue_RequiredInputs */

const en_ticket_new_error_queue_required = /** @type {(inputs: Ticket_New_Error_Queue_RequiredInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Select a ${i?.queue}`)
};

const es_ticket_new_error_queue_required = /** @type {(inputs: Ticket_New_Error_Queue_RequiredInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Selecciona una ${i?.queue}`)
};

const en_xa2_ticket_new_error_queue_required = /** @type {(inputs: Ticket_New_Error_Queue_RequiredInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Sèlèct à  •••${i?.queue}⟧`)
};

/**
* | output |
* | --- |
* | "Select a {queue}" |
*
* @param {Ticket_New_Error_Queue_RequiredInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const ticket_new_error_queue_required = /** @type {((inputs: Ticket_New_Error_Queue_RequiredInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_New_Error_Queue_RequiredInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_ticket_new_error_queue_required(inputs)
	if (locale === "en-XA") return en_xa2_ticket_new_error_queue_required(inputs)
	return en_ticket_new_error_queue_required(inputs)
});