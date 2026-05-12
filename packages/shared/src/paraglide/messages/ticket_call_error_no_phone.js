/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ client: NonNullable<unknown> }} Ticket_Call_Error_No_PhoneInputs */

const en_ticket_call_error_no_phone = /** @type {(inputs: Ticket_Call_Error_No_PhoneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No phone number on file for this ${i?.client}.`)
};

const es_ticket_call_error_no_phone = /** @type {(inputs: Ticket_Call_Error_No_PhoneInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`No hay numero de telefono registrado para este ${i?.client}.`)
};

/**
* | output |
* | --- |
* | "No phone number on file for this {client}." |
*
* @param {Ticket_Call_Error_No_PhoneInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const ticket_call_error_no_phone = /** @type {((inputs: Ticket_Call_Error_No_PhoneInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Ticket_Call_Error_No_PhoneInputs, { locale?: "en" | "es" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_ticket_call_error_no_phone(inputs)
	return es_ticket_call_error_no_phone(inputs)
});