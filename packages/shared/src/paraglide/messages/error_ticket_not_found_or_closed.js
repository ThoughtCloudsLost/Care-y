/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Error_Ticket_Not_Found_Or_ClosedInputs */

const en_error_ticket_not_found_or_closed = /** @type {(inputs: Error_Ticket_Not_Found_Or_ClosedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} not found or already closed.`)
};

const es_error_ticket_not_found_or_closed = /** @type {(inputs: Error_Ticket_Not_Found_Or_ClosedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} no encontrado o ya cerrado.`)
};

const en_xa2_error_ticket_not_found_or_closed = /** @type {(inputs: Error_Ticket_Not_Found_Or_ClosedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Ticket} nòt fòùnd òr àlrèàdy clòsèd. •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "{Ticket} not found or already closed." |
*
* @param {Error_Ticket_Not_Found_Or_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_ticket_not_found_or_closed = /** @type {((inputs: Error_Ticket_Not_Found_Or_ClosedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Ticket_Not_Found_Or_ClosedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_ticket_not_found_or_closed(inputs)
	if (locale === "en-XA") return en_xa2_error_ticket_not_found_or_closed(inputs)
	return en_error_ticket_not_found_or_closed(inputs)
});