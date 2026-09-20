/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ ticket: NonNullable<unknown> }} Error_Not_Assigned_To_TicketInputs */

const en_error_not_assigned_to_ticket = /** @type {(inputs: Error_Not_Assigned_To_TicketInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`You are not assigned to this ${i?.ticket}.`)
};

const es_error_not_assigned_to_ticket = /** @type {(inputs: Error_Not_Assigned_To_TicketInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No estás asignado a este ${i?.ticket}.`)
};

const en_xa2_error_not_assigned_to_ticket = /** @type {(inputs: Error_Not_Assigned_To_TicketInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Yòù àrè nòt àssìgnèd tò thìs  •••••••••${i?.ticket}. •⟧`)
};

/**
* | output |
* | --- |
* | "You are not assigned to this {ticket}." |
*
* @param {Error_Not_Assigned_To_TicketInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_not_assigned_to_ticket = /** @type {((inputs: Error_Not_Assigned_To_TicketInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Not_Assigned_To_TicketInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_not_assigned_to_ticket(inputs)
	if (locale === "en-XA") return en_xa2_error_not_assigned_to_ticket(inputs)
	return en_error_not_assigned_to_ticket(inputs)
});