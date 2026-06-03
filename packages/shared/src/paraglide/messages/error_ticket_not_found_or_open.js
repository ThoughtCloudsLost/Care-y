/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Error_Ticket_Not_Found_Or_OpenInputs */

const en_error_ticket_not_found_or_open = /** @type {(inputs: Error_Ticket_Not_Found_Or_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} not found or already open.`)
};

const es_error_ticket_not_found_or_open = /** @type {(inputs: Error_Ticket_Not_Found_Or_OpenInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} no encontrado o ya abierto.`)
};

/**
* | output |
* | --- |
* | "{Ticket} not found or already open." |
*
* @param {Error_Ticket_Not_Found_Or_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_ticket_not_found_or_open = /** @type {((inputs: Error_Ticket_Not_Found_Or_OpenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Ticket_Not_Found_Or_OpenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_ticket_not_found_or_open(inputs)
	return es_error_ticket_not_found_or_open(inputs)
});