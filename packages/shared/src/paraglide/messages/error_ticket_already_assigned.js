/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Ticket: NonNullable<unknown>, ticket: NonNullable<unknown> }} Error_Ticket_Already_AssignedInputs */

const en_error_ticket_already_assigned = /** @type {(inputs: Error_Ticket_Already_AssignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Ticket} is already assigned.`)
};

const es_error_ticket_already_assigned = /** @type {(inputs: Error_Ticket_Already_AssignedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`El ${i?.ticket} ya está asignado.`)
};

/**
* | output |
* | --- |
* | "{Ticket} is already assigned." |
*
* @param {Error_Ticket_Already_AssignedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_ticket_already_assigned = /** @type {((inputs: Error_Ticket_Already_AssignedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Ticket_Already_AssignedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_ticket_already_assigned(inputs)
	return es_error_ticket_already_assigned(inputs)
});