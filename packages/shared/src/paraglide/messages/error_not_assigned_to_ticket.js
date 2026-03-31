/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Not_Assigned_To_TicketInputs */

const en_error_not_assigned_to_ticket = /** @type {(inputs: Error_Not_Assigned_To_TicketInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`You are not assigned to this ticket.`)
};

const es_error_not_assigned_to_ticket = /** @type {(inputs: Error_Not_Assigned_To_TicketInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`No estás asignado a este ticket.`)
};

/**
* | output |
* | --- |
* | "You are not assigned to this ticket." |
*
* @param {Error_Not_Assigned_To_TicketInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_not_assigned_to_ticket = /** @type {((inputs?: Error_Not_Assigned_To_TicketInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Not_Assigned_To_TicketInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_not_assigned_to_ticket(inputs)
	return es_error_not_assigned_to_ticket(inputs)
});