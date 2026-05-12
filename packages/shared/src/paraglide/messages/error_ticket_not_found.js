/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown> }} Error_Ticket_Not_FoundInputs */

const en_error_ticket_not_found = /** @type {(inputs: Error_Ticket_Not_FoundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} not found.`)
};

const es_error_ticket_not_found = /** @type {(inputs: Error_Ticket_Not_FoundInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} no encontrado.`)
};

/**
* | output |
* | --- |
* | "{Ticket} not found." |
*
* @param {Error_Ticket_Not_FoundInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_ticket_not_found = /** @type {((inputs: Error_Ticket_Not_FoundInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Ticket_Not_FoundInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_ticket_not_found(inputs)
	return es_error_ticket_not_found(inputs)
});