/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown> }} Error_Cannot_Take_Closed_TicketInputs */

const en_error_cannot_take_closed_ticket = /** @type {(inputs: Error_Cannot_Take_Closed_TicketInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cannot take a closed ${i?.ticket}.`)
};

const es_error_cannot_take_closed_ticket = /** @type {(inputs: Error_Cannot_Take_Closed_TicketInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No se puede tomar un ${i?.ticket} cerrado.`)
};

/**
* | output |
* | --- |
* | "Cannot take a closed {ticket}." |
*
* @param {Error_Cannot_Take_Closed_TicketInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_cannot_take_closed_ticket = /** @type {((inputs: Error_Cannot_Take_Closed_TicketInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Cannot_Take_Closed_TicketInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_cannot_take_closed_ticket(inputs)
	return es_error_cannot_take_closed_ticket(inputs)
});