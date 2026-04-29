/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Ticket_Already_OpenInputs */

const en_error_ticket_already_open = /** @type {(inputs: Error_Ticket_Already_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This client already has an open ticket.`)
};

const es_error_ticket_already_open = /** @type {(inputs: Error_Ticket_Already_OpenInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este cliente ya tiene un ticket abierto.`)
};

/**
* | output |
* | --- |
* | "This client already has an open ticket." |
*
* @param {Error_Ticket_Already_OpenInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_ticket_already_open = /** @type {((inputs?: Error_Ticket_Already_OpenInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Ticket_Already_OpenInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_ticket_already_open(inputs)
	return es_error_ticket_already_open(inputs)
});