/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Queue: NonNullable<unknown>, tickets: NonNullable<unknown>, queue: NonNullable<unknown> }} Error_Queue_Has_TicketsInputs */

const en_error_queue_has_tickets = /** @type {(inputs: Error_Queue_Has_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Queue} has ${i?.tickets}. Choose a ${i?.queue} to reassign them to.`)
};

const es_error_queue_has_tickets = /** @type {(inputs: Error_Queue_Has_TicketsInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`La ${i?.queue} tiene ${i?.tickets}. Elige una ${i?.queue} para reasignarlos.`)
};

/**
* | output |
* | --- |
* | "{Queue} has {tickets}. Choose a {queue} to reassign them to." |
*
* @param {Error_Queue_Has_TicketsInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_queue_has_tickets = /** @type {((inputs: Error_Queue_Has_TicketsInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Queue_Has_TicketsInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_queue_has_tickets(inputs)
	return es_error_queue_has_tickets(inputs)
});