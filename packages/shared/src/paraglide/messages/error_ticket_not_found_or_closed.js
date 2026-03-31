/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Ticket_Not_Found_Or_ClosedInputs */

const en_error_ticket_not_found_or_closed = /** @type {(inputs: Error_Ticket_Not_Found_Or_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ticket not found or already closed.`)
};

const es_error_ticket_not_found_or_closed = /** @type {(inputs: Error_Ticket_Not_Found_Or_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ticket no encontrado o ya cerrado.`)
};

/**
* | output |
* | --- |
* | "Ticket not found or already closed." |
*
* @param {Error_Ticket_Not_Found_Or_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_ticket_not_found_or_closed = /** @type {((inputs?: Error_Ticket_Not_Found_Or_ClosedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Ticket_Not_Found_Or_ClosedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_ticket_not_found_or_closed(inputs)
	return es_error_ticket_not_found_or_closed(inputs)
});